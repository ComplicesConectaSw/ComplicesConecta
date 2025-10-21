import { logError, logMessage } from '@/lib/sentry';

interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  user_id?: string;
  session_id?: string;
}

interface SimpleMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  metadata?: Record<string, unknown>;
  timestamp: string;
  user_id?: string;
}

// Configuración de logging para Supabase
export class SupabaseLogger {
  private static instance: SupabaseLogger;
  private isEnabled: boolean;
  
  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_LOGGING === 'true' || import.meta.env.DEV;
  }
  
  static getInstance(): SupabaseLogger {
    if (!SupabaseLogger.instance) {
      SupabaseLogger.instance = new SupabaseLogger();
    }
    return SupabaseLogger.instance;
  }

  // Log de queries SQL
  logQuery(query: string, params?: Record<string, unknown>, duration?: number) {
    if (import.meta.env.DEV) {
      console.group('📊 Supabase Query');
      console.log('Query:', query);
      console.log('Params:', params);
      console.log('Duration:', duration ? `${duration}ms` : 'N/A');
      console.groupEnd();
    }

    this.log('debug', 'Supabase Query', {
      query,
      params,
      duration
    });
  }

  logConnection(action: 'connect' | 'disconnect', userId?: string) {
    this.log('info', `User ${action}`, {
      action,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  log(level: LogEntry['level'], message: string, metadata?: Record<string, unknown>) {
    if (!this.isEnabled) return;

    // Log to console in development
    if (import.meta.env.DEV) {
      console[level](`[${level.toUpperCase()}] ${message}`, metadata);
    }

    // Map log levels to Sentry compatible levels
    const sentryLevel = level === 'warn' ? 'warning' : level;

    // Also send to Sentry for error tracking
    if (level === 'error') {
      logError(new Error(message), metadata);
    } else {
      logMessage(message, sentryLevel as 'info' | 'warning', metadata);
    }
  }

  metric(name: string, value: number, unit: SimpleMetric['unit'], metadata?: Record<string, unknown>) {
    if (!this.isEnabled) return;

    // Log metrics to console in development
    if (import.meta.env.DEV) {
      console.log(`📊 Metric: ${name} = ${value}${unit}`, metadata);
    }

    // Send performance metrics to Sentry
    logMessage(`Performance Metric: ${name}`, 'info', {
      metric: name,
      value,
      unit,
      ...metadata
    });
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>) {
    this.log('error', message, metadata);
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    this.log('debug', message, metadata);
  }

  private getCurrentUserIdSync(): string | undefined {
    try {
      // Try to get user ID from session storage or other sync source
      const sessionData = sessionStorage.getItem('supabase.auth.token');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        return parsed?.user?.id;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('app-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem('app-session-id', sessionId);
    }
    return sessionId;
  }
}

// Export singleton instance
export const logger = SupabaseLogger.getInstance();

// Hook para logging de sesión de usuario
export const useSupabaseSessionLogging = () => {
  const logUserSession = (user: { id: string; email?: string; user_metadata?: { role?: string } } | null) => {
    if (user) {
      logger.logConnection('connect', user.id);
      logMessage('User Session Started', 'info', {
        userId: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        type: 'SESSION_START'
      });
    } else {
      logger.logConnection('disconnect');
      logMessage('User Session Ended', 'info', {
        type: 'SESSION_END'
      });
    }
  };

  return { logUserSession };
};
