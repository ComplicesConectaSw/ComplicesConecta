/**
 * Production Logger - ComplicesConecta
 * 
 * Centralized logging system that replaces console statements
 * with structured, configurable logging for production use.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  source?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      source: 'ComplicesConecta'
    };
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (this.isProduction) {
      return level === 'warn' || level === 'error';
    }
    // In development, log everything
    return true;
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    // In development, use console for immediate feedback
    if (this.isDevelopment) {
      const contextStr = entry.context ? JSON.stringify(entry.context, null, 2) : '';
      
      switch (entry.level) {
        case 'debug':
          console.debug(`[DEBUG] ${entry.message}`, contextStr);
          break;
        case 'info':
          console.info(`[INFO] ${entry.message}`, contextStr);
          break;
        case 'warn':
          console.warn(`[WARN] ${entry.message}`, contextStr);
          break;
        case 'error':
          console.error(`[ERROR] ${entry.message}`, contextStr);
          break;
      }
    }

    // In production, send to external logging service
    if (this.isProduction) {
      this.sendToExternalLogger(entry);
    }
  }

  private async sendToExternalLogger(entry: LogEntry): Promise<void> {
    try {
      // Send to Sentry for error tracking
      if (entry.level === 'error' && (window as any).Sentry) {
        (window as any).Sentry.captureException(new Error(entry.message), {
          extra: entry.context,
          level: 'error'
        });
      }

      // Send to Supabase for application logging (disabled for now)
      // ✅ PLANIFICADO: Implementar app_logs table en próxima migración SQL
      // if ((window as any).supabase) {
      //   await (window as any).supabase
      //     .from('app_logs')
      //     .insert({
      //       level: entry.level,
      //       message: entry.message,
      //       context: entry.context,
      //       timestamp: entry.timestamp,
      //       user_id: (await (window as any).supabase.auth.getUser()).data.user?.id
      //     });
      // }
    } catch (error) {
      // Fallback to console in case external logging fails
      console.error('Logger: Failed to send log to external service', error);
    }
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: LogContext): void {
    this.writeLog(this.formatMessage('debug', message, context));
  }

  /**
   * Log general information
   */
  info(message: string, context?: LogContext): void {
    this.writeLog(this.formatMessage('info', message, context));
  }

  /**
   * Log warnings that need attention
   */
  warn(message: string, context?: LogContext): void {
    this.writeLog(this.formatMessage('warn', message, context));
  }

  /**
   * Log errors that need immediate attention
   */
  error(message: string, context?: LogContext): void {
    this.writeLog(this.formatMessage('error', message, context));
  }

  /**
   * Log user actions for analytics
   */
  userAction(action: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, {
      ...context,
      type: 'user_action'
    });
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, value: number, context?: LogContext): void {
    this.info(`Performance: ${metric}`, {
      ...context,
      metric,
      value,
      type: 'performance'
    });
  }

  /**
   * Log security events
   */
  security(event: string, context?: LogContext): void {
    this.warn(`Security Event: ${event}`, {
      ...context,
      type: 'security'
    });
  }
}

// Create singleton logger instance
export const logger = new Logger();

// Export types for use in other files
export type { LogLevel, LogContext, LogEntry };

// Utility functions for common logging patterns
export const logError = (error: Error, context?: LogContext) => {
  logger.error(error.message, {
    ...context,
    stack: error.stack,
    name: error.name
  });
};

export const logApiCall = (endpoint: string, method: string, status: number, duration?: number) => {
  logger.info(`API Call: ${method} ${endpoint}`, {
    endpoint,
    method,
    status,
    duration,
    type: 'api_call'
  });
};

export const logDatabaseOperation = (operation: string, table: string, success: boolean, context?: LogContext) => {
  const level = success ? 'info' : 'error';
  logger[level](`Database ${operation}: ${table}`, {
    ...context,
    operation,
    table,
    success,
    type: 'database'
  });
};
