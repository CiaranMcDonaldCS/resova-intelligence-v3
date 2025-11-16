/**
 * Storage Type Definitions
 *
 * Defines all data structures for persistent storage (localStorage)
 */

/**
 * Activity types supported by Resova
 * Organized by category for better UX
 */
export type ActivityType =
  // Core Racing & Competition
  | 'karting-adult'
  | 'karting-junior'
  | 'paintball'
  | 'laser-tag'
  | 'axe-throwing'

  // Immersive Experiences
  | 'escape-room'
  | 'vr-room'
  | 'break-room'

  // Active & Adventure
  | 'rope-course'
  | 'obstacle-course'
  | 'zip-line'
  | 'climbing-wall'
  | 'trampoline-park'

  // Indoor Play & Family
  | 'indoor-play'
  | 'arcade'
  | 'bowling'
  | 'mini-golf'
  | 'golf-simulator'
  | 'batting-cage'
  | 'battle-cage'

  // Skating & Ice
  | 'ice-skating'
  | 'roller-skating'

  // Large Attractions
  | 'water-park'
  | 'amusement-park'
  | 'zoo-aquarium'
  | 'museum'

  // Tours & Educational
  | 'guided-tour'
  | 'unguided-tour'
  | 'attraction-tour'

  // General Admission
  | 'fec-general-admission'
  | 'time-play'

  // Generic/Flexible
  | 'custom';

/**
 * Authentication data stored in localStorage
 * Contains API credentials needed to authenticate with Resova and Claude
 */
export interface AuthData {
  /** Resova API key from Settings > General Settings > Developer */
  resovaApiKey: string;

  /** Resova API URL - varies by datacenter (US, EU, IO) */
  resovaApiUrl: string;

  /** Claude API key from Anthropic */
  claudeApiKey: string;

  /** Timestamp of last successful login */
  lastLogin: string;

  /** Schema version for future migrations */
  version: string;
}

/**
 * Configuration data for business settings
 * Determines how the AI assistant behaves and what it knows
 */
export interface ConfigData {
  /** User's name (optional) */
  name?: string;

  /** Business/venue name (optional) */
  businessName?: string;

  /** Selected activity types that the venue offers */
  activityTypes: ActivityType[];

  /** Custom activity descriptions for non-standard activity types */
  customActivities?: CustomActivity[];

  /** Preferred timezone (future use) */
  timezone?: string;

  /** Preferred currency (future use) */
  currency?: string;

  /** When this configuration was first created */
  createdAt: string;

  /** When this configuration was last updated */
  updatedAt: string;
}

/**
 * Custom activity configuration
 * Used when business offers activity types not in predefined list
 */
export interface CustomActivity {
  /** Unique identifier */
  id: string;

  /** Display name */
  label: string;

  /** Description of the activity type */
  description: string;

  /** Custom seed prompt for AI (optional) */
  seedPrompt?: string;
}

/**
 * Storage keys used in localStorage
 */
export const STORAGE_KEYS = {
  AUTH: 'resova_intelligence_auth',
  CONFIG: 'resova_intelligence_config',
  ONBOARDING_COMPLETE: 'resova_intelligence_onboarding_complete',
  CACHE_PREFIX: 'resova_intelligence_cache_',
} as const;

/**
 * Current schema version
 * Increment when making breaking changes to storage structure
 */
export const STORAGE_VERSION = '1.0';

/**
 * Validation result for credentials
 */
export interface ValidationResult {
  isValid: boolean;
  errors: {
    resovaApiKey?: string;
    resovaApiUrl?: string;
    claudeApiKey?: string;
  };
}
