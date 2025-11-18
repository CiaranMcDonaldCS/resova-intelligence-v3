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
import { ConfigStorage } from '../storage/config-storage';
import { FileCache } from '../utils/cache';

export class AnalyticsService {
  private resovaService: ResovaService;
  private claudeService: ClaudeService;
  private static readonly CACHE_TTL = 5 * 24 * 60 * 60 * 1000; // 5 days (for demo/conference)

  constructor(credentials: Credentials) {
    logger.info('🚀 AnalyticsService Initialization:');
    logger.info(`   Resova API URL: ${credentials.resovaApiUrl}`);
    logger.info(`   Resova API Key: ${credentials.resovaApiKey.substring(0, 8)}...${credentials.resovaApiKey.substring(credentials.resovaApiKey.length - 4)}`);
    logger.info(`   Claude API Key: ${credentials.claudeApiKey.substring(0, 10)}...${credentials.claudeApiKey.substring(credentials.claudeApiKey.length - 4)}`);

    this.resovaService = new ResovaService({
      apiKey: credentials.resovaApiKey,
      baseUrl: credentials.resovaApiUrl,
    });

    // Load activity configuration from storage
    const config = ConfigStorage.load();

    this.claudeService = new ClaudeService({
      apiKey: credentials.claudeApiKey,
      config: config || undefined,
    });
  }

  /**
   * Generate cache key based on date range
   */
  private getCacheKey(dateRange?: string): string {
    return `analytics:${dateRange || 'default'}`;
  }

  /**
   * Get analytics data with caching
   */
  async getAnalytics(dateRange?: string, options?: ServiceOptions): Promise<AnalyticsData> {
    const cacheKey = this.getCacheKey(dateRange);

    // Try to get from cache first
    const cachedData = FileCache.get<AnalyticsData>(cacheKey);
    if (cachedData) {
      logger.info('📦 Returning cached analytics data (avoids Resova API calls)');
      return cachedData;
    }

    logger.service('analytics', 'Fetching analytics from Resova API (cache miss)');

    // Use retry logic for production API calls
    const data = await retry(
      () => this.resovaService.getAnalytics(dateRange),
      { maxRetries: options?.retries || 3 }
    );

    logger.info(`📊 Data fetched successfully, now caching with key: ${cacheKey}`);

    // Cache the result
    try {
      logger.info(`🔄 About to call FileCache.set()...`);
      FileCache.set(cacheKey, data, AnalyticsService.CACHE_TTL);
      logger.info(`✅ FileCache.set() completed successfully`);
    } catch (cacheError) {
      logger.error(`❌ FileCache.set() threw an error:`, cacheError);
    }

    logger.info(`✅ Cache set complete, returning data`);

    return data;
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