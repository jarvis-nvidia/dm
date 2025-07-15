"""Authentication routes for DevMind API."""
from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.auth.models import User, UserCreate, Token, UserUpdate
from app.auth.dependencies import get_current_active_user, get_current_admin_user
from app.auth.oauth import (
    github_oauth2,
    get_github_user_data,
    create_github_oauth_url
)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """Login user and return access token."""
    # Here you would typically verify against your database
    # For demo, we'll use a mock user
    if form_data.username != "demo" or not verify_password(form_data.password, get_password_hash("demo")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # Create access token
    access_token = create_access_token(
        data={
            "sub": "1",  # user id
            "username": form_data.username,
            "scopes": form_data.scopes
        },
        expires_delta=access_token_expires
    )

    # Create mock user for demo
    user = User(
        id=1,
        username=form_data.username,
        email="demo@example.com",
        role="user",
        is_active=True,
        created_at="2025-01-01T00:00:00",
        updated_at="2025-01-01T00:00:00"
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user
    )

@router.post("/github/login")
async def github_login():
    """Initiate GitHub OAuth login."""
    return JSONResponse({
        "authorization_url": create_github_oauth_url()
    })

@router.get("/github/callback")
async def github_callback(code: str):
    """Handle GitHub OAuth callback."""
    try:
        # Exchange code for access token
        github_token = await github_oauth2.get_access_token(code)

        # Get GitHub user data
        github_user = await get_github_user_data(github_token)

        # Here you would typically:
        # 1. Create or update user in your database
        # 2. Create session/JWT token
        # For demo, we'll create a token directly

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": str(github_user.id),
                "username": github_user.login,
                "scopes": ["profile"]
            },
            expires_delta=access_token_expires
        )

        user = User(
            id=github_user.id,
            username=github_user.login,
            email=github_user.email or f"{github_user.login}@github.com",
            full_name=github_user.name,
            is_active=True,
            created_at="2025-01-01T00:00:00",
            updated_at="2025-01-01T00:00:00",
            github_username=github_user.login
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to complete GitHub authentication: {str(e)}"
        )

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user profile."""
    return current_user

@router.put("/me", response_model=User)
async def update_user_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update current user profile."""
    # Here you would typically update the user in your database
    # For demo, we'll return the current user with updated fields
    updated_user = current_user.copy(update=user_update.dict(exclude_unset=True))
    return updated_user

@router.post("/users", response_model=User)
async def create_user(
    user_create: UserCreate,
    current_user: User = Depends(get_current_admin_user)
):
    """Create new user (admin only)."""
    # Here you would typically create the user in your database
    # For demo, we'll return a mock user
    return User(
        id=2,
        username=user_create.username,
        email=user_create.email,
        full_name=user_create.full_name,
        role=user_create.role,
        is_active=True,
        created_at="2025-01-01T00:00:00",
        updated_at="2025-01-01T00:00:00"
    )
