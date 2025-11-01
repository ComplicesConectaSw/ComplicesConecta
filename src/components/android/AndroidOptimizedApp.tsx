import React, { Suspense, useEffect } from 'react';
import { AndroidThemeProvider } from './AndroidThemeProvider';
import { cn } from '@/lib/utils';

interface AndroidOptimizedAppProps {
  children: React.ReactNode;
  className?: string;
}

// Loading component optimizado para Android
const AndroidLoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-android-bg">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-android-primary border-t-transparent rounded-full animate-spin"></div>
      <div className="text-android-text-secondary text-sm">Cargando...</div>
    </div>
  </div>
);

// Error boundary para Android
class AndroidErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Android Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-android-bg p-4">
          <div className="card-android text-center max-w-sm">
            <div className="text-android-error text-4xl mb-4">⚠️</div>
            <h2 className="text-android-text text-lg font-medium mb-2">
              Algo salió mal
            </h2>
            <p className="text-android-text-secondary text-sm mb-4">
              La aplicación encontró un error inesperado. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-android bg-android-primary text-white"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AndroidOptimizedApp: React.FC<AndroidOptimizedAppProps> = ({
  children,
  className
}) => {
  useEffect(() => {
    // Optimizaciones específicas para Android WebView
    const optimizeForAndroid = () => {
      // Prevenir zoom automático
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }

      // Optimizar scrolling
      document.body.style.overscrollBehavior = 'contain';
      (document.body.style as any).webkitOverflowScrolling = 'touch';

      // Detectar si es Android WebView
      const isAndroidWebView = /Android.*wv\)|.*Version.*Chrome/.test(navigator.userAgent);
      if (isAndroidWebView) {
        document.body.classList.add('android-webview');
      }

      // Precargar recursos críticos
      const preloadCriticalResources = () => {
        // Precargar fuentes
        const fontLink = document.createElement('link');
        fontLink.rel = 'preload';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
        fontLink.as = 'style';
        document.head.appendChild(fontLink);

        // Precargar iconos críticos
        const iconLink = document.createElement('link');
        iconLink.rel = 'preload';
        iconLink.href = '/icons/app-icon-192.png';
        iconLink.as = 'image';
        document.head.appendChild(iconLink);
      };

      preloadCriticalResources();
    };

    optimizeForAndroid();

    // Listener para cambios de orientación
    const handleOrientationChange = () => {
      // Forzar reflow después de cambio de orientación
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return (
    <AndroidErrorBoundary>
      <AndroidThemeProvider>
        <div 
          className={cn(
            'android-optimized-app',
            'min-h-screen bg-android-bg text-android-text',
            'font-android transition-colors duration-200',
            className
          )}
        >
          <Suspense fallback={<AndroidLoadingSpinner />}>
            {children}
          </Suspense>
        </div>
      </AndroidThemeProvider>
    </AndroidErrorBoundary>
  );
};

// Hook para detectar características del dispositivo Android
export const useAndroidDevice = () => {
  const [deviceInfo, setDeviceInfo] = React.useState({
    isAndroid: false,
    isWebView: false,
    screenSize: 'medium' as 'small' | 'medium' | 'large',
    orientation: 'portrait' as 'portrait' | 'landscape',
    pixelRatio: 1,
    hasNotch: false
  });

  React.useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent;
      const isAndroid = /Android/i.test(userAgent);
      const isWebView = /wv\)|.*Version.*Chrome/.test(userAgent);
      
      // Detectar tamaño de pantalla
      const width = window.innerWidth;
      let screenSize: 'small' | 'medium' | 'large' = 'medium';
      if (width <= 360) screenSize = 'small';
      else if (width >= 768) screenSize = 'large';
      
      // Detectar orientación
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      
      // Detectar pixel ratio
      const pixelRatio = window.devicePixelRatio || 1;
      
      // Detectar notch (aproximado)
      const hasNotch = window.screen.height / window.screen.width > 2;

      setDeviceInfo({
        isAndroid,
        isWebView,
        screenSize,
        orientation,
        pixelRatio,
        hasNotch
      });
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  return deviceInfo;
};

export default AndroidOptimizedApp;
