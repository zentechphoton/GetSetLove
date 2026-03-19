'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api'
import { brandColors } from '@/lib/colors'
import { format } from 'date-fns'
import { ArrowRightIcon, CalendarIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface Blog {
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

export default function PublicBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      console.log('Fetching public blogs from /api/blogs...')
      const response = await api.get('/blogs')
      console.log('Public blogs response:', response.data)
      console.log('Number of blogs:', response.data?.length || 0)
      
      const blogs = response.data || []
      
      // Filter to only show published blogs (backend should do this, but double-check)
      const publishedBlogs = blogs.filter((blog: Blog) => blog.status === 'published')
      console.log('Published blogs:', publishedBlogs.length)
      
      setBlogs(publishedBlogs)
    } catch (error: any) {
      console.error('Error fetching blogs:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      
      // Set empty array on error
      setBlogs([])
      
      // Don't show error toast for public page - just show empty state
      if (error.response?.status !== 404) {
        console.error('Failed to load blogs:', error.response?.data?.error || error.message)
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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900" style={{ paddingTop: '5px' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1486312338219-ce68e2c6f44d?w=1920&q=80&auto=format&fit=crop"
              alt="Blog background"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${brandColors.primary.purple}dd 0%, ${brandColors.primary.pink}dd 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-pink-900/50 to-purple-900/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          
          {/* Animated Blob Shapes */}
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: brandColors.primary.purple }}
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: brandColors.primary.pink }}
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full backdrop-blur-xl mb-8 shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <SparklesIcon className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-sm font-bold text-white">Latest Stories</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white mb-6 leading-tight"
              style={{
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(157, 0, 255, 0.2)',
              }}
            >
              Our Blog
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl md:text-2xl lg:text-3xl text-white/95 max-w-3xl mx-auto leading-relaxed font-light"
              style={{
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              }}
            >
              Discover inspiring stories, expert insights, and the latest updates from our community
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Blogs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white dark:bg-slate-900">
        {blogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-6">
              <SparklesIcon className="h-12 w-12" style={{ color: brandColors.primary.purple }} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No blogs yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon for exciting content!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Link href={`/resources/blog/${blog.slug}`}>
                  <motion.div
                    whileHover={{ y: -12, scale: 1.02 }}
                    className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-slate-700 group cursor-pointer"
                    style={{
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {/* Image */}
                    {blog.image ? (
                      <div className="relative h-72 overflow-hidden">
                        <motion.img
                          src={blog.image}
                          alt={blog.title}
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
                              background: `linear-gradient(135deg, ${brandColors.primary.purple}dd, ${brandColors.primary.pink}dd)`,
                            }}
                          >
                            Featured Article
                          </motion.div>
                        </div>
                        <div className="absolute bottom-5 left-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="flex items-center text-white text-sm">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            <span>{format(new Date(blog.created_at), 'MMM d, yyyy')}</span>
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
                        <SparklesIcon className="h-20 w-20" style={{ color: brandColors.primary.purple }} />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-8">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4 group-hover:hidden transition-all">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>{format(new Date(blog.created_at), 'MMM d, yyyy')}</span>
                      </div>

                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {blog.title}
                      </h3>

                      {blog.excerpt && (
                        <p className="text-base text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed">
                          {blog.excerpt}
                        </p>
                      )}

                      <motion.div 
                        className="flex items-center text-base font-bold group-hover:gap-3 transition-all"
                        style={{ color: brandColors.primary.purple }}
                        whileHover={{ x: 5 }}
                      >
                        <span>Read Full Article</span>
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
