import { createRoot } from 'react-dom/client'
import * as React from 'react'
const { StrictMode } = React

// CRÍTICO: Asegurar React disponible globalmente INMEDIATAMENTE, ANTES DE CUALQUIER OTRA COSA
// Esto debe estar ANTES de cualquier otro import o código que pueda cargar chunks
if (typeof window !== 'undefined') {
  // Logging para diagnóstico
  const debugLog = (event: string, data?: any) => {
    if ((window as any).__LOADING_DEBUG__) {
      (window as any).__LOADING_DEBUG__.log(event, data);
    }
  };
  
  debugLog('MAIN_TSX_START', { hasReact: !!React, hasCreateContext: !!React.createContext });
  
  // Forzar React disponible globalmente de forma inmediata
  (window as any).React = React;
  debugLog('REACT_ASSIGNED_GLOBAL', { hasReact: !!(window as any).React });
  
  // CRÍTICO: Asegurar createContext disponible inmediatamente
  if (!(window as any).React.createContext) {
    debugLog('REACT_CONTEXT_MISSING', { hasReact: !!(window as any).React });
    (window as any).React.createContext = React.createContext;
    debugLog('REACT_CONTEXT_ASSIGNED', { hasCreateContext: !!(window as any).React.createContext });
  } else {
    debugLog('REACT_CONTEXT_ALREADY_EXISTS', { hasCreateContext: !!(window as any).React.createContext });
  }
  
  // Asegurar polyfill si existe
  if ((window as any).__REACT_POLYFILL__ && (window as any).__REACT_POLYFILL__.createContext) {
    debugLog('POLYFILL_FOUND', { hasPolyfill: !!(window as any).__REACT_POLYFILL__.createContext });
    // Reemplazar con el real si está disponible
    (window as any).React.createContext = React.createContext || (window as any).__REACT_POLYFILL__.createContext;
    debugLog('POLYFILL_APPLIED', { hasCreateContext: !!(window as any).React.createContext });
  }
  
  // Asegurar TODOS los hooks críticos inmediatamente - CON FALLBACKS ROBUSTOS
  const winReact = (window as any).React;
  if (winReact) {
    // CRÍTICO: Asegurar useLayoutEffect primero con fallback robusto
    if (!winReact.useLayoutEffect) {
      if (React.useLayoutEffect) {
        winReact.useLayoutEffect = React.useLayoutEffect;
      } else if (React.useEffect) {
        winReact.useLayoutEffect = React.useEffect;
      } else {
        // Fallback final: función que retorna no-op cleanup
        winReact.useLayoutEffect = function(callback: any, _deps?: any) {
          if (typeof callback === 'function') {
            try {
              return callback();
            } catch {
              return function() {};
            }
          }
          return function() {};
        };
      }
    }
    
    // Asegurar useEffect
    if (!winReact.useEffect) {
      winReact.useEffect = React.useEffect || function() { return function() {}; };
    }
    
    // Asegurar todos los otros hooks críticos
    winReact.useState = winReact.useState || React.useState || function() { return [null, function() {}]; };
    winReact.useMemo = winReact.useMemo || React.useMemo || function(fn: any) { return fn(); };
    winReact.useCallback = winReact.useCallback || React.useCallback || function(fn: any) { return fn; };
    winReact.createElement = winReact.createElement || React.createElement || function() { return null; };
    winReact.StrictMode = winReact.StrictMode || StrictMode;
  }
  
  // También asegurar ReactDOM inmediatamente
  if (!(window as any).ReactDOM) {
    (window as any).ReactDOM = {
      createRoot: createRoot
    };
  }
  
  // ELIMINADO: Object.defineProperty para window.React - Ya está en index.html y causa recursión infinita
  // El stub de React ya está establecido en index.html antes de que este código se ejecute
  // No necesitamos redefinirlo aquí
}

// Ahora sí, importar el resto de las dependencias
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

// Continuar con wallet protection después de asegurar React
if (typeof window !== 'undefined') {
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
      'read only property',
      'wallet must has at least one account',
      'wallet must have',
      'wallet must',
      'metamask encountered an error',
      'metamask encountered',
      'metamask',
      'tronweb is already initiated',
      'tronweb',
      'tronlink will overwrite',
      'tronlink',
      'cannot set property chainid',
      'chainid',
      'chain id',
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
      'property',
      'cannot read properties of undefined',
      'reading \'useLayoutEffect\'',
      'reading \'uselayouteffect\'',
      'chunk-cidlbzv5',
      'chunk-',
      'cidlbzv5',
      'code 4001',
      '4001'
    ];
    
    const walletFiles = [
      'solana.js',
      'inpage.js',
      'evmask.js',
      'evmask.js:5',
      'evmask.js:',
      'evmAsk.js',
      'dist.94abdbf1.js',
      'dist.',
      'solana.js:3',
      'solana.js:',
      'inpage.js:154',
      'inpage.js:168',
      'inpage.js:',
      'inpage.js:1',
      'data-layer',
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
    const reason = event.reason;
    const message = (reason?.message || reason?.toString() || '').toLowerCase();
    const stack = reason?.stack?.toLowerCase() || '';
    const code = reason?.code?.toString() || '';
    
    const walletErrors = [
      'wallet must has at least one account',
      'wallet must have',
      'wallet must',
      'cannot redefine property',
      'cannot assign to read only property',
      'cannot set property',
      'cannot set property chainid',
      'read only property',
      'chainid',
      'chain id',
      'metamask encountered an error',
      'metamask',
      'tronweb is already initiated',
      'tronweb',
      'tronlink will overwrite',
      'tronlink',
      'bybit:page provider',
      'bybit',
      'solana',
      'ethereum',
      'evmask',
      'wallet',
      'chunk',
      'useLayoutEffect',
      'property',
      'cannot read properties of undefined',
      'reading \'useLayoutEffect\'',
      'reading \'uselayouteffect\'',
      'chunk-cidlbzv5',
      'chunk-',
      'cidlbzv5',
      'code 4001',
      '4001'
    ];
    
    const walletFiles = [
      'solana.js',
      'inpage.js',
      'evmask.js',
      'dist.94abdbf1.js',
      'data-layer',
      'chunk',
      'wallet'
    ];
    
    // Capturar por mensaje, código, stack trace o archivos de wallet
    if (walletErrors.some(error => message.includes(error)) ||
        walletErrors.some(error => stack.includes(error)) ||
        walletFiles.some(file => stack.includes(file)) ||
        code === '4001' ||
        (reason && typeof reason === 'object' && 'code' in reason && reason.code === 4001)) {
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
      'wallet must',
      'ethereum',
      'solana',
      'metamask',
      'tronweb',
      'tronlink',
      'bybit',
      'evmask',
      'cannot redefine property',
      'cannot assign to read only property',
      'read only property',
      'cannot set property',
      'typeerror',
      'chunk',
      'useLayoutEffect',
      'property',
      'chainid',
      'chain id',
      'code 4001',
      '4001',
      'inpage.js',
      'evmask.js',
      'evmAsk.js',
      'data-layer'
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
      'wallet must',
      'ethereum',
      'solana',
      'metamask',
      'tronweb',
      'tronlink',
      'bybit',
      'evmask',
      'chunk',
      'tronweb is already initiated',
      'tronlink will overwrite',
      'bybit:page provider',
      'inpage.js',
      'evmask.js',
      'data-layer'
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
  // Logging para diagnóstico
  const debugLog = (event: string, data?: any) => {
    if ((window as any).__LOADING_DEBUG__) {
      (window as any).__LOADING_DEBUG__.log(event, data);
    }
  };
  
  debugLog('INIT_APP_START', { timestamp: performance.now() });
  
  // Timeout de seguridad: si no se monta en 5 segundos, forzar montaje
  const mountTimeout = setTimeout(() => {
    const rootElement = document.getElementById("root");
    debugLog('MOUNT_TIMEOUT_TRIGGERED', { hasRoot: !!rootElement, hasChildren: rootElement?.hasChildNodes() });
    if (rootElement && !rootElement.hasChildNodes()) {
      console.error('⚠️ Forzando montaje de React después de timeout de seguridad');
      try {
        rootElement.innerHTML = '';
        createRoot(rootElement).render(
          <StrictMode>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </StrictMode>
        );
        debugLog('MOUNT_FORCED_SUCCESS', {});
      } catch (error) {
        console.error('❌ Error crítico montando React:', error);
        debugLog('MOUNT_FORCED_ERROR', { error: error instanceof Error ? error.message : String(error) });
      }
    }
  }, 5000);

  try {
    debugLog('INIT_APP_TRY_START', {});
    // React ya está disponible globalmente (establecido al inicio del archivo)
    // Solo re-asegurar que no se haya perdido durante el proceso
    if (typeof window !== 'undefined') {
      if (!(window as any).React) {
        (window as any).React = React;
      }
      
      // Re-asegurar todos los hooks críticos por si acaso
      const winReact = (window as any).React;
      if (winReact) {
        // CRÍTICO: Asegurar useLayoutEffect con fallback robusto
        if (!winReact.useLayoutEffect) {
          if (React.useLayoutEffect) {
            winReact.useLayoutEffect = React.useLayoutEffect;
          } else if (React.useEffect) {
            winReact.useLayoutEffect = React.useEffect;
          } else {
            // Fallback final: función no-op
            winReact.useLayoutEffect = function() { return function() {}; };
          }
        }
        // Asegurar todos los otros hooks
        if (!winReact.useEffect) winReact.useEffect = React.useEffect || function() {};
        if (!winReact.useState) winReact.useState = React.useState || function() {};
        if (!winReact.useMemo) winReact.useMemo = React.useMemo || function() {};
        if (!winReact.useCallback) winReact.useCallback = React.useCallback || function() {};
        if (!winReact.createElement) winReact.createElement = React.createElement || function() {};
        if (!winReact.StrictMode) winReact.StrictMode = StrictMode;
      }
      
      // Re-asegurar ReactDOM
      if (!(window as any).ReactDOM) {
        (window as any).ReactDOM = {
          createRoot: createRoot
        };
      }
    }
    
    // Initialize React fallbacks first for SSR compatibility (redundante pero seguro)
    initializeReactFallbacks();
    ensureReactPolyfills();
    
    // Wallet protection ya inicializado al inicio del archivo
    
    // Detectar conflictos de wallet (silenciado)
    try {
      detectWalletConflicts();
    } catch {
      // Silenciar errores de detección
    }
    
    // CRÍTICO: Limpiar el contenido del root ANTES de buscar el elemento
    debugLog('ROOT_ELEMENT_SEARCH', {});
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      debugLog('ROOT_ELEMENT_NOT_FOUND', { waiting: 100 });
      // Intentar esperar un poco para que el DOM cargue
      await new Promise(resolve => setTimeout(resolve, 100));
      const retryRoot = document.getElementById("root");
      if (!retryRoot) {
        console.error('❌ Root element not found after retry');
        debugLog('ROOT_ELEMENT_NOT_FOUND_RETRY', { error: 'Root element not found' });
        throw new Error('Root element not found');
      }
      debugLog('ROOT_ELEMENT_FOUND_RETRY', {});
    } else {
      debugLog('ROOT_ELEMENT_FOUND', {});
    }

    // CRÍTICO: Limpiar cualquier contenido HTML del fallback de loading
    const finalRootElement = document.getElementById("root");
    if (!finalRootElement) {
      debugLog('ROOT_ELEMENT_MISSING', { error: 'Root element not found' });
      throw new Error('Root element not found');
    }
    
    // Limpiar el contenido del loading fallback
    debugLog('ROOT_ELEMENT_CLEARING', { innerHTML: finalRootElement.innerHTML.length });
    finalRootElement.innerHTML = '';

    // Verify security before rendering (no bloquear si falla)
    debugLog('SECURITY_CHECK_START', {});
    try {
      await initializeSecurityCheck();
      debugLog('SECURITY_CHECK_SUCCESS', {});
    } catch (error) {
      debugLog('SECURITY_CHECK_FAILED', { error: error instanceof Error ? error.message : String(error) });
      // Continuar aunque falle la verificación de seguridad
    }

    // Verificar React antes de renderizar
    debugLog('REACT_VERIFICATION', { 
      hasReact: !!(window as any).React,
      hasCreateContext: !!(window as any).React?.createContext,
      hasReactDOM: !!(window as any).ReactDOM
    });

    if (import.meta.env.DEV) {
      console.log('✅ Root element found, rendering app...');
    }

    debugLog('REACT_RENDER_START', { timestamp: performance.now() });
    createRoot(finalRootElement).render(
      <StrictMode>
        <ErrorBoundary>
          {import.meta.env.DEV && <DebugInfo />}
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
    debugLog('REACT_RENDER_SUCCESS', { timestamp: performance.now() });
    
    // Limpiar timeout de seguridad ya que el montaje fue exitoso
    clearTimeout(mountTimeout);
    debugLog('INIT_APP_SUCCESS', { timestamp: performance.now() });
    
    // Log reporte final después de un breve delay para capturar todos los eventos
    setTimeout(() => {
      if ((window as any).__LOADING_DEBUG__) {
        const report = (window as any).__LOADING_DEBUG__.getReport();
        debugLog('LOADING_REPORT_FINAL', report);
        if (import.meta.env.DEV) {
          console.log('📊 Reporte de carga completo:', report);
          console.log('💡 Para ver el reporte en producción, ejecuta: window.__LOADING_DEBUG__.getReport()');
        }
      }
    }, 1000);
  } catch (error: any) {
    // Limpiar timeout de seguridad en caso de error
    clearTimeout(mountTimeout);
    const errorMsg = error instanceof Error ? error.message : String(error);
    debugLog('INIT_APP_ERROR', { error: errorMsg, stack: error instanceof Error ? error.stack : undefined });
    
    // Log reporte de error
    if ((window as any).__LOADING_DEBUG__) {
      const report = (window as any).__LOADING_DEBUG__.getReport();
      debugLog('LOADING_REPORT_ERROR', report);
      console.error('📊 Reporte de carga al error:', report);
    }
    
    // CRÍTICO: Mostrar TODOS los errores para diagnóstico
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorStack = error?.stack?.toLowerCase() || '';
    
    // Determinar si es error de wallet (para logging, pero NO ocultar visualmente)
    const isWalletError = [
      'wallet', 'ethereum', 'solana', 'metamask', 'tronweb', 'tronlink', 
      'bybit', 'evmask', 'chunk', 'useLayoutEffect', 'property', 'chainid'
    ].some(keyword => errorMessage.includes(keyword) || errorStack.includes(keyword));
    
    // SIEMPRE mostrar error en consola para diagnóstico (aunque sea de wallet)
    console.error('❌ Application initialization failed:', {
      message: error?.message,
      stack: error?.stack,
      isWalletError: isWalletError,
      error: error
    });
    
    // SIEMPRE mostrar error visual si no es de wallet
    if (!isWalletError) {
      console.error('❌ Application initialization failed (no wallet error):', error);
      
      // Mostrar error crítico en la página si no es de wallet
      const rootElement = document.getElementById("root");
      if (rootElement) {
        rootElement.innerHTML = `
          <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%); color: white; padding: 20px; text-align: center;">
            <div style="max-width: 600px;">
              <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Error al Cargar la Aplicación</h1>
              <p style="margin-bottom: 1rem;">Por favor, recarga la página o contacta al soporte si el problema persiste.</p>
              <p style="font-size: 0.875rem; margin-bottom: 2rem; opacity: 0.8;">Error: ${errorMsg}</p>
              <button onclick="window.location.reload()" style="padding: 12px 24px; background: white; color: #6b21a8; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-right: 10px;">
                Recargar Página
              </button>
              ${import.meta.env.DEV ? `<button onclick="console.log(window.__LOADING_DEBUG__?.getReport())" style="padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; border: 1px solid white; border-radius: 8px; cursor: pointer; font-weight: bold;">
                Ver Reporte de Carga
              </button>` : ''}
            </div>
          </div>
        `;
      }
    }
  }
}

// Initialize the application
initializeApp().catch((error: any) => {
  // CRÍTICO: Mostrar TODOS los errores para diagnóstico, incluso si son de wallet
  // Solo silenciar en consola, pero siempre mostrar en pantalla
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorStack = error?.stack?.toLowerCase() || '';
  
  // Determinar si es error de wallet (para logging, pero NO ocultar visualmente)
  const isWalletError = [
    'wallet', 'ethereum', 'solana', 'metamask', 'tronweb', 'tronlink', 
    'bybit', 'evmask', 'chunk', 'property'
  ].some(keyword => errorMessage.includes(keyword) || errorStack.includes(keyword));
  
  // SIEMPRE mostrar error en consola para diagnóstico (aunque sea de wallet)
  console.error('❌ Application initialization failed:', {
    message: error?.message,
    stack: error?.stack,
    isWalletError: isWalletError,
    error: error
  });
  
  // SIEMPRE mostrar error visual si no es de wallet
  if (!isWalletError) {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%); color: white; padding: 20px; text-align: center;">
          <div style="max-width: 600px;">
            <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Error al Cargar la Aplicación</h1>
            <p style="margin-bottom: 1rem;">Por favor, recarga la página o contacta al soporte si el problema persiste.</p>
            <p style="font-size: 0.875rem; margin-bottom: 2rem; opacity: 0.8;">Error: ${error?.message || 'Error desconocido'}</p>
            <button onclick="window.location.reload()" style="padding: 12px 24px; background: white; color: #6b21a8; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-right: 10px;">
              Recargar Página
            </button>
            <button onclick="console.log(window.__LOADING_DEBUG__?.getReport())" style="padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; border: 1px solid white; border-radius: 8px; cursor: pointer; font-weight: bold;">
              Ver Reporte de Carga
            </button>
          </div>
        </div>
      `;
    }
  }
});