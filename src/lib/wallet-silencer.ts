// Silenciador de errores causados por extensiones de wallets (MetaMask, Phantom, etc.)
// Coloca este archivo lo más arriba posible en la cadena de imports para evitar
// "Cannot redefine property" en consola y bloquear crash de UI durante demos.

if (typeof window !== 'undefined') {
  const silenceProperty = (prop: string) => {
    try {
      if (Object.prototype.hasOwnProperty.call(window, prop)) {
        return;
      }
      Object.defineProperty(window, prop, {
        writable: true,
        configurable: true,
        value: undefined,
      });
    } catch (error) {
      // Intencionalmente vacío: Ignorar errores de wallet de manera segura
      // ya que son esperados y manejados por el flujo de la aplicación
    }
  };

  ['ethereum', 'solana', 'tronWeb'].forEach(silenceProperty);

  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = args[0]?.toString() || '';
    if (msg.includes('Cannot redefine property') || msg.includes('Cannot assign to read only')) {
      return;
    }
    originalConsoleError(...args);
  };
}

export {};
