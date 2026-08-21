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

  // Skip maintenance check for admin routes and auth routes
  const isMaintenanceExempt = pathname.startsWith('/admin') || pathname.startsWith('/api/') || pathname === '/signin' || pathname === '/signup' || pathname === '/maintenance'
  
  if (!isMaintenanceExempt) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                request.cookies.set(name, value)
              )
            },
          },
        }
      )

      const { data: settings } = await supabase
        .from('site_settings')
        .select('maintenance_mode')
        .limit(1)
        .single()

      if (settings?.maintenance_mode) {
        const url = request.nextUrl.clone()
        url.pathname = '/maintenance'
        return NextResponse.redirect(url)
      }
    } catch (e) {
      console.error('Middleware maintenance check error:', e)
    }
  }

  // Allow users on /maintenance to go back to home if maintenance is turned off
  if (pathname === '/maintenance') {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                request.cookies.set(name, value)
              )
            },
          },
        }
      )

      const { data: settings } = await supabase
        .from('site_settings')
        .select('maintenance_mode')
        .limit(1)
        .single()

      if (!settings?.maintenance_mode) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    } catch (e) {
      console.error('Middleware maintenance check error:', e)
    }
  }

  // Protected routes (Dashboard & Admin)
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/signin'
      return NextResponse.redirect(url)
    }
  }

  // Admin sub-routes require admin role (but /admin itself is the login page)
  if (pathname.startsWith('/admin/') && pathname !== '/admin') {
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
    try {
      const sessionData = JSON.parse(session.value)
      if (sessionData.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    } catch {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
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
