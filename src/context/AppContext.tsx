/**
 * src/context/AppContext.tsx
 *
 * Define el contexto unificado para la aplicación, permitiendo
 * cambiar entre el modo de demostración y el de producción de forma transparente.
 */
import { createContext, useContext } from 'react';
import type { Database } from '@/types/supabase-generated';

// CRÍTICO: Asegurar createContext disponible antes de usar
const safeCreateContext = <T,>(defaultValue: T | null): React.Context<T | null> => {
  if (createContext) {
    return createContext<T | null>(defaultValue);
  }
  
  // Fallback para entornos donde la importación podría fallar
  return {
    Provider: ({ children }: any) => children,
    Consumer: ({ children }: any) => children(null),
    displayName: 'AppContext',
  } as any;
};

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AppContextType {
  isDemo: boolean;
  profiles: Profile[];
  getProfile: (id: string) => Promise<Profile | null>;
  getProfiles: (filters?: any) => Promise<Profile[]>;
  auth: {
    login: (email: string, password: string) => Promise<{ success: boolean; user?: any; error?: string }>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<any | null>;
    signUp: (email: string, password: string, profileData: any) => Promise<{ success: boolean; user?: any; error?: string }>;
  };
}

export const AppContext = safeCreateContext<AppContextType | null>(null);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de un AppProvider (DemoProvider o RealProvider)');
  }
  return context;
};
