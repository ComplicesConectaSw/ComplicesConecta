/**
 * Utilidad para mostrar informaci├│n de variables de entorno en consola
 * Versi├│n: 3.5.1
 * 
 * Uso: Importar y llamar showEnvInfo() en la consola del navegador
 * 
 * NOTA: Este archivo usa console.log intencionalmente para debugging en consola del navegador
 /**
 * DEBUG GOD MODE - ComplicesConecta v5.0
 * Muestra absolutamente TODO lo que está pasando en el entorno
 * Uso: abre consola del navegador y escribe → showEnvInfo()
 */
export function showEnvInfo(): void {
  console.clear();
  console.groupCollapsed('COMPLICES CONECTA - DEBUG GOD MODE v5.0');

  const env = import.meta.env;

  // 1. ENTORNO GENERAL
  console.log('%cENTORNO ACTUAL', 'font-weight:bold; font-size:16px; color:#8b5cf6');
  console.table({
    Mode: env.MODE,
    Dev: env.DEV,
    Prod: env.PROD,
    SSR: env.SSR,
    BaseURL: env.BASE_URL,
    Version: (env as Record<string, unknown>).VITE_APP_VERSION || 'No definida',
    BuildTime: new Date().toLocaleString('es-MX'),
  });

  // 2. TODAS LAS VARIABLES VITE_ (CON CONTRASEÑAS REALES EN DEV)
  console.log('%cVARIABLES DE ENTORNO (VITE_*)', 'font-weight:bold; color:#3b82f6');
  const viteVars = Object.entries(env as Record<string, string | boolean | number>)
    .filter(([key]) => key.startsWith('VITE_'))
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .reduce((obj, [key, value]) => {
      const stringValue = String(value ?? '');
      obj[key] = env.DEV 
        ? stringValue
        : (stringValue.length > 0 ? '●●●●●●●●' : '[vacío]');
      return obj;
    }, {} as Record<string, string>);

  console.table(viteVars);

  // 3. SUPABASE INFO
  console.log('%cSUPABASE CONFIG', 'font-weight:bold; color:#10b981');
  console.table({
    URL: (env as Record<string, unknown>).VITE_SUPABASE_URL || 'No definida',
    AnonKey: env.DEV ? String((env as Record<string, unknown>).VITE_SUPABASE_ANON_KEY || '').slice(0, 20) + '...' : 'Oculta en prod',
    ServiceRole: env.DEV ? 'Visible solo en local' : 'Nunca expuesta',
    ProjectRef: String((env as Record<string, unknown>).VITE_SUPABASE_URL || '').match(/https:\/\/(.+?)\.supabase\.co/)?.[1] || 'No detectado',
  });

  // 4. BLOCKCHAIN / WALLET
  console.log('%cBLOCKCHAIN & WALLET', 'font-weight:bold; color:#f59e0b');
  console.table({
    ChainID: (env as Record<string, unknown>).VITE_POLYGON_CHAIN_ID,
    ChainName: (env as Record<string, unknown>).VITE_POLYGON_CHAIN_NAME,
    RPC_URL: (env as Record<string, unknown>).VITE_POLYGON_RPC_URL,
    Contract_NFT: (env as Record<string, unknown>).VITE_CONTRACT_NFT_ADDRESS,
    Contract_TOKEN: (env as Record<string, unknown>).VITE_CONTRACT_TOKEN_ADDRESS,
    WalletConnect_ID: (env as Record<string, unknown>).VITE_WALLETCONNECT_PROJECT_ID || 'No configurado',
  });

  // 5. FEATURE FLAGS
  console.log('%cFEATURE FLAGS', 'font-weight:bold; color:#ec4899');
  console.table({
    DemoMode: (env as Record<string, unknown>).VITE_DEMO_MODE === 'true',
    ParentalControl: (env as Record<string, unknown>).VITE_ENABLE_PARENTAL_CONTROL === 'true',
    PrivateGallery: (env as Record<string, unknown>).VITE_ENABLE_PRIVATE_GALLERY === 'true',
    ReportSystem: (env as Record<string, unknown>).VITE_ENABLE_REPORT_SYSTEM === 'true',
    BiometricAuth: (env as Record<string, unknown>).VITE_ENABLE_BIOMETRIC === 'true',
  });

  // 6. DISPOSITIVO & RENDIMIENTO (TU REDMI NOTE 13 PRO+)
  console.log('%cDISPOSITIVO & RENDIMIENTO', 'font-weight:bold; color:#8b5cf6');
  const nav = navigator as unknown as {
    hardwareConcurrency?: number;
    deviceMemory?: number;
    connection?: { effectiveType?: string };
  };
  console.table({
    UserAgent: navigator.userAgent,
    Platform: navigator.platform,
    Cores: nav.hardwareConcurrency || 'No detectado',
    Memory: `${nav.deviceMemory ?? 'No soportado'} GB`,
    Connection: nav.connection?.effectiveType || 'unknown',
    Screen: `${window.screen.width}x${window.screen.height}`,
    PixelRatio: window.devicePixelRatio,
    Touch: 'ontouchstart' in window ? 'SÍ (móvil)' : 'NO (desktop)',
    ReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });

  // 7. LOCALSTORAGE INFO
  console.log('%cLOCALSTORAGE (Reportes, tokens, etc)', 'font-weight:bold; color:#ef4444');
  const keys = Object.keys(window.localStorage).filter((key) =>
    key.includes('report') || key.includes('sb-') || key.includes('wallet')
  );
  console.log(keys.length > 0 ? keys : 'Vacío o solo datos de sesión');

  console.groupEnd();

  // Exponer globalmente
  if (env.DEV && typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).showEnvInfo = showEnvInfo;
    (window as unknown as Record<string, unknown>).env = env;
    // Log amigable en consola
    // eslint-disable-next-line no-console
    console.log('%cListo! Usa showEnvInfo() cuando quieras', 'color:#10b981; font-weight:bold');
  }
}

// Hacer disponible globalmente para uso en consola
// CR├ìTICO: Asegurar que las funciones est├®n disponibles inmediatamente
if (typeof window !== 'undefined') {
  const exposeEnvFunctions = () => {
    // SOLO en desarrollo - NO en producción
    if (!import.meta.env.DEV) {
      return;
    }
    
    console.log('🔧 Exponiendo funciones debug en desarrollo...');
    
    try {
      // Usar Object.defineProperty para evitar errores de redefinición
      Object.defineProperty(window, 'showEnvInfo', {
        value: showEnvInfo,
        writable: true,
        configurable: true,
        enumerable: true
      });
      
      Object.defineProperty(window, 'env', {
        value: import.meta.env,
        writable: true,
        configurable: true,
        enumerable: true
      });
      
      Object.defineProperty(window, 'getPassword', {
        value: (key: string) => {
          const value = import.meta.env[key];
          if (typeof value === 'string' && value.includes('****')) {
            return 'Contraseña oculta por seguridad';
          }
          return value || 'Variable no encontrada';
        },
        writable: true,
        configurable: true,
        enumerable: true
      });
    } catch {
      // Si falla Object.defineProperty, usar asignación directa (solo en dev)
      (window as unknown as Record<string, unknown>).showEnvInfo = showEnvInfo;
      (window as unknown as Record<string, unknown>).env = import.meta.env;
      (window as unknown as Record<string, unknown>).getPassword = (key: string) => {
        const value = import.meta.env[key];
        if (typeof value === 'string' && value.includes('****')) {
          return 'Contraseña oculta por seguridad';
        }
        return value || 'Variable no encontrada';
      };
      (window as Window & { showErrorReport?: () => unknown }).showErrorReport = () => {
        const debugWindow = window as Window & {
          errorReportService?: { showReport: () => unknown };
          __ERROR_LOGS__?: unknown[];
        };
        console.log('📊 Error Report Service Status:');
        console.log('- Service available:', !!debugWindow.errorReportService);
        console.log('- Recent errors:', debugWindow.__ERROR_LOGS__ || []);
        return debugWindow.errorReportService?.showReport() || 'No error report service available';
      };
    }
  };

  // Solo exponer en desarrollo
  if (import.meta.env.DEV) {
    exposeEnvFunctions();
  }
  // También exponer cuando el DOM esté listo (por si acaso)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', exposeEnvFunctions);
  } else {
    // DOM ya está listo, exponer de nuevo para asegurar
    exposeEnvFunctions();
  }
  
  // Exponer también después de breves delays para asegurar
  setTimeout(exposeEnvFunctions, 0);
  setTimeout(exposeEnvFunctions, 100);
  setTimeout(exposeEnvFunctions, 500);
  setTimeout(exposeEnvFunctions, 1000);
  
  // Log solo una vez en desarrollo
  if (import.meta.env.DEV) {
    setTimeout(() => {
      if ((window as unknown as Record<string, unknown>).showEnvInfo) {
        console.log('✅ Utilidad de variables de entorno cargada');
        console.log('💡 Usa showEnvInfo() en la consola para ver información');
        console.log('💡 Usa window.env para acceder a todas las variables');
        console.log('💡 Usa getPassword("VITE_XXX") para ver una contraseña específica');
      }
    }, 100);
  }
  
  if ('fonts' in document) {
    void (document as Document & { fonts: { ready: Promise<void>; values: () => Iterable<{ family?: string }> } }).fonts.ready
      .then(() => {
        const loadedFonts = Array.from(
          (document as Document & { fonts: { values: () => Iterable<{ family?: string }> } }).fonts.values()
        );
        console.log(`   ✅ Fuentes cargadas: ${loadedFonts.length}`);
        if (loadedFonts.length > 0) {
          const fontFamilies = loadedFonts.map((font) => (font && typeof font === 'object' && 'family' in font ? (font as { family?: string }).family ?? '' : ''));
          const uniqueFamilies = [...new Set(fontFamilies)];
          console.log('      - ' + uniqueFamilies.join('\n      - '));
        }
      })
      .catch(() => {
        console.warn('   ⚠️ No se pudo verificar el estado de las fuentes.');
      });
  }
}
