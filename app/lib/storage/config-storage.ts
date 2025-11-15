/**
 * Configuration Storage Service
 *
 * Manages business configuration and preferences in localStorage.
 * Includes activity types, business settings, and AI customization.
 */

import { ConfigData, STORAGE_KEYS, CustomActivity, ActivityType } from './types';

/**
 * Manages configuration data persistence
 */
export class ConfigStorage {
  /**
   * Save configuration to localStorage
   * @param config Configuration data to persist
   */
  static save(config: ConfigData): void {
    try {
      const data: ConfigData = {
        ...config,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(data));
    } catch (error) {
      console.error('[ConfigStorage] Failed to save config:', error);
      throw new Error('Failed to save configuration. Please check browser storage settings.');
    }
  }

  /**
   * Load configuration from localStorage
   * @returns Stored config or default config if not found
   */
  static load(): ConfigData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);

      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data) as ConfigData;

      // Validate structure
      if (!this.validate(parsed)) {
        console.warn('[ConfigStorage] Invalid config data found, using defaults');
        return this.getDefaults();
      }

      return parsed;
    } catch (error) {
      console.error('[ConfigStorage] Failed to load config:', error);
      return this.getDefaults();
    }
  }

  /**
   * Update specific fields in configuration
   * @param updates Partial config data to update
   */
  static update(updates: Partial<ConfigData>): void {
    const current = this.load() || this.getDefaults();

    this.save({
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Remove configuration from localStorage
   */
  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CONFIG);
    } catch (error) {
      console.error('[ConfigStorage] Failed to clear config:', error);
    }
  }

  /**
   * Check if onboarding has been completed
   * @returns True if user has completed setup
   */
  static isOnboardingComplete(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Mark onboarding as complete
   */
  static setOnboardingComplete(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    } catch (error) {
      console.error('[ConfigStorage] Failed to set onboarding status:', error);
    }
  }

  /**
   * Get default configuration
   * @returns Default config object
   */
  static getDefaults(): ConfigData {
    return {
      activityTypes: [],
      customActivities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Add an activity type to the configuration
   * @param activityType Activity type to add
   */
  static addActivityType(activityType: ActivityType): void {
    const config = this.load() || this.getDefaults();

    if (!config.activityTypes.includes(activityType)) {
      this.update({
        activityTypes: [...config.activityTypes, activityType],
      });
    }
  }

  /**
   * Remove an activity type from the configuration
   * @param activityType Activity type to remove
   */
  static removeActivityType(activityType: ActivityType): void {
    const config = this.load() || this.getDefaults();

    this.update({
      activityTypes: config.activityTypes.filter((t) => t !== activityType),
    });
  }

  /**
   * Add a custom activity
   * @param activity Custom activity to add
   */
  static addCustomActivity(activity: CustomActivity): void {
    const config = this.load() || this.getDefaults();

    this.update({
      customActivities: [...(config.customActivities || []), activity],
    });
  }

  /**
   * Remove a custom activity
   * @param activityId ID of custom activity to remove
   */
  static removeCustomActivity(activityId: string): void {
    const config = this.load() || this.getDefaults();

    this.update({
      customActivities: (config.customActivities || []).filter((a) => a.id !== activityId),
    });
  }

  /**
   * Update business name
   * @param name New business name
   */
  static setBusinessName(name: string): void {
    this.update({ businessName: name });
  }

  /**
   * Validate config data structure
   * @param config Config data to validate
   * @returns True if valid
   */
  private static validate(config: unknown): config is ConfigData {
    if (!config || typeof config !== 'object') {
      return false;
    }

    const data = config as Record<string, unknown>;

    return (
      Array.isArray(data.activityTypes) &&
      typeof data.createdAt === 'string' &&
      typeof data.updatedAt === 'string'
    );
  }

  /**
   * Export configuration as JSON (for backup/sharing)
   * @returns JSON string of configuration
   */
  static exportConfig(): string {
    const config = this.load() || this.getDefaults();
    return JSON.stringify(config, null, 2);
  }

  /**
   * Import configuration from JSON (for restore/sharing)
   * @param jsonString JSON string of configuration
   */
  static importConfig(jsonString: string): void {
    try {
      const config = JSON.parse(jsonString) as ConfigData;

      if (this.validate(config)) {
        this.save(config);
      } else {
        throw new Error('Invalid configuration format');
      }
    } catch (error) {
      console.error('[ConfigStorage] Failed to import config:', error);
      throw new Error('Failed to import configuration. Please check the format.');
    }
  }
}
