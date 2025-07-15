"""Authentication dependencies for FastAPI."""
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
from jose import JWTError
from typing import Optional, List
from datetime import datetime

from app.core.security import decode_token
from app.core.config import settings
from app.auth.models import TokenData, User, UserRole
from app.auth.oauth import oauth2_scheme

class PermissionDenied(HTTPException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    security_scopes: SecurityScopes,
    token: str = Depends(oauth2_scheme)
) -> User:
    """Validate token and return current user."""
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )

    try:
        payload = decode_token(token)
        if payload is None:
            raise credentials_exception

        token_data = TokenData(
            user_id=payload.get("sub"),
            username=payload.get("username"),
            role=payload.get("role", UserRole.USER),
            scopes=payload.get("scopes", [])
        )
    except JWTError:
        raise credentials_exception

    # Here you would typically query your database to get the user
    # For now, we'll simulate it with a mock user
    user = User(
        id=token_data.user_id,
        username=token_data.username,
        email="user@example.com",
        role=token_data.role,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # Verify required scopes
    for scope in security_scopes.scopes:
        if scope not in token_data.scopes:
            raise PermissionDenied(
                detail=f"Not enough permissions. Required scope: {scope}"
            )

    return user

async def get_current_active_user(
    current_user: User = Security(get_current_user, scopes=["profile"])
) -> User:
    """Get current active user with profile scope."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_admin_user(
    current_user: User = Security(get_current_user, scopes=["admin"])
) -> User:
    """Get current admin user."""
    if current_user.role != UserRole.ADMIN:
        raise PermissionDenied(detail="Admin privileges required")
    return current_user

def check_api_key(api_key: Optional[str] = None) -> bool:
    """Validate API key for service-to-service communication."""
    if not settings.use_auth:
        return True
    return api_key == settings.SECRET_KEY
