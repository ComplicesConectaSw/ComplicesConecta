/**
 * Wallet Extension Protection - Safe Version
 * Detects wallet conflicts without global modifications
 */

/**
 * Safe wallet detection without modifying global objects
 */
export const initializeWalletProtection = () => {
  if (typeof window === 'undefined') return;
  
  // Simply detect and warn about conflicts without modifying anything
  void detectWalletConflicts();
  
  // Add a single event listener for wallet injection detection
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => void detectWalletConflicts(), 1000);
    });
  } else {
    setTimeout(() => void detectWalletConflicts(), 1000);
  }
};

export const detectWalletConflicts = () => {
  if (typeof window === 'undefined') return [];
  
  const wallets: string[] = [];
  
  try {
    // Reutilizar funciones de detección robustas de wallets.ts
    const { getInstalledWallets } = require('./wallets');
    const installedWallets = getInstalledWallets();
    
    // Mapear nombres técnicos a nombres amigables
    const walletNames = {
      ethereum: 'MetaMask/Ethereum',
      solana: 'Phantom/Solana',
      tron: 'TronLink',
      bybit: 'Bybit Wallet'
    };
    
    installedWallets.forEach((wallet: string) => {
      const friendlyName = walletNames[wallet as keyof typeof walletNames] || wallet;
      wallets.push(friendlyName);
    });
    
  } catch (error) {
    console.warn('[WalletProtection] Error using wallets.ts detection, falling back:', error);
    
    // Fallback a detección simple
    const windowAny = window as any;
    if (windowAny.ethereum) wallets.push('MetaMask/Ethereum');
    if (windowAny.solana) wallets.push('Phantom/Solana');
    if (windowAny.tronWeb) wallets.push('TronLink');
    if (windowAny.bybitWallet) wallets.push('Bybit Wallet');
  }
  
  if (wallets.length > 1) {
    console.warn('[WalletProtection] Multiple wallet extensions detected:', wallets);
    console.warn('[WalletProtection] This may cause conflicts. Consider disabling unused wallets.');
  }
  
  return wallets;
};
