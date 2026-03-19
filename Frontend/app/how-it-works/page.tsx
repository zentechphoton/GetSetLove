'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { brandColors } from '@/lib/colors'
import Link from 'next/link'
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon,
  UserGroupIcon,
  ClockIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/solid'
import {
  UserPlusIcon as UserPlusOutline,
  MagnifyingGlassIcon as MagnifyingGlassOutline,
  HeartIcon as HeartOutline,
  ChatBubbleLeftRightIcon as ChatOutline,
} from '@heroicons/react/24/outline'

export default function HowItWorksPage() {
  const { theme } = useTheme()
  const currentTheme = theme || 'light'

  const steps = [
    {
      number: 1,
      title: 'Create Your Profile',
      description: 'Sign up in seconds with your email or social media account. Add photos, interests, and what you\'re looking for.',
      icon: UserPlusIcon,
      iconOutline: UserPlusOutline,
      color: brandColors.primary.purple,
      gradient: brandColors.gradients.primary,
    },
    {
      number: 2,
      title: 'Discover Matches',
      description: 'Our smart algorithm finds compatible matches based on your preferences, interests, and location.',
      icon: MagnifyingGlassIcon,
      iconOutline: MagnifyingGlassOutline,
      color: brandColors.primary.pink,
      gradient: brandColors.gradients.warm,
    },
    {
      number: 3,
      title: 'Connect & Chat',
      description: 'Start meaningful conversations with your matches. Break the ice with fun conversation starters.',
      icon: ChatBubbleLeftRightIcon,
      iconOutline: ChatOutline,
      color: brandColors.primary.orange,
      gradient: brandColors.gradients.secondary,
    },
    {
      number: 4,
      title: 'Find Your Match',
      description: 'When you both like each other, it\'s a match! Start chatting and plan your first date.',
      icon: HeartIcon,
      iconOutline: HeartOutline,
      color: brandColors.primary.pink,
      gradient: brandColors.gradients.primary,
    },
  ]

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Safe & Secure',
      description: 'Your privacy and safety are our top priorities. We use advanced encryption to protect your data.',
      color: brandColors.additional.green,
    },
    {
      icon: SparklesIcon,
      title: 'Smart Matching',
      description: 'Our AI-powered algorithm learns your preferences to suggest the most compatible matches.',
      color: brandColors.primary.purple,
    },
    {
      icon: UserGroupIcon,
      title: 'Active Community',
      description: 'Join thousands of active members looking for meaningful connections and relationships.',
      color: brandColors.primary.pink,
    },
    {
      icon: ClockIcon,
      title: 'Quick Setup',
      description: 'Get started in minutes. No lengthy questionnaires or complicated sign-up process.',
      color: brandColors.primary.orange,
    },
  ]

  const stats = [
    { number: '10M+', label: 'Active Members', icon: UserGroupIcon },
    { number: '50M+', label: 'Matches Made', icon: HeartIcon },
    { number: '95%', label: 'Success Rate', icon: StarIcon },
    { number: '150+', label: 'Countries', icon: GlobeAltIcon },
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
        className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden"
      >
        {/* Background Gradient */}
        <div
          className="absolute inset-0 opacity-10 dark:opacity-5"
          style={{
            background: brandColors.gradients.primary,
          }}
        />

        {/* Decorative Elements */}
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
              How It Works
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
            Find Your Perfect Match in{' '}
            <span
              style={{
                background: brandColors.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              4 Simple Steps
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
            Join thousands of happy couples who found love through our platform.
            Our simple, intuitive process makes finding your perfect match easier than ever.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl font-bold text-white uppercase tracking-wider relative overflow-hidden"
                style={{
                  background: brandColors.gradients.primary,
                  boxShadow: `0 8px 24px ${brandColors.primary.purple}50`,
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${brandColors.additional.hoverPurple} 0%, ${brandColors.primary.pink} 100%)`,
                    opacity: 0,
                  }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ArrowRightIcon className="h-5 w-5" />
                </span>
              </motion.button>
            </Link>
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl font-bold uppercase tracking-wider border-2"
                style={{
                  color: brandColors.primary.purple,
                  borderColor: brandColors.primary.purple,
                  backgroundColor: 'transparent',
                }}
              >
                Already a Member?
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Steps Section */}
      <section className="py-16 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {steps.map((step, index) => {
              const Icon = step.icon
              const IconOutline = step.iconOutline
              return (
                <motion.div
                  key={step.number}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="relative group"
                >
                  {/* Connection Line (Desktop) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-24 left-full w-full h-0.5 z-0" style={{ background: brandColors.gradients.primary, opacity: 0.3 }} />
                  )}

                  <motion.div
                    className="relative h-full p-6 md:p-8 rounded-2xl overflow-hidden"
                    style={{
                      backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                      border: `2px solid ${currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'}`,
                    }}
                    whileHover={{
                      borderColor: step.color,
                      boxShadow: `0 20px 40px ${step.color}30`,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Background Gradient on Hover */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-10"
                      style={{
                        background: step.gradient,
                      }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Step Number */}
                    <motion.div
                      className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                      style={{
                        background: step.gradient,
                        color: '#ffffff',
                      }}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {step.number}
                    </motion.div>

                    {/* Icon */}
                    <motion.div
                      className="mb-6 relative z-10"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: step.gradient,
                          boxShadow: `0 8px 24px ${step.color}40`,
                        }}
                      >
                        <Icon className="h-8 w-8 text-white" />
                        <motion.div
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: step.gradient,
                            opacity: 0,
                          }}
                          whileHover={{ opacity: 0.3, scale: 1.2 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3
                        className="text-xl md:text-2xl font-bold mb-3"
                        style={{
                          color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                        }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-sm md:text-base leading-relaxed"
                        style={{
                          color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                        }}
                      >
                        {step.description}
                      </p>
                    </div>

                    {/* Decorative Arrow (Mobile) */}
                    {index < steps.length - 1 && (
                      <div className="lg:hidden flex justify-center mt-6">
                        <motion.div
                          animate={{ y: [0, 10, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <ArrowRightIcon
                            className="h-6 w-6 transform rotate-90"
                            style={{ color: brandColors.primary.purple }}
                          />
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-16 md:py-24 relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            background: brandColors.gradients.primary,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center p-6 rounded-2xl"
                  style={{
                    backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                    border: `1px solid ${currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'}`,
                  }}
                >
                  <motion.div
                    className="inline-block mb-4 p-3 rounded-xl"
                    style={{
                      background: brandColors.gradients.primary,
                    }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </motion.div>
                  <motion.h3
                    className="text-3xl md:text-4xl font-extrabold mb-2"
                    style={{
                      background: brandColors.gradients.primary,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {stat.number}
                  </motion.h3>
                  <p
                    className="text-sm md:text-base font-medium"
                    style={{
                      color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    {stat.label}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4"
              style={{
                color: currentTheme === 'dark' ? '#ffffff' : '#111827',
              }}
            >
              Why Choose{' '}
              <span
                style={{
                  background: brandColors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Get Set Love
              </span>
              ?
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{
                color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
              }}
            >
              We're committed to helping you find meaningful connections with features designed for your success.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
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
                      background: brandColors.gradients.primary,
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
                        background: brandColors.gradients.primary,
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
        {/* Dark Overlay for Better Contrast */}
        <div
          className="absolute inset-0"
          style={{
            background: currentTheme === 'dark'
              ? 'rgba(15, 23, 42, 0.95)'
              : 'rgba(0, 0, 0, 0.7)',
          }}
        />

        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: brandColors.gradients.primary,
            opacity: currentTheme === 'dark' ? 0.3 : 0.4,
          }}
        />

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: brandColors.primary.purple }} />
          <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: brandColors.primary.pink }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-white"
            style={{
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            Ready to Find Your Perfect Match?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-lg md:text-xl mb-8 text-white"
            style={{
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
              fontWeight: '500',
            }}
          >
            Join thousands of happy couples who found love through our platform.
            Start your journey today!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl font-bold text-white uppercase tracking-wider relative overflow-hidden"
                style={{
                  background: brandColors.gradients.primary,
                  boxShadow: '0 8px 24px rgba(157, 0, 255, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${brandColors.additional.hoverPurple} 0%, ${brandColors.primary.pink} 100%)`,
                    opacity: 0,
                  }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Create Free Account
                  <ArrowRightIcon className="h-5 w-5" />
                </span>
              </motion.button>
            </Link>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl font-bold uppercase tracking-wider border-2 text-white relative overflow-hidden"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    opacity: 0,
                  }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10">Learn More</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
