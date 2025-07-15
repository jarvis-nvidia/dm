// File: packages/web-dashboard/src/app/Dashboard/layout.tsx
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64"> {/* Adjust based on sidebar width */}
        <Header />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
