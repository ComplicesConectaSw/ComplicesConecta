/**
 * Inicialización segura de wallets Web3 sin redefiniciones globales
 * Previene errores "Cannot redefine property" y pantallas blancas
 */

import { logger } from '@/lib/logger';

export interface WalletGlobals {
  ethereum?: any;
  solana?: any;
  tronWeb?: any;
  bybitWallet?: any;
}

/**
 * Inicializa de forma segura las propiedades globales de wallets
 * sin causar conflictos de redefinición - POLYFILL PROTECTOR
 */
export const safeWalletInit = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const wallets = ['ethereum', 'solana', 'tronWeb', 'bybitWallet'] as const;

    wallets.forEach(wallet => {
      try {
        // Verificar si la propiedad ya existe
        const descriptor = Object.getOwnPropertyDescriptor(window, wallet);
        
        // POLYFILL PROTECTOR: Solo definir si no existe
        if (!descriptor) {
          Object.defineProperty(window, wallet, {
            value: undefined,
            writable: true,
            configurable: true,
            enumerable: false
          });
          logger.debug(`Polyfill creado para ${wallet}`);
        } else if (descriptor.configurable === false) {
          // Si existe pero no es configurable, no intentar redefinir
          logger.debug(`${wallet} ya está definido y protegido`);
        } else if (descriptor.writable === false) {
          // Si existe pero no es escribible, no intentar modificar
          logger.debug(`${wallet} es read-only, respetando propiedad`);
        }
      } catch (walletError) {
        // Error específico por wallet, continuar con los demás
        logger.debug(`No se pudo inicializar ${wallet}`, { error: walletError });
      }
    });

    logger.info('Wallet globals inicializados correctamente');
  } catch (error) {
    logger.warn('Error durante inicialización, continuando', { error });
  }
};

/**
 * Detecta wallets disponibles de forma segura sin redefinir propiedades
 * Reutiliza la lógica de wallets.ts para evitar duplicación - SSR SAFE
 */
export const detectAvailableWallets = async (): Promise<WalletGlobals> => {
  const detected: WalletGlobals = {};
  
  // SSR Safety Check
  if (typeof window === 'undefined') {
    logger.debug('SSR detected, skipping wallet detection');
    return detected;
  }
  
  try {
    // Usar detección más robusta desde wallets.ts
    const { getEthereumProvider, getSolanaProvider, getTronProvider, getBybitProvider } = await import('./wallets');
    
    // Detectar usando funciones seguras existentes
    const ethereum = getEthereumProvider();
    if (ethereum) detected.ethereum = ethereum;
    
    const solana = getSolanaProvider();
    if (solana) detected.solana = solana;
    
    const tronWeb = getTronProvider();
    if (tronWeb) detected.tronWeb = tronWeb;
    
    const bybitWallet = getBybitProvider();
    if (bybitWallet) detected.bybitWallet = bybitWallet;
    
    logger.info('Wallets detectadas', { wallets: Object.keys(detected) });
  } catch (error) {
    logger.warn('Error detectando wallets', { error });
    
    // Fallback a detección simple si falla la importación
    try {
      // Detección condicional segura para SSR
      const hasEthereum = typeof window !== 'undefined' && typeof (window as Window & { [key: string]: any }).ethereum !== 'undefined';
      const hasSolana = typeof window !== 'undefined' && typeof (window as Window & { [key: string]: any }).solana !== 'undefined';
      const hasTron = typeof window !== 'undefined' && typeof (window as Window & { [key: string]: any }).tronWeb !== 'undefined';
      const hasBybit = typeof window !== 'undefined' && typeof (window as Window & { [key: string]: any }).bybitWallet !== 'undefined';
      
      if (hasEthereum) detected.ethereum = (window as Window & { [key: string]: any }).ethereum;
      if (hasSolana) detected.solana = (window as Window & { [key: string]: any }).solana;
      if (hasTron) detected.tronWeb = (window as Window & { [key: string]: any }).tronWeb;
      if (hasBybit) detected.bybitWallet = (window as Window & { [key: string]: any }).bybitWallet;
      
    } catch (fallbackError) {
      logger.warn('Fallback detection failed', { error: fallbackError });
    }
  }
  
  return detected;
};

/**
 * Inicialización asíncrona no bloqueante para evitar pantallas blancas - SSR SAFE
 */
export const initWalletsAsync = async (): Promise<void> => {
  // SSR Safety Check - no ejecutar en servidor
  if (typeof window === 'undefined') {
    logger.debug('SSR detected, skipping async wallet init');
    return;
  }
  
  // Ejecutar en el próximo tick para no bloquear el render inicial
  await new Promise(resolve => setTimeout(resolve, 0));
  
  try {
    const _detected = await detectAvailableWallets(); // Detectar wallets disponibles
    safeWalletInit(); // Inicializar polyfills seguros
    
    // Importar protección de wallets de forma asíncrona
    await import('./walletProtection');
    console.log('✅ Wallet protection loaded');
    
  } catch (error) {
    logger.warn('Error en inicialización asíncrona', { error });
  }
};
