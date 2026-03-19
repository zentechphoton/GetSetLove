'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import AdminSidebar from '@/components/Layout/AdminSidebar'
import { SidebarProvider } from '@/components/Layout/SidebarContext'
import { api } from '@/lib/api'
import { brandColors } from '@/lib/colors'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface News {
  id: string
  title: string
  slug: string
  excerpt: string
  image: string
  status: 'draft' | 'published'
  author: {
    first_name: string
    last_name: string
    username: string
  }
  created_at: string
  updated_at: string
}

interface NewsStats {
  total_news: number
  published_news: number
  draft_news: number
}

export default function AdminNewsPage() {
  const router = useRouter()
  const { user, token, _hasHydrated } = useAuthStore()
  const [news, setNews] = useState<News[]>([])
  const [stats, setStats] = useState<NewsStats>({
    total_news: 0,
    published_news: 0,
    draft_news: 0,
  })
  const [loading, setLoading] = useState(true)

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
      const [newsRes, statsRes] = await Promise.all([
        api.get('/admin/news'),
        api.get('/admin/news/stats'),
      ])
      setNews(newsRes.data || [])
      setStats(statsRes.data || {
        total_news: 0,
        published_news: 0,
        draft_news: 0,
      })
    } catch (error: any) {
      console.error('Error fetching data:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.')
        router.push('/auth/login')
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this page.')
      } else {
        const errorMsg = error.response?.data?.error || error.message || 'Failed to load news'
        toast.error(errorMsg)
      }
      
      // Set empty defaults on error
      setNews([])
      setStats({
        total_news: 0,
        published_news: 0,
        draft_news: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) return

    try {
      await api.delete(`/admin/news/${id}`)
      toast.success('News deleted successfully')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete news')
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
        <AdminSidebar />
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold" style={{ color: brandColors.primary.purple }}>
                  News Management
                </h1>
                <Link href="/admin/news/new">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg font-semibold"
                    style={{ background: brandColors.gradients.primary }}
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>New News</span>
                  </motion.button>
                </Link>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total News</p>
                      <p className="text-3xl font-bold mt-2" style={{ color: brandColors.primary.purple }}>
                        {stats.total_news}
                      </p>
                    </div>
                    <DocumentTextIcon className="h-12 w-12 opacity-20" style={{ color: brandColors.primary.purple }} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                      <p className="text-3xl font-bold mt-2" style={{ color: brandColors.additional.green }}>
                        {stats.published_news}
                      </p>
                    </div>
                    <EyeIcon className="h-12 w-12 opacity-20" style={{ color: brandColors.additional.green }} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Drafts</p>
                      <p className="text-3xl font-bold mt-2" style={{ color: brandColors.additional.yellow }}>
                        {stats.draft_news}
                      </p>
                    </div>
                    <EyeSlashIcon className="h-12 w-12 opacity-20" style={{ color: brandColors.additional.yellow }} />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* News Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {news.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="h-12 w-12 rounded-lg object-cover mr-3"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {item.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.author?.first_name || item.author?.username || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              item.status === 'published'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(item.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/admin/news/${item.id}/edit`}>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </motion.button>
                            </Link>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {news.length === 0 && (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No news found</p>
                    <Link href="/admin/news/new">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-4 px-4 py-2 text-white rounded-lg font-semibold"
                        style={{ background: brandColors.gradients.primary }}
                      >
                        Create Your First News
                      </motion.button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}







