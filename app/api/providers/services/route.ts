import { NextRequest, NextResponse } from 'next/server';

// Provider API endpoints
const PROVIDER_APIS: Record<string, { baseUrl: string; keyParam: string }> = {
  weboostph: {
    baseUrl: 'https://weboostph.biz/api/v2',
    keyParam: 'key'
  },
  // Add more providers here as needed
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, apiKey, action } = body;

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
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
