import { NextRequest, NextResponse } from 'next/server';

/**
 * All Payments Reporting API
 *
 * Retrieves comprehensive payment information including:
 * - Payment details (ID, amount, status, type)
 * - Transaction information
 * - Payment method (card, cash, etc.)
 * - Processing status and timestamps
 * - Associated booking information
 * - Refund and adjustment details
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const apiUrl = process.env.NEXT_PUBLIC_RESOVA_API_URL || 'https://api.resova.io/v1';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.date_range) {
      return NextResponse.json(
        { error: 'date_range is required in request body' },
        { status: 400 }
      );
    }

    // Build the full URL
    const url = `${apiUrl}/reporting/payments`;

    // Make the request to Resova API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch payments', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('[PAYMENTS API ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
