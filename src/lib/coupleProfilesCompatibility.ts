import { invitationService } from '@/lib/invitations';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';

/**
 * Servicio de compatibilidad para perfiles de pareja
 * Garantiza que todas las funciones de invitaciones y permisos
 * funcionen correctamente con perfiles individuales y de pareja
 * 
 * IMPLEMENTACIÓN COMPLETA: Utiliza la tabla couple_profiles para
 * gestión real de perfiles de pareja con partner1_id y partner2_id
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
      // Verificar si el perfil existe en la tabla couple_profiles
      const { data: coupleProfile } = await supabase
        .from('couple_profiles')
        .select('id')
        .or(`partner1_id.eq.${profileId},partner2_id.eq.${profileId}`)
        .single();
      
      return !!coupleProfile;
    } catch (error) {
      logger.error('❌ Error en isCoupleProfile:', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  },

  async getRelatedProfileIds(profileId: string): Promise<string[]> {
    try {
      // Buscar si el perfil es parte de una pareja
      const { data: coupleProfile } = await supabase
        .from('couple_profiles')
        .select('partner1_id, partner2_id')
        .or(`partner1_id.eq.${profileId},partner2_id.eq.${profileId}`)
        .single();
      
      if (coupleProfile) {
        // Si es perfil de pareja, devolver ambos IDs de los partners
        return [coupleProfile.partner1_id, coupleProfile.partner2_id];
      }
      
      // Si es perfil individual, solo devolver el mismo ID
      return [profileId];
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
    }
  };
};

/**
 * Utilidad para migrar datos existentes a ser compatibles con perfiles de pareja
 */
export const migrateToCoupleFriendly = {
  async updateExistingInvitations(): Promise<void> {
    logger.info('🔄 Iniciando migración de invitaciones para compatibilidad con parejas...');
    
    try {
      // Esta función se ejecutaría una sola vez para migrar datos existentes
      // Por ahora, solo registramos que la migración está disponible
      logger.info('✅ Sistema preparado para perfiles de pareja');
    } catch (error) {
      logger.error('❌ Error en migración:', { error: error instanceof Error ? error.message : String(error) });
    }
  }
};
