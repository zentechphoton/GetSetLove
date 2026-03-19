'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import AdminSidebar from '@/components/Layout/AdminSidebar'
import { SidebarProvider, useSidebar } from '@/components/Layout/SidebarContext'
import toast from 'react-hot-toast'
import { brandColors } from '@/lib/colors'
import {
  UserCircleIcon,
  ShieldCheckIcon,
  KeyIcon,
  BellIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

function AdminProfileContent() {
  const router = useRouter()
  const { user, token, initialize } = useAuthStore()
  const { isCollapsed } = useSidebar()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    initialize()
    if (!token || !user) {
      router.push('/auth/login')
      return
    }
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/profile')
      return
    }
    setLoading(false)
    setFormData({
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
  }, [token, user, router, initialize])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Update admin profile via API
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    try {
      // TODO: Change password via API
      toast.success('Password changed successfully!')
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', name: 'Profile Settings', icon: UserCircleIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'permissions', name: 'Permissions', icon: KeyIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
  ]

  return (
    <div className="h-full bg-gray-50 dark:bg-slate-900 flex flex-col w-full">
      <AdminSidebar />
      <div className={`flex-1 w-full overflow-y-auto overflow-x-hidden transition-all duration-300 ${isCollapsed ? 'md:pl-20' : 'md:pl-72'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your admin account settings and permissions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              {/* Admin Info */}
              <div className="text-center mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-3">
                  <UserCircleIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{user?.first_name || user?.username}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>

              {/* Tabs */}
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'text-white shadow-lg'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                      style={isActive ? { background: brandColors.gradients.primary } : {}}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Admin Stats */}
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                Admin Stats
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Actions Today</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Reports Resolved</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Users Verified</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                        style={{ borderColor: brandColors.primary.purple + '40' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                        style={{ borderColor: brandColors.primary.purple + '40' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                        style={{ borderColor: brandColors.primary.purple + '40' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                        style={{ borderColor: brandColors.primary.purple + '40' }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg"
                    style={{ background: brandColors.gradients.primary }}
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                      style={{ borderColor: brandColors.primary.purple + '40' }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                        style={{ borderColor: brandColors.primary.purple + '40' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                        style={{ borderColor: brandColors.primary.purple + '40' }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg"
                    style={{ background: brandColors.gradients.primary }}
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {/* Permissions */}
            {activeTab === 'permissions' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Admin Permissions</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                        <span className="font-semibold text-gray-900 dark:text-white">User Management</span>
                      </div>
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">Enabled</span>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                        <span className="font-semibold text-gray-900 dark:text-white">Content Moderation</span>
                      </div>
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">Enabled</span>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                        <span className="font-semibold text-gray-900 dark:text-white">Report Management</span>
                      </div>
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">Enabled</span>
                    </div>
                  </div>
                  {user?.role === 'super_admin' && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ShieldCheckIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                          <span className="font-semibold text-gray-900 dark:text-white">Super Admin Access</span>
                        </div>
                        <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Full Access</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Notification Settings</h2>
                <div className="space-y-4">
                  {[
                    { name: 'New Reports', desc: 'Get notified when users report profiles' },
                    { name: 'Verification Requests', desc: 'Receive alerts for pending verifications' },
                    { name: 'System Alerts', desc: 'Important system notifications' },
                    { name: 'User Activity', desc: 'Daily summary of user activity' },
                  ].map((notif, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{notif.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{notif.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminProfile() {
  return (
    <SidebarProvider>
      <AdminProfileContent />
    </SidebarProvider>
  )
}

