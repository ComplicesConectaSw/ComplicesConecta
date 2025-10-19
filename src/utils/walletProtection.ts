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
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Enhanced error suppression
  console.error = function(...args: any[]) {
    const message = args.join(' ').toLowerCase();
    const walletErrors = [
      'cannot redefine property',
      'cannot assign to read only property',
      'solana',
      'ethereum', 
      'tronweb',
      'bybit',
      'metamask',
      'wallet must has at least one account',
      'chainid',
      'provider inject'
    ];
    
    if (walletErrors.some(error => message.includes(error))) {
      console.log('[WalletProtection] Suppressed wallet error:', args[0]);
      return;
    }
    originalConsoleError.apply(console, args);
  };
  
  console.warn = function(...args: any[]) {
    const message = args.join(' ').toLowerCase();
    const walletWarnings = [
      'solana',
      'ethereum',
      'tronweb', 
      'bybit',
      'metamask',
      'wallet',
      'provider'
    ];
    
    if (walletWarnings.some(warning => message.includes(warning))) {
      console.log('[WalletProtection] Suppressed wallet warning:', args[0]);
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
  
  // Override Object.defineProperty with enhanced protection
  Object.defineProperty = function(obj: any, prop: string, descriptor: PropertyDescriptor) {
    const walletProps = ['ethereum', 'solana', 'tronWeb', 'bybitWallet', 'chainId'];
    
    if (walletProps.includes(prop)) {
      // Always block wallet property redefinition
      console.log(`[WalletProtection] Blocked ${prop} redefinition`);
      return obj;
    }
    
    try {
      return originalDefineProperty.call(this, obj, prop, descriptor);
    } catch {
      console.log(`[WalletProtection] Property definition blocked for ${prop}`);
      return obj;
    }
  };
  
  // Override Object.setPrototypeOf
  Object.setPrototypeOf = function(obj: any, proto: any) {
    if (obj === window) {
      console.log('[WalletProtection] Blocked window prototype modification');
      return obj;
    }
    return originalSetProperty.call(this, obj, proto);
  };
  
  // Freeze and protect critical window properties
  const criticalProps = ['ethereum', 'solana', 'tronWeb', 'bybitWallet'];
  criticalProps.forEach(prop => {
    try {
      if (window[prop as keyof Window]) {
        Object.freeze(window[prop as keyof Window]);
        Object.defineProperty(window, prop, {
          writable: false,
          configurable: false,
          enumerable: true
        });
        console.log(`[WalletProtection] Protected window.${prop}`);
      }
    } catch {
      // Property might already be protected
    }
  });
  
  // Global error handler for uncaught errors
  window.addEventListener('error', (event) => {
    const message = event.message?.toLowerCase() || '';
    const walletErrors = [
      'cannot redefine property',
      'cannot assign to read only property',
      'solana',
      'ethereum',
      'tronweb',
      'bybit',
      'metamask'
    ];
    
    if (walletErrors.some(error => message.includes(error))) {
      console.log('[WalletProtection] Suppressed uncaught wallet error:', event.message);
      event.preventDefault();
      return false;
    }
  });
  
  // Promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message?.toLowerCase() || '';
    const walletErrors = [
      'wallet must has at least one account',
      'chainid',
      'provider',
      'solana',
      'ethereum'
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
