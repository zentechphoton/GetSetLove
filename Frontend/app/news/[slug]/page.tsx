'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api'
import { brandColors } from '@/lib/colors'
import { format } from 'date-fns'
import { ArrowLeftIcon, CalendarIcon, ShareIcon, BookOpenIcon } from '@heroicons/react/24/outline'

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">News Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The news you're looking for doesn't exist.</p>
          <Link href="/news">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/news">
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-8"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="font-medium">Back to News</span>
          </motion.button>
        </Link>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
      >
        {/* Hero Image */}
        {news.image && (
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden mb-8 shadow-2xl">
            <img
              src={news.image}
              alt={news.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            />
          </div>
        )}

        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12 mb-8 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center space-x-4 mb-6">
            <div
              className="px-4 py-2 rounded-full text-sm font-semibold text-white"
              style={{ background: brandColors.gradients.primary }}
            >
              <BookOpenIcon className="h-4 w-4 inline mr-2" />
              Latest News
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-4 w-4 mr-1.5" />
              {format(new Date(news.created_at), 'MMMM d, yyyy')}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900 dark:text-white leading-tight">
            {news.title}
          </h1>

          {news.excerpt && (
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed italic border-l-4 pl-6" style={{ borderColor: brandColors.primary.purple }}>
              {news.excerpt}
            </p>
          )}

          <div className="flex items-center justify-end pt-6 border-t border-gray-200 dark:border-slate-700">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              title="Share"
            >
              <ShareIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-slate-700">
          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-purple-600 dark:prose-a:text-purple-400"
            style={{
              color: '#374151',
            }}
          >
            <div
              className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-lg"
              style={{
                lineHeight: '1.8',
                fontSize: '1.125rem',
              }}
              dangerouslySetInnerHTML={{ 
                __html: news.content
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/\n/g, '<br />')
                  .replace(/^/, '<p>')
                  .replace(/$/, '</p>')
              }}
            />
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link href="/news">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 text-white rounded-xl font-semibold text-lg shadow-lg"
              style={{ background: brandColors.gradients.primary }}
            >
              Explore More News
            </motion.button>
          </Link>
        </motion.div>
      </motion.article>
    </div>
  )
}







