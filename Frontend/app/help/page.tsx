'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { brandColors } from '@/lib/colors'
import Link from 'next/link'
import {
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'
import {
  MagnifyingGlassIcon as SearchOutline,
} from '@heroicons/react/24/outline'

export default function HelpCenterPage() {
  const { theme } = useTheme()
  const currentTheme = theme || 'light'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: BookOpenIcon,
      color: brandColors.primary.purple,
      gradient: brandColors.gradients.primary,
    },
    {
      id: 'account',
      name: 'Account & Settings',
      icon: Cog6ToothIcon,
      color: brandColors.primary.pink,
      gradient: brandColors.gradients.warm,
    },
    {
      id: 'safety',
      name: 'Safety & Privacy',
      icon: ShieldCheckIcon,
      color: brandColors.primary.orange,
      gradient: brandColors.gradients.secondary,
    },
    {
      id: 'matching',
      name: 'Matching & Messaging',
      icon: ChatBubbleLeftRightIcon,
      color: brandColors.primary.purple,
      gradient: brandColors.gradients.primary,
    },
  ]

  const faqs = [
    {
      category: 'getting-started',
      question: 'How do I create an account?',
      answer: 'Creating an account is easy! Click on the "Sign Up" button in the top right corner, fill in your basic information, verify your email, and you\'re ready to start finding your perfect match.',
    },
    {
      category: 'getting-started',
      question: 'How do I complete my profile?',
      answer: 'Go to your profile settings and add photos, write a bio, and fill in your interests and preferences. A complete profile increases your chances of finding great matches!',
    },
    {
      category: 'account',
      question: 'How do I change my password?',
      answer: 'Go to Settings > Account Security > Change Password. Enter your current password and your new password twice to confirm.',
    },
    {
      category: 'account',
      question: 'How do I delete my account?',
      answer: 'You can delete your account by going to Settings > Account > Delete Account. Please note that this action is permanent and cannot be undone.',
    },
    {
      category: 'safety',
      question: 'How do I report a user?',
      answer: 'Click on the user\'s profile, select the three-dot menu, and choose "Report User". Our safety team will review your report within 24 hours.',
    },
    {
      category: 'safety',
      question: 'How is my data protected?',
      answer: 'We use industry-standard encryption to protect your personal information. Your data is never shared with third parties without your explicit consent.',
    },
    {
      category: 'matching',
      question: 'How does the matching algorithm work?',
      answer: 'Our algorithm considers your preferences, interests, location, and compatibility factors to suggest the most suitable matches for you.',
    },
    {
      category: 'matching',
      question: 'How do I send a message?',
      answer: 'Once you match with someone, you can start a conversation by clicking on their profile and selecting "Send Message".',
    },
  ]

  const filteredFAQs = selectedCategory
    ? faqs.filter(faq => faq.category === selectedCategory)
    : faqs

  const searchedFAQs = searchQuery
    ? filteredFAQs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : filteredFAQs

  const containerVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        backgroundColor: currentTheme === 'dark' ? '#0f172a' : '#ffffff',
      }}
    >
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative pt-20 pb-12 md:pt-28 md:pb-16 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-10 dark:opacity-5"
          style={{
            background: brandColors.gradients.primary,
          }}
        />
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl opacity-20" style={{ background: brandColors.primary.purple }} />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: brandColors.primary.pink }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block mb-6"
          >
            <span
              className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider"
              style={{
                background: brandColors.gradients.primary,
                color: '#ffffff',
              }}
            >
              Help Center
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6"
            style={{
              color: currentTheme === 'dark' ? '#ffffff' : '#111827',
            }}
          >
            How Can We{' '}
            <span
              style={{
                background: brandColors.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Help You?
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl max-w-3xl mx-auto mb-8"
            style={{
              color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
            }}
          >
            Find answers to common questions and get the support you need.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-2xl mx-auto relative"
          >
            <div className="relative">
              <SearchOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: brandColors.primary.purple }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help..."
                className="w-full pl-12 pr-12 py-4 rounded-xl border-2 focus:outline-none transition-all duration-200"
                style={{
                  backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                  borderColor: searchQuery ? brandColors.primary.purple : (currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'),
                  color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <XMarkIcon className="h-5 w-5" style={{ color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-2xl md:text-3xl font-extrabold mb-4"
              style={{
                color: currentTheme === 'dark' ? '#ffffff' : '#111827',
              }}
            >
              Browse by{' '}
              <span
                style={{
                  background: brandColors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Category
              </span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12"
          >
            {categories.map((category, index) => {
              const Icon = category.icon
              const isSelected = selectedCategory === category.id
              return (
                <motion.button
                  key={category.id}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                  className="p-6 rounded-2xl text-left relative overflow-hidden group"
                  style={{
                    backgroundColor: isSelected
                      ? (currentTheme === 'dark' ? '#1e293b' : '#f8fafc')
                      : (currentTheme === 'dark' ? '#1e293b' : '#f8fafc'),
                    border: `2px solid ${isSelected ? category.color : (currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)')}`,
                  }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10"
                    style={{
                      background: category.gradient,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="mb-4 relative z-10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{
                        background: category.gradient,
                        boxShadow: `0 8px 24px ${category.color}40`,
                      }}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  </motion.div>
                  <h3
                    className="text-lg font-bold relative z-10"
                    style={{
                      color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                    }}
                  >
                    {category.name}
                  </h3>
                </motion.button>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-2xl md:text-3xl font-extrabold mb-4"
              style={{
                color: currentTheme === 'dark' ? '#ffffff' : '#111827',
              }}
            >
              Frequently Asked{' '}
              <span
                style={{
                  background: brandColors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Questions
              </span>
            </h2>
            {selectedCategory && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSelectedCategory(null)}
                className="text-sm font-medium mt-4"
                style={{ color: brandColors.primary.purple }}
              >
                Clear filter
              </motion.button>
            )}
          </motion.div>

          <div className="space-y-4">
            {searchedFAQs.length > 0 ? (
              searchedFAQs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="p-6 rounded-xl"
                  style={{
                    backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                    border: `2px solid ${currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'}`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{
                        background: brandColors.gradients.primary,
                      }}
                    >
                      <QuestionMarkCircleIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4
                        className="text-lg font-bold mb-2"
                        style={{
                          color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                        }}
                      >
                        {faq.question}
                      </h4>
                      <p
                        className="text-sm md:text-base"
                        style={{
                          color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                        }}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p
                  className="text-lg"
                  style={{
                    color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                  }}
                >
                  No results found. Try a different search term or category.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-16 md:py-24 relative overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background: currentTheme === 'dark'
              ? 'rgba(15, 23, 42, 0.95)'
              : 'rgba(0, 0, 0, 0.7)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: brandColors.gradients.primary,
            opacity: currentTheme === 'dark' ? 0.3 : 0.4,
          }}
        />
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: brandColors.primary.purple }} />
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: brandColors.primary.pink }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold mb-6 text-white"
            style={{
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            Still Need Help?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-lg md:text-xl mb-8 text-white"
            style={{
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
            }}
          >
            Can't find what you're looking for? Our support team is here to help!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl font-bold text-white uppercase tracking-wider relative overflow-hidden"
                style={{
                  background: brandColors.gradients.primary,
                  boxShadow: '0 8px 24px rgba(157, 0, 255, 0.5)',
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Contact Support
                  <ArrowRightIcon className="h-5 w-5" />
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
