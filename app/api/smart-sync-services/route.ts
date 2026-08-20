import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getExchangeRates, convertCurrency } from '@/lib/currency-service'

// Initialize Supabase client for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const SITE_BASE_CURRENCY = 'PHP';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { apiKey, apiUrl, providerId = 'weboostph' } = body

    if (!apiKey || !apiUrl) {
      return NextResponse.json(
        { error: 'API key and URL are required' },
        { status: 400 }
      )
    }

    // 1. Fetch live exchange rates
    const rates = await getExchangeRates()

    // 2. Determine provider currency
    const { data: providerInfo } = await supabase
      .from('service_api')
      .select('currency')
      .eq('api_name', providerId)
      .single()
    
    const providerCurrency = providerInfo?.currency || (providerId === 'smmworld' ? 'USD' : 'PHP')

    // Try different URL formats
    const urlsToTry = [
      apiUrl,
      apiUrl.replace('/v2', ''),
      apiUrl + '/',
      apiUrl.replace('/api/v2', '/api'),
      'https://weboostph.com/api/v2',
      'https://api.weboostph.com/v2'
    ]

    let categories = null
    let services = null
    let lastError = ''

    // Try different request formats
    const requestConfigs = [
      { method: 'POST', contentType: 'application/x-www-form-urlencoded' },
      { method: 'POST', contentType: 'application/json' },
      { method: 'GET', contentType: '' },
    ]

    for (const config of requestConfigs) {
      if (categories && services) break
      
      for (const url of urlsToTry) {
        try {
          const fullUrl = `${url}?key=${apiKey}`

          let svcRes
          const svcBody = `key=${encodeURIComponent(apiKey)}&action=services`

          if (config.method === 'POST' && config.contentType === 'application/x-www-form-urlencoded') {
            svcRes = await fetch(fullUrl, {
              method: 'POST',
              headers: { 
                'Accept': 'application/json', 
                'Content-Type': 'application/x-www-form-urlencoded' 
              },
              body: svcBody
            })
          } else if (config.method === 'POST') {
            svcRes = await fetch(fullUrl, {
              method: 'POST',
              headers: { 
                'Accept': 'application/json', 
                'Content-Type': 'application/json' 
              },
              body: JSON.stringify({ key: apiKey, action: 'services' })
            })
          } else {
            svcRes = await fetch(`${fullUrl}&action=services`, {
              method: 'GET', 
              headers: { 'Accept': 'application/json' }
            })
          }
          const svcText = await svcRes.text()
          
          if ((svcText.startsWith('[') || svcText.startsWith('{')) && !svcText.includes('<!DOCTYPE') && !svcText.includes('<html')) {
            services = JSON.parse(svcText)
            
            // Also fetch categories if available
            // (Omitted for brevity, assuming services contain category names)
            break
          }
          
          lastError = svcText.substring(0, 200)
        } catch (e: any) {
          lastError = e.message
        }
      }
    }

    if (!services || !Array.isArray(services)) {
      // Handle object response
      if (services && typeof services === 'object' && !Array.isArray(services)) {
        const possibleArrays = Object.values(services).filter(Array.isArray)
        if (possibleArrays.length > 0) services = possibleArrays[0]
      }
      
      if (!Array.isArray(services)) {
        return NextResponse.json(
          { error: `Invalid services response. Last error: ${lastError}` },
          { status: 500 }
        )
      }
    }

    // 3. Transform API services & Convert Currency
    const apiServiceIds = new Set<number>()
    const transformedServices = services.map((s: any) => {
      const apiId = parseInt(s.service)
      apiServiceIds.add(apiId)
      
      // Convert provider rate to PHP (Base Currency)
      const providerRate = parseFloat(s.rate) || 0
      const rateInPHP = convertCurrency(providerRate, providerCurrency, SITE_BASE_CURRENCY, rates)

      return {
        service_id: apiId,
        service_name: s.name,
        service_price: rateInPHP.toFixed(4), // Store in PHP
        service_min: parseInt(s.min) || 1,
        service_max: parseInt(s.max) || 100000,
        service_api: providerId,
        service_description: s.desc || s.name || '',
        service_type: s.type || 'Default',
        service_refill: s.refill ? 'yes' : 'no',
        service_cancel: s.cancel ? 'yes' : 'no',
        category_name: s.category || 'Uncategorized'
      }
    })

    // 4. Get existing services from database for this provider
    const { data: dbServices } = await supabase
      .from('services')
      .select('service_id, service_name')
      .eq('api_provider', providerId)

    const dbServiceIds = new Set(dbServices?.map(s => s.service_id) || [])

    // 5. Identify services to Delete (in DB but not in API)
    const idsToDelete = Array.from(dbServiceIds).filter(id => !apiServiceIds.has(id))
    
    if (idsToDelete.length > 0) {
      await supabase
        .from('services')
        .delete()
        .in('service_id', idsToDelete)
        .eq('api_provider', providerId)
    }

    // 6. Update/Insert services
    let updatedCount = 0
    let insertedCount = 0

    for (const svc of transformedServices) {
      const { data: existing } = await supabase
        .from('services')
        .select('service_id')
        .eq('service_id', svc.service_id)
        .eq('api_provider', providerId)
        .single()

      if (existing) {
        await supabase
          .from('services')
          .update({
            service_name: svc.service_name,
            service_price: svc.service_price,
            service_min: svc.service_min,
            service_max: svc.service_max,
            service_description: svc.service_description,
            service_refill: svc.service_refill,
            service_cancel: svc.service_cancel
          })
          .eq('service_id', svc.service_id)
          .eq('api_provider', providerId)
        updatedCount++
      } else {
        // Handle categories... (Simplified)
        await supabase.from('services').insert({
          ...svc,
          api_provider: providerId
        })
        insertedCount++
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalInAPI: transformedServices.length,
        updatedCount,
        insertedCount,
        deletedCount: idsToDelete.length,
        providerCurrency,
        baseCurrency: SITE_BASE_CURRENCY
      },
      message: `Sync complete: ${updatedCount} updated, ${insertedCount} inserted, ${idsToDelete.length} removed.`
    })

  } catch (error: any) {
    console.error('Smart sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

