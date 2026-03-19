'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { brandColors } from '@/lib/colors'
import Link from 'next/link'
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  EyeIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  BellIcon,
} from '@heroicons/react/24/solid'

export default function SafetyTipsPage() {
  const { theme } = useTheme()
  const currentTheme = theme || 'light'

  const safetyTips = [
    {
      icon: ShieldCheckIcon,
      title: 'Verify Profiles',
      description: 'Always verify that profiles are authentic. Look for verified badges and complete profiles with multiple photos.',
      color: brandColors.primary.purple,
      gradient: brandColors.gradients.primary,
    },
    {
      icon: LockClosedIcon,
      title: 'Protect Your Privacy',
      description: 'Never share personal information like your home address, phone number, or financial details until you\'ve built trust.',
      color: brandColors.primary.pink,
      gradient: brandColors.gradients.warm,
    },
    {
      icon: EyeIcon,
      title: 'Stay Alert',
      description: 'Be cautious of profiles with limited information, overly perfect photos, or requests for money or personal favors.',
      color: brandColors.primary.orange,
      gradient: brandColors.gradients.secondary,
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Communicate Safely',
      description: 'Use our in-app messaging system. Avoid sharing personal contact information until you\'re comfortable.',
      color: brandColors.primary.purple,
      gradient: brandColors.gradients.primary,
    },
    {
      icon: UserGroupIcon,
      title: 'Meet in Public',
      description: 'For your first meeting, always choose a public place and let a friend or family member know where you\'re going.',
      color: brandColors.primary.pink,
      gradient: brandColors.gradients.warm,
    },
    {
      icon: BellIcon,
      title: 'Report Suspicious Activity',
      description: 'If you encounter suspicious behavior, report it immediately. Our safety team reviews all reports within 24 hours.',
      color: brandColors.primary.orange,
      gradient: brandColors.gradients.secondary,
    },
  ]

  const redFlags = [
    'Asks for money or financial assistance',
    'Refuses to video chat or meet in person',
    'Has inconsistent or vague information',
    'Pressures you to move conversations off the platform',
    'Requests personal information too quickly',
    'Has photos that seem too good to be true',
  ]

  const doAndDont = {
    do: [
      'Take your time getting to know someone',
      'Trust your instincts',
      'Keep conversations on the platform initially',
      'Meet in public places for first dates',
      'Tell friends or family about your plans',
      'Report any suspicious behavior',
    ],
    dont: [
      'Share personal financial information',
      'Send money to anyone you meet online',
      'Ignore red flags or warning signs',
      'Meet in private locations initially',
      'Share your home address too quickly',
      'Feel pressured to meet before you\'re ready',
    ],
  }

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
              Safety First
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
            Your Safety is Our{' '}
            <span
              style={{
                background: brandColors.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Top Priority
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
            Learn how to stay safe while finding your perfect match. Your security and privacy matter to us.
          </motion.p>
        </div>
      </motion.section>

      {/* Safety Tips Grid */}
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
              Essential Safety{' '}
              <span
                style={{
                  background: brandColors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Tips
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
            {safetyTips.map((tip, index) => {
              const Icon = tip.icon
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
                      background: tip.gradient,
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
                        background: tip.gradient,
                        boxShadow: `0 8px 24px ${tip.color}40`,
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
                    {tip.title}
                  </h3>
                  <p
                    className="text-sm md:text-base leading-relaxed relative z-10"
                    style={{
                      color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    {tip.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Red Flags Section */}
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
              Warning{' '}
              <span
                style={{
                  background: brandColors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Signs
              </span>
            </h2>
            <p
              className="text-base md:text-lg"
              style={{
                color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
              }}
            >
              Be aware of these red flags that may indicate a scam or unsafe situation
            </p>
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
              {redFlags.map((flag, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0" style={{ color: brandColors.additional.red }} />
                  <p
                    className="text-sm md:text-base font-medium"
                    style={{
                      color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563',
                    }}
                  >
                    {flag}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Do's and Don'ts Section */}
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
              Do's and{' '}
              <span
                style={{
                  background: brandColors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Don'ts
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Do's */}
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
                  Do's
                </h3>
              </div>
              <div className="space-y-3">
                {doAndDont.do.map((item, index) => (
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

            {/* Don'ts */}
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
                  Don'ts
                </h3>
              </div>
              <div className="space-y-3">
                {doAndDont.dont.map((item, index) => (
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

      {/* Report Section */}
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
            Report Suspicious Activity
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
            If you encounter any suspicious behavior, report it immediately. We take all reports seriously.
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
                  Report an Issue
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
