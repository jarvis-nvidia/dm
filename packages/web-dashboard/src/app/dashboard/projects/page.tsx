'use client'

import { ProjectsOverview } from '../../../components/projects/ProjectsOverview'

export default function ProjectsPage() {
  return (
    <div>
      <ProjectsOverview limit={50} showCreateButton={true} />
    </div>
  )
}