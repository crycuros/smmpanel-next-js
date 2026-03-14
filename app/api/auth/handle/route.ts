import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // Handled by exchangeCodeForSession
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the user from Supabase Auth
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (!userError && user) {
        // Check if user exists in our users table
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .limit(1)

        if (!dbUser || dbUser.length === 0) {
          // Create new user in our database
          const { data: newUser } = await supabase
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

          if (newUser && newUser.length > 0) {
            // Redirect to signin with user data encoded
            const userData = encodeURIComponent(JSON.stringify(newUser[0]))
            return NextResponse.redirect(`${origin}/signin?oauth_success=true&user=${userData}`)
          }
        } else {
          // User exists, redirect with their data
          const userData = encodeURIComponent(JSON.stringify(dbUser[0]))
          return NextResponse.redirect(`${origin}/signin?oauth_success=true&user=${userData}`)
        }
      }
    }

    console.error('OAuth error:', error?.message)
  }

  return NextResponse.redirect(`${origin}/signin?error=OAuth+error`)
}
