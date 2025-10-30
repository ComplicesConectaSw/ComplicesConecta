import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import './styles/consolidated-styles.css'
import './styles/ui-fixes-contraste.css'
import { initializeWalletProtection, detectWalletConflicts } from "./utils/walletProtection";
import { initializeReactFallbacks, ensureReactPolyfills } from "./utils/reactFallbacks";
import ErrorBoundary from '@/components/ErrorBoundary'
import { initSentry } from '@/config/sentry.config'
import { DebugInfo } from '@/debug'
import { initWebVitalsMonitoring } from '@/utils/webVitals'
import { initializeCriticalPreloading } from '@/utils/preloading'
import { androidSecurity } from '@/utils/androidSecurity'

if (typeof window !== 'undefined') {
  // Initialize wallet protection with minimal interference
  initializeWalletProtection();
  
  // Simple error handler for wallet conflicts only
  window.addEventListener('error', (event) => {
    const message = event.message?.toLowerCase() || '';
    const walletErrors = [
      'cannot redefine property: ethereum',
      'cannot redefine property: solana',
      'cannot assign to read only property: ethereum',
      'cannot assign to read only property: solana',
      'metamask encountered an error setting the global ethereum provider'
    ];
    
    if (walletErrors.some(error => message.includes(error))) {
      console.log('🚫 [WalletProtection] Blocked wallet error:', event.message);
      event.preventDefault();
      return false;
    }
  });
  
  // Promise rejection handler for wallet conflicts only
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message?.toLowerCase() || '';
    const walletErrors = [
      'wallet must has at least one account',
      'cannot redefine property: ethereum',
      'cannot redefine property: solana'
    ];
    
    if (walletErrors.some(error => message.includes(error))) {
      console.log('🚫 [WalletProtection] Blocked wallet promise rejection:', event.reason);
      event.preventDefault();
    }
  });

  console.log('🛡️ [WalletProtection] Enhanced protection initialized successfully');
}

// Debug info for development only
if (import.meta.env.DEV) {
  console.log('🚀 ComplicesConecta v3.4.0 starting...');
}

// Initialize Sentry for error monitoring
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

// Initialize Web Vitals monitoring
try {
  initWebVitalsMonitoring();
} catch (error) {
  console.error('❌ Web Vitals monitoring failed:', error);
}

// Initialize critical preloading
try {
  initializeCriticalPreloading();
  console.log('✅ Critical preloading initialized');
} catch (error) {
  console.error('❌ Critical preloading failed:', error);
}

// Security check function
async function initializeSecurityCheck() {
  try {
    // Android security check
    if (typeof window !== 'undefined' && window.navigator) {
      const isAndroid = /Android/i.test(window.navigator.userAgent);
      if (isAndroid) {
        // Initialize Android security if available
        try {
          await androidSecurity;
        } catch (error) {
          console.warn('Android security not available:', error);
        }
      }
    }
    return true;
  } catch (error) {
    console.error('❌ Security check failed:', error);
    return false;
  }
}

// Register Service Worker
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

// Initialize application
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

  // Verify security before rendering
  const isSecure = await initializeSecurityCheck();
  
  if (!isSecure) {
    console.log('🔒 Application blocked for security reasons');
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

// Initialize the application
initializeApp().catch((error) => {
  console.error('❌ Application initialization failed:', error);
});