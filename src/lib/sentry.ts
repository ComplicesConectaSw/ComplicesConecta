import * as Sentry from '@sentry/react';
import { logger } from '@/lib/logger';

// Configuración simplificada de Sentry para monitoreo de errores
export const initSentry = () => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    logger.warn('Sentry DSN no configurado');
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_MODE || 'development',
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    release: '2.0.0',
    
    beforeSend(event, hint) {
      if (import.meta.env.DEV) {
        console.group('🔍 Sentry Error Captured');
        logger.error('Error:', hint.originalException || hint.syntheticException);
        logger.error('Error initializing Sentry:', { context: String(hint.context) });
        console.groupEnd();
      }
      
      const error = hint.originalException as Error;
      if (error?.message) {
        if (error.message.includes('NetworkError') || 
            error.message.includes('fetch') ||
            error.message.includes('Extension') ||
            error.message.includes('chrome-extension')) {
          return null;
        }
      }
      
      return event;
    }
  });
};

// Funciones utilitarias para logging
export const logError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('error_context', context);
    }
    Sentry.captureException(error);
  });
};

export const logMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info', extra?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (extra) {
      scope.setContext('message_context', extra);
    }
    scope.setLevel(level);
    Sentry.captureMessage(message);
  });
};

export const setUserContext = (user: { id: string; email?: string; role?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role
  });
};
