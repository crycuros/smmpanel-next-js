import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { apiKey, apiUrl } = body

    if (!apiKey || !apiUrl) {
      return NextResponse.json(
        { error: 'API key and URL are required' },
        { status: 400 }
      )
    }

    // First try the /api/providers/services endpoint (same as admin settings)
    let categories = null
    let services = null
    let lastError = ''

    // Get base URL for internal API calls
    const getBaseUrl = () => {
      if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
      if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
      return 'http://localhost:3000'
    }

    // Try using the /api/providers/services endpoint first (same as admin settings)
    try {
      const baseUrl = getBaseUrl()
      const response = await fetch(`${baseUrl}/api/providers/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'weboostph',
          apiKey: apiKey,
          action: 'services'
        })
      })
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        // Group services by category like admin settings does
        const categoryMap = new Map<string, any[]>()
        for (const service of data) {
          const categoryName = service.category || 'Uncategorized'
          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, [])
          }
          categoryMap.get(categoryName)!.push(service)
        }
        
        // Set services
        services = data
        
        // Create categories from the map
        categories = Array.from(categoryMap.entries()).map(([name], idx) => ({
          id: idx + 1,
          name
        }))
      }
    } catch (e: any) {
      console.log('Providers API failed, trying direct:', e.message)
    }

    // Fallback: try different URL formats directly if providers API failed
    if (!categories || !services) {
      const urlsToTry = [
        apiUrl,
        apiUrl.replace('/v2', ''),
        apiUrl + '/',
        apiUrl.replace('/api/v2', '/api'),
        'https://weboostph.com/api/v2',
        'https://api.weboostph.com/v2'
      ]

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

          let catRes
          const catBody = `key=${encodeURIComponent(apiKey)}&action=categories`
          const svcBody = `key=${encodeURIComponent(apiKey)}&action=services`

          if (config.method === 'POST' && config.contentType === 'application/x-www-form-urlencoded') {
            catRes = await fetch(fullUrl, {
              method: 'POST',
              headers: { 
                'Accept': 'application/json', 
                'Content-Type': 'application/x-www-form-urlencoded' 
              },
              body: catBody
            })
          } else if (config.method === 'POST') {
            catRes = await fetch(fullUrl, {
              method: 'POST',
              headers: { 
                'Accept': 'application/json', 
                'Content-Type': 'application/json' 
              },
              body: JSON.stringify({ key: apiKey, action: 'categories' })
            })
          } else {
            catRes = await fetch(`${fullUrl}&action=categories`, {
              method: 'GET',
              headers: { 'Accept': 'application/json' }
            })
          }

          const catText = await catRes.text()
          
          // Check if valid JSON and not an error page
          if ((catText.startsWith('[') || catText.startsWith('{')) && !catText.includes('<!DOCTYPE') && !catText.includes('<html')) {
            categories = JSON.parse(catText)
            
            let svcRes
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
              apiUrl = url
              break
            }
          }
          
          lastError = catText.substring(0, 200)
        } catch (e: any) {
          lastError = e.message
        }
      }
    }
    } // End fallback block

    // Check if we got valid data
    if (!categories) {
      return NextResponse.json(
        { error: `API not working. Last response: ${lastError}` },
        { status: 500 }
      )
    }

    // Check if categories is an error object
    if (typeof categories === 'object' && categories.error) {
      return NextResponse.json(
        { error: categories.error },
        { status: 500 }
      )
    }

    // Handle object response - might contain categories/services as properties
    if (typeof categories === 'object' && !Array.isArray(categories)) {
      // Check if categories is nested in the response
      if (categories.categories && Array.isArray(categories.categories)) {
        categories = categories.categories
      } else if (categories.data && Array.isArray(categories.data)) {
        categories = categories.data
      } else if (categories.result && Array.isArray(categories.result)) {
        categories = categories.result
      } else {
        // Try to find any array property
        const possibleArrays = Object.values(categories).filter(Array.isArray)
        if (possibleArrays.length > 0) {
          categories = possibleArrays[0]
        }
      }
    }

    // Make sure we have arrays
    if (!Array.isArray(categories)) {
      return NextResponse.json(
        { 
          error: `Invalid categories response. Expected array, got: ${typeof categories}`,
          debug: {
            receivedType: typeof categories,
            receivedKeys: typeof categories === 'object' ? Object.keys(categories).slice(0, 10) : 'N/A',
            lastError: lastError
          }
        },
        { status: 500 }
      )
    }

    // Handle services as object
    if (typeof services === 'object' && !Array.isArray(services)) {
      if (services.services && Array.isArray(services.services)) {
        services = services.services
      } else if (services.data && Array.isArray(services.data)) {
        services = services.data
      } else if (services.result && Array.isArray(services.result)) {
        services = services.result
      } else {
        const possibleArrays = Object.values(services).filter(Array.isArray)
        if (possibleArrays.length > 0) {
          services = possibleArrays[0]
        }
      }
    }

    if (!Array.isArray(services)) {
      return NextResponse.json(
        { error: `Invalid services response. Expected array, got: ${typeof services}` },
        { status: 500 }
      )
    }

    // Create category map
    const categoryMap: Record<string, number> = {}
    
    if (categories && Array.isArray(categories)) {
      categories.forEach((cat: any, idx: number) => {
        const catId = cat.id || idx + 1
        categoryMap[cat.name] = catId
      })
    }

    // Transform services with correct category IDs to match database schema
    const transformedServices = services?.map((s: any) => ({
      service_id: parseInt(s.service) || 0,
      service_name: s.name || '',
      service_price: String(parseFloat(s.rate) || 0),
      service_min: parseFloat(s.min) || 1,
      service_max: parseFloat(s.max) || 100000,
      service_api: 0,
      category_id: categoryMap[s.category] || 1,
      service_line: parseFloat(s.service) || 0,
      service_description: s.desc || s.name || '',
      service_type: '2',
      service_profit: '20',
      api_service: parseInt(s.service) || 0
    })) || []

    // Transform categories to match database schema
    const transformedCategories = categories?.map((c: any, idx: number) => ({
      category_id: parseInt(c.id) || idx + 1,
      category_name: c.name || 'Uncategorized',
      category_line: parseFloat(c.id) || idx + 1
    })) || []

    return NextResponse.json({
      categories: transformedCategories,
      services: transformedServices,
      stats: {
        categoriesCount: transformedCategories.length,
        servicesCount: transformedServices.length
      }
    })

  } catch (error: any) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: `Failed: ${error.message}` },
      { status: 500 }
    )
  }
}
