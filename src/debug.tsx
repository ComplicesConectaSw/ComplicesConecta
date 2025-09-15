// Debug component for Vercel deployment issues
import React from 'react';

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
    console.log('🔍 DEBUG INFO - Environment Variables:', envVars);
    console.log('🔍 DEBUG INFO - Location:', window.location.href);
    console.log('🔍 DEBUG INFO - User Agent:', navigator.userAgent);
    
    // Test critical imports
    try {
      console.log('🔍 DEBUG INFO - React version:', React.version);
    } catch (e) {
      console.error('❌ React import failed:', e);
    }
  }, []);

  if (import.meta.env.PROD) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '10px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px'
      }}>
        <h3>🔍 Vercel Debug</h3>
        <pre>{JSON.stringify(envVars, null, 2)}</pre>
      </div>
    );
  }

  return null;
};
