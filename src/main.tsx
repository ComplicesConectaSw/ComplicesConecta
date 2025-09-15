import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from '@/App.tsx'
import '@/index.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import { initSentry } from '@/lib/sentry'
import { DebugInfo } from '@/debug'

// Debug info for production
console.log('🚀 App starting...', {
  env: import.meta.env.MODE,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
  timestamp: new Date().toISOString()
});

// Inicializar Sentry para monitoreo de errores
try {
  if (import.meta.env.VITE_SENTRY_DSN) {
    initSentry();
    console.log('✅ Sentry initialized');
  } else {
    console.log('⚠️ Sentry DSN not configured');
  }
} catch (error) {
  console.error('❌ Sentry initialization failed:', error);
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Root element not found');
  throw new Error('Root element not found');
}

console.log('✅ Root element found, rendering app...');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <DebugInfo />
      <App />
    </ErrorBoundary>
  </StrictMode>
);
