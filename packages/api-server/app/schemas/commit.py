"""Schemas for storyteller agent API."""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class StorytellerRequest(BaseModel):
    code_diff: str = Field(..., description="Code diff to generate message for")
    file_paths: Optional[List[str]] = Field(None, description="Paths to the files being changed")
    repository: Optional[str] = Field(None, description="Repository name")
    message_type: Optional[str] = Field("commit", description="Type of message to generate (commit, pr_title, pr_description)")

class StorytellerResponse(BaseModel):
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="Status message")
    data: Optional[Dict[str, Any]] = Field(None, description="Response data containing the generated message")
