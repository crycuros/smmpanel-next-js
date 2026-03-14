// Currency configuration based on country
export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  exchangeRate: number // Rate to convert FROM PHP (base currency)
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', exchangeRate: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 0.018 }, // ₱56 = $1
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.016 }, // ₱62 = €1
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 0.014 }, // ₱70 = £1
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', exchangeRate: 2.65 }, // ₱1 = ¥2.65
  KRW: { code: 'KRW', symbol: '₩', name: 'Korean Won', exchangeRate: 24 }, // ₱1 = ₩24
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', exchangeRate: 0.024 }, // ₱42 = S$1
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', exchangeRate: 0.079 }, // ₱12.6 = RM1
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', exchangeRate: 0.59 }, // ₱1 = ฿0.59
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', exchangeRate: 280 }, // ₱1 = Rp280
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', exchangeRate: 430 }, // ₱1 = ₫430
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', exchangeRate: 0.13 }, // ₱7.5 = ¥1
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', exchangeRate: 1.48 }, // ₱1 = ₹1.48
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', exchangeRate: 0.027 }, // ₱37 = A$1
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', exchangeRate: 0.025 }, // ₱40 = C$1
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
export function convertPrice(phpAmount: number, targetCurrency: string): number {
  const targetConfig = CURRENCIES[targetCurrency]
  if (!targetConfig) return phpAmount
  
  // Convert PHP to target currency
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

// Detect country from IP using a simple approach
// In production, you'd use a proper IP geolocation service
export async function detectCountryFromIP(): Promise<string> {
  try {
    // Try to get country from IP using a free geolocation API
    const response = await fetch('https://ipapi.co/json/')
    if (response.ok) {
      const data = await response.json()
      return data.country_code || 'US'
    }
  } catch (error) {
    console.log('Could not detect country from IP:', error)
  }
  
  // Default to US if detection fails
  return 'US'
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
