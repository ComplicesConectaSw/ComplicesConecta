/**
 * Wallet Extension Protection
 * Prevents conflicts between multiple wallet extensions
 */

/**
 * Initialize safe wallet objects to prevent extension conflicts
 */
const initializeSafeWalletObjects = () => {
  if (typeof window === 'undefined') return;
  
  // Only initialize if properties don't already exist
  if (!('ethereum' in window)) {
    try {
      Object.defineProperty(window, 'ethereum', {
        value: null,
        writable: true,
        configurable: true,
        enumerable: false
      });
    } catch (error) {
      console.warn('[WalletProtection] Could not initialize ethereum placeholder:', error);
    }
  }
  
  if (!('solana' in window)) {
    try {
      Object.defineProperty(window, 'solana', {
        value: null,
        writable: true,
        configurable: true,
        enumerable: false
      });
    } catch (error) {
      console.warn('[WalletProtection] Could not initialize solana placeholder:', error);
    }
  }
  
  if (!(window as any).tronWeb) {
    try {
      (window as any).tronWeb = null;
    } catch (error) {
      console.warn('[WalletProtection] Could not initialize tronWeb placeholder:', error);
    }
  }
  
  if (!('bybitWallet' in window)) {
    try {
      Object.defineProperty(window, 'bybitWallet', {
        value: null,
        writable: true,
        configurable: true,
        enumerable: false
      });
    } catch (error) {
      console.warn('[WalletProtection] Could not initialize bybitWallet placeholder:', error);
    }
  }
};

export const initializeWalletProtection = () => {
  if (typeof window === 'undefined') return;
  
  // Prevent wallet extensions from overriding global objects
  const originalDefineProperty = Object.defineProperty;
  
  Object.defineProperty = function(obj: any, prop: string, descriptor: PropertyDescriptor) {
    // Only intercept window object wallet properties
    if (obj === window && (
      prop === 'ethereum' || 
      prop === 'solana' || 
      prop === 'tronWeb' ||
      prop === 'bybitWallet'
    )) {
      // Check if property already exists
      if (prop in window) {
        console.warn(`[WalletProtection] Property '${prop}' already exists, skipping redefinition`);
        return obj;
      }
      
      // Safe property definition with preventive checks
      try {
        const existing = Object.getOwnPropertyDescriptor(obj, prop);
        if (existing && (!existing.writable && !existing.set)) {
          console.warn(`[WalletProtection] Prevented redefinition of read-only property: ${prop}`);
          return obj;
        }
        
        return originalDefineProperty.call(this, obj, prop, {
          ...descriptor,
          configurable: true, // Ensure property can be reconfigured if needed
          enumerable: descriptor.enumerable !== false
        });
      } catch (error) {
        console.warn(`[WalletProtection] Safe fallback for ${prop}:`, error);
        return obj;
      }
    }
    
    // For all other properties, use original behavior
    try {
      return originalDefineProperty.call(this, obj, prop, descriptor);
    } catch (error) {
      console.warn(`[WalletProtection] Property definition failed for ${prop}:`, error);
      return obj;
    }
  };
  
  // Initialize safe wallet objects if they don't exist
  initializeSafeWalletObjects();
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
