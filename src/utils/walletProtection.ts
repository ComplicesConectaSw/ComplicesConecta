/**
 * Wallet Extension Protection
 * Prevents conflicts between multiple wallet extensions
 */

export const initializeWalletProtection = () => {
  if (typeof window === 'undefined') return;
  
  // Intercept and prevent wallet extension conflicts
  const originalDefineProperty = Object.defineProperty;
  const originalSetProperty = Object.setPrototypeOf;
  
  // Override Object.defineProperty to prevent wallet conflicts
  Object.defineProperty = function(obj: any, prop: string, descriptor: PropertyDescriptor) {
    const walletProps = ['ethereum', 'solana', 'tronWeb', 'bybitWallet'];
    
    if (walletProps.includes(prop)) {
      // Check if property already exists
      const existing = Object.getOwnPropertyDescriptor(obj, prop);
      if (existing) {
        console.warn(`[WalletProtection] Blocked redefinition of ${prop} - already exists`);
        return obj;
      }
      
      // Check if trying to define on window
      if (obj === window) {
        console.warn(`[WalletProtection] Blocked window.${prop} definition`);
        return obj;
      }
    }
    
    try {
      return originalDefineProperty.call(this, obj, prop, descriptor);
    } catch (error) {
      console.warn(`[WalletProtection] Property definition blocked for ${prop}:`, error);
      return obj;
    }
  };
  
  // Override Object.setPrototypeOf to prevent prototype pollution
  Object.setPrototypeOf = function(obj: any, proto: any) {
    if (obj === window && proto && typeof proto === 'object') {
      console.warn('[WalletProtection] Blocked window prototype modification');
      return obj;
    }
    return originalSetProperty.call(this, obj, proto);
  };
  
  // Freeze critical window properties
  const criticalProps = ['ethereum', 'solana', 'tronWeb', 'bybitWallet'];
  criticalProps.forEach(prop => {
    if (window[prop as keyof Window]) {
      try {
        Object.freeze(window[prop as keyof Window]);
        Object.defineProperty(window, prop, {
          writable: false,
          configurable: false,
          enumerable: true
        });
      } catch (error) {
        // Property might already be frozen
      }
    }
  });
  
  // Global error suppression for wallet-related errors
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    if (message.includes('Cannot redefine property') || 
        message.includes('Cannot assign to read only property') ||
        message.includes('solana') ||
        message.includes('ethereum') ||
        message.includes('tronWeb') ||
        message.includes('bybitWallet')) {
      console.warn('[WalletProtection] Suppressed wallet error:', message);
      return;
    }
    originalConsoleError.apply(console, args);
  };
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
