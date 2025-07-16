// Core types for DevMind application

export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'completed'
  progress: number
  created_at: string
  updated_at: string
  repository?: string
  language?: string
  team_members?: User[]
}

export interface Activity {
  id: string
  type: 'commit' | 'review' | 'debug' | 'deploy'
  description: string
  userId: string
  projectId: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface AIMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  metadata?: {
    suggestions?: string[]
    code_snippets?: string[]
    confidence?: number
  }
}

export interface CodeInsight {
  id: string
  type: 'optimization' | 'security' | 'bug' | 'suggestion'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  file_path?: string
  line_number?: number
  suggested_fix?: string
  confidence: number
}

export interface RepositoryMetrics {
  code_quality: number
  test_coverage: number
  performance_score: number
  security_rating: number
  technical_debt: number
  maintainability_index: number
}

export interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  status: 'online' | 'busy' | 'offline'
  metrics: {
    commits: number
    reviews: number
    tasks: number
    efficiency: number
  }
}

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action_url?: string
}

export interface DashboardStats {
  total_projects: number
  active_tasks: number
  code_quality_avg: number
  recent_commits: number
  pending_reviews: number
  resolved_issues: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
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
}

// Component prop types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Animation types
export interface AnimationConfig {
  duration?: number
  delay?: number
  ease?: string
  repeat?: number | boolean
}

// Theme types
export interface ThemeConfig {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  border: string
}

// Navigation types
export interface NavItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: NavItem[]
}

// Search types
export interface SearchResult {
  id: string
  type: 'project' | 'file' | 'function' | 'variable'
  title: string
  description: string
  file_path?: string
  line_number?: number
  project_id?: string
}

// Settings types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
  }
  editor: {
    font_size: number
    tab_size: number
    word_wrap: boolean
    line_numbers: boolean
  }
  ai_assistant: {
    auto_suggestions: boolean
    context_awareness: boolean
    learning_mode: boolean
  }
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: Date
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}