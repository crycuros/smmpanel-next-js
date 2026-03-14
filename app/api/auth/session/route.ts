import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // Not needed for GET request
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  // Get user from our users table
  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email)
    .limit(1)

  if (dbError || !dbUser || dbUser.length === 0) {
    // User doesn't exist in our users table, create one
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'OAuth User',
        username: user.user_metadata?.user_name || user.email?.split('@')[0] || 'user',
        password: '', // OAuth users don't have password
        balance: '0',
        spent: '0',
        is_admin: false,
        status: 'active',
      })
      .select()
      .limit(1)

    if (createError || !newUser || newUser.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    const { password: _, ...userWithoutPassword } = newUser[0]
    return NextResponse.json({ user: userWithoutPassword })
  }

  const { password: _, ...userWithoutPassword } = dbUser[0]
  return NextResponse.json({ user: userWithoutPassword })
}
