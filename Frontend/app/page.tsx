'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import HeroSection from '@/components/Home/HeroSection'
import { Button } from '@/components/UI/Button'
import { brandColors } from '@/lib/colors'
import { 
  SparklesIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/solid'

export default function HomePage() {
  const router = useRouter()
  const { user, token, initialize, _hasHydrated } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const initializedRef = useRef(false)
  const mountedRef = useRef(false)

  // Initialize auth store once
  useEffect(() => {
    if (!initializedRef.current) {
      initialize()
      initializedRef.current = true
    }
  }, [initialize])

  // Handle mounting and redirect
  useEffect(() => {
    if (!_hasHydrated) {
      return // Wait for hydration
    }
    
    if (!mountedRef.current) {
      setMounted(true)
      mountedRef.current = true
    }
    
    if (token && user) {
      const timer = setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [token, user, router, _hasHydrated])

  if (!mounted) {
    return null
  }

  if (token && user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.gradients.primary }}>
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <p className="text-lg font-medium">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 dark:text-white" style={{ color: brandColors.primary.purple }}>
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Finding your perfect match is easier than ever with our simple three-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="text-center p-6 sm:p-8 bg-white dark:bg-slate-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{
                  background: brandColors.gradients.primary,
                }}
              >
                <span className="text-2xl sm:text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 dark:text-white" style={{ color: brandColors.primary.purple }}>
                Create Your Profile
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Sign up in minutes and build your profile with photos, interests, and what you're looking for in a partner.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center p-6 sm:p-8 bg-white dark:bg-slate-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{
                  background: brandColors.gradients.warm,
                }}
              >
                <span className="text-2xl sm:text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 dark:text-white" style={{ color: brandColors.primary.purple }}>
                Discover Matches
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Our intelligent matching algorithm connects you with compatible singles based on your preferences and interests.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center p-6 sm:p-8 bg-white dark:bg-slate-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{
                  background: brandColors.gradients.secondary,
                }}
              >
                <span className="text-2xl sm:text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 dark:text-white" style={{ color: brandColors.primary.purple }}>
                Start Connecting
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Chat, video call, and meet up with your matches. Build meaningful connections that lead to lasting relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 dark:text-white" style={{ color: brandColors.primary.purple }}>
                Why Choose Us?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
                We're not just another dating site. We're a community dedicated to helping you find genuine connections.
              </p>
              
              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-start space-x-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: brandColors.gradients.primary,
                    }}
                  >
                    <ShieldCheckIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 dark:text-white" style={{ color: brandColors.primary.purple }}>
                      Secure & Safe
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      Your privacy and safety are our top priorities. All profiles are verified and we have 24/7 support.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: brandColors.gradients.secondary,
                    }}
                  >
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 dark:text-white" style={{ color: brandColors.primary.purple }}>
                      Smart Matching
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      Our advanced algorithm learns your preferences and suggests compatible matches based on compatibility scores.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: brandColors.gradients.warm,
                    }}
                  >
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 dark:text-white" style={{ color: brandColors.primary.purple }}>
                      Real Connections
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      Focus on quality over quantity. Every match is carefully curated to help you find someone special.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80"
                  alt="Happy couple"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
              </div>
              
              {/* Floating Stats */}
              <div
                className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-white dark:bg-slate-700 rounded-2xl p-4 sm:p-6 shadow-xl"
                style={{
                  boxShadow: `0 10px 40px ${brandColors.admin.shadow}`,
                }}
              >
                <div className="text-2xl sm:text-3xl font-bold mb-1 dark:text-white" style={{ color: brandColors.primary.purple }}>
                  98%
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 dark:text-white" style={{ color: brandColors.primary.purple }}>
              Success Stories
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real couples, real love stories. See how we've helped thousands find their perfect match.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=80",
                names: "Sarah & Mike",
                story: "We met through Get set love and it was love at first conversation. Now we're engaged!",
                rating: 5,
              },
              {
                image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&q=80",
                names: "Emma & James",
                story: "After 3 months on the platform, we found each other. Best decision we ever made!",
                rating: 5,
              },
              {
                image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80",
                names: "Lisa & David",
                story: "The matching system brought us together. We're celebrating our first anniversary!",
                rating: 5,
              },
            ].map((story, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-48 sm:h-64">
                  <img
                    src={story.image}
                    alt={story.names}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 dark:text-white" style={{ color: brandColors.primary.purple }}>
                    {story.names}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 italic mb-4">"{story.story}"</p>
                  <div className="flex items-center space-x-1">
                    {[...Array(story.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: brandColors.primary.pink }} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: brandColors.gradients.primary,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1920&q=80"
            alt="Background"
            className="w-full h-full object-cover opacity-20"
            loading="lazy"
          />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Find Your Match?
          </h2>
          <p className="text-lg sm:text-xl text-white/95 mb-8 sm:mb-10">
            Join thousands of singles finding love every day. Your perfect match is just a click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-100 active:bg-gray-200 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-full shadow-xl transform hover:scale-105 active:scale-100 transition-all duration-300 flex items-center justify-center gap-2">
                Create Free Account
                <ArrowRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 active:bg-white/20 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-full backdrop-blur-sm transition-all duration-300">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}