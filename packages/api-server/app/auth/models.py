"""Authentication models and schemas."""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

class TokenData(BaseModel):
    user_id: Optional[str] = None
    username: Optional[str] = None
    role: UserRole = UserRole.USER
    scopes: List[str] = []

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    scopes: List[str] = []

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    username: Optional[str] = None
    role: str = "user"
    scopes: List[str] = []
    exp: Optional[int] = None

class User(BaseModel):
    id: str
    username: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    avatar_url: Optional[str] = None
    full_name: Optional[str] = None

class GitHubUser(BaseModel):
    id: int
    login: str
    email: Optional[str]
    name: Optional[str]
    avatar_url: Optional[str]
    html_url: str