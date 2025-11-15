import { NextRequest, NextResponse } from 'next/server';

/**
 * Transactions Reporting API
 *
 * Retrieves detailed transaction information including:
 * - Transaction summary (totals, discounts, status)
 * - Booking details (date, time, participants, items)
 * - Customer information (name, contact, history)
 * - Payment information (type, amount, status)
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const apiUrl = process.env.NEXT_PUBLIC_RESOVA_API_URL || 'https://api.resova.io/v1';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = new URLSearchParams();

    // Add all supported parameters
    const supportedParams = [
      'page',
      'limit',
      'skip',
      'created_before',
      'created_after',
      'booking_before',
      'booking_after',
      'range',
      'start_date',
      'end_date',
      'date_field',
      'date_precise'
    ];

    supportedParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        queryParams.append(param, value);
      }
    });

    // Build the full URL
    const url = `${apiUrl}/reporting/transactions?${queryParams.toString()}`;

    // Make the request to Resova API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch transactions', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('[TRANSACTIONS API ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
