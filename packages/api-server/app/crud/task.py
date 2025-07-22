"""Task CRUD operations."""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.crud.base import CRUDBase
from app.models.task import TaskTable, TaskCreate, TaskUpdate, TaskStatus

class CRUDTask(CRUDBase[TaskTable, TaskCreate, TaskUpdate]):
    def get_by_project(self, db: Session, *, project_id: int, skip: int = 0, limit: int = 100) -> List[TaskTable]:
        """Get tasks by project."""
        return (
            db.query(TaskTable)
            .filter(TaskTable.project_id == project_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_user(self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100) -> List[TaskTable]:
        """Get tasks assigned to user."""
        return (
            db.query(TaskTable)
            .filter(TaskTable.assigned_to == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_status(self, db: Session, *, status: TaskStatus, skip: int = 0, limit: int = 100) -> List[TaskTable]:
        """Get tasks by status."""
        return (
            db.query(TaskTable)
            .filter(TaskTable.status == status)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_with_creator(self, db: Session, *, obj_in: TaskCreate, creator_id: int) -> TaskTable:
        """Create task with creator."""
        db_obj = TaskTable(
            title=obj_in.title,
            description=obj_in.description,
            status=obj_in.status,
            priority=obj_in.priority,
            project_id=obj_in.project_id,
            assigned_to=obj_in.assigned_to,
            created_by=creator_id,
            due_date=obj_in.due_date,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def mark_completed(self, db: Session, *, task_id: int) -> Optional[TaskTable]:
        """Mark task as completed."""
        from datetime import datetime
        task = self.get(db, id=task_id)
        if task:
            task.status = TaskStatus.DONE
            task.completed_at = datetime.utcnow()
            db.commit()
            db.refresh(task)
        return task

    def get_project_task_stats(self, db: Session, *, project_id: int) -> dict:
        """Get task statistics for a project."""
        stats = (
            db.query(
                func.count(TaskTable.id).label("total"),
                func.count(TaskTable.id).filter(TaskTable.status == "done").label("completed"),
                func.count(TaskTable.id).filter(TaskTable.status == "in_progress").label("in_progress"),
                func.count(TaskTable.id).filter(TaskTable.status == "todo").label("todo"),
                func.count(TaskTable.id).filter(TaskTable.priority == "high").label("high_priority"),
                func.count(TaskTable.id).filter(TaskTable.priority == "urgent").label("urgent"),
            )
            .filter(TaskTable.project_id == project_id)
            .first()
        )

        return {
            "total": stats.total or 0,
            "completed": stats.completed or 0,
            "in_progress": stats.in_progress or 0,
            "todo": stats.todo or 0,
            "high_priority": stats.high_priority or 0,
            "urgent": stats.urgent or 0,
        }

    def get_user_task_stats(self, db: Session, *, user_id: int) -> dict:
        """Get task statistics for a user."""
        stats = (
            db.query(
                func.count(TaskTable.id).label("total"),
                func.count(TaskTable.id).filter(TaskTable.status == "done").label("completed"),
                func.count(TaskTable.id).filter(TaskTable.status == "in_progress").label("in_progress"),
                func.count(TaskTable.id).filter(TaskTable.status == "todo").label("todo"),
            )
            .filter(TaskTable.assigned_to == user_id)
            .first()
        )

        return {
            "total": stats.total or 0,
            "completed": stats.completed or 0,
            "in_progress": stats.in_progress or 0,
            "todo": stats.todo or 0,
        }

    def search_tasks(self, db: Session, *, query: str, project_id: Optional[int] = None) -> List[TaskTable]:
        """Search tasks by title or description."""
        q = db.query(TaskTable).filter(
            TaskTable.title.ilike(f"%{query}%") | 
            TaskTable.description.ilike(f"%{query}%")
        )
        
        if project_id:
            q = q.filter(TaskTable.project_id == project_id)
            
        return q.all()

task_crud = CRUDTask(TaskTable)