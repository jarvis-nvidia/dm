"""Models for monitoring endpoints."""
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class SystemMetrics(BaseModel):
    """System metrics model."""
    cpu_usage: float = Field(..., description="CPU usage percentage")
    memory_usage: float = Field(..., description="Memory usage percentage")
    disk_usage: float = Field(..., description="Disk usage percentage")
    network_io: Dict[str, float] = Field(..., description="Network I/O statistics")
    process_count: int = Field(..., description="Number of running processes")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CacheMetrics(BaseModel):
    """Cache performance metrics."""
    hits: int = Field(..., description="Number of cache hits")
    misses: int = Field(..., description="Number of cache misses")
    hit_ratio: float = Field(..., description="Cache hit ratio")
    memory_usage: float = Field(..., description="Memory usage in MB")
    items_count: int = Field(..., description="Number of items in cache")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class APIMetrics(BaseModel):
    """API performance metrics."""
    endpoint: str = Field(..., description="API endpoint path")
    method: str = Field(..., description="HTTP method")
    status_code: int = Field(..., description="HTTP status code")
    response_time: float = Field(..., description="Response time in seconds")
    errors: int = Field(..., description="Number of errors")
    requests: int = Field(..., description="Number of requests")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class HealthStatus(BaseModel):
    """Service health status."""
    service: str = Field(..., description="Service name")
    status: str = Field(..., description="Service status (healthy/unhealthy)")
    latency: float = Field(..., description="Service latency in seconds")
    last_check: datetime = Field(default_factory=datetime.utcnow)
    details: Optional[Dict] = Field(default=None, description="Additional health details")

class MonitoringResponse(BaseModel):
    """Combined monitoring response."""
    system: SystemMetrics
    cache: CacheMetrics
    api: List[APIMetrics]
    services: List[HealthStatus]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
