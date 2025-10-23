import { invitationService } from '@/lib/invitations';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';

/**
 * Servicio de compatibilidad para perfiles de pareja
 * Garantiza que todas las funciones de invitaciones y permisos
 * funcionen correctamente con perfiles individuales y de pareja
 * 
 * NOTA: Implementación temporal con fallbacks hasta que el esquema
 * de base de datos incluya soporte completo para perfiles de pareja
 */

export interface CoupleProfileCompatibility {
  // Verificar si un perfil es de pareja
  isCoupleProfile(profileId: string): Promise<boolean>;
  
  // Obtener todos los IDs relacionados a un perfil (individual o pareja)
  getRelatedProfileIds(profileId: string): Promise<string[]>;
  
  // Verificar permisos considerando perfiles de pareja
  hasPermissionAsCouple(ownerProfileId: string, granteeProfileId: string, permissionType: 'gallery' | 'chat'): Promise<boolean>;
  
  // Enviar invitación considerando perfiles de pareja
  sendInvitationAsCouple(fromProfileId: string, toProfileId: string, message: string, type: 'profile' | 'gallery' | 'chat'): Promise<void>;
}

export const coupleProfileCompatibility: CoupleProfileCompatibility = {
  async isCoupleProfile(profileId: string): Promise<boolean> {
    try {
      // Verificar si el perfil tiene account_type = 'couple'
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', profileId)
        .single() as { data: any | null, error: any };

      if (error) {
        logger.warn('Error verificando tipo de perfil:', { error: error.message, profileId });
        return false;
      }

      return profile?.account_type === 'couple';
    } catch (error) {
      logger.error('❌ Error en isCoupleProfile:', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  },

  async getRelatedProfileIds(profileId: string): Promise<string[]> {
    try {
      const isCouple = await this.isCoupleProfile(profileId);
      
      if (!isCouple) {
        // Si es perfil individual, solo devolver el mismo ID
        return [profileId];
      }
      
      // Si es perfil de pareja, obtener los IDs de ambos partners
      const { data: coupleProfile, error } = await supabase
        .from('couple_profiles')
        .select('partner1_id, partner2_id')
        .or(`partner1_id.eq.${profileId},partner2_id.eq.${profileId}`)
        .single() as { data: any | null, error: any };

      if (error || !coupleProfile) {
        logger.warn('No se encontró perfil de pareja:', { profileId, error: error?.message });
        return [profileId];
      }

      return [coupleProfile.partner1_id, coupleProfile.partner2_id];
    } catch (error) {
      logger.error('❌ Error en getRelatedProfileIds:', { error: error instanceof Error ? error.message : String(error) });
      return [profileId]; // Fallback al perfil original
    }
  },

  async hasPermissionAsCouple(ownerProfileId: string, granteeProfileId: string, permissionType: 'gallery' | 'chat'): Promise<boolean> {
    try {
      // Obtener todos los IDs relacionados para ambos perfiles
      const ownerIds = await this.getRelatedProfileIds(ownerProfileId);
      const granteeIds = await this.getRelatedProfileIds(granteeProfileId);
      
      // Verificar permisos entre cualquier combinación de IDs
      for (const ownerId of ownerIds) {
        for (const granteeId of granteeIds) {
          let hasPermission = false;
          
          if (permissionType === 'gallery') {
            hasPermission = await invitationService.hasGalleryAccess(ownerId, granteeId);
          } else if (permissionType === 'chat') {
            hasPermission = await invitationService.hasChatAccess(ownerId, granteeId);
          }
          
          if (hasPermission) {
            return true; // Si cualquier combinación tiene permiso, devolver true
          }
        }
      }
      
      return false;
    } catch (error) {
      logger.error('❌ Error en hasPermissionAsCouple:', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  },

  async sendInvitationAsCouple(fromProfileId: string, toProfileId: string, message: string, type: 'profile' | 'gallery' | 'chat' = 'profile'): Promise<void> {
    try {
      // Obtener IDs relacionados
      const fromIds = await this.getRelatedProfileIds(fromProfileId);
      const toIds = await this.getRelatedProfileIds(toProfileId);
      
      // Enviar invitación desde el primer ID disponible al primer ID disponible
      const actualFromId = fromIds[0] || fromProfileId;
      const actualToId = toIds[0] || toProfileId;
      
      await invitationService.sendInvitation(actualFromId, actualToId, type);
      
      logger.info(`✅ Invitación enviada: ${actualFromId} → ${actualToId} (${type})`);
    } catch (error) {
      logger.error('❌ Error en sendInvitationAsCouple:', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
};

/**
 * Hook personalizado para usar en componentes React
 * Proporciona funciones de compatibilidad para perfiles de pareja
 */
export const useCoupleProfileCompatibility = () => {
  return {
    isCoupleProfile: coupleProfileCompatibility.isCoupleProfile,
    getRelatedProfileIds: coupleProfileCompatibility.getRelatedProfileIds,
    hasPermissionAsCouple: coupleProfileCompatibility.hasPermissionAsCouple,
    sendInvitationAsCouple: coupleProfileCompatibility.sendInvitationAsCouple,
    
    // Funciones de conveniencia
    async checkGalleryAccessAsCouple(ownerProfileId: string, granteeProfileId: string): Promise<boolean> {
      return coupleProfileCompatibility.hasPermissionAsCouple(ownerProfileId, granteeProfileId, 'gallery');
    },
    
    async checkChatAccessAsCouple(user1ProfileId: string, user2ProfileId: string): Promise<boolean> {
      return coupleProfileCompatibility.hasPermissionAsCouple(user1ProfileId, user2ProfileId, 'chat');
    },

    // Utilidades adicionales
    ...coupleProfileUtils
  };
};

/**
 * Utilidades adicionales para gestión de perfiles de pareja
 */
export const coupleProfileUtils = {
  /**
   * Crear un nuevo perfil de pareja
   */
  async createCoupleProfile(
    partner1Id: string, 
    partner2Id: string, 
    coupleData: {
      couple_name: string;
      couple_bio?: string;
      relationship_type: 'man-woman' | 'man-man' | 'woman-woman';
      couple_images?: string[];
    }
  ): Promise<string | null> {
    try {
      const { data, error } = (await supabase
        .from('couple_profiles')
        .insert({
          partner1_id: partner1Id,
          partner2_id: partner2Id,
          ...coupleData
        } as any)
        .select('id')
        .single()) as { data: any | null, error: any };

      if (error) {
        logger.error('Error creando perfil de pareja:', { error: error.message });
        return null;
      }

      // Actualizar account_type de ambos perfiles
      await supabase
        .from('profiles')
        .update({ account_type: 'couple' } as never)
        .in('id', [partner1Id, partner2Id]);

      logger.info('✅ Perfil de pareja creado exitosamente:', { coupleId: data.id });
      return data.id;
    } catch (error) {
      logger.error('❌ Error en createCoupleProfile:', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  },

  /**
   * Obtener información completa del perfil de pareja
   */
  async getCoupleProfileDetails(profileId: string): Promise<any | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('couple_profiles_with_partners')
        .select('*')
        .or(`partner1_id.eq.${profileId},partner2_id.eq.${profileId}`)
        .single();

      if (error) {
        logger.warn('No se encontró perfil de pareja:', { profileId, error: error.message });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('❌ Error en getCoupleProfileDetails:', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }
};
