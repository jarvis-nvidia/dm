"""Base caching interface for DevMind."""
from abc import ABC, abstractmethod
from typing import Any, Optional, Union
from datetime import datetime, timedelta

class BaseCache(ABC):
    """Abstract base class for cache implementations."""

    @abstractmethod
    async def get(self, key: str) -> Optional[Any]:
        """Retrieve item from cache."""
        pass

    @abstractmethod
    async def set(
        self,
        key: str,
        value: Any,
        expire: Optional[Union[int, timedelta]] = None
    ) -> bool:
        """Store item in cache with optional expiration."""
        pass

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """Remove item from cache."""
        pass

    @abstractmethod
    async def clear(self) -> bool:
        """Clear all items from cache."""
        pass

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        pass

    @abstractmethod
    async def increment(self, key: str, amount: int = 1) -> int:
        """Increment numeric value by given amount."""
        pass

    @abstractmethod
    async def expire_at(self, key: str, timestamp: datetime) -> bool:
        """Set expiration for key at specific timestamp."""
        pass

    @abstractmethod
    async def ttl(self, key: str) -> Optional[int]:
        """Get remaining time to live for key in seconds."""
        pass

    @abstractmethod
    async def ping(self) -> bool:
        """Check if cache is available."""
        pass

    @abstractmethod
    async def stats(self) -> dict:
        """Get cache statistics."""
        pass
