/**
 * Wallet Protection Service
 * Protege contra conflictos de extensiones de wallet
 */

export class WalletProtectionService {
  private static instance: WalletProtectionService;
  private protectedProperties: Set<string> = new Set();

  static getInstance(): WalletProtectionService {
    if (!WalletProtectionService.instance) {
      WalletProtectionService.instance = new WalletProtectionService();
    }
    return WalletProtectionService.instance;
  }

  constructor() {
    this.initializeProtection();
  }

  private initializeProtection(): void {
    // Proteger propiedades críticas del window object
    this.protectWindowProperties();
    
    // Detectar y manejar conflictos de wallet
    this.detectWalletConflicts();
  }

  private protectWindowProperties(): void {
    const criticalProperties = ['ethereum', 'solana', 'tronWeb', 'bybit'];
    
    criticalProperties.forEach(prop => {
      if (prop in window) {
        this.protectedProperties.add(prop);
        
        // Hacer la propiedad configurable para evitar errores
        try {
          const descriptor = Object.getOwnPropertyDescriptor(window, prop);
          if (descriptor && !descriptor.configurable) {
            Object.defineProperty(window, prop, {
              ...descriptor,
              configurable: true,
              writable: true
            });
          }
        } catch (error) {
          console.warn(`No se pudo proteger la propiedad ${prop}:`, error);
        }
      }
    });
  }

  private detectWalletConflicts(): void {
    // Detectar MetaMask
    if (window.ethereum && window.ethereum.isMetaMask) {
      console.log('🔍 MetaMask detectado');
      this.handleMetaMaskConflicts();
    }

    // Detectar Solana
    if (window.solana) {
      console.log('🔍 Solana detectado');
      this.handleSolanaConflicts();
    }

    // Detectar TronLink
    if (window.tronWeb) {
      console.log('🔍 TronLink detectado');
      this.handleTronLinkConflicts();
    }

    // Detectar Bybit
    if (window.bybit) {
      console.log('🔍 Bybit detectado');
      this.handleBybitConflicts();
    }
  }

  private handleMetaMaskConflicts(): void {
    // Prevenir errores de redefinición de ethereum
    try {
      if (window.ethereum) {
        Object.defineProperty(window, 'ethereum', {
          value: window.ethereum,
          writable: false,
          configurable: true
        });
      }
    } catch (error) {
      console.warn('MetaMask conflict handled:', error);
    }
  }

  private handleSolanaConflicts(): void {
    // Prevenir errores de redefinición de solana
    try {
      if (window.solana) {
        Object.defineProperty(window, 'solana', {
          value: window.solana,
          writable: false,
          configurable: true
        });
      }
    } catch (error) {
      console.warn('Solana conflict handled:', error);
    }
  }

  private handleTronLinkConflicts(): void {
    // Prevenir errores de redefinición de tronWeb
    try {
      if (window.tronWeb) {
        Object.defineProperty(window, 'tronWeb', {
          value: window.tronWeb,
          writable: false,
          configurable: true
        });
      }
    } catch (error) {
      console.warn('TronLink conflict handled:', error);
    }
  }

  private handleBybitConflicts(): void {
    // Prevenir errores de redefinición de bybit
    try {
      if (window.bybit) {
        Object.defineProperty(window, 'bybit', {
          value: window.bybit,
          writable: false,
          configurable: true
        });
      }
    } catch (error) {
      console.warn('Bybit conflict handled:', error);
    }
  }

  // Método público para verificar si hay conflictos
  public hasConflicts(): boolean {
    return this.protectedProperties.size > 0;
  }

  // Método público para obtener lista de wallets detectados
  public getDetectedWallets(): string[] {
    const wallets: string[] = [];
    
    if (window.ethereum && window.ethereum.isMetaMask) wallets.push('MetaMask');
    if (window.solana) wallets.push('Solana');
    if (window.tronWeb) wallets.push('TronLink');
    if (window.bybit) wallets.push('Bybit');
    
    return wallets;
  }

  // Método para limpiar conflictos si es necesario
  public clearConflicts(): void {
    this.protectedProperties.clear();
    console.log('🧹 Conflictos de wallet limpiados');
  }
}

// Inicializar protección automáticamente
if (typeof window !== 'undefined') {
  WalletProtectionService.getInstance();
}

export default WalletProtectionService;
