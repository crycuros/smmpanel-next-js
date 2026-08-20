import { NextRequest, NextResponse } from 'next/server';
import { getProviderConfig, PROVIDER_CONFIGS } from '@/lib/smm-providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, apiKey, action, data } = body;

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'Provider and API key are required' },
        { status: 400 }
      );
    }

    const config = PROVIDER_CONFIGS[provider];
    if (!config) {
      return NextResponse.json(
        { error: 'Unknown provider' },
        { status: 400 }
      );
    }

    const url = new URL(config.url);

    const params = new URLSearchParams();
    params.append('key', apiKey);
    if (action) {
      params.append('action', action);
    }

    if (data && typeof data === 'object') {
      for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
        params.append(k, String(v));
      }
    }

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
    const config = PROVIDER_CONFIGS[provider];
    if (!config) {
      return NextResponse.json(
        { error: 'Unknown provider' },
        { status: 400 }
      );
    }

    const url = new URL(config.url);
    url.searchParams.append('key', apiKey);
    if (action) {
      url.searchParams.append('action', action);
    }

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
