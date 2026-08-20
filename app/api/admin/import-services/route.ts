import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRates, convertCurrency } from '@/lib/currency-service';

const SITE_BASE_CURRENCY = 'PHP';
const BATCH_SIZE = 500;

export async function POST(request: NextRequest) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const body = await request.json();
    const { services, profitPercent, providerId, providerCurrency } = body;

    if (!services || services.length === 0 || !providerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const profit = parseFloat(profitPercent) || 0;
    const rates = await getExchangeRates();

    // Collect unique category names from this batch
    const categoryNames = [...new Set(services.map((s: any) => s.category || 'Uncategorized'))];

    // Get existing categories
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('category_id, category_name');

    const categoryMap = new Map<string, number>();
    existingCategories?.forEach((cat: any) => {
      categoryMap.set(cat.category_name.toLowerCase(), cat.category_id);
    });

    // Create missing categories in batch
    for (const catName of categoryNames) {
      if (!categoryMap.has(catName.toLowerCase())) {
        const { data: newCat } = await supabase
          .from('categories')
          .insert([{ category_name: catName }])
          .select('category_id')
          .single();
        if (newCat) {
          categoryMap.set(catName.toLowerCase(), newCat.category_id);
        }
      }
    }

    // Get existing services for this provider
    const { data: existingServices } = await supabase
      .from('services')
      .select('service_id, api_serviceid, category_id');

    const existingServiceMap = new Map<string, number>();
    existingServices?.forEach((s: any) => {
      existingServiceMap.set(`${s.api_serviceid}_${s.category_id}`, s.service_id);
    });

    const newServices: any[] = [];
    const updates: { id: number; data: any }[] = [];

    for (const svc of services) {
      const apiServiceId = parseInt(svc.service);
      const categoryId = categoryMap.get((svc.category || 'Uncategorized').toLowerCase()) || 1;

      const basePrice = parseFloat(svc.rate) || 0;
      const phpPrice = providerCurrency === 'USD'
        ? convertCurrency(basePrice, 'USD', SITE_BASE_CURRENCY, rates)
        : basePrice;
      const sellingPrice = phpPrice + (phpPrice * profit / 100);

      const svcData = {
        service_name: svc.name,
        category_id: categoryId,
        service_price: sellingPrice,
        service_profit: profit.toString(),
        min_order: parseInt(svc.min) || 1,
        max_order: parseInt(svc.max) || 100000,
        service_desc: `Min: ${svc.min}, Max: ${svc.max}, Rate: ${svc.rate}`,
        service_type: svc.type || 'Default',
        service_refill: svc.refill ? 1 : 0,
        service_cancel: svc.cancel ? 1 : 0,
        service_dripfeed: svc.dripfeed ? 1 : 0,
        api_serviceid: apiServiceId,
        api_provider: providerId,
        api_id: 0,
        service_status: '2'
      };

      const existingId = existingServiceMap.get(`${apiServiceId}_${categoryId}`);
      if (existingId) {
        updates.push({ id: existingId, data: {
          service_price: svcData.service_price,
          service_profit: svcData.service_profit,
          min_order: svcData.min_order,
          max_order: svcData.max_order,
          service_desc: svcData.service_desc,
          service_type: svcData.service_type,
          service_refill: svcData.service_refill,
          service_cancel: svcData.service_cancel,
          service_dripfeed: svcData.service_dripfeed,
          api_provider: providerId
        }});
      } else {
        newServices.push(svcData);
      }
    }

    // Batch insert
    let insertedCount = 0;
    for (let i = 0; i < newServices.length; i += BATCH_SIZE) {
      const batch = newServices.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('services').insert(batch);
      if (!error) insertedCount += batch.length;
    }

    // Batch update
    let updatedCount = 0;
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = updates.slice(i, i + BATCH_SIZE);
      const promises = batch.map(u =>
        supabase.from('services').update(u.data).eq('service_id', u.id)
      );
      const results = await Promise.allSettled(promises);
      updatedCount += results.filter(r => r.status === 'fulfilled').length;
    }

    return NextResponse.json({
      success: true,
      imported: insertedCount,
      updated: updatedCount,
      total: services.length
    });

  } catch (error: any) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}
