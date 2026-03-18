import { NextRequest, NextResponse } from 'next/server';

// SMM API Configuration
const SMM_API_URL = 'https://weboostph.biz/api/v2';
const SMM_API_KEY = process.env.NEXT_PUBLIC_SMM_API_KEY || 'ba0bdd77f025b1fc19b321ecaf0acf67';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, orderIds } = body;

    console.log('Order status request:', { orderId, orderIds });
    
    let response;
    
    // Check if single order or multiple orders
    if (orderIds && Array.isArray(orderIds)) {
      // Multiple orders status check
      const formData = new URLSearchParams();
      formData.append('key', SMM_API_KEY);
      formData.append('action', 'status');
      formData.append('orders', orderIds.join(','));
      
      console.log('Making request to SMM API with body:', formData.toString());
      
      response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
    } 
    else if (orderId) {
      // Single order status check
      const formData = new URLSearchParams();
      formData.append('key', SMM_API_KEY);
      formData.append('action', 'status');
      formData.append('order', orderId.toString());
      
      console.log('Making request to SMM API with body:', formData.toString());
      
      response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
    } else {
      return NextResponse.json(
        { error: 'orderId or orderIds is required' },
        { status: 400 }
      );
    }

    console.log('SMM API Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`SMM API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('SMM API Response data:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('SMM Order Status Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Also support GET requests for simpler integration
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  console.log('GET Order status request:', { orderId });

  if (!orderId) {
    return NextResponse.json(
      { error: 'orderId is required' },
      { status: 400 }
    );
  }

  try {
    const formData = new URLSearchParams();
    formData.append('key', SMM_API_KEY);
    formData.append('action', 'status');
    formData.append('order', orderId);
    
    console.log('Making GET request to SMM API with body:', formData.toString());
    
    const response = await fetch(SMM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    console.log('SMM API Response status:', response.status);

    if (!response.ok) {
      throw new Error(`SMM API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('SMM API Response data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('SMM Order Status Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
