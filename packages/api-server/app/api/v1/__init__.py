"""API v1 routes."""
from fastapi import APIRouter
from app.api.v1 import endpoint_debug, endpoint_review, endpoint_commit

api_router = APIRouter()
api_router.include_router(endpoint_debug.router, tags=["debug"])
api_router.include_router(endpoint_review.router, tags=["review"])
api_router.include_router(endpoint_commit.router, tags=["storyteller"])
