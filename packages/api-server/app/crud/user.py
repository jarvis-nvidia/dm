"""User CRUD operations."""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.user import UserTable, UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password

class CRUDUser(CRUDBase[UserTable, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[UserTable]:
        """Get user by email."""
        return db.query(UserTable).filter(UserTable.email == email).first()

    def get_by_username(self, db: Session, *, username: str) -> Optional[UserTable]:
        """Get user by username."""
        return db.query(UserTable).filter(UserTable.username == username).first()

    def get_by_github_id(self, db: Session, *, github_id: str) -> Optional[UserTable]:
        """Get user by GitHub ID."""
        return db.query(UserTable).filter(UserTable.github_id == github_id).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> UserTable:
        """Create new user with hashed password."""
        db_obj = UserTable(
            email=obj_in.email,
            username=obj_in.username,
            hashed_password=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
            avatar_url=obj_in.avatar_url,
            role=obj_in.role,
            is_active=obj_in.is_active,
            github_username=obj_in.github_username,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def create_github_user(
        self, 
        db: Session, 
        *,
        email: str,
        username: str,
        full_name: Optional[str] = None,
        avatar_url: Optional[str] = None,
        github_id: str,
        github_username: str
    ) -> UserTable:
        """Create user from GitHub OAuth data."""
        db_obj = UserTable(
            email=email,
            username=username,
            hashed_password=get_password_hash(""),  # No password for OAuth users
            full_name=full_name,
            avatar_url=avatar_url,
            github_id=github_id,
            github_username=github_username,
            is_active=True,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[UserTable]:
        """Authenticate user with email and password."""
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def is_active(self, user: UserTable) -> bool:
        """Check if user is active."""
        return user.is_active

    def is_admin(self, user: UserTable) -> bool:
        """Check if user is admin."""
        return user.role == "admin"

    def get_active_users(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[UserTable]:
        """Get active users."""
        return db.query(UserTable).filter(UserTable.is_active == True).offset(skip).limit(limit).all()

    def update_last_login(self, db: Session, *, user_id: int) -> Optional[UserTable]:
        """Update user's last login timestamp."""
        from datetime import datetime
        user = self.get(db, id=user_id)
        if user:
            user.last_login = datetime.utcnow()
            db.commit()
            db.refresh(user)
        return user

user_crud = CRUDUser(UserTable)