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
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  StarIcon,
  HeartIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  avatar: string
  role: 'user' | 'admin' | 'super_admin'
  is_verified: boolean
  is_premium: boolean
  created_at: string
}

export default function AdminUsersPage() {
  return (
    <SidebarProvider>
      <AdminUsersContent />
    </SidebarProvider>
  )
}

function AdminUsersContent() {
  const router = useRouter()
  const { user, token, _hasHydrated } = useAuthStore()
  const { isCollapsed } = useSidebar()
  const [users, setUsers] = useState<User[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [showCreateMatchModal, setShowCreateMatchModal] = useState(false)
  const [selectedUser1, setSelectedUser1] = useState<User | null>(null)
  const [selectedUser2, setSelectedUser2] = useState<User | null>(null)
  const [creatingMatch, setCreatingMatch] = useState(false)

  useEffect(() => {
    if (!_hasHydrated) return
    if (!token || !user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/auth/login')
      return
    }
    fetchUsers()
  }, [token, user, _hasHydrated, router, page, searchQuery])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await api.get(`/admin/users?${params.toString()}`)
      setUsers(response.data.users || [])
      setTotalUsers(response.data.total || 0)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.')
        router.push('/auth/login')
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this page.')
      } else {
        toast.error('Failed to load users')
      }
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleVerifyUser = async (userId: string) => {
    try {
      const response = await api.post(`/admin/users/${userId}/verify`)
      if (response.data) {
        toast.success('User verified successfully')
        fetchUsers() // Refresh the list
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to verify user'
      toast.error(errorMsg)
    }
  }

  const handleUnverifyUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove verification from this user?')) {
      return
    }
    try {
      const response = await api.post(`/admin/users/${userId}/unverify`)
      if (response.data) {
        toast.success('User verification removed successfully')
        fetchUsers() // Refresh the list
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to remove verification'
      toast.error(errorMsg)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingUserId(userId)
      await api.delete(`/admin/users/${userId}`)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      const errorMsg = error.response?.data?.error || 'Failed to delete user'
      toast.error(errorMsg)
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingUser) return

    const formData = new FormData(e.currentTarget)
    const updateData: any = {
      is_verified: formData.get('is_verified') === 'on',
      is_premium: formData.get('is_premium') === 'on',
    }

    // Only include fields that have values
    const username = formData.get('username') as string
    const email = formData.get('email') as string
    const first_name = formData.get('first_name') as string
    const last_name = formData.get('last_name') as string
    const role = formData.get('role') as string

    if (username && username.trim()) updateData.username = username.trim()
    if (email && email.trim()) updateData.email = email.trim()
    if (first_name && first_name.trim()) updateData.first_name = first_name.trim()
    if (last_name && last_name.trim()) updateData.last_name = last_name.trim()
    if (role && role.trim()) updateData.role = role.trim()

    try {
      await api.put(`/admin/users/${editingUser.id}`, updateData)
      toast.success('User updated successfully')
      setShowEditModal(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error: any) {
      console.error('Error updating user:', error)
      const errorMsg = error.response?.data?.error || 'Failed to update user'
      toast.error(errorMsg)
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
      const response = await api.post('/admin/matches', {
        user1_id: selectedUser1.id,
        user2_id: selectedUser2.id,
      })
      toast.success(`Match created between ${selectedUser1.username} and ${selectedUser2.username}!`)
      setShowCreateMatchModal(false)
      setSelectedUser1(null)
      setSelectedUser2(null)
      fetchUsers()
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

  const handleSelectUserForMatch = (user: User, position: 1 | 2) => {
    if (position === 1) {
      setSelectedUser1(user)
    } else {
      setSelectedUser2(user)
    }
  }

  const totalPages = Math.ceil(totalUsers / limit)

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
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
                  <UserGroupIcon className="h-8 w-8 mr-3" style={{ color: brandColors.primary.purple }} />
                  User Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage all users on the platform. Total: {totalUsers.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setShowCreateMatchModal(true)}
                className="px-4 py-2 rounded-lg text-white font-semibold transition-all duration-300 hover:shadow-lg flex items-center space-x-2"
                style={{ background: brandColors.gradients.primary }}
              >
                <HeartIcon className="h-5 w-5" />
                <span>Create Match</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by username or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setPage(1)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                              {user.first_name?.[0] || user.username[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.first_name && user.last_name
                                  ? `${user.first_name} ${user.last_name}`
                                  : user.username}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'super_admin'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                                : user.role === 'admin'
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                              }`}
                          >
                            {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {user.is_verified && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Verified
                              </span>
                            )}
                            {user.is_premium && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                                <StarIcon className="h-3 w-3 mr-1" />
                                Premium
                              </span>
                            )}
                            {!user.is_verified && !user.is_premium && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">Standard</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {user.is_verified ? (
                              <button
                                onClick={() => handleUnverifyUser(user.id)}
                                className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                title="Remove verification"
                              >
                                <ShieldCheckIcon className="h-5 w-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleVerifyUser(user.id)}
                                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Verify user"
                              >
                                <ShieldCheckIcon className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit user"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={deletingUserId === user.id}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete user"
                            >
                              {deletingUserId === user.id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                              ) : (
                                <TrashIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalUsers)} of {totalUsers} users
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && editingUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowEditModal(false)
                setEditingUser(null)
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit User</h2>
                    <button
                      onClick={() => {
                        setShowEditModal(false)
                        setEditingUser(null)
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
                <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        defaultValue={editingUser.username}
                        required
                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={editingUser.email}
                        required
                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        defaultValue={editingUser.first_name || ''}
                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        defaultValue={editingUser.last_name || ''}
                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <select
                        name="role"
                        defaultValue={editingUser.role}
                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        {user?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_verified"
                        defaultChecked={editingUser.is_verified}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Verified</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_premium"
                        defaultChecked={editingUser.is_premium}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Premium</span>
                    </label>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false)
                        setEditingUser(null)
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-300 hover:shadow-lg"
                      style={{ background: brandColors.gradients.primary }}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Match Modal */}
      <AnimatePresence>
        {showCreateMatchModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCreateMatchModal(false)
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
                className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
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
                        setShowCreateMatchModal(false)
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* User 1 Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                        Select First User
                      </label>
                      <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto border border-gray-200 dark:border-slate-600 rounded-lg p-2 sm:p-3">
                        {users.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => handleSelectUserForMatch(user, 1)}
                            className={`w-full text-left p-2.5 sm:p-3 rounded-lg transition-all touch-manipulation ${selectedUser1?.id === user.id
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
                        {users
                          .filter((user) => user.id !== selectedUser1?.id)
                          .map((user) => (
                            <button
                              key={user.id}
                              onClick={() => handleSelectUserForMatch(user, 2)}
                              className={`w-full text-left p-2.5 sm:p-3 rounded-lg transition-all touch-manipulation ${selectedUser2?.id === user.id
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
                            {selectedUser1.username}
                          </p>
                        </div>
                        <HeartIcon className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" style={{ color: brandColors.primary.pink }} />
                        <div className="text-center flex-1 min-w-0">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold mx-auto mb-2 text-sm sm:text-base">
                            {selectedUser2.username[0]?.toUpperCase()}
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate px-1">
                            {selectedUser2.username}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Buttons - Mobile Optimized */}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateMatchModal(false)
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

