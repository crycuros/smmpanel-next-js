import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, getUser, getDbUser } from '@/lib/auth-utils';
import { getExchangeRates, convertCurrency } from '@/lib/currency-service';
import { getProviderConfig, getProviderCurrency } from '@/lib/smm-providers';
import { z } from 'zod';

// Base currency of the site
const SITE_BASE_CURRENCY = 'PHP';

const DEFAULT_PROFIT_PERCENT = 20;

// Order validation schema
const orderSchema = z.object({
  service: z.union([z.string(), z.number()]),
  link: z.string().min(1, 'Link/Comments required'),
  quantity: z.number().positive(),
  runs: z.number().optional(),
  interval: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate input
    const body = await request.json();
    const validation = orderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { service: providerServiceId, link, quantity, runs, interval } = validation.data;
    const supabase = await getServerSupabase();

    // 3. Get user, service, and exchange rates
    const [dbUser, { data: serviceData }, rates] = await Promise.all([
      getDbUser(user),
      supabase
        .from('services')
        .select('*, categories(*)')
        .eq('api_serviceid', providerServiceId)
        .single(),
      getExchangeRates()
    ]);

    if (!dbUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (!serviceData) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Identify provider and its currency
    const providerId = serviceData?.api_provider || 'weboostph';
    const isCustomService = providerId === 'custom' || serviceData?.api_serviceid === 0;
    const providerCurrency = isCustomService ? 'PHP' : getProviderCurrency(providerId);

    // service_price in our DB is assumed to be in PHP (Base)
    const customerPricePHP = (parseFloat(serviceData.service_price) || 0) * (quantity / 1000);
    const userBalancePHP = parseFloat(dbUser.balance) || 0;

    // 4. Check if user has enough balance
    if (userBalancePHP < customerPricePHP) {
      return NextResponse.json(
        { error: `Insufficient balance. Required: ₱${customerPricePHP.toFixed(2)}, Available: ₱${userBalancePHP.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Calculate provider cost in provider's currency
    // If our DB price is PHP, we need to know the provider cost in their currency
    const profitPercent = parseFloat(serviceData.service_profit) || DEFAULT_PROFIT_PERCENT;
    
    // Convert customer PHP to Provider Currency to calculate cost/profit correctly
    const customerPriceProviderCurrency = convertCurrency(customerPricePHP, SITE_BASE_CURRENCY, providerCurrency, rates);
    const providerCostCurrency = profitPercent > 0 
      ? customerPriceProviderCurrency / (1 + profitPercent / 100) 
      : customerPriceProviderCurrency;

    const profitPHP = customerPricePHP - convertCurrency(providerCostCurrency, providerCurrency, SITE_BASE_CURRENCY, rates);

    // 5. Atomic balance deduction
    const { error: deductionError } = await supabase.rpc('deduct_balance', {
      user_id: dbUser.client_id,
      amount: customerPricePHP
    });

    if (deductionError) {
      console.error('Balance deduction failed:', deductionError);
      return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
    }

    // 6. Submit order to provider
    let providerOrderResult: any = { order: 0 };
    
    if (isCustomService) {
      // Custom service — no provider API call, admin fulfills manually
      providerOrderResult = { order: 0 };
    } else {
      providerOrderResult = await submitOrderToProvider(
        providerServiceId, 
        link, 
        quantity, 
        runs, 
        interval,
        providerId
      );
    }

    if (providerOrderResult.error) {
      // 7. Refund if provider fails
      await supabase.rpc('refund_balance', {
        user_id: dbUser.client_id,
        amount: customerPricePHP
      });

      return NextResponse.json(providerOrderResult, { status: 500 });
    }

    // 8. Save order record
    const orderData = {
      client_id: dbUser.client_id,
      service_id: serviceData.service_id,
      api_orderid: providerOrderResult.order || 0,
      order_detail: link,
      order_url: link,
      order_quantity: quantity,
      order_charge: customerPricePHP, 
      api_charge: convertCurrency(providerCostCurrency, providerCurrency, SITE_BASE_CURRENCY, rates),   
      order_profit: profitPHP,       
      order_status: isCustomService ? 'pending' : 'pending',
      order_create: new Date().toISOString(),
      last_check: new Date().toISOString(),
      order_where: 'site',
      order_increase: 0,
      order_error: ''
    };

    await supabase.from('orders').insert(orderData);

    return NextResponse.json({
      success: true,
      order: providerOrderResult.order,
      customer_price: customerPricePHP,
      provider_currency: providerCurrency,
      local_balance: userBalancePHP - customerPricePHP
    });

  } catch (error) {
    console.error('SMM Create Order Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


async function submitOrderToProvider(
  serviceId: number | string,
  link: string,
  quantity: number,
  runs?: number,
  interval?: number,
  providerId: string = 'weboostph'
) {
  try {
    const providerConfig = getProviderConfig(providerId);
    if (!providerConfig.key) throw new Error(`Provider API key missing for ${providerId}`);

    const formData = new URLSearchParams();
    formData.append('key', providerConfig.key);
    formData.append('action', 'add');
    formData.append('service', serviceId.toString());
    formData.append('link', link);
    formData.append('quantity', quantity.toString());

    if (runs) formData.append('runs', runs.toString());
    if (interval) formData.append('interval', interval.toString());

    const response = await fetch(providerConfig.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
  } catch (error) {
    console.error('Provider API Error:', error);
    return { error: 'Failed to submit order to provider' };
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await getDbUser(user);
    if (!dbUser || (dbUser.admin_type !== '1' && dbUser.admin_type !== '2')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'balance') {
      const providerId = searchParams.get('provider') || 'weboostph';
      const providerConfig = getProviderConfig(providerId);
      if (!providerConfig.key) {
        return NextResponse.json({ error: 'Provider API key not configured' }, { status: 500 });
      }
      const response = await fetch(providerConfig.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ key: providerConfig.key, action: 'balance' }).toString(),
      });
      return NextResponse.json(await response.json());
    } 
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

