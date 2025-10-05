/**
 * Dynamic Import Utilities for Heavy Dependencies
 * Carga dinámica de SDKs pesados solo cuando se necesiten
 * 
 * NOTA: Los SDKs Web3 no están instalados por defecto para reducir bundle size.
 * Se cargan dinámicamente solo si están disponibles en node_modules.
 */

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
    // Importación dinámica condicional usando eval para evitar errores de TypeScript
    const moduleName = 'web3';
    const web3Module = await eval(`import('${moduleName}')`).catch(() => null);
    if (!web3Module) {
      console.warn('[DynamicImports] Web3 SDK no está instalado');
      return null;
    }
    
    const sdk = {
      Web3: web3Module.default || web3Module.Web3,
      providers: web3Module.providers || {}
    };
    
    sdkCache.set('web3', sdk);
    console.log('[DynamicImports] Web3 SDK cargado exitosamente');
    return sdk;
  } catch (error) {
    console.warn('[DynamicImports] Web3 SDK no disponible:', error);
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
    // Importación dinámica condicional usando eval para evitar errores de TypeScript
    const moduleName = 'ethers';
    const ethersModule = await eval(`import('${moduleName}')`).catch(() => null);
    if (!ethersModule) {
      console.warn('[DynamicImports] Ethers SDK no está instalado');
      return null;
    }
    
    const sdk = {
      ethers: ethersModule.ethers || ethersModule,
      providers: ethersModule.providers || {},
      utils: ethersModule.utils || {}
    };
    
    sdkCache.set('ethers', sdk);
    console.log('[DynamicImports] Ethers SDK cargado exitosamente');
    return sdk;
  } catch (error) {
    console.warn('[DynamicImports] Ethers SDK no disponible:', error);
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
    // Importación dinámica condicional usando eval para evitar errores de TypeScript
    const moduleName = '@solana/web3.js';
    const solanaModule = await eval(`import('${moduleName}')`).catch(() => null);
    if (!solanaModule) {
      console.warn('[DynamicImports] Solana SDK no está instalado');
      return null;
    }
    
    const sdk = {
      Connection: solanaModule.Connection,
      PublicKey: solanaModule.PublicKey,
      Transaction: solanaModule.Transaction,
      SystemProgram: solanaModule.SystemProgram
    };
    
    sdkCache.set('solana', sdk);
    console.log('[DynamicImports] Solana SDK cargado exitosamente');
    return sdk;
  } catch (error) {
    console.warn('[DynamicImports] Solana SDK no disponible:', error);
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
    // Importación dinámica condicional usando eval para evitar errores de TypeScript
    const moduleName = 'tronweb';
    const tronModule = await eval(`import('${moduleName}')`).catch(() => null);
    if (!tronModule) {
      console.warn('[DynamicImports] TronWeb SDK no está instalado');
      return null;
    }
    
    const sdk = {
      TronWeb: tronModule.default || tronModule.TronWeb,
      utils: tronModule.utils || {}
    };
    
    sdkCache.set('tron', sdk);
    console.log('[DynamicImports] Tron SDK cargado exitosamente');
    return sdk;
  } catch (error) {
    console.warn('[DynamicImports] Tron SDK no disponible:', error);
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
    const hfModule = await import('@huggingface/transformers');
    sdkCache.set('huggingface', hfModule);
    console.log('[DynamicImports] Hugging Face SDK cargado exitosamente');
    return hfModule;
  } catch (error) {
    console.warn('[DynamicImports] Error cargando Hugging Face SDK:', error);
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
  console.log('[DynamicImports] Cache de SDKs limpiado');
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
