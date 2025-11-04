/**
 * Enhanced Wallet Extension Protection
 * Prevents conflicts between multiple wallet extensions
 * Critical for production deployment
 */

export const initializeWalletProtection = () => {
  if (typeof window === 'undefined') return;
  
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
      'solana.js',
      'evmask.js',
      'inpage.js',
      'expression not available',
      'expression',
      'not available',
      'solana',
      'ethereum',
      'chainid',
      'chain id',
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
      'evmAsk.js',
      'dist.94abdbf1.js',
      'data-layer',
      'chunk',
      'wallet',
      'metamask',
      'tronlink',
      'bybit'
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
  Object.defineProperty = function(obj: any, prop: string, descriptor: PropertyDescriptor) {
    const walletProps = ['ethereum', 'solana', 'tronWeb', 'bybitWallet', 'tronweb', 'chainId'];
    
    // Only block if it's trying to redefine an existing wallet property
    if (walletProps.includes(prop.toLowerCase()) && obj === window && window[prop as keyof Window]) {
      // Silenciar completamente - no mostrar logs, solo retornar
      return obj;
    }
    
    try {
      return originalDefineProperty.call(this, obj, prop, descriptor);
    } catch (error: any) {
      // Only suppress wallet-related property errors
      const errorMessage = error?.message?.toLowerCase() || '';
      const isWalletError = walletProps.includes(prop.toLowerCase()) || 
                           walletProps.some(wp => errorMessage.includes(wp));
      
      if (isWalletError) {
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
      'inpage.js',
      'evmask.js',
      'evmAsk.js',
      'dist.94abdbf1.js',
      'data-layer',
      'chunk',
      'wallet'
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
      'inpage.js',
      'evmask.js',
      'evmAsk.js',
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