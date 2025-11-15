import { NextRequest, NextResponse } from 'next/server';

/**
 * All Bookings Reporting API
 *
 * Retrieves comprehensive booking information including:
 * - Booking details (ID, status, date, time)
 * - Customer information
 * - Service/product details
 * - Participants and guest information
 * - Booking source and metadata
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
    const url = `${apiUrl}/reporting/bookings`;

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
        { error: 'Failed to fetch bookings', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('[BOOKINGS API ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
