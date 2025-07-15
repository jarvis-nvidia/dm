'use client'

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import { Card } from '@/components/shared/Card'

interface Metric {
  name: string
  value: string
  change: number
  changeType: 'increase' | 'decrease'
  description: string
}

const metrics: Metric[] = [
  {
    name: 'Code Quality Score',
    value: '92/100',
    change: 3.2,
    changeType: 'increase',
    description: 'Based on recent commits'
  },
  {
    name: 'Average Response Time',
    value: '2.3h',
    change: 12.5,
    changeType: 'decrease',
    description: 'Time to first response'
  },
  {
    name: 'Bug Resolution Rate',
    value: '94.8%',
    change: 5.1,
    changeType: 'increase',
    description: 'Last 30 days'
  },
  {
    name: 'Deployment Frequency',
    value: '4.2/day',
    change: 8.3,
    changeType: 'increase',
    description: 'Average deployments'
  },
  {
    name: 'Code Review Time',
    value: '45min',
    change: 15.0,
    changeType: 'decrease',
    description: 'Average review duration'
  },
  {
    name: 'Test Coverage',
    value: '88%',
    change: 2.4,
    changeType: 'increase',
    description: 'Across all projects'
  }
]

export const MetricsGrid = () => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.name} className="overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">{metric.name}</span>
              <div
                className={`flex items-center ${
                  metric.changeType === 'increase'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {metric.changeType === 'increase' ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
                <span className="ml-1 text-sm font-medium">{metric.change}%</span>
              </div>
            </div>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
              <p className="ml-2 text-sm text-gray-500">{metric.description}</p>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                View details
              </a>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
