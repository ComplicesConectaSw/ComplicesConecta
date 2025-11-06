import { createRoot } from 'react-dom/client'
import * as React from 'react'
import type { WindowWithReact } from '@/types/react.types'
const { StrictMode } = React
// CRÍTICO: Asegurar React disponible globalmente INMEDIATAMENTE, ANTES DE CUALQUIER OTRA COSA
// Esto debe estar ANTES de cualquier otro import o código que pueda cargar chunks
if (typeof window !== 'undefined') {
  const win = window as WindowWithReact;
  
  // Logging para diagnóstico
  const debugLog = (event: string, data?: unknown) => {
    if (win.__LOADING_DEBUG__) {
      win.__LOADING_DEBUG__.log(event, data);
    }
  };
  
  debugLog('MAIN_TSX_START', { hasReact: !!React, hasCreateContext: !!React.createContext });
  
  // Forzar React disponible globalmente de forma inmediata
  win.React = React;
  debugLog('REACT_ASSIGNED_GLOBAL', { hasReact: !!win.React });
  
  // CRÍTICO: Asegurar createContext disponible inmediatamente
  if (!win.React?.createContext) {
    debugLog('REACT_CONTEXT_MISSING', { hasReact: !!win.React });
    if (win.React) {
      win.React.createContext = React.createContext;
    }
    debugLog('REACT_CONTEXT_ASSIGNED', { hasCreateContext: !!win.React?.createContext });
  } else {
    debugLog('REACT_CONTEXT_ALREADY_EXISTS', { hasCreateContext: !!win.React?.createContext });
  }
  
  // Asegurar polyfill si existe
  if (win.__REACT_POLYFILL__ && win.__REACT_POLYFILL__.createContext) {
    debugLog('POLYFILL_FOUND', { hasPolyfill: !!win.__REACT_POLYFILL__.createContext });
    // Reemplazar con el real si está disponible
    if (win.React) {
      win.React.createContext = React.createContext || win.__REACT_POLYFILL__.createContext;
    }
    debugLog('POLYFILL_APPLIED', { hasCreateContext: !!win.React?.createContext });
  }
  
  // Asegurar TODOS los hooks críticos inmediatamente - CON FALLBACKS ROBUSTOS
  const winReact = win.React;
  if (winReact) {
    // CRÍTICO: Asegurar useLayoutEffect primero con fallback robusto
    if (!winReact.useLayoutEffect) {
      if (React.useLayoutEffect) {
        winReact.useLayoutEffect = React.useLayoutEffect;
      } else if (React.useEffect) {
        winReact.useLayoutEffect = React.useEffect;
      } else {
        // Fallback final: función que retorna no-op cleanup
        winReact.useLayoutEffect = function(callback: () => void | (() => void), _deps?: unknown[]) {
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
    winReact.useMemo = winReact.useMemo || React.useMemo || function(fn: () => unknown) { return fn(); };
    winReact.useCallback = winReact.useCallback || React.useCallback || function(fn: unknown) { return fn; };
    winReact.createElement = winReact.createElement || React.createElement || function() { return null; };
    winReact.StrictMode = winReact.StrictMode || StrictMode;
  }
  
  // También asegurar ReactDOM inmediatamente
  if (!win.ReactDOM) {
    win.ReactDOM = {
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
import './styles/consolidated-styles.css' // Consolidado: accessibility.css, cross-browser.css (estilos únicos), mobile-responsive.css (estilos únicos)
import './styles/ui-fixes-consolidated.css' // Consolidado: ui-fixes-contraste, info-text-visibility, header-nav-protection, responsive-fixes, text-overflow-fixes, text-visibility-fixes
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
import { logger } from '@/lib/logger'

// Continuar con wallet protection después de asegurar React
if (typeof window !== 'undefined') {
  // Initialize wallet protection - walletProtection.ts verifica si ya hay protección activa
  // desde index.html y solo refuerza sin duplicar interceptores
  initializeWalletProtection();
  
  // NOTA: Los handlers de error ya están en index.html (ejecuta primero) y walletProtection.ts
  // No duplicar aquí para evitar conflictos y múltiples interceptores
}

// Debug info for development only
if (import.meta.env.DEV) {
  logger.info('ComplicesConecta v3.5.0 starting...');
}

// Initialize Datadog RUM for frontend monitoring
try {
  initializeDatadogRUM();
  if (import.meta.env.DEV) logger.info('Datadog RUM initialized');
} catch (error) {
  logger.error('Datadog RUM initialization failed', { error });
}

// Initialize Sentry for error monitoring
try {
  if (import.meta.env.VITE_SENTRY_DSN) {
    initSentry();
    if (import.meta.env.DEV) logger.info('Sentry initialized');
  } else {
    if (import.meta.env.DEV) logger.debug('Sentry DSN not configured');
  }
} catch (error) {
  logger.error('Sentry initialization failed', { error });
}

// Initialize Web Vitals monitoring
try {
  initWebVitalsMonitoring();
} catch (error) {
  logger.error('Web Vitals monitoring failed', { error });
}

// Initialize critical preloading
try {
  initializeCriticalPreloading();
  logger.info('Critical preloading initialized');
} catch (error) {
  logger.error('Critical preloading failed', { error });
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
          // androidSecurity es una instancia de AndroidSecurityManager
          if (androidSecurity && typeof androidSecurity.performSecurityCheck === 'function') {
            await androidSecurity.performSecurityCheck();
          }
        } catch (error) {
          logger.warn('Android security not available', { error });
        }
      }
    }
    return true;
  } catch (error) {
    logger.error('Security check failed', { error });
    return false;
  }
}

// Register Service Worker
if ('serviceWorker' in navigator && import.meta.env.MODE === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        logger.info('Service Worker registered', { registration });
      })
      .catch((error) => {
        logger.error('Service Worker registration failed', { error });
      });
  });
}

// Initialize application with enhanced error handling
async function initializeApp() {
  const win = typeof window !== 'undefined' ? (window as WindowWithReact) : null;
  
  // Logging para diagnóstico
  const debugLog = (event: string, data?: unknown) => {
    if (win?.__LOADING_DEBUG__) {
      win.__LOADING_DEBUG__.log(event, data);
    }
  };
  
  debugLog('INIT_APP_START', { timestamp: performance.now() });
  
  // Timeout de seguridad: si no se monta en 5 segundos, forzar montaje
  const mountTimeout = setTimeout(() => {
    const rootElement = document.getElementById("root");
    debugLog('MOUNT_TIMEOUT_TRIGGERED', { hasRoot: !!rootElement, hasChildren: rootElement?.hasChildNodes() });
    if (rootElement && !rootElement.hasChildNodes()) {
      logger.warn('Forzando montaje de React después de timeout de seguridad');
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
        logger.error('Error crítico montando React', { error });
        debugLog('MOUNT_FORCED_ERROR', { error: error instanceof Error ? error.message : String(error) });
      }
    }
  }, 5000);

  try {
    debugLog('INIT_APP_TRY_START', {});
    // React ya está disponible globalmente (establecido al inicio del archivo)
    // Solo re-asegurar que no se haya perdido durante el proceso
    if (win) {
      if (!win.React) {
        win.React = React;
      }
      
      // Re-asegurar todos los hooks críticos por si acaso
      const winReact = win.React;
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
      if (!win.ReactDOM) {
        win.ReactDOM = {
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
        logger.error('Root element not found after retry');
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
      hasReact: !!win?.React,
      hasCreateContext: !!win?.React?.createContext,
      hasReactDOM: !!win?.ReactDOM
    });

    if (import.meta.env.DEV) {
      logger.info('Root element found, rendering app...');
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
      if (win?.__LOADING_DEBUG__) {
        const report = win.__LOADING_DEBUG__.getReport();
        debugLog('LOADING_REPORT_FINAL', report);
        if (import.meta.env.DEV) {
          logger.info('Reporte de carga completo', { report });
          logger.debug('Para ver el reporte en producción, ejecuta: window.__LOADING_DEBUG__.getReport()');
        }
      }
    }, 1000);
  } catch (error: unknown) {
    // Limpiar timeout de seguridad en caso de error
    clearTimeout(mountTimeout);
    const errorMsg = error instanceof Error ? error.message : String(error);
    debugLog('INIT_APP_ERROR', { error: errorMsg, stack: error instanceof Error ? error.stack : undefined });
    
    // Log reporte de error
    if (win?.__LOADING_DEBUG__) {
      const report = win.__LOADING_DEBUG__.getReport();
      debugLog('LOADING_REPORT_ERROR', report);
      logger.error('Reporte de carga al error', { report });
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
    logger.error('Application initialization failed', {
      message: error?.message,
      stack: error?.stack,
      isWalletError: isWalletError,
      error: error
    });
    
    // SIEMPRE mostrar error visual si no es de wallet
    if (!isWalletError) {
      logger.error('Application initialization failed (no wallet error)', { error });
      
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
initializeApp().catch((error: unknown) => {
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
  logger.error('Application initialization failed', {
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