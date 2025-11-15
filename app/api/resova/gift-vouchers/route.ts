import { NextRequest, NextResponse } from 'next/server';

/**
 * Gift Vouchers API - List All Gift Vouchers
 *
 * Retrieves all gift vouchers.
 * Returns vouchers sorted by creation date, newest first.
 *
 * Note: Gift voucher creation is done through the Resova dashboard.
 * This API provides read-only access for display and validation.
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

    // Build the full URL
    const url = `${apiUrl}/gift-vouchers`;

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
        { error: 'Failed to fetch gift vouchers', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('[GIFT VOUCHERS API ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
