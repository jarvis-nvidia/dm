"""API dependencies for FastAPI."""
from fastapi import Header, HTTPException, Depends
from typing import Optional
from app.core.config import settings

async def get_api_key(x_api_key: Optional[str] = Header(None)):
    """Validate API key for protected endpoints."""
    # In development mode without DEBUG, allow without API key
    if settings.ENVIRONMENT == "development" and not settings.DEBUG:
        return True

    # In all other cases, validate API key
    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail="API key is missing"
        )

    if x_api_key != settings.SECRET_KEY:
        raise HTTPException(
            status_code=403,
            detail="Invalid API key"
        )

    return True
