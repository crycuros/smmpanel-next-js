import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateTOTPSecret, generateQRCodeURL, verifyCode } from '@/lib/totp'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get user from database
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (error || !users || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = users[0]

    // Generate new TOTP secret
    const secret = generateTOTPSecret()
    
    // Generate QR code URL
    const qrCodeURL = await generateQRCodeURL(email, secret)

    // Save secret to database (temporary - will be confirmed later)
    const { error: updateError } = await supabase
      .from('users')
      .update({ totp_secret: secret })
      .eq('email', email)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to save TOTP secret' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      secret: secret,
      qrCodeURL: qrCodeURL
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to setup TOTP' },
      { status: 500 }
    )
  }
}

// Verify and confirm TOTP setup
export async function PUT(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    // Get user from database
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (error || !users || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = users[0]

    if (!user.totp_secret) {
      return NextResponse.json(
        { error: 'TOTP not setup yet' },
        { status: 400 }
      )
    }

    // Verify the code
    const isValid = verifyCode(user.totp_secret, code)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      )
    }

    // Confirm TOTP is enabled
    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully'
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to verify TOTP' },
      { status: 500 }
    )
  }
}
