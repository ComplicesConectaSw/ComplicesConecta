import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { logger } from '@/lib/logger';

// Tipos para el cache de perfiles
type Profile = Tables<'profiles'>;

// Keys para React Query
export const profileKeys = {
  all: ['profiles'] as const,
  lists: () => [...profileKeys.all, 'list'] as const,
  list: (filters: string) => [...profileKeys.lists(), { filters }] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (id: string) => [...profileKeys.details(), id] as const,
};

// Hook para obtener perfil por ID con cache
export const useProfile = (userId: string | null) => {
  return useQuery({
    queryKey: profileKeys.detail(userId || ''),
    queryFn: async (): Promise<Profile | null> => {
      if (!userId) return null;
      
      logger.info('🔍 Cargando perfil desde Supabase:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('❌ Error cargando perfil:', error);
        throw error;
      }

      logger.info('✅ Perfil cargado desde Supabase:', data?.first_name);
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
    retry: 2,
  });
};

// Hook para obtener múltiples perfiles con cache
export const useProfiles = (filters?: { 
  accountType?: string;
  ageMin?: number;
  ageMax?: number;
  location?: string;
}) => {
  const filterKey = JSON.stringify(filters || {});
  
  return useQuery({
    queryKey: profileKeys.list(filterKey),
    queryFn: async (): Promise<Profile[]> => {
      logger.info('🔍 Cargando perfiles desde Supabase con filtros:', filters);
      
      let query = supabase.from('profiles').select('*');
      
      if (filters?.accountType) {
        query = query.eq('account_type', filters.accountType);
      }
      
      if (filters?.ageMin) {
        query = query.gte('age', filters.ageMin);
      }
      
      if (filters?.ageMax) {
        query = query.lte('age', filters.ageMax);
      }
      
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        logger.error('❌ Error cargando perfiles:', error);
        throw error;
      }

      logger.info('✅ Perfiles cargados desde Supabase:', data?.length);
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};

// Hook para actualizar perfil con invalidación de cache
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: Partial<Profile> & { id: string }) => {
      logger.info('💾 Actualizando perfil en Supabase:', profile.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        logger.error('❌ Error actualizando perfil:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidar cache específico del perfil
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(data.id) });
      // Invalidar listas de perfiles
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
      
      logger.info('✅ Perfil actualizado y cache invalidado:', data.first_name);
    },
    onError: (error) => {
      logger.error('❌ Error en mutación de perfil:', error);
    },
  });
};

// Hook para crear nuevo perfil
export const useCreateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
      logger.info('➕ Creando nuevo perfil en Supabase');
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();

      if (error) {
        logger.error('❌ Error creando perfil:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidar listas de perfiles para incluir el nuevo
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
      // Agregar al cache individual
      queryClient.setQueryData(profileKeys.detail(data.id), data);
      
      logger.info('✅ Perfil creado y cache actualizado:', data.first_name);
    },
  });
};

// Utilidad para prefetch de perfiles
export const usePrefetchProfile = () => {
  const queryClient = useQueryClient();
  
  return (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: profileKeys.detail(userId),
      queryFn: async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Hook para limpiar cache de perfiles
export const useClearProfileCache = () => {
  const queryClient = useQueryClient();
  
  return {
    clearAll: () => {
      queryClient.removeQueries({ queryKey: profileKeys.all });
      logger.info('🧹 Cache de perfiles limpiado completamente');
    },
    clearProfile: (userId: string) => {
      queryClient.removeQueries({ queryKey: profileKeys.detail(userId) });
      logger.info('🧹 Cache de perfil específico limpiado:', userId);
    },
    clearLists: () => {
      queryClient.removeQueries({ queryKey: profileKeys.lists() });
      logger.info('🧹 Cache de listas de perfiles limpiado');
    },
  };
};
