/**
 * Retry Utility
 * Provides retry logic with exponential backoff for failed operations
 */

import { logger } from './logger';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  shouldRetry: (error: any) => {
    // Retry on network errors or 5xx server errors
    if (error.name === 'NetworkError' || error.name === 'AbortError') {
      return true;
    }
    if (error.statusCode >= 500 && error.statusCode < 600) {
      return true;
    }
    // Retry on rate limiting
    if (error.statusCode === 429) {
      return true;
    }
    return false;
  }
};

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  let delay = opts.initialDelayMs;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        logger.debug(`Retry attempt ${attempt}/${opts.maxRetries}`);
      }
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if we've exhausted attempts
      if (attempt === opts.maxRetries) {
        logger.warn(`Max retries (${opts.maxRetries}) exceeded`);
        break;
      }

      // Don't retry if the error shouldn't be retried
      if (!opts.shouldRetry(error)) {
        logger.debug('Error not retryable', { error: error.message });
        break;
      }

      // Calculate delay with exponential backoff
      const currentDelay = Math.min(delay, opts.maxDelayMs);
      logger.debug(`Retrying in ${currentDelay}ms`, {
        attempt: attempt + 1,
        maxRetries: opts.maxRetries,
        error: error.message
      });

      // Wait before retrying
      await sleep(currentDelay);

      // Increase delay for next attempt
      delay *= opts.backoffMultiplier;
    }
  }

  // If we get here, all retries failed
  throw lastError;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with jitter to avoid thundering herd problem
 */
export async function retryWithJitter<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return retry(fn, {
    ...options,
    initialDelayMs: (options.initialDelayMs || 1000) * (0.5 + Math.random() * 0.5)
  });
}
