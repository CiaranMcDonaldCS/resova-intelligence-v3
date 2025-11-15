/**
 * Environment Configuration
 * Centralized configuration for the application
 */

// Helper to parse boolean environment variables
const parseBool = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

// Helper to parse number environment variables
const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const config = {
  // App settings
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Resova Intelligence',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.1',
    environment: process.env.NODE_ENV || 'development',
    debug: parseBool(process.env.NEXT_PUBLIC_DEBUG, false),
  },

  // API endpoints
  api: {
    resova: {
      baseUrl: process.env.NEXT_PUBLIC_RESOVA_API_URL || 'https://api.resova.io/v1',
      timeout: parseNumber(process.env.NEXT_PUBLIC_RESOVA_API_TIMEOUT, 30000),
    },
    claude: {
      baseUrl: process.env.NEXT_PUBLIC_CLAUDE_API_URL || 'https://api.anthropic.com/v1',
      model: process.env.NEXT_PUBLIC_CLAUDE_MODEL || 'claude-sonnet-4-20250514',
      maxTokens: parseNumber(process.env.NEXT_PUBLIC_CLAUDE_MAX_TOKENS, 4096),
      timeout: 60000, // 60 seconds
    },
  },

  // Feature flags
  features: {
    analytics: parseBool(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS, true),
    chatAssistant: parseBool(process.env.NEXT_PUBLIC_ENABLE_CHAT, true),
  },

  // Rate limiting
  rateLimit: {
    maxRequests: parseNumber(process.env.NEXT_PUBLIC_RATE_LIMIT_MAX, 100),
    windowMs: parseNumber(process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW, 60000),
  },

  // Limits
  limits: {
    maxConversationHistory: parseNumber(process.env.NEXT_PUBLIC_MAX_CONVERSATION_HISTORY, 10),
    maxChartDataPoints: parseNumber(process.env.NEXT_PUBLIC_MAX_CHART_DATA_POINTS, 100),
  },

  // Security
  security: {
    corsEnabled: parseBool(process.env.NEXT_PUBLIC_CORS_ENABLED, false),
    allowedOrigins: process.env.NEXT_PUBLIC_CORS_ORIGINS?.split(',') || [],
  },

  // Monitoring
  monitoring: {
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || null,
  },
};

// Validate critical configuration
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate Resova API URL
  if (!config.api.resova.baseUrl) {
    errors.push('NEXT_PUBLIC_RESOVA_API_URL is required');
  }

  // Validate Claude API URL
  if (!config.api.claude.baseUrl) {
    errors.push('NEXT_PUBLIC_CLAUDE_API_URL is required');
  }

  // Validate Claude Model
  if (!config.api.claude.model) {
    errors.push('NEXT_PUBLIC_CLAUDE_MODEL is required');
  }

  // Validate timeouts
  if (config.api.resova.timeout < 1000) {
    errors.push('NEXT_PUBLIC_RESOVA_API_TIMEOUT must be at least 1000ms');
  }

  // Validate rate limiting
  if (config.rateLimit.maxRequests < 1) {
    errors.push('NEXT_PUBLIC_RATE_LIMIT_MAX must be at least 1');
  }

  if (config.rateLimit.windowMs < 1000) {
    errors.push('NEXT_PUBLIC_RATE_LIMIT_WINDOW must be at least 1000ms');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Log configuration on startup (excluding sensitive data)
if (typeof window !== 'undefined' && config.app.debug) {
  console.log('🔧 Application Configuration:', {
    app: config.app,
    api: {
      resova: { baseUrl: config.api.resova.baseUrl, timeout: config.api.resova.timeout },
      claude: { baseUrl: config.api.claude.baseUrl, model: config.api.claude.model }
    },
    features: config.features,
    rateLimit: config.rateLimit,
    limits: config.limits
  });
}

export type Config = typeof config;