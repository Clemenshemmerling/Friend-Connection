from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .main import app  # Import your FastAPI app
from .database import Base, get_db  # Import your Base and get_db dependency
from .models import User, Friendship

# Setup test database and override get_db dependency
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)  # Create tables based on your models

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_create_user():
    response = client.post("/users/", json={"username": "testuser", "email": "test@example.com", "password": "testpass"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_create_friend_request():
    # Assuming you have two users already added (id 1 and id 2)
    response = client.post("/friend-requests/", json={"requester_id": 1, "requestee_id": 2})
    assert response.status_code == 200
    assert response.json()["status"] == "Pending"

def test_accept_friend_request():
    # Assuming you have a pending friend request with id 1
    response = client.put("/friend-requests/1/accept")
    assert response.status_code == 200
    assert response.json()["status"] == "Accepted"

def test_duplicate_friend_request():
    # Test to ensure duplicate requests are handled
    response = client.post("/friend-requests/", json={"requester_id": 1, "requestee_id": 2})
    assert response.status_code == 400  # Assuming your API returns 400 for duplicates

def test_nonexistent_friend_request_acceptance():
    # Test accepting a nonexistent friend request
    response = client.put("/friend-requests/9999/accept")
    assert response.status_code == 404
