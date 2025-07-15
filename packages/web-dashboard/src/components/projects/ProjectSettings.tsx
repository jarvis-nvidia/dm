'use client'

import { useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import {
  KeyIcon,
  BellIcon,
  UsersIcon,
  CogIcon,
  ShieldCheckIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface ProjectSettings {
  notifications: {
    pullRequests: boolean
    mentions: boolean
    reviews: boolean
    builds: boolean
  }
  security: {
    requireApproval: boolean
    enforceHttps: boolean
    twoFactorAuth: boolean
  }
  access: {
    public: boolean
    restrictedBranches: string[]
  }
}

const defaultSettings: ProjectSettings = {
  notifications: {
    pullRequests: true,
    mentions: true,
    reviews: true,
    builds: false
  },
  security: {
    requireApproval: true,
    enforceHttps: true,
    twoFactorAuth: true
  },
  access: {
    public: false,
    restrictedBranches: ['main', 'production']
  }
}

export const ProjectSettings = () => {
  const [settings, setSettings] = useState<ProjectSettings>(defaultSettings)
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'access'>('general')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsEditing(false)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Project Name</h4>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                defaultValue="DevMind Dashboard"
                disabled={!isEditing}
              />
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Description</h4>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                defaultValue="Modern dashboard for development insights and project management"
                disabled={!isEditing}
              />
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Repository URL</h4>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-3 text-gray-500 sm:text-sm">
                  https://github.com/
                </span>
                <input
                  type="text"
                  className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  defaultValue="gitkartik21/DevMind"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Default Branch</h4>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                defaultValue="main"
                disabled={!isEditing}
              >
                <option value="main">main</option>
                <option value="master">master</option>
                <option value="develop">develop</option>
              </select>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Receive notifications for {key.toLowerCase()}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={value}
                    onChange={() => {
                      if (isEditing) {
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            [key]: !value
                          }
                        })
                      }
                    }}
                    disabled={!isEditing}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            {Object.entries(settings.security).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {key.replace(/([A-Z])/g, ' $1').charAt(0).toUpperCase() + key.slice(1)}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {key === 'requireApproval' && 'Require approval before merging'}
                    {key === 'enforceHttps' && 'Enforce HTTPS for all connections'}
                    {key === 'twoFactorAuth' && 'Require two-factor authentication'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={value}
                    onChange={() => {
                      if (isEditing) {
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            [key]: !value
                          }
                        })
                      }
                    }}
                    disabled={!isEditing}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}

            <div>
              <h4 className="text-sm font-medium text-gray-900">Restricted Branches</h4>
              <div className="mt-2 space-y-2">
                {settings.access.restrictedBranches.map((branch, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      value={branch}
                      disabled={!isEditing}
                      onChange={(e) => {
                        if (isEditing) {
                          const newBranches = [...settings.access.restrictedBranches]
                          newBranches[index] = e.target.value
                          setSettings({
                            ...settings,
                            access: {
                              ...settings.access,
                              restrictedBranches: newBranches
                            }
                          })
                        }
                      }}
                    />
                    {isEditing && (
                      <Button
                        variant="danger"
                        onClick={() => {
                          const newBranches = settings.access.restrictedBranches.filter((_, i) => i !== index)
                          setSettings({
                            ...settings,
                            access: {
                              ...settings.access,
                              restrictedBranches: newBranches
                            }
                          })
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSettings({
                        ...settings,
                        access: {
                          ...settings.access,
                          restrictedBranches: [...settings.access.restrictedBranches, '']
                        }
                      })
                    }}
                  >
                    Add Branch
                  </Button>
                )}
              </div>
            </div>
          </div>
        )

      case 'access':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Repository Visibility</h4>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-primary-600"
                    checked={settings.access.public}
                    onChange={() => {
                      if (isEditing) {
                        setSettings({
                          ...settings,
                          access: {
                            ...settings.access,
                            public: true
                          }
                        })
                      }
                    }}
                    disabled={!isEditing}
                  />
                  <span className="ml-2 text-sm text-gray-700">Public</span>
                </label>
                <label className="ml-6 inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-primary-600"
                    checked={!settings.access.public>}
                    onChange={() => {
                      if (isEditing) {
                        setSettings({
                          ...settings,
                          access: {
                            ...settings.access,
                            public: false
                          }
                        })
                      }
                    }}
                    disabled={!isEditing}
                  />
                  <span className="ml-2 text-sm text-gray-700">Private</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Danger Zone</h4>
              <div className="mt-2 rounded-md border border-red-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-red-700">Delete Project</h5>
                    <p className="text-xs text-red-600">
                      Once you delete a project, there is no going back.
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    disabled={!isEditing}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this project?')) {
                        // Handle project deletion
                      }
                    }}
                  >
                    Delete Project
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Project Settings</h3>
          <div className="space-x-2">
            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Settings
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'general'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('general')}
        >
          <CogIcon className="h-5 w-5 inline-block mr-1" />
          General
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'notifications'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('notifications')}
        >
          <BellIcon className="h-5 w-5 inline-block mr-1" />
          Notifications
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'security'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('security')}
        >
          <ShieldCheckIcon className="h-5 w-5 inline-block mr-1" />
          Security
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'access'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('access')}
        >
          <KeyIcon className="h-5 w-5 inline-block mr-1" />
          Access
        </button>
      </div>

      <div className="p-4">{renderTabContent()}</div>
    </Card>
  )
}
