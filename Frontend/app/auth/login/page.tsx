'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLogin } from '@/lib/auth-apollo'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Button } from '@/components/UI/Button'
import { brandColors } from '@/lib/colors'
import { EyeIcon, EyeSlashIcon, HeartIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const router = useRouter()
  const { login, loading } = useLogin()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      })
      
      if (result) {
        toast.success('Logged in successfully!')
        
        // Redirect based on user role
        if (result.user?.role === 'admin' || result.user?.role === 'super_admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      // Handle GraphQL errors
      const errorMessage = error.message || error.graphQLErrors?.[0]?.message || 'Login failed'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1000&q=80"
          alt="Happy couple"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${brandColors.primary.purple}cc 0%, ${brandColors.primary.pink}cc 100%)`,
          }}
        />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <HeartIcon className="h-16 w-16 mb-6 text-white" />
          <h2 className="text-4xl font-bold mb-4 text-center">
            Welcome Back!
          </h2>
          <p className="text-xl text-center text-white/90">
            Continue your journey to find your perfect match
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
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
              Sign In
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: brandColors.primary.purple }}>
                  Email Address
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

              <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: brandColors.primary.purple }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
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
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded"
                    style={{
                      accentColor: brandColors.primary.purple,
                    }}
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium transition-colors"
                  style={{ color: brandColors.primary.purple }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = brandColors.additional.hoverPurple
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = brandColors.primary.purple
                  }}
                >
                  Forgot password?
                </Link>
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
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Don't have an account?{' '}
                <Link
                  href="/auth/register"
                  className="font-semibold transition-colors"
                  style={{ color: brandColors.primary.purple }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = brandColors.additional.hoverPurple
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = brandColors.primary.purple
                  }}
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
