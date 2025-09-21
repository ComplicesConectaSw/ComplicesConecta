import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface ProfileData {
  id: string;
  email: string;
  name: string;
  age?: number;
  location?: string;
  bio?: string;
  interests?: string[];
  userType: 'single' | 'couple';
  profileImage?: string;
  partnerName?: string;
  partnerAge?: number;
  relationshipDuration?: string;
  lookingFor?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionFlags {
  demo_authenticated: boolean;
  userType: 'single' | 'couple' | null;
}

export const useProfileData = (userId?: string) => {
  const queryClient = useQueryClient();

  const getSessionFlags = (): SessionFlags => ({
    demo_authenticated: localStorage.getItem('demo_authenticated') === 'true',
    userType: localStorage.getItem('userType') as 'single' | 'couple' | null,
  });

  const setSessionFlags = (flags: Partial<SessionFlags>) => {
    Object.entries(flags).forEach(([key, value]) => {
      if (value !== undefined) {
        localStorage.setItem(key, String(value));
      }
    });
  };

  const {
    data: profile,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<ProfileData | null> => {
      if (!userId) return null;

      const sessionFlags = getSessionFlags();
      
      if (sessionFlags.demo_authenticated) {
        const demoUser = localStorage.getItem('demo_user');
        if (demoUser) {
          try {
            const parsed = JSON.parse(demoUser);
            return {
              id: parsed.id || 'demo-user',
              email: parsed.email || 'demo@example.com',
              name: parsed.name || 'Usuario Demo',
              age: parsed.age,
              location: parsed.location,
              bio: parsed.bio,
              interests: parsed.interests || [],
              userType: parsed.userType || 'single',
              profileImage: parsed.profileImage,
              partnerName: parsed.partnerName,
              partnerAge: parsed.partnerAge,
              relationshipDuration: parsed.relationshipDuration,
              lookingFor: parsed.lookingFor,
              isVerified: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          } catch (err) {
            logger.error('Error parsing demo user data:', { error: String(err) });
          }
        }
        return null;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          logger.error('Error fetching profile:', { error: String(error.message) });
          throw error;
        }

        // Convertir datos de Supabase a ProfileData
        const profileData: ProfileData = {
          id: data.id,
          email: data.email || '',
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Usuario',
          age: data.age || undefined,
          location: undefined, // Campo no disponible en esquema actual
          bio: data.bio || undefined,
          interests: data.interests || undefined,
          userType: (data.profile_type as 'single' | 'couple') || 'single',
          profileImage: data.avatar_url || undefined,
          isVerified: data.is_verified || false,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        
        return profileData;
      } catch (err) {
        logger.error('Error in profile query:', { error: String(err) });
        throw err;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedProfile: Partial<ProfileData>): Promise<ProfileData> => {
      const sessionFlags = getSessionFlags();

      if (sessionFlags.demo_authenticated) {
        const demoUser = localStorage.getItem('demo_user');
        const currentData = demoUser ? JSON.parse(demoUser) : {};
        const updatedData = {
          ...currentData,
          ...updatedProfile,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('demo_user', JSON.stringify(updatedData));
        return updatedData as ProfileData;
      }

      if (!userId) throw new Error('User ID required for profile update');

      const { id, createdAt, updatedAt, ...updateData } = updatedProfile;
      
      const { data, error } = await (supabase as any)
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating profile:', { error: String(error.message) });
        throw error;
      }

      return data as ProfileData;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', userId], data);
      logger.info('Profile updated successfully');
    },
    onError: (err) => {
      logger.error('Error updating profile:', { error: String(err) });
    },
  });

  const migrateFromLocalStorage = async () => {
    const sessionFlags = getSessionFlags();
    
    if (sessionFlags.demo_authenticated || !userId) return;

    try {
      const legacyKeys = ['user_profile', 'profile_data', 'user_data'];
      let legacyData: any = null;

      for (const key of legacyKeys) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            legacyData = JSON.parse(stored);
            break;
          } catch (err) {
            logger.warn(`Failed to parse legacy data from ${key}:`, { error: String(err) });
          }
        }
      }

      if (legacyData && Object.keys(legacyData).length > 0) {
        logger.info('Migrating legacy profile data to Supabase...');
        
        await updateProfileMutation.mutateAsync(legacyData);
        
        legacyKeys.forEach(key => localStorage.removeItem(key));
        
        logger.info('Legacy data migration completed successfully');
      }
    } catch (err) {
      logger.error('Error during legacy data migration:', { error: err instanceof Error ? err.message : String(err) });
    }
  };

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,
    sessionFlags: getSessionFlags(),
    setSessionFlags,
    migrateFromLocalStorage,
  };
};

export const useSessionManager = () => {
  const getSessionFlags = (): SessionFlags => ({
    demo_authenticated: localStorage.getItem('demo_authenticated') === 'true',
    userType: localStorage.getItem('userType') as 'single' | 'couple' | null,
  });

  const setSessionFlags = (flags: Partial<SessionFlags>) => {
    Object.entries(flags).forEach(([key, value]) => {
      if (value !== undefined) {
        localStorage.setItem(key, String(value));
      }
    });
    window.dispatchEvent(new Event('storage'));
  };

  const clearSession = () => {
    localStorage.removeItem('demo_authenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('demo_user');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('profile_data');
    localStorage.removeItem('user_data');
    window.dispatchEvent(new Event('storage'));
  };

  const isAuthenticated = () => {
    const flags = getSessionFlags();
    return flags.demo_authenticated;
  };

  const isDemoMode = () => {
    return getSessionFlags().demo_authenticated;
  };

  const isProductionMode = () => {
    return !getSessionFlags().demo_authenticated;
  };

  return {
    sessionFlags: getSessionFlags(),
    setSessionFlags,
    clearSession,
    isAuthenticated,
    isDemoMode,
    isProductionMode,
  };
};
