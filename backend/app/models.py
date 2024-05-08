from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Boolean, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

Base = declarative_base()

association_table = Table('blocklist', Base.metadata,
    Column('blocker_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('blocked_id', Integer, ForeignKey('users.id'), primary_key=True)
)

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True)
    status = Column(String, default='Active')
    password_hash = Column(String(128))
    avatar_url = Column(String, nullable=True)
    is_blocked = Column(Boolean, default=False)
    blocked_users = relationship(
        "User",
        secondary=association_table,
        primaryjoin=id==association_table.c.blocker_id,
        secondaryjoin=id==association_table.c.blocked_id,
        backref="blocked_by"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Friendship(Base):
    __tablename__ = 'friendships'
    id = Column(Integer, primary_key=True)
    requester_id = Column(Integer, ForeignKey('users.id'))
    requestee_id = Column(Integer, ForeignKey('users.id'))
    status = Column(String, default='Pending')  # Options: Pending, Accepted, Rejected

class StatusUpdate(Base):
    __tablename__ = 'status_updates'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Connect to the database and create tables
engine = create_engine('postgresql://user:password@db/friendconnection')
Base.metadata.create_all(engine)
