'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/shared/Button'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (projectData: ProjectFormData) => Promise<void>
}

interface ProjectFormData {
  name: string
  description: string
  startDate: string
  endDate: string
  teamMembers: string[]
}

const availableTeamMembers = [
  { id: '1', name: 'gitkartik21', role: 'Administrator' },
  { id: '2', name: 'johndoe', role: 'Developer' },
  { id: '3', name: 'janedoe', role: 'Designer' },
  { id: '4', name: 'mikebrown', role: 'Developer' },
  { id: '5', name: 'sarahsmith', role: 'Product Manager' },
]

export const CreateProjectModal = ({ isOpen, onClose, onSubmit }: CreateProjectModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0], // Today's date
    endDate: '',
    teamMembers: ['1'] // Default to current user (gitkartik21)
  })
  const [errors, setErrors] = useState<Partial<ProjectFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date'
    }

    if (formData.teamMembers.length === 0) {
      newErrors.teamMembers = 'At least one team member is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error creating project:', error)
      // You could set a general error state here
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  Create New Project
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Fill in the details below to create a new project.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className={`mt-1 block w-full rounded-md border ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    } px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      className={`mt-1 block w-full rounded-md border ${
                        errors.startDate ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      className={`mt-1 block w-full rounded-md border ${
                        errors.endDate ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Team Members
                  </label>
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-gray-300">
                    {availableTeamMembers.map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center px-3 py-2 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={formData.teamMembers.includes(member.id)}
                          onChange={(e) => {
                            const newTeamMembers = e.target.checked
                              ? [...formData.teamMembers, member.id]
                              : formData.teamMembers.filter((id) => id !== member.id)
                            setFormData({ ...formData, teamMembers: newTeamMembers })
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-900">{member.name}</span>
                        <span className="ml-2 text-xs text-gray-500">({member.role})</span>
                      </label>
                    ))}
                  </div>
                  {errors.teamMembers && (
                    <p className="mt-1 text-xs text-red-600">{errors.teamMembers}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <Button
                type="submit"
                variant="primary"
                className="sm:ml-3"
                isLoading={isSubmitting}
              >
                Create Project
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
