/**
 * Role-based access control utilities
 */

export type UserRole = 'user' | 'admin' | 'super_admin'

export const ROLES = {
  USER: 'user' as const,
  ADMIN: 'admin' as const,
  SUPER_ADMIN: 'super_admin' as const,
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false

  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    admin: 2,
    super_admin: 3,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: UserRole | undefined): boolean {
  return hasRole(userRole, ROLES.ADMIN)
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(userRole: UserRole | undefined): boolean {
  return hasRole(userRole, ROLES.SUPER_ADMIN)
}

/**
 * Get user role from token (helper function)
 */
export function getUserRoleFromToken(token: string): UserRole | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role || null
  } catch {
    return null
  }
}











