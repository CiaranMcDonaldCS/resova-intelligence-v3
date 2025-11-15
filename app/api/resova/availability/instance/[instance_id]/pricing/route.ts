import { NextRequest, NextResponse } from 'next/server';

/**
 * Availability API - Calculate Instance Pricing
 *
 * Calculates pricing for a specific instance based on quantities.
 * Returns detailed price breakdown before checkout.
 *
 * Request Body:
 * {
 *   "quantities": {
 *     "participant_type_id": quantity,
 *     ...
 *   }
 * }
 *
 * Use before finalizing bookings to show accurate pricing to customers.
 */
export async function POST(
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

    // Parse request body
    const body = await request.json();

    if (!body.quantities) {
      return NextResponse.json(
        { error: 'quantities is required in request body' },
        { status: 400 }
      );
    }

    // Build the full URL
    const url = `${apiUrl}/availability/instance/${instance_id}/pricing`;

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
        { error: 'Failed to calculate pricing', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('[AVAILABILITY PRICING API ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
