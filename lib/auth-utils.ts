import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function getServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function getUser() {
  const supabase = await getServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  return user
}

export async function getDbUser(user: any) {
  const supabase = await getServerSupabase()
  // Try clients table first (main user table), fallback to users
  let { data: dbUser, error } = await supabase
    .from('clients')
    .select('*')
    .eq('email', user.email)
    .single()

  if (error || !dbUser) {
    // Fallback to users table
    const result = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()
    dbUser = result.data
    error = result.error
  }

  if (error || !dbUser) {
    return null
  }

  return dbUser
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAdmin() {
  const user = await getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const dbUser = await getDbUser(user)
  // admin_type '1' = admin, '2' = super_admin, anything else is not admin
  const isAdmin = dbUser && (dbUser.admin_type === '1' || dbUser.admin_type === '2')
  if (!isAdmin) {
    throw new Error('Forbidden')
  }

  return dbUser
}
