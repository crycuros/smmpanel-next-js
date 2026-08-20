import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only run middleware on routes that need auth
  const needsAuth = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname === '/signin' || pathname === '/signup'

  if (!needsAuth) {
    return NextResponse.next()
  }

  const session = request.cookies.get('session')

  // Protected routes (Dashboard & Admin)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/signin'
      return NextResponse.redirect(url)
    }
  }

  // Auth routes - Redirect to dashboard if already logged in
  if (pathname === '/signin' || pathname === '/signup') {
    if (session) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
