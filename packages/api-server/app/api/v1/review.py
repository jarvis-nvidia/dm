"""Review API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.review import ReviewRequest, ReviewResponse
from app.agents.review_agent import review_agent
from app.api.deps import get_api_key
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/review", response_model=ReviewResponse)
async def review_code(request: ReviewRequest, _: bool = Depends(get_api_key)):
    """Review code changes and provide feedback."""
    try:
        result = await review_agent.process(request.dict())
        return result
    except Exception as e:
        logger.error(f"Error in review endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing review request: {str(e)}"
        )
