// File: packages/web-dashboard/src/components/layout/Header.tsx
'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline'

export const Header = () => {
  const [notifications, setNotifications] = useState<number>(3)

  return (
    <header className="h-16 px-4 border-b border-gray-200 flex items-center justify-between bg-white">
      <div className="flex items-center">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <BellIcon className="h-6 w-6 text-gray-600" />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
