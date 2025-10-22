/**
 * Enhanced Wallet Extension Protection
 * Prevents conflicts between multiple wallet extensions
 * Critical for production deployment
 */

export const initializeWalletProtection = () => {
  if (typeof window === 'undefined') return;
  
  console.log('[WalletProtection] Initializing enhanced wallet protection...');
  
  // Store original methods
  const originalDefineProperty = Object.defineProperty;
  const originalSetProperty = Object.setPrototypeOf;
  
  // Only suppress wallet-specific errors, not all errors
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Enhanced error suppression - ONLY for wallet conflicts
  console.error = function(...args: any[]) {
    const message = args.join(' ').toLowerCase();
    const walletErrors = [
      'cannot redefine property: ethereum',
      'cannot redefine property: solana',
      'cannot assign to read only property: ethereum',
      'cannot assign to read only property: solana',
      'wallet must has at least one account',
      'metamask encountered an error setting the global ethereum provider',
      'tronweb is already initiated',
      'bybit:page provider inject code'
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
    
    if (walletErrors.some(error => message.includes(error))) {
      console.log('[WalletProtection] Suppressed wallet error:', args[0]);
      return;
    }
    originalConsoleError.apply(console, args);
  };
  
  console.warn = function(...args: any[]) {
    const message = args.join(' ').toLowerCase();
    const walletWarnings = [
      'tronweb is already initiated',
      'bybit:page provider inject code'
    ];
    
    if (walletWarnings.some(warning => message.includes(warning))) {
      console.log('[WalletProtection] Suppressed wallet warning:', args[0]);
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
  
  // Override Object.defineProperty with SELECTIVE protection
  Object.defineProperty = function(obj: any, prop: string, descriptor: PropertyDescriptor) {
    const walletProps = ['ethereum', 'solana', 'tronWeb', 'bybitWallet'];
    
    // Only block if it's trying to redefine an existing wallet property
    if (walletProps.includes(prop) && obj === window && window[prop as keyof Window]) {
      console.log(`[WalletProtection] Blocked ${prop} redefinition`);
      return obj;
    }
    
    try {
      return originalDefineProperty.call(this, obj, prop, descriptor);
    } catch (error) {
      // Only suppress wallet-related property errors
      if (walletProps.includes(prop)) {
        console.log(`[WalletProtection] Property definition blocked for ${prop}`);
        return obj;
      }
      throw error; // Re-throw non-wallet errors
    }
  };
  
  // Override Object.setPrototypeOf - ONLY for window
  Object.setPrototypeOf = function(obj: any, proto: any) {
    if (obj === window) {
      console.log('[WalletProtection] Blocked window prototype modification');
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
        console.log(`[WalletProtection] Protected window.${prop}`);
      }
    } catch {
      // Property might already be protected
    }
  });
  
  // Global error handler for uncaught errors - ONLY wallet-specific
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
      console.log('[WalletProtection] Suppressed uncaught wallet error:', event.message);
      event.preventDefault();
      return false;
    }
  });
  
  // Promise rejection handler - ONLY wallet-specific
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message?.toLowerCase() || '';
    const walletErrors = [
      'wallet must has at least one account',
      'cannot redefine property: ethereum',
      'cannot redefine property: solana'
    ];
    
    if (walletErrors.some(error => message.includes(error))) {
      console.log('[WalletProtection] Suppressed wallet promise rejection:', event.reason);
      event.preventDefault();
    }
  });
  
  console.log('[WalletProtection] Enhanced protection initialized successfully');
};

export const detectWalletConflicts = () => {
  if (typeof window === 'undefined') return [];
  
  const wallets: string[] = [];
  const windowAny = window as any;
  
  if (windowAny.ethereum) wallets.push('MetaMask/Ethereum');
  if (windowAny.solana) wallets.push('Solana');
  if (windowAny.tronWeb) wallets.push('TronLink');
  if (windowAny.bybitWallet) wallets.push('Bybit');
  
  if (wallets.length > 1) {
    console.warn('[WalletProtection] Multiple wallet extensions detected:', wallets);
    console.warn('[WalletProtection] This may cause conflicts. Consider disabling unused wallets.');
  }
  
  return wallets;
};
