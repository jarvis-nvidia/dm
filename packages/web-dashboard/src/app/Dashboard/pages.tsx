// File: packages/web-dashboard/src/app/Dashboard/page.tsx
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { ProjectsOverview } from '@/components/projects/ProjectsOverview'

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, kartikgarg18!</h1>
          <p className="text-gray-600">Here's what's happening with your projects.</p>
        </div>
        <Button>Create New Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-medium">Total Projects</h3>
          <p className="text-3xl font-bold mt-2">12</p>
          <p className="text-sm text-green-600 mt-2">↑ 10% from last month</p>
        </Card>

        <Card>
          <h3 className="text-lg font-medium">Active Tasks</h3>
          <p className="text-3xl font-bold mt-2">48</p>
          <p className="text-sm text-blue-600 mt-2">In progress</p>
        </Card>

        <Card>
          <h3 className="text-lg font-medium">Team Members</h3>
          <p className="text-3xl font-bold mt-2">8</p>
          <p className="text-sm text-gray-600 mt-2">Active now</p>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
        <ProjectsOverview />
      </div>
    </div>
  )
}
