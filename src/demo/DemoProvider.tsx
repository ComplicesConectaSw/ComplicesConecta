/**
 * Provider para lógica demo - ComplicesConecta
 * Maneja datos mock y comportamiento demo sin afectar producción
 */
import React, { ReactNode } from 'react';
import { logger } from '@/lib/logger';
import type { Database } from '@/types/supabase-generated';
import { demoProfiles } from '@/demo/demoData';
import { AppContext, AppContextType } from '@/context/AppContext';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DemoProviderProps {
  children: ReactNode;
}

export const DemoProvider: React.FC<DemoProviderProps> = ({ children }) => {
  const getDemoProfile = async (id: string): Promise<Profile | null> => {
    return (demoProfiles as any[]).find((p: any) => p.id === id) as Profile || null;
  };

  const getDemoProfiles = async (filters?: any): Promise<Profile[]> => {
    let filtered = [...(demoProfiles as any[])];
    
    if (filters?.ageRange) {
      filtered = filtered.filter((p: any) => 
        p.age && p.age >= filters.ageRange.min && p.age <= filters.ageRange.max
      );
    }
    
    if (filters?.interests) {
      filtered = filtered.filter((p: any) => {
        return p.interests?.some((interest: string) => 
          filters.interests.includes(interest)
        );
      });
    }
    
    return filtered as Profile[];
  };

  const auth = {
    login: async (email: string, _password: string) => {
      logger.info('Demo login attempt:', { email });
      
      if (email.includes('demo') || email.includes('test')) {
        return {
          success: true,
          user: {
            id: 'demo-user-1',
            email,
            profile: demoProfiles[0]
          }
        };
      }
      
      return { success: false, error: 'Invalid demo credentials' };
    },
    
    logout: async () => {
      logger.info('Demo logout');
    },
    
    getCurrentUser: async () => {
      return {
        id: 'demo-user-1',
        email: 'demo@complicesconecta.com',
        profile: demoProfiles[0]
      };
    },

    signUp: async (email: string, _password: string, _profileData: any) => {
      logger.info('Demo signUp attempt:', { email });
      return {
        success: true,
        user: {
          id: `demo-user-${Date.now()}`,
          email,
          profile: demoProfiles[1]
        }
      };
    }
  };

  const contextValue: AppContextType = {
    isDemo: true,
    profiles: demoProfiles as any as Profile[],
    getProfile: getDemoProfile,
    getProfiles: getDemoProfiles,
    auth
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default DemoProvider;
