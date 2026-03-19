'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  MapPinIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface UserSettings {
  id?: string
  user_id?: string
  show_age: boolean
  show_location: boolean
  show_distance: boolean
  show_online_status: boolean
  min_age: number
  max_age: number
  max_distance: number
  show_me_to: string
  discoverable: boolean
  email_notifications: boolean
  push_notifications: boolean
  new_match_notifications: boolean
  message_notifications: boolean
  like_notifications: boolean
  read_receipts: boolean
  show_last_seen: boolean
  blocked_users: string
  language: string
  timezone: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    show_age: true,
    show_location: true,
    show_distance: true,
    show_online_status: true,
    min_age: 18,
    max_age: 99,
    max_distance: 50,
    show_me_to: 'everyone',
    discoverable: true,
    email_notifications: true,
    push_notifications: true,
    new_match_notifications: true,
    message_notifications: true,
    like_notifications: true,
    read_receipts: true,
    show_last_seen: true,
    blocked_users: '',
    language: 'en',
    timezone: 'UTC',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/user/settings')
      setSettings(response.data)
    } catch (error: any) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      // Only send the fields that can be updated (exclude id, user_id, created_at, updated_at)
      const updateData = {
        show_age: settings.show_age,
        show_location: settings.show_location,
        show_distance: settings.show_distance,
        show_online_status: settings.show_online_status,
        min_age: settings.min_age,
        max_age: settings.max_age,
        max_distance: settings.max_distance,
        show_me_to: settings.show_me_to,
        discoverable: settings.discoverable,
        email_notifications: settings.email_notifications,
        push_notifications: settings.push_notifications,
        new_match_notifications: settings.new_match_notifications,
        message_notifications: settings.message_notifications,
        like_notifications: settings.like_notifications,
        read_receipts: settings.read_receipts,
        show_last_seen: settings.show_last_seen,
        blocked_users: settings.blocked_users || '',
        language: settings.language,
        timezone: settings.timezone,
      }
      const response = await api.put('/user/settings', updateData)
      setSettings(response.data)
      toast.success('Settings saved successfully!')
    } catch (error: any) {
      console.error('Error saving settings:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save settings'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'discovery', name: 'Discovery', icon: MagnifyingGlassIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Privacy', icon: ShieldCheckIcon },
    { id: 'account', name: 'Account', icon: Cog6ToothIcon },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and privacy settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                      isActive
                        ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6"
            >
              {/* Profile Visibility Settings */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <EyeIcon className="h-6 w-6 mr-2 text-pink-600" />
                      Profile Visibility
                    </h2>
                    <div className="space-y-4">
                      <ToggleSetting
                        label="Show Age"
                        description="Display your age on your profile"
                        value={settings.show_age}
                        onChange={(val) => updateSetting('show_age', val)}
                      />
                      <ToggleSetting
                        label="Show Location"
                        description="Display your location on your profile"
                        value={settings.show_location}
                        onChange={(val) => updateSetting('show_location', val)}
                      />
                      <ToggleSetting
                        label="Show Distance"
                        description="Show distance to other users"
                        value={settings.show_distance}
                        onChange={(val) => updateSetting('show_distance', val)}
                      />
                      <ToggleSetting
                        label="Show Online Status"
                        description="Let others see when you're online"
                        value={settings.show_online_status}
                        onChange={(val) => updateSetting('show_online_status', val)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Discovery Settings */}
              {activeTab === 'discovery' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <MagnifyingGlassIcon className="h-6 w-6 mr-2 text-pink-600" />
                      Discovery Preferences
                    </h2>
                    <div className="space-y-6">
                      <ToggleSetting
                        label="Discoverable"
                        description="Allow others to find you in discovery"
                        value={settings.discoverable}
                        onChange={(val) => updateSetting('discoverable', val)}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <NumberSetting
                          label="Minimum Age"
                          description="Minimum age of matches"
                          value={settings.min_age}
                          onChange={(val) => updateSetting('min_age', val)}
                          min={18}
                          max={99}
                        />
                        <NumberSetting
                          label="Maximum Age"
                          description="Maximum age of matches"
                          value={settings.max_age}
                          onChange={(val) => updateSetting('max_age', val)}
                          min={18}
                          max={99}
                        />
                      </div>
                      <NumberSetting
                        label="Maximum Distance (km)"
                        description="Maximum distance for matches"
                        value={settings.max_distance}
                        onChange={(val) => updateSetting('max_distance', val)}
                        min={1}
                        max={500}
                      />
                      <SelectSetting
                        label="Show Me To"
                        description="Who can see your profile"
                        value={settings.show_me_to}
                        onChange={(val) => updateSetting('show_me_to', val)}
                        options={[
                          { value: 'everyone', label: 'Everyone' },
                          { value: 'matches', label: 'Matches Only' },
                          { value: 'premium', label: 'Premium Users Only' },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <BellIcon className="h-6 w-6 mr-2 text-pink-600" />
                      Notification Preferences
                    </h2>
                    <div className="space-y-4">
                      <ToggleSetting
                        label="Email Notifications"
                        description="Receive notifications via email"
                        value={settings.email_notifications}
                        onChange={(val) => updateSetting('email_notifications', val)}
                      />
                      <ToggleSetting
                        label="Push Notifications"
                        description="Receive push notifications"
                        value={settings.push_notifications}
                        onChange={(val) => updateSetting('push_notifications', val)}
                      />
                      <ToggleSetting
                        label="New Match Notifications"
                        description="Get notified when you have a new match"
                        value={settings.new_match_notifications}
                        onChange={(val) => updateSetting('new_match_notifications', val)}
                        icon={HeartIcon}
                      />
                      <ToggleSetting
                        label="Message Notifications"
                        description="Get notified when you receive messages"
                        value={settings.message_notifications}
                        onChange={(val) => updateSetting('message_notifications', val)}
                        icon={ChatBubbleLeftRightIcon}
                      />
                      <ToggleSetting
                        label="Like Notifications"
                        description="Get notified when someone likes you"
                        value={settings.like_notifications}
                        onChange={(val) => updateSetting('like_notifications', val)}
                        icon={HeartIcon}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <ShieldCheckIcon className="h-6 w-6 mr-2 text-pink-600" />
                      Privacy & Security
                    </h2>
                    <div className="space-y-4">
                      <ToggleSetting
                        label="Read Receipts"
                        description="Let others know when you've read their messages"
                        value={settings.read_receipts}
                        onChange={(val) => updateSetting('read_receipts', val)}
                      />
                      <ToggleSetting
                        label="Show Last Seen"
                        description="Display when you were last active"
                        value={settings.show_last_seen}
                        onChange={(val) => updateSetting('show_last_seen', val)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Cog6ToothIcon className="h-6 w-6 mr-2 text-pink-600" />
                      Account Settings
                    </h2>
                    <div className="space-y-4">
                      <SelectSetting
                        label="Language"
                        description="Choose your preferred language"
                        value={settings.language}
                        onChange={(val) => updateSetting('language', val)}
                        options={[
                          { value: 'en', label: 'English' },
                          { value: 'es', label: 'Spanish' },
                          { value: 'fr', label: 'French' },
                          { value: 'de', label: 'German' },
                          { value: 'it', label: 'Italian' },
                        ]}
                      />
                      <SelectSetting
                        label="Timezone"
                        description="Select your timezone"
                        value={settings.timezone}
                        onChange={(val) => updateSetting('timezone', val)}
                        options={[
                          { value: 'UTC', label: 'UTC' },
                          { value: 'America/New_York', label: 'Eastern Time (ET)' },
                          { value: 'America/Chicago', label: 'Central Time (CT)' },
                          { value: 'America/Denver', label: 'Mountain Time (MT)' },
                          { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                          { value: 'Europe/London', label: 'London (GMT)' },
                          { value: 'Europe/Paris', label: 'Paris (CET)' },
                          { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 flex justify-end">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Toggle Setting Component
function ToggleSetting({
  label,
  description,
  value,
  onChange,
  icon: Icon,
}: {
  label: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
      <div className="flex items-start space-x-3 flex-1">
        {Icon && <Icon className="h-5 w-5 text-pink-600 mt-0.5" />}
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
            {label}
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-2 ${
          value ? 'bg-pink-600' : 'bg-gray-200 dark:bg-slate-600'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            value ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

// Number Setting Component
function NumberSetting({
  label,
  description,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  description: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
}) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700">
      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
        {label}
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const val = parseInt(e.target.value)
            if (!isNaN(val) && val >= min && val <= max) {
              onChange(val)
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 focus:border-transparent"
        />
      </div>
    </div>
  )
}

// Select Setting Component
function SelectSetting({
  label,
  description,
  value,
  onChange,
  options,
}: {
  label: string
  description: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700">
      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
        {label}
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

