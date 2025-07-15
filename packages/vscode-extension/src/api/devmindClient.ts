import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { window } from 'vscode';

/**
 * Interface for debug request parameters
 */
export interface DebugRequest {
  problem_description: string;
  code_snippet?: string;
  error_message?: string;
  repository?: string;
  file_path?: string;
  language?: string;
}

/**
 * Interface for review request parameters
 */
export interface ReviewRequest {
  code_diff?: string;
  file_path?: string;
  repository?: string;
  pr_title?: string;
  pr_description?: string;
  language?: string;
}

/**
 * Interface for commit message generation request
 */
export interface StorytellerRequest {
  code_diff: string;
  file_paths?: string[];
  repository?: string;
  message_type?: 'commit' | 'pr_title' | 'pr_description';
}

/**
 * API response interface
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Client for DevMind API
 */
export class DevMindClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;

  /**
   * Create a new DevMind API client
   */
  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      timeout: 30000, // 30 second timeout
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        // Handle API errors
        const errorMessage = error.response?.data?.detail || error.message;
        console.error('DevMind API error:', errorMessage);
        return Promise.reject(errorMessage);
      }
    );
  }

  /**
   * Send a debug request to the DevMind API
   */
  async debugCode(request: DebugRequest): Promise<ApiResponse<{ analysis: string; context_used: boolean }>> {
    try {
      const response = await this.client.post<ApiResponse<{ analysis: string; context_used: boolean }>>(
        '/api/v1/debug',
        request
      );
      return response.data;
    } catch (error) {
      window.showErrorMessage(`DevMind debug failed: ${error}`);
      throw error;
    }
  }

  /**
   * Send a code review request to the DevMind API
   */
  async reviewCode(request: ReviewRequest): Promise<ApiResponse<{ review: string; context_used: boolean }>> {
    try {
      const response = await this.client.post<ApiResponse<{ review: string; context_used: boolean }>>(
        '/api/v1/review',
        request
      );
      return response.data;
    } catch (error) {
      window.showErrorMessage(`DevMind review failed: ${error}`);
      throw error;
    }
  }

  /**
   * Generate a commit message using the DevMind API
   */
  async generateCommitMessage(
    request: StorytellerRequest
  ): Promise<ApiResponse<{ message: string; context_used: boolean }>> {
    try {
      const response = await this.client.post<ApiResponse<{ message: string; context_used: boolean }>>(
        '/api/v1/storyteller',
        request
      );
      return response.data;
    } catch (error) {
      window.showErrorMessage(`DevMind commit message generation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Check health status of the DevMind API
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.data?.status === 'ok';
    } catch (error) {
      console.error('DevMind API health check failed:', error);
      return false;
    }
  }
}

// Export a factory function to create the client
export function createDevMindClient(baseUrl: string, apiKey: string): DevMindClient {
  return new DevMindClient(baseUrl, apiKey);
}
