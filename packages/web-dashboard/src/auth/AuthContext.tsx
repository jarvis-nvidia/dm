'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '../lib/api'
import { User, AuthState } from '../types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  signup: (userData: any) => Promise<void>
  logout: () => Promise<void>
  loginWithGitHub: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        const response = await apiClient.getMe()
        if (response.success && response.data) {
          setAuthState({
            user: response.data as User,
            loading: false,
            error: null,
          })
        } else {
          // Token is invalid
          localStorage.removeItem('auth_token')
          setAuthState({
            user: null,
            loading: false,
            error: null,
          })
        }
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null,
        })
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      localStorage.removeItem('auth_token')
      setAuthState({
        user: null,
        loading: false,
        error: 'Failed to initialize authentication',
      })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await apiClient.login(email, password)
      
      if (response.success && response.data) {
        const { access_token, user } = response.data as any
        
        // Store token
        localStorage.setItem('auth_token', access_token)
        
        setAuthState({
          user: user as User,
          loading: false,
          error: null,
        })
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setAuthState({
        user: null,
        loading: false,
        error: error.message || 'Login failed',
      })
      throw error
    }
  }

  const signup = async (userData: any) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await apiClient.signup(userData)
      
      if (response.success && response.data) {
        const { access_token, user } = response.data as any
        
        // Store token
        localStorage.setItem('auth_token', access_token)
        
        setAuthState({
          user: user as User,
          loading: false,
          error: null,
        })
      } else {
        throw new Error(response.message || 'Signup failed')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      setAuthState({
        user: null,
        loading: false,
        error: error.message || 'Signup failed',
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      setAuthState({
        user: null,
        loading: false,
        error: null,
      })
    }
  }

  const loginWithGitHub = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await apiClient.loginWithGitHub()
      
      if (response.success && response.data) {
        const { authorization_url } = response.data as any
        // Redirect to GitHub OAuth
        window.location.href = authorization_url
      } else {
        throw new Error(response.message || 'GitHub login failed')
      }
    } catch (error: any) {
      console.error('GitHub login error:', error)
      setAuthState({
        user: null,
        loading: false,
        error: error.message || 'GitHub login failed',
      })
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      const response = await apiClient.getMe()
      if (response.success && response.data) {
        setAuthState(prev => ({
          ...prev,
          user: response.data as User,
        }))
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        loginWithGitHub,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}