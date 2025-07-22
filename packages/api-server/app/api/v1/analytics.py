"""Analytics API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timedelta
from app.schemas.analytics import AnalyticsCreate, Analytics, ProjectAnalytics
from app.api.deps import get_api_key
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Mock analytics data
mock_analytics = [
    {
        "id": 1,
        "project_id": 1,
        "metric_name": "commits_per_day",
        "metric_value": {"count": 5, "date": "2025-01-15"},
        "metadata": {"branch": "main", "authors": ["user1", "user2"]},
        "recorded_at": "2025-01-15T10:00:00Z"
    },
    {
        "id": 2,
        "project_id": 1,
        "metric_name": "code_quality_score",
        "metric_value": {"score": 8.5, "previous_score": 8.2},
        "metadata": {"improved_areas": ["documentation", "test_coverage"]},
        "recorded_at": "2025-01-15T11:00:00Z"
    },
    {
        "id": 3,
        "project_id": 2,
        "metric_name": "task_completion_rate",
        "metric_value": {"rate": 0.75, "completed": 3, "total": 4},
        "metadata": {"timeframe": "weekly"},
        "recorded_at": "2025-01-15T12:00:00Z"
    }
]

@router.get("/projects/{project_id}", response_model=ProjectAnalytics)
async def get_project_analytics(project_id: int, _: bool = Depends(get_api_key)):
    """Get comprehensive analytics for a project."""
    try:
        # Mock comprehensive analytics
        analytics = {
            "project_id": project_id,
            "total_commits": 42,
            "total_tasks": 15,
            "completed_tasks": 8,
            "bug_count": 2,
            "code_quality_score": 8.5,
            "productivity_score": 7.8,
            "last_activity": "2025-01-15T14:30:00Z"
        }
        return analytics
    except Exception as e:
        logger.error(f"Error getting project analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch project analytics"
        )

@router.get("/projects/{project_id}/metrics", response_model=List[Analytics])
async def get_project_metrics(
    project_id: int,
    metric_name: Optional[str] = None,
    days: int = 30,
    _: bool = Depends(get_api_key)
):
    """Get specific metrics for a project."""
    try:
        metrics = [m for m in mock_analytics if m["project_id"] == project_id]
        
        if metric_name:
            metrics = [m for m in metrics if m["metric_name"] == metric_name]
            
        # Filter by date range (simplified mock)
        cutoff_date = datetime.now() - timedelta(days=days)
        metrics = [m for m in metrics if datetime.fromisoformat(m["recorded_at"].replace('Z', '+00:00')) > cutoff_date]
        
        return metrics
    except Exception as e:
        logger.error(f"Error getting project metrics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch project metrics"
        )

@router.post("/projects/{project_id}/metrics", response_model=Analytics)
async def record_metric(project_id: int, metric: AnalyticsCreate, _: bool = Depends(get_api_key)):
    """Record a new metric for a project."""
    try:
        new_metric = {
            "id": len(mock_analytics) + 1,
            "project_id": project_id,
            "metric_name": metric.metric_name,
            "metric_value": metric.metric_value,
            "metadata": metric.metadata,
            "recorded_at": datetime.now().isoformat() + "Z"
        }
        mock_analytics.append(new_metric)
        return new_metric
    except Exception as e:
        logger.error(f"Error recording metric: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record metric"
        )

@router.get("/dashboard/overview")
async def get_dashboard_overview(_: bool = Depends(get_api_key)):
    """Get overview analytics for the dashboard."""
    try:
        overview = {
            "total_projects": 2,
            "active_projects": 2,
            "total_tasks": 23,
            "completed_tasks": 11,
            "tasks_in_progress": 7,
            "recent_commits": 15,
            "average_code_quality": 8.5,
            "productivity_trend": "increasing",
            "top_languages": [
                {"language": "TypeScript", "percentage": 45},
                {"language": "Python", "percentage": 35},
                {"language": "JavaScript", "percentage": 20}
            ],
            "recent_activity": [
                {
                    "type": "commit",
                    "message": "feat: add AI-powered code review",
                    "project": "DevMind Core",
                    "timestamp": "2025-01-15T14:30:00Z"
                },
                {
                    "type": "task_completed", 
                    "message": "Completed: Implement user authentication",
                    "project": "DevMind Core",
                    "timestamp": "2025-01-15T14:00:00Z"
                },
                {
                    "type": "task_created",
                    "message": "Created: Setup VS Code extension commands",
                    "project": "DevMind VS Code Extension",
                    "timestamp": "2025-01-13T16:45:00Z"
                }
            ]
        }
        return overview
    except Exception as e:
        logger.error(f"Error getting dashboard overview: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch dashboard overview"
        )

@router.get("/insights/productivity")
async def get_productivity_insights(_: bool = Depends(get_api_key)):
    """Get AI-generated productivity insights."""
    try:
        insights = {
            "overall_score": 7.8,
            "trend": "improving",
            "insights": [
                {
                    "type": "positive",
                    "title": "High Commit Frequency",
                    "description": "You've maintained consistent daily commits across projects",
                    "impact": "Helps maintain project momentum"
                },
                {
                    "type": "suggestion",
                    "title": "Task Management Optimization",
                    "description": "Consider breaking down larger tasks into smaller ones",
                    "impact": "Could improve completion rates by 15%"
                },
                {
                    "type": "warning",
                    "title": "Code Review Bottleneck",
                    "description": "Some PRs are taking longer than usual to review",
                    "impact": "May slow down development velocity"
                }
            ],
            "recommendations": [
                "Set up automated code quality checks",
                "Implement PR review reminders", 
                "Consider pair programming for complex features"
            ],
            "generated_at": "2025-01-15T15:00:00Z"
        }
        return insights
    except Exception as e:
        logger.error(f"Error getting productivity insights: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch productivity insights"
        )

@router.get("/reports/weekly")
async def get_weekly_report(project_id: Optional[int] = None, _: bool = Depends(get_api_key)):
    """Generate a weekly progress report."""
    try:
        report = {
            "week_of": "2025-01-13",
            "project_filter": project_id,
            "summary": {
                "commits": 25,
                "tasks_completed": 5,
                "tasks_created": 3,
                "code_reviews": 8,
                "bugs_fixed": 2
            },
            "highlights": [
                "Successfully implemented user authentication system",
                "Completed initial VS Code extension setup",
                "Fixed critical security vulnerability in API endpoints"
            ],
            "blockers": [
                "Waiting for design approval on dashboard mockups",
                "Third-party API rate limiting issues"
            ],
            "upcoming_deadlines": [
                {"task": "Project dashboard completion", "due_date": "2025-01-25"},
                {"task": "VS Code extension beta release", "due_date": "2025-01-30"}
            ],
            "team_performance": {
                "velocity": 12.5,
                "quality_score": 8.7,
                "collaboration_score": 9.1
            },
            "generated_at": "2025-01-15T15:30:00Z"
        }
        return report
    except Exception as e:
        logger.error(f"Error generating weekly report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate weekly report"
        )