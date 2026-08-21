import { NextRequest, NextResponse } from 'next/server';

// SMM API Configuration
const SMM_API_URL = 'https://my.smmgen.com/api/v2';
const SMM_API_KEY = process.env.SMMGEN_API_KEY || 'ba0bdd77f025b1fc19b321ecaf0acf67';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, orderIds } = body;

    console.log('[SMM Status] Request:', { orderId, orderIds });
    
    let response;
    
    // Check if single order or multiple orders
    if (orderIds && Array.isArray(orderIds)) {
      const formData = new URLSearchParams();
      formData.append('key', SMM_API_KEY);
      formData.append('action', 'status');
      formData.append('orders', orderIds.join(','));
      
      console.log('[SMM Status] Multiple orders request:', formData.toString());
      
      response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: formData.toString(),
      });
    } 
    else if (orderId) {
      const formData = new URLSearchParams();
      formData.append('key', SMM_API_KEY);
      formData.append('action', 'status');
      formData.append('order', orderId.toString());
      
      console.log('[SMM Status] Single order request:', formData.toString());
      
      response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: formData.toString(),
      });
    } else {
      return NextResponse.json(
        { error: 'orderId or orderIds is required' },
        { status: 400 }
      );
    }

    console.log('[SMM Status] Response status:', response.status);
    const responseText = await response.text();
    console.log('[SMM Status] Response text:', responseText);
    
    // The SMM API returns 400 for some responses (like incorrect order ID)
    // but the response body contains valid JSON with error info
    // We should parse and return it instead of treating it as a failure
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: responseText };
    }
    
    // Return the response regardless of status - the API returns valid error info in the body
    console.log('[SMM Status] Response data:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('[SMM Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
  }

  try {
    const formData = new URLSearchParams();
    formData.append('key', SMM_API_KEY);
    formData.append('action', 'status');
    formData.append('order', orderId);
    
    console.log('[SMM Status] GET request:', formData.toString());
    
    const response = await fetch(SMM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: formData.toString(),
    });

    console.log('[SMM Status] GET Response status:', response.status);
    const responseText = await response.text();
    console.log('[SMM Status] GET Response text:', responseText);

    // The SMM API returns 400 for some responses (like incorrect order ID)
    // but the response body contains valid JSON with error info
    // We should parse and return it instead of treating it as a failure
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: responseText };
    }
    
    // Return the response regardless of status - the API returns valid error info in the body
    console.log('[SMM Status] GET Response data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[SMM Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
