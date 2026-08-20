import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRates, convertCurrency } from '@/lib/currency-service';

const SITE_BASE_CURRENCY = 'PHP';
const BATCH_SIZE = 500;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { apiKey, apiUrl, providerId = 'smmgen' } = body;

    if (!apiKey || !apiUrl) {
      return NextResponse.json({ error: 'API key and URL are required' }, { status: 400 });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // 1. Fetch live exchange rates
    const rates = await getExchangeRates();

    // 2. Determine provider currency and markup
    const { data: providerInfo } = await supabase
      .from('service_api')
      .select('currency, api_profit')
      .eq('api_name', providerId)
      .single();

    const providerCurrency = providerInfo?.currency || 'PHP';
    const profitPercent = parseFloat(providerInfo?.api_profit) || 0;

    // 3. Fetch services from provider API
    let services: any[] = [];

    const postUrl = `${apiKey ? apiUrl : apiUrl}?key=${apiKey}`;
    const svcRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `key=${encodeURIComponent(apiKey)}&action=services`,
    });

    const svcText = await svcRes.text();

    if (svcText.startsWith('[') || svcText.startsWith('{')) {
      const parsed = JSON.parse(svcText);
      if (Array.isArray(parsed)) {
        services = parsed;
      } else if (parsed && typeof parsed === 'object') {
        const possibleArrays = Object.values(parsed).filter(Array.isArray);
        if (possibleArrays.length > 0) services = possibleArrays[0] as any[];
      }
    }

    if (!services || services.length === 0) {
      return NextResponse.json({ error: 'No services returned from provider' }, { status: 500 });
    }

    // 4. Transform services
    const apiServiceIds = new Set<number>();
    const transformedServices = services.map((s: any) => {
      const apiId = parseInt(s.service);
      apiServiceIds.add(apiId);

      const providerRate = parseFloat(s.rate) || 0;
      const rateInPHP = convertCurrency(providerRate, providerCurrency, SITE_BASE_CURRENCY, rates);
      const markedUpRate = profitPercent > 0 ? rateInPHP * (1 + profitPercent / 100) : rateInPHP;

      return {
        service_id: apiId,
        service_name: s.name,
        service_price: markedUpRate,
        min_order: parseInt(s.min) || 1,
        max_order: parseInt(s.max) || 100000,
        service_desc: s.desc || s.name || '',
        service_type: s.type || 'Default',
        service_refill: s.refill ? 1 : 0,
        service_cancel: s.cancel ? 1 : 0,
        service_dripfeed: s.dripfeed ? 1 : 0,
        api_provider: providerId,
        category_name: s.category || 'Uncategorized',
      };
    });

    // 5. Get all existing services for this provider
    const { data: dbServices } = await supabase
      .from('services')
      .select('service_id')
      .eq('api_provider', providerId);

    const dbServiceIds = new Set(dbServices?.map(s => s.service_id) || []);

    // 6. Delete services removed from provider
    const idsToDelete = Array.from(dbServiceIds).filter(id => !apiServiceIds.has(id));
    if (idsToDelete.length > 0) {
      // Batch delete
      for (let i = 0; i < idsToDelete.length; i += BATCH_SIZE) {
        await supabase
          .from('services')
          .delete()
          .in('service_id', idsToDelete.slice(i, i + BATCH_SIZE))
          .eq('api_provider', providerId);
      }
    }

    // 7. Get category mapping
    const categoryNames = [...new Set(transformedServices.map(s => s.category_name))];
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('category_id, category_name');

    const categoryMap = new Map<string, number>();
    existingCategories?.forEach((cat: any) => {
      categoryMap.set(cat.category_name.toLowerCase(), cat.category_id);
    });

    for (const catName of categoryNames) {
      if (!categoryMap.has(catName.toLowerCase())) {
        const { data: newCat } = await supabase
          .from('categories')
          .insert([{ category_name: catName }])
          .select('category_id')
          .single();
        if (newCat) categoryMap.set(catName.toLowerCase(), newCat.category_id);
      }
    }

    // 8. Batch upsert: separate into updates and inserts
    const updates: { id: number; data: any }[] = [];
    const inserts: any[] = [];

    for (const svc of transformedServices) {
      const catId = categoryMap.get(svc.category_name.toLowerCase()) || 1;
      const base = {
        service_name: svc.service_name,
        service_price: svc.service_price,
        min_order: svc.min_order,
        max_order: svc.max_order,
        service_desc: svc.service_desc,
        api_provider: providerId,
        category_id: catId,
      };

      if (dbServiceIds.has(svc.service_id)) {
        updates.push({ id: svc.service_id, data: base });
      } else {
        inserts.push({
          ...base,
          service_id: svc.service_id,
          service_type: '2',
          api_serviceid: svc.service_id,
          api_id: 0,
          service_profit: profitPercent.toString(),
          service_status: '2',
        });
      }
    }

    // Batch insert
    let insertedCount = 0;
    for (let i = 0; i < inserts.length; i += BATCH_SIZE) {
      const batch = inserts.slice(i, i + BATCH_SIZE);
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
      stats: {
        totalInAPI: transformedServices.length,
        updatedCount,
        insertedCount,
        deletedCount: idsToDelete.length,
        providerCurrency,
        baseCurrency: SITE_BASE_CURRENCY,
      },
      message: `Sync complete: ${updatedCount} updated, ${insertedCount} inserted, ${idsToDelete.length} removed.`,
    });

  } catch (error: any) {
    console.error('Smart sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
