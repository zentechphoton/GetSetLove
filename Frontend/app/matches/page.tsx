'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import UserSidebar from '@/components/Layout/UserSidebar'
import { SidebarProvider, useSidebar } from '@/components/Layout/SidebarContext'
import Link from 'next/link'
import api from '@/lib/api'
import { brandColors } from '@/lib/colors'
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  XMarkIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'

interface Match {
  id: string
  matched_user: {
    id: string
    username: string
    email: string
    first_name: string
    last_name: string
    avatar: string
  }
  status: string
  matched_at: string
  chat_id?: string
}

function MatchesPageContent() {
  const router = useRouter()
  const { user, token, initialize, _hasHydrated } = useAuthStore()
  const { isCollapsed } = useSidebar()
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState<Match[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!_hasHydrated) return
    
    if (!token || !user) {
      router.push('/auth/login')
      return
    }
    if (user.role === 'admin' || user.role === 'super_admin') {
      router.push('/admin/dashboard')
      return
    }
    fetchMatches()
  }, [token, user, _hasHydrated, router])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await api.get('/user/matches')
      setMatches(response.data.matches || [])
    } catch (error: any) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter matches based on search and status
  const filteredMatches = matches.filter(match => {
    const matchedUser = match.matched_user
    const fullName = `${matchedUser.first_name || ''} ${matchedUser.last_name || ''}`.trim() || matchedUser.username
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      fullName.toLowerCase().includes(searchLower) ||
      matchedUser.username.toLowerCase().includes(searchLower) ||
      matchedUser.email.toLowerCase().includes(searchLower)
    
    const matchesStatus = filterStatus === 'all' || match.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'unmatched':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-pink-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading your matches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex flex-col w-full">
      <UserSidebar />
      <div className={`flex-1 w-full overflow-y-auto overflow-x-hidden transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 w-full">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
                    <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Your Matches
                  </h1>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 ml-0 sm:ml-12">
                  {matches.length === 0 
                    ? "Start connecting to find your perfect match!"
                    : `You have ${matches.length} ${matches.length === 1 ? 'match' : 'matches'}`
                  }
                </p>
              </div>
            </div>

            {/* Search and Filter Bar - Mobile Optimized */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search matches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-11 pr-9 sm:pr-11 py-2.5 sm:py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Filter Button - Mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden w-full sm:w-auto px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center space-x-2 shadow-sm"
              >
                <FunnelIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Filter</span>
                {filterStatus !== 'all' && (
                  <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs font-semibold">
                    {filterStatus}
                  </span>
                )}
              </button>

              {/* Filter Dropdown - Desktop */}
              <div className="hidden sm:block relative">
                <FunnelIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-9 sm:pl-11 pr-8 sm:pr-10 py-2.5 sm:py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm sm:text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all appearance-none shadow-sm cursor-pointer"
                >
                  <option value="all">All Matches</option>
                  <option value="active">Active</option>
                  <option value="unmatched">Unmatched</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            {/* Mobile Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="sm:hidden mt-3 overflow-hidden"
                >
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-lg">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => {
                          setFilterStatus(e.target.value)
                          setShowFilters(false)
                        }}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="all">All Matches</option>
                        <option value="active">Active</option>
                        <option value="unmatched">Unmatched</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Count */}
          {filteredMatches.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredMatches.length}</span> of {matches.length} matches
              </p>
            </div>
          )}

          {/* Matches Grid - Improved Responsive Design */}
          {filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              <AnimatePresence>
                {filteredMatches.map((match, index) => {
                  const matchedUser = match.matched_user
                  const fullName = `${matchedUser.first_name || ''} ${matchedUser.last_name || ''}`.trim() || matchedUser.username
                  const avatarUrl = matchedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=400&background=9d00ff&color=fff`
                  
                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-gray-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Profile Image Section */}
                      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-indigo-900/20">
                        <img
                          src={avatarUrl}
                          alt={fullName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=400&background=9d00ff&color=fff`
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow-lg ${getStatusColor(match.status)}`}>
                            {match.status}
                          </div>
                        </div>
                        
                        {/* Active Indicator */}
                        {match.status === 'active' && (
                          <div className="absolute top-3 left-3">
                            <div className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Active</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Match Info Section */}
                      <div className="p-4 sm:p-5">
                        <div className="mb-3">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                            {fullName}
                          </h3>
                          {matchedUser.username && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              @{matchedUser.username}
                            </p>
                          )}
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                            <span>Matched {formatDate(match.matched_at)}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <Link
                            href={`/profile/${matchedUser.id}`}
                            className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-105 text-center transform"
                            style={{ background: brandColors.gradients.primary }}
                          >
                            View Profile
                          </Link>
                          {match.chat_id && (
                            <Link
                              href={`/chat?chatId=${match.chat_id}`}
                              className="p-2.5 sm:p-3 rounded-xl border-2 border-gray-200 dark:border-slate-600 hover:border-pink-500 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300 hover:scale-105 transform"
                              title="Start Chat"
                            >
                              <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 sm:py-16 md:py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700"
            >
              {searchQuery || filterStatus !== 'all' ? (
                <>
                  <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                    <MagnifyingGlassIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No matches found
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                    Try adjusting your search or filter criteria to find matches
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilterStatus('all')
                      setShowFilters(false)
                    }}
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-sm font-medium text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 flex items-center justify-center">
                    <HeartIcon className="h-10 w-10 sm:h-12 sm:w-12 text-pink-500 dark:text-pink-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No matches yet
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                    Start discovering to find your perfect match and build meaningful connections!
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold text-white transition-all duration-300 hover:shadow-xl hover:scale-105 transform"
                    style={{ background: brandColors.gradients.primary }}
                  >
                    Go to Dashboard
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MatchesPage() {
  return (
    <SidebarProvider>
      <MatchesPageContent />
    </SidebarProvider>
  )
}
