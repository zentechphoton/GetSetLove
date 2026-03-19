'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRegister } from '@/lib/auth-apollo'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Button } from '@/components/UI/Button'
import { brandColors } from '@/lib/colors'
import { EyeIcon, EyeSlashIcon, HeartIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function RegisterPage() {
  const router = useRouter()
  const { register, loading } = useRegister()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!agreed) {
      toast.error('Please agree to the terms and conditions')
      return
    }

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
      })
      
      if (result) {
        toast.success('Account created successfully!')
        
        // Redirect based on user role (regular users should always go to /dashboard)
        // Note: Registration always creates users with "user" role, so this check is for safety
        if (result.user?.role === 'admin' || result.user?.role === 'super_admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      // Handle GraphQL errors
      const errorMessage = error.message || error.graphQLErrors?.[0]?.message || 'Registration failed'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1000&q=80"
          alt="Happy couple"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${brandColors.primary.pink}cc 0%, ${brandColors.primary.purple}cc 100%)`,
          }}
        />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <HeartIcon className="h-16 w-16 mb-6 text-white animate-pulse" />
          <h2 className="text-4xl font-bold mb-4 text-center">
            Start Your Love Story
          </h2>
          <p className="text-xl text-center text-white/90 mb-8">
            Join thousands of happy couples who found their perfect match
          </p>
          <div className="space-y-4 w-full max-w-md">
            {[
              '100% Free to Sign Up',
              'Verified Profiles Only',
              'Safe & Secure Platform',
              'Smart Matching Algorithm',
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-white flex-shrink-0" />
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-slate-900 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <span
                className="text-3xl font-bold inline-block"
                style={{
                  background: brandColors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontStyle: 'italic',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Get <span style={{ fontStyle: 'normal', fontWeight: '900' }}>set</span> love
              </span>
            </Link>
            <h1 className="text-3xl font-bold mt-4 mb-2 dark:text-white" style={{ color: brandColors.primary.purple }}>
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Join us and find your perfect match today
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold mb-2" style={{ color: brandColors.primary.purple }}>
                  Username *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                  style={{
                    borderColor: 'rgba(157, 0, 255, 0.2)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = brandColors.primary.purple
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${brandColors.primary.purple}33`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(157, 0, 255, 0.2)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: brandColors.primary.purple }}>
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                  style={{
                    borderColor: 'rgba(157, 0, 255, 0.2)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = brandColors.primary.purple
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${brandColors.primary.purple}33`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(157, 0, 255, 0.2)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="Enter your email"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-semibold mb-2" style={{ color: brandColors.primary.purple }}>
                    First Name
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                    style={{
                      borderColor: 'rgba(157, 0, 255, 0.2)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = brandColors.primary.purple
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${brandColors.primary.purple}33`
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(157, 0, 255, 0.2)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-semibold mb-2" style={{ color: brandColors.primary.purple }}>
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                    style={{
                      borderColor: 'rgba(157, 0, 255, 0.2)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = brandColors.primary.purple
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${brandColors.primary.purple}33`
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(157, 0, 255, 0.2)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: brandColors.primary.purple }}>
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 pr-12 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                    style={{
                      borderColor: 'rgba(157, 0, 255, 0.2)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = brandColors.primary.purple
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${brandColors.primary.purple}33`
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(157, 0, 255, 0.2)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2" style={{ color: brandColors.primary.purple }}>
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 pr-12 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                    style={{
                      borderColor: 'rgba(157, 0, 255, 0.2)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = brandColors.primary.purple
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${brandColors.primary.purple}33`
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(157, 0, 255, 0.2)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded"
                  style={{
                    accentColor: brandColors.primary.purple,
                  }}
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="font-semibold transition-colors"
                    style={{ color: brandColors.primary.purple }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = brandColors.additional.hoverPurple
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = brandColors.primary.purple
                    }}
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="font-semibold transition-colors"
                    style={{ color: brandColors.primary.purple }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = brandColors.additional.hoverPurple
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = brandColors.primary.purple
                    }}
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full py-4 text-lg font-bold rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                style={{
                  background: brandColors.gradients.primary,
                  boxShadow: `0 4px 14px ${brandColors.admin.shadow}`,
                }}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="font-semibold transition-colors"
                  style={{ color: brandColors.primary.purple }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = brandColors.additional.hoverPurple
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = brandColors.primary.purple
                  }}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
