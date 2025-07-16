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
  SparklesIcon
} from '@heroicons/react/24/outline'

// AI Assistant Panel Component
const AIAssistantPanel = () => {
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: 'Hello! I\'m DevMind, your AI development assistant. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage = {
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        type: 'ai',
        content: 'I understand you need help with that. Let me analyze your code and provide some suggestions...',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  return (
    <motion.div
      className="bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-xl overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
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
            <p className="text-gray-400 text-sm">Online • Ready to help</p>
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
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask DevMind anything..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <motion.button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// Recent Projects Component
const RecentProjects = () => {
  const projects = [
    {
      name: 'E-commerce Platform',
      status: 'active',
      progress: 78,
      lastCommit: '2 hours ago',
      language: 'TypeScript',
      issues: 3,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Mobile App Backend',
      status: 'review',
      progress: 92,
      lastCommit: '1 day ago',
      language: 'Python',
      issues: 1,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Analytics Dashboard',
      status: 'planning',
      progress: 34,
      lastCommit: '3 days ago',
      language: 'React',
      issues: 7,
      color: 'from-purple-500 to-pink-500'
    }
  ]

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
          Recent Projects
        </h3>
        <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
      </div>

      <div className="space-y-4">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-all cursor-pointer"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-white font-medium">{project.name}</h4>
                <p className="text-gray-400 text-sm">{project.language} • {project.lastCommit}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  project.status === 'review' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {project.status}
                </span>
                {project.issues > 0 && (
                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
                    {project.issues} issues
                  </span>
                )}
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`bg-gradient-to-r ${project.color} rounded-full h-2`}
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Contextual Suggestions Component
const ContextualSuggestions = () => {
  const suggestions = [
    {
      type: 'optimization',
      title: 'Performance Optimization',
      description: 'Your API response time can be improved by 40% with caching',
      icon: <BoltIcon className="w-5 h-5" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      type: 'security',
      title: 'Security Enhancement',
      description: 'Consider adding rate limiting to your authentication endpoints',
      icon: <ExclamationTriangleIcon className="w-5 h-5" />,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    },
    {
      type: 'refactor',
      title: 'Code Refactoring',
      description: 'Extract common logic into reusable utility functions',
      icon: <CodeBracketIcon className="w-5 h-5" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      type: 'feature',
      title: 'Feature Suggestion',
      description: 'Add error boundary components for better error handling',
      icon: <LightBulbIcon className="w-5 h-5" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    }
  ]

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
          AI Suggestions
        </h3>
        <button className="text-purple-400 hover:text-purple-300 text-sm">Refresh</button>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
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
              <button className="text-gray-400 hover:text-white text-xs">Apply</button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Repository Insights Component
const RepositoryInsights = () => {
  const insights = [
    {
      metric: 'Code Quality',
      value: 94,
      change: '+5%',
      trend: 'up',
      color: 'from-green-500 to-emerald-500'
    },
    {
      metric: 'Test Coverage',
      value: 87,
      change: '+12%',
      trend: 'up',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      metric: 'Performance Score',
      value: 91,
      change: '-2%',
      trend: 'down',
      color: 'from-purple-500 to-pink-500'
    },
    {
      metric: 'Security Rating',
      value: 96,
      change: '+8%',
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
          Repository Insights
        </h3>
        <button className="text-emerald-400 hover:text-emerald-300 text-sm">View Details</button>
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
              <div className={`flex items-center text-xs ${
                insight.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                <ArrowTrendingUpIcon className={`w-3 h-3 mr-1 ${
                  insight.trend === 'down' ? 'rotate-180' : ''
                }`} />
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

// Quick Actions Component
const QuickActions = () => {
  const actions = [
    {
      name: 'Run Tests',
      icon: <CheckCircleIcon className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      shortcut: '⌘T'
    },
    {
      name: 'Deploy',
      icon: <BoltIcon className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      shortcut: '⌘D'
    },
    {
      name: 'Analyze Code',
      icon: <EyeIcon className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      shortcut: '⌘A'
    },
    {
      name: 'Terminal',
      icon: <CommandLineIcon className="w-5 h-5" />,
      color: 'from-gray-500 to-gray-600',
      shortcut: '⌘`'
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
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-all text-left"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color}`}>
                <div className="text-white">
                  {action.icon}
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

// Main Dashboard Component
export default function Dashboard() {
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
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, Developer
              </h1>
              <p className="text-gray-400">
                Your AI assistant is ready to help you build amazing things.
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