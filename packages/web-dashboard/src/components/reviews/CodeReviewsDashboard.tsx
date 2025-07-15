'use client'

import { useState } from 'react'
import { Card } from '@/components/shared/Card'
import {
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface Review {
  id: string
  title: string
  author: string
  authorAvatar: string
  reviewer: string
  reviewerAvatar: string
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested'
  repository: string
  branch: string
  updatedAt: string
  comments: number
  additions: number
  deletions: number
}

const reviews: Review[] = [
  {
    id: 'pr1',
    title: 'Implement user authentication',
    author: 'gitkartik21',
    authorAvatar: '/avatars/gitkartik21.png',
    reviewer: 'alexdev',
    reviewerAvatar: '/avatars/alex.png',
    status: 'pending',
    repository: 'DevMind',
    branch: 'feature/auth',
    updatedAt: '2025-07-15T08:31:27Z',
    comments: 5,
    additions: 120,
    deletions: 34
  },
  {
    id: 'pr2',
    title: 'Add dashboard analytics',
    author: 'sarahm',
    authorAvatar: '/avatars/sarah.png',
    reviewer: 'gitkartik21',
    reviewerAvatar: '/avatars/gitkartik21.png',
    status: 'approved',
    repository: 'DevMind',
    branch: 'feature/analytics',
    updatedAt: '2025-07-15T07:45:27Z',
    comments: 3,
    additions: 245,
    deletions: 12
  },
  {
    id: 'pr3',
    title: 'Fix performance issues',
    author: 'mikew',
    authorAvatar: '/avatars/mike.png',
    reviewer: 'gitkartik21',
    reviewerAvatar: '/avatars/gitkartik21.png',
    status: 'changes_requested',
    repository: 'DevMind',
    branch: 'fix/performance',
    updatedAt: '2025-07-15T06:20:27Z',
    comments: 8,
    additions: 56,
    deletions: 89
  }
]

export const CodeReviewDashboard = () => {
  const [filter, setFilter] = useState<'all' | 'assigned' | 'created'>('all')

  const getStatusIcon = (status: Review['status']) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'changes_requested':
        return <ChatBubbleLeftIcon className="h-5 w-5 text-purple-500" />
    }
  }

  const getStatusText = (status: Review['status']) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)
  }

  const getStatusClass = (status: Review['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
      case 'approved':
        return 'bg-green-50 text-green-700 ring-green-600/20'
      case 'rejected':
        return 'bg-red-50 text-red-700 ring-red-600/20'
      case 'changes_requested':
        return 'bg-purple-50 text-purple-700 ring-purple-600/20'
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

  const filteredReviews = reviews.filter(review => {
    if (filter === 'assigned') return review.reviewer === 'gitkartik21'
    if (filter === 'created') return review.author === 'gitkartik21'
    return true
  })

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Code Reviews</h3>
          <div className="flex items-center space-x-2">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'assigned'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              onClick={() => setFilter('assigned')}
            >
              Assigned to me
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'created'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              onClick={() => setFilter('created')}
            >
              Created by me
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredReviews.map(review => (
          <div key={review.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-x-3">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {review.title}
                  </h4>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClass(
                      review.status
                    )}`}
                  >
                    {getStatusText(review.status)}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-x-2 text-xs text-gray-500">
                  <span>{review.repository}</span>
                  <span>•</span>
                  <span>{review.branch}</span>
                  <span>•</span>
                  <span>Updated {formatDate(review.updatedAt)}</span>
                </div>
              </div>

              <div className="ml-4 flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <img
                    src={review.authorAvatar}
                    alt={review.author}
                    className="h-6 w-6 rounded-full ring-2 ring-white"
                  />
                  <img
                    src={review.reviewerAvatar}
                    alt={review.reviewer}
                    className="h-6 w-6 rounded-full ring-2 ring-white"
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="text-green-600">+{review.additions}</span>
                  <span className="text-red-600">−{review.deletions}</span>
                  <div className="flex items-center">
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                    <span className="ml-1">{review.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
