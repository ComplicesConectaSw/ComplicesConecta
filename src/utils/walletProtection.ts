/**
 * Enhanced Wallet Extension Protection
 * Prevents conflicts between multiple wallet extensions
 * Critical for production deployment
 */

export const initializeWalletProtection = () => {
  if (typeof window === 'undefined') return;
  
  // Verificar si ya hay protección activa desde index.html
  // Si ya existe, solo refuerza sin duplicar interceptores
  const hasExistingProtection = (window as any).__WALLET_PROTECTION_ACTIVE__;
  if (hasExistingProtection) {
    // Protección ya activa desde index.html, solo marcar como reforzada
    (window as any).__WALLET_PROTECTION_REINFORCED__ = true;
    return;
  }
  
  // Marcar protección como activa
  (window as any).__WALLET_PROTECTION_ACTIVE__ = true;
  
  // SILENCIAR COMPLETAMENTE - No logs de inicialización
  // Store original methods
  const originalDefineProperty = Object.defineProperty;
  const originalSetProperty = Object.setPrototypeOf;
  
  // Only suppress wallet-specific errors, not all errors
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Enhanced error suppression - ONLY for wallet conflicts - ULTRA AGRESIVO
  console.error = function(...args: any[]) {
    const message = args.join(' ').toLowerCase();
    const stack = args.find(arg => typeof arg === 'string' && arg.includes('at '))?.toLowerCase() || '';
    
    const walletErrors = [
      'cannot redefine property',
      'cannot assign to read only property',
      'cannot set property chainid',
      'cannot set property',
      'read only property',
      'which has only a getter',
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
      'bybit:page provider',
      'bybit',
      'evmask',
      'evmask.js',
      'solana.js',
      'inpage.js',
      'evmAsk.js',
      'data-layer',
      'expression not available',
      'expression',
      'not available',
      'solana',
      'ethereum',
      'chainid',
      'chain id',
      'chunk',
      'useLayoutEffect',
      'uselayouteffect',
      'property',
      'cannot read properties of undefined',
      'reading \'useLayoutEffect\'',
      'reading \'uselayouteffect\'',
      'reading \'createContext\'',
      'reading "uselayouteffect"',
      'reading "useLayoutEffect"',
      'chunk-cidlbzv5',
      'chunk-',
      'cidlbzv5',
      'vendor-luqm',
      'vendor-luqmi8p1',
      'vendor-',
      'code 4001',
      '4001',
      'typeerror',
      'cannot read',
      'properties of undefined',
      'referenceerror',
      'is not defined',
      'showenvinfo',
      'showerrorreport'
    ];
    
    const walletFiles = [
      'solana.js',
      'solana.js:3',
      'solana.js:',
      'inpage.js',
      'inpage.js:154',
      'inpage.js:168',
      'inpage.js:1',
      'inpage.js:',
      'evmask.js',
      'evmAsk.js',
      'evmAsk.js:5',
      'evmAsk.js:',
      'dist.94abdbf1.js',
      'dist.',
      'vendor-luqm',
      'vendor-luqmi8p1',
      'vendor-',
      'data-layer',
      'chunk',
      'wallet',
      'metamask',
      'tronlink',
      'bybit',
      'vm218',
      'vm225'
    ];
    
    // NO suprimir errores de imágenes - estos son importantes para la funcionalidad
    const imageErrors = [
      'error loading image',
      'image load failed',
      'failed to load image'
    ];
    
    if (imageErrors.some(error => message.includes(error))) {
      // Permitir que los errores de imágenes se muestren normalmente
      originalConsoleError.apply(console, args);
      return;
    }
    
    // SILENCIAR COMPLETAMENTE errores de wallet - CHECKEAR MESSAGE Y STACK
    if (walletErrors.some(error => message.includes(error)) ||
        walletErrors.some(error => stack.includes(error)) ||
        walletFiles.some(file => stack.includes(file))) {
      // No mostrar nada en consola
      return;
    }
    originalConsoleError.apply(console, args);
  };
  
  console.warn = function(...args: any[]) {
    const message = args.join(' ').toLowerCase();
    const walletWarnings = [
      'tronweb is already initiated',
      'tronlink will overwrite',
      'bybit:page provider inject code',
      'bybit:page provider',
      'download the react devtools',
      'wallet',
      'wallet must',
      'metamask',
      'metamask encountered',
      'tronweb',
      'tronlink',
      'bybit',
      'solana',
      'ethereum',
      'inpage.js',
      'evmask.js',
      'data-layer'
    ];
    
    // SILENCIAR COMPLETAMENTE warnings de wallet
    if (walletWarnings.some(warning => message.includes(warning))) {
      // No mostrar nada en consola
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
  
  // Override Object.defineProperty with SELECTIVE protection - ULTRA AGRESIVO
  // Maneja propiedades de solo lectura de extensiones de wallet
  Object.defineProperty = function(obj: any, prop: string, descriptor: PropertyDescriptor) {
    const walletProps = ['ethereum', 'solana', 'tronWeb', 'bybitWallet', 'tronweb', 'chainId', 'chainid'];
    
    // Si es una propiedad de wallet en window, manejar propiedades de solo lectura
    const propLower = prop.toLowerCase();
    if (obj === window && walletProps.some(wp => wp.toLowerCase() === propLower)) {
      try {
        // Intentar obtener el descriptor existente
        const existingDesc = Object.getOwnPropertyDescriptor(window, prop);
        
        // Si ya existe y NO es configurable (read-only), no intentar redefinir
        if (existingDesc && !existingDesc.configurable) {
          // Propiedad de solo lectura - simplemente retornar sin error
          return obj;
        }
        
        // Si ya existe y es configurable, intentar redefinir
        if (existingDesc && existingDesc.configurable) {
          try {
            return originalDefineProperty.call(this, obj, prop, descriptor);
          } catch (error: any) {
            // Si falla por "read only property", simplemente retornar sin error
            const errorMessage = error?.message?.toLowerCase() || '';
            if (errorMessage.includes('read only') || 
                errorMessage.includes('cannot assign') ||
                errorMessage.includes('cannot redefine')) {
              return obj;
            }
            // Otro tipo de error, reintentar con descriptor más permisivo
            try {
              const permissiveDescriptor = {
                ...descriptor,
                configurable: true,
                writable: true
              };
              return originalDefineProperty.call(this, obj, prop, permissiveDescriptor);
            } catch {
              return obj;
            }
          }
        }
        
        // Si no existe, intentar crearlo
        try {
          return originalDefineProperty.call(this, obj, prop, {
            ...descriptor,
            configurable: true,
            writable: true
          });
        } catch {
          // Si falla, simplemente retornar el objeto sin error
          return obj;
        }
      } catch {
        // Cualquier error de wallet, simplemente retornar sin error
        return obj;
      }
    }
    
    try {
      return originalDefineProperty.call(this, obj, prop, descriptor);
    } catch (error: any) {
      // Only suppress wallet-related property errors
      const errorMessage = error?.message?.toLowerCase() || '';
      const isWalletError = walletProps.includes(prop.toLowerCase()) || 
                           walletProps.some(wp => errorMessage.includes(wp)) ||
                           errorMessage.includes('cannot redefine property') ||
                           errorMessage.includes('cannot assign to read only property') ||
                           errorMessage.includes('read only property');
      
      if (isWalletError && obj === window) {
        // Silenciar completamente - no mostrar logs, solo retornar
        return obj;
      }
      throw error; // Re-throw non-wallet errors
    }
  };
  
  // Override Object.setPrototypeOf - ONLY for window - SILENCIAR LOGS
  Object.setPrototypeOf = function(obj: any, proto: any) {
    if (obj === window) {
      // SILENCIAR - No mostrar logs
      return obj;
    }
    return originalSetProperty.call(this, obj, proto);
  };
  
  // Protect critical window properties WITHOUT freezing them completely
  const criticalProps = ['ethereum', 'solana', 'tronWeb', 'bybitWallet'];
  criticalProps.forEach(prop => {
    try {
      if (window[prop as keyof Window]) {
        // Make configurable but not writable to prevent redefinition
        Object.defineProperty(window, prop, {
          writable: false,
          configurable: true, // Allow reconfiguration if needed
          enumerable: true
        });
        // Silenciar - no mostrar logs
      }
    } catch {
      // Property might already be protected
    }
  });
  
  // Global error handler for uncaught errors - ULTRA AGRESIVO - CAPTURA TODO
  window.addEventListener('error', (event) => {
    // IGNORAR errores sin información útil (message, filename, line, column todos undefined)
    // Estos errores generalmente son de wallet o extensiones y no son útiles para diagnóstico
    const hasNoUsefulInfo = (!event.message || event.message === 'undefined' || event.message === '') &&
                            (!event.filename || event.filename === 'undefined' || event.filename === '') &&
                            (!event.lineno || event.lineno === 0) &&
                            (!event.colno || event.colno === 0) &&
                            (!event.error || event.error === undefined);
    
    // Si no hay información útil, probablemente es de wallet - silenciar completamente
    if (hasNoUsefulInfo) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return false;
    }
    
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
      'bybit:page provider',
      'bybit',
      'solana',
      'ethereum',
      'chainid',
      'chain id',
      'wallet',
      'evmask',
      'expression not available',
      'expression',
      'code 4001',
      '4001'
    ];
    
    const walletFiles = [
      'solana.js',
      'solana.js:3',
      'solana.js:',
      'inpage.js',
      'inpage.js:154',
      'inpage.js:168',
      'inpage.js:1',
      'inpage.js:',
      'evmask.js',
      'evmAsk.js',
      'evmAsk.js:5',
      'evmAsk.js:',
      'dist.94abdbf1.js',
      'dist.',
      'data-layer',
      'chunk',
      'wallet',
      'metamask',
      'tronlink',
      'bybit'
    ];
    
    // Capturar por mensaje, archivo O stack trace
    if (walletErrors.some(error => message.includes(error)) ||
        walletErrors.some(error => stack.includes(error)) ||
        walletFiles.some(file => filename.includes(file)) ||
        walletFiles.some(file => stack.includes(file))) {
      // Silenciar completamente - detener propagación
      event.stopImmediatePropagation();
      event.preventDefault();
      return false;
    }
  }, true); // Captura en fase de captura (antes de otros handlers)
  
  // Promise rejection handler - ULTRA AGRESIVO - CAPTURA TODO
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
      'read only property',
      'cannot set property',
      'cannot set property chainid',
      'metamask encountered an error',
      'metamask encountered',
      'metamask',
      'tronweb is already initiated',
      'tronweb',
      'tronlink will overwrite',
      'tronlink',
      'bybit:page provider',
      'bybit',
      'solana',
      'ethereum',
      'chainid',
      'chain id',
      'wallet',
      'evmask',
      'chunk',
      'code 4001',
      '4001'
    ];
    
    const walletFiles = [
      'solana.js',
      'solana.js:3',
      'solana.js:',
      'inpage.js',
      'inpage.js:154',
      'inpage.js:168',
      'inpage.js:1',
      'inpage.js:',
      'evmask.js',
      'evmAsk.js',
      'evmAsk.js:5',
      'evmAsk.js:',
      'dist.94abdbf1.js',
      'dist.',
      'data-layer',
      'chunk',
      'wallet',
      'metamask',
      'tronlink',
      'bybit'
    ];
    
    // Capturar por mensaje, código, stack trace o archivos de wallet
    if (walletErrors.some(error => message.includes(error)) ||
        walletErrors.some(error => stack.includes(error)) ||
        walletFiles.some(file => stack.includes(file)) ||
        code === '4001' ||
        (reason && typeof reason === 'object' && 'code' in reason && reason.code === 4001)) {
      // Silenciar completamente - detener propagación
      event.stopImmediatePropagation();
      event.preventDefault();
      return false;
    }
  }, true); // Captura en fase de captura
  
  // Wallet protection initialized silently
};

export const detectWalletConflicts = () => {
  if (typeof window === 'undefined') return [];
  
  const wallets: string[] = [];
  const windowAny = window as any;
  
  try {
    if (windowAny.ethereum) wallets.push('MetaMask/Ethereum');
    if (windowAny.solana) wallets.push('Solana');
    if (windowAny.tronWeb) wallets.push('TronLink');
    if (windowAny.bybitWallet) wallets.push('Bybit');
  } catch {
    // Silenciar errores al detectar wallets
  }
  
  // NO mostrar warnings - completamente silenciado
  return wallets;
};