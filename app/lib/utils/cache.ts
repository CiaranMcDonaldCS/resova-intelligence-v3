/**
 * Simple file-based cache for analytics data
 * Reduces load on Resova API by caching responses
 *
 * Server-side only - uses Node.js fs module
 */

import { logger } from './logger';

// Cache directory - will be constructed server-side only
const getCacheDir = (): string => {
  if (typeof window !== 'undefined') return '';
  const path = require('path');

  // Use /tmp in production (serverless), .cache in development
  // Vercel serverless functions only have write access to /tmp
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return '/tmp/.cache';
  }

  return path.join(process.cwd(), '.cache');
};

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes default

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class FileCache {
  /**
   * Check if running on server
   */
  private static isServerSide(): boolean {
    return typeof window === 'undefined';
  }

  /**
   * Ensure cache directory exists
   */
  private static ensureCacheDir(): void {
    if (!this.isServerSide()) return;

    const fs = require('fs');
    const cacheDir = getCacheDir();
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
  }

  /**
   * Generate cache file path from key
   */
  private static getCacheFilePath(key: string): string {
    if (!this.isServerSide()) return '';

    const path = require('path');
    const cacheDir = getCacheDir();
    // Hash the key to create a safe filename
    const hash = Buffer.from(key).toString('base64').replace(/[/+=]/g, '_');
    return path.join(cacheDir, `${hash}.json`);
  }

  /**
   * Get cached data if it exists and is not expired
   */
  static get<T>(key: string): T | null {
    if (!this.isServerSide()) return null;

    try {
      const fs = require('fs');
      this.ensureCacheDir();
      const filePath = this.getCacheFilePath(key);

      logger.debug(`🔍 Cache.get() checking for ${key} at path: ${filePath}`);

      if (!fs.existsSync(filePath)) {
        logger.debug(`Cache miss: ${key} - file does not exist`);
        return null;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const entry: CacheEntry<T> = JSON.parse(fileContent);

      // Check if cache entry has expired
      const now = Date.now();
      const age = now - entry.timestamp;

      if (age > entry.ttl) {
        logger.info(`Cache expired for ${key} (age: ${Math.round(age / 1000)}s, TTL: ${Math.round(entry.ttl / 1000)}s)`);
        // Delete expired cache file
        fs.unlinkSync(filePath);
        return null;
      }

      logger.info(`✅ Cache hit for ${key} (age: ${Math.round(age / 1000)}s)`);
      return entry.data;
    } catch (error) {
      logger.error(`Failed to read cache for ${key}`, error);
      return null;
    }
  }

  /**
   * Set cache data with optional TTL
   */
  static set<T>(key: string, data: T, ttl: number = DEFAULT_TTL_MS): void {
    logger.debug(`🔍 Cache.set() called for ${key}`);
    logger.debug(`🔍 isServerSide: ${this.isServerSide()}`);

    if (!this.isServerSide()) {
      logger.debug(`⚠️ Skipping cache write - client side`);
      return;
    }

    try {
      const fs = require('fs');
      this.ensureCacheDir();
      const filePath = this.getCacheFilePath(key);

      logger.debug(`🔍 Cache file path: ${filePath}`);

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl
      };

      fs.writeFileSync(filePath, JSON.stringify(entry), 'utf-8');
      logger.info(`💾 Cached data for ${key} (TTL: ${Math.round(ttl / 1000)}s)`);
      logger.debug(`✅ Cache file written successfully`);
    } catch (error) {
      logger.error(`Failed to write cache for ${key}`, error);
    }
  }

  /**
   * Delete cache entry
   */
  static delete(key: string): void {
    if (!this.isServerSide()) return;

    try {
      const fs = require('fs');
      this.ensureCacheDir();
      const filePath = this.getCacheFilePath(key);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`🗑️ Deleted cache for ${key}`);
      }
    } catch (error) {
      logger.error(`Failed to delete cache for ${key}`, error);
    }
  }

  /**
   * Clear all cache entries
   */
  static clear(): void {
    if (!this.isServerSide()) return;

    try {
      const fs = require('fs');
      const path = require('path');
      const cacheDir = getCacheDir();
      this.ensureCacheDir();
      const files = fs.readdirSync(cacheDir);

      for (const file of files) {
        const filePath = path.join(cacheDir, file);
        fs.unlinkSync(filePath);
      }

      logger.info(`🗑️ Cleared ${files.length} cache entries`);
    } catch (error) {
      logger.error('Failed to clear cache', error);
    }
  }

  /**
   * Clean up expired cache entries
   */
  static cleanup(): void {
    if (!this.isServerSide()) return;

    try {
      const fs = require('fs');
      const path = require('path');
      const cacheDir = getCacheDir();
      this.ensureCacheDir();
      const files = fs.readdirSync(cacheDir);
      let deletedCount = 0;
      const now = Date.now();

      for (const file of files) {
        try {
          const filePath = path.join(cacheDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const entry: CacheEntry<any> = JSON.parse(fileContent);

          const age = now - entry.timestamp;
          if (age > entry.ttl) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        } catch (error) {
          // Skip invalid cache files
          logger.debug(`Skipping invalid cache file: ${file}`);
        }
      }

      if (deletedCount > 0) {
        logger.info(`🧹 Cleaned up ${deletedCount} expired cache entries`);
      }
    } catch (error) {
      logger.error('Failed to cleanup cache', error);
    }
  }
}
