'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { brandColors } from '@/lib/colors'
import { 
  HeartIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  SparklesIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline'

export default function Footer() {
  const { theme } = useTheme()
  const currentTheme = theme || 'light'

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'How it Works', href: '/how-it-works' },
      { name: 'Success Stories', href: '/success-stories' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Safety Tips', href: '/safety' },
      { name: 'Community Guidelines', href: '/guidelines' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Accessibility', href: '/accessibility' },
    ],
  }

  const socialLinks = [
    {
      name: 'Facebook',
      href: '#',
      icon: () => (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: '#',
      icon: () => (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: '#',
      icon: () => (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: '#',
      icon: () => (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
  ]


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <footer
      className="relative mt-auto w-full shrink-0"
      style={{
        backgroundColor: currentTheme === 'dark' ? '#0f172a' : '#ffffff',
        borderTop: `2px solid ${currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.15)'}`,
      }}
    >
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
        style={{
          background: brandColors.gradients.primary,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: brandColors.primary.purple }} />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: brandColors.primary.pink }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full overflow-x-hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 w-full"
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-6 group">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-2xl lg:text-3xl font-extrabold tracking-wide relative"
                style={{
                  background: brandColors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontStyle: 'italic',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Get <span style={{ fontStyle: 'normal', fontWeight: '900' }}>set</span> love
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 rounded-full opacity-0 group-hover:opacity-100"
                  style={{
                    background: brandColors.gradients.primary,
                    filter: 'blur(8px)',
                  }}
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.span>
            </Link>
            <motion.p
              variants={itemVariants}
              className="text-sm lg:text-base mb-8 leading-relaxed max-w-md"
              style={{
                color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
              }}
            >
              Find your perfect match and build meaningful connections. Join thousands of happy couples who found love through our platform.
            </motion.p>
            
            {/* Social Media Icons */}
            <motion.div variants={itemVariants} className="flex items-center space-x-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.15, y: -3, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl relative overflow-hidden group"
                    style={{
                      backgroundColor: currentTheme === 'dark' 
                        ? 'rgba(157, 0, 255, 0.12)' 
                        : 'rgba(157, 0, 255, 0.08)',
                      color: brandColors.primary.purple,
                    }}
                    aria-label={social.name}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: brandColors.gradients.primary,
                        opacity: 0,
                      }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <Icon />
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white rounded-full group-hover:w-3/4 transition-all duration-300" />
                  </motion.a>
                )
              })}
            </motion.div>
          </motion.div>

          {/* Company Links */}
          <motion.div variants={itemVariants}>
            <motion.h4
              whileHover={{ x: 5 }}
              className="text-sm font-extrabold uppercase tracking-wider mb-6 relative inline-block"
              style={{ color: currentTheme === 'dark' ? '#ffffff' : '#111827' }}
            >
              Company
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                style={{
                  background: brandColors.gradients.primary,
                }}
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="group relative inline-block"
                  >
                    <motion.span
                      whileHover={{ x: 5 }}
                      className="text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                      style={{
                        color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                      }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                        →
                      </span>
                      <span className="group-hover:translate-x-0 transform transition-transform duration-200">
                        {link.name}
                      </span>
                    </motion.span>
                    <motion.div
                      className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full"
                      style={{
                        background: brandColors.gradients.primary,
                        opacity: 0,
                      }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div variants={itemVariants}>
            <motion.h4
              whileHover={{ x: 5 }}
              className="text-sm font-extrabold uppercase tracking-wider mb-6 relative inline-block"
              style={{ color: currentTheme === 'dark' ? '#ffffff' : '#111827' }}
            >
              Support
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                style={{
                  background: brandColors.gradients.primary,
                }}
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="group relative inline-block"
                  >
                    <motion.span
                      whileHover={{ x: 5 }}
                      className="text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                      style={{
                        color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                      }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                        →
                      </span>
                      <span className="group-hover:translate-x-0 transform transition-transform duration-200">
                        {link.name}
                      </span>
                    </motion.span>
                    <motion.div
                      className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full"
                      style={{
                        background: brandColors.gradients.primary,
                        opacity: 0,
                      }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div variants={itemVariants}>
            <motion.h4
              whileHover={{ x: 5 }}
              className="text-sm font-extrabold uppercase tracking-wider mb-6 relative inline-block"
              style={{ color: currentTheme === 'dark' ? '#ffffff' : '#111827' }}
            >
              Legal
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                style={{
                  background: brandColors.gradients.primary,
                }}
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="group relative inline-block"
                  >
                    <motion.span
                      whileHover={{ x: 5 }}
                      className="text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                      style={{
                        color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                      }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                        →
                      </span>
                      <span className="group-hover:translate-x-0 transform transition-transform duration-200">
                        {link.name}
                      </span>
                    </motion.span>
                    <motion.div
                      className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full"
                      style={{
                        background: brandColors.gradients.primary,
                        opacity: 0,
                      }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 lg:mt-16 pt-8 lg:pt-12 border-t"
          style={{
            borderColor: currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.15)' : 'rgba(157, 0, 255, 0.1)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="flex items-start space-x-4 p-4 rounded-xl group cursor-pointer"
              style={{
                backgroundColor: currentTheme === 'dark' 
                  ? 'rgba(157, 0, 255, 0.05)' 
                  : 'rgba(157, 0, 255, 0.03)',
              }}
            >
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="p-2 rounded-lg flex-shrink-0"
                style={{
                  background: brandColors.gradients.primary,
                }}
              >
                <EnvelopeIcon className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme === 'dark' ? '#ffffff' : '#111827' }}>
                  Email
                </p>
                <a
                  href="mailto:support@getsetlove.com"
                  className="text-sm font-medium transition-colors duration-200 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                  style={{
                    color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                  }}
                >
                  support@getsetlove.com
                </a>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="flex items-start space-x-4 p-4 rounded-xl group cursor-pointer"
              style={{
                backgroundColor: currentTheme === 'dark' 
                  ? 'rgba(157, 0, 255, 0.05)' 
                  : 'rgba(157, 0, 255, 0.03)',
              }}
            >
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="p-2 rounded-lg flex-shrink-0"
                style={{
                  background: brandColors.gradients.secondary,
                }}
              >
                <PhoneIcon className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme === 'dark' ? '#ffffff' : '#111827' }}>
                  Phone
                </p>
                <a
                  href="tel:+1234567890"
                  className="text-sm font-medium transition-colors duration-200 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                  style={{
                    color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                  }}
                >
                  +1 (234) 567-890
                </a>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="flex items-start space-x-4 p-4 rounded-xl group cursor-pointer"
              style={{
                backgroundColor: currentTheme === 'dark' 
                  ? 'rgba(157, 0, 255, 0.05)' 
                  : 'rgba(157, 0, 255, 0.03)',
              }}
            >
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="p-2 rounded-lg flex-shrink-0"
                style={{
                  background: brandColors.gradients.warm,
                }}
              >
                <MapPinIcon className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme === 'dark' ? '#ffffff' : '#111827' }}>
                  Address
                </p>
                <p
                  className="text-sm font-medium"
                  style={{
                    color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                  }}
                >
                  123 Love Street, City, State 12345
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Copyright & Scroll to Top */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="pt-8 lg:pt-12 border-t flex flex-col md:flex-row items-center justify-between gap-4"
          style={{
            borderColor: currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.15)' : 'rgba(157, 0, 255, 0.1)',
          }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-sm text-center md:text-left flex items-center justify-center gap-2"
            style={{
              color: currentTheme === 'dark' ? '#6b7280' : '#9ca3af',
            }}
          >
            &copy; {new Date().getFullYear()} Get set love. All rights reserved. | Made with{' '}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <HeartIcon className="inline h-4 w-4" style={{ color: brandColors.primary.pink }} />
            </motion.span>
            {' '}for finding your perfect match
          </motion.p>

          {/* Scroll to Top Button */}
          <ScrollToTopButton />
        </motion.div>
      </div>
    </footer>
  )
}

// Scroll to Top Button Component
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)
  const { theme } = useTheme()
  const currentTheme = theme || 'light'

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-2xl text-white transition-all duration-300 group pointer-events-auto"
          style={{
            background: brandColors.gradients.primary,
          }}
          aria-label="Scroll to top"
        >
          <ArrowUpIcon className="h-5 w-5" />
          <motion.div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
            style={{
              background: brandColors.gradients.primary,
              filter: 'blur(10px)',
            }}
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  )
}