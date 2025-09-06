import { supabase } from '@/integrations/supabase/client';
import { logError, logMessage } from './sentry';

// Configuración de logging para Supabase
export class SupabaseLogger {
  private static instance: SupabaseLogger;
  
  static getInstance(): SupabaseLogger {
    if (!SupabaseLogger.instance) {
      SupabaseLogger.instance = new SupabaseLogger();
    }
    return SupabaseLogger.instance;
  }

  // Log de queries SQL
  logQuery(query: string, params?: any, duration?: number) {
    if (import.meta.env.DEV) {
      console.group('📊 Supabase Query');
      console.log('Query:', query);
      if (params) console.log('Params:', params);
      if (duration) console.log('Duration:', `${duration}ms`);
      console.groupEnd();
    }

    logMessage('Supabase Query Executed', 'info', {
      query,
      params,
      duration,
      timestamp: new Date().toISOString()
    });
  }

  // Log de errores de RLS
  logRLSError(table: string, operation: string, userId?: string, error?: any) {
    const errorMessage = `RLS Policy Violation: ${operation} on ${table}`;
    
    console.error('🚫 RLS Error:', {
      table,
      operation,
      userId,
      error: error?.message || error
    });

    logError(new Error(errorMessage), {
      table,
      operation,
      userId,
      originalError: error?.message || error,
      type: 'RLS_VIOLATION'
    });
  }

  // Log de errores de autenticación
  logAuthError(action: string, email?: string, error?: any) {
    const errorMessage = `Auth Error: ${action}`;
    
    console.error('🔐 Auth Error:', {
      action,
      email,
      error: error?.message || error
    });

    logError(new Error(errorMessage), {
      action,
      email,
      originalError: error?.message || error,
      type: 'AUTH_ERROR'
    });
  }

  // Log de performance de queries
  logSlowQuery(query: string, duration: number, threshold = 1000) {
    if (duration > threshold) {
      console.warn('🐌 Slow Query Detected:', {
        query,
        duration: `${duration}ms`,
        threshold: `${threshold}ms`
      });

      logMessage('Slow Query Detected', 'warning', {
        query,
        duration,
        threshold,
        type: 'PERFORMANCE_WARNING'
      });
    }
  }

  // Log de conexiones y desconexiones
  logConnection(event: 'connect' | 'disconnect' | 'reconnect', userId?: string) {
    console.log(`🔌 Supabase ${event}:`, { userId, timestamp: new Date().toISOString() });

    logMessage(`Supabase ${event}`, 'info', {
      event,
      userId,
      timestamp: new Date().toISOString(),
      type: 'CONNECTION_EVENT'
    });
  }

  // Wrapper para queries con logging automático
  async executeWithLogging<T>(
    queryFn: () => Promise<{ data: T; error: any }>,
    queryName: string,
    params?: any
  ): Promise<{ data: T; error: any }> {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;
      
      this.logQuery(queryName, params, duration);
      this.logSlowQuery(queryName, duration);
      
      if (result.error) {
        this.logRLSError('unknown', queryName, undefined, result.error);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      logError(error as Error, {
        queryName,
        params,
        duration,
        type: 'QUERY_ERROR'
      });
      
      return { data: null as T, error };
    }
  }
}

// Instancia singleton
export const supabaseLogger = SupabaseLogger.getInstance();

// Middleware para interceptar llamadas a Supabase
export const withSupabaseLogging = <T extends (...args: any[]) => any>(
  fn: T,
  queryName: string
): T => {
  return ((...args: any[]) => {
    return supabaseLogger.executeWithLogging(
      () => fn(...args),
      queryName,
      args
    );
  }) as T;
};

// Hook para logging de sesión de usuario
export const useSupabaseSessionLogging = () => {
  const logUserSession = (user: any) => {
    if (user) {
      supabaseLogger.logConnection('connect', user.id);
      logMessage('User Session Started', 'info', {
        userId: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        type: 'SESSION_START'
      });
    } else {
      supabaseLogger.logConnection('disconnect');
      logMessage('User Session Ended', 'info', {
        type: 'SESSION_END'
      });
    }
  };

  return { logUserSession };
};
