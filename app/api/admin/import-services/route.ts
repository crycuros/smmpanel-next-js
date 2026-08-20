import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRates, convertCurrency } from '@/lib/currency-service';

const SITE_BASE_CURRENCY = 'PHP';

// Server-side import route - uses service_role to bypass RLS
export async function POST(request: NextRequest) {
  try {
    // Use service_role key for DB operations
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const body = await request.json();
    const { categories, selectedServiceIds, profitPercent, providerId, providerCurrency } = body;

    if (!categories || !selectedServiceIds || !providerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const profit = parseFloat(profitPercent) || 0;
    const rates = await getExchangeRates();

    // Get existing categories
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('category_id, category_name');

    const categoryMap = new Map<string, number>();
    existingCategories?.forEach((cat: any) => {
      categoryMap.set(cat.category_name.toLowerCase(), cat.category_id);
    });

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const category of categories) {
      const categorySelectedServiceIds = new Set(
        category.services
          .filter((s: any) => selectedServiceIds.includes(s.service))
          .map((s: any) => s.service)
      );

      if (categorySelectedServiceIds.size === 0) continue;

      // Find or create category
      let categoryId = categoryMap.get(category.name.toLowerCase());

      if (!categoryId) {
        const { data: newCategory, error: catError } = await supabase
          .from('categories')
          .insert([{ category_name: category.name }])
          .select('category_id')
          .single();

        if (catError) {
          console.error('Category insert error:', category.name, catError);
          continue;
        }

        if (newCategory) {
          categoryId = newCategory.category_id;
          categoryMap.set(category.name.toLowerCase(), categoryId);
        }
      }

      if (!categoryId) {
        categoryId = 1;
      }

      // Process selected services
      for (const svc of category.services) {
        if (!categorySelectedServiceIds.has(svc.service)) continue;

        const basePrice = parseFloat(svc.rate) || 0;
        const phpPrice = providerCurrency === 'USD' 
          ? convertCurrency(basePrice, 'USD', SITE_BASE_CURRENCY, rates)
          : basePrice;
        const sellingPrice = phpPrice + (phpPrice * profit / 100);

        const apiServiceId = parseInt(svc.service);

        // Check if service already exists by api_serviceid
        const { data: existingService } = await supabase
          .from('services')
          .select('service_id')
          .eq('api_serviceid', apiServiceId)
          .eq('category_id', categoryId)
          .maybeSingle();

        if (existingService) {
          const { error: updateError } = await supabase
            .from('services')
            .update({
              service_price: sellingPrice,
              service_profit: profit.toString(),
              min_order: parseInt(svc.min) || 1,
              max_order: parseInt(svc.max) || 100000,
              service_desc: `Min: ${svc.min}, Max: ${svc.max}, Rate: ${svc.rate}`,
              api_provider: providerId
            })
            .eq('service_id', existingService.service_id);

          if (updateError) {
            console.error('Update error:', svc.name, updateError);
          } else {
            updatedCount++;
          }
          skippedCount++;
        } else {
          const { error: insertError } = await supabase
            .from('services')
            .insert([{
              service_name: svc.name,
              category_id: categoryId,
              service_price: sellingPrice,
              service_profit: profit.toString(),
              min_order: parseInt(svc.min) || 1,
              max_order: parseInt(svc.max) || 100000,
              service_desc: `Min: ${svc.min}, Max: ${svc.max}, Rate: ${svc.rate}`,
              service_type: '2',
              api_serviceid: apiServiceId,
              api_provider: providerId,
              api_id: 0,
              service_status: '2'
            }]);

          if (insertError) {
            console.error('Insert error:', svc.name, insertError);
          } else {
            importedCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedCount,
      updated: updatedCount,
      skipped: skippedCount,
      message: `Import complete! ${importedCount} new, ${updatedCount} updated, ${skippedCount} total processed`
    });

  } catch (error: any) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}
