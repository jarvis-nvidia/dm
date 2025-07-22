"""API v1 routes."""
from fastapi import APIRouter
from app.api.v1 import endpoint_debug, review, commit, projects, tasks, analytics

api_router = APIRouter()
api_router.include_router(endpoint_debug.router, prefix="/debug", tags=["debug"])
api_router.include_router(review.router, prefix="/review", tags=["review"])
api_router.include_router(commit.router, prefix="/commit", tags=["storyteller"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
