import { NextResponse } from 'next/server'
import { getCurrencyByCountry } from '@/lib/currency'

// In-memory cache for settings (in production, use a database)
let cachedSettings = {
  siteName: "MND - Market Next Door",
  siteDescription: "Best SMM Panel in the Philippines",
  supportEmail: "support@mndph.com",
  currency: "PHP",
  timezone: "Asia/Manila",
  maintenanceMode: false,
  registrationEnabled: true,
  emailVerification: false,
  telegram: "",
  facebook: "",
  instagram: "",
  countryCurrencies: {
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
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const country = searchParams.get('country')
  
  // If country is provided, return the currency for that country
  if (country && cachedSettings.countryCurrencies) {
    const currency = cachedSettings.countryCurrencies[country as keyof typeof cachedSettings.countryCurrencies] || cachedSettings.currency
    return NextResponse.json({
      ...cachedSettings,
      detectedCurrency: currency,
      detectedCountry: country
    })
  }
  
  return NextResponse.json(cachedSettings)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    cachedSettings = { ...cachedSettings, ...body }
    return NextResponse.json({ success: true, settings: cachedSettings })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export const dynamic = 'force-dynamic'
