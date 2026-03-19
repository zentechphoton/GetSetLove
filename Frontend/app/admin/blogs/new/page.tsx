'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import AdminSidebar from '@/components/Layout/AdminSidebar'
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

export default function NewBlogPage() {
  const router = useRouter()
  const { user, token, _hasHydrated } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const {
    register,
    handleSubmit,
    watch,
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

  const title = watch('title')

  useEffect(() => {
    if (!_hasHydrated) return
    if (!token || !user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/auth/login')
      return
    }
  }, [token, user, _hasHydrated, router])

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setValue('slug', slug)
    }
  }, [title, setValue])

  const onSubmit = async (data: BlogFormData) => {
    setLoading(true)
    try {
      const payload = {
        title: data.title,
        slug: data.slug || undefined,
        excerpt: data.excerpt || undefined,
        content: data.content,
        image: imageUrl || '', // Always send image field, even if empty
        status: data.status || 'draft',
      }
      
      console.log('Creating blog with payload:', payload)
      console.log('Image URL:', imageUrl)
      
      const response = await api.post('/admin/blogs', payload)
      console.log('Blog created successfully:', response.data)
      console.log('Response image field:', response.data.image)
      console.log('Response status field:', response.data.status)
      
      // Verify image was saved
      if (imageUrl && !response.data.image) {
        console.warn('Image URL was provided but not saved in response')
        toast.error('Blog created but image was not saved. Please edit the blog to add the image.')
      } else if (imageUrl && response.data.image) {
        console.log('Image successfully saved:', response.data.image)
      }
      
      // Warn if blog is created as draft (won't show on public site)
      if (response.data.status === 'draft') {
        toast.success('Blog created as draft. Change status to "published" to show on public site.')
      } else {
        toast.success('Blog created and published successfully!')
      }
      router.push('/admin/blogs')
    } catch (error: any) {
      console.error('Error creating blog:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create blog'
      toast.error(errorMessage)
      console.error('Full error response:', error.response)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
        <AdminSidebar />
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8 max-w-4xl">
            <Link href="/admin/blogs">
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
              Create New Blog
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
                  placeholder="Enter blog title"
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
                  placeholder="blog-slug-url"
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
                  placeholder="Brief description of the blog"
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
                  placeholder="Write your blog content here..."
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
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: brandColors.gradients.primary }}
                >
                  {loading ? 'Creating...' : 'Create Blog'}
                </motion.button>
                <Link href="/admin/blogs">
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

