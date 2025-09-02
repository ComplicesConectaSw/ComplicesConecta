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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = async () => {
    if (!state.user) return false;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', state.user.id)
        .eq('role', 'administrador')
        .single();
      
      return !error && data;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  };

  const isAdminSync = () => {
    return state.profile?.role === 'administrador';
  };

  const isAuthenticated = () => {
    return !!state.user;
  };

  return {
    ...state,
    signOut,
    isAdmin,
    isAdminSync,
    isAuthenticated,
    refreshProfile: () => state.user?.id && fetchUserProfile(state.user.id)
  };
};