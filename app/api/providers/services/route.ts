import { NextRequest, NextResponse } from 'next/server';

// Provider API endpoints
const PROVIDER_APIS: Record<string, { baseUrl: string; keyParam: string }> = {
  weboostph: {
    baseUrl: 'https://weboostph.biz/api/v2',
    keyParam: 'key'
  },
  smmworld: {
    baseUrl: 'https://smmworld.org/api/v2',
    keyParam: 'key'
  },
  // Add more providers here as needed
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, apiKey, action, method = 'POST', data } = body;

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'Provider and API key are required' },
        { status: 400 }
      );
    }

    const providerConfig = PROVIDER_APIS[provider];
    if (!providerConfig) {
      return NextResponse.json(
        { error: 'Unknown provider' },
        { status: 400 }
      );
    }

    // Build the URL
    const url = new URL(providerConfig.baseUrl);
    
    // Build request body
    const params = new URLSearchParams();
    params.append(providerConfig.keyParam, apiKey);
    if (action) {
      params.append('action', action);
    }
    
    // Add additional data parameters
    if (data && typeof data === 'object') {
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        params.append(key, String(value));
      }
    }

    // Make the request
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Provider API error: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Provider API Response:', provider, responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Provider API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from provider API' },
      { status: 500 }
    );
  }
}

// Also support GET for simple service listing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider') || 'weboostph';
  const action = searchParams.get('action');
  const apiKey = searchParams.get('apiKey');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is required' },
      { status: 400 }
    );
  }

  try {
    const providerConfig = PROVIDER_APIS[provider];
    if (!providerConfig) {
      return NextResponse.json(
        { error: 'Unknown provider' },
        { status: 400 }
      );
    }

    // Build the URL with query params
    const url = new URL(providerConfig.baseUrl);
    url.searchParams.append(providerConfig.keyParam, apiKey);
    if (action) {
      url.searchParams.append('action', action);
    }

    // Make the request server-side (bypasses CORS)
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Provider API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Provider API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
