'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import UserSidebar from '@/components/Layout/UserSidebar'
import { SidebarProvider, useSidebar } from '@/components/Layout/SidebarContext'
import Link from 'next/link'
import { brandColors } from '@/lib/colors'
import api from '@/lib/api'
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  SparklesIcon,
  PhotoIcon,
  FireIcon,
  UserGroupIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

function UserDashboardContent() {
  const router = useRouter()
  const { user, token, initialize, _hasHydrated } = useAuthStore()
  const { isCollapsed } = useSidebar()
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState<any[]>([])
  const [newMessages, setNewMessages] = useState(0)
  const [totalMatches, setTotalMatches] = useState(0)
  const [dashboardData, setDashboardData] = useState<any>(null)

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
    if (user.role === 'admin' || user.role === 'super_admin') {
      router.push('/admin/dashboard')
      return
    }
    setLoading(false)
    fetchDashboardData()
  }, [token, user, _hasHydrated, router])

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard data
      const response = await api.get('/user/dashboard')
      const data = response.data
      
      setDashboardData(data)
      setTotalMatches(data.stats?.total_matches || 0)
      setNewMessages(data.stats?.unread_messages || 0)
      
      // Transform recent matches for display
      const transformedMatches = (data.recent_matches || []).map((match: any) => {
        const matchedUser = match.matched_user
        const firstName = matchedUser?.first_name || matchedUser?.username || 'User'
        const lastName = matchedUser?.last_name || ''
        const fullName = lastName ? `${firstName} ${lastName}` : firstName
        
        return {
          id: match.id,
          user_id: matchedUser?.id,
          name: firstName,
          fullName: fullName,
          username: matchedUser?.username,
          avatar: matchedUser?.avatar,
          image: matchedUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=400&background=9d00ff&color=fff`,
          matched_at: match.matched_at,
          chat_id: match.chat_id,
        }
      })
      
      setMatches(transformedMatches)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set defaults on error
      setMatches([])
      setNewMessages(0)
      setTotalMatches(0)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-slate-900 flex flex-col w-full">
      <UserSidebar />
      <div className={`flex-1 w-full overflow-y-auto overflow-x-hidden transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                Welcome back, {user?.first_name || user?.username}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your perfect match is waiting. Start connecting today!
              </p>
            </div>
            <Link
              href="/matches"
              className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg"
              style={{ background: brandColors.gradients.primary }}
            >
              Start Discovering
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              href="/matches"
              className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl shadow-lg p-6 border border-pink-200 dark:border-pink-800 hover:shadow-xl transition-all duration-300 hover:scale-105 block"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-md">
                  <HeartIcon className="h-6 w-6" />
                </div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{totalMatches}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Total Matches
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">View all matches →</p>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/chat"
              className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all duration-300 hover:scale-105 block"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 text-white shadow-md relative">
                  <ChatBubbleLeftRightIcon className="h-6 w-6" />
                  {newMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {newMessages}
                    </span>
                  )}
                </div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{newMessages}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Messages
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {newMessages > 0 ? `${newMessages} unread messages →` : 'No unread messages →'}
              </p>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/profile"
              className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6 border border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300 hover:scale-105 block"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-400 text-white shadow-md">
                  <UserCircleIcon className="h-6 w-6" />
                </div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">85%</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Profile Complete
              </h3>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: '85%' }}
                />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* New Matches Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FireIcon className="h-5 w-5 text-orange-500 mr-2" />
              Your New Matches
            </h2>
            <Link
              href="/matches"
              className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matches.length > 0 ? matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
              >
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20">
                  <img
                    src={match.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.fullName || match.name)}&size=400&background=9d00ff&color=fff`}
                    alt={match.fullName || match.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.fullName || match.name)}&size=400&background=9d00ff&color=fff`
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                      <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
                        Matched
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {match.fullName || match.name}
                  </h3>
                  {match.username && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">@{match.username}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <Link
                      href={`/profile/${match.user_id || match.id}`}
                      className="flex-1 mr-2 py-2 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg text-center"
                      style={{ background: brandColors.gradients.primary }}
                    >
                      View Profile
                    </Link>
                    {match.chat_id && (
                      <Link
                        href={`/chat?chatId=${match.chat_id}`}
                        className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        title="Start Chat"
                      >
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-3 text-center py-12">
                <HeartIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No matches yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Start discovering to find your perfect match!</p>
                <Link
                  href="/matches"
                  className="mt-4 inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg"
                  style={{ background: brandColors.gradients.primary }}
                >
                  Start Discovering
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/matches"
              className="flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-3">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-center">Discover</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">Find new people</span>
            </Link>

            <Link
              href="/matches"
              className="flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="p-4 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white mb-3">
                <HeartIcon className="h-6 w-6" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-center">Matches</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">View your matches</span>
            </Link>

            <Link
              href="/chat"
              className="flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white mb-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-center">Chat</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">Open chat window</span>
            </Link>

            <Link
              href="/profile"
              className="flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white mb-3">
                <PhotoIcon className="h-6 w-6" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-center">Profile</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">Edit your profile</span>
            </Link>
          </div>
        </div>

        {/* Profile Completion */}
        {!user?.is_verified && (
          <div
            className="p-6 rounded-xl border-2 mb-8"
            style={{
              background: `linear-gradient(135deg, ${brandColors.primary.purple}10 0%, ${brandColors.primary.pink}10 100%)`,
              borderColor: brandColors.primary.purple,
            }}
          >
            <div className="flex items-start">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-4">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Complete Your Profile to Get More Matches!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add photos, write a bio, and set your preferences to increase your chances of finding your perfect match.
                </p>
                <Link
                  href="/profile"
                  className="inline-block px-6 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg"
                  style={{ background: brandColors.gradients.primary }}
                >
                  Complete Profile
                </Link>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default function UserDashboard() {
  return (
    <SidebarProvider>
      <UserDashboardContent />
    </SidebarProvider>
  )
}

