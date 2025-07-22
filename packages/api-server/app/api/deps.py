"""API dependencies."""
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.auth.dependencies import get_current_user, get_current_active_user
from app.models.user import User

security = HTTPBearer()

async def get_api_key(credentials: HTTPAuthorizationCredentials = Security(security)) -> bool:
    """Validate API key."""
    # In a real app, validate the token properly
    if credentials.credentials != "demo-key":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    return True

def get_db_session() -> Session:
    """Get database session dependency."""
    return get_db()

def get_current_user_dep(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Get current user with database session."""
    return current_user
