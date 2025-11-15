/**
 * Gift Vouchers Reporting API Route
 * Fetches gift vouchers reporting data from Resova
 * POST /api/reporting/gift-vouchers
 */

import { NextRequest, NextResponse } from 'next/server';
import { ResovaReportingService, GiftVouchersPayload } from '@/app/lib/services/resova-reporting-service';
import { Credentials, ApiError, NetworkError } from '@/app/types/analytics';
import { logger } from '@/app/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credentials, payload } = body as {
      credentials: Credentials;
      payload: GiftVouchersPayload;
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

    // Create reporting service
    const reportingService = new ResovaReportingService({
      apiKey: credentials.apiKey,
      baseUrl: credentials.storeUrl,
    });

    // Fetch gift vouchers data
    const giftVouchers = await reportingService.getGiftVouchers(payload);

    return NextResponse.json({
      success: true,
      data: giftVouchers,
      count: giftVouchers.length
    });

  } catch (error: any) {
    logger.error('Gift Vouchers API Error', error);

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
    message: 'Gift Vouchers Reporting API is running',
    version: '1.0.0',
    endpoint: '/api/reporting/gift-vouchers'
  });
}
