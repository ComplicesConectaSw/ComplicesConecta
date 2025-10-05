/**
 * Inicialización segura de wallets Web3 sin redefiniciones globales
 * Previene errores "Cannot redefine property" y pantallas blancas
 */

export interface WalletGlobals {
  ethereum?: any;
  solana?: any;
  tronWeb?: any;
  bybitWallet?: any;
}

/**
 * Inicializa de forma segura las propiedades globales de wallets
 * sin causar conflictos de redefinición
 */
export const safeWalletInit = (): void => {
  try {
    const wallets = ['ethereum', 'solana', 'tronWeb', 'bybitWallet'] as const;

    wallets.forEach(wallet => {
      try {
        // Verificar si la propiedad ya existe
        const descriptor = Object.getOwnPropertyDescriptor(window, wallet);
        
        // Solo definir si no existe o es configurable
        if (!descriptor) {
          Object.defineProperty(window, wallet, {
            value: undefined,
            writable: true,
            configurable: true,
            enumerable: false
          });
        } else if (descriptor.configurable === false) {
          // Si existe pero no es configurable, no intentar redefinir
          console.debug(`[safeWalletInit] ${wallet} ya está definido y protegido`);
        }
      } catch (walletError) {
        // Error específico por wallet, continuar con los demás
        console.debug(`[safeWalletInit] No se pudo inicializar ${wallet}:`, walletError);
      }
    });

    console.info('[safeWalletInit] Wallet globals inicializados correctamente ✅');
  } catch (error) {
    console.warn('[safeWalletInit] Error durante inicialización, continuando:', error);
  }
};

/**
 * Detecta wallets disponibles de forma segura sin redefinir propiedades
 * Reutiliza la lógica de wallets.ts para evitar duplicación
 */
export const detectAvailableWallets = (): WalletGlobals => {
  const detected: WalletGlobals = {};
  
  try {
    // Usar detección más robusta desde wallets.ts
    const { getEthereumProvider, getSolanaProvider, getTronProvider, getBybitProvider } = require('./wallets');
    
    // Detectar usando funciones seguras existentes
    const ethereum = getEthereumProvider();
    if (ethereum) detected.ethereum = ethereum;
    
    const solana = getSolanaProvider();
    if (solana) detected.solana = solana;
    
    const tronWeb = getTronProvider();
    if (tronWeb) detected.tronWeb = tronWeb;
    
    const bybitWallet = getBybitProvider();
    if (bybitWallet) detected.bybitWallet = bybitWallet;
    
    console.info('[safeWalletInit] Wallets detectadas:', Object.keys(detected));
  } catch (error) {
    console.warn('[safeWalletInit] Error detectando wallets:', error);
    
    // Fallback a detección simple si falla la importación
    try {
      if (typeof (window as any).ethereum !== 'undefined') {
        detected.ethereum = (window as any).ethereum;
      }
      if (typeof (window as any).solana !== 'undefined') {
        detected.solana = (window as any).solana;
      }
      if (typeof (window as any).tronWeb !== 'undefined') {
        detected.tronWeb = (window as any).tronWeb;
      }
      if (typeof (window as any).bybitWallet !== 'undefined') {
        detected.bybitWallet = (window as any).bybitWallet;
      }
    } catch (fallbackError) {
      console.warn('[safeWalletInit] Fallback detection failed:', fallbackError);
    }
  }
  
  return detected;
};

/**
 * Inicialización asíncrona no bloqueante para evitar pantallas blancas
 */
export const initWalletsAsync = async (): Promise<WalletGlobals> => {
  return new Promise((resolve) => {
    // Usar setTimeout para no bloquear el render principal
    setTimeout(() => {
      try {
        safeWalletInit();
        const wallets = detectAvailableWallets();
        resolve(wallets);
      } catch (error) {
        console.warn('[safeWalletInit] Error en inicialización asíncrona:', error);
        resolve({});
      }
    }, 0);
  });
};
