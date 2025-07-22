// API client for DevMind Dashboard
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { API_ENDPOINTS, ApiResponse } from '../types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Generic API methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config)
    return response.data
  }

  // Authentication methods
  async login(email: string, password: string) {
    return this.post(API_ENDPOINTS.LOGIN, { email, password })
  }

  async signup(userData: any) {
    return this.post(API_ENDPOINTS.SIGNUP, userData)
  }

  async logout() {
    return this.post(API_ENDPOINTS.LOGOUT)
  }

  async getMe() {
    return this.get(API_ENDPOINTS.ME)
  }

  async loginWithGitHub() {
    return this.post(API_ENDPOINTS.GITHUB_LOGIN)
  }

  // Project methods
  async getProjects(params?: any) {
    return this.get(API_ENDPOINTS.PROJECTS, { params })
  }

  async getProject(id: string) {
    return this.get(API_ENDPOINTS.PROJECT(id))
  }

  async createProject(data: any) {
    return this.post(API_ENDPOINTS.PROJECTS, data)
  }

  async updateProject(id: string, data: any) {
    return this.put(API_ENDPOINTS.PROJECT(id), data)
  }

  async deleteProject(id: string) {
    return this.delete(API_ENDPOINTS.PROJECT(id))
  }

  async getProjectStats(id: string) {
    return this.get(API_ENDPOINTS.PROJECT_STATS(id))
  }

  // Task methods
  async getTasks(params?: any) {
    return this.get(API_ENDPOINTS.TASKS, { params })
  }

  async getTask(id: string) {
    return this.get(API_ENDPOINTS.TASK(id))
  }

  async createTask(data: any) {
    return this.post(API_ENDPOINTS.TASKS, data)
  }

  async updateTask(id: string, data: any) {
    return this.put(API_ENDPOINTS.TASK(id), data)
  }

  async deleteTask(id: string) {
    return this.delete(API_ENDPOINTS.TASK(id))
  }

  async getProjectTasks(projectId: string) {
    return this.get(API_ENDPOINTS.PROJECT_TASKS(projectId))
  }

  // Commit methods
  async getCommits(params?: any) {
    return this.get(API_ENDPOINTS.COMMITS, { params })
  }

  async getCommit(id: string) {
    return this.get(API_ENDPOINTS.COMMIT(id))
  }

  async getProjectCommits(projectId: string) {
    return this.get(API_ENDPOINTS.PROJECT_COMMITS(projectId))
  }

  // Analytics methods
  async getAnalytics(params?: any) {
    return this.get(API_ENDPOINTS.ANALYTICS, { params })
  }

  async getProjectAnalytics(projectId: string) {
    return this.get(API_ENDPOINTS.PROJECT_ANALYTICS(projectId))
  }

  // AI Agent methods
  async debugCode(data: any) {
    return this.post(API_ENDPOINTS.DEBUG_AGENT, data)
  }

  async reviewCode(data: any) {
    return this.post(API_ENDPOINTS.REVIEW_AGENT, data)
  }

  async generateCommitMessage(data: any) {
    return this.post(API_ENDPOINTS.STORYTELLER_AGENT, data)
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.get(API_ENDPOINTS.DASHBOARD_STATS)
  }

  async getActivityFeed() {
    return this.get(API_ENDPOINTS.ACTIVITY_FEED)
  }
}

export const apiClient = new ApiClient()