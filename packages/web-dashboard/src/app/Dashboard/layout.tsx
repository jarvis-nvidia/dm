import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="pl-64"> {/* Adjust based on sidebar width */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
