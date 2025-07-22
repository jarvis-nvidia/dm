'use client'

import { useState, useEffect } from 'react'
import { Card } from '../../../components/shared/Card'
import { Button } from '../../../components/shared/Button'
import {
  PlusIcon,
  BugAntIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline'

// Mock data for demonstration
const mockReviews = [
  {
    id: '1',
    title: 'Fix authentication bug in login flow',
    description: 'Updated the authentication logic to handle edge cases better',
    status: 'pending',
    author: 'John Doe',
    reviewer: 'Jane Smith',
    files_changed: ['src/auth/login.js', 'src/components/LoginForm.tsx'],
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T14:20:00Z',
  },
  {
    id: '2',
    title: 'Add new dashboard analytics feature',
    description: 'Implemented comprehensive analytics dashboard with charts and metrics',
    status: 'approved',
    author: 'Alice Johnson',
    reviewer: 'Bob Wilson',
    files_changed: ['src/dashboard/analytics.js', 'src/components/Charts.tsx', 'src/utils/analytics.js'],
    created_at: '2024-01-14T09:15:00Z',
    updated_at: '2024-01-14T16:45:00Z',
  },
  {
    id: '3',
    title: 'Optimize database queries',
    description: 'Improved query performance by adding indexes and optimizing joins',
    status: 'in_review',
    author: 'Charlie Brown',
    reviewer: 'Diana Prince',
    files_changed: ['src/db/queries.js', 'src/models/user.js'],
    created_at: '2024-01-13T11:20:00Z',
    updated_at: '2024-01-13T18:30:00Z',
  },
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(mockReviews)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'in_review'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true
    return review.status === filter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'in_review':
        return <EyeIcon className="h-5 w-5 text-blue-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'in_review':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">Code Reviews</h1>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Request Review
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {reviews.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-500">Pending</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {reviews.filter(r => r.status === 'approved').length}
          </div>
          <div className="text-sm text-gray-500">Approved</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {reviews.filter(r => r.status === 'in_review').length}
          </div>
          <div className="text-sm text-gray-500">In Review</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {reviews.filter(r => r.status === 'rejected').length}
          </div>
          <div className="text-sm text-gray-500">Rejected</div>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">Filter by status:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="text-sm text-gray-500">
            {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="pt-1">
                    {getStatusIcon(review.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{review.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                        {review.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{review.description}</p>
                    
                    {/* Files changed */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {review.files_changed.map((file, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs text-gray-800 rounded">
                          <CodeBracketIcon className="h-3 w-3 mr-1" />
                          {file}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Author: {review.author}</span>
                      <span>Reviewer: {review.reviewer}</span>
                      <span>Created: {new Date(review.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(review.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="secondary">
                    View
                  </Button>
                  {review.status === 'pending' && (
                    <>
                      <Button size="sm">
                        Approve
                      </Button>
                      <Button size="sm" variant="danger">
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <BugAntIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' ? 'No code reviews yet' : `No reviews with status "${filter}"`}
            </p>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Request Review
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}