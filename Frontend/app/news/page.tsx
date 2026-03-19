'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api'
import { brandColors } from '@/lib/colors'
import { format } from 'date-fns'
import { ArrowRightIcon, CalendarIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface News {
  id: string
  title: string
  slug: string
  excerpt: string
  image: string
  status: string
  author: {
    first_name: string
    last_name: string
    username: string
  }
  created_at: string
}

export default function PublicNewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      console.log('Fetching public news from /api/news...')
      const response = await api.get('/news')
      console.log('Public news response:', response.data)
      console.log('Number of news:', response.data?.length || 0)
      
      const newsItems = response.data || []
      
      // Filter to only show published news (backend should do this, but double-check)
      const publishedNews = newsItems.filter((item: News) => item.status === 'published')
      console.log('Published news:', publishedNews.length)
      
      setNews(publishedNews)
    } catch (error: any) {
      console.error('Error fetching news:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      
      // Set empty array on error
      setNews([])
      
      // Don't show error toast for public page - just show empty state
      if (error.response?.status !== 404) {
        console.error('Failed to load news:', error.response?.data?.error || error.message)
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `radial-gradient(circle at 20% 50%, ${brandColors.primary.purple} 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, ${brandColors.primary.pink} 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-6">
              <SparklesIcon className="h-5 w-5" style={{ color: brandColors.primary.purple }} />
              <span className="text-sm font-semibold" style={{ color: brandColors.primary.purple }}>
                Latest Updates
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: brandColors.gradients.primary,
                }}
              >
                News & Updates
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Stay informed with the latest news, announcements, and updates from our platform
            </p>
          </motion.div>
        </div>
      </section>

      {/* News Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {news.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-6">
              <SparklesIcon className="h-12 w-12" style={{ color: brandColors.primary.purple }} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No news yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon for exciting updates!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Link href={`/news/${item.slug}`}>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-slate-700">
                    {/* Image */}
                    {item.image ? (
                      <div className="relative h-64 overflow-hidden">
                        <motion.img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          whileHover={{ scale: 1.1 }}
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <div className="absolute top-4 right-4">
                          <div
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                            style={{ backgroundColor: `${brandColors.primary.purple}dd` }}
                          >
                            News
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="h-64 flex items-center justify-center"
                        style={{
                          background: brandColors.gradients.primary,
                          opacity: 0.1,
                        }}
                      >
                        <SparklesIcon className="h-16 w-16" style={{ color: brandColors.primary.purple }} />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <CalendarIcon className="h-4 w-4 mr-1.5" />
                        <span>{format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:opacity-80 transition-opacity">
                        {item.title}
                      </h3>

                      {item.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                          {item.excerpt}
                        </p>
                      )}

                      <div className="flex items-center text-sm font-semibold group-hover:gap-2 transition-all" style={{ color: brandColors.primary.purple }}>
                        <span>Read More</span>
                        <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}







