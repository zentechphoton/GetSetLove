'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { brandColors } from '@/lib/colors'
import Link from 'next/link'
import {
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  ArrowRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'
import {
  MagnifyingGlassIcon as SearchOutline,
} from '@heroicons/react/24/outline'

export default function FAQPage() {
  const { theme } = useTheme()
  const currentTheme = theme || 'light'
  const [searchQuery, setSearchQuery] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    {
      id: 'general',
      name: 'General',
      icon: SparklesIcon,
      color: brandColors.primary.purple,
      gradient: brandColors.gradients.primary,
    },
    {
      id: 'account',
      name: 'Account',
      icon: QuestionMarkCircleIcon,
      color: brandColors.primary.pink,
      gradient: brandColors.gradients.warm,
    },
    {
      id: 'matching',
      name: 'Matching',
      icon: SparklesIcon,
      color: brandColors.primary.orange,
      gradient: brandColors.gradients.secondary,
    },
    {
      id: 'safety',
      name: 'Safety',
      icon: QuestionMarkCircleIcon,
      color: brandColors.primary.purple,
      gradient: brandColors.gradients.primary,
    },
  ]

  const faqs = [
    // General Questions
    {
      id: 1,
      category: 'general',
      question: 'What is Get Set Love?',
      answer: 'Get Set Love is a modern dating platform designed to help you find meaningful connections. We use advanced matching algorithms to connect you with compatible people based on your interests, values, and preferences.',
    },
    {
      id: 2,
      category: 'general',
      question: 'Is Get Set Love free to use?',
      answer: 'Yes! You can create a profile, browse matches, and send messages for free. We also offer premium features that enhance your experience, such as seeing who liked you, unlimited likes, and advanced filters.',
    },
    {
      id: 3,
      category: 'general',
      question: 'How do I get started?',
      answer: 'Getting started is easy! Simply sign up with your email or social media account, complete your profile with photos and information about yourself, and start swiping to find your perfect match.',
    },
    {
      id: 4,
      category: 'general',
      question: 'Can I use Get Set Love on mobile?',
      answer: 'Yes! We have native mobile apps for both iOS and Android. You can download them from the App Store or Google Play Store. Our website is also fully responsive and works great on mobile browsers.',
    },
    {
      id: 5,
      category: 'general',
      question: 'What age do I need to be to use Get Set Love?',
      answer: 'You must be at least 18 years old to use Get Set Love. We verify age during the registration process to ensure compliance with our terms of service.',
    },
    {
      id: 6,
      category: 'general',
      question: 'How much does premium membership cost?',
      answer: 'Premium membership pricing varies by subscription length. Monthly plans start at $9.99/month, with discounts available for 3-month and 6-month subscriptions. Check our pricing page for current offers and promotions.',
    },
    {
      id: 7,
      category: 'general',
      question: 'What features are included in premium membership?',
      answer: 'Premium members enjoy unlimited likes, see who liked them, advanced filters, read receipts, priority customer support, and access to exclusive events and features.',
    },
    {
      id: 8,
      category: 'general',
      question: 'Can I cancel my premium subscription?',
      answer: 'Yes, you can cancel your premium subscription at any time from your account settings. Your premium features will remain active until the end of your current billing period.',
    },
    {
      id: 9,
      category: 'general',
      question: 'How do I contact customer support?',
      answer: 'You can contact our support team through the Help Center, email us at support@getsetlove.com, or use the in-app support feature. Premium members receive priority support with faster response times.',
    },
    {
      id: 10,
      category: 'general',
      question: 'What languages does Get Set Love support?',
      answer: 'Currently, Get Set Love is available in English, Spanish, French, German, and Italian. We\'re continuously working to add more languages to serve our global community.',
    },
    {
      id: 11,
      category: 'general',
      question: 'How many people use Get Set Love?',
      answer: 'Get Set Love has millions of active users worldwide. Our community is growing every day, giving you more opportunities to find your perfect match.',
    },
    {
      id: 12,
      category: 'general',
      question: 'Is Get Set Love available in my country?',
      answer: 'Get Set Love is available in over 150 countries worldwide. Check our website or app store listing to see if we\'re available in your region.',
    },
    // Account Questions
    {
      id: 13,
      category: 'account',
      question: 'How do I verify my account?',
      answer: 'To verify your account, go to Settings > Account Verification. You\'ll need to provide a valid email address and phone number. We may also ask for a photo verification to ensure authenticity.',
    },
    {
      id: 14,
      category: 'account',
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account at any time. Go to Settings > Account > Delete Account. Please note that this action is permanent and all your data will be removed. You can also temporarily deactivate your account instead.',
    },
    {
      id: 15,
      category: 'account',
      question: 'How do I change my password?',
      answer: 'Navigate to Settings > Account Security > Change Password. Enter your current password and your new password twice to confirm. Make sure your new password is strong and unique.',
    },
    {
      id: 16,
      category: 'account',
      question: 'How do I update my profile?',
      answer: 'Go to your profile page and click the "Edit Profile" button. You can update your photos, bio, interests, and preferences at any time. Keeping your profile updated helps you get better matches.',
    },
    {
      id: 17,
      category: 'account',
      question: 'How do I change my email address?',
      answer: 'Go to Settings > Account > Email Address. Enter your new email address and verify it through the confirmation email we\'ll send you. Your old email will be disconnected once verified.',
    },
    {
      id: 18,
      category: 'account',
      question: 'Can I have multiple accounts?',
      answer: 'No, each person is allowed only one account. Creating multiple accounts violates our terms of service and may result in all accounts being permanently banned.',
    },
    {
      id: 19,
      category: 'account',
      question: 'How do I deactivate my account temporarily?',
      answer: 'Go to Settings > Account > Deactivate Account. This will hide your profile from others while keeping your data. You can reactivate at any time by logging back in.',
    },
    {
      id: 20,
      category: 'account',
      question: 'What happens to my data when I delete my account?',
      answer: 'When you delete your account, all your personal information, photos, messages, and matches are permanently removed from our servers. This action cannot be undone.',
    },
    {
      id: 21,
      category: 'account',
      question: 'How do I update my profile photos?',
      answer: 'Go to your profile, click on any photo, and select "Edit Photos". You can add, remove, or reorder your photos. We recommend having at least 3-5 photos for the best results.',
    },
    {
      id: 22,
      category: 'account',
      question: 'Can I change my username?',
      answer: 'Your username is set during registration and cannot be changed. However, you can update your display name and bio at any time from your profile settings.',
    },
    {
      id: 23,
      category: 'account',
      question: 'How do I manage my notification settings?',
      answer: 'Go to Settings > Notifications to customize which notifications you receive. You can control email notifications, push notifications, and in-app alerts.',
    },
    {
      id: 24,
      category: 'account',
      question: 'What should I do if I forgot my password?',
      answer: 'Click "Forgot Password" on the login page and enter your email address. We\'ll send you a password reset link. Make sure to check your spam folder if you don\'t see it.',
    },
    // Matching Questions
    {
      id: 25,
      category: 'matching',
      question: 'How does the matching algorithm work?',
      answer: 'Our algorithm considers multiple factors including your preferences, interests, location, and compatibility scores. The more complete your profile, the better matches you\'ll receive. We continuously learn from your interactions to improve suggestions.',
    },
    {
      id: 26,
      category: 'matching',
      question: 'Can I see who liked me?',
      answer: 'With a free account, you can see a limited number of people who liked you. Premium members get unlimited access to see everyone who has liked their profile, along with additional insights.',
    },
    {
      id: 27,
      category: 'matching',
      question: 'How do I unmatch with someone?',
      answer: 'To unmatch, go to your conversations, open the chat with the person, tap the three-dot menu, and select "Unmatch". This will remove the match and all conversation history.',
    },
    {
      id: 28,
      category: 'matching',
      question: 'Why am I not getting matches?',
      answer: 'Make sure your profile is complete with multiple photos and a detailed bio. Be active on the platform and engage with profiles. You can also adjust your preferences and expand your search radius to see more potential matches.',
    },
    {
      id: 29,
      category: 'matching',
      question: 'How do I adjust my match preferences?',
      answer: 'Go to Settings > Discovery Preferences to adjust age range, distance, and other filters. You can also specify what you\'re looking for in a match.',
    },
    {
      id: 30,
      category: 'matching',
      question: 'Can I undo a swipe?',
      answer: 'Premium members can use the "Rewind" feature to undo their last swipe. Free members can undo swipes within a limited time window after swiping.',
    },
    {
      id: 31,
      category: 'matching',
      question: 'How do I send a message to a match?',
      answer: 'Once you match with someone, go to your Messages tab, find the conversation, and start typing. You can send text messages, photos, and emojis to your matches.',
    },
    {
      id: 32,
      category: 'matching',
      question: 'What happens when I like someone?',
      answer: 'When you like someone, they\'ll see you in their "Likes" section. If they like you back, it\'s a match! You\'ll both be notified and can start messaging each other.',
    },
    {
      id: 33,
      category: 'matching',
      question: 'How do I block someone?',
      answer: 'Go to the person\'s profile, tap the three-dot menu, and select "Block User". Blocked users cannot see your profile, message you, or match with you.',
    },
    {
      id: 34,
      category: 'matching',
      question: 'Can I see if someone read my message?',
      answer: 'Premium members can see read receipts when their messages have been read. Free members can upgrade to premium to access this feature.',
    },
    {
      id: 35,
      category: 'matching',
      question: 'How do I find matches in a different location?',
      answer: 'Go to Settings > Discovery Preferences and adjust your location settings. You can change your location or expand your search radius to find matches in other areas.',
    },
    {
      id: 36,
      category: 'matching',
      question: 'What is Super Like and how do I use it?',
      answer: 'Super Like is a way to show extra interest in someone. When you Super Like someone, they\'ll see a special notification. Free members get a limited number of Super Likes per day.',
    },
    // Safety Questions
    {
      id: 37,
      category: 'safety',
      question: 'How do I report inappropriate behavior?',
      answer: 'If you encounter any inappropriate behavior, click on the user\'s profile, select the three-dot menu, and choose "Report User". Our safety team reviews all reports within 24 hours and takes appropriate action.',
    },
    {
      id: 38,
      category: 'safety',
      question: 'Is my personal information safe?',
      answer: 'Absolutely! We use industry-standard encryption to protect your data. Your personal information is never shared with third parties without your explicit consent. We also offer privacy settings to control what information is visible to others.',
    },
    {
      id: 39,
      category: 'safety',
      question: 'What should I do if I feel unsafe?',
      answer: 'Your safety is our top priority. If you feel unsafe, immediately block and report the user. You can also contact our 24/7 safety support team. In case of emergency, contact local authorities immediately.',
    },
    {
      id: 40,
      category: 'safety',
      question: 'How do I block someone?',
      answer: 'Go to the person\'s profile, tap the three-dot menu, and select "Block User". Once blocked, they cannot see your profile, message you, or interact with you in any way.',
    },
    {
      id: 41,
      category: 'safety',
      question: 'What information is visible on my profile?',
      answer: 'By default, your profile shows your photos, bio, age, and location (city level). You can adjust privacy settings to control what information is visible to others.',
    },
    {
      id: 42,
      category: 'safety',
      question: 'How do I report a fake profile?',
      answer: 'If you suspect a profile is fake, report it immediately by going to their profile, selecting the three-dot menu, and choosing "Report User" > "Fake Profile". Our team will investigate promptly.',
    },
    {
      id: 43,
      category: 'safety',
      question: 'What should I do if someone asks for money?',
      answer: 'Never send money to anyone you meet on Get Set Love. This is likely a scam. Immediately block and report the user. Contact our safety team if you\'ve already sent money.',
    },
    {
      id: 44,
      category: 'safety',
      question: 'How do I stay safe when meeting someone in person?',
      answer: 'Always meet in a public place, tell a friend or family member where you\'re going, keep your phone charged, and trust your instincts. If something feels off, leave immediately.',
    },
    {
      id: 45,
      category: 'safety',
      question: 'Can I hide my profile from certain people?',
      answer: 'Yes, you can block specific users to hide your profile from them. You can also adjust your discovery settings to control who can see your profile.',
    },
    {
      id: 46,
      category: 'safety',
      question: 'How do I verify someone is real?',
      answer: 'Look for verified badges, complete profiles with multiple photos, and consistent information. Be cautious of profiles with limited information or photos that seem too good to be true.',
    },
    {
      id: 47,
      category: 'safety',
      question: 'What happens when I report someone?',
      answer: 'Our safety team reviews all reports within 24 hours. If a violation is confirmed, we take appropriate action which may include warnings, temporary suspension, or permanent ban.',
    },
    {
      id: 48,
      category: 'safety',
      question: 'How do I protect my privacy?',
      answer: 'Use our privacy settings to control what information is visible. Never share personal details like your address, phone number, or financial information until you\'ve built trust with someone.',
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

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const containerVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
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
              Frequently Asked Questions
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
            Got{' '}
            <span
              style={{
                background: brandColors.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Questions?
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
            Find quick answers to the most common questions about Get Set Love.
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
                placeholder="Search for answers..."
                className="w-full pl-12 pr-12 py-4 rounded-xl border-2 focus:outline-none transition-all duration-200"
                style={{
                  backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                  borderColor: searchQuery ? brandColors.primary.purple : (currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'),
                  color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                }}
              />
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XMarkIcon className="h-5 w-5" style={{ color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2
              className="text-xl md:text-2xl font-extrabold mb-4"
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

          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
            {categories.map((category, index) => {
              const Icon = category.icon
              const isSelected = selectedCategory === category.id
              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                  className="px-4 py-2.5 md:px-6 md:py-3 rounded-xl flex items-center gap-2 md:gap-3 relative overflow-hidden group"
                  style={{
                    background: isSelected
                      ? category.gradient
                      : (currentTheme === 'dark' ? '#1e293b' : '#f8fafc'),
                    border: `2px solid ${isSelected ? category.color : (currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)')}`,
                    color: isSelected ? '#ffffff' : (currentTheme === 'dark' ? '#d1d5db' : '#4b5563'),
                  }}
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-sm md:text-base font-semibold">{category.name}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0"
                      style={{
                        background: category.gradient,
                        opacity: 0.2,
                      }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQs Accordion Section */}
      <section className="py-8 md:py-12 pb-16 md:pb-24">
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
              Common{' '}
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

          {searchedFAQs.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4"
            >
              {searchedFAQs.map((faq, index) => {
                const isOpen = openIndex === index
                return (
                  <motion.div
                    key={faq.id}
                    variants={itemVariants}
                    className="rounded-xl overflow-hidden"
                    style={{
                      backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                      border: `2px solid ${isOpen ? brandColors.primary.purple : (currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)')}`,
                    }}
                  >
                    <motion.button
                      onClick={() => toggleFAQ(index)}
                      className="w-full p-5 md:p-6 text-left flex items-center justify-between gap-4 group"
                      whileHover={{ backgroundColor: currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.05)' : 'rgba(157, 0, 255, 0.03)' }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <motion.div
                          className="p-2 rounded-lg flex-shrink-0"
                          style={{
                            background: brandColors.gradients.primary,
                          }}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <QuestionMarkCircleIcon className="h-5 w-5 text-white" />
                        </motion.div>
                        <h3
                          className="text-base md:text-lg font-bold flex-1"
                          style={{
                            color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                          }}
                        >
                          {faq.question}
                        </h3>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                        style={{
                          color: isOpen ? brandColors.primary.purple : (currentTheme === 'dark' ? '#9ca3af' : '#6b7280'),
                        }}
                      >
                        {isOpen ? (
                          <ChevronUpIcon className="h-6 w-6" />
                        ) : (
                          <ChevronDownIcon className="h-6 w-6" />
                        )}
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 md:px-6 pb-5 md:pb-6">
                            <div className="pl-11">
                              <div
                                className="h-0.5 w-12 mb-4 rounded-full"
                                style={{
                                  background: brandColors.gradients.primary,
                                }}
                              />
                              <p
                                className="text-sm md:text-base leading-relaxed"
                                style={{
                                  color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                                }}
                              >
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <QuestionMarkCircleIcon
                className="h-16 w-16 mx-auto mb-4"
                style={{ color: currentTheme === 'dark' ? '#4b5563' : '#9ca3af' }}
              />
              <p
                className="text-lg font-medium mb-2"
                style={{
                  color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                }}
              >
                No results found
              </p>
              <p
                className="text-sm md:text-base"
                style={{
                  color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                }}
              >
                Try a different search term or category
              </p>
            </motion.div>
          )}
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
            Still Have Questions?
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
            Can't find the answer you're looking for? Our support team is here to help!
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
                  Contact Support
                  <ArrowRightIcon className="h-5 w-5" />
                </span>
              </motion.button>
            </Link>
            <Link href="/help">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl font-bold uppercase tracking-wider border-2 text-white"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                Visit Help Center
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
