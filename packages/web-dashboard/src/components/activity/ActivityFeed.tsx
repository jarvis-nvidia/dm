'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  ChatBubbleLeftIcon,
  CodeBracketIcon,
  BugAntIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Activity } from '@/types'
import { Card } from '@/components/shared/Card'

interface ActivityItemProps {
  activity: Activity
}

const ActivityIcon = ({ type }: { type: Activity['type'] }) => {
  const iconClass = "h-6 w-6"
  switch (type) {
    case 'commit':
      return <CodeBracketIcon className={`${iconClass} text-blue-600`} />
    case 'review':
      return <ChatBubbleLeftIcon className={`${iconClass} text-purple-600`} />
    case 'debug':
      return <BugAntIcon className={`${iconClass} text-red-600`} />
    default:
      return null
  }
}

const ActivityStatus = ({ type }: { type: Activity['type'] }) => {
  switch (type) {
    case 'commit':
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
          <CheckCircleIcon className="mr-1 h-4 w-4" />
          Committed
        </span>
      )
    case 'review':
      return (
        <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
          <ChatBubbleLeftIcon className="mr-1 h-4 w-4" />
          Review Requested
        </span>
      )
    case 'debug':
      return (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
          <ExclamationTriangleIcon className="mr-1 h-4 w-4" />
          Debug Session
        </span>
      )
    default:
      return null
  }
}

const ActivityItem = ({ activity }: ActivityItemProps) => {
  return (
    <div className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0">
        <ActivityIcon type={activity.type} />
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {activity.description}
          </p>
          <ActivityStatus type={activity.type} />
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <span>
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </span>
          <span>•</span>
          <span>Project: {activity.projectId}</span>
        </div>
      </div>
    </div>
  )
}

export const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'commit',
      description: 'feat(dashboard): implement activity feed component',
      userId: 'user1',
      projectId: 'Frontend Migration',
      timestamp: '2025-07-15T08:10:00Z'
    },
    {
      id: '2',
      type: 'review',
      description: 'Review requested for PR #123: Add user authentication',
      userId: 'user2',
      projectId: 'Backend API',
      timestamp: '2025-07-15T07:55:00Z'
    },
    {
      id: '3',
      type: 'debug',
      description: 'Investigating memory leak in production environment',
      userId: 'user1',
      projectId: 'Backend API',
      timestamp: '2025-07-15T07:30:00Z'
    },
    {
      id: '4',
      type: 'commit',
      description: 'fix(api): resolve race condition in data fetching',
      userId: 'user3',
      projectId: 'Backend API',
      timestamp: '2025-07-15T07:15:00Z'
    },
    {
      id: '5',
      type: 'review',
      description: 'Review completed for PR #120: Update documentation',
      userId: 'user2',
      projectId: 'Documentation',
      timestamp: '2025-07-15T07:00:00Z'
    }
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const types: Activity['type'][] = ['commit', 'review', 'debug']
      const newActivity: Activity = {
        id: Date.now().toString(),
        type: types[Math.floor(Math.random() * types.length)],
        description: 'New activity generated for testing',
        userId: 'user1',
        projectId: 'Test Project',
        timestamp: new Date().toISOString()
      }

      setActivities(prev => [newActivity, ...prev.slice(0, 4)])
    }, 30000) // Add new activity every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map(activity => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
      <div className="bg-gray-50 px-4 py-3 text-center">
        <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
          View all activity
        </button>
      </div>
    </Card>
  )
}
