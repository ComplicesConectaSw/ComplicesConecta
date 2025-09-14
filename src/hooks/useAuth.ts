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
      console.log('⚠️ Perfil ya cargado, evitando recarga:', userId);
      return;
    }
    
    // Si tenemos datos del cache, usarlos directamente
    if (cachedProfile) {
      console.log('✅ Perfil cargado desde cache:', cachedProfile.first_name);
      setProfile(cachedProfile);
      profileLoaded.current = true;
      return;
    }
    
    try {
      console.log('🔍 Cargando perfil para usuario:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('🔍 Consulta ejecutada - userId:', userId);
      console.log('🔍 Resultado data:', data);
      console.log('🔍 Error (si existe):', error);
      
      if (error) {
        console.error('❌ Error fetching profile:', error);
        // Si no se encuentra el perfil, crear uno básico
        if (error.code === 'PGRST116') {
          console.log('🆆 Perfil no encontrado - creando perfil básico');
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
        
        console.log('📋 Contenido detallado del perfil:');
        console.log('  - Es array:', Array.isArray(data));
        console.log('  - id:', profileData?.id);
        console.log('  - first_name:', profileData?.first_name);
        console.log('  - last_name:', profileData?.last_name);
        console.log('  - display_name:', (profileData as any)?.display_name);
        console.log('  - role:', (profileData as any)?.role);
        console.log('  - email:', (profileData as any)?.email);
        console.log('  - Objeto completo:', JSON.stringify(data, null, 2));
        
        console.log('✅ Perfil real cargado:', profileData.first_name);
        console.log('📋 Datos completos del perfil:', profileData);
        profileLoaded.current = true;
        setProfile(profileData);
        
        // PERFIL CARGADO - Redirección automática al perfil para usuarios especiales
        console.log('🔍 Perfil cargado - ID:', profileData?.id);
        
        // Redirección automática al perfil después de cargar datos
        if (profileData?.first_name === 'Apoyo' && window.location.pathname === '/') {
          console.log('🔄 Redirigiendo usuario Apoyo al perfil...');
          setTimeout(() => {
            window.location.href = '/profile-single';
          }, 1000);
        } else {
          console.log('✅ Usuario especial autenticado - usar navegación manual');
        }
      } else {
        console.log('⚠️ No se encontró perfil para el usuario:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('❌ Error in loadProfile:', error);
      setProfile(null);
    }
  }, [cachedProfile]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    console.log('🔄 Inicializando useAuth en modo:', config.mode);
    
    // Verificar sesión demo existente al cargar
    // NOTA: checkDemoSession ahora retorna null para forzar recreación
    // Los datos demo ya no se persisten en localStorage
    
    // Migrar datos legacy y verificar sesión usando StorageManager
    StorageManager.migrateToSupabase();
    const sessionFlags = StorageManager.getSessionFlags();
    
    if (sessionFlags.apoyo_authenticated) {
      console.log('🛡️ Usuario especial detectado - cargando desde Supabase...');
      // Datos se cargan exclusivamente desde Supabase via React Query
      
      // Reset profileLoaded para permitir carga desde Supabase
      profileLoaded.current = false;
    }
    
    // Solo configurar Supabase si debemos usar conexión real
    if (shouldUseRealSupabase()) {
      console.log('🔗 Configurando autenticación Supabase real...');
      
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
      console.log('🚫 onAuthStateChange DESHABILITADO para prevenir auto-logout');
      
      // Solo mantener la sesión inicial, sin escuchar cambios
      const subscription = { unsubscribe: () => {} };
      
      return () => subscription.unsubscribe();
    } else {
      console.log('🎭 Modo demo - Supabase deshabilitado');
      setLoading(false);
    }
  }, [loadProfile]);


  const signOut = async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Verificar si es sesión demo usando StorageManager
      const sessionFlags = StorageManager.getSessionFlags();
      
      if (sessionFlags.demo_authenticated) {
        // Limpiar sesión demo
        clearDemoAuth();
        console.log('✅ Sesión demo cerrada');
      } else {
        // Cerrar sesión real de Supabase
        console.log('🔗 Cerrando sesión real de Supabase...');
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('❌ Error cerrando sesión:', error);
        } else {
          console.log('✅ Sesión real cerrada');
        }
      }
      
      // Limpiar estado local
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('❌ Error en signOut:', error);
    }
  };

  const signIn = async (email: string, password: string, accountType: string = 'single') => {
    try {
      setLoading(true);
      console.log('🔐 Intentando iniciar sesión:', email, 'Modo:', config.mode);
      
      // SOLUCIÓN ESPECIAL para apoyofinancieromexicano@gmail.com
      if (email.toLowerCase() === 'apoyofinancieromexicano@gmail.com') {
        console.log('🛡️ Usuario especial detectado - usando autenticación personalizada');
        
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
        console.log('✅ Sesión personalizada iniciada para usuario especial');
        
        return { user: mockUser, session: mockSession };
      }
      
      // Verificar si es credencial de producción (complicesconectasw@outlook.es)
      if (isProductionAdmin(email)) {
        console.log('🏢 Credencial de producción detectada - limpiando demo y usando Supabase real');
        
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
          console.log('✅ Sesión de producción iniciada para:', email);
        }
        
        return data;
      }
      
      // Verificar si es una credencial demo
      if (DEMO_CREDENTIALS.includes(email)) {
        console.log('🎭 Credencial demo detectada');
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
          console.log('✅ Sesión demo iniciada para:', email);
          return { user: demoAuth.user, session: demoAuth.session };
        }
      }
      
      // En modo producción, intentar con Supabase para otros usuarios
      if (config.mode === 'production') {
        console.log('🔗 Intentando autenticación real con Supabase para:', email);
        
        // Limpiar cualquier sesión demo antes de autenticar
        clearDemoAuth();
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('❌ Error de autenticación Supabase:', error);
          throw error;
        }
        
        if (data.user) {
          console.log('✅ Usuario autenticado con Supabase:', data.user.email);
          setUser(data.user);
          setSession(data.session);
          await loadProfile(data.user.id);
          console.log('✅ Sesión real iniciada para:', email);
        }
        
        return data;
      }
      
      throw new Error('Credenciales no válidas para el modo actual');
    } catch (error) {
      console.error('❌ Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar si un usuario es administrador
  const isAdmin = () => {
    // Demo admin check
    const demoAuth = localStorage.getItem('demo_authenticated');
    const demoUser = localStorage.getItem('demo_user');
    
    if (demoAuth === 'true' && demoUser) {
      try {
        const parsedDemoUser = JSON.parse(demoUser);
        const isDemoAdmin = parsedDemoUser.accountType === 'admin' || parsedDemoUser.role === 'admin';
        
        console.log('🎭 Demo admin check:', {
          email: parsedDemoUser.email,
          accountType: parsedDemoUser.accountType,
          role: parsedDemoUser.role,
          isDemoAdmin
        });
        
        return isDemoAdmin;
      } catch (error) {
        console.error('❌ Error parsing demo user:', error);
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
      console.log('🔐 Admin real check:', {
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

  // Función para determinar si debe usar AdminProduction (datos reales)
  const shouldUseProductionAdmin = () => {
    const demoAuth = localStorage.getItem('demo_authenticated');
    const demoUser = localStorage.getItem('demo_user');
    
    // Si es demo admin, usar panel de producción
    if (demoAuth === 'true' && demoUser) {
      const user = JSON.parse(demoUser);
      return user.accountType === 'admin' || user.role === 'admin';
    }
    
    // Si es admin real (complicesconectasw@outlook.es), usar panel de producción
    const userEmail = user?.email?.toLowerCase();
    const isRealAdmin = userEmail === 'complicesconectasw@outlook.es';
    
    console.log('🏭 shouldUseProductionAdmin check:', {
      userEmail,
      isRealAdmin,
      demoAuth: demoAuth === 'true'
    });
    
    return isRealAdmin;
  };

  const isDemo = () => {
    const demoAuth = localStorage.getItem('demo_authenticated');
    const demoUser = localStorage.getItem('demo_user');
    const isDemoActive = demoAuth === 'true' && demoUser;
    
    if (isDemoActive) {
      try {
        const parsedUser = JSON.parse(demoUser);
        console.log('🎭 Demo mode active for:', parsedUser.email, 'Role:', parsedUser.role);
      } catch (error) {
        console.log('🎭 Demo mode active but invalid user data');
      }
    }
    
    return isDemoActive;
  };

  const getProfileType = () => {
    return profile?.profile_type || profile?.account_type || 'single';
  };

  const isAuthenticated = () => {
    // Verificar sesión demo primero
    const demoAuth = localStorage.getItem('demo_authenticated');
    const demoUser = localStorage.getItem('demo_user');
    if (demoAuth === 'true' && demoUser) {
      console.log('✅ Authenticated via demo session');
      return true;
    }
    
    // Verificar autenticación real
    const realAuth = !!user && !!session;
    if (realAuth) {
      console.log('✅ Authenticated via real Supabase session');
    }
    
    return realAuth;
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
    // Nuevas funciones de utilidad
    isDemoMode: isDemoMode,
    shouldUseRealSupabase: shouldUseRealSupabase,
    shouldUseProductionAdmin,
    appMode: config.mode
  };
};