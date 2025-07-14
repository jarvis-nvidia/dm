"""Schemas for debug agent API."""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class DebugRequest(BaseModel):
    problem_description: str = Field(..., description="Description of the problem or issue")
    code_snippet: Optional[str] = Field(None, description="Code snippet that has the issue")
    error_message: Optional[str] = Field(None, description="Error message produced by the code")
    repository: Optional[str] = Field(None, description="Repository name")
    file_path: Optional[str] = Field(None, description="Path to the file with the issue")
    language: Optional[str] = Field(None, description="Programming language of the code")

class DebugResponse(BaseModel):
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="Status message")
    data: Optional[Dict[str, Any]] = Field(None, description="Response data containing the debug analysis")
