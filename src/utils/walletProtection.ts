/**
 * Wallet Extension Protection
 * Prevents conflicts between multiple wallet extensions
 */

export const initializeWalletProtection = () => {
  if (typeof window === 'undefined') return;
  
  // Prevent wallet extensions from overriding global objects
  const originalDefineProperty = Object.defineProperty;
  
  Object.defineProperty = function(obj: any, prop: string, descriptor: PropertyDescriptor) {
    // Allow our app to define properties, but prevent wallet conflicts
    if (typeof window !== 'undefined' && (
      prop === 'ethereum' || 
      prop === 'solana' || 
      prop === 'tronWeb' ||
      prop === 'bybitWallet'
    )) {
      // Check if property already exists and is read-only
      const existing = Object.getOwnPropertyDescriptor(obj, prop);
      if (existing && (!existing.writable && !existing.set)) {
        console.warn(`[WalletProtection] Prevented redefinition of read-only property: ${prop}`);
        return obj;
      }
      
      // Check if property is already defined on window
      if (obj === window && window[prop as keyof Window]) {
        console.warn(`[WalletProtection] Property ${prop} already exists on window, skipping redefinition`);
        return obj;
      }
    }
    
    try {
      return originalDefineProperty.call(this, obj, prop, descriptor);
    } catch (error) {
      console.warn(`[WalletProtection] Property definition failed for ${prop}:`, error);
      return obj;
    }
  };
  
  // Additional protection for window properties
  const protectedProps = ['ethereum', 'solana', 'tronWeb', 'bybitWallet'];
  
  protectedProps.forEach(prop => {
    if (window[prop as keyof Window]) {
      try {
        Object.defineProperty(window, prop, {
          value: window[prop as keyof Window],
          writable: false,
          configurable: false
        });
      } catch (error) {
        // Property might already be protected, ignore
      }
    }
  });
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
