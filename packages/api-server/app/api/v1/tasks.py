"""Task management API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.schemas.task import TaskCreate, TaskUpdate, Task, TaskWithRelations
from app.api.deps import get_api_key
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Mock data for demonstration
mock_tasks = [
    {
        "id": 1,
        "title": "Implement user authentication",
        "description": "Add JWT-based authentication system",
        "status": "done",
        "priority": "high",
        "project_id": 1,
        "assigned_to": 1,
        "created_by": 1,
        "due_date": "2025-01-20T23:59:59Z",
        "completed_at": "2025-01-15T14:30:00Z",
        "created_at": "2025-01-10T09:00:00Z",
        "updated_at": "2025-01-15T14:30:00Z"
    },
    {
        "id": 2,
        "title": "Create project dashboard",
        "description": "Design and implement project overview dashboard with analytics",
        "status": "in_progress",
        "priority": "medium",
        "project_id": 1,
        "assigned_to": 1,
        "created_by": 1,
        "due_date": "2025-01-25T23:59:59Z",
        "completed_at": None,
        "created_at": "2025-01-12T10:15:00Z",
        "updated_at": "2025-01-15T11:20:00Z"
    },
    {
        "id": 3,
        "title": "Setup VS Code extension commands",
        "description": "Implement core commands for the VS Code extension",
        "status": "todo",
        "priority": "high",
        "project_id": 2,
        "assigned_to": None,
        "created_by": 1,
        "due_date": "2025-01-22T23:59:59Z",
        "completed_at": None,
        "created_at": "2025-01-13T16:45:00Z",
        "updated_at": "2025-01-13T16:45:00Z"
    }
]

@router.get("/", response_model=List[Task])
async def get_tasks(
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    assigned_to: Optional[int] = None,
    _: bool = Depends(get_api_key)
):
    """Get tasks with optional filters."""
    try:
        tasks = mock_tasks.copy()
        
        # Apply filters
        if project_id:
            tasks = [t for t in tasks if t["project_id"] == project_id]
        if status:
            tasks = [t for t in tasks if t["status"] == status]
        if assigned_to:
            tasks = [t for t in tasks if t["assigned_to"] == assigned_to]
            
        return tasks
    except Exception as e:
        logger.error(f"Error getting tasks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch tasks"
        )

@router.post("/", response_model=Task)
async def create_task(task: TaskCreate, _: bool = Depends(get_api_key)):
    """Create a new task."""
    try:
        new_task = {
            "id": len(mock_tasks) + 1,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "project_id": task.project_id,
            "assigned_to": task.assigned_to,
            "created_by": 1,  # Would come from authenticated user
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "completed_at": None,
            "created_at": "2025-01-15T12:00:00Z",
            "updated_at": "2025-01-15T12:00:00Z"
        }
        mock_tasks.append(new_task)
        return new_task
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create task"
        )

@router.get("/{task_id}", response_model=Task)
async def get_task(task_id: int, _: bool = Depends(get_api_key)):
    """Get a specific task by ID."""
    try:
        task = next((t for t in mock_tasks if t["id"] == task_id), None)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        return task
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch task"
        )

@router.put("/{task_id}", response_model=Task)
async def update_task(task_id: int, task_update: TaskUpdate, _: bool = Depends(get_api_key)):
    """Update a task."""
    try:
        task_idx = next((i for i, t in enumerate(mock_tasks) if t["id"] == task_id), None)
        if task_idx is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        task = mock_tasks[task_idx]
        update_data = task_update.dict(exclude_unset=True)
        
        # Handle status change to completed
        if update_data.get("status") == "done" and task["status"] != "done":
            update_data["completed_at"] = "2025-01-15T12:30:00Z"
        elif update_data.get("status") != "done":
            update_data["completed_at"] = None
            
        # Update task fields
        for field, value in update_data.items():
            if field in task:
                if field == "due_date" and value:
                    task[field] = value.isoformat()
                else:
                    task[field] = value
        
        task["updated_at"] = "2025-01-15T12:30:00Z"
        return task
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update task"
        )

@router.delete("/{task_id}")
async def delete_task(task_id: int, _: bool = Depends(get_api_key)):
    """Delete a task."""
    try:
        task_idx = next((i for i, t in enumerate(mock_tasks) if t["id"] == task_id), None)
        if task_idx is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        deleted_task = mock_tasks.pop(task_idx)
        return {"message": f"Task '{deleted_task['title']}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete task"
        )

@router.post("/{task_id}/ai-suggestions")
async def get_task_ai_suggestions(task_id: int, _: bool = Depends(get_api_key)):
    """Get AI-powered suggestions for a task."""
    try:
        task = next((t for t in mock_tasks if t["id"] == task_id), None)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        # Mock AI suggestions
        suggestions = {
            "task_id": task_id,
            "suggestions": [
                {
                    "type": "implementation",
                    "title": "Consider using React Context for state management",
                    "description": "For this dashboard task, React Context could simplify state sharing between components",
                    "priority": "medium"
                },
                {
                    "type": "testing",
                    "title": "Add unit tests for dashboard components",
                    "description": "Ensure robust testing coverage for the dashboard functionality",
                    "priority": "high"
                },
                {
                    "type": "optimization",
                    "title": "Implement lazy loading for dashboard widgets",
                    "description": "Improve initial load performance by lazy loading dashboard components",
                    "priority": "low"
                }
            ],
            "generated_at": "2025-01-15T12:45:00Z"
        }
        
        return suggestions
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting AI suggestions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get AI suggestions"
        )