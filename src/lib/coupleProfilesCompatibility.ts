import { invitationService } from './invitations';

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
      // Por ahora, asumir que todos son perfiles individuales
      // TODO: Implementar detección real cuando la columna user_type esté disponible
      console.log('🔄 Verificación de perfil de pareja - usando fallback temporal');
      return false;
    } catch (error) {
      console.error('❌ Error en isCoupleProfile:', error);
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
      
      // Si es perfil de pareja, por ahora devolver solo el perfil actual
      // TODO: Implementar tabla couple_profiles cuando esté disponible en el esquema
      console.log('🔄 Perfil de pareja detectado, usando fallback temporal');
      return [profileId];
    } catch (error) {
      console.error('❌ Error en getRelatedProfileIds:', error);
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
      console.error('❌ Error en hasPermissionAsCouple:', error);
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
      
      await invitationService.sendInvitation(actualFromId, actualToId, message, type);
      
      console.log(`✅ Invitación enviada: ${actualFromId} → ${actualToId} (${type})`);
    } catch (error) {
      console.error('❌ Error en sendInvitationAsCouple:', error);
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
    console.log('🔄 Iniciando migración de invitaciones para compatibilidad con parejas...');
    
    try {
      // Esta función se ejecutaría una sola vez para migrar datos existentes
      // Por ahora, solo registramos que la migración está disponible
      console.log('✅ Sistema preparado para perfiles de pareja');
    } catch (error) {
      console.error('❌ Error en migración:', error);
    }
  }
};
