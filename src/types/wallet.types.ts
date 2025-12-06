/**
 * Tipos para Wallet Protection Service
 * Extensiones de Window para propiedades de wallets
 */

/**
 * Interfaz con propiedades opcionales de wallets (no extiende Window directamente
 * para evitar conflictos con otras declaraciones globales).
 */
export interface WindowWithWallets {
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
 * Tipo helper para verificar si un objeto Window tiene propiedades de wallets
 */
export function isWindowWithWallets(win: Window | WindowWithWallets): win is Window & WindowWithWallets {
  // Type guard básico: en runtime no forzamos nada, solo ayudamos a TypeScript
  return true;
}

