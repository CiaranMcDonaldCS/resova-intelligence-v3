/**
 * Health Check API Route
 * Returns the health status of the application
 */

import { NextResponse } from 'next/server';
import { config, validateConfig } from '@/app/config/environment';

export async function GET() {
  const configValidation = validateConfig();
  const timestamp = new Date().toISOString();

  // Check if configuration is valid
  if (!configValidation.valid) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp,
        version: config.app.version,
        environment: config.app.environment,
        errors: configValidation.errors,
      },
      { status: 500 }
    );
  }

  // All checks passed
  return NextResponse.json({
    status: 'healthy',
    timestamp,
    version: config.app.version,
    environment: config.app.environment,
    services: {
      resova: {
        configured: !!config.api.resova.baseUrl,
        baseUrl: config.api.resova.baseUrl,
      },
      claude: {
        configured: !!config.api.claude.baseUrl,
        model: config.api.claude.model,
      },
    },
    features: config.features,
  });
}
