"""Project management API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.project import ProjectCreate, ProjectUpdate, Project, ProjectWithStats
from app.api.deps import get_api_key
from app.models.project import ProjectStatus
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Mock data for demonstration
mock_projects = [
    {
        "id": 1,
        "name": "DevMind Core",
        "description": "Main DevMind application",
        "github_repo": "https://github.com/user/devmind-core",
        "github_branch": "main",
        "status": "active",
        "owner_id": 1,
        "created_at": "2025-01-15T10:00:00Z",
        "updated_at": "2025-01-15T10:00:00Z",
        "total_tasks": 15,
        "completed_tasks": 8,
        "active_tasks": 7,
        "commits_count": 42
    },
    {
        "id": 2,
        "name": "DevMind VS Code Extension",
        "description": "VS Code extension for DevMind",
        "github_repo": "https://github.com/user/devmind-vscode",
        "github_branch": "main", 
        "status": "active",
        "owner_id": 1,
        "created_at": "2025-01-10T14:30:00Z",
        "updated_at": "2025-01-15T16:45:00Z",
        "total_tasks": 8,
        "completed_tasks": 3,
        "active_tasks": 5,
        "commits_count": 18
    }
]

@router.get("/", response_model=List[ProjectWithStats])
async def get_projects(_: bool = Depends(get_api_key)):
    """Get all projects for the current user."""
    try:
        return mock_projects
    except Exception as e:
        logger.error(f"Error getting projects: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch projects"
        )

@router.post("/", response_model=Project)
async def create_project(project: ProjectCreate, _: bool = Depends(get_api_key)):
    """Create a new project."""
    try:
        # In a real app, you'd save to database and return the created project
        new_project = {
            "id": len(mock_projects) + 1,
            "name": project.name,
            "description": project.description,
            "github_repo": project.github_repo,
            "github_branch": project.github_branch,
            "status": project.status,
            "owner_id": 1,  # Would come from authenticated user
            "created_at": "2025-01-15T12:00:00Z",
            "updated_at": "2025-01-15T12:00:00Z"
        }
        mock_projects.append({**new_project, "total_tasks": 0, "completed_tasks": 0, "active_tasks": 0, "commits_count": 0})
        return new_project
    except Exception as e:
        logger.error(f"Error creating project: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create project"
        )

@router.get("/{project_id}", response_model=ProjectWithStats)
async def get_project(project_id: int, _: bool = Depends(get_api_key)):
    """Get a specific project by ID."""
    try:
        project = next((p for p in mock_projects if p["id"] == project_id), None)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        return project
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting project: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch project"
        )

@router.put("/{project_id}", response_model=Project)
async def update_project(project_id: int, project_update: ProjectUpdate, _: bool = Depends(get_api_key)):
    """Update a project."""
    try:
        project_idx = next((i for i, p in enumerate(mock_projects) if p["id"] == project_id), None)
        if project_idx is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Update project with provided fields
        project = mock_projects[project_idx]
        update_data = project_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(project, field):
                project[field] = value
        
        project["updated_at"] = "2025-01-15T12:30:00Z"
        
        return {k: v for k, v in project.items() if k not in ["total_tasks", "completed_tasks", "active_tasks", "commits_count"]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating project: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update project"
        )

@router.delete("/{project_id}")
async def delete_project(project_id: int, _: bool = Depends(get_api_key)):
    """Delete a project."""
    try:
        project_idx = next((i for i, p in enumerate(mock_projects) if p["id"] == project_id), None)
        if project_idx is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        deleted_project = mock_projects.pop(project_idx)
        return {"message": f"Project '{deleted_project['name']}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting project: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete project"
        )

@router.post("/{project_id}/analyze")
async def analyze_project(project_id: int, _: bool = Depends(get_api_key)):
    """Trigger project analysis with DevMind AI."""
    try:
        project = next((p for p in mock_projects if p["id"] == project_id), None)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Mock analysis result
        analysis_result = {
            "project_id": project_id,
            "analysis_id": f"analysis_{project_id}_{int(__import__('time').time())}",
            "status": "completed",
            "findings": {
                "code_quality_score": 8.5,
                "technical_debt": "Low",
                "security_issues": 0,
                "performance_recommendations": 3,
                "best_practices_score": 9.2
            },
            "recommendations": [
                "Consider adding more unit tests for the authentication module",
                "Optimize database queries in the analytics service",
                "Update dependencies to latest versions"
            ],
            "analyzed_at": "2025-01-15T12:45:00Z"
        }
        
        return analysis_result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing project: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze project"
        )