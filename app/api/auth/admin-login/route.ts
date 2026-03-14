import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcrypt'
import { verifyCode } from '@/lib/totp'

export async function POST(request: NextRequest) {
  try {
    const { email, password, totpCode } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Query the user from Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1)

    // Debug: log the query
    console.log('Searching for:', email)

    if (error) {
      console.log('Query error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }

    if (!users || users.length === 0) {
      console.log('No user found')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = users[0]
    console.log('User found:', user.email, '| password in DB:', user.password ? 'yes' : 'no')

    // Check if user is admin (disabled for testing)
    /*
    if (user.admin_type !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }
    */

    // Skip password verification for testing - REMOVE IN PRODUCTION
    // Allow any user with admin_type to login
    
    const { password: _, ...userWithoutPassword } = user

    // If TOTP code is provided, verify it
    if (totpCode && user.totp_secret) {
      const isValid = verifyCode(user.totp_secret, totpCode)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid 2FA code' },
          { status: 401 }
        )
      }
      // TOTP verified, allow login
      return NextResponse.json({
        success: true,
        user: userWithoutPassword
      })
    }

    // Check if TOTP is required
    if (user.totp_secret) {
      return NextResponse.json({
        success: true,
        requires2FA: true,
        user: { email: user.email, hasTOTP: true }
      })
    }

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
