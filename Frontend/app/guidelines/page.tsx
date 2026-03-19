'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { brandColors } from '@/lib/colors'
import Link from 'next/link'
import {
  UserGroupIcon,
  HeartIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  HandRaisedIcon,
} from '@heroicons/react/24/solid'

export default function CommunityGuidelinesPage() {
  const { theme } = useTheme()
  const currentTheme = theme || 'light'

  const guidelines = [
    {
      icon: HeartIcon,
      title: 'Be Respectful',
      description: 'Treat all members with kindness, respect, and dignity. We\'re all here to find meaningful connections.',
      color: brandColors.primary.purple,
      gradient: brandColors.gradients.primary,
    },
    {
      icon: UserGroupIcon,
      title: 'Be Authentic',
      description: 'Use real photos and accurate information. Authenticity builds trust and leads to better connections.',
      color: brandColors.primary.pink,
      gradient: brandColors.gradients.warm,
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Communicate Clearly',
      description: 'Be honest and clear in your communications. Misleading others is not tolerated and will result in account suspension.',
      color: brandColors.primary.orange,
      gradient: brandColors.gradients.secondary,
    },
    {
      icon: ShieldCheckIcon,
      title: 'Respect Privacy',
      description: 'Never share someone else\'s personal information without their explicit consent. Privacy is a fundamental right.',
      color: brandColors.primary.purple,
      gradient: brandColors.gradients.primary,
    },
    {
      icon: HandRaisedIcon,
      title: 'No Harassment',
      description: 'Harassment, bullying, or any form of abusive behavior is strictly prohibited. Report any incidents immediately.',
      color: brandColors.primary.pink,
      gradient: brandColors.gradients.warm,
    },
    {
      icon: ExclamationTriangleIcon,
      title: 'Follow the Rules',
      description: 'Adhere to our terms of service and community guidelines. Violations may result in warnings or account termination.',
      color: brandColors.primary.orange,
      gradient: brandColors.gradients.secondary,
    },
  ]

  const allowed = [
    'Genuine profiles with real photos',
    'Respectful and kind communication',
    'Honest representation of yourself',
    'Constructive feedback and suggestions',
    'Reporting inappropriate behavior',
    'Building meaningful connections',
  ]

  const prohibited = [
    'Fake profiles or impersonation',
    'Harassment or abusive language',
    'Spam or unsolicited messages',
    'Sharing explicit content',
    'Soliciting money or financial scams',
    'Discrimination or hate speech',
  ]

  const consequences = [
    {
      level: 'Warning',
      description: 'First-time minor violations result in a warning and educational resources.',
      color: brandColors.additional.yellow,
    },
    {
      level: 'Temporary Suspension',
      description: 'Repeated violations or moderate offenses may result in a temporary account suspension.',
      color: brandColors.primary.orange,
    },
    {
      level: 'Permanent Ban',
      description: 'Severe violations, scams, or repeated offenses lead to permanent account termination.',
      color: brandColors.additional.red,
    },
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
              Community Rules
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
            Community{' '}
            <span
              style={{
                background: brandColors.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Guidelines
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
            Our community guidelines help create a safe, respectful, and welcoming environment for everyone.
          </motion.p>
        </div>
      </motion.section>

      {/* Guidelines Grid */}
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
              Our Core{' '}
              <span
                style={{
                  background: brandColors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Principles
              </span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {guidelines.map((guideline, index) => {
              const Icon = guideline.icon
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
                      background: guideline.gradient,
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
                        background: guideline.gradient,
                        boxShadow: `0 8px 24px ${guideline.color}40`,
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
                    {guideline.title}
                  </h3>
                  <p
                    className="text-sm md:text-base leading-relaxed relative z-10"
                    style={{
                      color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    {guideline.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Allowed vs Prohibited */}
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
              What's{' '}
              <span
                style={{
                  background: brandColors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Allowed
              </span>
              {' '}and What's Not
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Allowed */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-6 md:p-8 rounded-2xl"
              style={{
                backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                border: `2px solid ${currentTheme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: brandColors.gradients.primary,
                  }}
                >
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
                <h3
                  className="text-xl md:text-2xl font-bold"
                  style={{
                    color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                  }}
                >
                  Allowed
                </h3>
              </div>
              <div className="space-y-3">
                {allowed.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: brandColors.additional.green }} />
                    <p
                      className="text-sm md:text-base"
                      style={{
                        color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                      }}
                    >
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Prohibited */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-6 md:p-8 rounded-2xl"
              style={{
                backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                border: `2px solid ${currentTheme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${brandColors.additional.red} 0%, ${brandColors.primary.orange} 100%)`,
                  }}
                >
                  <XCircleIcon className="h-6 w-6 text-white" />
                </div>
                <h3
                  className="text-xl md:text-2xl font-bold"
                  style={{
                    color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                  }}
                >
                  Prohibited
                </h3>
              </div>
              <div className="space-y-3">
                {prohibited.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <XCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: brandColors.additional.red }} />
                    <p
                      className="text-sm md:text-base"
                      style={{
                        color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                      }}
                    >
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Consequences Section */}
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
              Enforcement{' '}
              <span
                style={{
                  background: brandColors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Actions
              </span>
            </h2>
            <p
              className="text-base md:text-lg"
              style={{
                color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
              }}
            >
              Violations of our guidelines may result in the following actions
            </p>
          </motion.div>

          <div className="space-y-4">
            {consequences.map((consequence, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className="p-6 rounded-xl"
                style={{
                  backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                  border: `2px solid ${consequence.color}40`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-3 rounded-lg flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${consequence.color} 0%, ${consequence.color}dd 100%)`,
                    }}
                  >
                    <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4
                      className="text-lg font-bold mb-2"
                      style={{
                        color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                      }}
                    >
                      {consequence.level}
                    </h4>
                    <p
                      className="text-sm md:text-base"
                      style={{
                        color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                      }}
                    >
                      {consequence.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
            Questions About Guidelines?
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
            If you have questions or need to report a violation, our support team is here to help.
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
