'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { brandColors } from '@/lib/colors'
import toast from 'react-hot-toast'
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  PaperAirplaneIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid'
import {
  EnvelopeIcon as EnvelopeOutline,
  PhoneIcon as PhoneOutline,
  MapPinIcon as MapPinOutline,
  ClockIcon as ClockOutline,
} from '@heroicons/react/24/outline'

export default function ContactPage() {
  const { theme } = useTheme()
  const currentTheme = theme || 'light'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      toast.success('Thank you! Your message has been sent successfully.')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setIsSubmitting(false)
    }, 1500)
  }

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      iconOutline: EnvelopeOutline,
      title: 'Email Us',
      content: 'support@getsetlove.com',
      link: 'mailto:support@getsetlove.com',
      color: brandColors.primary.purple,
      gradient: brandColors.gradients.primary,
    },
    {
      icon: PhoneIcon,
      iconOutline: PhoneOutline,
      title: 'Call Us',
      content: '+1 (234) 567-890',
      link: 'tel:+1234567890',
      color: brandColors.primary.pink,
      gradient: brandColors.gradients.warm,
    },
    {
      icon: MapPinIcon,
      iconOutline: MapPinOutline,
      title: 'Visit Us',
      content: 'Pune, Maharashtra, India',
      link: 'https://www.google.com/maps/place/Pune,+Maharashtra',
      color: brandColors.primary.orange,
      gradient: brandColors.gradients.secondary,
    },
    {
      icon: ClockIcon,
      iconOutline: ClockOutline,
      title: 'Business Hours',
      content: 'Mon - Fri: 9:00 AM - 6:00 PM',
      link: '#',
      color: brandColors.primary.purple,
      gradient: brandColors.gradients.primary,
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
              Get In Touch
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
            We'd Love to{' '}
            <span
              style={{
                background: brandColors.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Hear From You
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
            Have a question, suggestion, or just want to say hello?
            Fill out the form below or reach out to us directly. We're here to help!
          </motion.p>
        </div>
      </motion.section>

      {/* Contact Info Cards */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              const IconOutline = info.iconOutline
              return (
                <motion.a
                  key={info.title}
                  href={info.link}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-6 rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                    border: `2px solid ${currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'}`,
                  }}
                >
                  {/* Background Gradient on Hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10"
                    style={{
                      background: info.gradient,
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Icon */}
                  <motion.div
                    className="mb-4 relative z-10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center relative"
                      style={{
                        background: info.gradient,
                        boxShadow: `0 8px 24px ${info.color}40`,
                      }}
                    >
                      <Icon className="h-7 w-7 text-white" />
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: info.gradient,
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
                      className="text-lg font-bold mb-2"
                      style={{
                        color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                      }}
                    >
                      {info.title}
                    </h3>
                    <p
                      className="text-sm md:text-base"
                      style={{
                        color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                      }}
                    >
                      {info.content}
                    </p>
                  </div>

                  {/* Hover Arrow */}
                  <motion.div
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PaperAirplaneIcon
                      className="h-5 w-5 transform rotate-45"
                      style={{ color: info.color }}
                    />
                  </motion.div>
                </motion.a>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div
                className="p-6 md:p-8 rounded-2xl"
                style={{
                  backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                  border: `2px solid ${currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'}`,
                }}
              >
                <div className="mb-6">
                  <h2
                    className="text-2xl md:text-3xl font-extrabold mb-2"
                    style={{
                      color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                    }}
                  >
                    Send us a{' '}
                    <span
                      style={{
                        background: brandColors.gradients.primary,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      Message
                    </span>
                  </h2>
                  <p
                    className="text-sm md:text-base"
                    style={{
                      color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold mb-2"
                      style={{
                        color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563',
                      }}
                    >
                      <UserIcon className="h-4 w-4 inline mr-2" style={{ color: brandColors.primary.purple }} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all duration-200"
                      style={{
                        backgroundColor: currentTheme === 'dark' ? '#0f172a' : '#ffffff',
                        borderColor: formData.name ? brandColors.primary.purple : (currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'),
                        color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                      }}
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold mb-2"
                      style={{
                        color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563',
                      }}
                    >
                      <EnvelopeIcon className="h-4 w-4 inline mr-2" style={{ color: brandColors.primary.pink }} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all duration-200"
                      style={{
                        backgroundColor: currentTheme === 'dark' ? '#0f172a' : '#ffffff',
                        borderColor: formData.email ? brandColors.primary.pink : (currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'),
                        color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                      }}
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-semibold mb-2"
                      style={{
                        color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563',
                      }}
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 inline mr-2" style={{ color: brandColors.primary.orange }} />
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all duration-200"
                      style={{
                        backgroundColor: currentTheme === 'dark' ? '#0f172a' : '#ffffff',
                        borderColor: formData.subject ? brandColors.primary.orange : (currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'),
                        color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                      }}
                      placeholder="How can we help?"
                    />
                  </div>

                  {/* Message Field */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold mb-2"
                      style={{
                        color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563',
                      }}
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 inline mr-2" style={{ color: brandColors.primary.purple }} />
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all duration-200 resize-none"
                      style={{
                        backgroundColor: currentTheme === 'dark' ? '#0f172a' : '#ffffff',
                        borderColor: formData.message ? brandColors.primary.purple : (currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'),
                        color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                      }}
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-4 rounded-xl font-bold text-white uppercase tracking-wider relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <PaperAirplaneIcon className="h-5 w-5" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Map/Location Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Pune Map */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden relative shadow-2xl"
                style={{
                  border: `2px solid ${currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.3)' : 'rgba(157, 0, 255, 0.2)'}`,
                  boxShadow: `0 20px 60px ${brandColors.primary.purple}30`,
                }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d121058.92818601993!2d73.79292680958435!3d18.524766325203527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf2e67461101%3A0x828d43bf9d9ee343!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1704567890123!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                />
                {/* Gradient Overlay for Branding */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-5"
                  style={{
                    background: brandColors.gradients.primary,
                  }}
                />
                {/* Location Marker Overlay */}
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl"
                    style={{
                      backgroundColor: currentTheme === 'dark'
                        ? 'rgba(17, 24, 39, 0.9)'
                        : 'rgba(255, 255, 255, 0.95)',
                      border: `2px solid ${brandColors.primary.purple}40`,
                      boxShadow: `0 8px 24px ${brandColors.primary.purple}30`,
                    }}
                  >
                    <MapPinIcon
                      className="h-5 w-5 flex-shrink-0"
                      style={{ color: brandColors.primary.purple }}
                    />
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{
                          color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                        }}
                      >
                        Pune, Maharashtra
                      </p>
                      <p
                        className="text-xs"
                        style={{
                          color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                        }}
                      >
                        India
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Additional Info */}
              <div
                className="p-6 md:p-8 rounded-2xl"
                style={{
                  backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                  border: `2px solid ${currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'}`,
                }}
              >
                <h3
                  className="text-xl md:text-2xl font-bold mb-6"
                  style={{
                    color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                  }}
                >
                  Why Contact Us?
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: CheckCircleIcon, text: '24/7 Customer Support' },
                    { icon: CheckCircleIcon, text: 'Quick Response Time' },
                    { icon: CheckCircleIcon, text: 'Expert Team Ready to Help' },
                    { icon: CheckCircleIcon, text: 'Privacy & Security Guaranteed' },
                  ].map((item, index) => {
                    const Icon = item.icon
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div
                          className="p-2 rounded-lg"
                          style={{
                            background: brandColors.gradients.primary,
                          }}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <p
                          className="text-sm md:text-base font-medium"
                          style={{
                            color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563',
                          }}
                        >
                          {item.text}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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
              className="text-3xl md:text-4xl font-extrabold mb-4"
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
            <p
              className="text-base md:text-lg"
              style={{
                color: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
              }}
            >
              Quick answers to common questions
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: 'How quickly will I receive a response?',
                answer: 'We typically respond within 24 hours during business days. For urgent matters, please call us directly.',
              },
              {
                question: 'Can I schedule a call or meeting?',
                answer: 'Absolutely! Mention your preferred time in your message, and we\'ll coordinate a convenient time for both parties.',
              },
              {
                question: 'Do you offer support in multiple languages?',
                answer: 'Yes, we provide support in English, Spanish, French, and several other languages. Let us know your preference!',
              },
              {
                question: 'Is my information secure?',
                answer: 'Your privacy is our priority. All information is encrypted and handled with the utmost care and security.',
              },
            ].map((faq, index) => (
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
                  border: `2px solid ${currentTheme === 'dark' ? 'rgba(157, 0, 255, 0.2)' : 'rgba(157, 0, 255, 0.1)'}`,
                }}
              >
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
