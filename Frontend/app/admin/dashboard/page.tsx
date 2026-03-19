'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import AdminSidebar from '@/components/Layout/AdminSidebar'
import { SidebarProvider, useSidebar } from '@/components/Layout/SidebarContext'
import { brandColors } from '@/lib/colors'
import { api } from '@/lib/api'
import {
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'

function AdminDashboardContent() {
  const router = useRouter()
  const { user, token, initialize, _hasHydrated } = useAuthStore()
  const { isCollapsed } = useSidebar()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    reportedProfiles: 0,
    pendingVerifications: 0,
    totalMatches: 0,
    messagesToday: 0,
  })

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!_hasHydrated) {
      return // Wait for hydration
    }
    
    if (!token || !user) {
      router.push('/auth/login')
      return
    }
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/dashboard')
      return
    }
    setLoading(false)
    fetchStats()
  }, [token, user, _hasHydrated, router])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard')
      const statsData = response.data.stats
      
      setStats({
        totalUsers: statsData.total_users || 0,
        activeUsers: statsData.verified_users || 0,
        reportedProfiles: 12, // TODO: Add to backend API
        pendingVerifications: 8, // TODO: Add to backend API
        totalMatches: statsData.total_matches || 0,
        messagesToday: 234, // TODO: Add to backend API
      })
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      // Keep default values on error
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        reportedProfiles: 0,
        pendingVerifications: 0,
        totalMatches: 0,
        messagesToday: 0,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: UserGroupIcon,
      color: 'purple',
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: UsersIcon,
      color: 'green',
      change: '+8%',
      trend: 'up',
    },
    {
      title: 'Reported Profiles',
      value: stats.reportedProfiles,
      icon: ExclamationTriangleIcon,
      color: 'red',
      change: '-3',
      trend: 'down',
      urgent: true,
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingVerifications,
      icon: CheckCircleIcon,
      color: 'yellow',
      change: '+2',
      trend: 'up',
    },
    {
      title: 'Total Matches',
      value: stats.totalMatches.toLocaleString(),
      icon: HeartIcon,
      color: 'pink',
      change: '+15%',
      trend: 'up',
    },
    {
      title: 'Messages Today',
      value: stats.messagesToday.toLocaleString(),
      icon: ChatBubbleLeftRightIcon,
      color: 'blue',
      change: '+23%',
      trend: 'up',
    },
  ]

  const quickActions = [
    { title: 'User Management', href: '/admin/users', icon: UserGroupIcon, color: 'purple' },
    { title: 'View Reports', href: '/admin/reports', icon: ExclamationTriangleIcon, color: 'red' },
    { title: 'Verification Queue', href: '/admin/verifications', icon: ShieldCheckIcon, color: 'yellow' },
    { title: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, color: 'blue' },
    { title: 'Content Moderation', href: '/admin/moderation', icon: PhotoIcon, color: 'orange' },
    { title: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, color: 'blue' },
    { title: 'Settings', href: '/admin/settings', icon: ClockIcon, color: 'gray' },
  ]

  return (
    <div className="h-full bg-gray-50 dark:bg-slate-900 flex flex-col w-full">
      <AdminSidebar />
      <div className={`flex-1 w-full overflow-y-auto overflow-x-hidden transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                Admin Dashboard
                {user?.role === 'super_admin' && (
                  <span className="ml-3 px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    Super Admin
                  </span>
                )}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, {user?.first_name || user?.username}! Manage your dating platform here.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            const colorClasses = {
              purple: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-600 dark:text-purple-400',
              green: 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-600 dark:text-green-400',
              red: 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 text-red-600 dark:text-red-400',
              yellow: 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-600 dark:text-yellow-400',
              pink: 'bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 text-pink-600 dark:text-pink-400',
              blue: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-600 dark:text-blue-400',
            }
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${colorClasses[stat.color as keyof typeof colorClasses]} shadow-md`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {stat.urgent && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse">
                      Urgent
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </p>
                <div className="flex items-center text-sm">
                  {stat.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 dark:text-red-400 mr-1" />
                  )}
                  <span
                    className={`font-semibold ${
                      stat.trend === 'up'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(action.href)}
                  className="flex items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group"
                >
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white mr-4 shadow-md"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                  <span className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{action.title}</span>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="ml-auto text-purple-600 dark:text-purple-400"
                  >
                    →
                  </motion.span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Reports */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
              Recent Reports
            </h2>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        Profile Report #{100 + item}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Inappropriate content reported
                      </p>
                    </div>
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">New</span>
                  </div>
                </div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/admin/reports')}
              className="mt-4 w-full py-2 text-sm font-semibold rounded-lg text-white transition-all duration-300 hover:shadow-lg"
              style={{ background: brandColors.gradients.primary }}
            >
              View All Reports
            </motion.button>
          </div>

          {/* Pending Verifications */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-yellow-500 mr-2" />
              Pending Verifications
            </h2>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        User Verification Request
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Submitted 2 hours ago
                      </p>
                    </div>
                    <button
                      className="px-3 py-1 text-xs font-semibold rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/admin/verifications')}
              className="mt-4 w-full py-2 text-sm font-semibold rounded-lg text-white transition-all duration-300 hover:shadow-lg"
              style={{ background: brandColors.gradients.primary }}
            >
              View All Verifications
            </motion.button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <SidebarProvider>
      <AdminDashboardContent />
    </SidebarProvider>
  )
}

