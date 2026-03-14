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

    if (error) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = users[0]

    // Check if user is admin
    if (user.admin_type !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // If TOTP code is provided, verify it
    if (totpCode) {
      if (user.totp_secret) {
        // User has TOTP enabled - verify the code
        const isValidTOTP = verifyCode(user.totp_secret, totpCode)
        if (!isValidTOTP) {
          return NextResponse.json(
            { error: 'Invalid authentication code' },
            { status: 401 }
          )
        }
      } else {
        // No TOTP secret but code provided - verify it's 6 digits
        if (totpCode.length !== 6 || !/^\d+$/.test(totpCode)) {
          return NextResponse.json(
            { error: 'Invalid authentication code' },
            { status: 401 }
          )
        }
      }
    } else if (user.totp_secret) {
      // User has TOTP enabled but no code provided
      return NextResponse.json({
        success: true,
        requires2FA: true,
        user: { email: user.email, hasTOTP: true }
      })
    }

    // No TOTP required - allow login
    const { password: _, ...userWithoutPassword } = user

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
