"""Project CRUD operations."""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.crud.base import CRUDBase
from app.models.project import ProjectTable, ProjectCreate, ProjectUpdate
from app.models.task import TaskTable
from app.models.commit import CommitTable

class CRUDProject(CRUDBase[ProjectTable, ProjectCreate, ProjectUpdate]):
    def get_by_owner(self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100) -> List[ProjectTable]:
        """Get projects by owner."""
        return (
            db.query(ProjectTable)
            .filter(ProjectTable.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_name(self, db: Session, *, name: str, owner_id: int) -> Optional[ProjectTable]:
        """Get project by name and owner."""
        return (
            db.query(ProjectTable)
            .filter(ProjectTable.name == name, ProjectTable.owner_id == owner_id)
            .first()
        )

    def get_by_github_repo(self, db: Session, *, github_repo: str) -> Optional[ProjectTable]:
        """Get project by GitHub repository."""
        return db.query(ProjectTable).filter(ProjectTable.github_repo == github_repo).first()

    def create_with_owner(self, db: Session, *, obj_in: ProjectCreate, owner_id: int) -> ProjectTable:
        """Create project with owner."""
        db_obj = ProjectTable(
            name=obj_in.name,
            description=obj_in.description,
            github_repo=obj_in.github_repo,
            github_branch=obj_in.github_branch,
            status=obj_in.status,
            owner_id=owner_id,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_active_projects(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[ProjectTable]:
        """Get active projects."""
        return (
            db.query(ProjectTable)
            .filter(ProjectTable.status == "active")
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_project_with_stats(self, db: Session, *, project_id: int) -> Optional[dict]:
        """Get project with task and commit statistics."""
        project = self.get(db, id=project_id)
        if not project:
            return None

        # Get task statistics
        task_stats = (
            db.query(
                func.count(TaskTable.id).label("total_tasks"),
                func.count(TaskTable.id).filter(TaskTable.status == "done").label("completed_tasks"),
                func.count(TaskTable.id).filter(TaskTable.status.in_(["todo", "in_progress", "testing"])).label("active_tasks"),
            )
            .filter(TaskTable.project_id == project_id)
            .first()
        )

        # Get commit statistics
        commit_stats = (
            db.query(func.count(CommitTable.id).label("commits_count"))
            .filter(CommitTable.project_id == project_id)
            .first()
        )

        return {
            "project": project,
            "total_tasks": task_stats.total_tasks or 0,
            "completed_tasks": task_stats.completed_tasks or 0,
            "active_tasks": task_stats.active_tasks or 0,
            "commits_count": commit_stats.commits_count or 0,
        }

    def search_projects(self, db: Session, *, query: str, owner_id: Optional[int] = None) -> List[ProjectTable]:
        """Search projects by name or description."""
        q = db.query(ProjectTable).filter(
            ProjectTable.name.ilike(f"%{query}%") | 
            ProjectTable.description.ilike(f"%{query}%")
        )
        
        if owner_id:
            q = q.filter(ProjectTable.owner_id == owner_id)
            
        return q.all()

project_crud = CRUDProject(ProjectTable)