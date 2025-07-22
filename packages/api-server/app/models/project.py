"""Project database model and schemas."""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

Base = declarative_base()

class ProjectStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class ProjectTable(Base):
    """SQLAlchemy Project model."""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    github_repo = Column(String, nullable=True)
    github_branch = Column(String, default="main")
    status = Column(String, default=ProjectStatus.ACTIVE, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("UserTable", back_populates="projects")
    tasks = relationship("TaskTable", back_populates="project", cascade="all, delete-orphan")
    analytics = relationship("AnalyticsTable", back_populates="project", cascade="all, delete-orphan")
    commits = relationship("CommitTable", back_populates="project")

# Pydantic models
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    github_repo: Optional[str] = Field(None, max_length=200)
    github_branch: str = Field("main", max_length=100)
    status: ProjectStatus = ProjectStatus.ACTIVE

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    github_repo: Optional[str] = Field(None, max_length=200)
    github_branch: Optional[str] = Field(None, max_length=100)
    status: Optional[ProjectStatus] = None

class ProjectInDB(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class Project(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class ProjectWithStats(Project):
    total_tasks: int = 0
    completed_tasks: int = 0
    active_tasks: int = 0
    commits_count: int = 0
    
    class Config:
        orm_mode = True

class ProjectWithOwner(Project):
    owner: Optional[dict] = None
    
    class Config:
        orm_mode = True