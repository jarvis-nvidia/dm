'use client'

import { useState, useEffect } from 'react'
import { Card } from '../../../components/shared/Card'
import { Button } from '../../../components/shared/Button'
import {
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowPathIcon,
  CodeBracketIcon,
  BugAntIcon,
  GitBranchIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const metrics = [
    {
      title: 'Total Projects',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: CodeBracketIcon,
      color: 'blue',
    },
    {
      title: 'Active Tasks',
      value: '48',
      change: '+12',
      trend: 'up',
      icon: ClockIcon,
      color: 'yellow',
    },
    {
      title: 'Completed Tasks',
      value: '156',
      change: '+24',
      trend: 'up',
      icon: ChartBarIcon,
      color: 'green',
    },
    {
      title: 'Code Reviews',
      value: '32',
      change: '-3',
      trend: 'down',
      icon: BugAntIcon,
      color: 'red',
    },
    {
      title: 'Commits',
      value: '284',
      change: '+45',
      trend: 'up',
      icon: GitBranchIcon,
      color: 'purple',
    },
    {
      title: 'AI Assistance',
      value: '127',
      change: '+18',
      trend: 'up',
      icon: ChartBarIcon,
      color: 'indigo',
    },
  ]

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      yellow: 'text-yellow-600',
      green: 'text-green-600',
      red: 'text-red-600',
      purple: 'text-purple-600',
      indigo: 'text-indigo-600',
    }
    return colors[color as keyof typeof colors] || 'text-gray-600'
  }

  const getBgColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100',
      yellow: 'bg-yellow-100',
      green: 'bg-green-100',
      red: 'bg-red-100',
      purple: 'bg-purple-100',
      indigo: 'bg-indigo-100',
    }
    return colors[color as keyof typeof colors] || 'bg-gray-100'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="secondary">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className={`border-l-4 border-l-${metric.color}-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-lg ${getBgColor(metric.color)} flex items-center justify-center`}>
                <metric.icon className={`h-6 w-6 ${getIconColor(metric.color)}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {metric.trend === 'up' ? (
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change} from last {timeRange}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Project Activity</h3>
            <Button variant="secondary" size="sm">
              View Details
            </Button>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Code Quality Trends</h3>
            <Button variant="secondary" size="sm">
              View Details
            </Button>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Quality metrics would go here</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUpIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Productivity Increase</p>
              <p className="text-sm text-gray-600">
                Your team's productivity has increased by 23% this month compared to last month.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
            <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center">
              <BugAntIcon className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Code Review Suggestion</p>
              <p className="text-sm text-gray-600">
                Consider scheduling more frequent code reviews. Projects with regular reviews have 40% fewer bugs.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
            <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
              <GitBranchIcon className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Commit Pattern</p>
              <p className="text-sm text-gray-600">
                Your commit frequency is optimal. Keep maintaining consistent daily commits for better code tracking.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}