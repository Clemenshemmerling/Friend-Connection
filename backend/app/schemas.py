from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    username: str = Field(..., description="The unique username for the user")
    email: Optional[EmailStr] = Field(None, description="The email of the user")
    password: str = Field(..., description="The password for the user account")
    is_blocked: Optional[bool] = Field(default=False, description="Flag to indicate if the user is blocked")
    avatar_url: Optional[str] = Field(None, description="URL of the user's avatar")

class FriendshipCreate(BaseModel):
    requester_id: int = Field(..., description="The ID of the user sending the friend request")
    requestee_id: int = Field(..., description="The ID of the user receiving the friend request")

class StatusUpdateCreate(BaseModel):
    user_id: int = Field(..., description="The ID of the user updating their status")
    content: str = Field(..., description="The content of the status update")
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow, description="The timestamp of the status update")

class UserSchema(BaseModel):
    id: int
    username: str
    email: Optional[EmailStr]
    status: str
    is_blocked: bool
    avatar_url: Optional[str]

class FriendshipSchema(BaseModel):
    id: int
    requester_id: int
    requestee_id: int
    status: str

class StatusUpdateSchema(BaseModel):
    id: int
    user_id: int
    content: str
    timestamp: datetime

class FriendRequestSchema(BaseModel):
    id: int
    requester_id: int
    requestee_id: int
    status: str

class UserBase(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: str

class FriendRequestSchemaExtended(FriendRequestSchema):
    requester: UserBase
    requestee: UserBase
