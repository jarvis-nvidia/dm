"""
Configuration settings for DevMind API.
Optimized for M2 Mac with 8GB RAM and 256GB storage.
"""
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # Project Info
    PROJECT_NAME: str = "DevMind API"
    PROJECT_VERSION: str = "0.1.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    # API Configuration
    API_V1_STR: str = "/api/v1"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # LLM Service Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")
    MAX_TOKENS: int = int(os.getenv("MAX_TOKENS", "4096"))
    TEMPERATURE: float = float(os.getenv("TEMPERATURE", "0.3"))

    # Vector Store Configuration
    VECTOR_DB_URL: str = os.getenv("VECTOR_DB_URL", "sqlite:///./data/devmind_vectors.db")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

    # Memory & Performance Settings (M2 Mac Optimized)
    MAX_WORKERS: int = int(os.getenv("MAX_WORKERS", "4"))  # Optimal for M2 8GB
    BATCH_SIZE: int = int(os.getenv("BATCH_SIZE", "16"))   # Memory-conscious batching
    CACHE_SIZE_MB: int = int(os.getenv("CACHE_SIZE_MB", "512"))  # RAM cache limit

    # Git Configuration
    DEFAULT_BRANCH: str = os.getenv("DEFAULT_BRANCH", "main")
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "5"))  # Limit for processing
    REPOS_DIR: str = os.getenv("REPOS_DIR", "./data/repos")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "devmind-development-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    @property
    def database_url(self) -> str:
        return self.VECTOR_DB_URL

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def use_auth(self) -> bool:
        return self.is_production or os.getenv("USE_AUTH", "false").lower() == "true"

# Create settings instance
settings = Settings()
