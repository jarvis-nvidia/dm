"""Analytics CRUD operations."""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.crud.base import CRUDBase
from app.models.analytics import AnalyticsTable, AnalyticsCreate, Analytics

class CRUDAnalytics(CRUDBase[AnalyticsTable, AnalyticsCreate, Analytics]):
    def get_by_project(self, db: Session, *, project_id: int, skip: int = 0, limit: int = 100) -> List[AnalyticsTable]:
        """Get analytics by project."""
        return (
            db.query(AnalyticsTable)
            .filter(AnalyticsTable.project_id == project_id)
            .order_by(desc(AnalyticsTable.recorded_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_metric(self, db: Session, *, metric_name: str, project_id: Optional[int] = None) -> List[AnalyticsTable]:
        """Get analytics by metric name."""
        query = db.query(AnalyticsTable).filter(AnalyticsTable.metric_name == metric_name)
        
        if project_id:
            query = query.filter(AnalyticsTable.project_id == project_id)
            
        return query.order_by(desc(AnalyticsTable.recorded_at)).all()

    def get_recent_metrics(self, db: Session, *, project_id: int, days: int = 7) -> List[AnalyticsTable]:
        """Get recent metrics for a project."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        return (
            db.query(AnalyticsTable)
            .filter(
                AnalyticsTable.project_id == project_id,
                AnalyticsTable.recorded_at >= cutoff_date
            )
            .order_by(desc(AnalyticsTable.recorded_at))
            .all()
        )

    def record_metric(self, db: Session, *, project_id: int, metric_name: str, metric_value: Dict[str, Any], metadata: Optional[Dict[str, Any]] = None) -> AnalyticsTable:
        """Record a new metric."""
        db_obj = AnalyticsTable(
            project_id=project_id,
            metric_name=metric_name,
            metric_value=metric_value,
            metadata=metadata or {},
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_metric_summary(self, db: Session, *, project_id: int, metric_name: str, days: int = 30) -> Dict[str, Any]:
        """Get metric summary for a project."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        metrics = (
            db.query(AnalyticsTable)
            .filter(
                AnalyticsTable.project_id == project_id,
                AnalyticsTable.metric_name == metric_name,
                AnalyticsTable.recorded_at >= cutoff_date
            )
            .order_by(AnalyticsTable.recorded_at)
            .all()
        )

        if not metrics:
            return {"count": 0, "latest_value": None, "trend": "stable"}

        values = [m.metric_value for m in metrics]
        
        # Basic trend analysis
        if len(values) >= 2:
            first_half = values[:len(values)//2]
            second_half = values[len(values)//2:]
            
            # Simple trend detection (you can make this more sophisticated)
            first_avg = sum(v.get('value', 0) for v in first_half) / len(first_half) if first_half else 0
            second_avg = sum(v.get('value', 0) for v in second_half) / len(second_half) if second_half else 0
            
            if second_avg > first_avg * 1.1:
                trend = "increasing"
            elif second_avg < first_avg * 0.9:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            trend = "stable"

        return {
            "count": len(metrics),
            "latest_value": metrics[-1].metric_value if metrics else None,
            "trend": trend,
            "data_points": len(values)
        }

    def get_project_analytics_summary(self, db: Session, *, project_id: int) -> Dict[str, Any]:
        """Get comprehensive analytics summary for a project."""
        recent_metrics = self.get_recent_metrics(db, project_id=project_id, days=30)
        
        summary = {
            "total_metrics": len(recent_metrics),
            "unique_metrics": len(set(m.metric_name for m in recent_metrics)),
            "latest_activity": recent_metrics[0].recorded_at if recent_metrics else None,
            "metrics_by_type": {},
        }

        # Group metrics by type
        for metric in recent_metrics:
            metric_type = metric.metric_name
            if metric_type not in summary["metrics_by_type"]:
                summary["metrics_by_type"][metric_type] = []
            summary["metrics_by_type"][metric_type].append({
                "value": metric.metric_value,
                "recorded_at": metric.recorded_at,
                "metadata": metric.metadata
            })

        return summary

analytics_crud = CRUDAnalytics(AnalyticsTable)