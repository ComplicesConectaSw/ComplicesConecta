/**
 * Safe Wallet Provider Access Utilities
 * Provides secure access to wallet providers without global redefinitions
 * Integrates with dynamic imports for heavy SDK loading
 */

import { logger } from '@/lib/logger';

// Dynamic imports disponibles para uso futuro
// import { loadWeb3SDK, loadEthersSDK, loadSolanaSDK, loadTronSDK } from './dynamicImports';

// Type definitions for wallet providers
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
  selectedAddress?: string;
}

interface SolanaProvider {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
  publicKey?: { toString: () => string };
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

interface TronProvider {
  defaultAddress?: { base58?: string };
  ready?: boolean;
  request: (args: { method: string; params?: any }) => Promise<any>;
  trx?: {
    sign: (transaction: any) => Promise<any>;
    getAccount: (address?: string) => Promise<any>;
  };
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

interface BybitProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

// Safe provider getters - no global modifications
export const getEthereumProvider = (): EthereumProvider | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const provider = (window as any).ethereum;
    return provider && typeof provider.request === 'function' ? provider : null;
  } catch (error) {
    logger.warn('Error accessing Ethereum provider', { error });
    return null;
  }
};

export const getSolanaProvider = (): SolanaProvider | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const provider = (window as any).solana;
    return provider && (provider.isPhantom || typeof provider.connect === 'function') ? provider : null;
  } catch (error) {
    logger.warn('Error accessing Solana provider', { error });
    return null;
  }
};

export const getTronProvider = (): TronProvider | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const provider = (window as any).tronWeb;
    return provider && (provider.ready || typeof provider.request === 'function') ? provider : null;
  } catch (error) {
    logger.warn('Error accessing Tron provider', { error });
    return null;
  }
};

export const getBybitProvider = (): BybitProvider | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const provider = (window as any).bybitWallet;
    return provider && typeof provider.request === 'function' ? provider : null;
  } catch (error) {
    logger.warn('Error accessing Bybit provider', { error });
    return null;
  }
};

// Wallet detection utilities
export const isWalletInstalled = (walletType: 'ethereum' | 'solana' | 'tron' | 'bybit'): boolean => {
  switch (walletType) {
    case 'ethereum':
      return getEthereumProvider() !== null;
    case 'solana':
      return getSolanaProvider() !== null;
    case 'tron':
      return getTronProvider() !== null;
    case 'bybit':
      return getBybitProvider() !== null;
    default:
      return false;
  }
};

export const getInstalledWallets = (): string[] => {
  const wallets: string[] = [];
  
  if (isWalletInstalled('ethereum')) wallets.push('ethereum');
  if (isWalletInstalled('solana')) wallets.push('solana');
  if (isWalletInstalled('tron')) wallets.push('tron');
  if (isWalletInstalled('bybit')) wallets.push('bybit');
  
  return wallets;
};

// Safe wallet initialization with timeout
export const waitForWallet = async (
  walletType: 'ethereum' | 'solana' | 'tron' | 'bybit',
  timeout: number = 3000
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Wallet ${walletType} not found within ${timeout}ms`));
    }, timeout);

    const checkWallet = () => {
      const provider = (() => {
        switch (walletType) {
          case 'ethereum': return getEthereumProvider();
          case 'solana': return getSolanaProvider();
          case 'tron': return getTronProvider();
          case 'bybit': return getBybitProvider();
          default: return null;
        }
      })();

      if (provider) {
        clearTimeout(timeoutId);
        resolve(provider);
      } else {
        setTimeout(checkWallet, 100);
      }
    };

    checkWallet();
  });
};

// Wallet connection helpers with proper error handling
export const connectEthereumWallet = async (): Promise<string[]> => {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('Ethereum wallet not installed');
  }

  try {
    const accounts = await provider.request({
      method: 'eth_requestAccounts'
    });
    return accounts;
  } catch (error) {
    logger.error('Ethereum connection failed', { error });
    throw error;
  }
};

export const connectSolanaWallet = async (): Promise<string> => {
  const provider = getSolanaProvider();
  if (!provider) {
    throw new Error('Solana wallet not installed');
  }

  try {
    const response = await provider.connect();
    return response.publicKey.toString();
  } catch (error) {
    logger.error('Solana connection failed', { error });
    throw error;
  }
};

export const connectTronWallet = async (): Promise<string> => {
  const provider = getTronProvider();
  if (!provider) {
    throw new Error('Tron wallet not installed');
  }

  try {
    if (provider.defaultAddress?.base58) {
      return provider.defaultAddress.base58;
    }
    
    const account = await provider.request({
      method: 'tron_requestAccounts'
    });
    return account[0];
  } catch (error) {
    logger.error('Tron connection failed', { error });
    throw error;
  }
};

// Network switching utilities
export const switchEthereumNetwork = async (chainId: string): Promise<void> => {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('Ethereum wallet not installed');
  }

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }]
    });
  } catch (error) {
    logger.error('Network switch failed', { error });
    throw error;
  }
};

// Event listener helpers
export const addWalletEventListener = (
  walletType: 'ethereum' | 'solana' | 'tron' | 'bybit',
  event: string,
  handler: (...args: any[]) => void
): (() => void) => {
  const provider = (() => {
    switch (walletType) {
      case 'ethereum': return getEthereumProvider();
      case 'solana': return getSolanaProvider();
      case 'tron': return getTronProvider();
      case 'bybit': return getBybitProvider();
      default: return null;
    }
  })();

  if (!provider || typeof provider.on !== 'function') {
    logger.warn(`Cannot add event listener for ${walletType}: provider not available`);
    return () => {}; // Return no-op cleanup function
  }

  try {
    provider.on(event, handler);
    
    // Return cleanup function
    return () => {
      if (typeof provider.removeListener === 'function') {
        provider.removeListener(event, handler);
      }
    };
  } catch (error) {
    logger.error(`Failed to add event listener for ${walletType}`, { error });
    return () => {};
  }
};
