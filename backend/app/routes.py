from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .models import User, Friendship, StatusUpdate
from .schemas import UserBase, UserCreate, FriendshipCreate, FriendRequestSchemaExtended, StatusUpdateCreate, UserSchema, FriendshipSchema, StatusUpdateSchema
from .database import get_db
from .connection_manager import manager
from typing import List
import requests
import httpx

router = APIRouter()

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not user.check_password(form_data.password):
        raise HTTPException(status_code=400, detail="Invalid Credentials")
    return user

@router.post("/users/", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter((User.email == user.email) | (User.username == user.username)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or Email already registered")
    avatar_url = f"https://avatars.dicebear.com/api/bottts/{user.username}.svg"
    new_user = User(
        username=user.username,
        email=user.email,
        status="Active",
        is_blocked=user.is_blocked,
        avatar_url=avatar_url
    )
    new_user.set_password(user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/friend-requests/", response_model=FriendshipSchema, status_code=status.HTTP_201_CREATED)
async def create_friend_request(request: FriendshipCreate, db: Session = Depends(get_db)):
    if request.requester_id == request.requestee_id:
        raise HTTPException(status_code=400, detail="Cannot send friend request to oneself")

    existing_request = db.query(Friendship).filter(
        ((Friendship.requester_id == request.requester_id) & (Friendship.requestee_id == request.requestee_id)) |
        ((Friendship.requester_id == request.requestee_id) & (Friendship.requestee_id == request.requester_id)),
        Friendship.status != "Rejected"
    ).first()

    if existing_request:
        raise HTTPException(status_code=400, detail="Friend request already exists or has been accepted")

    new_request = Friendship(
        requester_id=request.requester_id,
        requestee_id=request.requestee_id,
        status="Pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    await manager.broadcast("update")
    async with httpx.AsyncClient() as client:
        await client.post('http://socket-server:3001/data', json={"message": "Friend request updated"})

    return new_request

@router.put("/friend-requests/{request_id}/accept", response_model=FriendshipSchema)
async def accept_friend_request(request_id: int, db: Session = Depends(get_db)):
    fr_request = db.query(Friendship).filter(Friendship.id == request_id, Friendship.status == "Pending").first()
    if not fr_request:
        raise HTTPException(status_code=404, detail="Friend request not found or already accepted")

    fr_request.status = "Accepted"
    db.commit()
    db.refresh(fr_request)

    # Notify both users
    await manager.broadcast("update")

    # Optionally, clear other pending requests between these users
    other_requests = db.query(Friendship).filter(
        ((Friendship.requester_id == fr_request.requester_id) & (Friendship.requestee_id == fr_request.requestee_id) |
         (Friendship.requester_id == fr_request.requestee_id) & (Friendship.requestee_id == fr_request.requester_id)) &
        (Friendship.status == "Pending")
    ).all()
    for req in other_requests:
        req.status = "Rejected"
    db.commit()

    await manager.broadcast("update")
    async with httpx.AsyncClient() as client:
        await client.post('http://socket-server:3001/data', json={"message": "Friend request accepted"})

    return fr_request

@router.get("/friend-requests/received/{user_id}", response_model=List[UserBase])
async def get_requesters_for_received_friend_requests(user_id: int, db: Session = Depends(get_db)):
    friend_requests = db.query(Friendship).filter(
        Friendship.requestee_id == user_id,
        Friendship.status == "Pending"
    ).all()

    requesters = []
    for request in friend_requests:
        requester = db.query(User).filter(User.id == request.requester_id).first()
        if requester:
            requester_data = UserBase(
                id=request.id,
                username=requester.username,
                email=requester.email,
                avatar_url=requester.avatar_url
            )
            requesters.append(requester_data)

    return requesters

@router.post("/status/", response_model=StatusUpdateSchema, status_code=status.HTTP_201_CREATED)
def post_status(update: StatusUpdateCreate, db: Session = Depends(get_db)):
    new_status = StatusUpdate(user_id=update.user_id, content=update.content, timestamp=update.timestamp)
    db.add(new_status)
    db.commit()
    db.refresh(new_status)
    return new_status

@router.get("/status/", response_model=List[StatusUpdateSchema])
def get_statuses(db: Session = Depends(get_db)):
    statuses = db.query(StatusUpdate).all()
    return statuses

@router.get("/users/", response_model=List[UserSchema])
def read_users(current_user_id: int, db: Session = Depends(get_db)):
    users = db.query(User).filter(User.id != current_user_id, User.is_blocked == False).all()
    return users

@router.get("/friends/{user_id}", response_model=List[UserSchema])
def get_accepted_friends(user_id: int, db: Session = Depends(get_db)):
    accepted_friendships = db.query(Friendship).filter(
        ((Friendship.requester_id == user_id) | (Friendship.requestee_id == user_id)),
        Friendship.status == "Accepted"
    ).all()

    friend_ids = {f.requester_id if f.requester_id != user_id else f.requestee_id for f in accepted_friendships}
    friends = db.query(User).filter(User.id.in_(friend_ids), User.is_blocked == False).all()
    return friends

@router.put("/block-user/{user_id}", response_model=UserSchema)
async def block_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_blocked = True
    db.commit()
    db.refresh(user)

    await manager.broadcast("update")
    async with httpx.AsyncClient() as client:
        await client.post('http://socket-server:3001/data', json={"message": "User blocked"})
    return user
