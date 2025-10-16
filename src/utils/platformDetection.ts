/**
 * DETECCIÓN DE PLATAFORMA - ComplicesConecta v3.4.0
 * Utilidades para detectar el entorno de ejecución
 * Fecha: 16/10/2025
 */

import React from 'react';

export interface PlatformInfo {
  isAndroid: boolean;
  isIOS: boolean;
  isWeb: boolean;
  isAPK: boolean;
  isCapacitor: boolean;
  isPWA: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  userAgent: string;
}

/**
 * Detecta si la aplicación se está ejecutando desde una APK de Android
 */
export function isRunningFromAPK(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // Detectar Capacitor (usado para APKs)
  if (window.Capacitor) {
    return true;
  }
  
  // Detectar Cordova (usado para APKs)
  if ((window as any).cordova) {
    return true;
  }
  
  // Detectar por User Agent específico de APK
  if (userAgent.includes('complicesconecta') || 
      userAgent.includes('complices-conecta') ||
      userAgent.includes('capacitor') ||
      userAgent.includes('cordova')) {
    return true;
  }
  
  // Detectar por protocolo file:// (APK local)
  if (window.location.protocol === 'file:') {
    return true;
  }
  
  // Detectar por falta de características web específicas
  if (!window.location.origin && window.location.protocol === 'file:') {
    return true;
  }
  
  return false;
}

/**
 * Detecta si es una aplicación web progresiva (PWA)
 */
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Detectar si está instalada como PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Detectar por navigator.standalone (iOS)
  if ((window.navigator as any).standalone) {
    return true;
  }
  
  return false;
}

/**
 * Detecta el tamaño de pantalla basado en breakpoints de Tailwind
 */
export function getScreenSize(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
  if (typeof window === 'undefined') return 'md';
  
  const width = window.innerWidth;
  
  if (width < 475) return 'xs';
  if (width < 640) return 'sm';
  if (width < 768) return 'md';
  if (width < 1024) return 'lg';
  if (width < 1280) return 'xl';
  return '2xl';
}

/**
 * Detecta si es un dispositivo móvil
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const width = window.innerWidth;
  
  // Detectar por User Agent
  const mobileKeywords = ['android', 'iphone', 'ipod', 'blackberry', 'windows phone'];
  const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
  
  // Detectar por tamaño de pantalla
  const isMobileSize = width < 768;
  
  return isMobileUA || isMobileSize;
}

/**
 * Detecta si es una tablet
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const width = window.innerWidth;
  
  // Detectar por User Agent
  const tabletKeywords = ['ipad', 'tablet', 'kindle'];
  const isTabletUA = tabletKeywords.some(keyword => userAgent.includes(keyword));
  
  // Detectar por tamaño de pantalla
  const isTabletSize = width >= 768 && width < 1024;
  
  return isTabletUA || isTabletSize;
}

/**
 * Detecta si es un dispositivo de escritorio
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  
  const width = window.innerWidth;
  return width >= 1024;
}

/**
 * Detecta si es Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('android');
}

/**
 * Detecta si es iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod');
}

/**
 * Detecta si es Capacitor (usado para APKs)
 */
export function isCapacitor(): boolean {
  if (typeof window === 'undefined') return false;
  
  return !!(window as any).Capacitor;
}

/**
 * Obtiene información completa de la plataforma
 */
export function getPlatformInfo(): PlatformInfo {
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  
  return {
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    isWeb: !isRunningFromAPK() && !isPWA(),
    isAPK: isRunningFromAPK(),
    isCapacitor: isCapacitor(),
    isPWA: isPWA(),
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    screenSize: getScreenSize(),
    userAgent
  };
}

/**
 * Hook para usar la detección de plataforma en componentes React
 */
export function usePlatformDetection() {
  const [platformInfo, setPlatformInfo] = React.useState<PlatformInfo>(() => getPlatformInfo());
  
  React.useEffect(() => {
    const updatePlatformInfo = () => {
      setPlatformInfo(getPlatformInfo());
    };
    
    // Actualizar en cambios de tamaño de pantalla
    window.addEventListener('resize', updatePlatformInfo);
    
    // Actualizar en cambios de orientación
    window.addEventListener('orientationchange', updatePlatformInfo);
    
    return () => {
      window.removeEventListener('resize', updatePlatformInfo);
      window.removeEventListener('orientationchange', updatePlatformInfo);
    };
  }, []);
  
  return platformInfo;
}
