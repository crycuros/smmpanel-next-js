import { NextRequest, NextResponse } from 'next/server';

// SMM API Configuration
const SMM_API_URL = 'https://weboostph.biz/api/v2';
const SMM_API_KEY = process.env.NEXT_PUBLIC_SMM_API_KEY || 'ba0bdd77f025b1fc19b321ecaf0acf67';

// Create refill request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, orderIds } = body;

    let response;
    
    // Check if single order or multiple orders
    if (orderIds && Array.isArray(orderIds)) {
      // Multiple refill requests
      const formData = new URLSearchParams();
      formData.append('key', SMM_API_KEY);
      formData.append('action', 'refill');
      formData.append('orders', orderIds.join(','));
      
      response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
    } 
    else if (orderId) {
      // Single refill request
      const formData = new URLSearchParams();
      formData.append('key', SMM_API_KEY);
      formData.append('action', 'refill');
      formData.append('order', orderId.toString());
      
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

    if (!response.ok) {
      throw new Error(`SMM API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

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

  try {
    if (refillIds) {
      // Multiple refill status check
      const formData = new URLSearchParams();
      formData.append('key', SMM_API_KEY);
      formData.append('action', 'refill_status');
      formData.append('refills', refillIds);
      
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
    else if (refillId) {
      // Single refill status check
      const formData = new URLSearchParams();
      formData.append('key', SMM_API_KEY);
      formData.append('action', 'refill_status');
      formData.append('refill', refillId);
      
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
    } else {
      return NextResponse.json(
        { error: 'refillId or refillIds is required' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('SMM Refill Status Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch refill status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
