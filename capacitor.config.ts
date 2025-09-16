import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.complicesconecta.app',
  appName: 'ComplicesConecta',
  webDir: 'dist',
  server: {
    hostname: '127.0.0.1',
    cleartext: true,
    allowNavigation: ['*']
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    loggingBehavior: 'debug'
  }
};

export default config;
