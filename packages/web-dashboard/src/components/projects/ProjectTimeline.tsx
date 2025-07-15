'use client'

import { Card } from '@/components/shared/Card'
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

interface TimelineEvent {
  id: string
  type: 'milestone' | 'deadline' | 'review'
  title: string
  description: string
  date: string
  status: 'completed' | 'upcoming' | 'delayed'
  project: string
}

const timelineEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'milestone',
    title: 'Beta Release',
    description: 'Launch beta version for testing',
    date: '2025-07-15T08:28:34Z',
    status: 'completed',
    project: 'DevMind Dashboard'
  },
  {
    id: '2',
    type: 'review',
    title: 'Code Review',
    description: 'Team code review session',
    date: '2025-07-16T14:00:00Z',
    status: 'upcoming',
    project: 'DevMind API'
  },
  {
    id: '3',
    type: 'deadline',
    title: 'Documentation Update',
    description: 'Update API documentation',
    date: '2025-07-14T18:00:00Z',
    status: 'delayed',
    project: 'DevMind Docs'
  },
  {
    id: '4',
    type: 'milestone',
    title: 'Production Deployment',
    description: 'Deploy to production servers',
    date: '2025-07-20T10:00:00Z',
    status: 'upcoming',
    project: 'DevMind Dashboard'
  }
]

export const ProjectTimeline = () => {
  const getStatusIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'upcoming':
        return <ClockIcon className="h-5 w-5 text-blue-500" />
      case 'delayed':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusClass = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 ring-green-600/20'
      case 'upcoming':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20'
      case 'delayed':
        return 'bg-red-50 text-red-700 ring-red-600/20'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date)
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
      </div>

      <div className="flow-root">
        <ul role="list" className="divide-y divide-gray-200">
          {timelineEvents.map((event) => (
            <li key={event.id} className="relative flex gap-x-4 px-4 py-5 hover:bg-gray-50 sm:px-6">
              <div className="flex h-6 w-6 flex-none items-center justify-center">
                {getStatusIcon(event.status)}
              </div>
              <div className="flex-auto">
                <div className="flex items-center justify-between gap-x-4">
                  <div className="flex items-center gap-x-3">
                    <h4 className="flex-none text-sm font-semibold text-gray-900">
                      {event.title}
                    </h4>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClass(
                        event.status
                      )}`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <time className="flex-none text-xs text-gray-500">
                    {formatDate(event.date)}
                  </time>
                </div>
                <p className="mt-1 text-sm text-gray-500">{event.description}</p>
                <p className="mt-2 text-xs text-gray-500">Project: {event.project}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-50 px-4 py-3 text-center">
        <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
          View full timeline
        </button>
      </div>
    </Card>
  )
}
