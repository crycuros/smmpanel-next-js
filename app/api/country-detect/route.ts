import { NextRequest, NextResponse } from 'next/server'

// Default country-currency mapping (fallback if settings API fails)
const DEFAULT_COUNTRY_CURRENCIES: Record<string, string> = {
  PH: 'PHP',
  US: 'USD',
  GB: 'GBP',
  EU: 'EUR',
  JP: 'JPY',
  KR: 'KRW',
  SG: 'SGD',
  MY: 'MYR',
  TH: 'THB',
  ID: 'IDR',
  VN: 'VND',
  CN: 'CNY',
  IN: 'INR',
  AU: 'AUD',
  CA: 'CAD',
}

function getCurrencyForCountry(country: string): string {
  return DEFAULT_COUNTRY_CURRENCIES[country] || 'USD'
}

export async function GET(request: NextRequest) {
  try {
    // Try to get country from Vercel headers first
    // Vercel sets this header when deployed
    const vercelCountry = request.headers.get('x-vercel-ip-country')
    
    // If we have a country code from headers, use it directly
    if (vercelCountry && vercelCountry.length === 2) {
      const currency = getCurrencyForCountry(vercelCountry)
      
      return NextResponse.json({
        country: vercelCountry,
        currency: currency,
        source: 'vercel-header'
      })
    }
    
    // Fallback: Use client-side IP detection via ipapi.co
    const ipResponse = await fetch(`https://ipapi.co/json/`)
    
    if (ipResponse.ok) {
      const data = await ipResponse.json()
      const countryCode = data.country_code || 'US'
      const currency = getCurrencyForCountry(countryCode)
      
      return NextResponse.json({
        country: countryCode,
        currency: currency,
        city: data.city,
        ip: data.ip,
        source: 'ipapi'
      })
    }
    
    // Ultimate fallback
    return NextResponse.json({ 
      country: 'US', 
      currency: 'USD',
      error: 'Could not detect location'
    })
  } catch (error) {
    console.error('Country detect error:', error)
    return NextResponse.json({ 
      country: 'US', 
      currency: 'USD' 
    })
  }
}

export const dynamic = 'force-dynamic'
