"""Authentication models and schemas."""
from pydantic import BaseModel, EmailStr, Field, validator
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

class User(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole = UserRole.USER
    is_active: bool
    created_at: str
    updated_at: str
    avatar_url: Optional[str] = None
    full_name: Optional[str] = None
    github_username: Optional[str] = None

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str = Field(..., min_length=8, max_length=100)
    full_name: Optional[str] = Field(None, max_length=100)
    role: UserRole = UserRole.USER
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8, max_length=100)
    is_active: Optional[bool] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    scopes: List[str] = []
    user: Optional[User] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    username: Optional[str] = None
    role: str = "user"
    scopes: List[str] = []
    exp: Optional[int] = None

class GitHubUser(BaseModel):
    id: int
    login: str
    email: Optional[str]
    name: Optional[str]
    avatar_url: Optional[str]
    html_url: str