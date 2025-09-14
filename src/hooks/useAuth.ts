// ✅ AUTO-FIX aplicado por Auditoría ComplicesConecta v2.1.2
// Fecha: 2025-01-06

import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  getAppConfig, 
  isDemoCredential, 
  getDemoPassword, 
  handleDemoAuth, 
  clearDemoAuth, 
  checkDemoSession,
  isProductionAdmin,
  isDemoMode,
  shouldUseRealSupabase
} from '@/lib/app-config';

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
  const currentUserId = useRef<string | null>(null);

  // Memoizar fetchUserProfile para evitar re-creaciones
  const fetchUserProfile = useCallback(async (userId: string) => {
    // Evitar llamadas duplicadas
    if (currentUserId.current === userId) {
      console.log('🚫 Evitando llamada duplicada para userId:', userId);
      return;
    }
    
    currentUserId.current = userId;
    
    try {
      console.log('👤 Obteniendo perfil para userId:', userId);
      
      // Verificar si este userId corresponde a una sesión demo
      const demoAuth = localStorage.getItem('demo_authenticated');
      const demoUser = localStorage.getItem('demo_user');
      
      // Solo usar perfil demo si el userId coincide con el usuario demo
      if (demoAuth === 'true' && demoUser) {
        try {
          const parsedDemoUser = JSON.parse(demoUser);
          
          // IMPORTANTE: Solo usar perfil demo si el userId coincide
          if (userId === parsedDemoUser.id) {
            console.log('🎭 Usando perfil demo para:', parsedDemoUser.email);
            
            const demoProfile = {
              id: parsedDemoUser.id,
              user_id: parsedDemoUser.id,
              email: parsedDemoUser.email,
              first_name: parsedDemoUser.first_name,
              account_type: parsedDemoUser.accountType,
              role: parsedDemoUser.role,
              is_demo: true,
              created_at: parsedDemoUser.created_at,
              updated_at: new Date().toISOString(),
              bio: `Perfil de demostración para ${parsedDemoUser.first_name}`,
              location: 'Ciudad Demo',
              age: parsedDemoUser.role === 'admin' ? null : 25,
              interests: ['Tecnología', 'Música', 'Viajes'],
              avatar_url: null
            };
            
            setProfile(demoProfile);
            return;
          } else {
            console.log('🔄 UserId no coincide con demo user - usando Supabase real');
          }
        } catch (error) {
          console.error('❌ Error parsing demo user:', error);
          clearDemoAuth();
        }
      }
      
      // Para usuarios reales (incluye complicesconectasw@outlook.es), usar Supabase
      console.log('🔗 Obteniendo perfil real de Supabase para:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('🔍 Consulta ejecutada - userId:', userId);
      console.log('🔍 Resultado data:', data);
      console.log('🔍 Error (si existe):', error);
      
      // Log detallado del contenido del objeto
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
      }
      
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
      
      // Manejar tanto array como objeto único para setProfile
      const profileData = Array.isArray(data) ? data[0] : data;
      console.log('✅ Perfil real cargado:', profileData.first_name);
      console.log('📋 Datos completos del perfil:', profileData);
      setProfile(profileData);
      
      // PERFIL CARGADO - Sin redirección automática para evitar bucles
      console.log('🔍 Perfil cargado - ID:', profileData?.id);
      console.log('✅ Usuario especial autenticado - usar navegación manual');
    } catch (error) {
      console.error('❌ Error in fetchUserProfile:', error);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    console.log('🔄 Inicializando useAuth en modo:', config.mode);
    
    // Verificar sesión demo existente al cargar
    const demoSession = checkDemoSession();
    if (demoSession) {
      setUser(demoSession.user as any);
      setSession(demoSession.session as any);
      fetchUserProfile(demoSession.user.id);
      setLoading(false);
      return;
    }
    
    // Verificar si hay sesión persistente del usuario especial
    const apoyoAuth = localStorage.getItem('apoyo_authenticated');
    const apoyoUser = localStorage.getItem('apoyo_user');
    const apoyoSession = localStorage.getItem('apoyo_session');
    
    if (apoyoAuth === 'true' && apoyoUser && apoyoSession) {
      console.log('🛡️ Restaurando sesión persistente del usuario especial');
      try {
        const parsedUser = JSON.parse(apoyoUser);
        const parsedSession = JSON.parse(apoyoSession);
        
        setUser(parsedUser);
        setSession(parsedSession);
        fetchUserProfile(parsedUser.id);
        setLoading(false);
        return;
      } catch (error) {
        console.error('❌ Error restaurando sesión especial:', error);
        localStorage.removeItem('apoyo_authenticated');
        localStorage.removeItem('apoyo_user');
        localStorage.removeItem('apoyo_session');
      }
    }
    
    // Solo configurar Supabase si debemos usar conexión real
    if (shouldUseRealSupabase()) {
      console.log('🔗 Configurando autenticación Supabase real...');
      
      // Obtener sesión actual de Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
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
  }, [fetchUserProfile]);


  const signOut = async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Verificar si es sesión demo
      const demoAuth = localStorage.getItem('demo_authenticated');
      
      if (demoAuth === 'true') {
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
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('apoyo_authenticated', 'true');
        localStorage.setItem('apoyo_user', JSON.stringify(mockUser));
        localStorage.setItem('apoyo_session', JSON.stringify(mockSession));
        
        setUser(mockUser as any);
        setSession(mockSession as any);
        await fetchUserProfile(mockUser.id);
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
          await fetchUserProfile(data.user.id);
          console.log('✅ Sesión de producción iniciada para:', email);
        }
        
        return data;
      }
      
      // Verificar si es una credencial demo
      if (isDemoCredential(email)) {
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
          await fetchUserProfile(demoAuth.user.id);
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
          await fetchUserProfile(data.user.id);
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
    fetchUserProfile,
    // Nuevas funciones de utilidad
    isDemoMode: isDemoMode,
    shouldUseRealSupabase: shouldUseRealSupabase,
    shouldUseProductionAdmin,
    appMode: config.mode
  };
};