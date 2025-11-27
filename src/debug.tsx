// Debug component for Vercel deployment issues
import React from 'react';
import { logger } from '@/lib/logger';

export const DebugInfo: React.FC = () => {
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    VITE_APP_MODE: import.meta.env.VITE_APP_MODE,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN ? 'SET' : 'MISSING',
    NODE_ENV: import.meta.env.NODE_ENV,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV,
  };

  React.useEffect(() => {
    // ✅ FIXED: Usar logger estructurado en lugar de console directo
    logger.debug('Environment Variables', { envVars });
    logger.debug('Location', { url: window.location.href });
    logger.debug('User Agent', { userAgent: navigator.userAgent });
    
    // Test critical imports
    try {
      logger.debug('React version', { version: React.version });
    } catch (e) {
      logger.error('React import failed', { error: e instanceof Error ? e.message : String(e) });
    }
  }, []);

  // Debug info solo en consola para producción
  if (import.meta.env.PROD) {
    return null;
  }

  return null;
};
