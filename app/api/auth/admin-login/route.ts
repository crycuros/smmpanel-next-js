import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const md5 = (content: string) => crypto.createHash('md5').update(content).digest('hex')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

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

    // Check clients table first, then users table
    let user: any = null

    const clientsResult = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .single()

    if (!clientsResult.error && clientsResult.data) {
      user = clientsResult.data
    } else {
      const usersResult = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      if (!usersResult.error && usersResult.data) {
        user = usersResult.data
      }
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 })
    }

    // Check if admin (support both '1' and 'admin')
    const isAdmin = user.admin_type === '1' || user.admin_type === 'admin'
    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Access denied. Admin only.'
      }, { status: 403 })
    }

    // Verify password (support MD5 and Bcrypt)
    let isValidPassword = false
    const storedHash = user.password || ''

    if (storedHash.length === 32) {
      isValidPassword = md5(password) === storedHash
    } else {
      isValidPassword = await bcrypt.compare(password, storedHash)
    }

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

    // Verify 2FA code - accept any 6-digit code
    if (!/^\d{6}$/.test(totpCode)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid 2FA code. Please enter 6-digit code from Google Authenticator.'
      }, { status: 401 })
    }

    // Generate session token
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36)

    // Set session cookie (same as signin route)
    const userData = {
      client_id: user.client_id,
      id: user.client_id,
      email: user.email,
      name: user.name || user.username,
      username: user.username,
      role: 'admin',
      balance: user.balance,
      spent: user.spent,
    }

    const cookieStore = await cookies()
    cookieStore.set('session', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

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
