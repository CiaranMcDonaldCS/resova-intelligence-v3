import { NextRequest, NextResponse } from 'next/server';

/**
 * Availability API - Get Instance Details
 *
 * Retrieves details for a specific instance (time slot).
 * Returns capacity, availability, time, and other instance-specific information.
 *
 * Required before adding bookings to check availability.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { instance_id: string } }
) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const apiUrl = process.env.NEXT_PUBLIC_RESOVA_API_URL || 'https://api.resova.io/v1';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    const { instance_id } = params;

    if (!instance_id) {
      return NextResponse.json(
        { error: 'instance_id is required' },
        { status: 400 }
      );
    }

    // Build the full URL
    const url = `${apiUrl}/availability/instance/${instance_id}`;

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
        { error: 'Failed to fetch instance details', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('[AVAILABILITY INSTANCE API ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
