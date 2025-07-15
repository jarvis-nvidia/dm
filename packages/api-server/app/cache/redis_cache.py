"""Redis cache implementation for DevMind."""
import json
import pickle
from typing import Any, Optional, Union
from datetime import datetime, timedelta
import aioredis
from app.core.config import settings
from app.cache.base import BaseCache
import logging

logger = logging.getLogger(__name__)

class RedisCache(BaseCache):
    """Redis cache implementation with optimized serialization."""

    def __init__(
        self,
        url: str = settings.REDIS_URL,
        max_connections: int = settings.REDIS_MAX_CONNECTIONS,
        socket_timeout: int = settings.REDIS_SOCKET_TIMEOUT
    ):
        """Initialize Redis cache with connection pool."""
        self.redis_url = url
        self._redis: Optional[aioredis.Redis] = None
        self._pool_settings = {
            'maxsize': max_connections,
            'timeout': socket_timeout
        }

    async def initialize(self):
        """Initialize Redis connection pool."""
        if self._redis is None:
            try:
                self._redis = await aioredis.from_url(
                    self.redis_url,
                    encoding='utf-8',
                    decode_responses=False,
                    **self._pool_settings
                )
                logger.info("Redis cache initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Redis cache: {str(e)}")
                raise

    async def get(self, key: str) -> Optional[Any]:
        """Get value from Redis with automatic deserialization."""
        try:
            value = await self._redis.get(key)
            if value is None:
                return None
            return self._deserialize(value)
        except Exception as e:
            logger.error(f"Redis get error for key {key}: {str(e)}")
            return None

    async def set(
        self,
        key: str,
        value: Any,
        expire: Optional[Union[int, timedelta]] = None
    ) -> bool:
        """Set value in Redis with automatic serialization."""
        try:
            serialized = self._serialize(value)
            if isinstance(expire, timedelta):
                expire = int(expire.total_seconds())

            await self._redis.set(key, serialized, ex=expire)
            return True
        except Exception as e:
            logger.error(f"Redis set error for key {key}: {str(e)}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete key from Redis."""
        try:
            return bool(await self._redis.delete(key))
        except Exception as e:
            logger.error(f"Redis delete error for key {key}: {str(e)}")
            return False

    async def clear(self) -> bool:
        """Clear all keys from Redis database."""
        try:
            await self._redis.flushdb(asynchronous=True)
            return True
        except Exception as e:
            logger.error(f"Redis clear error: {str(e)}")
            return False

    async def exists(self, key: str) -> bool:
        """Check if key exists in Redis."""
        try:
            return bool(await self._redis.exists(key))
        except Exception as e:
            logger.error(f"Redis exists error for key {key}: {str(e)}")
            return False

    async def increment(self, key: str, amount: int = 1) -> int:
        """Increment value in Redis."""
        try:
            return await self._redis.incrby(key, amount)
        except Exception as e:
            logger.error(f"Redis increment error for key {key}: {str(e)}")
            return 0

    async def expire_at(self, key: str, timestamp: datetime) -> bool:
        """Set expiration for key at specific timestamp."""
        try:
            return await self._redis.expireat(key, int(timestamp.timestamp()))
        except Exception as e:
            logger.error(f"Redis expire_at error for key {key}: {str(e)}")
            return False

    async def ttl(self, key: str) -> Optional[int]:
        """Get remaining time to live for key."""
        try:
            ttl = await self._redis.ttl(key)
            return ttl if ttl > 0 else None
        except Exception as e:
            logger.error(f"Redis ttl error for key {key}: {str(e)}")
            return None

    async def ping(self) -> bool:
        """Check Redis connection."""
        try:
            return await self._redis.ping()
        except Exception as e:
            logger.error(f"Redis ping error: {str(e)}")
            return False

    async def stats(self) -> dict:
        """Get Redis statistics."""
        try:
            info = await self._redis.info()
            return {
                'used_memory': info['used_memory_human'],
                'connected_clients': info['connected_clients'],
                'total_connections_received': info['total_connections_received'],
                'total_commands_processed': info['total_commands_processed']
            }
        except Exception as e:
            logger.error(f"Redis stats error: {str(e)}")
            return {}

    def _serialize(self, value: Any) -> bytes:
        """Serialize value for Redis storage."""
        try:
            return pickle.dumps(value)
        except Exception:
            return json.dumps(value).encode('utf-8')

    def _deserialize(self, value: bytes) -> Any:
        """Deserialize value from Redis storage."""
        try:
            return pickle.loads(value)
        except Exception:
            return json.loads(value.decode('utf-8'))

    async def close(self):
        """Close Redis connection."""
        if self._redis is not None:
            await self._redis.close()
            self._redis = None
