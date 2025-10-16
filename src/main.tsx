import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import './styles/consolidated-styles.css'
import { initializeWalletProtection, detectWalletConflicts } from "./utils/walletProtection";
import { initializeReactFallbacks, ensureReactPolyfills } from "./utils/reactFallbacks";
import ErrorBoundary from '@/components/ErrorBoundary'
import { initSentry } from '@/lib/sentry'
import { DebugInfo } from '@/debug'
import { initWebVitalsMonitoring } from '@/utils/webVitals'
import { initializeCriticalPreloading } from '@/utils/preloading'
import { androidSecurity } from '@/utils/androidSecurity'

// Protección robusta contra errores de wallets de criptomonedas
if (typeof window !== 'undefined') {
  // Inicializar protección de wallets ANTES que cualquier extensión
  initializeWalletProtection();
  
  // Interceptar TODOS los errores de wallets
  const originalError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const errorMessage = message?.toString() || '';
    if (errorMessage.includes('solana') || 
        errorMessage.includes('ethereum') || 
        errorMessage.includes('tronWeb') ||
        errorMessage.includes('bybitWallet') ||
        errorMessage.includes('Cannot redefine property') ||
        errorMessage.includes('Cannot assign to read only property') ||
        errorMessage.includes('Cannot set property chainId')) {
      console.warn('🚫 Wallet error completely blocked:', errorMessage);
      return true; // Prevent default error handling
    }
    if (originalError) {
      return originalError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };
  
  // Silenciar errores específicos de wallets
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    if (message.includes('solana') || 
        message.includes('ethereum') || 
        message.includes('tronWeb') ||
        message.includes('bybitWallet') ||
        message.includes('Cannot redefine property') ||
        message.includes('Cannot assign to read only property') ||
        message.includes('Cannot set property chainId')) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('🚫 Wallet extension error completely silenced:', message);
      return false;
    }
  }, true); // Use capture phase
  
  // Capturar errores no manejados de promesas
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || event.reason || '';
    if (typeof message === 'string' && (
      message.includes('solana') || 
      message.includes('ethereum') || 
      message.includes('tronWeb') ||
      message.includes('bybitWallet') ||
      message.includes('Cannot redefine property') ||
      message.includes('Cannot assign to read only property')
    )) {
      event.preventDefault();
      console.warn('🚫 Wallet extension promise error completely silenced:', message);
      return false;
    }
  });

  // Interceptar errores no manejados
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason);
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

// Inicializar aplicación con verificación de seguridad
async function initializeApp() {
  // Initialize React fallbacks first for SSR compatibility
  initializeReactFallbacks();
  ensureReactPolyfills();
  
  // Initialize wallet protection before anything else
  initializeWalletProtection();
  detectWalletConflicts();
  
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
