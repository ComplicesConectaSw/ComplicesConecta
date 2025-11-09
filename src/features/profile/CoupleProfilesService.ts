/**
 * CoupleProfilesService - Servicio de Perfiles de Pareja
 * 
 * Servicio para gestionar perfiles de pareja con integración con Supabase
 * 
 * @version 3.6.3
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { 
  CoupleProfileData, 
  CoupleProfileWithPartners, 
  CreateCoupleProfileData,
  UpdateCoupleProfileData 
} from './coupleProfiles';

// Re-exportar tipos para compatibilidad
export type CoupleProfile = CoupleProfileData;
export type CoupleProfileView = CoupleProfileWithPartners;
export type CoupleProfileLike = {
  id: string;
  couple_profile_id: string;
  user_id: string;
  created_at: string;
};
export type CoupleProfileReport = {
  id: string;
  couple_profile_id: string;
  reporter_id: string;
  reason: string;
  description?: string;
  created_at: string;
};
export type { CreateCoupleProfileData };

export interface CoupleProfilesService {
  // Obtener perfil de pareja por ID
  getCoupleProfileById(id: string): Promise<CoupleProfileView | null>;
  
  // Obtener perfil de pareja por ID de usuario
  getCoupleProfileByUserId(userId: string): Promise<CoupleProfileView | null>;
  
  // Obtener todos los perfiles de pareja
  getCoupleProfiles(offset?: number, limit?: number): Promise<CoupleProfileView[]>;
  
  // Crear perfil de pareja
  createCoupleProfile(data: CreateCoupleProfileData): Promise<CoupleProfile | null>;
  
  // Actualizar perfil de pareja
  updateCoupleProfile(id: string, data: UpdateCoupleProfileData): Promise<CoupleProfile | null>;
  
  // Eliminar perfil de pareja
  deleteCoupleProfile(id: string): Promise<boolean>;
  
  // Obtener estadísticas de perfiles de pareja
  getCoupleProfileStats(): Promise<{
    totalProfiles: number;
    verifiedProfiles: number;
    premiumProfiles: number;
  }>;
}

class CoupleProfilesServiceImpl implements CoupleProfilesService {
  /**
   * Obtener perfil de pareja por ID
   */
  async getCoupleProfileById(id: string): Promise<CoupleProfileView | null> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return null;
      }
      const { data, error } = await supabase
        .from('couple_profiles')
        .select(`
          *,
          partner1:profiles!partner1_id(first_name, last_name, age, bio, gender),
          partner2:profiles!partner2_id(first_name, last_name, age, bio, gender)
        `)
        .eq('id', id)
        .single();

      if (error) {
        logger.error('Error fetching couple profile by ID:', { error: error.message });
        return null;
      }

      if (!data) return null;

      // Registrar vista en couple_profile_views (async, no bloquea)
      this.logCoupleProfileView(id).catch(err => 
        logger.debug('Failed to log couple profile view:', { error: String(err) })
      );

      // Transformar datos para coincidir con CoupleProfileWithPartners
      return {
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
      } as CoupleProfileView;
    } catch (error) {
      logger.error('Error in getCoupleProfileById:', { error: String(error) });
      return null;
    }
  }

  /**
   * Registra vista de perfil de pareja
   * @private
   */
  private async logCoupleProfileView(coupleProfileId: string): Promise<void> {
    try {
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('couple_profile_views')
        .insert({
          couple_profile_id: coupleProfileId,
          viewer_profile_id: user.id,
          viewed_at: new Date().toISOString(),
        });
    } catch (error) {
      logger.debug('Failed to log couple profile view:', { error: String(error) });
    }
  }

  /**
   * Reporta un perfil de pareja
   */
  async reportCoupleProfile(
    coupleProfileId: string,
    reason: string,
    description?: string
  ): Promise<boolean> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.error('Usuario no autenticado');
        return false;
      }

      const { error } = await supabase
        .from('couple_profile_reports')
        .insert({
          couple_profile_id: coupleProfileId,
          reporter_profile_id: user.id,
          reason,
          description: description || null,
          status: 'pending',
        });

      if (error) {
        logger.error('Error reporting couple profile:', { error: error.message });
        return false;
      }

      logger.info('Couple profile reported successfully');
      return true;
    } catch (error) {
      logger.error('Error in reportCoupleProfile:', { error: String(error) });
      return false;
    }
  }

  /**
   * Obtener perfil de pareja por ID de usuario
   */
  async getCoupleProfileByUserId(userId: string): Promise<CoupleProfileView | null> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return null;
      }
      const { data, error } = await supabase
        .from('couple_profiles')
        .select(`
          *,
          partner1:profiles!partner1_id(first_name, last_name, age, bio, gender),
          partner2:profiles!partner2_id(first_name, last_name, age, bio, gender)
        `)
        .or(`partner1_id.eq.${userId},partner2_id.eq.${userId}`)
        .single();

      if (error) {
        logger.error('Error fetching couple profile by user ID:', { error: error.message });
        return null;
      }

      if (!data) return null;

      // Transformar datos para coincidir con CoupleProfileWithPartners
      return {
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
      } as CoupleProfileView;
    } catch (error) {
      logger.error('Error in getCoupleProfileByUserId:', { error: String(error) });
      return null;
    }
  }

  /**
   * Obtener todos los perfiles de pareja
   */
  async getCoupleProfiles(offset: number = 0, limit: number = 20): Promise<CoupleProfileView[]> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return [];
      }
      const { data, error } = await supabase
        .from('couple_profiles')
        .select(`
          *,
          partner1:profiles!partner1_id(first_name, last_name, age, bio, gender),
          partner2:profiles!partner2_id(first_name, last_name, age, bio, gender)
        `)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching couple profiles:', { error: error.message });
        return [];
      }

      if (!data) return [];

      // Transformar datos para coincidir con CoupleProfileWithPartners
      return data.map((profile: any) => ({
        ...profile,
        partner1_first_name: profile.partner1?.first_name || '',
        partner1_last_name: profile.partner1?.last_name || '',
        partner1_age: profile.partner1?.age || 0,
        partner1_bio: profile.partner1?.bio || null,
        partner1_gender: profile.partner1?.gender || '',
        partner2_first_name: profile.partner2?.first_name || '',
        partner2_last_name: profile.partner2?.last_name || '',
        partner2_age: profile.partner2?.age || 0,
        partner2_bio: profile.partner2?.bio || null,
        partner2_gender: profile.partner2?.gender || ''
      })) as CoupleProfileView[];
    } catch (error) {
      logger.error('Error in getCoupleProfiles:', { error: String(error) });
      return [];
    }
  }

  /**
   * Crear perfil de pareja
   */
  async createCoupleProfile(data: CreateCoupleProfileData): Promise<CoupleProfile | null> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return null;
      }
      const { data: result, error } = await supabase
        .from('couple_profiles')
        .insert({
          couple_name: data.couple_name,
          couple_bio: data.couple_bio || null,
          relationship_type: data.relationship_type,
          partner1_id: data.partner1_id,
          partner2_id: data.partner2_id,
          couple_images: data.couple_images || null,
          is_verified: false,
          is_premium: false
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating couple profile:', { error: error.message });
        return null;
      }

      logger.info('Couple profile created successfully:', { id: result.id });
      return result as CoupleProfile;
    } catch (error) {
      logger.error('Error in createCoupleProfile:', { error: String(error) });
      return null;
    }
  }

  /**
   * Actualizar perfil de pareja
   */
  async updateCoupleProfile(id: string, data: UpdateCoupleProfileData): Promise<CoupleProfile | null> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return null;
      }
      const { data: result, error } = await supabase
        .from('couple_profiles')
        .update({
          couple_name: data.couple_name,
          couple_bio: data.couple_bio,
          couple_images: data.couple_images,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating couple profile:', { error: error.message });
        return null;
      }

      logger.info('Couple profile updated successfully:', { id: result.id });
      return result as CoupleProfile;
    } catch (error) {
      logger.error('Error in updateCoupleProfile:', { error: String(error) });
      return null;
    }
  }

  /**
   * Eliminar perfil de pareja
   */
  async deleteCoupleProfile(id: string): Promise<boolean> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return false;
      }
      const { error } = await supabase
        .from('couple_profiles')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting couple profile:', { error: error.message });
        return false;
      }

      logger.info('Couple profile deleted successfully:', { id });
      return true;
    } catch (error) {
      logger.error('Error in deleteCoupleProfile:', { error: String(error) });
      return false;
    }
  }

  /**
   * Obtener estadísticas de perfiles de pareja
   */
  async getCoupleProfileStats(): Promise<{
    totalProfiles: number;
    verifiedProfiles: number;
    premiumProfiles: number;
  }> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return { totalProfiles: 0, verifiedProfiles: 0, premiumProfiles: 0 };
      }
      const { count: totalCount, error: totalError } = await supabase
        .from('couple_profiles')
        .select('*', { count: 'exact', head: true });

      const { count: verifiedCount, error: verifiedError } = await supabase
        .from('couple_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', true);

      const { count: premiumCount, error: premiumError } = await supabase
        .from('couple_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_premium', true);

      if (totalError || verifiedError || premiumError) {
        logger.error('Error fetching couple profile stats:', { 
          totalError: totalError?.message, 
          verifiedError: verifiedError?.message, 
          premiumError: premiumError?.message 
        });
        return { totalProfiles: 0, verifiedProfiles: 0, premiumProfiles: 0 };
      }

      return {
        totalProfiles: totalCount || 0,
        verifiedProfiles: verifiedCount || 0,
        premiumProfiles: premiumCount || 0
      };
    } catch (error) {
      logger.error('Error in getCoupleProfileStats:', { error: String(error) });
      return { totalProfiles: 0, verifiedProfiles: 0, premiumProfiles: 0 };
    }
  }
}

// Exportar instancia singleton
export const coupleProfilesService = new CoupleProfilesServiceImpl();
export default coupleProfilesService;

