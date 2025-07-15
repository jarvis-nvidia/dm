"""Monitoring service for DevMind API."""
import psutil
import asyncio
import logging
from datetime import datetime
from typing import Dict, List
from app.core.config import settings
from app.cache.manager import cache_manager
from app.monitoring.models import (
    SystemMetrics,
    CacheMetrics,
    APIMetrics,
    HealthStatus,
    MonitoringResponse
)

logger = logging.getLogger(__name__)

class MonitoringService:
    """Service for collecting and managing monitoring metrics."""

    def __init__(self):
        """Initialize monitoring service."""
        self.api_metrics: Dict[str, List[APIMetrics]] = {}
        self.last_check: datetime = datetime.utcnow()
        self._monitoring_task = None

    async def start_monitoring(self):
        """Start background monitoring task."""
        if self._monitoring_task is None:
            self._monitoring_task = asyncio.create_task(self._monitor_loop())
            logger.info("Monitoring service started")

    async def stop_monitoring(self):
        """Stop background monitoring task."""
        if self._monitoring_task:
            self._monitoring_task.cancel()
            try:
                await self._monitoring_task
            except asyncio.CancelledError:
                pass
            self._monitoring_task = None
            logger.info("Monitoring service stopped")

    async def get_system_metrics(self) -> SystemMetrics:
        """Get current system metrics."""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            network = psutil.net_io_counters()

            return SystemMetrics(
                cpu_usage=cpu_percent,
                memory_usage=memory.percent,
                disk_usage=disk.percent,
                network_io={
                    'bytes_sent': network.bytes_sent,
                    'bytes_recv': network.bytes_recv
                },
                process_count=len(psutil.pids()),
                timestamp=datetime.utcnow()
            )
        except Exception as e:
            logger.error(f"Error getting system metrics: {str(e)}")
            raise

    async def get_cache_metrics(self) -> CacheMetrics:
        """Get current cache metrics."""
        try:
            stats = await cache_manager.stats()
            memory_stats = stats.get('memory', {})

            return CacheMetrics(
                hits=memory_stats.get('hits', 0),
                misses=memory_stats.get('misses', 0),
                hit_ratio=memory_stats.get('hit_ratio', 0.0),
                memory_usage=memory_stats.get('size', 0) / (1024 * 1024),  # Convert to MB
                items_count=memory_stats.get('items', 0),
                timestamp=datetime.utcnow()
            )
        except Exception as e:
            logger.error(f"Error getting cache metrics: {str(e)}")
            raise

    async def get_service_health(self) -> List[HealthStatus]:
        """Get health status of all services."""
        services = []

        # Check Redis health
        try:
            redis_start = datetime.utcnow()
            redis_healthy = cache_manager.redis and await cache_manager.redis.ping()
            redis_latency = (datetime.utcnow() - redis_start).total_seconds()

            services.append(HealthStatus(
                service="redis",
                status="healthy" if redis_healthy else "unhealthy",
                latency=redis_latency,
                details={"connection": "active" if redis_healthy else "inactive"}
            ))
        except Exception as e:
            services.append(HealthStatus(
                service="redis",
                status="unhealthy",
                latency=0.0,
                details={"error": str(e)}
            ))

        # Check vector store health
        try:
            from app.services.vectore_store_service import vector_store
            vector_start = datetime.utcnow()
            stats = await vector_store.get_collection_stats()
            vector_latency = (datetime.utcnow() - vector_start).total_seconds()

            services.append(HealthStatus(
                service="vector_store",
                status="healthy",
                latency=vector_latency,
                details=stats
            ))
        except Exception as e:
            services.append(HealthStatus(
                service="vector_store",
                status="unhealthy",
                latency=0.0,
                details={"error": str(e)}
            ))

        return services

    def record_api_metric(self, endpoint: str, method: str, status_code: int, response_time: float):
        """Record API metrics for an endpoint."""
        metric = APIMetrics(
            endpoint=endpoint,
            method=method,
            status_code=status_code,
            response_time=response_time,
            errors=1 if status_code >= 400 else 0,
            requests=1
        )

        key = f"{method}:{endpoint}"
        if key not in self.api_metrics:
            self.api_metrics[key] = []

        self.api_metrics[key].append(metric)

        # Keep only last 1000 metrics per endpoint
        if len(self.api_metrics[key]) > 1000:
            self.api_metrics[key] = self.api_metrics[key][-1000:]

    async def get_monitoring_data(self) -> MonitoringResponse:
        """Get comprehensive monitoring data."""
        system_metrics = await self.get_system_metrics()
        cache_metrics = await self.get_cache_metrics()
        service_health = await self.get_service_health()

        # Aggregate API metrics
        api_metrics = []
        for metrics in self.api_metrics.values():
            if metrics:
                api_metrics.extend(metrics[-10:])  # Get last 10 metrics for each endpoint

        return MonitoringResponse(
            system=system_metrics,
            cache=cache_metrics,
            api=api_metrics,
            services=service_health,
            timestamp=datetime.utcnow()
        )

    async def _monitor_loop(self):
        """Background monitoring loop."""
        while True:
            try:
                # Record system metrics
                system_metrics = await self.get_system_metrics()

                # Check if any metrics are above warning thresholds
                if system_metrics.cpu_usage > 80:
                    logger.warning(f"High CPU usage: {system_metrics.cpu_usage}%")

                if system_metrics.memory_usage > 80:
                    logger.warning(f"High memory usage: {system_metrics.memory_usage}%")

                if system_metrics.disk_usage > 80:
                    logger.warning(f"High disk usage: {system_metrics.disk_usage}%")

                self.last_check = datetime.utcnow()

            except Exception as e:
                logger.error(f"Error in monitoring loop: {str(e)}")

            await asyncio.sleep(settings.MONITORING_INTERVAL)

# Initialize monitoring service
monitoring_service = MonitoringService()
