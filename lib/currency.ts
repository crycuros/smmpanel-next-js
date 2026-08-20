// Currency configuration based on country
import { supabase } from '@/lib/supabase'
export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  exchangeRate: number // Rate to convert FROM PHP (base currency)
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', exchangeRate: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 0.01632 }, // Updated: 1 PHP = 0.01632 USD (from 61.25 PHP/USD)
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.015 }, // Updated: ₱66 = €1
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 0.013 }, // Updated: ₱76 = £1
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', exchangeRate: 2.58 }, // Updated: ₱1 = ¥2.58
  KRW: { code: 'KRW', symbol: '₩', name: 'Korean Won', exchangeRate: 22.5 }, // Updated: ₱1 = ₩22.5
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', exchangeRate: 0.022 }, // Updated: ₱45 = S$1
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', exchangeRate: 0.078 }, // Updated: ₱12.8 = RM1
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', exchangeRate: 0.60 }, // Updated: ₱1 = ฿0.60
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', exchangeRate: 265 }, // Updated: ₱1 = Rp265
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', exchangeRate: 415 }, // Updated: ₱1 = ₫415
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', exchangeRate: 0.12 }, // Updated: ₱8.3 = ¥1
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', exchangeRate: 1.36 }, // Updated: ₱1 = ₹1.36
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', exchangeRate: 0.025 }, // Updated: ₱40 = A$1
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', exchangeRate: 0.022 }, // Updated: ₱45 = C$1
}

// Default currency per country code
export const DEFAULT_CURRENCY_BY_COUNTRY: Record<string, string> = {
  PH: 'PHP', // Philippines
  US: 'USD', // United States
  GB: 'GBP', // United Kingdom
  EU: 'EUR', // European Union
  JP: 'JPY', // Japan
  KR: 'KRW', // South Korea
  SG: 'SGD', // Singapore
  MY: 'MYR', // Malaysia
  TH: 'THB', // Thailand
  ID: 'IDR', // Indonesia
  VN: 'VND', // Vietnam
  CN: 'CNY', // China
  IN: 'INR', // India
  AU: 'AUD', // Australia
  CA: 'CAD', // Canada
}

// Default fallback currency
export const DEFAULT_CURRENCY = 'USD'

// Admin's base currency (all prices in database are stored in this currency)
export const ADMIN_BASE_CURRENCY = 'PHP'

// Get currency from country code
export function getCurrencyByCountry(countryCode: string): string {
  return DEFAULT_CURRENCY_BY_COUNTRY[countryCode] || DEFAULT_CURRENCY
}

// Get currency config
export function getCurrencyConfig(currencyCode: string): CurrencyConfig {
  return CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY]
}

// Convert price from admin base currency (PHP) to user's selected currency
export async function getLiveRates() {
  const { data } = await supabase.from('site_settings').select('forex_rates').single();
  return data?.forex_rates;
}

export function convertPrice(phpAmount: number, targetCurrency: string): number {
  // Note: This remains synchronous for UI speed, but can be updated by a provider/context
  const targetConfig = CURRENCIES[targetCurrency]
  if (!targetConfig) return phpAmount
  return phpAmount * targetConfig.exchangeRate
}

// Format price with currency
export function formatPrice(amount: number, currencyCode: string): string {
  const config = getCurrencyConfig(currencyCode)
  return `${config.symbol}${amount.toFixed(2)}`
}

// Format converted price (takes PHP amount and converts to user's currency)
export function formatConvertedPrice(phpAmount: number, targetCurrency: string): string {
  const converted = convertPrice(phpAmount, targetCurrency)
  const config = getCurrencyConfig(targetCurrency)
  return `${config.symbol}${converted.toFixed(2)}`
}

// Detect country from IP using multiple fallback services
export async function detectCountryFromIP(): Promise<string> {
  const services = [
    'https://ipapi.co/json/',
    'https://ip-api.com/json/',
    'https://freeipapi.com/api/json/'
  ]

  for (const url of services) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) })
      if (response.ok) {
        const data = await response.json()
        const code = data.country_code || data.countryCode || data.country
        if (code && typeof code === 'string') {
          return code.toUpperCase()
        }
      }
    } catch (error) {
      console.log(`Geolocation service ${url} failed:`, error)
    }
  }
  
  // Default to PH since the site seems targeting Philippines
  return 'PH'
}


// Store currency in localStorage for quick access
export function setUserCurrency(currency: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_currency', currency)
  }
}

export function getUserCurrency(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user_currency')
  }
  return null
}

// Store admin currency settings
export interface AdminCurrencySettings {
  baseCurrency: string
  exchangeRates: Record<string, number>
}

export function getAdminCurrencySettings(): AdminCurrencySettings {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('admin_currency_settings')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // Return defaults
      }
    }
  }
  // Default admin settings (PHP as base)
  return {
    baseCurrency: 'PHP',
    exchangeRates: {
      USD: 0.018,
      EUR: 0.016,
      GBP: 0.014,
      JPY: 2.65,
      KRW: 24,
      SGD: 0.024,
      MYR: 0.079,
      THB: 0.59,
      IDR: 280,
      VND: 430,
      CNY: 0.13,
      INR: 1.48,
      AUD: 0.027,
      CAD: 0.025,
    }
  }
}

export function setAdminCurrencySettings(settings: AdminCurrencySettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_currency_settings', JSON.stringify(settings))
  }
}
