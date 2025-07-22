"""Analytics schemas for API."""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class AnalyticsBase(BaseModel):
    metric_name: str = Field(..., min_length=1, max_length=100)
    metric_value: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

class AnalyticsCreate(AnalyticsBase):
    project_id: int

class Analytics(AnalyticsBase):
    id: int
    project_id: int
    recorded_at: str
    
    class Config:
        orm_mode = True

class ProjectAnalytics(BaseModel):
    """Aggregated analytics for a project."""
    project_id: int
    total_commits: int = 0
    total_tasks: int = 0
    completed_tasks: int = 0
    bug_count: int = 0
    code_quality_score: float = 0.0
    productivity_score: float = 0.0
    last_activity: Optional[str] = None
    
    class Config:
        orm_mode = True