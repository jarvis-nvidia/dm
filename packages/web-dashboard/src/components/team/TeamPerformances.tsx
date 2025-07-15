'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/shared/Card'
import {
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  metrics: {
    commits: number
    reviews: number
    tasks: number
    efficiency: number
  }
  status: 'online' | 'busy' | 'offline'
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'gitkartik21',
    role: 'Lead Developer',
    avatar: '/avatars/gitkartik21.png',
    metrics: {
      commits: 47,
      reviews: 23,
      tasks: 15,
      efficiency: 94
    },
    status: 'online'
  },
  {
    id: '2',
    name: 'alexdev',
    role: 'Frontend Developer',
    avatar: '/avatars/alex.png',
    metrics: {
      commits: 38,
      reviews: 15,
      tasks: 12,
      efficiency: 88
    },
    status: 'busy'
  },
  {
    id: '3',
    name: 'sarahm',
    role: 'Backend Developer',
    avatar: '/avatars/sarah.png',
    metrics: {
      commits: 42,
      reviews: 19,
      tasks: 14,
      efficiency: 91
    },
    status: 'online'
  },
  {
    id: '4',
    name: 'mikew',
    role: 'DevOps Engineer',
    avatar: '/avatars/mike.png',
    metrics: {
      commits: 31,
      reviews: 12,
      tasks: 10,
      efficiency: 86
    },
    status: 'offline'
  }
]

export const TeamPerformance = () => {
  const [selectedMetric, setSelectedMetric] = useState<'commits' | 'reviews' | 'tasks' | 'efficiency'>('commits')

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'busy':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-gray-400'
    }
  }

  const getMetricIcon = (metric: typeof selectedMetric) => {
    switch (metric) {
      case 'commits':
        return <ChartBarIcon className="h-5 w-5" />
      case 'reviews':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'tasks':
        return <ClockIcon className="h-5 w-5" />
      case 'efficiency':
        return <UserGroupIcon className="h-5 w-5" />
    }
  }

  const sortedMembers = [...teamMembers].sort(
    (a, b) => b.metrics[selectedMetric] - a.metrics[selectedMetric]
  )

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
          <select
            className="rounded-md border border-gray-300 py-1 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as typeof selectedMetric)}
          >
            <option value="commits">Commits</option>
            <option value="reviews">Reviews</option>
            <option value="tasks">Tasks</option>
            <option value="efficiency">Efficiency</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center">
              <div className="relative">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white ${getStatusColor(
                    member.status
                  )}`}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500">{member.role}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {getMetricIcon(selectedMetric)}
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {member.metrics[selectedMetric]}
                  {selectedMetric === 'efficiency' ? '%' : ''}
                </span>
              </div>
              <div className="h-4 w-4">
                {member.metrics[selectedMetric] > teamMembers.reduce((acc, curr) => acc + curr.metrics[selectedMetric], 0) / teamMembers.length && (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-green-100">
                    <span className="text-xs font-medium text-green-600">↑</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
