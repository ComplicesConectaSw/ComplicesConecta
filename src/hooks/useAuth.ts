// ✅ AUTO-FIX aplicado por Auditoría ComplicesConecta v2.1.2
// Fecha: 2025-01-06

import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { checkDemoSession, clearDemoAuth, handleDemoAuth, isDemoCredential, getDemoPassword, getProductionPassword, isProductionAdmin, isDemoMode, shouldUseRealSupabase, getAppConfig } from '../lib/app-config';

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

  useEffect(() => {
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
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
      
      return () => subscription.unsubscribe();
    } else {
      console.log('🎭 Modo demo - Supabase deshabilitado');
      setLoading(false);
    }
  }, [config.mode]);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Verificar si hay una sesión demo activa
      const demoAuth = localStorage.getItem('demo_authenticated');
      const demoUser = localStorage.getItem('demo_user');
      
      if (demoAuth === 'true' && demoUser) {
        try {
          const parsedDemoUser = JSON.parse(demoUser);
          console.log('🎭 Usando perfil demo:', parsedDemoUser.email);
          
          // Crear perfil demo basado en el usuario
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
            // Datos adicionales para demo
            bio: `Perfil de demostración para ${parsedDemoUser.first_name}`,
            location: 'Ciudad Demo',
            age: parsedDemoUser.role === 'admin' ? null : 25,
            interests: ['Tecnología', 'Música', 'Viajes'],
            avatar_url: null
          };
          
          setProfile(demoProfile);
          return;
        } catch (error) {
          console.error('❌ Error parsing demo user:', error);
          clearDemoAuth();
        }
      }
      
      // Solo usar Supabase si debemos usar conexión real
      if (shouldUseRealSupabase()) {
        console.log('🔗 Obteniendo perfil real de Supabase para:', userId);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('❌ Error fetching profile:', error);
          return;
        }
        
        console.log('✅ Perfil real cargado para usuario:', userId);
        setProfile(data);
      } else {
        console.log('🚫 Supabase bloqueado para usuario demo no-admin');
      }
    } catch (error) {
      console.error('❌ Error in fetchUserProfile:', error);
    }
  };

  const signOut = async () => {
    // Use centralized demo auth clearing
    clearDemoAuth();
    
    // Only attempt Supabase signout if not in demo mode
    const demoAuth = localStorage.getItem('demo_authenticated');
    if (!demoAuth) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    }
    
    // Reset state
    setUser(null);
    setSession(null);
    setLoading(false);
    setProfile(null);
  };

  const signIn = async (email: string, password: string, accountType: string = 'single') => {
    try {
      setLoading(true);
      console.log('🔐 Intentando iniciar sesión:', email, 'Modo:', config.mode);
      
      // Verificar si es credencial de producción (complicesconectasw@outlook.es)
      if (isProductionAdmin(email)) {
        console.log('🏢 Credencial de producción detectada - usando Supabase real');
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
        console.log('🔗 Intentando autenticación real con Supabase...');
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
      
      throw new Error('Credenciales no válidas');
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
        console.log('🎭 Verificando admin demo:', parsedUser.email, 'Es admin:', isAdminDemo);
        return isAdminDemo;
      } catch (error) {
        console.error('❌ Error verificando admin demo:', error);
        return false;
      }
    }
    
    // Verificar admin en perfil real
    const isAdminReal = profile?.role === 'admin' || user?.email === 'djwacko28@gmail.com' || user?.email === 'complicesconectasw@outlook.es';
    if (user?.email) {
      console.log('🔐 Verificando admin real:', user.email, 'Es admin:', isAdminReal);
    }
    return isAdminReal;
  };

  const isDemo = () => {
    const demoAuth = localStorage.getItem('demo_authenticated');
    const isDemoActive = demoAuth === 'true';
    console.log('🎭 Verificando modo demo:', isDemoActive);
    return isDemoActive;
  };

  const getProfileType = () => {
    return profile?.profile_type || 'single';
  };

  const isAuthenticated = () => {
    // Verificar sesión demo primero
    const demoAuth = localStorage.getItem('demo_authenticated');
    const demoUser = localStorage.getItem('demo_user');
    if (demoAuth === 'true' && demoUser) {
      return true;
    }
    
    // Verificar autenticación real
    return !!user;
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
    fetchUserProfile,
    // Nuevas funciones de utilidad
    isDemoMode: isDemoMode,
    shouldUseRealSupabase: shouldUseRealSupabase,
    appMode: config.mode
  };
};