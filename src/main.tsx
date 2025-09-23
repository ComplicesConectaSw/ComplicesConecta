import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from '@/App.tsx'
import './index.css'
import './styles/responsive.css'
import './styles/text-overflow-fixes.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import { initSentry } from '@/lib/sentry'
import { DebugInfo } from '@/debug'
import { initWebVitalsMonitoring } from '@/utils/webVitals'
import { initializeCriticalPreloading } from '@/utils/preloading'
import { androidSecurity } from '@/utils/androidSecurity'

// Debug info for production
console.log('🚀 ComplicesConecta v3.0.0 starting...', {
  version: '3.0.0',
  env: import.meta.env.MODE,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
  appMode: import.meta.env.VITE_APP_MODE,
  nodeEnv: import.meta.env.NODE_ENV,
  timestamp: new Date().toISOString()
});

// Force show all environment variables for debugging
console.log('🔍 All ENV vars:', import.meta.env);

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

// Inicializar Web Vitals monitoring
try {
  const monitor = initWebVitalsMonitoring({
    enableLogging: import.meta.env.MODE === 'development',
    enableAnalytics: import.meta.env.MODE === 'production',
    apiEndpoint: '/api/analytics/web-vitals',
    sampleRate: 0.1 // 10% sampling en producción
  });
  monitor.init().then(() => {
    console.log('✅ Web Vitals monitoring initialized');
  }).catch((error) => {
    console.error('❌ Web Vitals initialization failed:', error);
  });
} catch (error) {
  console.error('❌ Web Vitals initialization failed:', error);
}

// Inicializar preloading crítico
try {
  initializeCriticalPreloading();
  console.log('✅ Critical preloading initialized');
} catch (error) {
  console.error('❌ Critical preloading failed:', error);
}

// Verificar seguridad Android antes de inicializar la app
async function initializeSecurityCheck() {
  try {
    // Solo ejecutar en entorno Capacitor (APK Android)
    if (typeof window !== 'undefined' && window.Capacitor) {
      console.log('🔒 Ejecutando verificación de seguridad Android...');
      
      const isSecure = await androidSecurity.checkAndEnforceSecurity();
      
      if (!isSecure) {
        console.error('❌ Verificación de seguridad falló - Bloqueando aplicación');
        return false;
      }
      
      console.log('✅ Verificación de seguridad exitosa');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error en verificación de seguridad:', error);
    return true; // Permitir acceso en caso de error para no bloquear usuarios legítimos
  }
}

// Registrar Service Worker
if ('serviceWorker' in navigator && import.meta.env.MODE === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}

// Inicializar aplicación con verificación de seguridad
async function initializeApp() {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error('❌ Root element not found');
    throw new Error('Root element not found');
  }

  // Verificar seguridad antes de renderizar
  const isSecure = await initializeSecurityCheck();
  
  if (!isSecure) {
    console.log('🔒 Aplicación bloqueada por motivos de seguridad');
    return;
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
}

// Inicializar la aplicación
initializeApp().catch((error) => {
  console.error('❌ Failed to initialize app:', error);
});
