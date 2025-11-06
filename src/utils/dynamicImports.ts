/**
 * Dynamic Import Utilities for Heavy Dependencies
 * Carga dinámica de SDKs pesados solo cuando se necesiten
 * 
 * NOTA: Los SDKs Web3 no están instalados por defecto para reducir bundle size.
 * Se cargan dinámicamente solo si están disponibles en node_modules.
 */

import { logger } from '@/lib/logger';

// Tipos para los SDKs
export interface Web3SDK {
  Web3: any;
  providers: any;
}

export interface EthersSDK {
  ethers: any;
  providers: any;
  utils: any;
}

export interface SolanaSDK {
  Connection: any;
  PublicKey: any;
  Transaction: any;
  SystemProgram: any;
}

export interface TronSDK {
  TronWeb: any;
  utils: any;
}

// Cache para evitar múltiples cargas
const sdkCache = new Map<string, any>();

/**
 * Carga dinámica de Web3.js
 */
export const loadWeb3SDK = async (): Promise<Web3SDK | null> => {
  if (sdkCache.has('web3')) {
    return sdkCache.get('web3');
  }

  try {
    // Importación dinámica directa (sin eval para evitar problemas con CSP)
    // Módulo opcional: web3 está instalado pero puede no estar disponible en runtime
    // @ts-ignore - Módulo opcional, TypeScript puede quejarse si no está resuelto
    const web3Module = await import('web3').catch(() => null);
    if (!web3Module) {
      logger.warn('Web3 SDK no está instalado');
      return null;
    }
    
    const sdk = {
      Web3: web3Module.default || web3Module.Web3,
      providers: web3Module.providers || {}
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
    return sdkCache.get('ethers');
  }

  try {
    // Importación dinámica directa (sin eval para evitar problemas con CSP)
    // Módulo opcional: ethers está instalado pero puede no estar disponible en runtime
    // @ts-ignore - Módulo opcional, TypeScript puede quejarse si no está resuelto
    const ethersModule = await import('ethers').catch(() => null);
    if (!ethersModule) {
      logger.warn('Ethers SDK no está instalado');
      return null;
    }
    
    // Ethers v6 tiene una estructura diferente - es un namespace, no un objeto con propiedades
    const sdk = {
      ethers: ethersModule.ethers || ethersModule,
      providers: (ethersModule as any).providers || {},
      utils: (ethersModule as any).utils || {}
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
    return sdkCache.get('solana');
  }

  try {
    // Importación dinámica directa (sin eval para evitar problemas con CSP)
    // Módulo opcional: @solana/web3.js está instalado pero puede no estar disponible en runtime
    // @ts-ignore - Módulo opcional, TypeScript puede quejarse si no está resuelto
    const solanaModule = await import('@solana/web3.js').catch(() => null);
    if (!solanaModule) {
      logger.warn('Solana SDK no está instalado');
      return null;
    }
    
    const sdk = {
      Connection: solanaModule.Connection,
      PublicKey: solanaModule.PublicKey,
      Transaction: solanaModule.Transaction,
      SystemProgram: solanaModule.SystemProgram
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
    return sdkCache.get('tron');
  }

  try {
    // Importación dinámica directa (sin eval para evitar problemas con CSP)
    // Módulo opcional: tronweb está instalado pero puede no estar disponible en runtime
    // @ts-ignore - Módulo opcional, TypeScript puede quejarse si no está resuelto
    const tronModule = await import('tronweb').catch(() => null);
    if (!tronModule) {
      logger.warn('TronWeb SDK no está instalado');
      return null;
    }
    
    const sdk = {
      TronWeb: tronModule.default || tronModule.TronWeb,
      utils: tronModule.utils || {}
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
 * Carga dinámica de Hugging Face Transformers (IA)
 */
export const loadHuggingFaceSDK = async () => {
  if (sdkCache.has('huggingface')) {
    return sdkCache.get('huggingface');
  }

  try {
    // const hfModule = await import('@huggingface/transformers'); // Dependencia eliminada
    logger.warn('Hugging Face SDK no está disponible - dependencia eliminada');
    return null;
  } catch (error) {
    logger.warn('Error cargando Hugging Face SDK', { error });
    return null;
  }
};

/**
 * Precarga SDKs en background (opcional)
 */
export const preloadCriticalSDKs = async () => {
  // Solo precargar si hay indicios de que se van a usar
  if (typeof window !== 'undefined') {
    const windowAny = window as any;
    
    // Precargar Web3 si hay wallet Ethereum
    if (windowAny.ethereum) {
      setTimeout(() => loadWeb3SDK(), 2000);
    }
    
    // Precargar Solana si hay wallet Solana
    if (windowAny.solana) {
      setTimeout(() => loadSolanaSDK(), 2500);
    }
    
    // Precargar Tron si hay wallet Tron
    if (windowAny.tronWeb) {
      setTimeout(() => loadTronSDK(), 3000);
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
