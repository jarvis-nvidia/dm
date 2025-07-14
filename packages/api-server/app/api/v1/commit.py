"""Commit storytelling API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.commit import StorytellerRequest, StorytellerResponse
from app.agents.storyteller_agent import storyteller_agent
from app.api.deps import get_api_key
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/storyteller", response_model=StorytellerResponse)
async def generate_commit_message(request: StorytellerRequest, _: bool = Depends(get_api_key)):
    """Generate commit messages or PR descriptions."""
    try:
        result = await storyteller_agent.process(request.dict())
        return result
    except Exception as e:
        logger.error(f"Error in storyteller endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing storyteller request: {str(e)}"
        )
