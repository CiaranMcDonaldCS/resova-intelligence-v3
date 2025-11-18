/**
 * Authentication Storage Service
 *
 * Manages secure storage of API credentials in localStorage.
 * All credentials are stored client-side only and never sent to our backend.
 * Credentials are stored per-user (keyed by email).
 */

import { AuthData, STORAGE_KEYS, STORAGE_VERSION } from './types';
import { SimpleAuth } from '../simple-auth';

/**
 * Manages authentication data persistence
 */
export class AuthStorage {
  /**
   * Get storage key for current user
   * @returns Storage key scoped to current user email
   */
  private static getUserStorageKey(): string {
    const currentUser = SimpleAuth.getCurrentUser();
    if (!currentUser) {
      // Fallback to global key if no user is signed in
      return STORAGE_KEYS.AUTH;
    }
    return `${STORAGE_KEYS.AUTH}:${currentUser}`;
  }

  /**
   * Save authentication credentials to localStorage
   * @param auth Authentication data to persist
   */
  static save(auth: AuthData): void {
    try {
      const data: AuthData = {
        ...auth,
        version: STORAGE_VERSION,
        lastLogin: new Date().toISOString(),
      };

      const storageKey = this.getUserStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log(`[AuthStorage] Saved credentials for user: ${SimpleAuth.getCurrentUser() || 'anonymous'}`);
    } catch (error) {
      console.error('[AuthStorage] Failed to save credentials:', error);
      throw new Error('Failed to save credentials. Please check browser storage settings.');
    }
  }

  /**
   * Load authentication credentials from localStorage
   * @returns Stored auth data or null if not found
   */
  static load(): AuthData | null {
    try {
      const storageKey = this.getUserStorageKey();
      const data = localStorage.getItem(storageKey);

      if (!data) {
        console.log(`[AuthStorage] No credentials found for user: ${SimpleAuth.getCurrentUser() || 'anonymous'}`);
        return null;
      }

      const parsed = JSON.parse(data) as AuthData;

      // Validate required fields
      if (!parsed.resovaApiKey || !parsed.resovaApiUrl || !parsed.claudeApiKey) {
        console.warn('[AuthStorage] Invalid auth data found, clearing...');
        this.clear();
        return null;
      }

      // Check if migration needed
      if (parsed.version !== STORAGE_VERSION) {
        console.log('[AuthStorage] Migrating auth data to new version...');
        return this.migrate(parsed);
      }

      console.log(`[AuthStorage] Loaded credentials for user: ${SimpleAuth.getCurrentUser() || 'anonymous'}`);
      return parsed;
    } catch (error) {
      console.error('[AuthStorage] Failed to load credentials:', error);
      return null;
    }
  }

  /**
   * Remove authentication credentials from localStorage
   */
  static clear(): void {
    try {
      const storageKey = this.getUserStorageKey();
      localStorage.removeItem(storageKey);
      console.log(`[AuthStorage] Cleared credentials for user: ${SimpleAuth.getCurrentUser() || 'anonymous'}`);
    } catch (error) {
      console.error('[AuthStorage] Failed to clear credentials:', error);
    }
  }

  /**
   * Check if user is authenticated (has valid credentials stored)
   * @returns True if authenticated
   */
  static isAuthenticated(): boolean {
    const auth = this.load();
    return auth !== null;
  }

  /**
   * Update specific fields in stored auth data
   * @param updates Partial auth data to update
   */
  static update(updates: Partial<Omit<AuthData, 'version'>>): void {
    const current = this.load();

    if (!current) {
      throw new Error('No authentication data found to update');
    }

    this.save({
      ...current,
      ...updates,
    });
  }

  /**
   * Get last login timestamp
   * @returns ISO timestamp string or null
   */
  static getLastLogin(): string | null {
    const auth = this.load();
    return auth?.lastLogin || null;
  }

  /**
   * Migrate auth data from old schema version to current
   * @param oldData Auth data in previous schema version
   * @returns Migrated auth data
   */
  private static migrate(oldData: AuthData): AuthData {
    // Future: Handle schema migrations here
    // For now, just update version and save
    const migrated: AuthData = {
      ...oldData,
      version: STORAGE_VERSION,
    };

    this.save(migrated);
    return migrated;
  }

  /**
   * Validate auth data structure (for debugging)
   * @param auth Auth data to validate
   * @returns True if valid
   */
  static validate(auth: unknown): auth is AuthData {
    if (!auth || typeof auth !== 'object') {
      return false;
    }

    const data = auth as Record<string, unknown>;

    return (
      typeof data.resovaApiKey === 'string' &&
      typeof data.resovaApiUrl === 'string' &&
      typeof data.claudeApiKey === 'string' &&
      typeof data.version === 'string' &&
      data.resovaApiKey.length > 0 &&
      data.resovaApiUrl.length > 0 &&
      data.claudeApiKey.length > 0
    );
  }
}
