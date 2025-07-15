"""Authentication module for DevMind API."""
from fastapi import APIRouter
from app.auth.router import router as auth_router

# Create authentication router
router = APIRouter()

# Include authentication routes
router.include_router(auth_router)

# Export authentication components
__all__ = ["router"]
