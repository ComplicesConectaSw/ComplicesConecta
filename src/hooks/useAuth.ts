// ✅ AUTO-FIX aplicado por Auditoría ComplicesConecta v2.1.2
// Fecha: 2025-01-06

import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  getAppConfig, 
  DEMO_CREDENTIALS, 
  getDemoPassword, 
  handleDemoAuth, 
  clearDemoAuth, 
  checkDemoSession,
  isProductionAdmin,
  isDemoMode,
  shouldUseRealSupabase
} from '@/lib/app-config';
import { useProfile } from '@/hooks/useProfileCache';
import { StorageManager } from '@/lib/storage-manager';
import { logger } from '@/lib/logger';
import { usePersistedState } from '@/hooks/usePersistedState';

interface Profile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  age?: number | null;
  role?: string;
  email?: string | null;
  profile_type?: string | null;
  is_demo?: boolean | null;
  is_verified?: boolean | null;
  is_premium?: boolean | null;
  [key: string]: unknown;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const config = getAppConfig();
  const initialized = useRef(false);
  const profileLoaded = useRef(false);

  // Función para cargar perfil
  // Usar React Query para cargar perfil con cache
  const { data: cachedProfile, isLoading: profileLoading, error: profileError } = useProfile(user?.id || null);
  
  const loadProfile = useCallback(async (userId: string) => {
    if (profileLoaded.current) {
      logger.info('⚠️ Perfil ya cargado, evitando recarga', { userId });
      return;
    }
    
    // Si tenemos datos del cache, usarlos directamente
    if (cachedProfile) {
      logger.info('✅ Perfil cargado exitosamente', { firstName: cachedProfile.first_name });
      setProfile(cachedProfile);
      profileLoaded.current = true;
      return;
    }
    
    try {
      logger.info('🔍 Iniciando verificación de autenticación', { isAuthenticated: isAuthenticated() });
      
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
          const basicProfile = {
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
        const profileData = Array.isArray(data) ? data[0] : data;
        
        logger.info('📋 Contenido detallado del perfil', {
          isArray: Array.isArray(data),
          id: (profileData as any)?.id,
          firstName: (profileData as any)?.first_name,
          lastName: (profileData as any)?.last_name,
          displayName: (profileData as any)?.display_name,
          role: (profileData as any)?.role,
          email: (profileData as any)?.email,
          fullData: JSON.stringify(data, null, 2)
        });
        
        logger.info('✅ Perfil real cargado', { firstName: (profileData as any)?.first_name });
        logger.info('📋 Datos completos del perfil', { profile: profileData });
        profileLoaded.current = true;
        setProfile(profileData);
        
        // PERFIL CARGADO - Redirección automática al perfil para usuarios especiales
        logger.info('🔍 Perfil cargado', { id: (profileData as any)?.id });
        
        // Redirección automática al perfil después de cargar datos
        if ((profileData as any)?.first_name === 'Apoyo' && window.location.pathname === '/') {
          logger.info('🔄 Redirigiendo usuario Apoyo al perfil...');
          setTimeout(() => {
            window.location.href = '/profile-single';
          }, 1000);
        } else {
          logger.info('✅ Usuario especial autenticado - usar navegación manual');
        }
      } else {
        logger.info('⚠️ No se encontró perfil para el usuario', { userId });
        setProfile(null);
      }
    } catch (error) {
      logger.error('❌ Error in loadProfile', { error: error instanceof Error ? error.message : String(error) });
      setProfile(null);
    }
  }, [cachedProfile]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    logger.info('🔗 Configuración de app detectada', { mode: config.mode });
    
    // Verificar sesión demo existente al cargar
    // NOTA: checkDemoSession ahora retorna null para forzar recreación
    // Los datos demo ya no se persisten en localStorage
    
    // Migrar datos legacy y verificar sesión usando StorageManager
    StorageManager.migrateToSupabase();
    const sessionFlags = StorageManager.getSessionFlags();
    
    if (sessionFlags.apoyo_authenticated) {
      logger.info('🛡️ Usuario especial detectado - cargando desde Supabase...');
      // Datos se cargan exclusivamente desde Supabase via React Query
      
      // Reset profileLoaded para permitir carga desde Supabase
      profileLoaded.current = false;
    }
    
    // Solo configurar Supabase si debemos usar conexión real
    if (shouldUseRealSupabase()) {
      logger.info('🔗 Configurando autenticación Supabase real...');
      
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
    } catch (error) {
      logger.error('❌ Error en signOut', { error });
    }
  };

  const signIn = async (email: string, password: string, accountType: string = 'single') => {
    try {
      setLoading(true);
      logger.info('🔐 Intentando iniciar sesión', { email, mode: config.mode });
      
      // SOLUCIÓN ESPECIAL para apoyofinancieromexicano@gmail.com
      if (email.toLowerCase() === 'apoyofinancieromexicano@gmail.com') {
        logger.info('🛡️ Usuario especial detectado - usando autenticación personalizada');
        
        if (password !== '123456') {
          throw new Error('Contraseña incorrecta');
        }
        
        // Crear sesión mock persistente
        const mockUser = {
          id: '7c189901-0939-4f28-8d17-4496e0b41492',
          email: 'apoyofinancieromexicano@gmail.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {}
        };
        
        const mockSession = {
          access_token: 'mock-token-apoyo',
          refresh_token: 'mock-refresh-apoyo',
          expires_in: 3600,
          token_type: 'bearer',
          user: mockUser
        };
        
        // Guardar solo flag de autenticación usando StorageManager
        StorageManager.setSessionFlag('apoyo_authenticated', true);
        // ELIMINADO: No almacenar datos de usuario en localStorage
        // Los datos se cargan exclusivamente desde Supabase
        
        setUser(mockUser as any);
        setSession(mockSession as any);
        await loadProfile(mockUser.id);
        logger.info('✅ Sesión personalizada iniciada para usuario especial');
        
        return { user: mockUser, session: mockSession };
      }
      
      // Verificar si es credencial de producción (complicesconectasw@outlook.es)
      if (isProductionAdmin(email)) {
        logger.info('🏢 Credencial de producción detectada - limpiando demo y usando Supabase real');
        
        // IMPORTANTE: Limpiar cualquier sesión demo antes de autenticar producción
        clearDemoAuth();
        
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
          setUser(demoAuth.user as any);
          setSession(demoAuth.session as any);
          await loadProfile(demoAuth.user.id);
          logger.info('✅ Sesión demo iniciada', { email });
          return { user: demoAuth.user, session: demoAuth.session };
        }
      }
      
      // Intentar con Supabase para usuarios reales (siempre en producción)
      logger.info('🔗 Intentando autenticación real con Supabase', { email });
      
      // Limpiar cualquier sesión demo antes de autenticar
      clearDemoAuth();
      
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

  // Función para verificar si un usuario es administrador
  const isAdmin = () => {
    // Demo admin check usando StorageManager
    const sessionFlags = StorageManager.getSessionFlags();
    const demoUser = localStorage.getItem('demo_user'); // TODO: Migrar a Supabase
    
    if (sessionFlags.demo_authenticated && demoUser) {
      try {
        const parsedDemoUser = JSON.parse(demoUser);
        const isDemoAdmin = parsedDemoUser.accountType === 'admin' || parsedDemoUser.role === 'admin';
        
        logger.info('🎭 Demo admin check:', {
          email: parsedDemoUser.email,
          accountType: parsedDemoUser.accountType,
          role: parsedDemoUser.role,
          isDemoAdmin
        });
        
        return isDemoAdmin;
      } catch (error) {
        logger.error('❌ Error parsing demo user', { error: error instanceof Error ? error.message : String(error) });
        return false;
      }
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
    const demoUser = localStorage.getItem('demo_user'); // TODO: Migrar a Supabase
    const isDemoActive = sessionFlags.demo_authenticated && demoUser;
    
    if (isDemoActive) {
      try {
        const parsedUser = JSON.parse(demoUser);
        logger.info('🎭 Demo mode active', { email: parsedUser.email, role: parsedUser.role });
      } catch (error) {
        logger.info('🎭 Demo mode active but invalid user data');
      }
    }
    
    return isDemoActive;
  };

  const getProfileType = () => {
    return profile?.profile_type || profile?.account_type || 'single';
  };

  const isAuthenticated = () => {
    // Verificar sesión demo primero
    const sessionFlags = StorageManager.getSessionFlags();
    const demoUser = localStorage.getItem('demo_user'); // TODO: Migrar a Supabase
    if (sessionFlags.demo_authenticated && demoUser) {
      logger.info('✅ Authenticated via demo session');
      return true;
    }
    
    // Verificar sesión especial de apoyo
    if (sessionFlags.apoyo_authenticated && user) {
      logger.info('✅ Authenticated via special apoyo session');
      return true;
    }
    
    // Verificar autenticación real de Supabase
    const realAuth = !!user && !!session;
    if (realAuth) {
      logger.info('✅ Authenticated via real Supabase session');
      return true;
    }
    
    logger.info('❌ No authentication found', { 
      hasUser: !!user, 
      hasSession: !!session,
      demoAuth: sessionFlags.demo_authenticated,
      apoyoAuth: sessionFlags.apoyo_authenticated
    });
    
    return false;
  };

  const shouldUseProductionAdmin = () => {
    const sessionFlags = StorageManager.getSessionFlags();
    const demoUser = localStorage.getItem('demo_user');
    
    // Si es demo admin, usar panel de producción
    if (sessionFlags.demo_authenticated && demoUser) {
      const user = JSON.parse(demoUser);
      return user.accountType === 'admin' || user.role === 'admin';
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