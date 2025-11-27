/**
 * Error Handling Utilities - Sistema unificado de manejo de errores
 * Implementa wrappers y utilidades para manejo consistente de errores
 */

import { logger } from '@/lib/logger';

export interface ErrorContext {
  service: string;
  operation: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly context: ErrorContext;
  public readonly timestamp: Date;
  public readonly isRetryable: boolean;

  constructor(
    message: string,
    code: string,
    context: ErrorContext,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
    this.isRetryable = isRetryable;
  }
}

/**
 * Wrapper para manejo de errores en servicios
 */
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  serviceName: string,
  operationName: string
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const context: ErrorContext = {
        service: serviceName,
        operation: operationName,
        metadata: { args: args.length }
      };

      if (error instanceof AppError) {
        logger.error(`Service error in ${serviceName}.${operationName}:`, {
          error: error.message,
          code: error.code,
          context: error.context,
          isRetryable: error.isRetryable
        });
        throw error;
      }

      const appError = new AppError(
        `Service failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SERVICE_ERROR',
        context,
        true
      );

      logger.error(`Unexpected error in ${serviceName}.${operationName}:`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context
      });

      throw appError;
    }
  };
};

/**
 * Wrapper para manejo de errores en hooks
 */
export const withHookErrorHandling = <T extends any[], R>(
  fn: (...args: T) => R,
  hookName: string
) => {
  return (...args: T): R => {
    try {
      return fn(...args);
    } catch (error) {
      const context: ErrorContext = {
        service: 'hooks',
        operation: hookName,
        metadata: { args: args.length }
      };

      const appError = new AppError(
        `Hook error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'HOOK_ERROR',
        context,
        false
      );

      logger.error(`Error in hook ${hookName}:`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context
      });

      throw appError;
    }
  };
};

/**
 * Wrapper para manejo de errores en componentes
 */
export const withComponentErrorHandling = <T extends any[], R>(
  fn: (...args: T) => R,
  componentName: string
) => {
  return (...args: T): R => {
    try {
      return fn(...args);
    } catch (error) {
      const context: ErrorContext = {
        service: 'components',
        operation: componentName,
        metadata: { args: args.length }
      };

      const appError = new AppError(
        `Component error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'COMPONENT_ERROR',
        context,
        false
      );

      logger.error(`Error in component ${componentName}:`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context
      });

      throw appError;
    }
  };
};

/**
 * Rate Limiter para prevenir abuso
 */
export class RateLimiter {
  private static instance: RateLimiter;
  private actions: Map<string, number[]> = new Map();

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  checkRateLimit(
    userId: string, 
    action: string, 
    maxActions: number = 10, 
    windowMs: number = 60000
  ): boolean {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const userActions = this.actions.get(key) || [];
    
    // Limpiar acciones antiguas
    const recentActions = userActions.filter(time => now - time < windowMs);
    
    if (recentActions.length >= maxActions) {
      logger.warn(`Rate limit exceeded for user ${userId} action ${action}:`, {
        userId,
        action,
        recentActions: recentActions.length,
        maxActions,
        windowMs
      });
      return false;
    }
    
    recentActions.push(now);
    this.actions.set(key, recentActions);
    return true;
  }

  reset(userId: string, action?: string): void {
    if (action) {
      this.actions.delete(`${userId}:${action}`);
    } else {
      // Reset all actions for user
      for (const key of this.actions.keys()) {
        if (key.startsWith(`${userId}:`)) {
          this.actions.delete(key);
        }
      }
    }
  }
}

/**
 * Error Boundary para componentes React
 */
export class ErrorBoundary extends Error {
  public readonly componentStack: string;
  public readonly errorInfo: any;

  constructor(message: string, componentStack: string, errorInfo: any) {
    super(message);
    this.name = 'ErrorBoundary';
    this.componentStack = componentStack;
    this.errorInfo = errorInfo;
  }
}

/**
 * Utilidades para manejo de errores específicos
 */
export const ErrorUtils = {
  /**
   * Verificar si un error es retryable
   */
  isRetryable(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isRetryable;
    }
    
    // Errores de red son retryables
    if (error.message.includes('network') || error.message.includes('timeout')) {
      return true;
    }
    
    // Errores de validación no son retryables
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return false;
    }
    
    return false;
  },

  /**
   * Extraer código de error de mensaje
   */
  extractErrorCode(error: Error): string {
    if (error instanceof AppError) {
      return error.code;
    }
    
    // Extraer códigos comunes
    const match = error.message.match(/\[(\w+)\]/);
    return match ? match[1] : 'UNKNOWN_ERROR';
  },

  /**
   * Formatear error para logging
   */
  formatForLogging(error: Error): Record<string, any> {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...(error instanceof AppError && {
        code: error.code,
        context: error.context,
        isRetryable: error.isRetryable
      })
    };
  }
};

export default {
  withErrorHandling,
  withHookErrorHandling,
  withComponentErrorHandling,
  RateLimiter,
  ErrorUtils,
  AppError
};
