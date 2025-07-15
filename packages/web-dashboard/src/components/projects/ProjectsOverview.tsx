// File: packages/web-dashboard/src/components/projects/ProjectsOverview.tsx
'use client'

import { Card } from '@/components/shared/Card'
import { Project } from '@/types'
import { useState } from 'react'

export const ProjectsOverview = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Frontend Migration',
      description: 'Migrate legacy frontend to Next.js',
      status: 'active',
      progress: 65,
      createdAt: '2025-07-01T00:00:00Z',
      updatedAt: '2025-07-15T08:10:55Z'
    },
    // Add more sample projects
  ])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map(project => (
        <Card key={project.id} className="hover:shadow-lg transition-shadow">
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                project.status === 'active' ? 'bg-green-100 text-green-800' :
                project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4">{project.description}</p>

            <div className="mt-auto">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 rounded-full h-2"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
