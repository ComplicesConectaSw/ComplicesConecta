/**
 * Silenciador de Errores de Wallet
 * 
 * Este script intercepta y suprime errores y advertencias de la consola que son
 * comúnmente generados por extensiones de navegador de carteras de criptomonedas
 * (como MetaMask, Phantom, etc.).
 * 
 * OBJETIVO: Mantener la consola del desarrollador limpia de "ruido" irrelevante
 * que no se origina en el código de la aplicación, facilitando la depuración.
 * 
 * PRECAUCIÓN: Esta es una solución "agresiva". Podría ocultar problemas legítimos
 * si los mensajes de error coinciden con los patrones definidos. Usar con cuidado.
 */
export function suppressWalletErrors() {
  // No ejecutar en entornos de prueba o de servidor
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
    return;
  }

  const patterns = [
    'wallet', 
    'ethereum', 
    'solana', 
    'metamask', 
    'tronweb', 
    'tronlink', 
    'bybit', 
    'cannot redefine', 
    'cannot assign'
  ];

  const originalError = console.error;
  console.error = function(...args) {
    const msg = args.length > 0 ? String(args[0]) : '';
    if (patterns.some(p => msg.toLowerCase().includes(p))) {
      return;
    }
    originalError.apply(console, args);
  };

  const originalWarn = console.warn;
  console.warn = function(...args) {
    const msg = args.length > 0 ? String(args[0]) : '';
    if (patterns.some(p => msg.toLowerCase().includes(p))) {
      return;
    }
    originalWarn.apply(console, args);
  };

  const handleErrorEvent = (e: ErrorEvent) => {
    const msg = String(e.message || '').toLowerCase();
    const stack = String(e.error?.stack || '').toLowerCase();
    if (patterns.some(p => msg.includes(p) || stack.includes(p))) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return false;
    }
  };

  const handleRejectionEvent = (e: PromiseRejectionEvent) => {
    const msg = e.reason instanceof Error ? String(e.reason.message || '').toLowerCase() : '';
    if (patterns.some(p => msg.includes(p))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  };

  window.addEventListener('error', handleErrorEvent, true);
  window.addEventListener('unhandledrejection', handleRejectionEvent, true);
}
