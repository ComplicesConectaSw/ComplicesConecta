import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';
import { useAuth } from '@/features/auth/useAuth';

// Extended interface for couple profiles with database integration
export interface CoupleProfile {
  id: string;
  couple_name: string;
  couple_bio: string | null;
  relationship_type: 'man-woman' | 'man-man' | 'woman-woman';
  partner1_id: string;
  partner2_id: string;
  couple_images: string[] | null;
  is_verified: boolean | null;
  is_premium: boolean | null;
  created_at: string;
  updated_at: string;
}

// Extended interface for couple profiles with partner details
export interface CoupleProfileWithPartners extends CoupleProfile {
  partner1_first_name: string;
  partner1_last_name: string;
  partner1_age: number;
  partner1_bio: string | null;
  partner1_gender: string;
  partner2_first_name: string;
  partner2_last_name: string;
  partner2_age: number;
  partner2_bio: string | null;
  partner2_gender: string;
}

// Hook for fetching couple profile by ID
export const useCoupleProfile = (coupleId: string | undefined) => {
  return useQuery({
    queryKey: ['couple-profile', coupleId],
    queryFn: async () => {
      if (!coupleId) return null;
      
      logger.info('Fetching couple profile', { coupleId });
      
      // Use any type to bypass Supabase type checking issues
      const { data, error } = await (supabase as any)
        .from('couple_profiles')
        .select(`
          *,
          partner1:profiles!partner1_id(first_name, last_name, age, bio, gender),
          partner2:profiles!partner2_id(first_name, last_name, age, bio, gender)
        `)
        .eq('id', coupleId)
        .single();

      if (error) {
        logger.error('❌ Error fetching couple profile:', { error });
        throw error;
      }

      if (data) {
        logger.info('✅ Couple profile fetched successfully:', { couple_name: data.couple_name });
        
        // Transform data to match CoupleProfileWithPartners interface
        const transformedData: CoupleProfileWithPartners = {
          ...data,
          partner1_first_name: data.partner1?.first_name || '',
          partner1_last_name: data.partner1?.last_name || '',
          partner1_age: data.partner1?.age || 0,
          partner1_bio: data.partner1?.bio || null,
          partner1_gender: data.partner1?.gender || '',
          partner2_first_name: data.partner2?.first_name || '',
          partner2_last_name: data.partner2?.last_name || '',
          partner2_age: data.partner2?.age || 0,
          partner2_bio: data.partner2?.bio || null,
          partner2_gender: data.partner2?.gender || ''
        };
        
        return transformedData;
      }

      return null;
    },
    enabled: !!coupleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for fetching couple profiles with pagination
export const useCoupleProfiles = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['couple-profiles', page, limit],
    queryFn: async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      logger.info('Fetching couple profiles', { page, limit });
      
      const { data, error, count } = await (supabase as any)
        .from('couple_profiles')
        .select(`
          *,
          partner1:profiles!partner1_id(first_name, last_name, age, bio, gender),
          partner2:profiles!partner2_id(first_name, last_name, age, bio, gender)
        `, { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('❌ Error fetching couple profiles:', { error });
        throw error;
      }

      logger.info('✅ Couple profiles fetched successfully', { count });
      
      // Transform data to match CoupleProfileWithPartners interface
      const transformedData = data?.map((item: any) => ({
        ...item,
        partner1_first_name: item.partner1?.first_name || '',
        partner1_last_name: item.partner1?.last_name || '',
        partner1_age: item.partner1?.age || 0,
        partner1_bio: item.partner1?.bio || null,
        partner1_gender: item.partner1?.gender || '',
        partner2_first_name: item.partner2?.first_name || '',
        partner2_last_name: item.partner2?.last_name || '',
        partner2_age: item.partner2?.age || 0,
        partner2_bio: item.partner2?.bio || null,
        partner2_gender: item.partner2?.gender || ''
      })) || [];

      return {
        data: transformedData,
        count: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching couple profiles by user ID (as partner)
export const useCoupleProfilesByUser = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['couple-profiles-by-user', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      logger.info('Fetching couple profiles by user', { userId });
      
      const { data, error } = await (supabase as any)
        .from('couple_profiles')
        .select(`
          *,
          partner1:profiles!partner1_id(first_name, last_name, age, bio, gender),
          partner2:profiles!partner2_id(first_name, last_name, age, bio, gender)
        `)
        .or(`partner1_id.eq.${userId},partner2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('❌ Error fetching couple profiles by user:', { error });
        throw error;
      }

      logger.info('✅ Couple profiles by user fetched successfully', { count: data?.length });
      
      // Transform data to match CoupleProfileWithPartners interface
      const transformedData = data?.map((item: any) => ({
        ...item,
        partner1_first_name: item.partner1?.first_name || '',
        partner1_last_name: item.partner1?.last_name || '',
        partner1_age: item.partner1?.age || 0,
        partner1_bio: item.partner1?.bio || null,
        partner1_gender: item.partner1?.gender || '',
        partner2_first_name: item.partner2?.first_name || '',
        partner2_last_name: item.partner2?.last_name || '',
        partner2_age: item.partner2?.age || 0,
        partner2_bio: item.partner2?.bio || null,
        partner2_gender: item.partner2?.gender || ''
      })) || [];

      return transformedData;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for creating couple profile
export const useCreateCoupleProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (profileData: Omit<CoupleProfile, 'id' | 'created_at' | 'updated_at'>) => {
      logger.info('Creating couple profile', { couple_name: profileData.couple_name });
      
      const { data, error } = await (supabase as any)
        .from('couple_profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        logger.error('❌ Error creating couple profile:', { error });
        throw error;
      }

      if (data) {
        logger.info('✅ Couple profile created successfully:', { couple_name: data.couple_name });
        return data as CoupleProfile;
      }

      throw new Error('No data returned from couple profile creation');
    },
    onSuccess: (data: CoupleProfile) => {
      // Invalidate and refetch couple profiles
      queryClient.invalidateQueries({ queryKey: ['couple-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['couple-profile', data.id] });
      
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['couple-profiles-by-user', user.id] });
      }
    },
  });
};

// Hook for updating couple profile
export const useUpdateCoupleProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (updates: Partial<CoupleProfile> & { id: string }) => {
      const { id, ...updateData } = updates;
      
      logger.info('Updating couple profile', { id });
      
      const { data, error } = await (supabase as any)
        .from('couple_profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('❌ Error updating couple profile:', { error });
        throw error;
      }

      if (data) {
        logger.info('✅ Couple profile updated successfully:', { id: data.id });
        return data as CoupleProfile;
      }

      throw new Error('No data returned from couple profile update');
    },
    onSuccess: (data: CoupleProfile) => {
      // Update cache for specific couple profile
      queryClient.setQueryData(['couple-profile', data.id], data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['couple-profiles'] });
      
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['couple-profiles-by-user', user.id] });
      }
    },
  });
};

// Hook for deleting couple profile
export const useDeleteCoupleProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (coupleId: string) => {
      logger.info('Deleting couple profile', { coupleId });
      
      const { error } = await (supabase as any)
        .from('couple_profiles')
        .delete()
        .eq('id', coupleId);

      if (error) {
        logger.error('❌ Error deleting couple profile:', { error });
        throw error;
      }

      logger.info('✅ Couple profile deleted successfully:', { coupleId });
      return coupleId;
    },
    onSuccess: (coupleId: string) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['couple-profile', coupleId] });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['couple-profiles'] });
      
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['couple-profiles-by-user', user.id] });
      }
    },
  });
};

// Hook for prefetching couple profile
export const usePrefetchCoupleProfile = () => {
  const queryClient = useQueryClient();
  
  return (coupleId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['couple-profile', coupleId],
      queryFn: async () => {
        logger.info('Prefetching couple profile', { coupleId });
        
        const { data, error } = await (supabase as any)
          .from('couple_profiles')
          .select(`
            *,
            partner1:profiles!partner1_id(first_name, last_name, age, bio, gender),
            partner2:profiles!partner2_id(first_name, last_name, age, bio, gender)
          `)
          .eq('id', coupleId)
          .single();

        if (error) {
          logger.error('❌ Error prefetching couple profile:', { error });
          throw error;
        }

        if (data) {
          // Transform data to match CoupleProfileWithPartners interface
          const transformedData: CoupleProfileWithPartners = {
            ...data,
            partner1_first_name: data.partner1?.first_name || '',
            partner1_last_name: data.partner1?.last_name || '',
            partner1_age: data.partner1?.age || 0,
            partner1_bio: data.partner1?.bio || null,
            partner1_gender: data.partner1?.gender || '',
            partner2_first_name: data.partner2?.first_name || '',
            partner2_last_name: data.partner2?.last_name || '',
            partner2_age: data.partner2?.age || 0,
            partner2_bio: data.partner2?.bio || null,
            partner2_gender: data.partner2?.gender || ''
          };
          
          return transformedData;
        }

        return null;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
};

// Hook for clearing couple profile cache
export const useClearCoupleProfileCache = () => {
  const queryClient = useQueryClient();
  
  return {
    clearAll: () => {
      logger.info('Clearing all couple profile cache');
      queryClient.removeQueries({ queryKey: ['couple-profiles'] });
      queryClient.removeQueries({ queryKey: ['couple-profile'] });
      queryClient.removeQueries({ queryKey: ['couple-profiles-by-user'] });
    },
    clearProfile: (coupleId: string) => {
      logger.info('Clearing couple profile cache', { coupleId });
      queryClient.removeQueries({ queryKey: ['couple-profile', coupleId] });
    },
    clearUserProfiles: (userId: string) => {
      logger.info('Clearing user couple profiles cache', { userId });
      queryClient.removeQueries({ queryKey: ['couple-profiles-by-user', userId] });
    }
  };
};
