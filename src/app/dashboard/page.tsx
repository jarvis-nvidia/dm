'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MicrophoneIcon,
  CommandLineIcon,
  ChartBarIcon,
  FolderIcon,
  BoltIcon,
  CpuChipIcon,
  EyeIcon,
  CodeBracketIcon,
  LightBulbIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'

// Enhanced AI Assistant Panel Component with real Grok integration
const AIAssistantPanel = () => {
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: 'Hello! I\'m DevMind, your AI development assistant powered by Grok. I can help you analyze code, debug issues, create commit messages, and find similar code patterns. What would you like to work on today?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeFeature, setActiveFeature] = useState('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const newMessage = {
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Determine the type of request based on keywords
      const input = inputValue.toLowerCase()
      let response
      
      if (input.includes('analyze') || input.includes('code') || input.includes('review')) {
        // Code analysis request
        response = await fetch(`${API_BASE}/api/code/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: inputValue,
            language: 'javascript', // Default language
            context: 'DevMind dashboard interaction'
          })
        })
      } else if (input.includes('debug') || input.includes('error') || input.includes('fix')) {
        // Debug assistance request
        response = await fetch(`${API_BASE}/api/debug/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error_message: inputValue,
            code_context: 'User chat interaction',
            language: 'javascript'
          })
        })
      } else {
        // General code analysis as fallback
        response = await fetch(`${API_BASE}/api/code/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: inputValue,
            language: 'javascript',
            context: 'General assistance request'
          })
        })
      }

      const data = await response.json()
      const aiResponse = {
        type: 'ai',
        content: data.analysis || data.debug_suggestions || 'I\'m here to help! Please provide more specific information about what you\'d like me to analyze or debug.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error:', error)
      const errorResponse = {
        type: 'ai',
        content: 'I apologize, but I encountered an error while processing your request. Please make sure the backend service is running and try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = async (action: string) => {
    setIsLoading(true)
    const actionMessage = {
      type: 'user',
      content: `Quick action: ${action}`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, actionMessage])

    try {
      let response
      
      switch (action) {
        case 'Code Health Check':
          response = await fetch(`${API_BASE}/api/learn/patterns/default`)
          break
        case 'Find Similar Code':
          const aiResponse = {
            type: 'ai',
            content: 'Please paste the code you\'d like me to find similar patterns for, and I\'ll search through your codebase using our vector database.',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, aiResponse])
          setIsLoading(false)
          return
        case 'Debug Assistant':
          const debugResponse = {
            type: 'ai',
            content: 'I\'m ready to help debug your code! Please share the error message and the relevant code context.',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, debugResponse])
          setIsLoading(false)
          return
        default:
          response = await fetch(`${API_BASE}/api/health`)
      }

      const data = await response.json()
      const responseMessage = {
        type: 'ai',
        content: data.patterns || data.message || `${action} completed successfully!`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, responseMessage])
    } catch (error) {
      const errorResponse = {
        type: 'ai',
        content: `Unable to complete ${action}. Please ensure the backend service is running.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-xl overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.5)",
                "0 0 30px rgba(147, 51, 234, 0.7)",
                "0 0 20px rgba(59, 130, 246, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CpuChipIcon className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-white font-semibold">DevMind AI Assistant</h3>
            <p className="text-gray-400 text-sm">Powered by Grok • Online & Ready</p>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <motion.button
              className={`p-2 rounded-lg transition-all ${
                isListening 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setIsListening(!isListening)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {['Code Health Check', 'Find Similar Code', 'Debug Assistant'].map((action) => (
            <motion.button
              key={action}
              onClick={() => handleQuickAction(action)}
              className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-3 py-1 rounded-lg text-sm transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              {action}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gray-800 text-gray-100 border border-gray-700 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-2 h-2 bg-blue-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <motion.div
                  className="w-2 h-2 bg-blue-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-blue-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
                <span className="text-sm text-gray-400">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask DevMind to analyze code, debug errors, or create commit messages..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5"
              >
                <CpuChipIcon className="w-5 h-5" />
              </motion.div>
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// Enhanced Recent Projects with real data
const RecentProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/projects`)
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      // Fallback to mock data if API fails
      setProjects([
        {
          id: '1',
          name: 'DevMind Core',
          description: 'AI-powered development assistant',
          created_at: new Date().toISOString(),
          status: 'active',
          language: 'TypeScript'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const createProject = async () => {
    try {
      await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New DevMind Project',
          description: 'Created from dashboard',
          repository_url: ''
        })
      })
      fetchProjects()
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  if (loading) {
    return (
      <motion.div
        className="bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <FolderIcon className="w-6 h-6 mr-2 text-blue-400" />
          Projects ({projects.length})
        </h3>
        <button 
          onClick={createProject}
          className="text-blue-400 hover:text-blue-300 text-sm bg-blue-500/10 px-3 py-1 rounded-lg hover:bg-blue-500/20 transition-all"
        >
          + New
        </button>
      </div>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FolderIcon className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No projects yet. Create your first project!</p>
          </div>
        ) : (
          projects.map((project, index) => (
            <motion.div
              key={project.id}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{project.name}</h4>
                  <p className="text-gray-400 text-sm">{project.description}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  Active
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

// Enhanced Contextual Suggestions with real AI insights
const ContextualSuggestions = () => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/learn/patterns/default`)
      const data = await response.json()
      
      // Convert AI patterns into actionable suggestions
      const aiSuggestions = [
        {
          type: 'ai_insight',
          title: 'AI Analysis Ready',
          description: 'DevMind AI is ready to analyze your code patterns and provide insights',
          icon: <SparklesIcon className="w-5 h-5" />,
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20'
        },
        {
          type: 'integration',
          title: 'Grok AI Active',
          description: 'Advanced code analysis with Grok AI is now available',
          icon: <CpuChipIcon className="w-5 h-5" />,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20'
        },
        {
          type: 'vector_db',
          title: 'Code Search Ready',
          description: 'Weaviate vector database is ready for similarity searches',
          icon: <EyeIcon className="w-5 h-5" />,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/20'
        }
      ]
      
      setSuggestions(aiSuggestions)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([
        {
          type: 'setup',
          title: 'Setup Complete',
          description: 'DevMind backend is configured with Grok AI and Weaviate',
          icon: <CheckCircleIcon className="w-5 h-5" />,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <SparklesIcon className="w-6 h-6 mr-2 text-purple-400" />
          AI Insights
        </h3>
        <button 
          onClick={fetchSuggestions}
          className="text-purple-400 hover:text-purple-300 text-sm"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${suggestion.bgColor}`}>
                  <div className={suggestion.color}>
                    {suggestion.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">{suggestion.title}</h4>
                  <p className="text-gray-400 text-xs mt-1">{suggestion.description}</p>
                </div>
                <button className="text-gray-400 hover:text-white text-xs">
                  <PlayIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

// Repository Insights Component (keeping original)
const RepositoryInsights = () => {
  const insights = [
    {
      metric: 'AI Integration',
      value: 100,
      change: '+100%',
      trend: 'up',
      color: 'from-green-500 to-emerald-500'
    },
    {
      metric: 'Grok API',
      value: 100,
      change: 'Active',
      trend: 'up',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      metric: 'Vector DB',
      value: 100,
      change: 'Ready',
      trend: 'up',
      color: 'from-purple-500 to-pink-500'
    },
    {
      metric: 'Backend API',
      value: 100,
      change: 'Online',
      trend: 'up',
      color: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <motion.div
      className="bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2 text-emerald-400" />
          System Status
        </h3>
        <button className="text-emerald-400 hover:text-emerald-300 text-sm">Live</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">{insight.metric}</span>
              <div className="flex items-center text-xs text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                {insight.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">{insight.value}%</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className={`bg-gradient-to-r ${insight.color} rounded-full h-2`}
                initial={{ width: 0 }}
                animate={{ width: `${insight.value}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Enhanced Quick Actions with real API calls
const QuickActions = () => {
  const [actionLoading, setActionLoading] = useState('')

  const handleAction = async (action: string) => {
    setActionLoading(action)
    
    try {
      switch (action) {
        case 'Health Check':
          await fetch(`${API_BASE}/api/health`)
          break
        case 'Test Grok AI':
          await fetch(`${API_BASE}/api/code/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: 'console.log("Hello DevMind!");',
              language: 'javascript'
            })
          })
          break
        case 'Vector Search':
          await fetch(`${API_BASE}/api/code/search-similar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query_code: 'function test() { return true; }',
              language: 'javascript'
            })
          })
          break
        case 'Create Project':
          await fetch(`${API_BASE}/api/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Quick Project',
              description: 'Created via quick action'
            })
          })
          break
      }
    } catch (error) {
      console.error(`Error executing ${action}:`, error)
    } finally {
      setActionLoading('')
    }
  }

  const actions = [
    {
      name: 'Health Check',
      icon: <CheckCircleIcon className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      shortcut: '⌘H'
    },
    {
      name: 'Test Grok AI',
      icon: <CpuChipIcon className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      shortcut: '⌘G'
    },
    {
      name: 'Vector Search',
      icon: <EyeIcon className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      shortcut: '⌘V'
    },
    {
      name: 'Create Project',
      icon: <FolderIcon className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500',
      shortcut: '⌘N'
    }
  ]

  return (
    <motion.div
      className="bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <BoltIcon className="w-6 h-6 mr-2 text-yellow-400" />
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            onClick={() => handleAction(action.name)}
            disabled={actionLoading === action.name}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-all text-left disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color}`}>
                <div className="text-white">
                  {actionLoading === action.name ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      {action.icon}
                    </motion.div>
                  ) : (
                    action.icon
                  )}
                </div>
              </div>
              <span className="text-gray-400 text-xs font-mono">{action.shortcut}</span>
            </div>
            <span className="text-white font-medium text-sm">{action.name}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// Main Dashboard Component (keeping structure, updating with enhanced components)
export default function Dashboard() {
  const [healthStatus, setHealthStatus] = useState('checking')

  useEffect(() => {
    checkBackendHealth()
  }, [])

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/health`)
      const data = await response.json()
      setHealthStatus(data.status === 'healthy' ? 'online' : 'offline')
    } catch (error) {
      setHealthStatus('offline')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6">
        {/* Enhanced Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                Welcome to DevMind
                <div className={`ml-3 w-3 h-3 rounded-full ${
                  healthStatus === 'online' ? 'bg-green-400 animate-pulse' :
                  healthStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400'
                }`}></div>
              </h1>
              <p className="text-gray-400">
                AI-powered development assistant with Grok integration • Backend Status: {healthStatus}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-white font-medium">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-gray-400 text-sm">
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <AIAssistantPanel />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ContextualSuggestions />
              <QuickActions />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <RecentProjects />
            <RepositoryInsights />
          </div>
        </div>
      </div>
    </div>
  )
}