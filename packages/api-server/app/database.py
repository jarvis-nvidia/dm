"""Database configuration and session management."""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from typing import Generator
from app.core.config import settings

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/devmind.db")

# SQLAlchemy configuration
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.DEBUG
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        echo=settings.DEBUG
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db() -> None:
    """Initialize database tables."""
    from app.models.user import UserTable
    from app.models.project import ProjectTable
    from app.models.task import TaskTable
    from app.models.analytics import AnalyticsTable
    from app.models.commit import CommitTable
    
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def drop_db() -> None:
    """Drop all database tables."""
    Base.metadata.drop_all(bind=engine)
    print("Database tables dropped successfully!")

# Create data directory if it doesn't exist
os.makedirs("./data", exist_ok=True)