'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api'
import { brandColors } from '@/lib/colors'
import { format } from 'date-fns'
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, ShareIcon, BookOpenIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline'

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  author: {
    first_name: string
    last_name: string
    username: string
  }
  created_at: string
  updated_at: string
}

export default function BlogDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlog()
  }, [slug])

  const fetchBlog = async () => {
    try {
      const response = await api.get(`/blogs/slug/${slug}`)
      setBlog(response.data)
    } catch (error: any) {
      console.error('Error fetching blog:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" style={{ paddingTop: '5px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" style={{ paddingTop: '5px' }}>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Blog Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The blog you're looking for doesn't exist.</p>
          <Link href="/resources/blog">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 text-white rounded-lg font-semibold"
              style={{ background: brandColors.gradients.primary }}
            >
              Back to Blogs
            </motion.button>
          </Link>
        </div>
      </div>
    )
  }

  // Calculate reading time (average 200 words per minute)
  const calculateReadingTime = (content: string) => {
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return minutes
  }

  const readingTime = calculateReadingTime(blog.content)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950" style={{ paddingTop: '5px' }}>
      {/* Navigation Bar - Above Hero Image */}
      <div className="relative z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/resources/blog">
            <motion.button
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="font-medium text-sm">Back to Blogs</span>
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Enhanced Hero Image */}
      {blog.image && (
        <div className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-gray-200 dark:bg-slate-800 group">
          <motion.img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
          
          {/* Animated Overlay Effects */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(157, 0, 255, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(255, 0, 110, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(157, 0, 255, 0.1) 0%, transparent 50%)',
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 2,
            }}
            style={{
              transform: 'skewX(-20deg)',
            }}
          />
        </div>
      )}

      {/* Professional Article Layout */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Article Header */}
        <header className="mb-12">
          {/* Category Badge */}
          <div className="mb-6">
            <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
              <BookOpenIcon className="h-4 w-4" />
              <span>Article</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed font-light">
              {blog.excerpt}
            </p>
          )}

          {/* Author & Meta Information */}
          <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-gray-200 dark:border-slate-800">
            {/* Author */}
            {blog.author && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {blog.author.first_name && blog.author.last_name
                      ? `${blog.author.first_name} ${blog.author.last_name}`
                      : blog.author.first_name || blog.author.username || 'Unknown Author'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {blog.author.username && `@${blog.author.username}`}
                  </div>
                </div>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <CalendarIcon className="h-4 w-4" />
              <span className="text-sm">
                {format(new Date(blog.created_at), 'MMMM d, yyyy')}
              </span>
            </div>

            {/* Reading Time */}
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <ClockIcon className="h-4 w-4" />
              <span className="text-sm">
                {readingTime} min read
              </span>
            </div>

            {/* Share Button */}
            <div className="ml-auto">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                title="Share article"
              >
                <ShareIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none 
          prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
          prose-headings:mt-12 prose-headings:mb-6
          prose-h1:text-4xl prose-h1:font-bold
          prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-10
          prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-8
          prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
          prose-p:text-lg prose-p:font-normal
          prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
          prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ul:my-6
          prose-ol:text-gray-700 dark:prose-ol:text-gray-300 prose-ol:my-6
          prose-li:my-2
          prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
          prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-code:bg-purple-50 dark:prose-code:bg-purple-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8
          prose-hr:border-gray-200 dark:prose-hr:border-slate-800 prose-hr:my-12">
          <div
            className="text-gray-700 dark:text-gray-300"
            style={{
              fontSize: '1.125rem',
              lineHeight: '1.85',
              letterSpacing: '0.01em',
            }}
            dangerouslySetInnerHTML={{ 
              __html: blog.content
                .replace(/\n\n\n+/g, '</p><p class="mb-8">')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br />')
                .replace(/^/, '<p>')
                .replace(/$/, '</p>')
            }}
          />
        </div>

        {/* Article Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Published on {format(new Date(blog.created_at), 'MMMM d, yyyy')}
              </span>
              {blog.updated_at && blog.updated_at !== blog.created_at && (
                <span className="text-sm text-gray-500 dark:text-gray-500">
                  Updated {format(new Date(blog.updated_at), 'MMM d, yyyy')}
                </span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              title="Share article"
            >
              <ShareIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share</span>
            </motion.button>
          </div>
        </footer>

        {/* Related Articles CTA */}
        <div className="mt-16 pt-12 border-t border-gray-200 dark:border-slate-800 text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Explore More Articles
          </h3>
          <Link href="/resources/blog">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-white transition-colors"
              style={{ background: brandColors.gradients.primary }}
            >
              <span>View All Blogs</span>
              <ArrowRightIcon className="h-5 w-5" />
            </motion.button>
          </Link>
        </div>
      </article>
    </div>
  )
}
