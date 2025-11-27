/**
 * Factory Pattern para seleccionar Provider según contexto
 * Determina automáticamente si usar Demo o Real Provider
 */
import React, { ReactNode, useMemo } from 'react';
import { DemoProvider } from '@/demo/DemoProvider';
import { RealProvider } from '@/demo/RealProvider';
import { logger } from '@/lib/logger';

const safeLogger = logger || {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
};

interface AppFactoryProps {
  children: ReactNode;
  forceMode?: 'demo' | 'production';
}

export const AppFactory: React.FC<AppFactoryProps> = ({ children }) => {
  const isDemoMode = useMemo(() => {
    const mode = import.meta.env.VITE_APP_MODE;
    const isDemo = mode === 'demo' || mode === 'development';
    
    safeLogger.info('AppFactory: Modo detectado', { 
      mode, 
      isDemo,
      env: import.meta.env.MODE 
    });
    
    return isDemo;
  }, []);

  if (isDemoMode) {
    safeLogger.info('AppFactory: Usando DemoProvider');
    return <DemoProvider>{children}</DemoProvider>;
  }

  safeLogger.info('AppFactory: Usando RealProvider');
  return <RealProvider>{children}</RealProvider>;
};

export default AppFactory;
