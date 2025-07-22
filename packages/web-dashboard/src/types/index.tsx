// Core types for DevMind Dashboard
export interface User {
  id: string
  email: string
  username: string
  full_name?: string
  avatar_url?: string
  role: 'admin' | 'user' | 'guest'
  is_active: boolean
  github_username?: string
  created_at: string
  updated_at: string
  last_login?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  github_repo?: string
  github_branch: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  owner_id: string
  created_at: string
  updated_at: string
  owner?: User
  stats?: ProjectStats
}

export interface ProjectStats {
  total_tasks: number
  completed_tasks: number
  active_tasks: number
  commits_count: number
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'testing' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  project_id: string
  assigned_to?: string
  created_by: string
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
  project?: Project
  assigned_user?: User
  creator?: User
}

export interface Commit {
  id: string
  commit_hash: string
  message: string
  author_id: string
  project_id: string
  files_changed?: string
  additions: number
  deletions: number
  is_merge: boolean
  ai_generated: boolean
  commit_date: string
  created_at: string
  author?: User
  project?: Project
}

export interface Analytics {
  id: string
  project_id: string
  metric_name: string
  metric_value: Record<string, any>
  metadata?: Record<string, any>
  recorded_at: string
  project?: Project
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface DashboardStats {
  total_projects: number
  active_tasks: number
  completed_tasks: number
  commits_count: number
  recent_activity: Activity[]
}

export interface Activity {
  id: string
  type: 'commit' | 'task' | 'project' | 'review'
  title: string
  description?: string
  user_id: string
  project_id?: string
  created_at: string
  user?: User
  project?: Project
}

export interface CodeReview {
  id: string
  title: string
  description: string
  code_diff: string
  files_changed: string[]
  status: 'pending' | 'approved' | 'rejected' | 'in_review'
  reviewer_id?: string
  author_id: string
  project_id: string
  created_at: string
  updated_at: string
  reviewer?: User
  author?: User
  project?: Project
}

export interface AIAgentResponse {
  success: boolean
  message: string
  data?: {
    analysis?: string
    suggestions?: string[]
    processing_time?: string
    context_used?: boolean
  }
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface SignupForm {
  email: string
  username: string
  password: string
  confirm_password: string
  full_name?: string
}

export interface ProjectForm {
  name: string
  description?: string
  github_repo?: string
  github_branch?: string
}

export interface TaskForm {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
  due_date?: string
}

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/v1/auth/login',
  SIGNUP: '/api/v1/auth/signup',
  LOGOUT: '/api/v1/auth/logout',
  ME: '/api/v1/auth/me',
  GITHUB_LOGIN: '/api/v1/auth/github/login',
  GITHUB_CALLBACK: '/api/v1/auth/github/callback',
  
  // Projects
  PROJECTS: '/api/v1/projects',
  PROJECT: (id: string) => `/api/v1/projects/${id}`,
  PROJECT_STATS: (id: string) => `/api/v1/projects/${id}/stats`,
  
  // Tasks
  TASKS: '/api/v1/tasks',
  TASK: (id: string) => `/api/v1/tasks/${id}`,
  PROJECT_TASKS: (projectId: string) => `/api/v1/projects/${projectId}/tasks`,
  
  // Commits
  COMMITS: '/api/v1/commits',
  COMMIT: (id: string) => `/api/v1/commits/${id}`,
  PROJECT_COMMITS: (projectId: string) => `/api/v1/projects/${projectId}/commits`,
  
  // Analytics
  ANALYTICS: '/api/v1/analytics',
  PROJECT_ANALYTICS: (projectId: string) => `/api/v1/projects/${projectId}/analytics`,
  
  // AI Agents
  DEBUG_AGENT: '/api/v1/debug',
  REVIEW_AGENT: '/api/v1/review',
  STORYTELLER_AGENT: '/api/v1/storyteller',
  
  // Dashboard
  DASHBOARD_STATS: '/api/v1/dashboard/stats',
  ACTIVITY_FEED: '/api/v1/dashboard/activity',
} as const

// Status colors for UI
export const STATUS_COLORS = {
  // Task status
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  testing: 'bg-yellow-100 text-yellow-800',
  done: 'bg-green-100 text-green-800',
  
  // Project status
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-800',
  
  // Priority colors
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
} as const

export const PRIORITY_COLORS = STATUS_COLORS