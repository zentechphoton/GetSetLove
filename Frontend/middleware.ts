import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/how-it-works',
    '/contact',
    '/help',
    '/safety',
    '/guidelines',
    '/faq',
    '/privacy',
    '/terms',
    '/cookies',
    '/accessibility',
    '/resources',
  ]

  // Admin routes
  const adminRoutes = ['/admin']

  // User routes
  const userRoutes = ['/dashboard', '/discover', '/matches', '/messages', '/profile', '/settings']

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // If accessing public route, allow
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For protected routes, token validation will be handled by the backend
  // Frontend will check user role from the token payload
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}






