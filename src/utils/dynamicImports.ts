/**
 * Dynamic Import Utilities for Heavy Dependencies
 * Carga dinámica de SDKs pesados solo cuando se necesiten
 * 
 * NOTA: Los SDKs Web3 no están instalados por defecto para reducir bundle size.
 * Se cargan dinámicamente solo si están disponibles en node_modules.
 */

import { logger } from '@/lib/logger';

// Tipos para los SDKs (usamos unknown porque las libs son opcionales y pesadas)
export interface Web3SDK {
  Web3: unknown;
  providers: Record<string, unknown>;
}

export interface EthersSDK {
  ethers: unknown;
  providers: Record<string, unknown>;
  utils: Record<string, unknown>;
}

export interface SolanaSDK {
  Connection: unknown;
  PublicKey: unknown;
  Transaction: unknown;
  SystemProgram: unknown;
}

export interface TronSDK {
  TronWeb: unknown;
  utils: Record<string, unknown>;
}

type SDKCacheValue = Web3SDK | EthersSDK | SolanaSDK | TronSDK | null;

// Cache para evitar múltiples cargas
const sdkCache = new Map<string, SDKCacheValue>();

/**
 * Carga dinámica de Web3.js
 */
export const loadWeb3SDK = async (): Promise<Web3SDK | null> => {
  if (sdkCache.has('web3')) {
    return sdkCache.get('web3') as Web3SDK | null;
  }

  try {
    // Importación dinámica directa (sin eval para evitar problemas con CSP)
    // Módulo opcional: web3 está instalado pero puede no estar disponible en runtime
    const web3Module = await import('web3').catch(() => null);
    if (!web3Module) {
      logger.warn('Web3 SDK no está instalado');
      return null;
    }
    
    const sdk: Web3SDK = {
      Web3: (web3Module as unknown as { default?: unknown; Web3?: unknown }).default ??
        (web3Module as unknown as { Web3?: unknown }).Web3 ??
        null,
      providers: (web3Module as unknown as { providers?: Record<string, unknown> }).providers ?? {}
    };
    
    sdkCache.set('web3', sdk);
    logger.info('Web3 SDK cargado exitosamente');
    return sdk;
  } catch (error) {
    logger.warn('Web3 SDK no disponible', { error });
    return null;
  }
};

/**
 * Carga dinámica de Ethers.js
 */
export const loadEthersSDK = async (): Promise<EthersSDK | null> => {
  if (sdkCache.has('ethers')) {
    return sdkCache.get('ethers') as EthersSDK | null;
  }

  try {
    // Importación dinámica directa (sin eval para evitar problemas con CSP)
    // Módulo opcional: ethers está instalado pero puede no estar disponible en runtime
    const ethersModule = await import('ethers').catch(() => null);
    if (!ethersModule) {
      logger.warn('Ethers SDK no está instalado');
      return null;
    }
    
    // Ethers v6 tiene una estructura diferente - es un namespace, no un objeto con propiedades
    const typedModule = ethersModule as unknown as {
      ethers?: unknown;
      providers?: Record<string, unknown>;
      utils?: Record<string, unknown>;
    };
    const sdk: EthersSDK = {
      ethers: typedModule.ethers ?? ethersModule,
      providers: typedModule.providers ?? {},
      utils: typedModule.utils ?? {}
    };
    
    sdkCache.set('ethers', sdk);
    logger.info('Ethers SDK cargado exitosamente');
    return sdk;
  } catch (error) {
    logger.warn('Ethers SDK no disponible', { error });
    return null;
  }
};

/**
 * Carga dinámica de Solana Web3.js
 */
export const loadSolanaSDK = async (): Promise<SolanaSDK | null> => {
  if (sdkCache.has('solana')) {
    return sdkCache.get('solana') as SolanaSDK | null;
  }

  try {
    // Importación dinámica directa (sin eval para evitar problemas con CSP)
    // Módulo opcional: @solana/web3.js está instalado pero puede no estar disponible en runtime
    const solanaModule = await import('@solana/web3.js').catch(() => null);
    if (!solanaModule) {
      logger.warn('Solana SDK no está instalado');
      return null;
    }
    
    const sdk: SolanaSDK = {
      Connection: (solanaModule as unknown as { Connection: unknown }).Connection,
      PublicKey: (solanaModule as unknown as { PublicKey: unknown }).PublicKey,
      Transaction: (solanaModule as unknown as { Transaction: unknown }).Transaction,
      SystemProgram: (solanaModule as unknown as { SystemProgram: unknown }).SystemProgram
    };
    
    sdkCache.set('solana', sdk);
    logger.info('Solana SDK cargado exitosamente');
    return sdk;
  } catch (error) {
    logger.warn('Solana SDK no disponible', { error });
    return null;
  }
};

/**
 * Carga dinámica de TronWeb
 */
export const loadTronSDK = async (): Promise<TronSDK | null> => {
  if (sdkCache.has('tron')) {
    return sdkCache.get('tron') as TronSDK | null;
  }

  try {
    // Importación dinámica directa (sin eval para evitar problemas con CSP)
    // Módulo opcional: tronweb está instalado pero puede no estar disponible en runtime
    const tronModule = await import('tronweb').catch(() => null);
    if (!tronModule) {
      logger.warn('TronWeb SDK no está instalado');
      return null;
    }
    
    const typedModule = tronModule as unknown as {
      default?: unknown;
      TronWeb?: unknown;
      utils?: Record<string, unknown>;
    };
    const sdk: TronSDK = {
      TronWeb: typedModule.default ?? typedModule.TronWeb ?? null,
      utils: typedModule.utils ?? {}
    };
    
    sdkCache.set('tron', sdk);
    logger.info('Tron SDK cargado exitosamente');
    return sdk;
  } catch (error) {
    logger.warn('Tron SDK no disponible', { error });
    return null;
  }
};

/**
 * Precarga SDKs en background (opcional)
 */
export const preloadCriticalSDKs = async () => {
  // Solo precargar si hay indicios de que se van a usar
  if (typeof window !== 'undefined') {
    type WalletWindow = Window & {
      ethereum?: unknown;
      solana?: unknown;
      tronWeb?: unknown;
    };
    const walletWindow = window as WalletWindow;
    
    // Precargar Web3 si hay wallet Ethereum
    if (walletWindow.ethereum) {
      setTimeout(() => {
        void loadWeb3SDK();
      }, 2000);
    }
    
    // Precargar Solana si hay wallet Solana
    if (walletWindow.solana) {
      setTimeout(() => {
        void loadSolanaSDK();
      }, 2500);
    }
    
    // Precargar Tron si hay wallet Tron
    if (walletWindow.tronWeb) {
      setTimeout(() => {
        void loadTronSDK();
      }, 3000);
    }
  }
};

/**
 * Limpia el cache de SDKs (útil para testing)
 */
export const clearSDKCache = () => {
  sdkCache.clear();
  logger.info('Cache de SDKs limpiado');
};

/**
 * Obtiene información del cache actual
 */
export const getSDKCacheInfo = () => {
  return {
    size: sdkCache.size,
    keys: Array.from(sdkCache.keys()),
    totalMemory: sdkCache.size * 1024 // Estimación aproximada
  };
};
