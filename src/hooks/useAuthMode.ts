import { usePersistedState } from '@/hooks/usePersistedState';
import { logger } from '@/lib/logger';

export type AuthMode = 'demo' | 'real';

interface DemoUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  accountType?: 'single' | 'couple';
}

interface UseAuthModeReturn {
  authMode: AuthMode;
  isDemo: boolean;
  isDemoAuthenticated: boolean;
  demoUser: DemoUser | null;
  setDemoAuthenticated: (authenticated: boolean) => void;
  setDemoUser: (user: DemoUser | null) => void;
  clearDemoSession: () => void;
  switchToDemo: () => void;
  switchToReal: () => void;
}

/**
 * Hook centralizado para manejar la lógica de autenticación demo vs real
 * Consolida el acceso a localStorage y proporciona una API limpia
 */
export const useAuthMode = (): UseAuthModeReturn => {
  const [isDemoAuthenticated, setDemoAuthenticated] = usePersistedState<boolean>('demo_authenticated', false);
  const [demoUser, setDemoUser] = usePersistedState<DemoUser | null>('demo_user', null);
  const [authMode, setAuthMode] = usePersistedState<AuthMode>('auth_mode', 'real');

  const isDemo = authMode === 'demo';

  const clearDemoSession = () => {
    logger.info('Limpiando sesión demo');
    setDemoAuthenticated(false);
    setDemoUser(null);
    setAuthMode('real');
  };

  const switchToDemo = () => {
    logger.info('Cambiando a modo demo');
    setAuthMode('demo');
  };

  const switchToReal = () => {
    logger.info('Cambiando a modo real');
    setAuthMode('real');
    // Mantener datos demo pero cambiar modo
  };

  return {
    authMode,
    isDemo,
    isDemoAuthenticated,
    demoUser,
    setDemoAuthenticated,
    setDemoUser,
    clearDemoSession,
    switchToDemo,
    switchToReal,
  };
};
