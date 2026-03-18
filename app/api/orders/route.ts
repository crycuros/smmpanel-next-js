import { NextRequest, NextResponse } from 'next/server';

// SMM API Configuration
const SMM_API_URL = 'https://weboostph.biz/api/v2';
const SMM_API_KEY = process.env.NEXT_PUBLIC_SMM_API_KEY || 'ba0bdd77f025b1fc19b321ecaf0acf67';

// Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, link, quantity, runs, interval } = body;

    if (!service || !link || !quantity) {
      return NextResponse.json(
        { error: 'service, link, and quantity are required' },
        { status: 400 }
      );
    }

    // Build the request body
    const formData = new URLSearchParams();
    formData.append('key', SMM_API_KEY);
    formData.append('action', 'add');
    formData.append('service', service.toString());
    formData.append('link', link);
    formData.append('quantity', quantity.toString());

    if (runs) formData.append('runs', runs);
    if (interval) formData.append('interval', interval);

    const response = await fetch(SMM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`SMM API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('SMM Create Order Error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get user balance from SMM API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'balance') {
      const formData = new URLSearchParams();
      formData.append('key', SMM_API_KEY);
      formData.append('action', 'balance');
      
      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`SMM API error: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } 
    else if (action === 'services') {
      const formData = new URLSearchParams();
      formData.append('key', SMM_API_KEY);
      formData.append('action', 'services');
      
      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`SMM API error: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    }
    else {
      return NextResponse.json(
        { error: 'Invalid action. Use ?action=balance or ?action=services' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('SMM API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from SMM API', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
