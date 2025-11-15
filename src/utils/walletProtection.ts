
declare global {
  interface Window {
    hasWalletProtection?: boolean;
    [key: string]: any;
  }
}
/**
 * Wallet Protection Script (v2.0.0)
 * 
 * This script provides an aggressive mechanism to silence console errors and unhandled
 * promise rejections that originate from browser wallet extensions (e.g., MetaMask,
 * Phantom, etc.). These extensions often inject scripts that can cause console noise
 * and, in some cases, interfere with application-level error handling.
 *
 * This is based on the documentation found in RELEASE_NOTES_v3.4.1.md.
 *
 * Key features:
 * - Intercepts `error` and `unhandledrejection` events at the earliest possible moment.
 * - Overrides `console.error` and `console.warn` to filter out wallet-related messages.
 * - Identifies wallet errors based on common message patterns, file names, and stack traces.
 * - Prevents further propagation of silenced errors.
 */

(function() {
  if (window.hasWalletProtection) {
    return;
  }

  const WALLET_ERROR_KEYWORDS = [
    // General
    'metamask', 'phantom', 'solana', 'ethereum', 'wallet', 'tronlink', 'bybit',
    // Properties
    'property \'solana\'', 'property \'ethereum\'',
    // Messages
    'non-configurable', 'read-only', 'redefine property',
    'bybit:page provider inject code',
    'TronWeb is already initiated',
  ];

  const isWalletError = (error: any) => {
    if (!error) return false;

    const errorMessage = (error.message || '').toLowerCase();
    const errorStack = (error.stack || '').toLowerCase();
    const errorName = (error.name || '').toLowerCase();

    const combinedText = `${errorMessage} ${errorStack} ${errorName}`;

    return WALLET_ERROR_KEYWORDS.some(keyword => combinedText.includes(keyword));
  };

  const handleError = (event: any) => {
    if (isWalletError(event.error || event.reason)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return true;
    }
    return false;
  };

  // 1. Intercept global errors
  window.addEventListener('error', handleError, true);

  // 2. Intercept unhandled promise rejections
  window.addEventListener('unhandledrejection', handleError, true);

  // 3. Override console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = (...args) => {
    const firstArg = args[0];
    if (typeof firstArg === 'string' && WALLET_ERROR_KEYWORDS.some(keyword => firstArg.toLowerCase().includes(keyword))) {
      return;
    }
    if (firstArg instanceof Error && isWalletError(firstArg)) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args) => {
    const firstArg = args[0];
    if (typeof firstArg === 'string' && WALLET_ERROR_KEYWORDS.some(keyword => firstArg.toLowerCase().includes(keyword))) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
  
  // 4. Attempt to prevent property redefinition (as mentioned in docs)
  // This is a best-effort approach.
  try {
    const protectedProps = ['ethereum', 'solana'];
    protectedProps.forEach(prop => {
      if ((window as any)[prop]) {
        Object.defineProperty(window, prop, {
          writable: false,
          configurable: false,
        });
      }
    });
  } catch {
    // This may fail if extensions have already defined these properties.
    // We swallow this error as part of the protection mechanism.
  }

  window.hasWalletProtection = true;
  console.log('Wallet Protection Activated.');

})();
