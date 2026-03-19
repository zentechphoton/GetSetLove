'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api'
import { brandColors } from '@/lib/colors'
import { format } from 'date-fns'
import { ArrowRightIcon, CalendarIcon, SparklesIcon, NewspaperIcon } from '@heroicons/react/24/outline'

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" style={{ paddingTop: '5px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    )
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900" style={{ paddingTop: '5px' }}>
      {/* Enhanced Hero Section */}
      <section 
        className="relative overflow-hidden min-h-[85vh] flex items-center justify-center"
        onMouseMove={handleMouseMove}
      >
        {/* Animated Background Image with Parallax */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute inset-0"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&q=80&auto=format&fit=crop"
              alt="News background"
              className="w-full h-full object-cover"
              loading="eager"
              style={{
                transform: `scale(${1 + (mousePosition.x / 3000)}) translate(${mousePosition.x / 50}px, ${mousePosition.y / 50}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            />
          </motion.div>
          
          {/* Dynamic Gradient Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${brandColors.primary.purple}aa 0%, ${brandColors.primary.pink}cc 50%, ${brandColors.primary.purple}aa 100%)`,
              transition: 'background 0.3s ease-out',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-pink-900/60 to-purple-900/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
          
          {/* Multiple Animated Blob Shapes */}
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-25"
            style={{ background: brandColors.primary.purple }}
            animate={{
              x: [0, 150, 0],
              y: [0, 80, 0],
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-25"
            style={{ background: brandColors.primary.pink }}
            animate={{
              x: [0, -150, 0],
              y: [0, -80, 0],
              scale: [1, 1.4, 1],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full blur-3xl opacity-15"
            style={{ background: brandColors.primary.pink }}
            animate={{
              x: [0, 100, -100, 0],
              y: [0, -100, 100, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Animated Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              transform: `translate(${mousePosition.x / 20}px, ${mousePosition.y / 20}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
        </div>

        {/* Floating News Elements */}
        <div className="absolute inset-0 z-5 pointer-events-none hidden lg:block">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-40 rounded-2xl backdrop-blur-md border border-white/20"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                left: `${20 + i * 30}%`,
                top: `${15 + i * 25}%`,
              }}
              animate={{
                y: [0, -30 + i * 10, 0],
                rotate: [0, 5 - i * 3, 0],
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Enhanced Badge with Pulse */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
              }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{ scale: 1.1, y: -5 }}
              className="inline-flex items-center space-x-3 px-8 py-4 rounded-full backdrop-blur-2xl mb-10 shadow-2xl cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 255, 255, 0.2)',
              }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                <NewspaperIcon className="h-6 w-6 text-white" />
              </motion.div>
              <motion.span 
                className="text-base font-bold text-white tracking-wide"
                animate={{
                  opacity: [0.9, 1, 0.9],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Latest Updates
              </motion.span>
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  filter: 'blur(20px)',
                }}
              />
            </motion.div>
            
            {/* Animated Title with Gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 1, 
                delay: 0.4,
                type: "spring",
                stiffness: 100,
              }}
              className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-8 leading-tight relative"
              style={{
                textShadow: '0 4px 30px rgba(0, 0, 0, 0.4), 0 0 60px rgba(157, 0, 255, 0.3)',
              }}
            >
              <motion.span
                className="block text-white"
                animate={{
                  textShadow: [
                    '0 4px 30px rgba(0, 0, 0, 0.4), 0 0 60px rgba(157, 0, 255, 0.3)',
                    '0 4px 40px rgba(0, 0, 0, 0.5), 0 0 80px rgba(255, 0, 110, 0.4)',
                    '0 4px 30px rgba(0, 0, 0, 0.4), 0 0 60px rgba(157, 0, 255, 0.3)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                News & Updates
              </motion.span>
              <motion.div
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 h-1 w-32 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${brandColors.primary.pink}, transparent)`,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
              />
            </motion.h1>
            
            {/* Animated Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 1, 
                delay: 0.7,
                ease: "easeOut",
              }}
              className="text-xl md:text-2xl lg:text-3xl text-white/95 max-w-3xl mx-auto leading-relaxed font-light mb-12"
              style={{
                textShadow: '0 2px 15px rgba(0, 0, 0, 0.4)',
              }}
            >
              Stay informed with the latest news, announcements, and updates from our platform
            </motion.p>

            {/* Interactive Stats or Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="flex flex-wrap items-center justify-center gap-8 mt-12"
            >
              {[
                { icon: '📰', label: 'Breaking News', value: '24/7' },
                { icon: '⚡', label: 'Real-time Updates', value: 'Live' },
                { icon: '🌐', label: 'Global Coverage', value: 'Worldwide' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="flex flex-col items-center p-6 rounded-2xl backdrop-blur-xl cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <span className="text-3xl mb-2">{stat.icon}</span>
                  <span className="text-sm font-bold text-white mb-1">{stat.value}</span>
                  <span className="text-xs text-white/80">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center space-y-2 cursor-pointer"
          >
            <span className="text-white/80 text-sm font-medium">Scroll</span>
            <div className="w-6 h-10 border-2 border-white/80 rounded-full flex justify-center p-2 backdrop-blur-sm">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-3 bg-white rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* News Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white dark:bg-slate-900">
        {news.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-6">
              <NewspaperIcon className="h-12 w-12" style={{ color: brandColors.primary.purple }} />
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
                <Link href={`/resources/news/${item.slug}`}>
                  <motion.div
                    whileHover={{ y: -12, scale: 1.02 }}
                    className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-slate-700 group cursor-pointer"
                    style={{
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {/* Image */}
                    {item.image ? (
                      <div className="relative h-72 overflow-hidden">
                        <motion.img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                          whileHover={{ scale: 1.15 }}
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        />
                        <div className="absolute top-5 right-5">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="px-4 py-2 rounded-full text-xs font-bold text-white backdrop-blur-md shadow-lg"
                            style={{ 
                              background: `linear-gradient(135deg, ${brandColors.primary.pink}dd, ${brandColors.primary.purple}dd)`,
                            }}
                          >
                            Breaking News
                          </motion.div>
                        </div>
                        <div className="absolute bottom-5 left-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="flex items-center text-white text-sm">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            <span>{format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="h-72 flex items-center justify-center relative"
                        style={{
                          background: brandColors.gradients.primary,
                          opacity: 0.2,
                        }}
                      >
                        <NewspaperIcon className="h-20 w-20" style={{ color: brandColors.primary.purple }} />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-8">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4 group-hover:hidden transition-all">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>{format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                      </div>

                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {item.title}
                      </h3>

                      {item.excerpt && (
                        <p className="text-base text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed">
                          {item.excerpt}
                        </p>
                      )}

                      <motion.div 
                        className="flex items-center text-base font-bold group-hover:gap-3 transition-all"
                        style={{ color: brandColors.primary.pink }}
                        whileHover={{ x: 5 }}
                      >
                        <span>Read Full Story</span>
                        <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

