// ✅ AUTO-FIX aplicado por Auditoría ComplicesConecta v2.1.2
// Fecha: 2025-01-06

import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { handleDemoAuth, clearDemoAuth, checkDemoSession } from '@/lib/app-config';

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
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    profile: null
  });

  useEffect(() => {
    // Check for demo session using centralized function
    const demoSessionData = checkDemoSession();
    if (demoSessionData) {
      setState({
        user: demoSessionData.user,
        session: { user: demoSessionData.user } as Session,
        loading: false,
        profile: { id: demoSessionData.user.id, role: demoSessionData.user.role }
      });
      return;
    }

    // Set up auth state listener FIRST
    const authListener = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email);
        
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false
        }));

        // Fetch profile data when user signs in
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setState(prev => ({ ...prev, profile: null }));
        }

        // Handle automatic logout
        if (event === 'SIGNED_OUT' && session === null) {
          console.log('🚪 Usuario deslogueado automáticamente');
          // Clear any remaining demo data
          localStorage.removeItem('demo_user');
          localStorage.removeItem('demo_session');
          localStorage.removeItem('userType');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession()?.then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        user: session?.user || null,
        session,
        loading: false
      }));
    }).catch(() => {
      setState(prev => ({
        ...prev,
        loading: false
      }));
    });

    if (state.session?.user) {
      fetchUserProfile(state.session.user.id);
    }

    return () => {
      if (authListener?.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    // Skip profile fetch for demo users
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      try {
        const user = JSON.parse(demoUser);
        setState(prev => ({ ...prev, profile: { id: user.id, role: user.role } }));
        return;
      } catch (error) {
        console.error('Error parsing demo user:', error);
      }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setState(prev => ({ ...prev, profile: data }));
    } catch (error) {
      console.error('Error fetching profile:', error);
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
    setState({
      user: null,
      session: null,
      loading: false,
      profile: null
    });
  };

  const isAdmin = () => {
    // Verificar rol en perfil (después de migración)
    return state.profile?.role === 'admin';
  };

  const isDemo = () => {
    return state.profile?.is_demo === true;
  };

  const getProfileType = () => {
    return state.profile?.profile_type || 'single';
  };

  const isAuthenticated = () => {
    return !!state.user;
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      console.info(`🔐 Iniciando sesión para: ${email}`);

      // Check for demo session first
      const demoSession = checkDemoSession();
      if (demoSession) {
        console.info(`🎭 Sesión demo activada para: ${email}`);
        setState({
          user: demoSession.user as any,
          session: { user: demoSession.user } as any,
          loading: false,
          profile: { id: demoSession.user.id, role: demoSession.user.role, is_demo: true }
        });
        return { user: demoSession.user, session: demoSession };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error(`❌ Error en signIn para ${email}:`, error.message);
        throw error;
      }

      console.info(`✅ Sesión iniciada exitosamente para: ${email}`);
      setState({
        user: data.user,
        session: data.session,
        loading: false,
        profile: null
      });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error signing in';
      console.error(errorMessage);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  };

  const setDemoSession = (userType: string, userData: any) => {
    // Use centralized demo auth handling
    const demoSession = handleDemoAuth(userData.email);
    if (demoSession) {
      setState({
        user: demoSession.user as any,
        session: { user: demoSession.user } as any,
        loading: false,
        profile: { id: demoSession.user.id, role: demoSession.user.role, is_demo: true }
      });
    }
  };

  const isDemoSession = () => {
    return !!localStorage.getItem('demo_user') && !!localStorage.getItem('demo_session');
  };

  // Helper function for testing - allows setting state directly
  const setTestState = (newState: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const clearDemoSession = () => {
    localStorage.removeItem('demo_user');
    localStorage.removeItem('demo_session');
    localStorage.removeItem('userType');
    
    setState({
      user: null,
      session: null,
      loading: false,
      profile: null
    });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  };

  return {
    // Expose state properties directly for backward compatibility
    user: state.user,
    session: state.session,
    loading: state.loading,
    profile: state.profile,
    // Also expose state object for tests that expect it
    state,
    // Functions
    signIn,
    signUp,
    signOut,
    setDemoSession,
    clearDemoSession,
    isDemoSession,
    validateEmail,
    resetPassword,
    updatePassword,
    isAdmin,
    isDemo,
    getProfileType,
    isAuthenticated,
    refreshProfile: () => state.user?.id && fetchUserProfile(state.user.id),
    // Test helper
    setTestState
  };
};