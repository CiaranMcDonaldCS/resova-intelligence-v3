import { NextRequest, NextResponse } from 'next/server';

/**
 * Availability API - Daily Availability Calendar
 *
 * Retrieves daily availability calendar showing available dates and instances for items.
 * Use to populate calendar views and show available booking slots.
 *
 * Query Parameters:
 * - item_id: Filter by specific item
 * - start_date: Start date for availability range
 * - end_date: End date for availability range
 * - Additional parameters as supported by Resova API
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

    // Forward all query parameters to Resova API
    searchParams.forEach((value, key) => {
      queryParams.append(key, value);
    });

    // Build the full URL
    const url = `${apiUrl}/availability/daily${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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
        { error: 'Failed to fetch daily availability', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('[AVAILABILITY DAILY API ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
