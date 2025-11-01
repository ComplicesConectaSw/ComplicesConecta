// src/hooks/useUnifiedAuth.ts
// ARCHIVO MOVIDO A RESPALDO - NO USAR EN PRODUCCIÓN
// Fecha: 01 Nov 2025
// Razon: Consolidación de hooks de autenticación

import { useCallback } from 'react';
import { usePersistedState } from '../src/hooks/usePersistedState';
import { logger } from '../src/lib/logger';

export interface DemoUser {
  id: string;
  email: string;
  account_type: 'single' | 'couple';
  first_name: string;
  last_name: string;
  profile?: any;
}

export interface AuthState {
  mode: 'demo' | 'real';
  isAuthenticated: boolean;
  user: DemoUser | null;
  session: any;
}

export interface UseUnifiedAuthReturn {
  authState: AuthState;
  isDemo: boolean;
  isReal: boolean;
  isAuthenticated: boolean;
  user: DemoUser | null;
  session: any;
  
  // Actions
  setAuthMode: (mode: 'demo' | 'real') => void;
  setAuthenticated: (authenticated: boolean) => void;
  setUser: (user: DemoUser | null) => void;
  setSession: (session: any) => void;
  clearAuth: () => void;
  switchToDemo: (user: DemoUser) => void;
  switchToReal: (user: DemoUser, session: any) => void;
}

/**
 * Hook unificado para manejar estados de autenticación demo y real
 * Consolida múltiples estados en uno solo para mayor consistencia
 */
export const useUnifiedAuth = (): UseUnifiedAuthReturn => {
  const [authState, setAuthState] = usePersistedState<AuthState>('unified_auth_state', {
    mode: 'real',
    isAuthenticated: false,
    user: null,
    session: null
  });

  const isDemo = authState.mode === 'demo';
  const isReal = authState.mode === 'real';
  const isAuthenticated = authState.isAuthenticated;
  const user = authState.user;
  const session = authState.session;

  const setAuthMode = useCallback((mode: 'demo' | 'real') => {
    setAuthState(prev => ({ ...prev, mode }));
    logger.info(`🔄 Auth mode changed to: ${mode}`);
  }, [setAuthState]);

  const setAuthenticated = useCallback((authenticated: boolean) => {
    setAuthState(prev => ({ ...prev, isAuthenticated: authenticated }));
    logger.info(`🔐 Authentication status: ${authenticated}`);
  }, [setAuthState]);

  const setUser = useCallback((user: DemoUser | null) => {
    setAuthState(prev => ({ ...prev, user }));
    logger.info(`👤 User set:`, { userId: user?.id, email: user?.email });
  }, [setAuthState]);

  const setSession = useCallback((session: any) => {
    setAuthState(prev => ({ ...prev, session }));
    logger.info(`🔑 Session set:`, { sessionId: session?.access_token?.substring(0, 10) });
  }, [setAuthState]);

  const clearAuth = useCallback(() => {
    setAuthState({
      mode: 'real',
      isAuthenticated: false,
      user: null,
      session: null
    });
    logger.info('🧹 Auth state cleared');
  }, [setAuthState]);

  const switchToDemo = useCallback((user: DemoUser) => {
    setAuthState({
      mode: 'demo',
      isAuthenticated: true,
      user,
      session: null
    });
    logger.info('🎭 Switched to demo mode', { userId: user.id });
  }, [setAuthState]);

  const switchToReal = useCallback((user: DemoUser, session: any) => {
    setAuthState({
      mode: 'real',
      isAuthenticated: true,
      user,
      session
    });
    logger.info('🏢 Switched to real mode', { userId: user.id });
  }, [setAuthState]);

  return {
    authState,
    isDemo,
    isReal,
    isAuthenticated,
    user,
    session,
    setAuthMode,
    setAuthenticated,
    setUser,
    setSession,
    clearAuth,
    switchToDemo,
    switchToReal
  };
};
