import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Basic security: check for auth header or secret param
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // We use exchangerate-api.com (Free tier offers 1,500 requests/month)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/PHP');
    const data = await response.json();

    if (!data || !data.rates) {
      throw new Error('Failed to fetch rates');
    }

    const rates = {
      USD: data.rates.USD,
      JPY: data.rates.JPY,
      EUR: data.rates.EUR,
      GBP: data.rates.GBP,
      KRW: data.rates.KRW,
      SGD: data.rates.SGD,
      updated_at: new Date().toISOString()
    };

    // Store in Supabase 'site_settings' table
    // We use upsert on the single row (usually id 1)
    const { error } = await supabase
      .from('site_settings')
      .upsert({ 
        id: 1, // Assuming single row settings
        forex_rates: rates 
      });

    if (error) throw error;

    return NextResponse.json({ success: true, rates });
  } catch (error: any) {
    console.error('Forex Update Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
