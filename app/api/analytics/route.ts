/**
 * Analytics API Route
 * Fetches analytics data from Resova (production only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAnalyticsService } from '@/app/lib/services/analytics-service';
import { Credentials, ApiError, NetworkError } from '@/app/types/analytics';
import { logger } from '@/app/lib/utils/logger';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credentials, dateRange } = body as {
      credentials: Credentials;
      dateRange?: string;
    };

    // Validate request
    if (!credentials) {
      return NextResponse.json(
        { success: false, error: 'Credentials are required' },
        { status: 400 }
      );
    }

    // Create analytics service
    const analyticsService = createAnalyticsService(credentials);

    // Fetch analytics data
    const data = await analyticsService.getAnalytics(dateRange);

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    logger.error('Analytics API Error', error);

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
    message: 'Analytics API is running',
    version: '1.0.0'
  });
}