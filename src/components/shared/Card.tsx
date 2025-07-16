'use client'

import { motion } from 'framer-motion'
import { CardProps } from '@/types'

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  glow = false 
}) => {
  return (
    <motion.div
      className={`
        bg-white/5 backdrop-blur-md border border-gray-700 rounded-xl p-6
        ${hover ? 'hover:bg-white/10 cursor-pointer' : ''}
        ${glow ? 'shadow-glow' : 'shadow-lg'}
        ${className}
      `}
      whileHover={hover ? { 
        scale: 1.02,
        boxShadow: glow 
          ? "0 0 30px rgba(59, 130, 246, 0.3)" 
          : "0 10px 25px rgba(0, 0, 0, 0.2)"
      } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}