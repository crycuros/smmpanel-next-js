import { supabase } from './supabase'

const CACHE_TTL = 3600 * 1000 // 1 hour

export interface ExchangeRates {
  [key: string]: number
}

export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    // 1. Try to get from site_settings (cached)
    const { data: settings } = await supabase
      .from('site_settings')
      .select('forex_rates, last_forex_update')
      .single()

    const now = Date.now()
    if (settings?.forex_rates && settings?.last_forex_update) {
      const lastUpdate = new Date(settings.last_forex_update).getTime()
      if (now - lastUpdate < CACHE_TTL) {
        return settings.forex_rates as ExchangeRates
      }
    }

    // 2. Fetch fresh rates if cache expired or missing
    // Using a reliable free API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/PHP')
    if (response.ok) {
      const data = await response.json()
      const rates = data.rates as ExchangeRates
      
      // Update cache in database
      await supabase
        .from('site_settings')
        .upsert({
          id: 1, // Assuming single settings record
          forex_rates: rates,
          last_forex_update: new Date().toISOString()
        })

      return rates
    }
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
  }

  // 3. Fallback to hardcoded defaults
  return {
    PHP: 1,
    USD: 0.018,
    EUR: 0.016,
    INR: 1.48,
    // Add other defaults as needed
  }
}

/**
 * Converts an amount between two currencies
 * @param amount The amount to convert
 * @param from The source currency code (e.g., 'PHP')
 * @param to The target currency code (e.g., 'USD')
 * @param rates The exchange rates (base PHP)
 */
export function convertCurrency(
  amount: number, 
  from: string, 
  to: string, 
  rates: ExchangeRates
): number {
  if (from === to) return amount
  
  // rates are base PHP: 1 PHP = rate[CURRENCY]
  // To convert from X to Y: amount * (rate[Y] / rate[X])
  const fromRate = rates[from] || 1
  const toRate = rates[to] || 1
  
  return (amount / fromRate) * toRate
}
