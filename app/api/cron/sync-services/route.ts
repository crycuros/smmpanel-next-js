import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint should be protected by a secret key
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  // 1. Verify authorization
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 2. Get all active providers
    const { data: providers } = await supabase
      .from('service_api')
      .select('*')
      .eq('status', '1')

    if (!providers || providers.length === 0) {
      return NextResponse.json({ message: 'No active providers found' })
    }

    const results = []

    // 3. Trigger sync for each provider
    for (const provider of providers) {
      try {
        // We call our smart-sync logic internally or refactor it to a shared service
        // For now, we'll perform a fetch to the smart-sync endpoint
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        
        const syncResponse = await fetch(`${baseUrl}/api/smart-sync-services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: provider.api_key,
            apiUrl: provider.api_url,
            providerId: provider.api_name
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
