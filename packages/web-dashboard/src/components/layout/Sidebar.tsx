'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  ChartBarIcon,
  CodeBracketIcon,
  ClipboardDocumentListIcon,
  BugAntIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserGroupIcon,
  GitBranchIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/dashboard/projects', icon: CodeBracketIcon },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Commits', href: '/dashboard/commits', icon: GitBranchIcon },
  { name: 'Code Reviews', href: '/dashboard/reviews', icon: BugAntIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Team', href: '/dashboard/team', icon: UserGroupIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

export const Sidebar = () => {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`
      fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-10
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold">DevMind</h1>
              <p className="text-xs text-gray-400">AI Developer Assistant</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-gray-800"
          >
            {collapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 mb-1 rounded-lg transition-colors group
                  ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
                `}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium">{item.name}</span>
                )}
                {collapsed && (
                  <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">U</span>
            </div>
            {!collapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium">User</p>
                <p className="text-xs text-gray-400">Free Plan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}