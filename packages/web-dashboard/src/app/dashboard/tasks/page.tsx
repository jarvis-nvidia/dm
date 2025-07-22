'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '../../../lib/api'
import { Task, Project } from '../../../types'
import { Card } from '../../../components/shared/Card'
import { Button } from '../../../components/shared/Button'
import {
  PlusIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'testing' | 'done'>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch tasks
      const tasksResponse = await apiClient.getTasks({ limit: 100 })
      if (tasksResponse.success) {
        setTasks(tasksResponse.data as Task[])
      }

      // Fetch projects for filtering
      const projectsResponse = await apiClient.getProjects({ limit: 100 })
      if (projectsResponse.success) {
        setProjects(projectsResponse.data as Project[])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) return false
    if (selectedProject !== 'all' && task.project_id !== selectedProject) return false
    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-blue-500" />
      case 'testing':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'testing':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Filter by:</span>
          </div>
          
          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="testing">Testing</option>
            <option value="done">Done</option>
          </select>

          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <div className="text-sm text-gray-500">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="pt-1">
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Project: {task.project?.name || 'Unknown'}</span>
                      {task.due_date && (
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      )}
                      <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <XMarkIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' ? 'Create your first task to get started' : `No tasks with status "${filter}"`}
            </p>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}