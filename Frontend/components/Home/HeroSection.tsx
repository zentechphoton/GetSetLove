'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { brandColors } from '@/lib/colors'
import { 
  ArrowRightIcon, 
  UserGroupIcon, 
  HeartIcon, 
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1920&q=80&auto=format&fit=crop"
            alt="Happy couple"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            style={{
              transform: `scale(${1 + (mousePosition.x / 2000)}) translate(${mousePosition.x / 100}px, ${mousePosition.y / 100}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
        </div>
        
        {/* Gradient Overlays */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${brandColors.primary.purple}88 0%, ${brandColors.primary.pink}99 50%, ${brandColors.primary.purple}88 100%)`,
            transition: 'background 0.3s ease-out',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-pink-900/50 to-purple-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        
        {/* Animated Blob Shapes for Depth */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: brandColors.primary.purple }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: brandColors.primary.pink }}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Subtle Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Floating Profile Cards (Dating App Style) */}
      <div className="absolute inset-0 z-5 pointer-events-none hidden lg:block">
        <motion.div
          className="absolute top-1/4 left-[10%] w-56 h-72 rounded-3xl shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(157, 0, 255, 0.2)',
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="relative w-full h-full">
            <img
              src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=80&auto=format&fit=crop"
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="text-lg font-bold">Sarah, 28</div>
              <div className="text-sm opacity-90">New York</div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          className="absolute top-1/3 right-[10%] w-56 h-72 rounded-3xl shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 0, 110, 0.2)',
          }}
          animate={{
            y: [0, 30, 0],
            rotate: [0, -8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <div className="relative w-full h-full">
            <img
              src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80&auto=format&fit=crop"
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="text-lg font-bold">Mike, 32</div>
              <div className="text-sm opacity-90">Los Angeles</div>
            </div>
          </div>
        </motion.div>
        
        {/* Third floating card */}
        <motion.div
          className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-48 h-64 rounded-3xl shadow-2xl overflow-hidden opacity-80"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(15px)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.25)',
          }}
          animate={{
            y: [0, -25, 0],
            rotate: [0, 5, 0],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <div className="relative w-full h-full">
            <img
              src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&q=80&auto=format&fit=crop"
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <div className="text-base font-bold">Emma, 26</div>
              <div className="text-xs opacity-90">Chicago</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold backdrop-blur-xl shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 20px rgba(255, 255, 255, 0.1)',
              }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <SparklesIcon className="h-5 w-5" />
              </motion.div>
              Trusted by 100K+ Singles
            </motion.span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white mb-6 sm:mb-8 leading-[1.1] tracking-tight"
            style={{
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(157, 0, 255, 0.2)',
            }}
          >
            Find Your Perfect
            <br />
            <motion.span 
              className="block mt-2 sm:mt-4 relative"
              style={{
                background: `linear-gradient(135deg, #ffffff 0%, #f0f0f0 30%, #ffffff 60%, #f0f0f0 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                backgroundSize: '200% auto',
                animation: 'shimmer 3s linear infinite',
              }}
            >
              Match Today
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${brandColors.primary.pink}, transparent)`,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
              />
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl md:text-3xl text-white mb-10 sm:mb-12 leading-relaxed max-w-3xl mx-auto font-light px-4"
            style={{
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            Connect with like-minded singles, build meaningful relationships, and start your journey to lasting love.
          </motion.p>
              
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 px-4"
          >
            <Link href="/auth/register" className="w-full sm:w-auto group">
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-50 active:bg-gray-100 px-10 sm:px-12 py-5 sm:py-6 text-lg sm:text-xl font-bold rounded-full shadow-2xl transform transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden"
                style={{
                  boxShadow: '0 20px 60px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.2)',
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10">Start Your Journey</span>
                <ArrowRightIcon className="h-6 w-6 group-hover:translate-x-2 transition-transform relative z-10" />
              </motion.button>
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto group">
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/25 active:bg-white/35 px-10 sm:px-12 py-5 sm:py-6 text-lg sm:text-xl font-bold rounded-full backdrop-blur-xl transition-all duration-300 relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10">Sign In</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-12 text-white px-4"
          >
            <motion.div
              whileHover={{ scale: 1.1, y: -5 }}
              className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 group cursor-default p-4 sm:p-6 rounded-2xl backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div 
                className="p-4 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 4px 20px rgba(157, 0, 255, 0.3)',
                }}
              >
                <UserGroupIcon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-black mb-1">100K+</div>
                <div className="text-sm sm:text-base font-medium opacity-95">Active Members</div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.1, y: -5 }}
              className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 group cursor-default p-4 sm:p-6 rounded-2xl backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div 
                className="p-4 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 4px 20px rgba(255, 0, 110, 0.3)',
                }}
              >
                <HeartIcon className="h-7 w-7 sm:h-8 sm:w-8 text-pink-200" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-black mb-1">50K+</div>
                <div className="text-sm sm:text-base font-medium opacity-95">Successful Matches</div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.1, y: -5 }}
              className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 group cursor-default p-4 sm:p-6 rounded-2xl backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div 
                className="p-4 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                }}
              >
                <ShieldCheckIcon className="h-7 w-7 sm:h-8 sm:w-8 text-green-200" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-black mb-1">100%</div>
                <div className="text-sm sm:text-base font-medium opacity-95">Verified Profiles</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 z-10 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-white/80 rounded-full flex justify-center p-2 backdrop-blur-sm"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-3 bg-white rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
