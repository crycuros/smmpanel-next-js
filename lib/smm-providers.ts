// Centralized SMM provider configurations
// Add new providers here — all routes import from this file

export interface ProviderConfig {
  url: string;
  key: string;
  currency: string; // ISO currency code the provider charges in
}

export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  smmgen: {
    url: 'https://my.smmgen.com/api/v2',
    key: process.env.SMMGEN_API_KEY || '',
    currency: 'USD',
  },
};

export function getProviderConfig(providerId: string): ProviderConfig {
  return PROVIDER_CONFIGS[providerId] || PROVIDER_CONFIGS['smmgen'];
}

export function getProviderCurrency(providerId: string): string {
  return getProviderConfig(providerId).currency;
}
