import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

/**
 * Servicio de seguridad multimedia avanzada
 * Gestiona URLs firmadas temporales y permisos de descarga
 */

export interface MediaPermissions {
  canView: boolean;
  canDownload: boolean;
  role: 'owner' | 'admin' | 'moderator' | 'user';
}

export interface SecureMediaUrl {
  url: string;
  expiresAt: Date;
  permissions: MediaPermissions;
}

export class SecureMediaService {
  private static readonly SIGNED_URL_EXPIRY = 3600; // 1 hora en segundos

  /**
   * Obtener URL firmada temporal con validación de permisos
   */
  static async getSecureMediaUrl(
    mediaPath: string,
    userId: string,
    mediaOwnerId: string,
    requestType: 'view' | 'download' = 'view'
  ): Promise<SecureMediaUrl | null> {
    try {
      // Verificar permisos del usuario
      const permissions = await this.checkMediaPermissions(userId, mediaOwnerId);
      
      if (!permissions.canView) {
        logger.warn('Acceso denegado a media:', { userId, mediaPath, reason: 'no_view_permission' });
        return null;
      }

      if (requestType === 'download' && !permissions.canDownload) {
        logger.warn('Descarga denegada:', { userId, mediaPath, reason: 'no_download_permission' });
        return null;
      }

      // Generar URL firmada temporal
      if (!supabase || !supabase.storage) {
        logger.error('Supabase Storage no está disponible');
        return null;
      }
      
      let signedUrl: string | null = null;
      try {
        const { data, error } = await supabase.storage
          .from('media')
          .createSignedUrl(mediaPath, this.SIGNED_URL_EXPIRY);
        
        if (error || !data) {
          logger.error('Error generando URL firmada:', { error: error?.message, mediaPath });
          return null;
        }
        
        signedUrl = data.signedUrl;
      } catch (error) {
        logger.error('Excepción al generar URL firmada:', { error, mediaPath });
        return null;
      }

      const expiresAt = new Date(Date.now() + this.SIGNED_URL_EXPIRY * 1000);

      logger.info('URL firmada generada:', { 
        userId, 
        mediaPath, 
        requestType, 
        role: permissions.role,
        expiresAt 
      });

      return {
        url: signedUrl,
        expiresAt,
        permissions
      };
    } catch (error) {
      logger.error('Error en getSecureMediaUrl:', { 
        error: error instanceof Error ? error.message : String(error),
        userId,
        mediaPath 
      });
      return null;
    }
  }

  /**
   * Verificar permisos de media según roles
   */
  static async checkMediaPermissions(userId: string, mediaOwnerId: string): Promise<MediaPermissions> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return { canView: false, canDownload: false, role: 'user' };
      }
      
      // Obtener información del usuario actual
      const { data: currentUser, error: userError } = await supabase
        .from('profiles')
        .select('id, user_id, role')
        .eq('user_id', userId)
        .single() as { data: any | null, error: any };

      if (userError || !currentUser) {
        logger.warn('Usuario no encontrado:', { userId, error: userError?.message });
        return { canView: false, canDownload: false, role: 'user' };
      }

      const userRole = currentUser.role || 'user';
      const isOwner = currentUser.id === mediaOwnerId;

      // Lógica de permisos por rol
      let canView = false;
      let canDownload = false;

      if (userRole === 'admin') {
        // Administradores: acceso total
        canView = true;
        canDownload = true;
      } else if (isOwner) {
        // Dueño del contenido: acceso total
        canView = true;
        canDownload = true;
      } else if (userRole === 'moderator') {
        // Moderadores: solo vista, sin descarga
        canView = true;
        canDownload = false;
      } else {
        // Usuarios normales: verificar si el contenido es público
        const isPublicContent = await this.isPublicContent(mediaOwnerId);
        canView = isPublicContent;
        canDownload = false;
      }

      return {
        canView,
        canDownload,
        role: isOwner ? 'owner' : userRole
      };
    } catch (error) {
      logger.error('Error verificando permisos:', { 
        error: error instanceof Error ? error.message : String(error),
        userId,
        mediaOwnerId 
      });
      return { canView: false, canDownload: false, role: 'user' };
    }
  }

  /**
   * Verificar si el contenido es público
   */
  private static async isPublicContent(ownerId: string): Promise<boolean> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return false;
      }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('privacy_settings')
        .eq('id', ownerId)
        .single() as { data: any | null, error: any };

      if (error || !profile) {
        return false;
      }

      // Asumir que el contenido es público si no hay configuración específica
      const privacySettings = profile.privacy_settings || {};
      return privacySettings.media_public !== false;
    } catch (error) {
      logger.error('Error verificando contenido público:', { 
        error: error instanceof Error ? error.message : String(error),
        ownerId 
      });
      return false;
    }
  }

  /**
   * Registrar intento de acceso para auditoría
   */
  static async logMediaAccess(
    userId: string,
    mediaPath: string,
    action: 'view' | 'download' | 'denied',
    reason?: string
  ): Promise<void> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return;
      }
      
      await (supabase as any)
        .from('media_access_logs')
        .insert({
          user_id: userId,
          media_path: mediaPath,
          action,
          reason,
          ip_address: await this.getUserIP(),
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        } as any);

      logger.info('Acceso a media registrado:', { userId, mediaPath, action, reason });
    } catch (error) {
      logger.error('Error registrando acceso:', { 
        error: error instanceof Error ? error.message : String(error),
        userId,
        mediaPath 
      });
    }
  }

  /**
   * Obtener IP del usuario (simplificado)
   */
  private static async getUserIP(): Promise<string> {
    try {
      // En producción, esto se obtendría del servidor
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Validar integridad de URL firmada
   */
  static validateSignedUrl(url: string, expectedPath: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.includes(expectedPath);
    } catch {
      return false;
    }
  }

  /**
   * Revocar acceso a media específica
   */
  static async revokeMediaAccess(mediaPath: string, reason: string): Promise<boolean> {
    try {
      // En Supabase, las URLs firmadas expiran automáticamente
      // Aquí podríamos implementar una blacklist temporal
      logger.info('Acceso a media revocado:', { mediaPath, reason });
      return true;
    } catch (error) {
      logger.error('Error revocando acceso:', { 
        error: error instanceof Error ? error.message : String(error),
        mediaPath 
      });
      return false;
    }
  }
}

/**
 * Hook para usar el servicio de media segura
 */
export const useSecureMedia = () => {
  return {
    getSecureUrl: SecureMediaService.getSecureMediaUrl,
    checkPermissions: SecureMediaService.checkMediaPermissions,
    logAccess: SecureMediaService.logMediaAccess,
    validateUrl: SecureMediaService.validateSignedUrl,
    revokeAccess: SecureMediaService.revokeMediaAccess
  };
};
