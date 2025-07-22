"""Commit CRUD operations."""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.crud.base import CRUDBase
from app.models.commit import CommitTable, CommitCreate, Commit

class CRUDCommit(CRUDBase[CommitTable, CommitCreate, Commit]):
    def get_by_project(self, db: Session, *, project_id: int, skip: int = 0, limit: int = 100) -> List[CommitTable]:
        """Get commits by project."""
        return (
            db.query(CommitTable)
            .filter(CommitTable.project_id == project_id)
            .order_by(desc(CommitTable.commit_date))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_author(self, db: Session, *, author_id: int, skip: int = 0, limit: int = 100) -> List[CommitTable]:
        """Get commits by author."""
        return (
            db.query(CommitTable)
            .filter(CommitTable.author_id == author_id)
            .order_by(desc(CommitTable.commit_date))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_hash(self, db: Session, *, commit_hash: str) -> Optional[CommitTable]:
        """Get commit by hash."""
        return db.query(CommitTable).filter(CommitTable.commit_hash == commit_hash).first()

    def get_recent_commits(self, db: Session, *, project_id: int, days: int = 7) -> List[CommitTable]:
        """Get recent commits for a project."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        return (
            db.query(CommitTable)
            .filter(
                CommitTable.project_id == project_id,
                CommitTable.commit_date >= cutoff_date
            )
            .order_by(desc(CommitTable.commit_date))
            .all()
        )

    def get_ai_generated_commits(self, db: Session, *, project_id: Optional[int] = None) -> List[CommitTable]:
        """Get AI-generated commits."""
        query = db.query(CommitTable).filter(CommitTable.ai_generated == True)
        
        if project_id:
            query = query.filter(CommitTable.project_id == project_id)
            
        return query.order_by(desc(CommitTable.commit_date)).all()

    def create_with_author(self, db: Session, *, obj_in: CommitCreate, author_id: int) -> CommitTable:
        """Create commit with author."""
        db_obj = CommitTable(
            commit_hash=obj_in.commit_hash,
            message=obj_in.message,
            author_id=author_id,
            project_id=obj_in.project_id,
            files_changed=obj_in.files_changed,
            additions=obj_in.additions,
            deletions=obj_in.deletions,
            is_merge=obj_in.is_merge,
            ai_generated=obj_in.ai_generated,
            commit_date=obj_in.commit_date,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_commit_stats(self, db: Session, *, project_id: int, days: int = 30) -> dict:
        """Get commit statistics for a project."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        stats = (
            db.query(
                func.count(CommitTable.id).label("total_commits"),
                func.sum(CommitTable.additions).label("total_additions"),
                func.sum(CommitTable.deletions).label("total_deletions"),
                func.count(CommitTable.id).filter(CommitTable.ai_generated == True).label("ai_commits"),
                func.count(CommitTable.id).filter(CommitTable.is_merge == True).label("merge_commits"),
            )
            .filter(
                CommitTable.project_id == project_id,
                CommitTable.commit_date >= cutoff_date
            )
            .first()
        )

        # Get unique authors
        unique_authors = (
            db.query(func.count(func.distinct(CommitTable.author_id)))
            .filter(
                CommitTable.project_id == project_id,
                CommitTable.commit_date >= cutoff_date
            )
            .scalar()
        )

        return {
            "total_commits": stats.total_commits or 0,
            "total_additions": stats.total_additions or 0,
            "total_deletions": stats.total_deletions or 0,
            "ai_commits": stats.ai_commits or 0,
            "merge_commits": stats.merge_commits or 0,
            "unique_authors": unique_authors or 0,
            "period_days": days
        }

    def get_author_stats(self, db: Session, *, author_id: int, days: int = 30) -> dict:
        """Get commit statistics for an author."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        stats = (
            db.query(
                func.count(CommitTable.id).label("total_commits"),
                func.sum(CommitTable.additions).label("total_additions"),
                func.sum(CommitTable.deletions).label("total_deletions"),
                func.count(CommitTable.id).filter(CommitTable.ai_generated == True).label("ai_commits"),
            )
            .filter(
                CommitTable.author_id == author_id,
                CommitTable.commit_date >= cutoff_date
            )
            .first()
        )

        return {
            "total_commits": stats.total_commits or 0,
            "total_additions": stats.total_additions or 0,
            "total_deletions": stats.total_deletions or 0,
            "ai_commits": stats.ai_commits or 0,
            "period_days": days
        }

commit_crud = CRUDCommit(CommitTable)