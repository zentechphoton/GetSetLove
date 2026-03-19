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
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  UserCircleIcon,
  DocumentTextIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface VerificationRequest {
  id: string
  user: {
    id: string
    username: string
    email: string
    first_name: string
    last_name: string
    avatar: string
    is_verified: boolean
  }
  document_url: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
  reviewed_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export default function AdminVerificationsPage() {
  return (
    <SidebarProvider>
      <AdminVerificationsContent />
    </SidebarProvider>
  )
}

function AdminVerificationsContent() {
  const router = useRouter()
  const { user, token, _hasHydrated } = useAuthStore()
  const { isCollapsed } = useSidebar()
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  useEffect(() => {
    if (!_hasHydrated) return
    if (!token || !user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/auth/login')
      return
    }
    fetchRequests()
  }, [token, user, _hasHydrated, router, statusFilter, page])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await api.get(`/admin/verification-requests?${params.toString()}`)
      setRequests(response.data.requests || [])
      setTotal(response.data.total || 0)
    } catch (error: any) {
      console.error('Error fetching verification requests:', error)
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.')
        router.push('/auth/login')
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this page.')
      } else {
        toast.error('Failed to load verification requests')
      }
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    if (!confirm('Are you sure you want to approve this verification request?')) {
      return
    }

    setProcessingId(requestId)
    try {
      const response = await api.post(`/admin/verification-requests/${requestId}/approve`)
      if (response.data) {
        toast.success('Verification request approved successfully!')
        fetchRequests()
        if (selectedRequest?.id === requestId) {
          setShowDetailModal(false)
          setSelectedRequest(null)
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to approve verification request'
      toast.error(errorMsg)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setProcessingId(selectedRequest.id)
    try {
      const response = await api.post(`/admin/verification-requests/${selectedRequest.id}/reject`, {
        reason: rejectReason,
      })
      if (response.data) {
        toast.success('Verification request rejected successfully!')
        setShowRejectModal(false)
        setShowDetailModal(false)
        setSelectedRequest(null)
        setRejectReason('')
        fetchRequests()
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to reject verification request'
      toast.error(errorMsg)
    } finally {
      setProcessingId(null)
    }
  }

  const filteredRequests = requests.filter((req) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      req.user.username.toLowerCase().includes(query) ||
      req.user.email.toLowerCase().includes(query) ||
      (req.user.first_name && req.user.first_name.toLowerCase().includes(query)) ||
      (req.user.last_name && req.user.last_name.toLowerCase().includes(query))
    )
  })

  const pendingCount = requests.filter((r) => r.status === 'pending').length
  const approvedCount = requests.filter((r) => r.status === 'approved').length
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading verification requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-slate-900 flex flex-col w-full">
      <AdminSidebar />
      <div className={`flex-1 w-full overflow-y-auto overflow-x-hidden transition-all duration-300 ${isCollapsed ? 'md:pl-20' : 'md:pl-72'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                  <ShieldCheckIcon className="h-8 w-8 mr-3" style={{ color: brandColors.primary.purple }} />
                  Verification Requests
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Review and manage user verification requests
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-slate-700">
                    <ShieldCheckIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-yellow-200 dark:border-yellow-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                    <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Approved</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{approvedCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400">Rejected</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{rejectedCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
                    <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by username, email, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any)
                  setPage(1)
                }}
                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Requests List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <ShieldCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No verification requests found</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Users can request verification from their profile page'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="relative">
                          {request.user.avatar ? (
                            <img
                              src={request.user.avatar}
                              alt={request.user.username}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <UserCircleIcon className="h-8 w-8 text-white" />
                            </div>
                          )}
                          {request.status === 'pending' && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {request.user.first_name && request.user.last_name
                                ? `${request.user.first_name} ${request.user.last_name}`
                                : request.user.username}
                            </h3>
                            {request.user.is_verified && (
                              <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">@{request.user.username}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">{request.user.email}</p>
                          {request.message && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                              {request.message}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                            <span>Requested: {format(new Date(request.created_at), 'MMM d, yyyy')}</span>
                            {request.document_url && (
                              <span className="flex items-center">
                                <DocumentTextIcon className="h-4 w-4 mr-1" />
                                Document attached
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            request.status === 'pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              : request.status === 'approved'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}
                        >
                          {request.status === 'pending' && <ClockIcon className="h-3 w-3 inline mr-1" />}
                          {request.status === 'approved' && <CheckCircleIcon className="h-3 w-3 inline mr-1" />}
                          {request.status === 'rejected' && <XCircleIcon className="h-3 w-3 inline mr-1" />}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowDetailModal(true)
                          }}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={processingId === request.id}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowRejectModal(true)
                              }}
                              disabled={processingId === request.id}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} requests
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
                  onClick={() => setPage((p) => Math.min(Math.ceil(total / limit), p + 1))}
                  disabled={page >= Math.ceil(total / limit)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedRequest && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowDetailModal(false)
                setSelectedRequest(null)
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verification Request Details</h2>
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      setSelectedRequest(null)
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {/* User Info */}
                  <div className="flex items-center space-x-4">
                    {selectedRequest.user.avatar ? (
                      <img
                        src={selectedRequest.user.avatar}
                        alt={selectedRequest.user.username}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <UserCircleIcon className="h-10 w-10 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedRequest.user.first_name && selectedRequest.user.last_name
                          ? `${selectedRequest.user.first_name} ${selectedRequest.user.last_name}`
                          : selectedRequest.user.username}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">@{selectedRequest.user.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">{selectedRequest.user.email}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedRequest.status === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          : selectedRequest.status === 'approved'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}
                    >
                      {selectedRequest.status === 'pending' && <ClockIcon className="h-4 w-4 mr-1" />}
                      {selectedRequest.status === 'approved' && <CheckCircleIcon className="h-4 w-4 mr-1" />}
                      {selectedRequest.status === 'rejected' && <XCircleIcon className="h-4 w-4 mr-1" />}
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </span>
                  </div>

                  {/* Message */}
                  {selectedRequest.message && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                        {selectedRequest.message}
                      </p>
                    </div>
                  )}

                  {/* Document */}
                  {selectedRequest.document_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Verification Document
                      </label>
                      <a
                        href={selectedRequest.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                      >
                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                        View Document
                      </a>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {selectedRequest.status === 'rejected' && selectedRequest.rejection_reason && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rejection Reason
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        {selectedRequest.rejection_reason}
                      </p>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Requested
                      </label>
                      <p className="text-gray-600 dark:text-gray-400">
                        {format(new Date(selectedRequest.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    {selectedRequest.reviewed_at && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Reviewed
                        </label>
                        <p className="text-gray-600 dark:text-gray-400">
                          {format(new Date(selectedRequest.reviewed_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {selectedRequest.status === 'pending' && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                      <button
                        onClick={() => handleApprove(selectedRequest.id)}
                        disabled={processingId === selectedRequest.id}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowDetailModal(false)
                          setShowRejectModal(true)
                        }}
                        disabled={processingId === selectedRequest.id}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <XCircleIcon className="h-5 w-5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && selectedRequest && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowRejectModal(false)
                setRejectReason('')
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
                className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full"
              >
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reject Verification Request</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for Rejection <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                      placeholder="Please provide a reason for rejecting this verification request..."
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowRejectModal(false)
                        setRejectReason('')
                      }}
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={!rejectReason.trim() || processingId === selectedRequest.id}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === selectedRequest.id ? 'Rejecting...' : 'Reject Request'}
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

