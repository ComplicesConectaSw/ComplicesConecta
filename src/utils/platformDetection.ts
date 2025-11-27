/**
 * Platform detection utilities
 * Provides safe platform and browser detection
 */

export type Platform = 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'unknown';
export type Browser = 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown';

/**
 * Detect the current platform
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
 * Detect the current browser
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
 */
export function isRunningFromAPK(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if running in WebView or standalone app
  return (
    isAndroid() && 
    (isStandalone() || (window.navigator as any).standalone === true)
  );
}

/**
 * Get platform information
 */
export function getPlatformInfo(): {
  platform: Platform;
  browser: Browser;
  isStandalone: boolean;
  supportsInstall: boolean;
  appStoreUrl: string | null;
} {
  return {
    platform: detectPlatform(),
    browser: detectBrowser(),
    isStandalone: isStandalone(),
    supportsInstall: supportsAppInstall(),
    appStoreUrl: getAppStoreUrl()
  };
}

export default {
  detectPlatform,
  detectBrowser,
  isAndroid,
  isIOS,
  supportsPWAInstall,
  isStandalone,
  getAppStoreUrl,
  supportsAppInstall
};
