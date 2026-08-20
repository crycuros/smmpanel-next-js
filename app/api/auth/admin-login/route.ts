import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, totpCode } = body

    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and password required' 
      }, { status: 400 })
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 })
    }

    // Check if admin
    if (user.admin_type !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Access denied. Admin only.' 
      }, { status: 403 })
    }

    // Verify password using bcrypt (same as signup)
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 })
    }

    // If no totpCode provided, ask for 2FA
    if (!totpCode) {
      return NextResponse.json({ 
        success: true, 
        requires2FA: true,
        message: 'Please enter your Google Authenticator code'
      })
    }

    // Verify 2FA code - accept any 6-digit code for demo
    // In production, use proper TOTP verification with the user's secret
    if (!/^\d{6}$/.test(totpCode)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid 2FA code. Please enter 6-digit code from Google Authenticator.' 
      }, { status: 401 })
    }

    // Generate session token
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36)

    return NextResponse.json({ 
      success: true, 
      requires2FA: false,
      token: sessionToken,
      admin: {
        email: user.email,
        username: user.username
      }
    })

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Authentication failed' 
    }, { status: 500 })
  }
}
