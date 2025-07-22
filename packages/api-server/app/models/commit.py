"""Commit database model and schemas."""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

Base = declarative_base()

class CommitTable(Base):
    """SQLAlchemy Commit model."""
    __tablename__ = "commits"
    
    id = Column(Integer, primary_key=True, index=True)
    commit_hash = Column(String, unique=True, index=True, nullable=False)
    message = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    files_changed = Column(Text, nullable=True)  # JSON string of changed files
    additions = Column(Integer, default=0)
    deletions = Column(Integer, default=0)
    is_merge = Column(Boolean, default=False)
    ai_generated = Column(Boolean, default=False)
    commit_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    author = relationship("UserTable", back_populates="commits")
    project = relationship("ProjectTable", back_populates="commits")

# Pydantic models
class CommitBase(BaseModel):
    commit_hash: str = Field(..., min_length=7, max_length=40)
    message: str = Field(..., min_length=1, max_length=2000)
    files_changed: Optional[str] = None
    additions: int = 0
    deletions: int = 0
    is_merge: bool = False
    ai_generated: bool = False
    commit_date: datetime

class CommitCreate(CommitBase):
    author_id: int
    project_id: int

class CommitInDB(CommitBase):
    id: int
    author_id: int
    project_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class Commit(CommitBase):
    id: int
    author_id: int
    project_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class CommitWithRelations(Commit):
    author: Optional[dict] = None
    project: Optional[dict] = None
    
    class Config:
        orm_mode = True