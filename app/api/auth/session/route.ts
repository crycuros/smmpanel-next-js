import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userData = JSON.parse(sessionCookie.value)

    return NextResponse.json({
      success: true,
      user: userData
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Session verification failed' },
      { status: 401 }
    )
  }
}
