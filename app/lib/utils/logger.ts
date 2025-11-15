/**
 * Logger Utility
 * Provides environment-aware logging with different log levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log info messages
   */
  info(message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  /**
   * Log error messages (always logged)
   */
  error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error);

    // In production, you might want to send errors to a monitoring service
    if (this.isProduction && error) {
      this.sendToErrorTracking(message, error);
    }
  }

  /**
   * Send errors to tracking service (placeholder)
   */
  private sendToErrorTracking(message: string, error: any): void {
    // TODO: Implement error tracking service integration (e.g., Sentry, LogRocket)
    // For now, just log to console
    console.error('Error tracking:', { message, error });
  }

  /**
   * Log service events
   */
  service(serviceName: string, action: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`[${serviceName.toUpperCase()}] ${action}`, data || '');
    }
  }

  /**
   * Log API calls
   */
  api(method: string, url: string, status?: number): void {
    if (this.isDevelopment) {
      const statusText = status ? `(${status})` : '';
      console.log(`[API] ${method} ${url} ${statusText}`);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
