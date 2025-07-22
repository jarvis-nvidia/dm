'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '../../lib/api'
import { Project } from '../../types'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'
import { 
  CodeBracketIcon, 
  PlusIcon, 
  EllipsisVerticalIcon,
  StarIcon,
  GitBranchIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface ProjectsOverviewProps {
  limit?: number
  showCreateButton?: boolean
}

export const ProjectsOverview: React.FC<ProjectsOverviewProps> = ({ 
  limit = 6, 
  showCreateButton = true 
}) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getProjects({ limit })
      
      if (response.success) {
        setProjects(response.data as Project[])
      } else {
        setError(response.message || 'Failed to fetch projects')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(limit)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="text-center py-8">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={fetchProjects} variant="secondary">
          Try Again
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        {showCreateButton && (
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CodeBracketIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <EllipsisVerticalIcon className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {project.stats?.total_tasks || 0}
                  </div>
                  <div className="text-xs text-gray-500">Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {project.stats?.commits_count || 0}
                  </div>
                  <div className="text-xs text-gray-500">Commits</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {project.stats?.completed_tasks || 0}
                  </div>
                  <div className="text-xs text-gray-500">Done</div>
                </div>
              </div>

              {/* Project Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  {project.github_repo && (
                    <div className="flex items-center text-xs text-gray-500">
                      <GitBranchIcon className="h-3 w-3 mr-1" />
                      {project.github_branch}
                    </div>
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {new Date(project.updated_at).toLocaleDateString()}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>
                    {project.stats?.completed_tasks || 0} / {project.stats?.total_tasks || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        project.stats?.total_tasks 
                          ? (project.stats.completed_tasks / project.stats.total_tasks) * 100 
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CodeBracketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-6">
            Get started by creating your first project with DevMind
          </p>
          {showCreateButton && (
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}