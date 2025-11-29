/**
 * Platform detection utilities
 * Provides safe platform and browser detection
 */

export type Platform = 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'unknown' | string;
export type Browser = 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown' | string;

/**
 * Detect the current platform (Internal helper)
 */
export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/android/i.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
  if (/windows/i.test(userAgent)) return 'windows';
  if (/macintosh|mac os x/i.test(userAgent)) return 'macos';
  if (/linux/i.test(userAgent)) return 'linux';
  
  return 'unknown';
}

/**
 * Detect the current browser (Internal helper)
 */
export function detectBrowser(): Browser {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) return 'chrome';
  if (/firefox/i.test(userAgent)) return 'firefox';
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'safari';
  if (/edge/i.test(userAgent)) return 'edge';
  if (/opera/i.test(userAgent)) return 'opera';
  
  return 'unknown';
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return detectPlatform() === 'android';
}

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  return detectPlatform() === 'ios';
}

/**
 * Check if PWA installation is supported
 */
export function supportsPWAInstall(): boolean {
  if (typeof window === 'undefined') return false;
  // Check for beforeinstallprompt event support
  return 'onbeforeinstallprompt' in window;
}

/**
 * Check if running in standalone mode (PWA)
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    return (
      (window as any).matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  } catch {
    return false;
  }
}

/**
 * Get platform-specific app store URL
 */
export function getAppStoreUrl(): string | null {
  const platform = detectPlatform();
  
  switch (platform) {
    case 'android':
      return 'https://play.google.com/store/apps/details?id=com.complicesconecta.app';
    case 'ios':
      return 'https://apps.apple.com/app/complicesconecta/id123456789';
    default:
      return null;
  }
}

/**
 * Check if device supports app installation
 */
export function supportsAppInstall(): boolean {
  const platform = detectPlatform();
  return platform === 'android' || platform === 'ios' || supportsPWAInstall();
}

/**
 * Check if running from APK (Android app)
 * UPDATED VERSION: Detects Capacitor, Cordova and File protocol
 */
export const isRunningFromAPK = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Detectar si estamos en un entorno Capacitor/Cordova (típico de APKs híbridas)
  const isCapacitor = (window as any).Capacitor !== undefined;
  const isCordova = (window as any).cordova !== undefined;
  
  // Detectar si la URL es de un archivo local (file://) o localhost con puerto específico de app
  const isLocalFile = window.location.protocol === 'file:';
  
  return isCapacitor || isCordova || isLocalFile;
};

/**
 * Get platform information
 * UPDATED VERSION: Returns detailed display strings
 */
export const getPlatformInfo = () => {
  if (typeof window === 'undefined') {
    return {
      platform: 'Desconocido',
      browser: 'Desconocido',
      isStandalone: false
    };
  }

  const userAgent = navigator.userAgent;
  let platform = 'Escritorio';
  let browser = 'Desconocido';

  // Detectar Plataforma
  if (/Android/i.test(userAgent)) platform = 'Android';
  else if (/iPhone|iPad|iPod/i.test(userAgent)) platform = 'iOS';
  else if (/Windows/i.test(userAgent)) platform = 'Windows';
  else if (/Mac/i.test(userAgent)) platform = 'MacOS';
  else if (/Linux/i.test(userAgent)) platform = 'Linux';

  // Detectar Navegador (Simplificado para visualización)
  if (userAgent.indexOf("Firefox") > -1) browser = "Firefox";
  else if (userAgent.indexOf("SamsungBrowser") > -1) browser = "Samsung Internet";
  else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) browser = "Opera";
  else if (userAgent.indexOf("Trident") > -1) browser = "Internet Explorer";
  else if (userAgent.indexOf("Edge") > -1) browser = "Microsoft Edge";
  else if (userAgent.indexOf("Chrome") > -1) browser = "Google Chrome";
  else if (userAgent.indexOf("Safari") > -1) browser = "Safari";

  // Detectar si está instalado como PWA o App (Usando la lógica existente o inline)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;

  if (isRunningFromAPK()) {
    platform = 'Android (APK)';
  }

  return {
    platform,
    browser,
    isStandalone
  };
};

export default {
  detectPlatform,
  detectBrowser,
  isAndroid,
  isIOS,
  supportsPWAInstall,
  isStandalone,
  getAppStoreUrl,
  supportsAppInstall,
  isRunningFromAPK,
  getPlatformInfo
};