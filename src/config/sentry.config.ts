/**
 * =====================================================
 * SENTRY CONFIGURATION
 * =====================================================
 * Configuración de Sentry para error tracking
 * Fecha: 2025-10-30
 * Versión: v3.4.1
 * =====================================================
 */

import * as Sentry from '@sentry/react';

export interface SentryConfig {
  dsn: string;
  environment: 'development' | 'staging' | 'production';
  enabled: boolean;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
  release?: string;
}

/**
 * Configuración por defecto de Sentry
 */
export const defaultSentryConfig: SentryConfig = {
  // NOTA: Reemplaza este DSN con tu propio DSN de Sentry
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  environment: (import.meta.env.MODE as any) || 'development',
  enabled: import.meta.env.PROD || false,
  tracesSampleRate: 0.1, // 10% de transactions
  replaysSessionSampleRate: 0.1, // 10% de sesiones
  replaysOnErrorSampleRate: 1.0, // 100% cuando hay error
  release: `complicesconecta@${import.meta.env.VITE_APP_VERSION || '3.4.1'}`
};

/**
 * Inicializar Sentry
 */
export function initSentry(config: Partial<SentryConfig> = {}): void {
  const finalConfig = { ...defaultSentryConfig, ...config };

  // Solo inicializar si está habilitado y hay DSN
  if (!finalConfig.enabled || !finalConfig.dsn) {
    console.log('⚠️ Sentry deshabilitado o sin DSN configurado');
    return;
  }

  Sentry.init({
    dsn: finalConfig.dsn,
    environment: finalConfig.environment,
    release: finalConfig.release,
    
    // Integrations
    integrations: [
      // Browser Tracing
      Sentry.browserTracingIntegration(),
      
      // Session Replay
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),

      // Breadcrumbs
      Sentry.breadcrumbsIntegration({
        console: true,
        dom: true,
        fetch: true,
        history: true,
        sentry: true,
        xhr: true
      })
    ],

    // Performance Monitoring
    tracesSampleRate: finalConfig.tracesSampleRate,

    // Session Replay
    replaysSessionSampleRate: finalConfig.replaysSessionSampleRate,
    replaysOnErrorSampleRate: finalConfig.replaysOnErrorSampleRate,

    // Before Send - filtrar información sensible
    beforeSend(event, _hint) {
      // Filtrar datos sensibles
      if (event.request) {
        // Remover headers sensibles
        if (event.request.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
          delete event.request.headers['X-API-Key'];
        }

        // Filtrar query params sensibles
        if (event.request.query_string && typeof event.request.query_string === 'string') {
          event.request.query_string = event.request.query_string
            .replace(/token=[^&]*/gi, 'token=REDACTED')
            .replace(/password=[^&]*/gi, 'password=REDACTED')
            .replace(/api_key=[^&]*/gi, 'api_key=REDACTED');
        }
      }

      // Filtrar datos de usuario sensibles
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }

      return event;
    },

    // Ignore errors conocidos
    ignoreErrors: [
      // Errores del navegador que no podemos controlar
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'Script error.',
      
      // Errores de extensiones del navegador
      /chrome-extension/,
      /moz-extension/,
      
      // Errores de redes sociales embebidas
      /fb_xd_fragment/,
      
      // Errores de cancelación de fetch (usuario intencional)
      'AbortError',
      'The operation was aborted'
    ],

    // Denylist de URLs para no capturar
    denyUrls: [
      // Extensiones del navegador
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
      
      // Scripts de terceros
      /googletagmanager\.com/i,
      /google-analytics\.com/i,
      /facebook\.net/i
    ]
  });

  console.log('✅ Sentry inicializado:', {
    environment: finalConfig.environment,
    release: finalConfig.release,
    tracesSampleRate: finalConfig.tracesSampleRate
  });
}

/**
 * Capturar error manualmente en Sentry
 */
export function captureError(
  error: Error | string,
  context?: Record<string, any>
): void {
  if (typeof error === 'string') {
    Sentry.captureMessage(error, {
      level: 'error',
      contexts: context ? { custom: context } : undefined
    });
  } else {
    Sentry.captureException(error, {
      contexts: context ? { custom: context } : undefined
    });
  }
}

/**
 * Agregar breadcrumb manualmente
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data
  });
}

/**
 * Configurar contexto de usuario
 */
export function setUserContext(user: {
  id: string;
  username?: string;
  email?: string;
  [key: string]: any;
}): void {
  Sentry.setUser({
    id: user.id,
    username: user.username,
    // NO incluir email por privacidad
    ...Object.fromEntries(
      Object.entries(user).filter(([key]) => !['email', 'password'].includes(key))
    )
  });
}

/**
 * Limpiar contexto de usuario (logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Agregar tags a los eventos
 */
export function setTags(tags: Record<string, string>): void {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
}

/**
 * Crear span manual para performance tracking
 */
export function startSpan(
  name: string,
  callback: () => void
): void {
  Sentry.startSpan(
    {
      name,
      op: 'custom'
    },
    callback
  );
}

/**
 * Export de Sentry para uso directo
 */
export { Sentry };
export default Sentry;

