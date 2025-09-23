/**
 * Provider para lógica demo - ComplicesConecta
 * Maneja datos mock y comportamiento demo sin afectar producción
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { Database } from '@/integrations/supabase/types';
import { demoProfiles, demoMessages, demoInvitations, demoEvents, demoMatches } from '@/demo/demoData';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DemoContextType {
  profiles: Profile[];
  isDemo: true;
  getDemoProfile: (id: string) => Profile | null;
  getDemoProfiles: (filters?: any) => Profile[];
  mockAuth: {
    login: (email: string, password: string) => Promise<{ success: boolean; user?: any }>;
    logout: () => Promise<void>;
    getCurrentUser: () => any | null;
  };
}

const DemoContext = createContext<DemoContextType | null>(null);

interface DemoProviderProps {
  children: ReactNode;
}

export const DemoProvider: React.FC<DemoProviderProps> = ({ children }) => {
  const getDemoProfile = (id: string): Profile | null => {
    return (demoProfiles as any[]).find((p: any) => p.id === id) as Profile || null;
  };

  const getDemoProfiles = (filters?: any): Profile[] => {
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

  const mockAuth = {
    login: async (email: string, password: string) => {
      logger.info('Demo login attempt:', { email });
      
      // Mock successful login for demo users
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
      
      return { success: false };
    },
    
    logout: async () => {
      logger.info('Demo logout');
      // Mock logout - no real session to clear
    },
    
    getCurrentUser: () => {
      // Return mock user for demo
      return {
        id: 'demo-user-1',
        email: 'demo@complicesconecta.com',
        profile: demoProfiles[0]
      };
    }
  };

  const contextValue: DemoContextType = {
    profiles: demoProfiles as any as Profile[],
    isDemo: true,
    getDemoProfile,
    getDemoProfiles,
    mockAuth
  };

  return (
    <DemoContext.Provider value={contextValue}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoContext = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoContext debe usarse dentro de DemoProvider');
  }
  return context;
};

export default DemoProvider;
