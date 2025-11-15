/**
 * Chat API Route
 * Handles AI chat conversations with Claude
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAnalyticsService } from '@/app/lib/services/analytics-service';
import {
  Credentials,
  AnalyticsData,
  Message,
  ApiError,
  NetworkError,
  ValidationError
} from '@/app/types/analytics';
import { logger } from '@/app/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      analyticsData,
      conversationHistory,
      credentials
    } = body as {
      message: string;
      analyticsData?: AnalyticsData;
      conversationHistory?: Message[];
      credentials: Credentials;
    };

    // Validate request
    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!credentials) {
      return NextResponse.json(
        { success: false, error: 'Credentials are required' },
        { status: 400 }
      );
    }

    // Create analytics service
    const analyticsService = createAnalyticsService(credentials);

    // Get chat response
    const response = await analyticsService.chat(
      message,
      analyticsData,
      conversationHistory || []
    );

    return NextResponse.json({
      ...response
    });

  } catch (error: any) {
    logger.error('Chat API Error', error);

    // Handle specific error types
    if (error instanceof ApiError) {
      // Provide user-friendly messages for specific status codes
      let userMessage = error.message;

      if (error.statusCode === 529) {
        userMessage = 'Claude is experiencing high demand. Your request was automatically retried but still failed. Please try again in a moment.';
      } else if (error.statusCode === 429) {
        userMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
      } else if (error.statusCode === 503) {
        userMessage = 'AI service is temporarily unavailable. Please try again shortly.';
      }

      return NextResponse.json(
        {
          success: false,
          error: userMessage,
          statusCode: error.statusCode
        },
        { status: error.statusCode || 500 }
      );
    }

    if (error instanceof NetworkError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Network error. Unable to reach AI service. Please try again.',
        },
        { status: 503 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          fields: error.fields
        },
        { status: 400 }
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