/**
 * Analytics Service
 * Production-only service for Resova analytics
 */

import {
  AnalyticsData,
  ChatResponse,
  Message,
  Credentials,
  ServiceOptions
} from '@/app/types/analytics';
import { ResovaService } from './resova-service';
import { ClaudeService } from './claude-service';
import { logger } from '../utils/logger';
import { retry } from '../utils/retry';

export class AnalyticsService {
  private resovaService: ResovaService;
  private claudeService: ClaudeService;

  constructor(credentials: Credentials) {
    this.resovaService = new ResovaService({
      apiKey: credentials.resovaApiKey,
      baseUrl: credentials.resovaApiUrl,
    });

    this.claudeService = new ClaudeService({
      apiKey: credentials.claudeApiKey,
    });
  }

  /**
   * Get analytics data
   */
  async getAnalytics(dateRange?: string, options?: ServiceOptions): Promise<AnalyticsData> {
    logger.service('analytics', 'Fetching analytics (PRODUCTION mode)');

    // Use retry logic for production API calls
    return await retry(
      () => this.resovaService.getAnalytics(dateRange),
      { maxRetries: options?.retries || 3 }
    );
  }

  /**
   * Send chat message and get AI response
   */
  async chat(
    message: string,
    analyticsData?: AnalyticsData,
    conversationHistory: Message[] = [],
    options?: ServiceOptions
  ): Promise<ChatResponse> {
    logger.service('chat', 'Sending chat message (PRODUCTION mode)');

    return await this.claudeService.chat(message, analyticsData, conversationHistory);
  }
}

/**
 * Factory function to create an analytics service instance
 */
export function createAnalyticsService(
  credentials: Credentials
): AnalyticsService {
  return new AnalyticsService(credentials);
}