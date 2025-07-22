'use client'

import { useState } from 'react'
import { useAuth } from '../../../auth/AuthContext'
import { Card } from '../../../components/shared/Card'
import { Button } from '../../../components/shared/Button'
import {
  UserIcon,
  KeyIcon,
  BellIcon,
  CogIcon,
  LinkIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)

  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || '',
  })

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    project_updates: true,
    task_assignments: true,
    code_reviews: true,
  })

  const [integrations, setIntegrations] = useState({
    github: true,
    vscode: false,
    slack: false,
    discord: false,
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'integrations', name: 'Integrations', icon: LinkIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'preferences', name: 'Preferences', icon: CogIcon },
  ]

  const handleProfileSave = () => {
    // TODO: Implement profile update
    console.log('Saving profile:', profile)
    setIsEditing(false)
  }

  const handleNotificationsSave = () => {
    // TODO: Implement notifications update
    console.log('Saving notifications:', notifications)
  }

  const handleIntegrationToggle = (integration: string) => {
    setIntegrations(prev => ({
      ...prev,
      [integration]: !prev[integration as keyof typeof prev]
    }))
  }

  const renderProfileTab = () => (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
        <Button
          variant={isEditing ? 'primary' : 'secondary'}
          onClick={() => isEditing ? handleProfileSave() : setIsEditing(true)}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Avatar URL
          </label>
          <input
            type="url"
            value={profile.avatar_url}
            onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
      </div>
    </Card>
  )

  const renderNotificationsTab = () => (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        <Button onClick={handleNotificationsSave}>
          Save Changes
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 capitalize">
                {key.replace('_', ' ')}
              </label>
              <p className="text-sm text-gray-500">
                Receive notifications for {key.replace('_', ' ').toLowerCase()}
              </p>
            </div>
            <button
              onClick={() => setNotifications({ ...notifications, [key]: !value })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </Card>
  )

  const renderIntegrationsTab = () => (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Integrations</h3>
      </div>

      <div className="space-y-4">
        {Object.entries(integrations).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {key[0].toUpperCase()}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 capitalize">
                  {key}
                </label>
                <p className="text-sm text-gray-500">
                  {value ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <Button
              variant={value ? 'danger' : 'primary'}
              size="sm"
              onClick={() => handleIntegrationToggle(key)}
            >
              {value ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )

  const renderSecurityTab = () => (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Password</h4>
          <Button variant="secondary">
            Change Password
          </Button>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Two-Factor Authentication</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="secondary">
              Enable 2FA
            </Button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">API Keys</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Generate API keys for external integrations
              </p>
            </div>
            <Button variant="secondary">
              Manage Keys
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="text-sm font-medium text-red-600 mb-3">Danger Zone</h4>
          <div className="space-y-3">
            <Button variant="danger" onClick={logout}>
              Sign Out
            </Button>
            <Button variant="danger">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )

  const renderPreferencesTab = () => (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
          </select>
        </div>
      </div>
    </Card>
  )

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'notifications':
        return renderNotificationsTab()
      case 'integrations':
        return renderIntegrationsTab()
      case 'security':
        return renderSecurityTab()
      case 'preferences':
        return renderPreferencesTab()
      default:
        return renderProfileTab()
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  )
}