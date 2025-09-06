import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
    // Check for demo session first
    const checkDemoSession = () => {
      const demoUser = localStorage.getItem('demo_user');
      const demoSession = localStorage.getItem('demo_session');
      const userType = localStorage.getItem('userType');
      
      if (demoUser && demoSession && userType) {
        try {
          const user = JSON.parse(demoUser);
          setState({
            user: user,
            session: { user } as Session,
            loading: false,
            profile: { id: user.id, role: user.role }
          });
          return true;
        } catch (error) {
          console.error('Error parsing demo session:', error);
          // Clear corrupted data
          localStorage.removeItem('demo_user');
          localStorage.removeItem('demo_session');
          localStorage.removeItem('userType');
        }
      }
      return false;
    };

    // If demo session exists, use it
    if (checkDemoSession()) {
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false
      }));

      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
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
    // Clear demo session if exists
    localStorage.removeItem('demo_user');
    localStorage.removeItem('demo_session');
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
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

  return {
    ...state,
    signOut,
    isAdmin,
    isDemo,
    getProfileType,
    isAuthenticated,
    refreshProfile: () => state.user?.id && fetchUserProfile(state.user.id)
  };
};