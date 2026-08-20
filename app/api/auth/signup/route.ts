import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name is too short').optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = signupSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password, fullName } = validation.data
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: authError.status || 400 }
      )
    }

    // 2. Create user record in our public.users table if it doesn't exist
    // (Note: In a production app, you'd usually use a Supabase Trigger for this)
    const { data: newUser, error: dbError } = await supabase
      .from('users')
      .insert({
        email,
        password: '', // We don't store passwords in public.users anymore
        name: fullName || email.split('@')[0],
        username: email.split('@')[0],
        balance: 0,
        spent: 0,
        role: 'user',
        status: 'active',
      })
      .select()
      .single()

    if (dbError && dbError.code !== '23505') { // Ignore unique constraint error if user already exists
      console.error('DB Sync Error:', dbError)
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email for verification.',
      user: authData.user ? {
        id: authData.user.id,
        email: authData.user.email,
        name: fullName,
      } : null,
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}

