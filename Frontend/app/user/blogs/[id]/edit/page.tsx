'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import UserSidebar from '@/components/Layout/UserSidebar'
import { SidebarProvider } from '@/components/Layout/SidebarContext'
import ImageUpload from '@/components/Blog/ImageUpload'
import { api } from '@/lib/api'
import { brandColors } from '@/lib/colors'
import toast from 'react-hot-toast'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface BlogFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  status: 'draft' | 'published'
}

export default function EditUserBlogPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { user, token, _hasHydrated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BlogFormData>({
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      status: 'draft',
    },
  })

  useEffect(() => {
    if (!_hasHydrated) return
    if (!token || !user) {
      router.push('/auth/login')
      return
    }
    fetchBlog()
  }, [token, user, _hasHydrated, router, id])

  const fetchBlog = async () => {
    try {
      const response = await api.get(`/user/blogs/${id}`)
      const blog = response.data
      setValue('title', blog.title)
      setValue('slug', blog.slug)
      setValue('excerpt', blog.excerpt || '')
      setValue('content', blog.content)
      setValue('status', blog.status)
      setImageUrl(blog.image || '')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load blog')
      router.push('/user/blogs')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: BlogFormData) => {
    setSaving(true)
    try {
      await api.put(`/user/blogs/${id}`, {
        ...data,
        image: imageUrl,
      })
      toast.success('Blog updated successfully')
      router.push('/user/blogs')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update blog')
    } finally {
      setSaving(false)
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
          <div className="p-6 lg:p-8 max-w-4xl">
            <Link href="/user/blogs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-6"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to Blogs</span>
              </motion.button>
            </Link>

            <h1 className="text-3xl font-bold mb-8" style={{ color: brandColors.primary.purple }}>
              Edit Blog
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug *
                </label>
                <input
                  {...register('slug', { required: 'Slug is required' })}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt
                </label>
                <textarea
                  {...register('excerpt')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <ImageUpload imageUrl={imageUrl} onImageChange={setImageUrl} />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content *
                </label>
                <textarea
                  {...register('content', { required: 'Content is required' })}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: brandColors.gradients.primary }}
                >
                  {saving ? 'Saving...' : 'Update Blog'}
                </motion.button>
                <Link href="/user/blogs">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </motion.button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}







