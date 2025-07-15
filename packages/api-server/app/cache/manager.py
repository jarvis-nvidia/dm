"""Cache manager for coordinating between Redis and memory caches."""
from typing import Any, Optional, Union
from datetime import datetime, timedelta
import logging
from app.core.config import settings
from app.cache.redis_cache import RedisCache
from app.cache.memory_cache import MemoryCache

logger = logging.getLogger(__name__)

class CacheManager:
    """Manages multiple cache backends with fallback support."""

    def __init__(self):
        """Initialize cache manager with Redis and memory cache."""
        self.redis = RedisCache() if settings.REDIS_ENABLED else None
        self.memory = MemoryCache()
        self._initialized = False

    async def initialize(self):
        """Initialize cache connections."""
        if self._initialized:
            return

        if self.redis:
            try:
                await self.redis.initialize()
                logger.info("Redis cache initialized")
            except Exception as e:
                logger.warning(f"Redis initialization failed: {str(e)}")
                self.redis = None

        self._initialized = True
        logger.info("Cache manager initialized")

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache with fallback."""
        # Try Redis first
        if self.redis:
            try:
                value = await self.redis.get(key)
                if value is not None:
                    # Sync to memory cache
                    await self.memory.set(key, value)
                    return value
            except Exception as e:
                logger.error(f"Redis get error: {str(e)}")

        # Fallback to memory cache
        return await self.memory.get(key)

    async def set(
        self,
        key: str,
        value: Any,
        expire: Optional[Union[int, timedelta]] = None
    ) -> bool:
        """Set value in all available caches."""
        success = True

        # Set in Redis
        if self.redis:
            try:
                redis_success = await self.redis.set(key, value, expire)
                success = success and redis_success
            except Exception as e:
                logger.error(f"Redis set error: {str(e)}")
                success = False

        # Set in memory cache
        memory_success = await self.memory.set(key, value, expire)
        success = success and memory_success

        return success

    async def delete(self, key: str) -> bool:
        """Delete key from all caches."""
        success = True

        if self.redis:
            try:
                redis_success = await self.redis.delete(key)
                success = success and redis_success
            except Exception as e:
                logger.error(f"Redis delete error: {str(e)}")
                success = False

        memory_success = await self.memory.delete(key)
        success = success and memory_success

        return success

    async def clear(self) -> bool:
        """Clear all caches."""
        success = True

        if self.redis:
            try:
                redis_success = await self.redis.clear()
                success = success and redis_success
            except Exception as e:
                logger.error(f"Redis clear error: {str(e)}")
                success = False

        memory_success = await self.memory.clear()
        success = success and memory_success

        return success

    async def exists(self, key: str) -> bool:
        """Check if key exists in any cache."""
        if self.redis:
            try:
                exists = await self.redis.exists(key)
                if exists:
                    return True
            except Exception as e:
                logger.error(f"Redis exists error: {str(e)}")

        return await self.memory.exists(key)

    async def stats(self) -> dict:
        """Get statistics from all caches."""
        stats = {
            'memory': await self.memory.stats()
        }

        if self.redis:
            try:
                stats['redis'] = await self.redis.stats()
            except Exception as e:
                logger.error(f"Redis stats error: {str(e)}")
                stats['redis'] = {'error': str(e)}

        return stats

    async def close(self):
        """Close all cache connections."""
        if self.redis:
            try:
                await self.redis.close()
            except Exception as e:
                logger.error(f"Redis close error: {str(e)}")

# Initialize global cache manager
cache_manager = CacheManager()
