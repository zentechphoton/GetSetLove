'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { brandColors } from '@/lib/colors'
import Link from 'next/link'
import {
  EyeIcon,
  SpeakerWaveIcon,
  CursorArrowRaysIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/solid'

export default function AccessibilityPage() {
  const { theme } = useTheme()
  const currentTheme = theme || 'light'

  const features = [
    {
      icon: EyeIcon,
      title: 'Visual Accessibility',
      description: 'High contrast modes, adjustable text sizes, and screen reader compatibility for users with visual impairments.',
      color: brandColors.primary.purple,
      gradient: brandColors.gradients.primary,
    },
    {
      icon: SpeakerWaveIcon,
      title: 'Audio Accessibility',
      description: 'Audio descriptions, captions for videos, and alternative text for all images to support users with hearing impairments.',
      color: brandColors.primary.pink,
      gradient: brandColors.gradients.warm,
    },
    {
      icon: CursorArrowRaysIcon,
      title: 'Keyboard Navigation',
      description: 'Full keyboard navigation support, focus indicators, and skip links for users who cannot use a mouse.',
      color: brandColors.primary.orange,
      gradient: brandColors.gradients.secondary,
    },
    {
      icon: AdjustmentsHorizontalIcon,
      title: 'Customizable Interface',
      description: 'Adjustable font sizes, color schemes, and layout options to accommodate individual needs and preferences.',
      color: brandColors.primary.purple,
      gradient: brandColors.gradients.primary,
    },
  ]

  const standards = [
    'WCAG 2.1 Level AA compliance',
    'Section 508 compliance',
    'ADA (Americans with Disabilities Act) compliance',
    'Regular accessibility audits and testing',
    'User feedback integration',
    'Continuous improvement process',
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
              Inclusive Design
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
            Accessibility{' '}
            <span
              style={{
                background: brandColors.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Statement
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
            We are committed to ensuring digital accessibility for people with disabilities. We continually improve
            the user experience for everyone and apply relevant accessibility standards.
          </motion.p>
        </div>
      </motion.section>

      {/* Features Section */}
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
              Our Accessibility{' '}
              <span
                style={{
                  background: brandColors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Features
              </span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="p-6 md:p-8 rounded-2xl relative overflow-hidden group"
                  style={{
                    backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                    border: `2px solid ${currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'}`,
                  }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10"
                    style={{
                      background: feature.gradient,
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
                        background: feature.gradient,
                        boxShadow: `0 8px 24px ${feature.color}40`,
                      }}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  </motion.div>
                  <h3
                    className="text-xl font-bold mb-3 relative z-10"
                    style={{
                      color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-sm md:text-base leading-relaxed relative z-10"
                    style={{
                      color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Standards Section */}
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
              Accessibility{' '}
              <span
                style={{
                  background: brandColors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Standards
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
              border: `2px solid ${currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'}`,
            }}
          >
            <div className="space-y-4">
              {standards.map((standard, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircleIcon className="h-6 w-6 flex-shrink-0 mt-0.5" style={{ color: brandColors.additional.green }} />
                  <p
                    className="text-sm md:text-base font-medium"
                    style={{
                      color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563',
                    }}
                  >
                    {standard}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feedback Section */}
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
            <div className="flex items-center gap-4 mb-6">
              <div
                className="p-3 rounded-xl"
                style={{
                  background: brandColors.gradients.primary,
                }}
              >
                <GlobeAltIcon className="h-6 w-6 text-white" />
              </div>
              <h3
                className="text-xl md:text-2xl font-bold"
                style={{
                  color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                }}
              >
                We Welcome Your Feedback
              </h3>
            </div>
            <p
              className="text-sm md:text-base leading-relaxed mb-4"
              style={{
                color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
              }}
            >
              We are always working to improve the accessibility of our platform. If you encounter any accessibility
              barriers or have suggestions for improvement, please contact us:
            </p>
            <p
              className="text-sm md:text-base"
              style={{
                color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
              }}
            >
              Email: accessibility@getsetlove.com<br />
              Phone: +1 (234) 567-890
            </p>
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
            Need Accessibility Support?
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
            Contact our accessibility team for assistance or to report accessibility issues.
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
