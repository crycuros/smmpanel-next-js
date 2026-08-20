import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the user from Supabase Auth
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (!userError && user) {
        // Sync user with our database if needed
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .limit(1)

        if (!dbUser || dbUser.length === 0) {
          // Create new user in our database
          await supabase
            .from('users')
            .insert({
              email: user.email,
              name: user.user_metadata?.full_name || user.user_metadata?.name || 'OAuth User',
              username: user.user_metadata?.user_name || user.email?.split('@')[0] || 'user',
              password: '', 
              balance: 0,
              spent: 0,
              is_admin: false,
              status: 'active',
              role: 'user'
            })
        }
        
        // Redirect to dashboard (session cookie is now set)
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    console.error('OAuth error:', error?.message)
  }

  return NextResponse.redirect(`${origin}/signin?error=OAuth+error`)
}

