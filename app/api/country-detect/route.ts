import { NextResponse } from 'next/server'
import { getCurrencyByCountry } from '@/lib/currency'

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

async function getSettings() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/settings`, { 
      cache: 'no-store' 
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    return null
  }
}

export async function GET(request: Request) {
  try {
    // Use ipapi.co for geolocation (free tier)
    const response = await fetch(`https://ipapi.co/json/`)
    
    if (!response.ok) {
      return NextResponse.json({ 
        country: 'US', 
        currency: 'USD',
        error: 'Could not detect location'
      })
    }
    
    const data = await response.json()
    const countryCode = data.country_code || 'US'
    
    // Try to get currency from settings API
    const settings = await getSettings()
    let currency: string
    
    if (settings?.countryCurrencies?.[countryCode]) {
      currency = settings.countryCurrencies[countryCode]
    } else {
      currency = DEFAULT_COUNTRY_CURRENCIES[countryCode] || 'USD'
    }
    
    return NextResponse.json({
      country: countryCode,
      currency: currency,
      city: data.city,
      ip: data.ip
    })
  } catch (error) {
    return NextResponse.json({ 
      country: 'US', 
      currency: 'USD' 
    })
  }
}

export const dynamic = 'force-dynamic'
