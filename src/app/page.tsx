'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { 
  ChevronDownIcon, 
  PlayIcon,
  CheckIcon,
  StarIcon,
  ArrowRightIcon,
  CodeBracketIcon,
  CpuChipIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  BoltIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// Neural Orb 3D Component
const NeuralOrb = () => {
  const orbRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="relative w-96 h-96 mx-auto">
      <motion.div
        ref={orbRef}
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(147, 51, 234, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.4) 0%, transparent 70%)
          `,
          filter: 'blur(1px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Neural network lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.circle
            key={i}
            cx={200 + Math.cos(i * 30 * Math.PI / 180) * 120}
            cy={200 + Math.sin(i * 30 * Math.PI / 180) * 120}
            r="3"
            fill="rgba(59, 130, 246, 0.8)"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
        
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.line
            key={`line-${i}`}
            x1={200}
            y1={200}
            x2={200 + Math.cos(i * 45 * Math.PI / 180) * 120}
            y2={200 + Math.sin(i * 45 * Math.PI / 180) * 120}
            stroke="rgba(147, 51, 234, 0.3)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        ))}
      </svg>

      {/* Core orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"
        style={{
          boxShadow: `
            0 0 60px rgba(59, 130, 246, 0.5),
            inset 0 0 60px rgba(147, 51, 234, 0.3)
          `
        }}
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 60px rgba(59, 130, 246, 0.5), inset 0 0 60px rgba(147, 51, 234, 0.3)",
            "0 0 80px rgba(147, 51, 234, 0.7), inset 0 0 80px rgba(59, 130, 246, 0.4)",
            "0 0 60px rgba(59, 130, 246, 0.5), inset 0 0 60px rgba(147, 51, 234, 0.3)"
          ]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}

// Sticky Navigation
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-800' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <CpuChipIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DevMind</span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            {['Features', 'Pricing', 'About'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-300 hover:text-white transition-colors"
                whileHover={{ y: -2 }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              className="text-gray-300 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
            <motion.button
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

// Hero Section
const HeroSection = () => {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        style={{ y, opacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <NeuralOrb />
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Your AI Dev Assistant
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Experience the future of development with DevMind - an intelligent assistant that understands your code, anticipates your needs, and accelerates your workflow.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all flex items-center space-x-2"
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" 
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Start Building</span>
            <ArrowRightIcon className="w-5 h-5" />
          </motion.button>

          <motion.button
            className="border border-gray-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-all flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlayIcon className="w-5 h-5" />
            <span>Watch Demo</span>
          </motion.button>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDownIcon className="w-8 h-8 text-gray-400" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: <CodeBracketIcon className="w-8 h-8" />,
      title: "Intelligent Code Analysis",
      description: "Advanced AI that understands your codebase structure, patterns, and potential improvements.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <LightBulbIcon className="w-8 h-8" />,
      title: "Smart Suggestions",
      description: "Contextual recommendations that adapt to your coding style and project requirements.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <BoltIcon className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Optimized performance that keeps up with your development speed without interruption.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      title: "Security First",
      description: "Built-in security analysis and vulnerability detection to keep your code safe.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <EyeIcon className="w-8 h-8" />,
      title: "Deep Insights",
      description: "Comprehensive analytics and metrics to understand your development patterns.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <CpuChipIcon className="w-8 h-8" />,
      title: "Neural Processing",
      description: "Advanced neural networks that learn from your preferences and improve over time.",
      color: "from-pink-500 to-rose-500"
    }
  ]

  return (
    <section id="features" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powered by Advanced AI
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the next generation of development tools with features designed to enhance your productivity and code quality.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
              }}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 text-white`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Pricing Section
const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for individual developers",
      features: [
        "Basic code analysis",
        "5 projects",
        "Community support",
        "Standard suggestions"
      ],
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For professional developers",
      features: [
        "Advanced AI analysis",
        "Unlimited projects",
        "Priority support",
        "Custom integrations",
        "Team collaboration",
        "Advanced insights"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large teams and organizations",
      features: [
        "Everything in Pro",
        "Custom AI training",
        "Dedicated support",
        "On-premise deployment",
        "Advanced security",
        "SLA guarantee"
      ],
      popular: false
    }
  ]

  return (
    <section id="pricing" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start free and scale as you grow. All plans include our core AI features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative bg-gray-900 border rounded-xl p-8 ${
                plan.popular 
                  ? 'border-purple-500 ring-2 ring-purple-500/20' 
                  : 'border-gray-700'
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400">{plan.period}</span>}
                </div>
                <p className="text-gray-300">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-300">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// About Section
const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Built for Developers, by Developers
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              DevMind was created by a team of passionate developers who understand the challenges of modern software development. We've built an AI assistant that truly understands code and helps you write better software faster.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">1M+</div>
                <div className="text-gray-300">Lines Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">50K+</div>
                <div className="text-gray-300">Developers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">99.9%</div>
                <div className="text-gray-300">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
                <div className="text-gray-300">Support</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="font-mono text-sm">
                <div className="text-purple-400">// DevMind AI Assistant</div>
                <div className="text-gray-300 mt-2">
                  <span className="text-blue-400">const</span> devMind = <span className="text-yellow-400">new</span> <span className="text-green-400">AIAssistant</span>({
                </div>
                <div className="text-gray-300 ml-4">
                  intelligence: <span className="text-orange-400">'advanced'</span>,
                </div>
                <div className="text-gray-300 ml-4">
                  understanding: <span className="text-orange-400">'contextual'</span>,
                </div>
                <div className="text-gray-300 ml-4">
                  performance: <span className="text-orange-400">'lightning-fast'</span>
                </div>
                <div className="text-gray-300">});</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Main Landing Page Component
export default function LandingPage() {
  return (
    <div className="bg-black text-white overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <AboutSection />
      
      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <CpuChipIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">DevMind</span>
            </div>
            <p className="text-gray-400 mb-6">
              The future of AI-powered development is here.
            </p>
            <div className="flex justify-center space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}