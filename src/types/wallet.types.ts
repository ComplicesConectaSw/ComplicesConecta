/**
 * Tipos para Wallet Protection Service
 * Extensiones de Window para propiedades de wallets
 */

/**
 * Interfaz extendida de Window con propiedades de wallets
 */
export interface WindowWithWallets extends Window {
  ethereum?: {
    isMetaMask?: boolean;
    request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on?: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
    [key: string]: unknown;
  };
  solana?: {
    isPhantom?: boolean;
    connect?: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect?: () => Promise<void>;
    [key: string]: unknown;
  };
  tronWeb?: {
    ready?: boolean;
    defaultAddress?: {
      base58?: string;
    };
    [key: string]: unknown;
  };
  bybit?: {
    isBybitWallet?: boolean;
    [key: string]: unknown;
  };
}

/**
 * Tipo helper para verificar si window tiene wallets
 */
export function isWindowWithWallets(window: Window): window is WindowWithWallets {
  return true; // Type guard básico
}

