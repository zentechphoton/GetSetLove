'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { brandColors } from '@/lib/colors'
import Link from 'next/link'
import {
  DocumentTextIcon,
  ScaleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid'

export default function TermsOfServicePage() {
  const { theme } = useTheme()
  const currentTheme = theme || 'light'

  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: CheckCircleIcon,
      content: 'By accessing and using Get Set Love, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.',
      color: brandColors.primary.purple,
      gradient: brandColors.gradients.primary,
    },
    {
      title: 'User Accounts',
      icon: ShieldCheckIcon,
      content: 'You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account and password. You agree to provide accurate and complete information.',
      color: brandColors.primary.pink,
      gradient: brandColors.gradients.warm,
    },
    {
      title: 'User Conduct',
      icon: ExclamationTriangleIcon,
      content: 'You agree not to use the service for any unlawful purpose or in any way that could damage, disable, or impair the platform. Harassment, abuse, or inappropriate behavior will result in account termination.',
      color: brandColors.primary.orange,
      gradient: brandColors.gradients.secondary,
    },
    {
      title: 'Content and Intellectual Property',
      icon: DocumentTextIcon,
      content: 'You retain ownership of content you post, but grant us a license to use, display, and distribute it on our platform. You may not post content that infringes on others\' intellectual property rights.',
      color: brandColors.primary.purple,
      gradient: brandColors.gradients.primary,
    },
    {
      title: 'Premium Services',
      icon: ScaleIcon,
      content: 'Premium subscriptions are billed in advance and automatically renew unless cancelled. Refunds are available within 14 days of purchase if you are not satisfied with the service.',
      color: brandColors.primary.pink,
      gradient: brandColors.gradients.warm,
    },
    {
      title: 'Termination',
      icon: ExclamationTriangleIcon,
      content: 'We reserve the right to suspend or terminate your account at any time for violations of these terms. You may also delete your account at any time through your account settings.',
      color: brandColors.primary.orange,
      gradient: brandColors.gradients.secondary,
    },
  ]

  const prohibited = [
    'Creating fake profiles or impersonating others',
    'Harassing, threatening, or abusing other users',
    'Posting explicit, offensive, or illegal content',
    'Spamming or sending unsolicited messages',
    'Attempting to hack or compromise the platform',
    'Violating any applicable laws or regulations',
  ]

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
              Legal Agreement
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
            Terms of{' '}
            <span
              style={{
                background: brandColors.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Service
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl max-w-3xl mx-auto"
            style={{
              color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
            }}
          >
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </motion.p>
        </div>
      </motion.section>

      {/* Introduction */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6 md:p-8 rounded-2xl"
            style={{
              backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
              border: `2px solid ${currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'}`,
            }}
          >
            <p
              className="text-base md:text-lg leading-relaxed"
              style={{
                color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563',
              }}
            >
              These Terms of Service govern your use of Get Set Love. By using our platform, you agree to comply
              with these terms. Please read them carefully before using our services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Sections */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {sections.map((section, index) => {
              const Icon = section.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="p-6 md:p-8 rounded-2xl relative overflow-hidden group h-full"
                  style={{
                    backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                    border: `2px solid ${currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'}`,
                  }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10"
                    style={{
                      background: section.gradient,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="mb-6 relative z-10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{
                        background: section.gradient,
                        boxShadow: `0 8px 24px ${section.color}40`,
                      }}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  </motion.div>
                  <h3
                    className="text-xl font-bold mb-4 relative z-10"
                    style={{
                      color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                    }}
                  >
                    {section.title}
                  </h3>
                  <p
                    className="text-sm md:text-base leading-relaxed relative z-10"
                    style={{
                      color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    {section.content}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Prohibited Activities */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2
              className="text-2xl md:text-3xl font-extrabold mb-4"
              style={{
                color: currentTheme === 'dark' ? '#ffffff' : '#111827',
              }}
            >
              Prohibited{' '}
              <span
                style={{
                  background: brandColors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Activities
              </span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6 md:p-8 rounded-2xl"
            style={{
              backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
              border: `2px solid ${currentTheme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
            }}
          >
            <div className="space-y-4">
              {prohibited.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0 mt-0.5" style={{ color: brandColors.additional.red }} />
                  <p
                    className="text-sm md:text-base font-medium"
                    style={{
                      color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563',
                    }}
                  >
                    {item}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
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
            Questions About Terms?
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
            Contact us if you have any questions about our Terms of Service.
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
                  Contact Us
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
