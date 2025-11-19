/**
 * Logger utility for consistent logging across the application
 * Only logs in development mode, can be extended to send to monitoring service in production
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log informational messages (development only)
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Log warning messages (development only)
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    }
    // In production, send to monitoring service
    // this.sendToMonitoring('warn', message, context);
  }

  /**
   * Log error messages (always log, send to monitoring in production)
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context || '');
    } else {
      // In production, send to error tracking service (e.g., Sentry)
      // this.sendToErrorTracking(message, error, context);
    }
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Send logs to monitoring service (implement when ready)
   */
  private sendToMonitoring(level: LogLevel, message: string, context?: LogContext): void {
    // TODO: Implement integration with monitoring service
    // Examples: Sentry, LogRocket, Datadog, etc.
  }

  /**
   * Send errors to error tracking service (implement when ready)
   */
  private sendToErrorTracking(message: string, error?: unknown, context?: LogContext): void {
    // TODO: Implement integration with error tracking service
    // Example: Sentry.captureException(error, { extra: context });
  }
}

// Export singleton instance
export const logger = new Logger();
