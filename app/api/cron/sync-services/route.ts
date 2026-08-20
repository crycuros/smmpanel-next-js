import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    const { data: providers } = await supabase
      .from('service_api')
      .select('*')
      .eq('api_status', '2')

    if (!providers || providers.length === 0) {
      return NextResponse.json({ message: 'No active providers found' })
    }

    const results = []

    for (const provider of providers) {
      try {
        const syncResponse = await fetch('https://smmfeeds.com/api/smart-sync-services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CRON_SECRET}`,
          },
          body: JSON.stringify({
            apiKey: provider.api_key,
            apiUrl: provider.api_url,
            providerId: provider.api_name,
          })
        })

        const data = await syncResponse.json()
        results.push({
          provider: provider.api_name,
          status: syncResponse.ok ? 'success' : 'failed',
          details: data
        })
      } catch (err: any) {
        results.push({
          provider: provider.api_name,
          status: 'error',
          error: err.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
