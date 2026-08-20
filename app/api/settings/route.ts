import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Default settings
const defaultSettings = {
  siteName: "MND - Market Next Door",
  siteDescription: "Best SMM Panel in the Philippines",
  supportEmail: "support@mndph.com",
  currency: "PHP",
  timezone: "Asia/Manila",
  maintenanceMode: false,
  registrationEnabled: true,
  emailVerification: false,
  telegram: "",
  discord: "",
  facebook: "",
  instagram: "",
  binancePay: "",
  binanceId: "",
  gcashNumber: "",
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

// Get settings from database or return defaults
async function getSettings() {
  try {
    // Try to get settings from a 'site_settings' table in Supabase
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single()
    
    if (error || !data) {
      console.log('No settings found in database, using defaults')
      return defaultSettings
    }
    
    // Map database fields to our format
    return {
      siteName: data.site_name || defaultSettings.siteName,
      siteDescription: data.site_description || defaultSettings.siteDescription,
      supportEmail: data.support_email || defaultSettings.supportEmail,
      currency: data.currency || defaultSettings.currency,
      timezone: data.timezone || defaultSettings.timezone,
      maintenanceMode: data.maintenance_mode || defaultSettings.maintenanceMode,
      registrationEnabled: data.registration_enabled || defaultSettings.registrationEnabled,
      emailVerification: data.email_verification || defaultSettings.emailVerification,
      telegram: data.telegram || "",
      discord: data.discord || "",
      facebook: data.facebook || "",
      instagram: data.instagram || "",
      binancePay: data.binance_pay || "",
      binanceId: data.binance_id || "",
      gcashNumber: data.gcash_number || "",
      countryCurrencies: defaultSettings.countryCurrencies
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return defaultSettings
  }
}

// Save settings to database
async function saveSettings(settings: any) {
  try {
    // First check if settings exist
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1)
      .single()
    
    const settingsData = {
      site_name: settings.siteName || defaultSettings.siteName,
      site_description: settings.siteDescription || defaultSettings.siteDescription,
      support_email: settings.supportEmail || defaultSettings.supportEmail,
      currency: settings.currency || defaultSettings.currency,
      timezone: settings.timezone || defaultSettings.timezone,
      maintenance_mode: settings.maintenanceMode || false,
      registration_enabled: settings.registrationEnabled !== undefined ? settings.registrationEnabled : true,
      email_verification: settings.emailVerification !== undefined ? settings.emailVerification : false,
      telegram: settings.telegram || "",
      discord: settings.discord || "",
      facebook: settings.facebook || "",
      instagram: settings.instagram || "",
      binance_pay: settings.binancePay || "",
      binance_id: settings.binanceId || "",
      gcash_number: settings.gcashNumber || "",
      updated_at: new Date().toISOString()
    }
    
    if (existing?.id) {
      // Update existing settings
      const { error } = await supabase
        .from('site_settings')
        .update(settingsData)
        .eq('id', existing.id)
      
      if (error) throw error
    } else {
      // Insert new settings
      const { error } = await supabase
        .from('site_settings')
        .insert(settingsData)
      
      if (error) throw error
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error saving settings:', error)
    return { success: false, error }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const country = searchParams.get('country')
  
  // Get settings from database
  const settings = await getSettings()
  
  // If country is provided, return the currency for that country
  if (country && settings.countryCurrencies) {
    const currency = settings.countryCurrencies[country as keyof typeof settings.countryCurrencies] || settings.currency
    return NextResponse.json({
      ...settings,
      detectedCurrency: currency,
      detectedCountry: country
    })
  }
  
  return NextResponse.json(settings)
}

export async function POST(request: Request) {
  try {
    // Check admin auth
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
      const session = JSON.parse(sessionCookie.value)
      if (session.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const body = await request.json()
    
    // Save to database
    const result = await saveSettings(body)
    
    if (result.success) {
      // Return updated settings
      const settings = await getSettings()
      return NextResponse.json({ success: true, settings })
    } else {
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in POST settings:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export const dynamic = 'force-dynamic'
