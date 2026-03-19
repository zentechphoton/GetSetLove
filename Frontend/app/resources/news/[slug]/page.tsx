'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api'
import { brandColors } from '@/lib/colors'
import { format } from 'date-fns'
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, ShareIcon, ClockIcon, UserIcon, NewspaperIcon } from '@heroicons/react/24/outline'

interface News {
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

export default function NewsDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [news, setNews] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [slug])

  const fetchNews = async () => {
    try {
      const response = await api.get(`/news/slug/${slug}`)
      setNews(response.data)
    } catch (error: any) {
      console.error('Error fetching news:', error)
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

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" style={{ paddingTop: '5px' }}>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">News Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The news you're looking for doesn't exist.</p>
          <Link href="/resources/news">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 text-white rounded-lg font-semibold"
              style={{ background: brandColors.gradients.primary }}
            >
              Back to News
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

  const readingTime = calculateReadingTime(news.content)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950" style={{ paddingTop: '5px' }}>
      {/* Navigation Bar - Above Hero Image */}
      <div className="relative z-50 bg-white dark:bg-slate-900 border-b-2 border-red-500 dark:border-red-600 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/resources/news">
              <motion.button
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="font-medium text-sm">Back to News</span>
              </motion.button>
            </Link>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-wide shadow-lg"
              style={{
                boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)',
              }}
            >
              <NewspaperIcon className="h-4 w-4" />
              <span>Breaking News</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Hero Image */}
      {news.image && (
        <div className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-gray-200 dark:bg-slate-800 group">
          <motion.img
            src={news.image}
            alt={news.title}
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
                'radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)',
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

      {/* Professional News Article Layout */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* News Header */}
        <header className="mb-10">
          {/* Breaking News Badge */}
          <div className="mb-6">
            <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-bold bg-red-600 text-white uppercase tracking-wide">
              <NewspaperIcon className="h-4 w-4" />
              <span>Breaking News</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
            {news.title}
          </h1>

          {/* Lead/Excerpt */}
          {news.excerpt && (
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed font-medium border-l-4 pl-6" style={{ borderColor: '#dc2626' }}>
              {news.excerpt}
            </p>
          )}

          {/* Byline & Meta Information */}
          <div className="flex flex-wrap items-center gap-6 pb-6 border-b-2 border-gray-300 dark:border-slate-700">
            {/* Author */}
            {news.author && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {news.author.first_name && news.author.last_name
                      ? `${news.author.first_name} ${news.author.last_name}`
                      : news.author.first_name || news.author.username || 'Staff Reporter'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {news.author.username ? `@${news.author.username}` : 'News Reporter'}
                  </div>
                </div>
              </div>
            )}

            {/* Date & Time */}
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <CalendarIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                {format(new Date(news.created_at), 'MMMM d, yyyy')}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-500">
                • {format(new Date(news.created_at), 'h:mm a')}
              </span>
            </div>

            {/* Reading Time */}
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <ClockIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                {readingTime} min read
              </span>
            </div>

            {/* Share Button */}
            <div className="ml-auto">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                title="Share news"
              >
                <ShareIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>
          </div>
        </header>

        {/* News Content */}
        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none 
          prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
          prose-headings:mt-10 prose-headings:mb-5
          prose-h1:text-3xl prose-h1:font-bold prose-h1:mt-12
          prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-p:leading-relaxed prose-p:mb-5
          prose-p:text-lg prose-p:font-normal
          prose-a:text-red-600 dark:prose-a:text-red-400 prose-a:no-underline hover:prose-a:underline prose-a:font-semibold
          prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
          prose-ul:text-gray-800 dark:prose-ul:text-gray-200 prose-ul:my-6
          prose-ol:text-gray-800 dark:prose-ol:text-gray-200 prose-ol:my-6
          prose-li:my-2 prose-li:leading-relaxed
          prose-blockquote:border-l-4 prose-blockquote:border-red-600 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-blockquote:bg-red-50 dark:prose-blockquote:bg-red-900/10 prose-blockquote:py-2 prose-blockquote:my-6
          prose-code:text-red-600 dark:prose-code:text-red-400 prose-code:bg-red-50 dark:prose-code:bg-red-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono
          prose-img:rounded-lg prose-img:shadow-xl prose-img:my-8 prose-img:border-2 prose-img:border-gray-200 dark:prose-img:border-slate-700
          prose-hr:border-gray-300 dark:prose-hr:border-slate-700 prose-hr:my-10">
          <div
            className="text-gray-800 dark:text-gray-200"
            style={{
              fontSize: '1.125rem',
              lineHeight: '1.85',
              letterSpacing: '0.01em',
            }}
            dangerouslySetInnerHTML={{ 
              __html: news.content
                .replace(/\n\n\n+/g, '</p><p class="mb-6">')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br />')
                .replace(/^/, '<p>')
                .replace(/$/, '</p>')
            }}
          />
        </div>

        {/* News Footer */}
        <footer className="mt-16 pt-8 border-t-2 border-gray-300 dark:border-slate-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Published: {format(new Date(news.created_at), 'MMMM d, yyyy')} at {format(new Date(news.created_at), 'h:mm a')}
              </span>
              {news.updated_at && news.updated_at !== news.created_at && (
                <span className="text-sm text-gray-500 dark:text-gray-500">
                  • Updated: {format(new Date(news.updated_at), 'MMM d, yyyy')}
                </span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-medium"
              title="Share news"
            >
              <ShareIcon className="h-5 w-5" />
              <span className="text-sm">Share</span>
            </motion.button>
          </div>
        </footer>

        {/* Related News CTA */}
        <div className="mt-16 pt-12 border-t-2 border-gray-300 dark:border-slate-700 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            More Breaking News
          </h3>
          <Link href="/resources/news">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
              style={{ background: brandColors.gradients.primary }}
            >
              <span>View All News</span>
              <ArrowRightIcon className="h-5 w-5" />
            </motion.button>
          </Link>
        </div>
      </article>
    </div>
  )
}

