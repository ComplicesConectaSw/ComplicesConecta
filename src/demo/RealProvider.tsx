/**
 * Provider para lógica de producción - ComplicesConecta
 * Maneja datos reales de Supabase y autenticación real
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { Database } from '@/types/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface RealContextType {
  profiles: Profile[];
  isDemo: false;
  getRealProfile: (id: string) => Promise<Profile | null>;
  getRealProfiles: (filters?: any) => Promise<Profile[]>;
  realAuth: {
    login: (email: string, password: string) => Promise<{ success: boolean; user?: any; error?: string }>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<any | null>;
    signUp: (email: string, password: string, profileData: any) => Promise<{ success: boolean; user?: any; error?: string }>;
  };
}

const RealContext = createContext<RealContextType | null>(null);

interface RealProviderProps {
  children: ReactNode;
}

export const RealProvider: React.FC<RealProviderProps> = ({ children }) => {
  const getRealProfile = async (id: string): Promise<Profile | null> => {
    try {
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

  const realAuth = {
    login: async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          logger.error('Login error:', { error: error.message });
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Fetch user profile
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
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });

        if (error) {
          logger.error('SignUp error:', { error: error.message });
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Create profile
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

  const contextValue: RealContextType = {
    profiles: [], // Will be loaded dynamically
    isDemo: false,
    getRealProfile,
    getRealProfiles,
    realAuth
  };

  return (
    <RealContext.Provider value={contextValue}>
      {children}
    </RealContext.Provider>
  );
};

export const useRealContext = (): RealContextType => {
  const context = useContext(RealContext);
  if (!context) {
    throw new Error('useRealContext debe usarse dentro de RealProvider');
  }
  return context;
};

export default RealProvider;
