'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import UserSidebar from '@/components/Layout/UserSidebar'
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

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string
  image: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export default function UserBlogsPage() {
  const router = useRouter()
  const { user, token, _hasHydrated } = useAuthStore()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [settings, setSettings] = useState({ user_blog_access: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!_hasHydrated) return
    if (!token || !user) {
      router.push('/auth/login')
      return
    }
    fetchData()
  }, [token, user, _hasHydrated, router])

  const fetchData = async () => {
    try {
      const [blogsRes, settingsRes] = await Promise.all([
        api.get('/user/blogs'),
        api.get('/user/blogs/settings'),
      ])
      setBlogs(blogsRes.data || [])
      setSettings(settingsRes.data || { user_blog_access: false })
    } catch (error: any) {
      console.error('Error fetching data:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.')
        router.push('/auth/login')
      } else {
        const errorMsg = error.response?.data?.error || error.message || 'Failed to load blogs'
        toast.error(errorMsg)
      }
      
      // Set empty defaults on error
      setBlogs([])
      setSettings({ user_blog_access: false })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return

    try {
      await api.delete(`/user/blogs/${id}`)
      toast.success('Blog deleted successfully')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete blog')
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen">
          <UserSidebar />
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
        <UserSidebar />
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold" style={{ color: brandColors.primary.purple }}>
                  My Blogs
                </h1>
                {settings.user_blog_access && (
                  <Link href="/user/blogs/new">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg font-semibold"
                      style={{ background: brandColors.gradients.primary }}
                    >
                      <PlusIcon className="h-5 w-5" />
                      <span>New Blog</span>
                    </motion.button>
                  </Link>
                )}
              </div>

              {!settings.user_blog_access && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6"
                >
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Blog creation is currently disabled. Please contact an administrator to enable user blog creation.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Blogs Grid */}
            {blogs.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No blogs found</p>
                {settings.user_blog_access && (
                  <Link href="/user/blogs/new">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-4 px-4 py-2 text-white rounded-lg font-semibold"
                      style={{ background: brandColors.gradients.primary }}
                    >
                      Create Your First Blog
                    </motion.button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {blog.image && (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            blog.status === 'published'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {blog.status}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(blog.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {blog.title}
                      </h3>
                      {blog.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {blog.excerpt}
                        </p>
                      )}
                      <div className="flex items-center space-x-2">
                        <Link href={`/user/blogs/${blog.id}/edit`}>
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
                          onClick={() => handleDelete(blog.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

