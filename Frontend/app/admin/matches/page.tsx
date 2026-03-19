'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import AdminSidebar from '@/components/Layout/AdminSidebar'
import { SidebarProvider, useSidebar } from '@/components/Layout/SidebarContext'
import { api } from '@/lib/api'
import { brandColors } from '@/lib/colors'
import toast from 'react-hot-toast'
import {
  HeartIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  avatar: string
}

interface Match {
  id: string
  user1_id: string
  user2_id: string
  user1: User
  user2: User
  status: string
  matched_at: string
  chat_id?: string
}

export default function AdminMatchesPage() {
  return (
    <SidebarProvider>
      <AdminMatchesContent />
    </SidebarProvider>
  )
}

function AdminMatchesContent() {
  const router = useRouter()
  const { user, token, _hasHydrated } = useAuthStore()
  const { isCollapsed } = useSidebar()
  const [matches, setMatches] = useState<Match[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUser1, setSelectedUser1] = useState<User | null>(null)
  const [selectedUser2, setSelectedUser2] = useState<User | null>(null)
  const [creatingMatch, setCreatingMatch] = useState(false)
  const [deletingMatchId, setDeletingMatchId] = useState<string | null>(null)

  useEffect(() => {
    if (!_hasHydrated) return
    if (!token || !user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/auth/login')
      return
    }
    fetchData()
  }, [token, user, _hasHydrated, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersRes, matchesRes] = await Promise.all([
        api.get('/admin/users?limit=100'),
        api.get('/admin/matches?limit=100'),
      ])
      setUsers(usersRes.data.users || [])
      setMatches(matchesRes.data.matches || [])
    } catch (error: any) {
      console.error('Error fetching data:', error)
      if (error.response?.status === 404) {
        // Matches endpoint might not exist yet, just fetch users
        const usersRes = await api.get('/admin/users?limit=100')
        setUsers(usersRes.data.users || [])
        setMatches([])
      } else {
        toast.error('Failed to load data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMatch = async () => {
    if (!selectedUser1 || !selectedUser2) {
      toast.error('Please select both users')
      return
    }

    if (selectedUser1.id === selectedUser2.id) {
      toast.error('Cannot create a match with the same user')
      return
    }

    try {
      setCreatingMatch(true)
      const fullUrl = `${api.defaults.baseURL}/admin/matches`
      console.log('Creating match between:', selectedUser1.id, selectedUser2.id)
      console.log('Full API URL:', fullUrl)
      console.log('Request payload:', { user1_id: selectedUser1.id, user2_id: selectedUser2.id })
      
      const response = await api.post('/admin/matches', {
        user1_id: selectedUser1.id,
        user2_id: selectedUser2.id,
      })
      console.log('Match created successfully:', response.data)
      toast.success(`Match created between ${selectedUser1.username} and ${selectedUser2.username}!`)
      setShowCreateModal(false)
      setSelectedUser1(null)
      setSelectedUser2(null)
      fetchData()
    } catch (error: any) {
      console.error('Error creating match:', error)
      console.error('Error response:', error.response?.data)
      const errorMsg = error.response?.data?.error || error.message || 'Failed to create match'
      toast.error(`Failed to create match: ${errorMsg}`, {
        duration: 5000,
      })
    } finally {
      setCreatingMatch(false)
    }
  }

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingMatchId(matchId)
      await api.delete(`/admin/matches/${matchId}`)
      toast.success('Match deleted successfully')
      fetchData()
    } catch (error: any) {
      console.error('Error deleting match:', error)
      const errorMsg = error.response?.data?.error || 'Failed to delete match'
      toast.error(errorMsg)
    } finally {
      setDeletingMatchId(null)
    }
  }

  const handleSelectUser = (user: User, position: 1 | 2) => {
    if (position === 1) {
      setSelectedUser1(user)
    } else {
      setSelectedUser2(user)
    }
  }

  const filteredUsers = users.filter((user) =>
    !searchQuery ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading matches...</p>
        </div>
      </div>
    )
  }

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
                  <HeartIcon className="h-8 w-8 mr-3" style={{ color: brandColors.primary.pink }} />
                  Match Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Create and manage matches between users. Total: {matches.length}
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-lg text-white font-semibold transition-all duration-300 hover:shadow-lg flex items-center space-x-2"
                style={{ background: brandColors.gradients.primary }}
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create Match</span>
              </button>
            </div>
          </div>

          {/* Matches List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            {matches.length === 0 ? (
              <div className="p-12 text-center">
                <HeartIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No matches yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                  Create a match between two users to get started
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 hover:shadow-lg"
                  style={{ background: brandColors.gradients.primary }}
                >
                  Create First Match
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Matched At
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {matches.map((match) => (
                      <motion.tr
                        key={match.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                                {match.user1?.first_name?.[0] || match.user1?.username[0]?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {match.user1?.first_name && match.user1?.last_name
                                    ? `${match.user1.first_name} ${match.user1.last_name}`
                                    : match.user1?.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">@{match.user1?.username}</p>
                              </div>
                            </div>
                            <HeartIcon className="h-5 w-5" style={{ color: brandColors.primary.pink }} />
                            <div className="flex items-center space-x-2">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                {match.user2?.first_name?.[0] || match.user2?.username[0]?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {match.user2?.first_name && match.user2?.last_name
                                    ? `${match.user2.first_name} ${match.user2.last_name}`
                                    : match.user2?.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">@{match.user2?.username}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              match.status === 'active'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {match.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(match.matched_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteMatch(match.id)}
                            disabled={deletingMatchId === match.id}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete match"
                          >
                            {deletingMatchId === match.id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                            ) : (
                              <TrashIcon className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Match Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCreateModal(false)
                setSelectedUser1(null)
                setSelectedUser2(null)
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
              >
                {/* Header - Mobile Optimized */}
                <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: brandColors.primary.pink }} />
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Create Match</h2>
                    </div>
                    <button
                      onClick={() => {
                        setShowCreateModal(false)
                        setSelectedUser1(null)
                        setSelectedUser2(null)
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors touch-manipulation"
                      aria-label="Close modal"
                    >
                      <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
                
                {/* Content - Mobile Optimized */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Search Bar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search Users
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name, username, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* User 1 Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                        Select First User
                      </label>
                      <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto border border-gray-200 dark:border-slate-600 rounded-lg p-2 sm:p-3">
                        {filteredUsers
                          .filter((user) => user.id !== selectedUser2?.id)
                          .map((user) => (
                            <button
                              key={user.id}
                              onClick={() => handleSelectUser(user, 1)}
                              className={`w-full text-left p-2.5 sm:p-3 rounded-lg transition-all touch-manipulation ${
                                selectedUser1?.id === user.id
                                  ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500'
                                  : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600'
                              }`}
                            >
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                                  {user.first_name?.[0] || user.username[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                    {user.first_name && user.last_name
                                      ? `${user.first_name} ${user.last_name}`
                                      : user.username}
                                  </p>
                                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                      </div>
                      {selectedUser1 && (
                        <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-xs sm:text-sm font-medium text-purple-900 dark:text-purple-300 truncate">
                            Selected: {selectedUser1.username}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* User 2 Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                        Select Second User
                      </label>
                      <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto border border-gray-200 dark:border-slate-600 rounded-lg p-2 sm:p-3">
                        {filteredUsers
                          .filter((user) => user.id !== selectedUser1?.id)
                          .map((user) => (
                            <button
                              key={user.id}
                              onClick={() => handleSelectUser(user, 2)}
                              className={`w-full text-left p-2.5 sm:p-3 rounded-lg transition-all touch-manipulation ${
                                selectedUser2?.id === user.id
                                  ? 'bg-pink-100 dark:bg-pink-900/30 border-2 border-pink-500'
                                  : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600'
                              }`}
                            >
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                                  {user.first_name?.[0] || user.username[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                    {user.first_name && user.last_name
                                      ? `${user.first_name} ${user.last_name}`
                                      : user.username}
                                  </p>
                                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                      </div>
                      {selectedUser2 && (
                        <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                          <p className="text-xs sm:text-sm font-medium text-pink-900 dark:text-pink-300 truncate">
                            Selected: {selectedUser2.username}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedUser1 && selectedUser2 && (
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                        <div className="text-center flex-1 min-w-0">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mx-auto mb-2 text-sm sm:text-base">
                            {selectedUser1.username[0]?.toUpperCase()}
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate px-1">
                            {selectedUser1.first_name && selectedUser1.last_name
                              ? `${selectedUser1.first_name} ${selectedUser1.last_name}`
                              : selectedUser1.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate px-1">@{selectedUser1.username}</p>
                        </div>
                        <HeartIcon className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" style={{ color: brandColors.primary.pink }} />
                        <div className="text-center flex-1 min-w-0">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold mx-auto mb-2 text-sm sm:text-base">
                            {selectedUser2.username[0]?.toUpperCase()}
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate px-1">
                            {selectedUser2.first_name && selectedUser2.last_name
                              ? `${selectedUser2.first_name} ${selectedUser2.last_name}`
                              : selectedUser2.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate px-1">@{selectedUser2.username}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Buttons - Mobile Optimized */}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false)
                        setSelectedUser1(null)
                        setSelectedUser2(null)
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors touch-manipulation"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateMatch}
                      disabled={!selectedUser1 || !selectedUser2 || creatingMatch}
                      className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-white rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 touch-manipulation"
                      style={{ background: brandColors.gradients.primary }}
                    >
                      {creatingMatch ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Create Match</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

