/**
 * PostHog Analytics Configuration
 * 
 * Integración completa con PostHog para analytics avanzados
 * 
 * @version 3.5.1
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';

let posthog: typeof window.posthog | null = null;

/**
 * Inicializa PostHog
 */
export async function initPostHog(): Promise<void> {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
    const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

    if (!posthogKey) {
      logger.warn('PostHog API key no configurada');
      return;
    }

    // Cargar PostHog dinámicamente
    const script = document.createElement('script');
    script.src = 'https://app.posthog.com/static/array.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.posthog) {
        posthog = window.posthog;
        
        posthog.init(posthogKey, {
          api_host: posthogHost,
          autocapture: true,
          capture_pageview: true,
          capture_pageleave: true,
          loaded: (_ph) => {
            logger.info('✅ PostHog inicializado correctamente');
            
            // Identificar usuario si está autenticado
            if (supabase) {
              supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                  identifyUser(user.id, {
                    email: user.email,
                  });
                }
              }).catch((error) => {
                logger.debug('Error obteniendo usuario para PostHog:', { error: error instanceof Error ? error.message : String(error) });
              });
            }
          },
        });

        // Configurar propiedades globales
        posthog.register({
          app_name: 'ComplicesConecta',
          app_version: '3.5.1',
        });
      }
    };
  } catch (error) {
    logger.error('Error inicializando PostHog', { error: error instanceof Error ? error.message : String(error) });
  }
}

/**
 * Identifica usuario en PostHog
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  try {
    if (!posthog) {
      logger.warn('PostHog no inicializado');
      return;
    }

    posthog.identify(userId, properties);
    logger.debug('Usuario identificado en PostHog', {
      userId: userId.substring(0, 8) + '***'
    });
  } catch (error) {
    logger.error('Error identificando usuario en PostHog', { error: error instanceof Error ? error.message : String(error), userId: userId.substring(0, 8) + '***' });
  }
}

/**
 * Registra evento en PostHog
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  try {
    if (!posthog) {
      logger.warn('PostHog no inicializado');
      return;
    }

    posthog.capture(eventName, properties);
    logger.debug('Evento registrado en PostHog', { eventName });
  } catch (error) {
    logger.error('Error registrando evento en PostHog', { error: error instanceof Error ? error.message : String(error), eventName });
  }
}

/**
 * Establece propiedades de usuario
 */
export function setUserProperties(properties: Record<string, unknown>): void {
  try {
    if (!posthog) {
      logger.warn('PostHog no inicializado');
      return;
    }

    posthog.setPersonProperties(properties);
    logger.debug('Propiedades de usuario actualizadas en PostHog');
  } catch (error) {
    logger.error('Error estableciendo propiedades de usuario en PostHog', { error: error instanceof Error ? error.message : String(error) });
  }
}

/**
 * Resetea sesión de usuario (logout)
 */
export function resetPostHog(): void {
  try {
    if (!posthog) {
      return;
    }

    posthog.reset();
    logger.info('PostHog reset completado');
  } catch (error) {
    logger.error('Error reseteando PostHog', { error: error instanceof Error ? error.message : String(error) });
  }
}

// Extender Window interface para PostHog
declare global {
  interface Window {
    posthog?: {
      init: (key: string, config: {
        api_host?: string;
        autocapture?: boolean;
        capture_pageview?: boolean;
        capture_pageleave?: boolean;
        loaded?: (ph: typeof window.posthog) => void;
      }) => void;
      identify: (userId: string, properties?: Record<string, unknown>) => void;
      capture: (eventName: string, properties?: Record<string, unknown>) => void;
      setPersonProperties: (properties: Record<string, unknown>) => void;
      reset: () => void;
      register: (properties: Record<string, unknown>) => void;
    };
  }
}

