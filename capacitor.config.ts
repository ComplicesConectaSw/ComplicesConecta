import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.complicesconecta.app',
  appName: 'ComplicesConecta',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a2e'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      androidSplashResourceName: 'splash',
      showSpinner: false
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    // Optimizaciones para componentes animados móviles
    loggingBehavior: 'debug',
    // Mejora el rendimiento de WebView
    appendUserAgent: 'ComplicesConecta/3.3.0',
    // Optimización de colores para tema oscuro
    backgroundColor: '#1a1a2e'
  },
  server: {
    // Optimización para desarrollo con hot reload
    androidScheme: 'https'
  }
};

export default config;
