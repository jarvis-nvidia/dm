'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { apiClient } from '../../lib/api'
import { Card } from '../../components/shared/Card'
import { Button } from '../../components/shared/Button'
import { DashboardStats, Project, Task, Activity } from '../../types'
import { 
  ChartBarIcon, 
  CodeBracketIcon, 
  CheckCircleIcon, 
  ClockIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  BugAntIcon,
  GitBranchIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsResponse = await apiClient.getDashboardStats()
      if (statsResponse.success) {
        setStats(statsResponse.data as DashboardStats)
      }

      // Fetch recent projects
      const projectsResponse = await apiClient.getProjects({ limit: 6 })
      if (projectsResponse.success) {
        setProjects(projectsResponse.data as Project[])
      }

      // Fetch recent tasks
      const tasksResponse = await apiClient.getTasks({ limit: 5 })
      if (tasksResponse.success) {
        setRecentTasks(tasksResponse.data as Task[])
      }

      // Fetch activity feed
      const activityResponse = await apiClient.getActivityFeed()
      if (activityResponse.success) {
        setActivities(activityResponse.data as Activity[])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name || user?.username}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary">
            <PlusIcon className="h-4 w-4 mr-2" />
            New Task
          </Button>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total_projects || 0}</p>
            </div>
            <ChartBarIcon className="h-10 w-10 text-blue-500" />
          </div>
          <div className="mt-2 flex items-center">
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+12% from last month</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.active_tasks || 0}</p>
            </div>
            <ClockIcon className="h-10 w-10 text-yellow-500" />
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-sm text-gray-600">In progress</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.completed_tasks || 0}</p>
            </div>
            <CheckCircleIcon className="h-10 w-10 text-green-500" />
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-sm text-gray-600">This month</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commits</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.commits_count || 0}</p>
            </div>
            <GitBranchIcon className="h-10 w-10 text-purple-500" />
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-sm text-gray-600">This week</span>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
              <Button variant="secondary" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CodeBracketIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-500">{project.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {project.stats?.active_tasks || 0} tasks
                        </p>
                        <p className="text-xs text-gray-500">
                          {project.stats?.commits_count || 0} commits
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CodeBracketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No projects yet. Create your first project!</p>
                  <Button className="mt-4">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Activity Feed */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Button variant="secondary" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {activity.type === 'commit' && <GitBranchIcon className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'task' && <CheckCircleIcon className="h-4 w-4 text-green-600" />}
                      {activity.type === 'project' && <CodeBracketIcon className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'review' && <BugAntIcon className="h-4 w-4 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Tasks */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
          <Button variant="secondary" size="sm">
            View All Tasks
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500">{task.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{task.project?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'done' 
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === 'urgent'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.due_date 
                        ? new Date(task.due_date).toLocaleDateString()
                        : 'No due date'
                      }
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No tasks yet. Start by creating a task!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}