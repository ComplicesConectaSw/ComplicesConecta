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
    if ((window as any).ethereum && (window as any).ethereum.isMetaMask) {
      console.log('🔍 MetaMask detectado');
      this.handleMetaMaskConflicts();
    }

    // Detectar Solana
    if ((window as any).solana) {
      console.log('🔍 Solana detectado');
      this.handleSolanaConflicts();
    }

    // Detectar TronLink
    if ((window as any).tronWeb) {
      console.log('🔍 TronLink detectado');
      this.handleTronLinkConflicts();
    }

    // Detectar Bybit
    if ((window as any).bybit) {
      console.log('🔍 Bybit detectado');
      this.handleBybitConflicts();
    }
  }

  private handleMetaMaskConflicts(): void {
    // Prevenir errores de redefinición de ethereum
    try {
      if ((window as any).ethereum) {
        Object.defineProperty(window, 'ethereum', {
          value: (window as any).ethereum,
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
      if ((window as any).solana) {
        Object.defineProperty(window, 'solana', {
          value: (window as any).solana,
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
      if ((window as any).tronWeb) {
        Object.defineProperty(window, 'tronWeb', {
          value: (window as any).tronWeb,
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
      if ((window as any).bybit) {
        Object.defineProperty(window, 'bybit', {
          value: (window as any).bybit,
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
    
    if ((window as any).ethereum && (window as any).ethereum.isMetaMask) wallets.push('MetaMask');
    if ((window as any).solana) wallets.push('Solana');
    if ((window as any).tronWeb) wallets.push('TronLink');
    if ((window as any).bybit) wallets.push('Bybit');
    
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
