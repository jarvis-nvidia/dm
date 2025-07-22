'use client'

import { useState, useEffect } from 'react'
import { Card } from '../../../components/shared/Card'
import { Button } from '../../../components/shared/Button'
import {
  GitBranchIcon,
  PlusIcon,
  MinusIcon,
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

// Mock data for demonstration
const mockCommits = [
  {
    id: '1',
    hash: 'a1b2c3d4',
    message: 'feat: Add user authentication system',
    author: 'John Doe',
    project: 'DevMind Dashboard',
    additions: 245,
    deletions: 12,
    files_changed: 8,
    ai_generated: true,
    is_merge: false,
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    hash: 'e5f6g7h8',
    message: 'fix: Resolve authentication bug in login flow',
    author: 'Jane Smith',
    project: 'DevMind Dashboard',
    additions: 23,
    deletions: 45,
    files_changed: 3,
    ai_generated: false,
    is_merge: false,
    created_at: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    hash: 'i9j0k1l2',
    message: 'Merge pull request #123 from feature/analytics',
    author: 'Alice Johnson',
    project: 'DevMind API',
    additions: 156,
    deletions: 89,
    files_changed: 12,
    ai_generated: false,
    is_merge: true,
    created_at: '2024-01-13T09:15:00Z',
  },
  {
    id: '4',
    hash: 'm3n4o5p6',
    message: 'refactor: Optimize database queries for better performance',
    author: 'Bob Wilson',
    project: 'DevMind API',
    additions: 67,
    deletions: 134,
    files_changed: 5,
    ai_generated: true,
    is_merge: false,
    created_at: '2024-01-12T16:45:00Z',
  },
]

export default function CommitsPage() {
  const [commits, setCommits] = useState(mockCommits)
  const [filter, setFilter] = useState<'all' | 'ai' | 'merge' | 'regular'>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const filteredCommits = commits.filter(commit => {
    if (selectedProject !== 'all' && commit.project !== selectedProject) return false
    if (filter === 'ai' && !commit.ai_generated) return false
    if (filter === 'merge' && !commit.is_merge) return false
    if (filter === 'regular' && (commit.ai_generated || commit.is_merge)) return false
    return true
  })

  const projects = Array.from(new Set(commits.map(c => c.project)))

  const getCommitTypeIcon = (commit: any) => {
    if (commit.ai_generated) {
      return <SparklesIcon className="h-4 w-4 text-purple-500" />
    }
    if (commit.is_merge) {
      return <GitBranchIcon className="h-4 w-4 text-blue-500" />
    }
    return <ClockIcon className="h-4 w-4 text-gray-500" />
  }

  const getCommitTypeLabel = (commit: any) => {
    if (commit.ai_generated) return 'AI Generated'
    if (commit.is_merge) return 'Merge Commit'
    return 'Regular Commit'
  }

  const getCommitTypeColor = (commit: any) => {
    if (commit.ai_generated) return 'bg-purple-100 text-purple-800'
    if (commit.is_merge) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 gap-4">
          {[...Array(4)].map((_, index) => (
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
        <h1 className="text-3xl font-bold text-gray-900">Commits</h1>
        <Button>
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Sync Repository
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-gray-900">{commits.length}</div>
          <div className="text-sm text-gray-500">Total Commits</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {commits.filter(c => c.ai_generated).length}
          </div>
          <div className="text-sm text-gray-500">AI Generated</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {commits.filter(c => c.is_merge).length}
          </div>
          <div className="text-sm text-gray-500">Merge Commits</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {commits.reduce((sum, c) => sum + c.additions, 0)}
          </div>
          <div className="text-sm text-gray-500">Total Additions</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">Filter by:</span>
          
          {/* Type Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Commits</option>
            <option value="ai">AI Generated</option>
            <option value="merge">Merge Commits</option>
            <option value="regular">Regular Commits</option>
          </select>

          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>

          <div className="text-sm text-gray-500">
            {filteredCommits.length} commit{filteredCommits.length !== 1 ? 's' : ''}
          </div>
        </div>
      </Card>

      {/* Commits List */}
      <div className="space-y-4">
        {filteredCommits.length > 0 ? (
          filteredCommits.map((commit) => (
            <Card key={commit.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="pt-1">
                    {getCommitTypeIcon(commit)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{commit.message}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCommitTypeColor(commit)}`}>
                        {getCommitTypeLabel(commit)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {commit.hash}
                      </span>
                      <span>{commit.author}</span>
                      <span>{commit.project}</span>
                      <span>{new Date(commit.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <PlusIcon className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">{commit.additions}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MinusIcon className="h-3 w-3 text-red-500" />
                        <span className="text-red-600">{commit.deletions}</span>
                      </div>
                      <span>{commit.files_changed} files changed</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="secondary">
                  View Details
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <GitBranchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No commits found</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' ? 'No commits yet' : `No commits matching "${filter}" filter`}
            </p>
            <Button>
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Sync Repository
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}