"""Project schemas for API."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class ProjectStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"

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

class Project(ProjectBase):
    id: int
    owner_id: int
    created_at: str
    updated_at: str
    
    class Config:
        orm_mode = True

class ProjectWithStats(Project):
    total_tasks: int = 0
    completed_tasks: int = 0
    active_tasks: int = 0
    commits_count: int = 0
    
    class Config:
        orm_mode = True