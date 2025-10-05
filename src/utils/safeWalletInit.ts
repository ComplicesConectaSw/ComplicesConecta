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
          console.debug(`[safeWalletInit] Polyfill creado para ${wallet}`);
        } else if (descriptor.configurable === false) {
          // Si existe pero no es configurable, no intentar redefinir
          console.debug(`[safeWalletInit] ${wallet} ya está definido y protegido`);
        } else if (descriptor.writable === false) {
          // Si existe pero no es escribible, no intentar modificar
          console.debug(`[safeWalletInit] ${wallet} es read-only, respetando propiedad`);
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
 * Reutiliza la lógica de wallets.ts para evitar duplicación - SSR SAFE
 */
export const detectAvailableWallets = (): WalletGlobals => {
  const detected: WalletGlobals = {};
  
  // SSR Safety Check
  if (typeof window === 'undefined') {
    console.debug('[safeWalletInit] SSR detected, skipping wallet detection');
    return detected;
  }
  
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
      // Detección condicional segura para SSR
      const hasEthereum = typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
      const hasSolana = typeof window !== 'undefined' && typeof (window as any).solana !== 'undefined';
      const hasTron = typeof window !== 'undefined' && typeof (window as any).tronWeb !== 'undefined';
      const hasBybit = typeof window !== 'undefined' && typeof (window as any).bybitWallet !== 'undefined';
      
      if (hasEthereum) detected.ethereum = (window as any).ethereum;
      if (hasSolana) detected.solana = (window as any).solana;
      if (hasTron) detected.tronWeb = (window as any).tronWeb;
      if (hasBybit) detected.bybitWallet = (window as any).bybitWallet;
      
    } catch (fallbackError) {
      console.warn('[safeWalletInit] Fallback detection failed:', fallbackError);
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
    console.debug('[safeWalletInit] SSR detected, skipping async wallet init');
    return;
  }
  
  // Ejecutar en el próximo tick para no bloquear el render inicial
  await new Promise(resolve => setTimeout(resolve, 0));
  
  try {
    const _detected = detectAvailableWallets(); // Detectar wallets disponibles
    safeWalletInit(); // Inicializar polyfills seguros
    
    // Importar y ejecutar protección de wallets de forma asíncrona
    const { detectWalletConflicts } = await import('./walletProtection');
    await detectWalletConflicts();
    
  } catch (error) {
    console.warn('[safeWalletInit] Error en inicialización asíncrona:', error);
  }
};
