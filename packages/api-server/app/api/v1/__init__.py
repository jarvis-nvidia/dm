"""API v1 routes."""
from fastapi import APIRouter
from app.api.v1 import endpoint_debug, review, commit

api_router = APIRouter()
api_router.include_router(endpoint_debug.router, tags=["debug"])
api_router.include_router(review.router, tags=["review"])
api_router.include_router(commit.router, tags=["storyteller"])
