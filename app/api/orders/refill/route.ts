import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getProviderConfig } from '@/lib/smm-providers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Look up which provider an order belongs to
async function resolveOrderProvider(apiOrderId: number, provider?: string) {
  if (provider) {
    const config = getProviderConfig(provider);
    return config.key ? config : null;
  }

  const { data: order } = await supabase
    .from('orders')
    .select('service_id, services(api_provider)')
    .eq('api_orderid', apiOrderId)
    .single();

  const providerId = (order as any)?.services?.api_provider || 'weboostph';
  const config = getProviderConfig(providerId);
  return config.key ? config : null;
}

async function callProviderApi(url: string, key: string, params: Record<string, string>) {
  const formData = new URLSearchParams();
  formData.append('key', key);
  for (const [k, v] of Object.entries(params)) {
    formData.append(k, v);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Provider API error ${response.status}: ${text.substring(0, 200)}`);
  }
}

// Create refill request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, orderIds, provider } = body;

    if (orderIds && Array.isArray(orderIds)) {
      const config = provider ? getProviderConfig(provider) : await resolveOrderProvider(orderIds[0], provider);
      if (!config) {
        return NextResponse.json({ error: 'Provider not configured' }, { status: 500 });
      }
      const data = await callProviderApi(config.url, config.key, {
        action: 'refill',
        orders: orderIds.join(','),
      });
      return NextResponse.json(data);
    }

    if (orderId) {
      const config = await resolveOrderProvider(orderId, provider);
      if (!config) {
        return NextResponse.json({ error: 'Provider not configured' }, { status: 500 });
      }
      const data = await callProviderApi(config.url, config.key, {
        action: 'refill',
        order: orderId.toString(),
      });
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: 'orderId or orderIds is required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('SMM Refill Error:', error);
    return NextResponse.json(
      { error: 'Failed to create refill request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get refill status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const refillId = searchParams.get('refillId');
  const refillIds = searchParams.get('refillIds');
  const provider = searchParams.get('provider') || undefined;

  try {
    if (refillIds) {
      const config = getProviderConfig(provider || 'weboostph');
      if (!config.key) {
        return NextResponse.json({ error: 'Provider not configured' }, { status: 500 });
      }
      const data = await callProviderApi(config.url, config.key, {
        action: 'refill_status',
        refills: refillIds,
      });
      return NextResponse.json(data);
    }

    if (refillId) {
      const config = getProviderConfig(provider || 'weboostph');
      if (!config.key) {
        return NextResponse.json({ error: 'Provider not configured' }, { status: 500 });
      }
      const data = await callProviderApi(config.url, config.key, {
        action: 'refill_status',
        refill: refillId,
      });
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: 'refillId or refillIds is required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('SMM Refill Status Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch refill status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
