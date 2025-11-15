/**
 * Extras Reporting API Route
 * Fetches extras (add-ons) reporting data from Resova
 * POST /api/reporting/extras
 */

import { NextRequest, NextResponse } from 'next/server';
import { ResovaService, ExtrasPayload } from '@/app/lib/services/resova-service';
import { Credentials, ApiError, NetworkError } from '@/app/types/analytics';
import { logger } from '@/app/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credentials, payload } = body as {
      credentials: Credentials;
      payload: ExtrasPayload;
    };

    // Validate request
    if (!credentials) {
      return NextResponse.json(
        { success: false, error: 'Credentials are required' },
        { status: 400 }
      );
    }

    if (!payload || !payload.date_range) {
      return NextResponse.json(
        { success: false, error: 'Payload with date_range is required' },
        { status: 400 }
      );
    }

    // Create Resova service
    const resovaService = new ResovaService({
      apiKey: credentials.resovaApiKey,
      baseUrl: credentials.resovaApiUrl,
    });

    // Fetch extras data
    const extras = await resovaService.getExtras(payload);

    return NextResponse.json({
      success: true,
      data: extras,
      count: extras.length
    });

  } catch (error: any) {
    logger.error('Extras API Error', error);

    // Handle specific error types
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          statusCode: error.statusCode
        },
        { status: error.statusCode || 500 }
      );
    }

    if (error instanceof NetworkError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Network error. Please check your connection and try again.',
        },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing/health check
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Extras Reporting API is running',
    version: '1.0.0',
    endpoint: '/api/reporting/extras'
  });
}
