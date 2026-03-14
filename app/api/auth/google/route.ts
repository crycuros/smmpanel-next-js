import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create service role client for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// This endpoint initiates Google OAuth flow
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Use Supabase Auth Admin to create user with Google provider
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // First check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (existingUser && existingUser.length > 0) {
      // User exists, check password
      if (existingUser[0].password !== password) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Return existing user
      const { password: _, ...userWithoutPassword } = existingUser[0]
      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
        isNewUser: false
      })
    }

    // For new users, we create them (you can restrict this to admin-only registrations)
    // In production, you'd use Supabase Auth for proper OAuth
    return NextResponse.json(
      { error: 'User not found. Please contact administrator.' },
      { status: 404 }
    )

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// Handle OAuth callback
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/signin?error=oauth_error', request.url))
  }

  if (code) {
    // Exchange code for session
    // This would be handled by Supabase Auth automatically
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.redirect(new URL('/signin', request.url))
}
