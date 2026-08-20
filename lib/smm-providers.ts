// Centralized SMM provider configurations
// Add new providers here — all routes import from this file

export interface ProviderConfig {
  url: string;
  key: string;
  currency: string; // ISO currency code the provider charges in
}

export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  weboostph: {
    url: process.env.SMM_API_URL || process.env.NEXT_PUBLIC_SMM_API_URL || 'https://weboostph.biz/api/v2',
    key: process.env.SMM_API_KEY || process.env.NEXT_PUBLIC_SMM_API_KEY || '',
    currency: 'PHP',
  },
  smmworld: {
    url: 'https://smmworld.org/api/v2',
    key: process.env.SMMWORLD_API_KEY || '',
    currency: 'USD',
  },
  smmgen: {
    url: 'https://my.smmgen.com/api/v2',
    key: process.env.SMMGEN_API_KEY || '',
    currency: 'USD',
  },
};

export function getProviderConfig(providerId: string): ProviderConfig {
  return PROVIDER_CONFIGS[providerId] || PROVIDER_CONFIGS['weboostph'];
}

export function getProviderCurrency(providerId: string): string {
  return getProviderConfig(providerId).currency;
}
