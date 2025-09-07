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
      
      console.log('✅ Perfil real cargado:', data?.first_name || 'Sin nombre');
      setProfile(data);
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
      
      // Escuchar cambios de autenticación
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('🔄 Auth state change:', _event, session?.user?.id);
        
        // CRÍTICO: Prevenir logout automático después del login
        if (_event === 'SIGNED_OUT' && session === null) {
          console.log('⚠️ SIGNED_OUT detectado - verificando legitimidad');
          
          // Verificar si hay sesión demo activa
          const demoAuth = localStorage.getItem('demo_authenticated');
          if (demoAuth === 'true') {
            console.log('🎭 Sesión demo activa - ignorando SIGNED_OUT de Supabase');
            return;
          }
          
          // Si hay usuario en estado, verificar si es logout legítimo
          if (user && user.id) {
            console.log('🚫 Posible logout espurio - manteniendo sesión:', user.id);
            // Revalidar sesión con Supabase
            supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
              if (currentSession && currentSession.user) {
                console.log('✅ Sesión válida confirmada - restaurando estado');
                setSession(currentSession);
                setUser(currentSession.user);
                return;
              } else {
                console.log('❌ Sesión realmente expirada - procediendo con logout');
              }
            });
            return;
          }
        }
        
        // Solo actualizar estado si no es un evento espurio
        console.log('🔄 Procesando cambio de auth:', _event);
        
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('👤 Usuario detectado en auth change:', session.user.id);
          fetchUserProfile(session.user.id);
        } else {
          console.log('🚫 No hay usuario - limpiando estado');
          setProfile(null);
          currentUserId.current = null;
        }
        setLoading(false);
      });
      
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
        
        if (error) throw error;
        
        if (data.user) {
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

  const isAdmin = () => {
    // Verificar admin en sesión demo
    const demoAuth = localStorage.getItem('demo_authenticated');
    const demoUser = localStorage.getItem('demo_user');
    
    if (demoAuth === 'true' && demoUser) {
      try {
        const parsedUser = JSON.parse(demoUser);
        const isAdminDemo = parsedUser.role === 'admin';
        console.log('🎭 Admin demo check:', parsedUser.email, 'Role:', parsedUser.role, 'Is admin:', isAdminDemo);
        return isAdminDemo;
      } catch (error) {
        console.error('❌ Error verificando admin demo:', error);
        return false;
      }
    }
    
    // Verificar admin en perfil real - usar múltiples fuentes
    const userEmail = user?.email?.toLowerCase();
    const profileRole = profile?.role;
    
    // Lista de emails admin conocidos
    const adminEmails = ['djwacko28@gmail.com', 'complicesconectasw@outlook.es'];
    
    // Verificar por email o por rol en perfil
    const isAdminByEmail = userEmail && adminEmails.includes(userEmail);
    const isAdminByRole = profileRole === 'admin';
    
    const isAdminReal = isAdminByEmail || isAdminByRole;
    
    if (userEmail) {
      console.log('🔐 Admin real check:', {
        email: userEmail,
        profileRole,
        isAdminByEmail,
        isAdminByRole,
        finalResult: isAdminReal
      });
    }
    
    return isAdminReal;
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
    appMode: config.mode
  };
};