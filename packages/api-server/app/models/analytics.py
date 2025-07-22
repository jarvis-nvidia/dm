"""Analytics database model and schemas."""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

Base = declarative_base()

class AnalyticsTable(Base):
    """SQLAlchemy Analytics model."""
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    metric_name = Column(String, nullable=False, index=True)
    metric_value = Column(JSON, nullable=False)
    metadata = Column(JSON, nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("ProjectTable", back_populates="analytics")

# Pydantic models
class AnalyticsBase(BaseModel):
    metric_name: str = Field(..., min_length=1, max_length=100)
    metric_value: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

class AnalyticsCreate(AnalyticsBase):
    project_id: int

class AnalyticsInDB(AnalyticsBase):
    id: int
    project_id: int
    recorded_at: datetime
    
    class Config:
        orm_mode = True

class Analytics(AnalyticsBase):
    id: int
    project_id: int
    recorded_at: datetime
    
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
    last_activity: Optional[datetime] = None
    
    class Config:
        orm_mode = True