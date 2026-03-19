'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { hasRole, UserRole } from '@/lib/roles'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, token, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Check authentication
    if (!token || !isAuthenticated || !user) {
      router.push(redirectTo)
      return
    }

    // Check role if required
    if (requiredRole && !hasRole(user.role as UserRole, requiredRole)) {
      router.push('/dashboard') // Redirect to user dashboard if not authorized
      return
    }
  }, [token, isAuthenticated, user, requiredRole, router, redirectTo])

  // Show loading state while checking
  if (!token || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Check role access
  if (requiredRole && !hasRole(user.role as UserRole, requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}











