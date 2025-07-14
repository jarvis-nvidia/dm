"""Schemas for review agent API."""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class ReviewRequest(BaseModel):
    code_diff: Optional[str] = Field(None, description="Code diff to review")
    file_path: Optional[str] = Field(None, description="Path to the file being reviewed")
    repository: Optional[str] = Field(None, description="Repository name")
    pr_title: Optional[str] = Field(None, description="Title of the PR")
    pr_description: Optional[str] = Field(None, description="Description of the PR")
    language: Optional[str] = Field(None, description="Programming language of the code")

class ReviewResponse(BaseModel):
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="Status message")
    data: Optional[Dict[str, Any]] = Field(None, description="Response data containing the review")
