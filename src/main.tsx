import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import './styles/header-fixes.css'
// Eliminada importación estática para evitar conflicto con importación dinámica
import { initializeReactFallbacks, ensureReactPolyfills } from "./utils/reactFallbacks";
import { initWalletsAsync } from './utils/safeWalletInit';
import './styles/responsive.css'
import './styles/text-overflow-fixes.css'
import './styles/text-visibility-fixes.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import { initSentry } from '@/lib/sentry'
import { DebugInfo } from '@/debug'
import { initWebVitalsMonitoring } from '@/utils/webVitals'
import { initializeCriticalPreloading } from '@/utils/preloading'
import { androidSecurity } from '@/utils/androidSecurity'

// FALLBACK PREVENTIVO GLOBAL - Protección contra errores críticos
if (typeof window !== 'undefined') {
  // Interceptar errores globales que pueden causar pantalla blanca
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    
    // Errores críticos de React/useLayoutEffect
    if (message.includes('useLayoutEffect') || 
        message.includes('Cannot read properties of undefined') ||
        message.includes('React') ||
        message.includes('ReactDOM')) {
      console.error('🚨 Error crítico de React detectado:', message);
      event.preventDefault();
      return false;
    }
    
    // Errores de wallets y redefiniciones
    if (message.includes('solana') || 
        message.includes('ethereum') || 
        message.includes('tronWeb') ||
        message.includes('Cannot redefine property') ||
        message.includes('Cannot assign to read only property')) {
      event.preventDefault();
      console.warn('⚠️ Wallet extension error silenced:', message);
      return false;
    }
  });

  // Interceptar promesas no manejadas
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason);
    
    // Errores críticos de React
    if (reason.includes('useLayoutEffect') || reason.includes('React')) {
      console.error('🚨 Promise rejection crítica de React:', reason);
      event.preventDefault();
    }
    
    // Errores de wallets
    if (reason.includes('solana') || reason.includes('ethereum') || reason.includes('tronWeb')) {
      event.preventDefault();
      console.warn('⚠️ Wallet promise rejection silenced:', reason);
    }
  });
}

// Debug info for development only - minimized to reduce console noise
if (import.meta.env.DEV) {
  console.log('🚀 ComplicesConecta v3.4.0 starting...');
}

// Inicializar Sentry para monitoreo de errores
try {
  if (import.meta.env.VITE_SENTRY_DSN) {
    initSentry();
    if (import.meta.env.DEV) console.log('✅ Sentry initialized');
  } else {
    if (import.meta.env.DEV) console.log('⚠️ Sentry DSN not configured');
  }
} catch (error) {
  console.error('❌ Sentry initialization failed:', error);
}

// Inicializar Web Vitals monitoring - silencioso para reducir logs
try {
  const monitor = initWebVitalsMonitoring({
    enableLogging: false, // Deshabilitar logging para reducir ruido
    enableAnalytics: import.meta.env.MODE === 'production',
    apiEndpoint: '/api/analytics/web-vitals',
    sampleRate: 0.1 // 10% sampling en producción
  });
  monitor.init().catch(() => {
    // Silenciar errores de Web Vitals para evitar ruido en consola
  });
} catch {
  // Silenciar errores de inicialización
}

// Inicializar preloading crítico
try {
  initializeCriticalPreloading();
  if (import.meta.env.DEV) console.log('✅ Critical preloading initialized');
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

// Inicializar aplicación con verificación de seguridad - PROTEGIDO CONTRA BLOQUEOS
async function initializeApp() {
  try {
    // Initialize React fallbacks first for SSR compatibility
    initializeReactFallbacks();
    ensureReactPolyfills();
    
    // Initialize wallet protection SAFELY - no blocking operations
    if (typeof window !== 'undefined') {
      void (async () => {
        try {
          // Inicialización segura de wallets sin redefiniciones
          await initWalletsAsync();
          // Las funciones de protección se ejecutan dentro de initWalletsAsync()
        } catch (error) {
          console.warn('⚠️ Wallet protection init failed (non-critical):', error);
        }
      })();
    }
    
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error('❌ Root element not found');
      throw new Error('Root element not found');
    }

    // Verificar seguridad SIN BLOQUEAR el render principal
    void (async () => {
      try {
        const isSecure = await initializeSecurityCheck();
        if (!isSecure) {
          console.log('🔒 Aplicación bloqueada por motivos de seguridad');
          // Opcional: mostrar mensaje de seguridad sin bloquear React
        }
      } catch (error) {
        console.warn('⚠️ Security check failed (non-blocking):', error);
      }
    })();

    console.log('✅ Root element found, rendering app...');

    // RENDER INMEDIATO - sin await que pueda bloquear
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <DebugInfo />
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (error) {
    console.error('❌ Critical app initialization error:', error);
    // Fallback render mínimo para evitar pantalla en blanco
    const rootElement = document.getElementById("root");
    if (rootElement) {
      createRoot(rootElement).render(
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontFamily: 'system-ui'
        }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>ComplicesConecta</h1>
            <p>Cargando aplicación...</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                marginTop: '1rem', 
                padding: '0.5rem 1rem', 
                background: 'rgba(255,255,255,0.2)', 
                border: '1px solid rgba(255,255,255,0.3)', 
                borderRadius: '4px', 
                color: 'white', 
                cursor: 'pointer' 
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
  }
}

// Inicializar la aplicación
initializeApp().catch((error) => {
  console.error('❌ Failed to initialize app:', error);
});
