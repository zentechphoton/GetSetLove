'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MoonIcon,
  SunIcon,
  XMarkIcon,
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  SparklesIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  FlagIcon
} from '@heroicons/react/24/outline'
import { useTheme } from 'next-themes'
import { brandColors } from '@/lib/colors'
import { useAuthStore } from '@/store/authStore'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false)
  const [safetyOpen, setSafetyOpen] = useState(false)
  const [mobileSafetyOpen, setMobileSafetyOpen] = useState(false)
  const resourcesRef = useRef<HTMLDivElement>(null)
  const safetyRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const { user, token, logout } = useAuthStore()

  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      // Calculate scroll progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resourcesRef.current && !resourcesRef.current.contains(event.target as Node)) {
        setResourcesOpen(false)
      }
      if (safetyRef.current && !safetyRef.current.contains(event.target as Node)) {
        setSafetyOpen(false)
      }
    }

    if (resourcesOpen || safetyOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [resourcesOpen, safetyOpen])

  // Role-based navigation items
  const getNavItems = () => {
    if (!token || !user) {
      // Public navbar
      return [
        { name: 'Home', href: '/' },
        { name: 'How it Works', href: '/how-it-works' },
      ]
    }

    // Check user role
    const userRole = user.role || 'user'

    if (userRole === 'admin' || userRole === 'super_admin') {
      // Admin navbar
      return [
        { name: 'Dashboard', href: '/admin/dashboard' },
        { name: 'Users', href: '/admin/users' },
        { name: 'Reports', href: '/admin/reports' },
        { name: 'Settings', href: '/admin/settings' },
      ]
    }

    // User navbar
    return [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Matches', href: '/matches' },
      { name: 'Messages', href: '/messages' },
      { name: 'Profile', href: '/profile' },
    ]
  }

  const navItems = getNavItems()

  const resourcesItems = [
    { name: 'Blog', href: '/resources/blog', icon: SparklesIcon },
    { name: 'News', href: '/resources/news', icon: DocumentTextIcon },
  ]

  const safetyItems = [
    { name: 'Community Guidelines', href: '/guidelines', icon: DocumentTextIcon },
    { name: 'Safety Tips', href: '/safety-tips', icon: ShieldCheckIcon },
    { name: 'Safety and Policy', href: '/safety-policy', icon: ExclamationTriangleIcon },
    { name: 'Safety Reporting', href: '/safety-reporting', icon: FlagIcon },
    { name: 'Security', href: '/security', icon: LockClosedIcon },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }


  const currentTheme = mounted ? theme : 'light'

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
      },
    },
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-[9999] w-full overflow-visible backdrop-blur-xl transition-all duration-300 ${scrolled ? 'py-1' : 'py-2 md:py-3'
        }`}
      style={{
        backgroundColor: currentTheme === 'dark'
          ? scrolled ? 'rgba(17, 24, 39, 0.98)' : 'rgba(17, 24, 39, 0.92)'
          : scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.92)',
        borderBottom: `1px solid ${currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.12)'}`,
        boxShadow: scrolled
          ? (currentTheme === 'dark' ? '0 10px 40px rgba(157, 0, 255, 0.25)' : '0 10px 40px rgba(0, 0, 0, 0.12)')
          : 'none',
      }}
    >
      {/* Scroll Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 z-[10001]"
        style={{
          background: brandColors.gradients.primary,
          width: `${scrollProgress}%`,
          boxShadow: `0 0 10px ${brandColors.primary.purple}`,
        }}
      />

      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 relative z-[9999]">
        <div className="flex justify-between items-center w-full relative transition-all duration-300" style={{ minHeight: scrolled ? '3.5rem' : '4.5rem', height: scrolled ? '3.5rem' : '4.5rem' }}>
          {/* Logo with Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-shrink-0 z-10 mr-4"
          >
            <Link
              href={
                token && user
                  ? (user.role === 'admin' || user.role === 'super_admin')
                    ? '/admin/dashboard'
                    : '/dashboard'
                  : '/'
              }
              className="flex items-center no-underline group"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black tracking-tighter relative whitespace-nowrap transition-all duration-300"
                style={{
                  background: brandColors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontStyle: 'normal',
                  textTransform: 'uppercase',
                  filter: scrolled ? 'none' : `drop-shadow(0 0 8px ${brandColors.primary.purple}40)`,
                }}
              >
                Get <span className="italic" style={{ fontWeight: '900', letterSpacing: '0.05em' }}>set</span> love
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-1 rounded-full opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                  style={{
                    background: brandColors.gradients.primary,
                  }}
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.span>
            </Link>
          </motion.div>

          {/* Desktop Navigation Items */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex items-center space-x-1 xl:space-x-3 2xl:space-x-4 flex-1 justify-center relative"
            style={{ zIndex: 10000 }}
          >
            {navItems.map((item, index) => {
              const active = isActive(item.href)
              return (
                <motion.div key={item.name} variants={itemVariants}>
                  <Link
                    href={item.href}
                    className="relative group"
                  >
                    <motion.div
                      whileHover={{
                        y: -3,
                        scale: 1.05,
                        boxShadow: `0 10px 25px ${brandColors.primary.purple}30`,
                        backgroundColor: currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.25)' : 'rgba(157, 0, 255, 0.12)'
                      }}
                      whileTap={{ y: 0, scale: 0.98 }}
                      className="relative px-2.5 xl:px-4 py-2 rounded-xl overflow-hidden transition-all duration-300"
                      style={{
                        backgroundColor: active
                          ? currentTheme === 'dark'
                            ? 'rgba(157, 0, 255, 0.2)'
                            : 'rgba(157, 0, 255, 0.1)'
                          : 'transparent',
                      }}
                    >
                      <span
                        className="relative z-10 text-[11px] xl:text-xs 2xl:text-sm font-black transition-all duration-300 uppercase tracking-widest whitespace-nowrap break-keep"
                        style={{
                          color: active
                            ? brandColors.primary.purple
                            : currentTheme === 'dark'
                              ? '#d1d5db'
                              : '#4b5563',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {item.name}
                      </span>
                      {active && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: brandColors.gradients.primary,
                            opacity: 0.1,
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        />
                      )}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{
                          background: brandColors.gradients.primary,
                          boxShadow: `0 0 12px ${brandColors.primary.purple}`,
                        }}
                        initial={{ scaleX: active ? 1 : 0 }}
                        animate={{ scaleX: active ? 1 : 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      />
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}


            {/* Resources Dropdown - Only show for public users */}
            {(!token || !user) && (
              <motion.div
                variants={itemVariants}
                className="relative z-[10000]"
                ref={resourcesRef}
                onMouseEnter={() => setResourcesOpen(true)}
                onMouseLeave={() => setResourcesOpen(false)}
              >
                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ y: 0, scale: 0.98 }}
                  className="relative px-2 xl:px-2.5 2xl:px-3 py-1.5 xl:py-2 rounded-xl flex items-center space-x-1 group transition-all duration-200"
                  style={{
                    backgroundColor: resourcesOpen || pathname.startsWith('/resources')
                      ? currentTheme === 'dark'
                        ? 'rgba(157, 0, 255, 0.2)'
                        : 'rgba(157, 0, 255, 0.12)'
                      : 'transparent',
                    boxShadow: resourcesOpen
                      ? `0 4px 12px ${brandColors.primary.purple}30`
                      : 'none',
                  }}
                >
                  <span
                    className="text-[11px] xl:text-xs 2xl:text-sm font-black uppercase tracking-widest whitespace-nowrap break-keep transition-colors duration-300"
                    style={{
                      color: pathname.startsWith('/resources')
                        ? brandColors.primary.purple
                        : currentTheme === 'dark'
                          ? '#d1d5db'
                          : '#4b5563',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Resources
                  </span>
                  <motion.div
                    animate={{ rotate: resourcesOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <ChevronDownIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0 transition-colors duration-200" style={{ color: pathname.startsWith('/resources') ? brandColors.primary.purple : currentTheme === 'dark' ? '#d1d5db' : '#4b5563' }} />
                  </motion.div>
                  {pathname.startsWith('/resources') && (
                    <motion.div
                      layoutId="activeResources"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: brandColors.gradients.primary,
                        opacity: 0.1,
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>

                <AnimatePresence>
                  {resourcesOpen && (
                    <>
                      {/* Backdrop Glow Effect */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[9999] pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${brandColors.primary.purple}15 0%, transparent 70%)`,
                        }}
                      />
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -20,
                          scale: 0.85,
                          rotateX: -15,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          rotateX: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -20,
                          scale: 0.85,
                          rotateX: -15,
                        }}
                        transition={{
                          duration: 0.35,
                          type: 'spring',
                          stiffness: 300,
                          damping: 25,
                        }}
                        className="absolute top-full left-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-xl lg:rounded-2xl shadow-2xl z-[10000] border overflow-hidden backdrop-blur-xl"
                        style={{
                          borderColor: currentTheme === 'dark'
                            ? 'rgba(157, 0, 255, 0.4)'
                            : 'rgba(157, 0, 255, 0.3)',
                          boxShadow: `0 25px 80px ${brandColors.primary.purple}50, 0 0 60px ${brandColors.primary.purple}30, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                          transformStyle: 'preserve-3d',
                        }}
                        onMouseEnter={() => setResourcesOpen(true)}
                        onMouseLeave={() => setResourcesOpen(false)}
                      >
                        {/* Animated Border Glow */}
                        <motion.div
                          className="absolute inset-0 rounded-xl lg:rounded-2xl pointer-events-none"
                          style={{
                            background: brandColors.gradients.primary,
                            opacity: 0.2,
                          }}
                          animate={{
                            opacity: [0.2, 0.3, 0.2],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                        {/* Shimmer Effect */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: 'linear-gradient(110deg, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%)',
                          }}
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                            ease: 'easeInOut',
                          }}
                        />
                        <div className="p-2 relative z-10">
                          {resourcesItems.map((item, index) => {
                            const Icon = item.icon
                            const active = isActive(item.href)
                            return (
                              <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20, y: -10, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                                transition={{
                                  delay: index * 0.05,
                                  type: 'spring',
                                  stiffness: 400,
                                  damping: 25,
                                }}
                              >
                                <Link
                                  href={item.href}
                                  className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden"
                                  style={{
                                    backgroundColor: active
                                      ? currentTheme === 'dark'
                                        ? 'rgba(157, 0, 255, 0.15)'
                                        : 'rgba(157, 0, 255, 0.1)'
                                      : 'transparent',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = currentTheme === 'dark'
                                      ? 'rgba(157, 0, 255, 0.25)'
                                      : 'rgba(157, 0, 255, 0.18)'
                                    e.currentTarget.style.transform = 'translateX(4px)'
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${brandColors.primary.purple}30`
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = active
                                      ? currentTheme === 'dark'
                                        ? 'rgba(157, 0, 255, 0.15)'
                                        : 'rgba(157, 0, 255, 0.1)'
                                      : 'transparent'
                                    e.currentTarget.style.transform = 'translateX(0)'
                                    e.currentTarget.style.boxShadow = 'none'
                                  }}
                                >
                                  <motion.div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                                    style={{
                                      background: brandColors.gradients.primary,
                                      opacity: 0,
                                    }}
                                    transition={{ duration: 0.2 }}
                                  />
                                  <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: 'spring', stiffness: 400 }}
                                  >
                                    <Icon
                                      className="h-5 w-5 flex-shrink-0 relative z-10 transition-all duration-200"
                                      style={{
                                        color: active
                                          ? brandColors.primary.purple
                                          : currentTheme === 'dark'
                                            ? '#9ca3af'
                                            : '#6b7280',
                                      }}
                                    />
                                  </motion.div>
                                  <span
                                    className="text-sm font-semibold relative z-10 transition-all duration-200 group-hover:font-bold"
                                    style={{
                                      color: active
                                        ? brandColors.primary.purple
                                        : currentTheme === 'dark'
                                          ? '#d1d5db'
                                          : '#4b5563',
                                    }}
                                  >
                                    {item.name}
                                  </span>
                                </Link>
                              </motion.div>
                            )
                          })}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Safety Dropdown - Show for all users */}
            <motion.div
              variants={itemVariants}
              className="relative z-[10000]"
              ref={safetyRef}
              onMouseEnter={() => setSafetyOpen(true)}
              onMouseLeave={() => setSafetyOpen(false)}
            >
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ y: 0, scale: 0.98 }}
                className="relative px-2 xl:px-2.5 2xl:px-3 py-1.5 xl:py-2 rounded-xl flex items-center space-x-1 group transition-all duration-200"
                style={{
                  backgroundColor: safetyOpen || pathname.startsWith('/guidelines') || pathname.startsWith('/safety') || pathname.startsWith('/safety-') || pathname.startsWith('/security')
                    ? currentTheme === 'dark'
                      ? 'rgba(157, 0, 255, 0.2)'
                      : 'rgba(157, 0, 255, 0.12)'
                    : 'transparent',
                  boxShadow: safetyOpen
                    ? `0 4px 12px ${brandColors.primary.purple}30`
                    : 'none',
                }}
              >
                <motion.div
                  animate={{ rotate: safetyOpen ? 360 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ShieldCheckIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0 transition-colors duration-200" style={{ color: safetyOpen || pathname.startsWith('/guidelines') || pathname.startsWith('/safety') || pathname.startsWith('/safety-') || pathname.startsWith('/security') ? brandColors.primary.purple : currentTheme === 'dark' ? '#d1d5db' : '#4b5563' }} />
                </motion.div>
                <span
                  className="text-xs xl:text-sm 2xl:text-lg font-black uppercase tracking-widest whitespace-nowrap break-keep transition-colors duration-300"
                  style={{
                    color: safetyOpen || pathname.startsWith('/guidelines') || pathname.startsWith('/safety') || pathname.startsWith('/safety-') || pathname.startsWith('/security')
                      ? brandColors.primary.purple
                      : currentTheme === 'dark'
                        ? '#d1d5db'
                        : '#4b5563',
                    letterSpacing: '0.08em',
                  }}
                >
                  Safety
                </span>
                <motion.div
                  animate={{ rotate: safetyOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <ChevronDownIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0 transition-colors duration-200" style={{ color: safetyOpen || pathname.startsWith('/guidelines') || pathname.startsWith('/safety') || pathname.startsWith('/safety-') || pathname.startsWith('/security') ? brandColors.primary.purple : currentTheme === 'dark' ? '#d1d5db' : '#4b5563' }} />
                </motion.div>
                {(safetyOpen || pathname.startsWith('/guidelines') || pathname.startsWith('/safety') || pathname.startsWith('/safety-') || pathname.startsWith('/security')) && (
                  <motion.div
                    layoutId="activeSafety"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: brandColors.gradients.primary,
                      opacity: 0.1,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>

              <AnimatePresence>
                {safetyOpen && (
                  <>
                    {/* Backdrop Glow Effect */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 z-[9999] pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${brandColors.primary.purple}15 0%, transparent 70%)`,
                      }}
                    />
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -20,
                        scale: 0.85,
                        rotateX: -15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotateX: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -20,
                        scale: 0.85,
                        rotateX: -15,
                      }}
                      transition={{
                        duration: 0.35,
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                      }}
                      className="absolute top-full left-0 mt-3 w-64 lg:w-72 bg-white dark:bg-slate-800 rounded-xl lg:rounded-2xl shadow-2xl z-[10000] border overflow-hidden backdrop-blur-xl"
                      style={{
                        borderColor: currentTheme === 'dark'
                          ? 'rgba(157, 0, 255, 0.4)'
                          : 'rgba(157, 0, 255, 0.3)',
                        boxShadow: `0 25px 80px ${brandColors.primary.purple}50, 0 0 60px ${brandColors.primary.purple}30, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                        transformStyle: 'preserve-3d',
                      }}
                      onMouseEnter={() => setSafetyOpen(true)}
                      onMouseLeave={() => setSafetyOpen(false)}
                    >
                      {/* Animated Border Glow */}
                      <motion.div
                        className="absolute inset-0 rounded-xl lg:rounded-2xl pointer-events-none"
                        style={{
                          background: brandColors.gradients.primary,
                          opacity: 0.2,
                        }}
                        animate={{
                          opacity: [0.2, 0.3, 0.2],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                      {/* Shimmer Effect */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'linear-gradient(110deg, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%)',
                        }}
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: 'easeInOut',
                        }}
                      />
                      <div className="p-2 relative z-10">
                        {safetyItems.map((item, index) => {
                          const Icon = item.icon
                          const active = isActive(item.href)
                          return (
                            <motion.div
                              key={item.name}
                              initial={{ opacity: 0, x: -20, y: -10, scale: 0.9 }}
                              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                              transition={{
                                delay: index * 0.05,
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                              }}
                            >
                              <Link
                                href={item.href}
                                className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden"
                                style={{
                                  backgroundColor: active
                                    ? currentTheme === 'dark'
                                      ? 'rgba(157, 0, 255, 0.15)'
                                      : 'rgba(157, 0, 255, 0.1)'
                                    : 'transparent',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = currentTheme === 'dark'
                                    ? 'rgba(157, 0, 255, 0.25)'
                                    : 'rgba(157, 0, 255, 0.18)'
                                  e.currentTarget.style.transform = 'translateX(4px)'
                                  e.currentTarget.style.boxShadow = `0 4px 12px ${brandColors.primary.purple}30`
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = active
                                    ? currentTheme === 'dark'
                                      ? 'rgba(157, 0, 255, 0.15)'
                                      : 'rgba(157, 0, 255, 0.1)'
                                    : 'transparent'
                                  e.currentTarget.style.transform = 'translateX(0)'
                                  e.currentTarget.style.boxShadow = 'none'
                                }}
                              >
                                <motion.div
                                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                                  style={{
                                    background: brandColors.gradients.primary,
                                    opacity: 0,
                                  }}
                                  transition={{ duration: 0.2 }}
                                />
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  transition={{ type: 'spring', stiffness: 400 }}
                                >
                                  <Icon
                                    className="h-5 w-5 flex-shrink-0 relative z-10 transition-all duration-200"
                                    style={{
                                      color: active
                                        ? brandColors.primary.purple
                                        : currentTheme === 'dark'
                                          ? '#9ca3af'
                                          : '#6b7280',
                                    }}
                                  />
                                </motion.div>
                                <span
                                  className="text-sm font-semibold relative z-10 transition-all duration-200 group-hover:font-bold"
                                  style={{
                                    color: active
                                      ? brandColors.primary.purple
                                      : currentTheme === 'dark'
                                        ? '#d1d5db'
                                        : '#4b5563',
                                  }}
                                >
                                  {item.name}
                                </span>
                              </Link>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Contact Link - Last item for all users */}
            <motion.div variants={itemVariants}>
              <Link
                href="/contact"
                className="relative group"
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  className="relative px-2 xl:px-2.5 2xl:px-3 py-1.5 xl:py-2 rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    backgroundColor: pathname.startsWith('/contact')
                      ? currentTheme === 'dark'
                        ? 'rgba(157, 0, 255, 0.15)'
                        : 'rgba(157, 0, 255, 0.08)'
                      : 'transparent',
                  }}
                >
                  <span
                    className="relative z-10 text-xs xl:text-sm 2xl:text-base font-bold transition-colors duration-200 uppercase tracking-wide whitespace-nowrap break-keep"
                    style={{
                      color: pathname.startsWith('/contact')
                        ? brandColors.primary.purple
                        : currentTheme === 'dark'
                          ? '#d1d5db'
                          : '#4b5563',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Contact
                  </span>
                  {pathname.startsWith('/contact') && (
                    <motion.div
                      layoutId="activeContact"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: brandColors.gradients.primary,
                        opacity: 0.1,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    />
                  )}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{
                      background: brandColors.gradients.primary,
                      boxShadow: `0 0 12px ${brandColors.primary.purple}`,
                    }}
                    initial={{ scaleX: pathname.startsWith('/contact') ? 1 : 0 }}
                    animate={{ scaleX: pathname.startsWith('/contact') ? 1 : 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-2.5 lg:space-x-3 xl:space-x-4 flex-shrink-0"
          >
            {/* Notifications */}
            {token && user && (
              <motion.div variants={itemVariants} className="hidden sm:block">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 sm:p-2.5 rounded-xl relative overflow-hidden group"
                  style={{
                    color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563',
                    backgroundColor: currentTheme === 'dark'
                      ? 'rgba(157, 0, 255, 0.12)'
                      : 'rgba(157, 0, 255, 0.08)',
                  }}
                  aria-label="Notifications"
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: brandColors.gradients.primary,
                      opacity: 0,
                    }}
                    whileHover={{ opacity: 0.15 }}
                  />
                  <BellIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 relative z-10" />
                  <motion.span
                    className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </motion.button>
              </motion.div>
            )}

            {/* User Profile */}
            {token && user && (
              <motion.div variants={itemVariants} className="hidden sm:block">
                <Link href="/profile">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 sm:p-2.5 rounded-xl relative overflow-hidden group"
                    style={{
                      color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563',
                      backgroundColor: currentTheme === 'dark'
                        ? 'rgba(157, 0, 255, 0.12)'
                        : 'rgba(157, 0, 255, 0.08)',
                    }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: brandColors.gradients.primary,
                        opacity: 0,
                      }}
                      whileHover={{ opacity: 0.15 }}
                    />
                    <UserCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 relative z-10" />
                  </motion.div>
                </Link>
              </motion.div>
            )}

            {/* Dark Mode Toggle */}
            {mounted && (
              <motion.div variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
                  className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none overflow-hidden"
                  style={{
                    backgroundColor: currentTheme === 'dark'
                      ? brandColors.primary.purple
                      : '#cbd5e1',
                    boxShadow: currentTheme === 'dark'
                      ? `0 0 20px ${brandColors.primary.purple}`
                      : '0 2px 8px rgba(0, 0, 0, 0.15)',
                  }}
                  aria-label="Toggle dark mode"
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: currentTheme === 'dark'
                        ? brandColors.additional.yellow
                        : '#ffffff',
                      boxShadow: currentTheme === 'dark'
                        ? '0 2px 12px rgba(251, 191, 36, 0.6)'
                        : '0 2px 8px rgba(0, 0, 0, 0.2)',
                    }}
                    animate={{
                      x: currentTheme === 'dark' ? 28 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    {currentTheme === 'dark' ? (
                      <motion.div
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <SunIcon className="h-4 w-4" style={{ color: '#fbbf24' }} />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ rotate: 180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <MoonIcon className="h-4 w-4" style={{ color: '#6b7280' }} />
                      </motion.div>
                    )}
                  </motion.div>
                </motion.button>
              </motion.div>
            )}

            {/* Login Link */}
            {!token && (
              <motion.div variants={itemVariants} className="hidden lg:block">
                <Link href="/auth/login">
                  <motion.div
                    whileHover={{ y: -2, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 md:px-4 xl:px-6 2xl:px-8 py-2 md:py-2.5 rounded-xl xl:rounded-2xl relative overflow-hidden group whitespace-nowrap transition-all duration-300"
                    style={{
                      color: brandColors.primary.purple,
                      backgroundColor: 'transparent',
                      border: `2px solid ${brandColors.primary.purple}`,
                    }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: brandColors.gradients.primary,
                        opacity: 0,
                      }}
                      whileHover={{ opacity: 0.1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <span className="relative z-10 text-xs xl:text-sm 2xl:text-lg font-black uppercase tracking-widest">
                      Login
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            )}

            {/* Signup Button */}
            {!token && (
              <motion.div variants={itemVariants} className="hidden lg:block">
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ y: -2, scale: 1.05, boxShadow: `0 8px 24px ${brandColors.primary.purple}60` }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 md:px-6 xl:px-8 py-2 md:py-2.5 text-[11px] xl:text-xs font-black rounded-xl text-white uppercase tracking-widest relative overflow-hidden whitespace-nowrap transition-all duration-300"
                    style={{
                      background: brandColors.gradients.primary,
                      boxShadow: `0 4px 16px ${brandColors.primary.purple}40`,
                    }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${brandColors.additional.hoverPurple} 0%, ${brandColors.primary.pink} 100%)`,
                        opacity: 0,
                      }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <span className="relative z-10">Signup</span>
                  </motion.button>
                </Link>
              </motion.div>
            )}

            {/* Logout Button - Only show for authenticated users */}
            {token && user && (
              <motion.div variants={itemVariants} className="hidden lg:block">
                <motion.button
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-2.5 lg:px-3 xl:px-4 py-1.5 lg:py-2 text-[10px] lg:text-xs font-bold rounded-lg lg:rounded-xl uppercase tracking-wider relative overflow-hidden whitespace-nowrap transition-all duration-200"
                  style={{
                    color: brandColors.additional.red,
                    backgroundColor: 'transparent',
                    border: `2px solid ${brandColors.additional.red}`,
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: brandColors.additional.red,
                      opacity: 0,
                    }}
                    whileHover={{ opacity: 0.1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <span className="relative z-10">Logout</span>
                </motion.button>
              </motion.div>
            )}


            {/* Mobile Menu Button */}
            <motion.div variants={itemVariants} className="lg:hidden">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl relative overflow-hidden"
                style={{
                  color: currentTheme === 'dark' ? '#d1d5db' : '#374151',
                  backgroundColor: currentTheme === 'dark'
                    ? 'rgba(157, 0, 255, 0.12)'
                    : 'rgba(157, 0, 255, 0.08)',
                  border: `1px solid ${currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.15)'}`,
                }}
                aria-label="Menu"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Bars3Icon className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Menu Backdrop */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="lg:hidden border-t overflow-hidden max-h-[calc(100vh-4rem)] overflow-y-auto relative z-[9999]"
              style={{
                borderColor: currentTheme === 'dark'
                  ? 'rgba(157, 0, 255, 0.15)'
                  : 'rgba(157, 0, 255, 0.1)',
                backgroundColor: currentTheme === 'dark'
                  ? 'rgba(17, 24, 39, 0.98)'
                  : 'rgba(255, 255, 255, 0.98)',
              }}
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.3 }}
                className="px-4 py-6 space-y-3"
              >
                {navItems.map((item, index) => {
                  const active = isActive(item.href)
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-3 px-4 rounded-xl transition-all duration-200 font-bold uppercase text-sm relative overflow-hidden group"
                        style={{
                          color: active
                            ? brandColors.primary.purple
                            : currentTheme === 'dark'
                              ? '#d1d5db'
                              : '#4b5563',
                          backgroundColor: active
                            ? currentTheme === 'dark'
                              ? 'rgba(157, 0, 255, 0.2)'
                              : 'rgba(157, 0, 255, 0.12)'
                            : 'transparent',
                        }}
                      >
                        {active && (
                          <motion.div
                            layoutId="mobileActiveTab"
                            className="absolute inset-0 rounded-xl"
                            style={{
                              background: brandColors.gradients.primary,
                              opacity: 0.15,
                            }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{item.name}</span>
                      </Link>
                    </motion.div>
                  )
                })}

                {/* Mobile Resources - Only show for public users */}
                {(!token || !user) && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.05 }}
                  >
                    <motion.button
                      onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
                      className="w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 font-bold uppercase text-sm"
                      style={{
                        color: pathname.startsWith('/resources')
                          ? brandColors.primary.purple
                          : currentTheme === 'dark'
                            ? '#d1d5db'
                            : '#4b5563',
                        backgroundColor: pathname.startsWith('/resources')
                          ? currentTheme === 'dark'
                            ? 'rgba(157, 0, 255, 0.2)'
                            : 'rgba(157, 0, 255, 0.12)'
                          : 'transparent',
                      }}
                    >
                      <span>Resources</span>
                      <motion.div
                        animate={{ rotate: mobileResourcesOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDownIcon className="h-4 w-4" />
                      </motion.div>
                    </motion.button>
                    <AnimatePresence>
                      {mobileResourcesOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 mt-2 space-y-2">
                            {resourcesItems.map((item, index) => {
                              const Icon = item.icon
                              const active = isActive(item.href)
                              return (
                                <motion.div
                                  key={item.name}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <Link
                                    href={item.href}
                                    onClick={() => {
                                      setMobileMenuOpen(false)
                                      setMobileResourcesOpen(false)
                                    }}
                                    className="flex items-center space-x-3 py-2.5 px-4 rounded-xl transition-all duration-200 font-semibold text-sm"
                                    style={{
                                      color: active
                                        ? brandColors.primary.purple
                                        : currentTheme === 'dark'
                                          ? '#d1d5db'
                                          : '#4b5563',
                                      backgroundColor: active
                                        ? currentTheme === 'dark'
                                          ? 'rgba(157, 0, 255, 0.2)'
                                          : 'rgba(157, 0, 255, 0.12)'
                                        : 'transparent',
                                    }}
                                  >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                  </Link>
                                </motion.div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Mobile Safety Dropdown */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (!token || !user) ? (navItems.length + 1) * 0.05 : navItems.length * 0.05 }}
                >
                  <motion.button
                    onClick={() => setMobileSafetyOpen(!mobileSafetyOpen)}
                    className="w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 font-bold uppercase text-sm"
                    style={{
                      color: pathname.startsWith('/guidelines') || pathname.startsWith('/safety') || pathname.startsWith('/safety-')
                        ? brandColors.primary.purple
                        : currentTheme === 'dark'
                          ? '#d1d5db'
                          : '#4b5563',
                      backgroundColor: pathname.startsWith('/guidelines') || pathname.startsWith('/safety') || pathname.startsWith('/safety-')
                        ? currentTheme === 'dark'
                          ? 'rgba(157, 0, 255, 0.2)'
                          : 'rgba(157, 0, 255, 0.12)'
                        : 'transparent',
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <ShieldCheckIcon className="h-4 w-4" />
                      <span>Safety</span>
                    </div>
                    <motion.div
                      animate={{ rotate: mobileSafetyOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </motion.div>
                  </motion.button>
                  <AnimatePresence>
                    {mobileSafetyOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 mt-2 space-y-2">
                          {safetyItems.map((item, index) => {
                            const Icon = item.icon
                            const active = isActive(item.href)
                            return (
                              <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <Link
                                  href={item.href}
                                  onClick={() => {
                                    setMobileMenuOpen(false)
                                    setMobileSafetyOpen(false)
                                  }}
                                  className="flex items-center space-x-3 py-2.5 px-4 rounded-xl transition-all duration-200 font-semibold text-sm"
                                  style={{
                                    color: active
                                      ? brandColors.primary.purple
                                      : currentTheme === 'dark'
                                        ? '#d1d5db'
                                        : '#4b5563',
                                    backgroundColor: active
                                      ? currentTheme === 'dark'
                                        ? 'rgba(157, 0, 255, 0.2)'
                                        : 'rgba(157, 0, 255, 0.12)'
                                      : 'transparent',
                                  }}
                                >
                                  <Icon className="h-4 w-4" />
                                  <span>{item.name}</span>
                                </Link>
                              </motion.div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Mobile Contact Link - Last item */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (!token || !user) ? (navItems.length + 2) * 0.05 : (navItems.length + 1) * 0.05 }}
                >
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 px-4 rounded-xl transition-all duration-200 font-bold uppercase text-sm relative overflow-hidden group"
                    style={{
                      color: pathname.startsWith('/contact')
                        ? brandColors.primary.purple
                        : currentTheme === 'dark'
                          ? '#d1d5db'
                          : '#4b5563',
                      backgroundColor: pathname.startsWith('/contact')
                        ? currentTheme === 'dark'
                          ? 'rgba(157, 0, 255, 0.2)'
                          : 'rgba(157, 0, 255, 0.12)'
                        : 'transparent',
                    }}
                  >
                    {pathname.startsWith('/contact') && (
                      <motion.div
                        layoutId="mobileActiveContact"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: brandColors.gradients.primary,
                          opacity: 0.15,
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">Contact</span>
                  </Link>
                </motion.div>

                {/* Mobile Dark Mode Toggle */}
                {mounted && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.05 }}
                    className="flex items-center justify-between py-3 px-4 mt-4 pt-4 border-t"
                    style={{
                      borderColor: currentTheme === 'dark'
                        ? 'rgba(157, 0, 255, 0.15)'
                        : 'rgba(157, 0, 255, 0.1)',
                    }}
                  >
                    <span className="font-semibold text-sm" style={{ color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563' }}>
                      Dark Mode
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
                      className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none overflow-hidden"
                      style={{
                        backgroundColor: currentTheme === 'dark'
                          ? brandColors.primary.purple
                          : '#cbd5e1',
                        boxShadow: currentTheme === 'dark'
                          ? `0 0 20px ${brandColors.primary.purple}`
                          : '0 2px 8px rgba(0, 0, 0, 0.15)',
                      }}
                      aria-label="Toggle dark mode"
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: currentTheme === 'dark'
                            ? brandColors.additional.yellow
                            : '#ffffff',
                          boxShadow: currentTheme === 'dark'
                            ? '0 2px 12px rgba(251, 191, 36, 0.6)'
                            : '0 2px 8px rgba(0, 0, 0, 0.2)',
                        }}
                        animate={{
                          x: currentTheme === 'dark' ? 28 : 0,
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        {currentTheme === 'dark' ? (
                          <motion.div
                            initial={{ rotate: -180, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <SunIcon className="h-4 w-4" style={{ color: '#fbbf24' }} />
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ rotate: 180, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <MoonIcon className="h-4 w-4" style={{ color: '#6b7280' }} />
                          </motion.div>
                        )}
                      </motion.div>
                    </motion.button>
                  </motion.div>
                )}

                {/* Mobile Notifications and Profile */}
                {token && user && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (navItems.length + 1) * 0.05 }}
                      className="flex items-center space-x-3 mt-4 pt-4 border-t"
                      style={{
                        borderColor: currentTheme === 'dark'
                          ? 'rgba(157, 0, 255, 0.15)'
                          : 'rgba(157, 0, 255, 0.1)',
                      }}
                    >
                      <Link
                        href="#"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 py-2.5 px-4 rounded-xl transition-all duration-200 font-semibold text-sm flex-1"
                        style={{
                          color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563',
                          backgroundColor: currentTheme === 'dark'
                            ? 'rgba(157, 0, 255, 0.12)'
                            : 'rgba(157, 0, 255, 0.08)',
                        }}
                      >
                        <BellIcon className="h-5 w-5" />
                        <span>Notifications</span>
                        <motion.span
                          className="ml-auto w-2.5 h-2.5 bg-red-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 py-2.5 px-4 rounded-xl transition-all duration-200 font-semibold text-sm flex-1"
                        style={{
                          color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563',
                          backgroundColor: currentTheme === 'dark'
                            ? 'rgba(157, 0, 255, 0.12)'
                            : 'rgba(157, 0, 255, 0.08)',
                        }}
                      >
                        <UserCircleIcon className="h-5 w-5" />
                        <span>Profile</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (navItems.length + 2) * 0.05 }}
                    >
                      <motion.button
                        onClick={() => {
                          handleLogout()
                          setMobileMenuOpen(false)
                        }}
                        className="block w-full py-3 px-4 rounded-xl transition-all duration-200 font-bold uppercase text-sm text-center mt-4 border-2"
                        style={{
                          color: brandColors.additional.red,
                          borderColor: brandColors.additional.red,
                          backgroundColor: 'transparent',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Logout
                      </motion.button>
                    </motion.div>
                  </>
                )}

                {!token && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (navItems.length + 1) * 0.05 }}
                    >
                      <Link
                        href="/auth/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-3 px-4 rounded-xl transition-all duration-200 font-bold uppercase text-sm text-center mt-4 border-2"
                        style={{
                          color: brandColors.primary.purple,
                          borderColor: brandColors.primary.purple,
                          backgroundColor: 'transparent',
                        }}
                      >
                        Login
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (navItems.length + 2) * 0.05 }}
                    >
                      <Link
                        href="/auth/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-3.5 px-4 rounded-xl transition-all duration-200 font-bold uppercase text-sm text-center text-white mt-3"
                        style={{
                          background: brandColors.gradients.primary,
                          boxShadow: `0 4px 16px ${brandColors.primary.purple}50`,
                        }}
                      >
                        Signup
                      </Link>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div >
    </motion.nav >
  )
}