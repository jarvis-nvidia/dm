"""
Configuration settings for DevMind API.
Optimized for M2 Mac with 8GB RAM and 256GB storage.
"""
import os
from typing import Optional
from datetime import datetime
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
    
    # Chunking Configuration
    MIN_CHUNK_SIZE: int = int(os.getenv("MIN_CHUNK_SIZE", "100"))
    MAX_CHUNK_SIZE: int = int(os.getenv("MAX_CHUNK_SIZE", "2000"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "200"))
    
    # Chunking Configuration
    MIN_CHUNK_SIZE: int = int(os.getenv("MIN_CHUNK_SIZE", "100"))
    MAX_CHUNK_SIZE: int = int(os.getenv("MAX_CHUNK_SIZE", "2000"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "200"))

    # Memory & Performance Settings (M2 Mac Optimized)
    MAX_WORKERS: int = int(os.getenv("MAX_WORKERS", "4"))  # Optimal for M2 8GB
    BATCH_SIZE: int = int(os.getenv("BATCH_SIZE", "16"))   # Memory-conscious batching
    CACHE_SIZE_MB: int = int(os.getenv("CACHE_SIZE_MB", "512"))  # RAM cache limit

    # Git Configuration
    DEFAULT_BRANCH: str = os.getenv("DEFAULT_BRANCH", "main")
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "5"))  # Limit for processing
    REPOS_DIR: str = os.getenv("REPOS_DIR", "./data/repos")
    # Add to app/core/config.py in the Settings class
    GITHUB_CLIENT_ID: str = os.getenv("GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET: str = os.getenv("GITHUB_CLIENT_SECRET", "")
    GITHUB_REDIRECT_URI: str = os.getenv("GITHUB_REDIRECT_URI", "http://localhost:8000/api/v1/auth/github/callback")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "devmind-development-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # Monitoring Configuration
    MONITORING_ENABLED: bool = os.getenv("MONITORING_ENABLED", "true").lower() == "true"
    MONITORING_INTERVAL: int = int(os.getenv("MONITORING_INTERVAL", "60"))  # seconds
    MONITORING_RETENTION_DAYS: int = int(os.getenv("MONITORING_RETENTION_DAYS", "7"))

    # Monitoring Thresholds
    CPU_WARNING_THRESHOLD: float = float(os.getenv("CPU_WARNING_THRESHOLD", "80.0"))
    MEMORY_WARNING_THRESHOLD: float = float(os.getenv("MEMORY_WARNING_THRESHOLD", "80.0"))
    DISK_WARNING_THRESHOLD: float = float(os.getenv("DISK_WARNING_THRESHOLD", "80.0"))
    API_LATENCY_WARNING: float = float(os.getenv("API_LATENCY_WARNING", "1.0"))  # seconds


    # Cache Configuration
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    REDIS_MAX_CONNECTIONS: int = int(os.getenv("REDIS_MAX_CONNECTIONS", "10"))
    REDIS_SOCKET_TIMEOUT: int = int(os.getenv("REDIS_SOCKET_TIMEOUT", "5"))
    REDIS_ENABLED: bool = os.getenv("REDIS_ENABLED", "true").lower() == "true"

    # Memory Cache Configuration
    MEMORY_CACHE_MAX_SIZE: int = int(os.getenv("MEMORY_CACHE_MAX_SIZE", "1024"))  # MB
    MEMORY_CACHE_TTL: int = int(os.getenv("MEMORY_CACHE_TTL", "3600"))  # seconds
    MEMORY_CACHE_CLEANUP_INTERVAL: int = int(os.getenv("MEMORY_CACHE_CLEANUP_INTERVAL", "60"))  # seconds

    # Cache Keys Configuration
    CACHE_KEY_PREFIX: str = os.getenv("CACHE_KEY_PREFIX", "devmind")
    CACHE_DEFAULT_TIMEOUT: int = int(os.getenv("CACHE_DEFAULT_TIMEOUT", "300"))  # seconds

    # Cache Monitoring
    CACHE_METRICS_ENABLED: bool = os.getenv("CACHE_METRICS_ENABLED", "true").lower() == "true"
    CACHE_HEALTH_CHECK_INTERVAL: int = int(os.getenv("CACHE_HEALTH_CHECK_INTERVAL", "30"))  # seconds

    # Cache Security
    CACHE_ENCRYPTION_KEY: Optional[str] = os.getenv("CACHE_ENCRYPTION_KEY")
    CACHE_MAX_KEY_LENGTH: int = int(os.getenv("CACHE_MAX_KEY_LENGTH", "256"))

    # Cache Eviction Policy
    CACHE_LRU_ENABLED: bool = os.getenv("CACHE_LRU_ENABLED", "true").lower() == "true"
    CACHE_MAX_ITEMS: int = int(os.getenv("CACHE_MAX_ITEMS", "10000"))

    # Current timestamp for cache operations
    @property
    def current_timestamp(self) -> str:
        """Get current timestamp in UTC."""
        return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    # Cache namespace for multi-tenancy
    @property
    def cache_namespace(self) -> str:
        """Get cache namespace."""
        return f"{self.CACHE_KEY_PREFIX}:{os.getenv('ENVIRONMENT', 'dev')}"


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
