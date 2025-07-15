"""Monitoring endpoints for DevMind API."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from app.auth.dependencies import get_current_admin_user
from app.monitoring.service import monitoring_service
from app.monitoring.models import MonitoringResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

@router.get("/metrics", response_model=MonitoringResponse)
async def get_metrics(current_user = Depends(get_current_admin_user)):
    """Get comprehensive monitoring metrics."""
    try:
        return await monitoring_service.get_monitoring_data()
    except Exception as e:
        logger.error(f"Error getting monitoring metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve monitoring data")

@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    try:
        services = await monitoring_service.get_service_health()
        unhealthy_services = [s for s in services if s.status == "unhealthy"]

        response = {
            "status": "unhealthy" if unhealthy_services else "healthy",
            "services": {s.service: s.status for s in services}
        }

        status_code = 503 if unhealthy_services else 200
        return JSONResponse(content=response, status_code=status_code)
    except Exception as e:
        logger.error(f"Error in health check: {str(e)}")
        return JSONResponse(
            content={"status": "unhealthy", "error": str(e)},
            status_code=503
        )

@router.post("/metrics/reset", status_code=204)
async def reset_metrics(current_user = Depends(get_current_admin_user)):
    """Reset monitoring metrics."""
    try:
        monitoring_service.api_metrics.clear()
        return JSONResponse(content={"message": "Metrics reset successfully"})
    except Exception as e:
        logger.error(f"Error resetting metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to reset metrics")
