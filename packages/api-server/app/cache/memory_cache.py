"""In-memory cache implementation for DevMind."""
from typing import Any, Optional, Union, Dict
from datetime import datetime, timedelta
import threading
import time
import logging
from app.core.config import settings
from app.cache.base import BaseCache

logger = logging.getLogger(__name__)

class CacheItem:
    """Cache item with expiration tracking."""
    def __init__(
        self,
        value: Any,
        expire_at: Optional[datetime] = None
    ):
        self.value = value
        self.expire_at = expire_at
        self.created_at = datetime.utcnow()
        self.last_accessed = self.created_at
        self.access_count = 0

    def is_expired(self) -> bool:
        """Check if item has expired."""
        if self.expire_at is None:
            return False
        return datetime.utcnow() > self.expire_at

    def access(self):
        """Update access statistics."""
        self.last_accessed = datetime.utcnow()
        self.access_count += 1

class MemoryCache(BaseCache):
    """Thread-safe in-memory cache implementation."""

    def __init__(
        self,
        max_size_mb: int = settings.MEMORY_CACHE_MAX_SIZE,
        default_ttl: int = settings.MEMORY_CACHE_TTL
    ):
        self._cache: Dict[str, CacheItem] = {}
        self._lock = threading.Lock()
        self._max_size = max_size_mb * 1024 * 1024  # Convert MB to bytes
        self._default_ttl = default_ttl
        self._total_size = 0
        self._hits = 0
        self._misses = 0

        # Start cleanup thread
        self._cleanup_thread = threading.Thread(
            target=self._cleanup_loop,
            daemon=True
        )
        self._cleanup_thread.start()

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        with self._lock:
            item = self._cache.get(key)
            if item is None:
                self._misses += 1
                return None

            if item.is_expired():
                self._cache.pop(key)
                self._misses += 1
                return None

            item.access()
            self._hits += 1
            return item.value

    async def set(
        self,
        key: str,
        value: Any,
        expire: Optional[Union[int, timedelta]] = None
    ) -> bool:
        """Set value in cache."""
        try:
            # Calculate expiration
            expire_at = None
            if expire is not None:
                if isinstance(expire, int):
                    expire = timedelta(seconds=expire)
                expire_at = datetime.utcnow() + expire

            # Create cache item
            item = CacheItem(value, expire_at)

            with self._lock:
                # Check if we need to make space
                if key not in self._cache:
                    item_size = self._estimate_size(value)
                    if self._total_size + item_size > self._max_size:
                        self._evict_items(item_size)

                # Store item
                self._cache[key] = item
                self._update_total_size()

            return True
        except Exception as e:
            logger.error(f"Memory cache set error for key {key}: {str(e)}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                self._update_total_size()
                return True
            return False

    async def clear(self) -> bool:
        """Clear all items from cache."""
        with self._lock:
            self._cache.clear()
            self._total_size = 0
            self._hits = 0
            self._misses = 0
            return True

    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        with self._lock:
            item = self._cache.get(key)
            if item and not item.is_expired():
                return True
            return False

    async def increment(self, key: str, amount: int = 1) -> int:
        """Increment numeric value."""
        with self._lock:
            item = self._cache.get(key)
            if item is None:
                value = amount
            else:
                try:
                    value = item.value + amount
                except (TypeError, ValueError):
                    raise ValueError("Value is not numeric")

            await self.set(key, value, expire=item.expire_at if item else None)
            return value

    async def expire_at(self, key: str, timestamp: datetime) -> bool:
        """Set expiration for key."""
        with self._lock:
            item = self._cache.get(key)
            if item:
                item.expire_at = timestamp
                return True
            return False

    async def ttl(self, key: str) -> Optional[int]:
        """Get remaining time to live for key."""
        with self._lock:
            item = self._cache.get(key)
            if item and item.expire_at:
                ttl = (item.expire_at - datetime.utcnow()).total_seconds()
                return int(ttl) if ttl > 0 else None
            return None

    async def ping(self) -> bool:
        """Check if cache is available."""
        return True

    async def stats(self) -> dict:
        """Get cache statistics."""
        with self._lock:
            return {
                'size': self._total_size,
                'items': len(self._cache),
                'max_size': self._max_size,
                'hits': self._hits,
                'misses': self._misses,
                'hit_ratio': self._hits / (self._hits + self._misses) if (self._hits + self._misses) > 0 else 0
            }

    def _estimate_size(self, value: Any) -> int:
        """Estimate memory size of value."""
        try:
            return len(str(value).encode('utf-8'))
        except:
            return 1024  # Default size estimation

    def _update_total_size(self):
        """Update total cache size."""
        self._total_size = sum(
            self._estimate_size(item.value)
            for item in self._cache.values()
        )

    def _evict_items(self, required_space: int):
        """Evict items to make space."""
        if not self._cache:
            return

        # First, remove expired items
        expired = [
            k for k, v in self._cache.items()
            if v.is_expired()
        ]
        for k in expired:
            del self._cache[k]

        # If still need space, remove least recently used items
        while self._total_size + required_space > self._max_size and self._cache:
            lru_key = min(
                self._cache.keys(),
                key=lambda k: self._cache[k].last_accessed
            )
            del self._cache[lru_key]

    def _cleanup_loop(self):
        """Background task to clean expired items."""
        while True:
            try:
                with self._lock:
                    now = datetime.utcnow()
                    expired = [
                        k for k, v in self._cache.items()
                        if v.expire_at and v.expire_at <= now
                    ]
                    for k in expired:
                        del self._cache[k]
                    self._update_total_size()
            except Exception as e:
                logger.error(f"Memory cache cleanup error: {str(e)}")

            time.sleep(60)  # Run cleanup every minute
