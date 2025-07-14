"""Debug API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.debug import DebugRequest, DebugResponse
from app.agents.debug_agent import debug_agent
from app.api.deps import get_api_key
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/debug", response_model=DebugResponse)
async def debug_code(request: DebugRequest, _: bool = Depends(get_api_key)):
    """Debug code issues and provide analysis."""
    try:
        result = await debug_agent.process(request.dict())
        return result
    except Exception as e:
        logger.error(f"Error in debug endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing debug request: {str(e)}"
        )
