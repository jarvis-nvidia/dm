'use client'

import { Sidebar } from '../../components/layout/Sidebar'
import { Header } from '../../components/layout/Header'
import { ProtectedRoute } from '../../components/layout/ProtectedRoute'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="pl-64">
          <Header />
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}