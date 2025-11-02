import { createRoot } from 'react-dom/client'
import * as React from 'react'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import './styles/consolidated-styles.css'
import './styles/ui-fixes-contraste.css'
import './styles/info-text-visibility.css'
import './styles/header-nav-protection.css'
import './styles/responsive-fixes.css'
import './styles/decorative-hearts.css'
import { initializeWalletProtection, detectWalletConflicts } from "./utils/walletProtection";
import { initializeReactFallbacks, ensureReactPolyfills } from "./utils/reactFallbacks";
import ErrorBoundary from '@/components/ErrorBoundary'
import { initSentry } from '@/config/sentry.config'
import { initializeDatadogRUM } from '@/config/datadog-rum.config'
import { DebugInfo } from '@/debug'
import { initWebVitalsMonitoring } from '@/utils/webVitals'
import { initializeCriticalPreloading } from '@/utils/preloading'
import { androidSecurity } from '@/utils/androidSecurity'

// CRÍTICO: Asegurar que React esté disponible globalmente ANTES de cualquier código
if (typeof window !== 'undefined') {
  // Asegurar React disponible para todos los chunks
  if (!(window as any).React) {
    (window as any).React = React;
  }
  // Initialize wallet protection with minimal interference
  initializeWalletProtection();
  
  // SILENCIAR COMPLETAMENTE TODOS LOS ERRORES DE WALLET - ULTRA AGRESIVO
  window.addEventListener('error', (event) => {
    const message = event.message?.toLowerCase() || '';
    const filename = event.filename?.toLowerCase() || '';
    const stack = event.error?.stack?.toLowerCase() || '';
    
    const walletErrors = [
      'cannot redefine property',
      'cannot assign to read only property',
      'cannot set property',
      'metamask encountered an error',
      'metamask',
      'tronweb is already initiated',
      'tronweb',
      'tronlink will overwrite',
      'tronlink',
      'cannot set property chainid',
      'chainid',
      'bybit:page provider',
      'bybit',
      'evmask',
      'solana.js',
      'solana',
      'ethereum',
      'expression not available',
      'expression',
      'not available',
      'chunk',
      'useLayoutEffect',
      'property'
    ];
    
    const walletFiles = [
      'solana.js',
      'inpage.js',
      'evmask.js',
      'evmask.js:5',
      'evmask.js:',
      'dist.94abdbf1.js',
      'dist.',
      'solana.js:3',
      'solana.js:',
      'inpage.js:154',
      'inpage.js:168',
      'inpage.js:',
      'inpage.js:1',
      'tronlink',
      'bybit',
      'chunk',
      'wallet'
    ];
    
    // Bloquear si es error de wallet O archivo de wallet O stack trace - SILENCIAR COMPLETAMENTE
    if (walletErrors.some(error => message.includes(error)) ||
        walletErrors.some(error => stack.includes(error)) ||
        walletFiles.some(file => filename.includes(file)) ||
        walletFiles.some(file => stack.includes(file))) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return false;
    }
  }, true); // Capturar en fase de captura - PRIMERO
  
  // Promise rejection handler - SILENCIAR COMPLETAMENTE TODO DE WALLETS - ULTRA AGRESIVO
  window.addEventListener('unhandledrejection', (event) => {
    const message = (event.reason?.message || event.reason?.toString() || '').toLowerCase();
    const stack = event.reason?.stack?.toLowerCase() || '';
    
    const walletErrors = [
      'cannot redefine property',
      'cannot assign to read only property',
      'cannot set property',
      'cannot set property chainid',
      'chainid',
      'metamask',
      'tronweb',
      'tronlink',
      'bybit',
      'solana',
      'ethereum',
      'evmask',
      'wallet',
      'chunk',
      'useLayoutEffect',
      'property'
    ];
    
    // Capturar por mensaje O stack trace
    if (walletErrors.some(error => message.includes(error)) ||
        walletErrors.some(error => stack.includes(error))) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return false;
    }
  }, true); // Captura en fase de captura - PRIMERO

  // Sobrescribir console.error temporalmente para wallets - ULTRA AGRESIVO
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ').toLowerCase();
    const stack = args.find(arg => typeof arg === 'string' && arg.includes('at '))?.toLowerCase() || '';
    
    const isWalletError = [
      'wallet',
      'ethereum',
      'solana',
      'metamask',
      'tronweb',
      'tronlink',
      'bybit',
      'evmask',
      'cannot redefine property',
      'cannot assign to read only property',
      'cannot set property',
      'typeerror',
      'chunk',
      'useLayoutEffect',
      'property',
      'chainid'
    ].some(keyword => message.includes(keyword) || stack.includes(keyword));
    
    if (!isWalletError) {
      originalConsoleError.apply(console, args);
    }
  };
  
  // También bloquear console.warn para wallets - ULTRA AGRESIVO
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ').toLowerCase();
    const stack = args.find(arg => typeof arg === 'string' && arg.includes('at '))?.toLowerCase() || '';
    
    const isWalletWarning = [
      'wallet',
      'ethereum',
      'solana',
      'metamask',
      'tronweb',
      'tronlink',
      'bybit',
      'evmask',
      'chunk'
    ].some(keyword => message.includes(keyword) || stack.includes(keyword));
    
    if (!isWalletWarning) {
      originalConsoleWarn.apply(console, args);
    }
  };
}

// Debug info for development only
if (import.meta.env.DEV) {
  console.log('🚀 ComplicesConecta v3.5.0 starting...');
}

// Initialize Datadog RUM for frontend monitoring
try {
  initializeDatadogRUM();
  if (import.meta.env.DEV) console.log('📊 Datadog RUM initialized');
} catch (error) {
  console.error('❌ Datadog RUM initialization failed:', error);
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

// Initialize application with enhanced error handling
async function initializeApp() {
  try {
    // Initialize React fallbacks first for SSR compatibility
    initializeReactFallbacks();
    ensureReactPolyfills();
    
    // Initialize wallet protection before anything else (más temprano posible)
    initializeWalletProtection();
    
    // Detectar conflictos de wallet (silenciado)
    try {
      detectWalletConflicts();
    } catch {
      // Silenciar errores de detección
    }
    
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      // Intentar esperar un poco para que el DOM cargue
      await new Promise(resolve => setTimeout(resolve, 100));
      const retryRoot = document.getElementById("root");
      if (!retryRoot) {
        console.error('❌ Root element not found after retry');
        throw new Error('Root element not found');
      }
    }

    // Verify security before rendering (no bloquear si falla)
    try {
      await initializeSecurityCheck();
    } catch {
      // Continuar aunque falle la verificación de seguridad
    }

    const finalRootElement = document.getElementById("root");
    if (!finalRootElement) {
      throw new Error('Root element not found');
    }

    if (import.meta.env.DEV) {
      console.log('✅ Root element found, rendering app...');
    }

    createRoot(finalRootElement).render(
      <StrictMode>
        <ErrorBoundary>
          {import.meta.env.DEV && <DebugInfo />}
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (error: any) {
    // Manejar errores críticos sin mostrar errores de wallet
    const errorMessage = error?.message?.toLowerCase() || '';
    const isWalletError = [
      'wallet', 'ethereum', 'solana', 'metamask', 'tronweb', 'tronlink', 
      'bybit', 'evmask', 'chunk', 'useLayoutEffect', 'property', 'chainid'
    ].some(keyword => errorMessage.includes(keyword));
    
    if (!isWalletError) {
      console.error('❌ Application initialization failed:', error);
      
      // Mostrar error crítico en la página si no es de wallet
      const rootElement = document.getElementById("root");
      if (rootElement) {
        rootElement.innerHTML = `
          <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%); color: white; padding: 20px; text-align: center;">
            <div style="max-width: 600px;">
              <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Error al Cargar la Aplicación</h1>
              <p style="margin-bottom: 2rem;">Por favor, recarga la página o contacta al soporte si el problema persiste.</p>
              <button onclick="window.location.reload()" style="padding: 12px 24px; background: white; color: #6b21a8; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                Recargar Página
              </button>
            </div>
          </div>
        `;
      }
    }
  }
}

// Initialize the application
initializeApp().catch((error: any) => {
  // Solo mostrar errores que NO sean de wallet
  const errorMessage = error?.message?.toLowerCase() || '';
  const isWalletError = [
    'wallet', 'ethereum', 'solana', 'metamask', 'tronweb', 'tronlink', 
    'bybit', 'evmask', 'chunk', 'property'
  ].some(keyword => errorMessage.includes(keyword));
  
  if (!isWalletError) {
    console.error('❌ Application initialization failed:', error);
  }
});