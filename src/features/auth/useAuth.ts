// ✅ AUTO-FIX aplicado por Auditoría ComplicesConecta v2.1.2
// Fecha: 2025-01-06

import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  getAppConfig, 
  DEMO_CREDENTIALS, 
  getDemoPassword, 
  handleDemoAuth, 
  clearDemoAuth, 
  isProductionAdmin
} from '@/lib/app-config';
import { StorageManager } from '@/lib/storage-manager';
import { logger } from '@/lib/logger';
import { usePersistedState } from '@/hooks/usePersistedState';
import { setDatadogUser, clearDatadogUser } from '@/config/datadog-rum.config';
import { Database } from '@/types/supabase-remote';

declare global {
  interface Window {
    __demoLoggedOnce?: boolean;
  }
}

type DbProfile = Database['public']['Tables']['profiles']['Row'];

export interface Profile extends Partial<DbProfile> {
  id: string;
  display_name?: string | null;
  email?: string | null;
  role?: string | null;
  profile_type?: string | null;
  is_demo?: boolean | null;
  [key: string]: unknown;
}

interface DemoUserData {
  id?: string;
  email?: string;
  role?: string;
  accountType?: string;
  displayName?: string;
  first_name?: string;
  created_at?: string;
  [key: string]: unknown;
}

type StoredDemoUser = string | DemoUserData | null;

type RawDemoSession = {
  access_token: string;
  expires_at: number;
  refresh_token?: string;
  provider_token?: string | null;
  provider_refresh_token?: string | null;
}

interface DemoAuthResult {
  user: User;
  session: RawDemoSession;
  provider: string;
}

const safelyParseDemoUser = (value: StoredDemoUser): DemoUserData | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as DemoUserData;
    } catch (error) {
      logger.error('❌ Error parseando demo_user persistido', { error });
      return null;
    }
  }
  return value;
};

const mapDemoUserToSupabaseUser = (demoData: DemoUserData): User => {
  const timestamp = new Date().toISOString();
  return {
    id: demoData.id || 'demo-user-1',
    email: demoData.email,
    aud: 'authenticated',
    role: demoData.role || 'user',
    app_metadata: {
      provider: 'demo',
      providers: ['demo']
    },
    user_metadata: {
      first_name: demoData.first_name || 'Demo User',
      role: demoData.role || 'user',
      accountType: demoData.accountType || 'single'
    },
    created_at: demoData.created_at || timestamp,
    updated_at: timestamp,
    email_confirmed_at: timestamp,
    confirmed_at: timestamp,
    last_sign_in_at: timestamp,
    phone: undefined,
    phone_confirmed_at: undefined,
    confirmation_sent_at: timestamp,
    recovery_sent_at: undefined,
    email_change_sent_at: undefined,
    new_email: undefined,
    new_phone: undefined,
    invited_at: undefined,
    action_link: undefined,

    identities: [],
    factors: []
  };
};

const mapDemoSessionToSupabaseSession = (
  demoUser: User,
  sessionData?: RawDemoSession
): Session => {
  const expiresInSeconds = 60 * 60 * 24; // 24h
  const nowSeconds = Math.floor(Date.now() / 1000);
  const rawExpiresAt = sessionData?.expires_at ?? nowSeconds + expiresInSeconds;
  const expiresAtSeconds = rawExpiresAt > 10_000_000_000 ? Math.floor(rawExpiresAt / 1000) : rawExpiresAt;
  return {
    access_token: sessionData?.access_token || `demo-token-${Date.now()}`,
    token_type: 'bearer',
    expires_in: Math.max(expiresAtSeconds - nowSeconds, 60),
    expires_at: expiresAtSeconds,
    refresh_token: sessionData?.refresh_token || `demo-refresh-${Date.now()}`,
    provider_token: sessionData?.provider_token ?? null,
    provider_refresh_token: sessionData?.provider_refresh_token ?? null,
    user: demoUser
  };
};

interface _AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
}

export const useAuth = () => {
  // Migración a usePersistedState para tokens y sesión
  const [_authTokens, _setAuthTokens] = usePersistedState<{
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  }>('auth_tokens', {});
  
  // Usar usePersistedState para demo_user directamente
  const [demoUser, _setDemoUser] = usePersistedState<StoredDemoUser>('demo_user', null);
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const config = getAppConfig();
  const initialized = useRef(false);
  const profileLoaded = useRef(false);

  // Función para cargar perfil
  const loadProfile = useCallback(async (userId: string) => {
    if (profileLoaded.current) {
      logger.info('⚠️ Perfil ya cargado, evitando recarga', { userId });
      return;
    }
    
    // Cache deshabilitado - cargar siempre desde Supabase
    
    // CRÍTICO: Verificar modo demo PRIMERO antes de cargar perfil
    const sessionFlags = StorageManager.getSessionFlags();
    const parsedDemoUser = safelyParseDemoUser(demoUser);
    if (sessionFlags.demo_authenticated && parsedDemoUser) {
      try {
        const demoProfile: Profile = {
          id: parsedDemoUser.id || 'demo-user-1',
          display_name: parsedDemoUser.displayName || parsedDemoUser.first_name || 'Demo User',
          email: parsedDemoUser.email,
          role: parsedDemoUser.role || 'user',
          profile_type: parsedDemoUser.accountType || 'single',
          is_demo: true,
          is_verified: true,
          is_premium: false
        };
        
        logger.info('🎭 Perfil demo cargado en useAuth:', { displayName: demoProfile.display_name });
        setProfile(demoProfile);
        profileLoaded.current = true;
        return;
      } catch (error) {
        logger.error('❌ Error parseando usuario demo en loadProfile:', { error });
      }
    }
    
    // Cache deshabilitado - cargar siempre desde Supabase
    // if (cachedProfile) {
    //   logger.info('✅ Perfil cargado exitosamente', { userId: cachedProfile.id });
    //   setProfile(cachedProfile);
    //   profileLoaded.current = true;
    //   return;
    // }
    
    try {
      logger.info('🔍 Iniciando verificación de autenticación', { userId });
      
      if (!supabase) {
        logger.error('❌ Supabase no está disponible');
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      logger.info('🔍 Consulta ejecutada', { userId });
      logger.info('🔍 Resultado data', { data });
      logger.info('🔍 Error (si existe)', error ? { error: error.message } : undefined);
      
      if (error) {
        logger.error('❌ Error fetching profile:', error);
        // Si no se encuentra el perfil, crear uno básico
        if (error.code === 'PGRST116') {
          logger.info('🆆 Perfil no encontrado - creando perfil básico');
          const basicProfile: Profile = {
            id: userId,
            user_id: userId,
            first_name: 'Usuario',
            role: 'user',
            is_demo: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setProfile(basicProfile);
        }
        return;
      }
      
      if (data) {
        // Manejar tanto array como objeto único
        const profileData: DbProfile = Array.isArray(data) ? data[0] : data;
        
        logger.info('📋 Contenido detallado del perfil', {
          isArray: Array.isArray(data),
          id: profileData?.id,
          firstName: profileData?.first_name,
          lastName: profileData?.last_name,
          displayName: profileData?.full_name || profileData?.name,
          role: profileData?.role,
          email: user?.email,
          fullData: JSON.stringify(data, null, 2)
        });
        
        logger.info('✅ Perfil real cargado', { firstName: profileData?.first_name });
        logger.info('📋 Datos completos del perfil', { profile: profileData });
        profileLoaded.current = true;
        const normalizedProfile: Profile = {
          ...profileData,
          profile_type: profileData.account_type,
          display_name: profileData.full_name || profileData.name,
          email: user?.email ?? null,
          is_demo: false
        };
        setProfile(normalizedProfile);
        
        // PERFIL CARGADO
        logger.info('🔍 Perfil cargado', { id: profileData?.id });
        
        // Actualizar usuario en Datadog RUM
        try {
          setDatadogUser(
            profileData?.id || userId,
            normalizedProfile.email || undefined,
            normalizedProfile.display_name || profileData?.first_name || undefined
          );
        } catch {
          // Silenciar errores de Datadog en desarrollo
        }
      } else {
        logger.info('⚠️ No se encontró perfil para el usuario', { userId });
        setProfile(null);
      }
    } catch (error) {
      logger.error('❌ Error in loadProfile', { error: error instanceof Error ? error.message : String(error) });
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    logger.info('🔗 Configuración de app detectada', { mode: config.mode });
    
    // CRÍTICO: Verificar sesión demo PRIMERO y cargar perfil inmediatamente
    const sessionFlags = StorageManager.getSessionFlags();
    const parsedDemoUser = safelyParseDemoUser(demoUser);
    
    if (sessionFlags.demo_authenticated && parsedDemoUser) {
      logger.info('🎭 Usuario demo detectado', { demoUser: parsedDemoUser });
      // Reset profileLoaded para permitir carga
      profileLoaded.current = false;
      
      // CARGAR PERFIL DEMO INMEDIATAMENTE para evitar user: false
      try {
        const mockUser = mapDemoUserToSupabaseUser(parsedDemoUser);
        setUser(mockUser);
        setLoading(false);
        
        // Cargar perfil demo
        loadProfile(mockUser.id);
        
        logger.info('✅ Usuario demo inicializado:', { email: mockUser.email });
      } catch (error) {
        logger.error('❌ Error inicializando usuario demo:', { error });
        setLoading(false);
      }
      return;
    }
    
    // Solo configurar Supabase si debemos usar conexión real
    if (shouldUseRealSupabase()) {
      logger.info('🔗 Configurando autenticación Supabase real...');
      
      if (!supabase) {
        logger.error('❌ Supabase no está disponible');
        setLoading(false);
        return;
      }
      
      // Obtener sesión actual de Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        }
        setLoading(false);
      });
      
      // DESHABILITAR onAuthStateChange para prevenir logout automático
      logger.info('🚫 onAuthStateChange DESHABILITADO para prevenir auto-logout');
      
      // Solo mantener la sesión inicial, sin escuchar cambios
      const subscription = { unsubscribe: () => {} };
      
      return () => subscription.unsubscribe();
    } else {
      logger.info('🎭 Modo demo - Supabase deshabilitado');
      setLoading(false);
    }
  }, [loadProfile]);

  const signOut = async () => {
    try {
      logger.info('🚪 Cerrando sesión...');
      
      // Verificar si es sesión demo usando StorageManager
      const sessionFlags = StorageManager.getSessionFlags();
      
      if (sessionFlags.demo_authenticated) {
        // Limpiar sesión demo
        clearDemoAuth();
        logger.info('✅ Sesión demo cerrada');
      } else {
        // Cerrar sesión real de Supabase
        logger.info('🔗 Cerrando sesión real de Supabase...');
        if (!supabase) {
          logger.error('❌ Supabase no está disponible');
          return;
        }
        const { error } = await supabase.auth.signOut();
        if (error) {
          logger.info('🔍 Estado de carga de perfil', { loading });
        } else {
          logger.info('✅ Sesión real cerrada');
        }
      }
      
      // Limpiar estado local
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Limpiar usuario en Datadog RUM
      try {
        clearDatadogUser();
      } catch {
        // Silenciar errores de Datadog
      }
    } catch (error) {
      logger.error('❌ Error en signOut', { error });
    }
  };

  const signIn = async (email: string, password: string, accountType: string = 'single') => {
    try {
      setLoading(true);
      logger.info('🔐 Intentando iniciar sesión', { email, mode: config.mode });
      
      // Verificar si es credencial de producción (complicesconectasw@outlook.es)
      if (isProductionAdmin(email)) {
        logger.info('🏢 Credencial de producción detectada - limpiando demo y usando Supabase real');
        
        // IMPORTANTE: Limpiar cualquier sesión demo antes de autenticar producción
        clearDemoAuth();
        
        if (!supabase) {
          logger.error('❌ Supabase no está disponible');
          setLoading(false);
          throw new Error('Supabase no está disponible');
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          setUser(data.user);
          setSession(data.session);
          await loadProfile(data.user.id);
          logger.info('✅ Sesión de producción iniciada', { email });
        }
        
        return data;
      }
      
      // Verificar si es una credencial demo
      if (DEMO_CREDENTIALS.includes(email)) {
        logger.info('🎭 Credencial demo detectada');
        const demoPassword = getDemoPassword(email);
        
        if (password !== demoPassword) {
          throw new Error('Contraseña incorrecta para usuario demo');
        }
        
        // Manejar autenticación demo
        const demoAuth = handleDemoAuth(email, accountType);
        if (demoAuth) {
          const mappedUser = mapDemoUserToSupabaseUser(demoAuth.user as DemoUserData);
          const mappedSession = mapDemoSessionToSupabaseSession(mappedUser, demoAuth.session as RawDemoSession);
          setUser(mappedUser);
          setSession(mappedSession);
          await loadProfile(mappedUser.id);
          logger.info('✅ Sesión demo iniciada', { email });
          return { user: mappedUser, session: mappedSession };
        }
      }
      
      // Intentar con Supabase para usuarios reales (siempre en producción)
      logger.info('🔗 Intentando autenticación real con Supabase', { email });
      
      // Limpiar cualquier sesión demo antes de autenticar
      clearDemoAuth();
      
      if (!supabase) {
        logger.error('❌ Supabase no está disponible');
        setLoading(false);
        throw new Error('Supabase no está disponible');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        logger.error('❌ Error de autenticación Supabase', { error: error.message });
        throw error;
      }
      
      if (data.user) {
        logger.info('✅ Usuario autenticado con Supabase', { email: data.user.email });
        setUser(data.user);
        setSession(data.session);
        await loadProfile(data.user.id);
        logger.info('✅ Sesión real iniciada', { email });
      }
      
      return data;
    } catch (error) {
      logger.error('❌ Error signing in', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar si está autenticado
  const isAuthenticated = () => {
    // Verificar sesión demo usando StorageManager
    const sessionFlags = StorageManager.getSessionFlags();
    const parsedDemoUser = safelyParseDemoUser(demoUser);
    if (sessionFlags.demo_authenticated && parsedDemoUser) {
      logger.info('🎭 Demo admin check:', {
        email: parsedDemoUser?.email,
        accountType: parsedDemoUser?.accountType,
        role: parsedDemoUser?.role,
        isDemoAdmin: parsedDemoUser?.email === 'complicesconectasw@outlook.es' && parsedDemoUser?.role === 'admin'
      });
      return true;
    }
    
    // Verificar sesión real
    return !!(user && session);
  };

  const getProfileType = () => {
    const parsedDemoUser = safelyParseDemoUser(demoUser);
    if (parsedDemoUser) {
      return parsedDemoUser.accountType || 'single';
    }
    return profile?.profile_type || 'single';
  };

  // Función para verificar si un usuario es administrador
  const isAdmin = () => {
    // Demo admin check usando demoUser directo
    const sessionFlags = StorageManager.getSessionFlags();
    const parsedDemoUser = safelyParseDemoUser(demoUser);
    if (sessionFlags.demo_authenticated && parsedDemoUser) {
      const isDemoAdmin = parsedDemoUser.accountType === 'admin' || parsedDemoUser.role === 'admin';
      
      logger.info('🎭 Demo admin check:', {
        email: parsedDemoUser.email,
        accountType: parsedDemoUser.accountType,
        role: parsedDemoUser.role,
        isDemoAdmin
      });
      
      return isDemoAdmin;
    }
    
    // CRÍTICO: Verificar admin basado en EMAIL DE AUTENTICACIÓN, no perfil
    const userEmail = user?.email?.toLowerCase();
    
    // Lista de emails admin - INCLUIR djwacko28@gmail.com
    const adminEmails = [
      'admin',                      // Admin demo solamente
      'complicesconectasw@outlook.es',  // Admin principal
      'djwacko28@gmail.com'        // Admin secundario
    ];
    
    // PRIORIDAD: Email de autenticación determina admin status
    const isAdminByEmail = userEmail && adminEmails.includes(userEmail);
    
    // SECUNDARIO: Role del perfil (solo si email no es admin)
    const profileRole = profile?.role;
    const isAdminByRole = !isAdminByEmail && profileRole === 'admin';
    
    const isAdminReal = isAdminByEmail || isAdminByRole;
    
    if (userEmail) {
      logger.info('🔐 Admin real check:', {
        authEmail: userEmail,
        profileEmail: profile?.email,
        profileRole,
        isAdminByEmail,
        isAdminByRole,
        finalResult: isAdminReal
      });
    }
    
    return isAdminReal;
  };

  const isDemo = () => {
    const sessionFlags = StorageManager.getSessionFlags();
    const parsedDemoUser = safelyParseDemoUser(demoUser);
    const isDemoActive = sessionFlags.demo_authenticated && !!parsedDemoUser;
    
    // Solo log una vez por sesión para evitar spam
    if (isDemoActive && !window.__demoLoggedOnce) {
      logger.info('🎭 Demo mode active', { email: parsedDemoUser?.email, role: parsedDemoUser?.role });
      window.__demoLoggedOnce = true;
    }
    return isDemoActive;
  };

  const shouldUseProductionAdmin = () => {
    const sessionFlags = StorageManager.getSessionFlags();
    const parsedDemoUser = safelyParseDemoUser(demoUser);
    
    // Si es demo admin, usar panel de producción
    if (sessionFlags.demo_authenticated && parsedDemoUser) {
      return parsedDemoUser.accountType === 'admin' || parsedDemoUser.role === 'admin';
    }
    
    // Si es admin real, usar panel de producción
    const userEmail = user?.email?.toLowerCase();
    const isRealAdmin = userEmail === 'complicesconectasw@outlook.es';
    
    logger.info('🏭 shouldUseProductionAdmin check', {
      userEmail,
      isRealAdmin,
      demoAuth: sessionFlags.demo_authenticated
    });
    
    return isRealAdmin;
  };

  const isDemoMode = () => {
    const sessionFlags = StorageManager.getSessionFlags();
    return sessionFlags.demo_authenticated;
  };

  const shouldUseRealSupabase = () => {
    const sessionFlags = StorageManager.getSessionFlags();
    return !sessionFlags.demo_authenticated;
  };

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signOut,
    isAdmin,
    isDemo,
    isAuthenticated,
    getProfileType,
    loadProfile,
    shouldUseProductionAdmin,
    isDemoMode,
    shouldUseRealSupabase,
    appMode: 'production' as const
  };
};