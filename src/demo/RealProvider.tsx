/**
 * Provider para lógica de producción - ComplicesConecta
 * Maneja datos reales de Supabase y autenticación real
 */
import React, { ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { Database } from '@/types/supabase';
import { AppContext, AppContextType } from '@/context/AppContext';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface RealProviderProps {
  children: ReactNode;
}

export const RealProvider: React.FC<RealProviderProps> = ({ children }) => {
  const getRealProfile = async (id: string): Promise<Profile | null> => {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('Error fetching profile:', { error: error.message });
        return null;
      }

      return data as Profile;
    } catch (error) {
      logger.error('Error in getRealProfile:', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  };

  const getRealProfiles = async (filters?: any): Promise<Profile[]> => {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return [];
      }

      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_demo', false);

      if (filters?.ageRange) {
        query = query
          .gte('age', filters.ageRange.min)
          .lte('age', filters.ageRange.max);
      }

      if (filters?.profileType) {
        query = query.eq('profile_type', filters.profileType);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        logger.error('Error fetching profiles:', { error: error.message });
        return [];
      }

      return data as Profile[];
    } catch (error) {
      logger.error('Error in getRealProfiles:', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  };

  const auth = {
    login: async (email: string, password: string) => {
      try {
        if (!supabase) {
          logger.error('Supabase no está disponible');
          return { success: false, error: 'Supabase no está disponible' };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          logger.error('Login error:', { error: error.message });
          return { success: false, error: error.message };
        }

        if (data.user) {
          const profile = await getRealProfile(data.user.id);
          return {
            success: true,
            user: {
              ...data.user,
              profile
            }
          };
        }

        return { success: false, error: 'No user data returned' };
      } catch (error) {
        logger.error('Login exception:', { error: error instanceof Error ? error.message : String(error) });
        return { success: false, error: 'Login failed' };
      }
    },

    logout: async () => {
      try {
        if (!supabase) {
          logger.error('Supabase no está disponible');
          return;
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
          logger.error('Logout error:', { error: error.message });
        }
      } catch (error) {
        logger.error('Logout exception:', { error: error instanceof Error ? error.message : String(error) });
      }
    },

    getCurrentUser: async () => {
      try {
        if (!supabase) {
          logger.error('Supabase no está disponible');
          return null;
        }

        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          logger.error('Get user error:', { error: error.message });
          return null;
        }

        if (user) {
          const profile = await getRealProfile(user.id);
          return {
            ...user,
            profile
          };
        }

        return null;
      } catch (error) {
        logger.error('Get user exception:', { error: error instanceof Error ? error.message : String(error) });
        return null;
      }
    },

    signUp: async (email: string, password: string, profileData: any) => {
      try {
        if (!supabase) {
          logger.error('Supabase no está disponible');
          return { success: false, error: 'Supabase no está disponible' };
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });

        if (error) {
          logger.error('SignUp error:', { error: error.message });
          return { success: false, error: error.message };
        }

        if (data.user) {
          if (!supabase) {
            logger.error('Supabase no está disponible');
            return { success: false, error: 'Supabase no está disponible' };
          }

          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email,
              ...profileData,
              is_demo: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (profileError) {
            logger.error('Profile creation error:', { error: profileError.message });
            return { success: false, error: 'Failed to create profile' };
          }

          return { success: true, user: data.user };
        }

        return { success: false, error: 'No user data returned' };
      } catch (error) {
        logger.error('SignUp exception:', { error: error instanceof Error ? error.message : String(error) });
        return { success: false, error: 'Registration failed' };
      }
    }
  };

  const contextValue: AppContextType = {
    isDemo: false,
    profiles: [], // Will be loaded dynamically
    getProfile: getRealProfile,
    getProfiles: getRealProfiles,
    auth
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default RealProvider;
