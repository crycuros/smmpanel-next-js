"use client"

import { useState, useEffect, useCallback } from 'react'
import { CURRENCIES, CurrencyConfig, ADMIN_BASE_CURRENCY, getAdminCurrencySettings } from '@/lib/currency'

interface CurrencyState {
  currency: string
  country: string
  config: CurrencyConfig
  isLoading: boolean
  // Conversion functions
  convertPrice: (phpAmount: number) => number
  formatPrice: (phpAmount: number) => string
}

export function useCurrency() {
  const [state, setState] = useState<CurrencyState>({
    currency: 'USD',
    country: 'US',
    config: CURRENCIES['USD'],
    isLoading: true,
    convertPrice: (phpAmount: number) => phpAmount * CURRENCIES['USD'].exchangeRate,
    formatPrice: (phpAmount: number) => `${CURRENCIES['USD'].symbol}${(phpAmount * CURRENCIES['USD'].exchangeRate).toFixed(2)}`
  })

  // Function to convert PHP to user's currency
  const convertPrice = useCallback((phpAmount: number): number => {
    const adminSettings = getAdminCurrencySettings()
    const userCurrency = state.currency || 'USD'
    
    // Get the exchange rate for user's currency
    const currencyConfig = CURRENCIES[userCurrency]
    if (!currencyConfig) return phpAmount
    
    // Convert from PHP to user's currency using exchange rate
    return phpAmount * currencyConfig.exchangeRate
  }, [state.currency])

  // Function to format price with currency symbol
  const formatPrice = useCallback((phpAmount: number): string => {
    const userCurrency = state.currency || 'USD'
    const currencyConfig = CURRENCIES[userCurrency]
    if (!currencyConfig) return `₱${phpAmount.toFixed(2)}`
    
    const converted = phpAmount * currencyConfig.exchangeRate
    return `${currencyConfig.symbol}${converted.toFixed(2)}`
  }, [state.currency])

  useEffect(() => {
    async function detectAndSetCurrency() {
      try {
        // First check if user has a saved preference
        let savedCurrency = null
        if (typeof window !== 'undefined') {
          savedCurrency = localStorage.getItem('user_currency')
        }
        
        let detectedCurrency = savedCurrency
        let country = 'US'
        
        if (!savedCurrency) {
          // Detect country from IP
          try {
            const response = await fetch('/api/country-detect')
            const data = await response.json()
            
            if (data.currency) {
              detectedCurrency = data.currency
              country = data.country || 'US'
              
              // Save to localStorage
              if (typeof window !== 'undefined') {
                localStorage.setItem('user_currency', data.currency)
                localStorage.setItem('user_country', data.country || 'US')
              }
            }
          } catch (e) {
            console.log('Country detection failed, using default')
          }
        }
        
        // Get the currency config
        const currencyCode = detectedCurrency || 'USD'
        const currencyConfig = CURRENCIES[currencyCode] || CURRENCIES['USD']
        
        setState({
          currency: currencyCode,
          country: country,
          config: currencyConfig,
          isLoading: false,
          convertPrice: (phpAmount: number) => phpAmount * currencyConfig.exchangeRate,
          formatPrice: (phpAmount: number) => `${currencyConfig.symbol}${(phpAmount * currencyConfig.exchangeRate).toFixed(2)}`
        })
      } catch (error) {
        console.error('Error detecting currency:', error)
        const defaultConfig = CURRENCIES['USD']
        setState(prev => ({
          ...prev,
          isLoading: false,
          convertPrice: (phpAmount: number) => phpAmount * defaultConfig.exchangeRate,
          formatPrice: (phpAmount: number) => `${defaultConfig.symbol}${(phpAmount * defaultConfig.exchangeRate).toFixed(2)}`
        }))
      }
    }

    detectAndSetCurrency()
  }, [])

  return state
}

export function useCurrencyFormatter() {
  const { currency, config, convertPrice, formatPrice } = useCurrency()

  const format = (amount: number): string => {
    return `${config.symbol}${amount.toFixed(2)}`
  }

  return { format, currency, symbol: config.symbol, convertPrice, formatPrice }
}
