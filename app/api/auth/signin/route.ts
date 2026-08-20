import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Helper to check MD5
const md5 = (content: string) => crypto.createHash('md5').update(content).digest('hex')

// Use Service Role Key for direct DB access if available, otherwise use Anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = signinSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // 1. Fetch user from 'clients' table first, then 'users' table as fallback
    let client: any = null
    let error: any = null

    const clientsResult = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .single()

    if (!clientsResult.error && clientsResult.data) {
      client = clientsResult.data
    } else {
      const usersResult = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      if (!usersResult.error && usersResult.data) {
        client = usersResult.data
      } else {
        error = usersResult.error
      }
    }

    if (error || !client) {
      console.log('User not found:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // 2. Verify password (support MD5 and Bcrypt)
    let isMatch = false
    const storedHash = client.password || ''

    if (storedHash.length === 32) {
      // Legacy MD5
      isMatch = (md5(password) === storedHash)
      console.log('MD5 check for', email, 'Result:', isMatch)
    } else {
      // Modern Bcrypt
      isMatch = await bcrypt.compare(password, storedHash)
      console.log('Bcrypt check for', email, 'Result:', isMatch)
    }

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // 3. Create a secure session cookie with all fields needed by the app
    const userData = {
      client_id: client.client_id,
      id: client.client_id,
      email: client.email,
      name: client.name || client.username,
      username: client.username,
      role: client.admin_type === '1' ? 'admin' : 'user',
      balance: client.balance,
      spent: client.spent,
    }

    const cookieStore = await cookies()
    cookieStore.set('session', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    })

    const { password: _, ...userWithoutPassword } = client

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error: any) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
