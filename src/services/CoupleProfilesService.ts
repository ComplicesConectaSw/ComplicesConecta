import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface CoupleProfile {
  id: string;
  couple_name: string;
  couple_bio?: string;
  relationship_type: 'man-woman' | 'man-man' | 'woman-woman';
  partner1_id: string;
  partner2_id: string;
  couple_images?: string[];
  is_verified: boolean;
  is_premium: boolean;
  looking_for?: string;
  experience_level?: string;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Datos de los perfiles
  partner1?: {
    id: string;
    first_name: string;
    last_name: string;
    age?: number;
    avatar_url?: string;
  };
  partner2?: {
    id: string;
    first_name: string;
    last_name: string;
    age?: number;
    avatar_url?: string;
  };
}

export interface CoupleProfileView {
  id: string;
  couple_profile_id: string;
  viewer_profile_id: string;
  viewed_at: string;
}

export interface CoupleProfileLike {
  id: string;
  couple_profile_id: string;
  liker_profile_id: string;
  liked_at: string;
}

export interface CoupleProfileReport {
  id: string;
  couple_profile_id: string;
  reporter_profile_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface CreateCoupleProfileData {
  couple_name: string;
  couple_bio?: string;
  relationship_type: 'man-woman' | 'man-man' | 'woman-woman';
  partner1_id: string;
  partner2_id: string;
  couple_images?: string[];
  looking_for?: string;
  experience_level?: string;
  preferences?: Record<string, any>;
}

class CoupleProfilesService {
  constructor() {
    logger.info('CoupleProfilesService initialized');
  }

  /**
   * Obtener ID del usuario actual
   */
  private getCurrentUserId(): string {
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      try {
        const user = JSON.parse(demoUser);
        return user.id || 'demo-user-id';
      } catch {
        return 'demo-user-id';
      }
    }
    throw new Error('No authenticated user found');
  }

  /**
   * Obtener perfiles de parejas usando datos reales de Supabase
   */
  async getCoupleProfiles(
    page = 0,
    limit = 20,
    filters?: {
      relationshipType?: 'man-woman' | 'man-man' | 'woman-woman';
      experienceLevel?: string;
      isVerified?: boolean;
      isPremium?: boolean;
    }
  ): Promise<CoupleProfile[]> {
    try {
      logger.info('Fetching couple profiles from Supabase', { page, limit, filters });

      let query = (supabase as any)
        .from('couple_profiles')
        .select(`
          id,
          couple_name,
          couple_bio,
          relationship_type,
          partner1_id,
          partner2_id,
          couple_images,
          is_verified,
          is_premium,
          preferences,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      // Aplicar filtros
      if (filters?.relationshipType) {
        query = query.eq('relationship_type', filters.relationshipType);
      }
      if (filters?.isVerified !== undefined) {
        query = query.eq('is_verified', filters.isVerified);
      }
      if (filters?.isPremium !== undefined) {
        query = query.eq('is_premium', filters.isPremium);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching couple profiles from Supabase:', error);
        return [];
      }

      // Mapear datos de Supabase al formato esperado
      const profiles: CoupleProfile[] = (data || []).map((profile: any) => ({
        id: profile.id,
        couple_name: profile.couple_name,
        couple_bio: profile.couple_bio,
        relationship_type: profile.relationship_type,
        partner1_id: profile.partner1_id,
        partner2_id: profile.partner2_id,
        couple_images: profile.couple_images || [],
        is_verified: profile.is_verified || false,
        is_premium: profile.is_premium || false,
        preferences: profile.preferences || {},
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        partner1: {
          id: profile.partner1_id,
          first_name: 'Usuario',
          last_name: 'Anónimo',
          age: undefined,
          avatar_url: undefined
        },
        partner2: {
          id: profile.partner2_id,
          first_name: 'Usuario',
          last_name: 'Anónimo',
          age: undefined,
          avatar_url: undefined
        }
      }));

      logger.info('✅ Couple profiles loaded successfully from Supabase', { count: profiles.length });
      return profiles;
    } catch (error) {
      logger.error('Error in getCoupleProfiles:', { error: String(error) });
      return [];
    }
  }

  /**
   * Crear perfil de pareja usando datos reales de Supabase
   */
  async createCoupleProfile(profileData: CreateCoupleProfileData): Promise<CoupleProfile | null> {
    try {
      logger.info('Creating couple profile in Supabase', { profileData });

      const { data, error } = await (supabase as any)
        .from('couple_profiles')
        .insert({
          couple_name: profileData.couple_name,
          couple_bio: profileData.couple_bio,
          relationship_type: profileData.relationship_type,
          partner1_id: profileData.partner1_id,
          partner2_id: profileData.partner2_id,
          couple_images: profileData.couple_images || [],
          preferences: profileData.preferences || {},
          is_verified: false,
          is_premium: false
        })
        .select(`
          id,
          couple_name,
          couple_bio,
          relationship_type,
          partner1_id,
          partner2_id,
          couple_images,
          is_verified,
          is_premium,
          preferences,
          created_at,
          updated_at
        `)
        .single();

      if (error) {
        logger.error('Error creating couple profile in Supabase:', error);
        return null;
      }

      const newProfile: CoupleProfile = {
        id: data.id,
        couple_name: data.couple_name,
        couple_bio: data.couple_bio,
        relationship_type: data.relationship_type,
        partner1_id: data.partner1_id,
        partner2_id: data.partner2_id,
        couple_images: data.couple_images || [],
        is_verified: data.is_verified || false,
        is_premium: data.is_premium || false,
        preferences: data.preferences || {},
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      logger.info('✅ Couple profile created successfully in Supabase', { profileId: newProfile.id });
      return newProfile;
    } catch (error) {
      logger.error('Error in createCoupleProfile:', { error: String(error) });
      return null;
    }
  }

  /**
   * Dar like a un perfil de pareja usando datos reales de Supabase
   */
  async likeCoupleProfile(profileId: string): Promise<boolean> {
    try {
      logger.info('Liking couple profile in Supabase:', { profileId });

      const userId = this.getCurrentUserId();

      // Verificar si ya existe un like
      const { data: existingLike, error: checkError } = await (supabase as any)
        .from('couple_profile_likes')
        .select('id')
        .eq('couple_profile_id', profileId)
        .eq('liker_profile_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        logger.error('Error checking existing like:', checkError);
        return false;
      }

      if (existingLike) {
        // Quitar like
        const { error: deleteError } = await (supabase as any)
          .from('couple_profile_likes')
          .delete()
          .eq('couple_profile_id', profileId)
          .eq('liker_profile_id', userId);

        if (deleteError) {
          logger.error('Error removing like:', deleteError);
          return false;
        }

        logger.info('✅ Like removed successfully', { profileId });
        return true;
      } else {
        // Agregar like
        const { error: insertError } = await (supabase as any)
          .from('couple_profile_likes')
          .insert({
            couple_profile_id: profileId,
            liker_profile_id: userId
          });

        if (insertError) {
          logger.error('Error adding like:', insertError);
          return false;
        }

        logger.info('✅ Like added successfully', { profileId });
        return true;
      }
    } catch (error) {
      logger.error('Error in likeCoupleProfile:', { error: String(error) });
      return false;
    }
  }

  /**
   * Registrar vista de perfil de pareja usando datos reales de Supabase
   */
  async viewCoupleProfile(profileId: string): Promise<void> {
    try {
      logger.info('Recording couple profile view in Supabase:', { profileId });

      const userId = this.getCurrentUserId();

      const { error } = await (supabase as any)
        .from('couple_profile_views')
        .insert({
          couple_profile_id: profileId,
          viewer_profile_id: userId
        });

      if (error) {
        logger.error('Error recording profile view:', error);
      } else {
        logger.info('✅ Profile view recorded successfully', { profileId });
      }
    } catch (error) {
      logger.error('Error in viewCoupleProfile:', { error: String(error) });
    }
  }

  /**
   * Reportar perfil de pareja usando datos reales de Supabase
   */
  async reportCoupleProfile(
    profileId: string,
    reason: string,
    description?: string
  ): Promise<boolean> {
    try {
      logger.info('Reporting couple profile in Supabase:', { profileId, reason });

      const userId = this.getCurrentUserId();

      const { error } = await (supabase as any)
        .from('couple_profile_reports')
        .insert({
          couple_profile_id: profileId,
          reporter_profile_id: userId,
          reason,
          description,
          status: 'pending'
        });

      if (error) {
        logger.error('Error reporting profile:', error);
        return false;
      }

      logger.info('✅ Profile reported successfully', { profileId });
      return true;
    } catch (error) {
      logger.error('Error in reportCoupleProfile:', { error: String(error) });
      return false;
    }
  }

  /**
   * Obtener estadísticas de perfiles de parejas usando datos reales de Supabase
   */
  async getCoupleProfileStats(): Promise<{
    totalProfiles: number;
    verifiedProfiles: number;
    premiumProfiles: number;
    totalViews: number;
    totalLikes: number;
    relationshipTypeDistribution: Record<string, number>;
  }> {
    try {
      logger.info('Getting couple profile stats from Supabase');

      const [
        profilesResult,
        viewsResult,
        likesResult
      ] = await Promise.allSettled([
        (supabase as any)
          .from('couple_profiles')
          .select('relationship_type, is_verified, is_premium'),
        (supabase as any)
          .from('couple_profile_views')
          .select('id', { count: 'exact' }),
        (supabase as any)
          .from('couple_profile_likes')
          .select('id', { count: 'exact' })
      ]);

      const stats = {
        totalProfiles: 0,
        verifiedProfiles: 0,
        premiumProfiles: 0,
        totalViews: 0,
        totalLikes: 0,
        relationshipTypeDistribution: {} as Record<string, number>
      };

      if (profilesResult.status === 'fulfilled' && profilesResult.value.data) {
        const profiles = profilesResult.value.data;
        stats.totalProfiles = profiles.length;
        stats.verifiedProfiles = profiles.filter((p: any) => p.is_verified).length;
        stats.premiumProfiles = profiles.filter((p: any) => p.is_premium).length;

        // Calcular distribución por tipo de relación
        profiles.forEach((profile: any) => {
          const type = profile.relationship_type;
          stats.relationshipTypeDistribution[type] = (stats.relationshipTypeDistribution[type] || 0) + 1;
        });
      }

      if (viewsResult.status === 'fulfilled' && viewsResult.value.count !== null) {
        stats.totalViews = viewsResult.value.count;
      }

      if (likesResult.status === 'fulfilled' && likesResult.value.count !== null) {
        stats.totalLikes = likesResult.value.count;
      }

      logger.info('✅ Couple profile stats loaded successfully', stats);
      return stats;
    } catch (error) {
      logger.error('Error in getCoupleProfileStats:', { error: String(error) });
      return {
        totalProfiles: 0,
        verifiedProfiles: 0,
        premiumProfiles: 0,
        totalViews: 0,
        totalLikes: 0,
        relationshipTypeDistribution: {}
      };
    }
  }
}

export const coupleProfilesService = new CoupleProfilesService();
export default coupleProfilesService;
