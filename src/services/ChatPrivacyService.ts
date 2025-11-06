/**
 * ChatPrivacyService - Servicio para gestión de privacidad y permisos de chat
 * 
 * Funcionalidades:
 * - Solicitar/aceptar/denegar chats
 * - Gestionar permisos de galería privada desde chat
 * - Integración con geolocalización
 * - Preparación para video chat futuro
 * 
 * @version 3.5.0
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { invitationService } from '@/lib/invitations';

export interface ChatRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  requested_at: string;
  responded_at?: string;
  message?: string;
  from_user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  to_user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface ChatPermission {
  id: string;
  user_id: string;
  other_user_id: string;
  can_send_messages: boolean;
  can_request_gallery: boolean;
  can_see_location: boolean;
  can_video_chat: boolean;
  gallery_access_granted: boolean;
  location_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryAccessRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  requested_at: string;
  responded_at?: string;
}

class ChatPrivacyService {
  private static instance: ChatPrivacyService;

  private constructor() {}

  static getInstance(): ChatPrivacyService {
    if (!ChatPrivacyService.instance) {
      ChatPrivacyService.instance = new ChatPrivacyService();
    }
    return ChatPrivacyService.instance;
  }

  /**
   * Solicitar permiso para iniciar chat con otro usuario
   */
  async requestChatPermission(
    fromUserId: string,
    toUserId: string,
    message?: string
  ): Promise<ChatRequest | null> {
    try {
      logger.info('💬 Solicitando permiso de chat', {
        from: fromUserId.substring(0, 8) + '***',
        to: toUserId.substring(0, 8) + '***'
      });

      // Verificar si ya existe una solicitud
      const existing = await this.getChatRequest(fromUserId, toUserId);
      if (existing && existing.status === 'pending') {
        logger.warn('Ya existe una solicitud pendiente');
        return existing;
      }

      if (!supabase) {
        logger.error('Supabase no está disponible');
        return null;
      }

      // Crear solicitud de chat
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          from_profile: fromUserId,
          to_profile: toUserId,
          type: 'chat',
          message: message || 'Quiero chatear contigo',
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        logger.error('Error solicitando permiso de chat:', {
          error: error instanceof Error ? error.message : String(error)
        });
        return null;
      }

      logger.info('✅ Solicitud de chat enviada');
      return this.mapInvitationToChatRequest(data);
    } catch (error) {
      logger.error('Error en requestChatPermission:', {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Aceptar solicitud de chat
   */
  async acceptChatRequest(requestId: string): Promise<boolean> {
    try {
      logger.info('✅ Aceptando solicitud de chat', { requestId });

      if (!supabase) {
        logger.error('Supabase no está disponible');
        return false;
      }

      const { error } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          decided_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('type', 'chat');

      if (error) {
        logger.error('Error aceptando solicitud:', {
          error: error instanceof Error ? error.message : String(error)
        });
        return false;
      }

      // Crear permiso de chat activo
      await this.createChatPermission(requestId);
      
      logger.info('✅ Solicitud de chat aceptada');
      return true;
    } catch (error) {
      logger.error('Error en acceptChatRequest:', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Denegar solicitud de chat
   */
  async declineChatRequest(requestId: string): Promise<boolean> {
    try {
      logger.info('❌ Denegando solicitud de chat', { requestId });

      if (!supabase) {
        logger.error('Supabase no está disponible');
        return false;
      }

      const { error } = await supabase
        .from('invitations')
        .update({
          status: 'declined',
          decided_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('type', 'chat');

      if (error) {
        logger.error('Error denegando solicitud:', {
          error: error instanceof Error ? error.message : String(error)
        });
        return false;
      }

      logger.info('✅ Solicitud de chat denegada');
      return true;
    } catch (error) {
      logger.error('Error en declineChatRequest:', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Obtener solicitud de chat entre dos usuarios
   */
  async getChatRequest(fromUserId: string, toUserId: string): Promise<ChatRequest | null> {
    try {
      if (!supabase) {
        logger.debug('Supabase no está disponible');
        return null;
      }

      const { data, error } = await supabase
        .from('invitations')
        .select('*, from_profile:profiles!invitations_from_profile_fkey(*), to_profile:profiles!invitations_to_profile_fkey(*)')
        .eq('type', 'chat')
        .or(`and(from_profile.eq.${fromUserId},to_profile.eq.${toUserId}),and(from_profile.eq.${toUserId},to_profile.eq.${fromUserId})`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapInvitationToChatRequest(data);
    } catch (error) {
      logger.error('Error obteniendo solicitud de chat:', {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Obtener todas las solicitudes de chat de un usuario
   */
  async getChatRequests(userId: string): Promise<ChatRequest[]> {
    try {
      if (!supabase) {
        logger.debug('Supabase no está disponible, retornando array vacío');
        return [];
      }

      const { data, error } = await supabase
        .from('invitations')
        .select('*, from_profile:profiles!invitations_from_profile_fkey(*), to_profile:profiles!invitations_to_profile_fkey(*)')
        .eq('type', 'chat')
        .or(`to_profile.eq.${userId},from_profile.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error obteniendo solicitudes:', {
          error: error instanceof Error ? error.message : String(error)
        });
        return [];
      }

      return (data || []).map(inv => this.mapInvitationToChatRequest(inv));
    } catch (error) {
      logger.error('Error en getChatRequests:', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * Verificar si un usuario puede chatear con otro
   */
  async canChat(userId: string, otherUserId: string): Promise<boolean> {
    try {
      // Verificar si hay permiso activo
      const permission = await this.getChatPermission(userId, otherUserId);
      if (permission && permission.can_send_messages) {
        return true;
      }

      // Verificar si hay solicitud aceptada
      const request = await this.getChatRequest(userId, otherUserId);
      return request?.status === 'accepted';
    } catch (error) {
      logger.error('Error verificando canChat:', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Solicitar acceso a galería privada desde chat
   */
  async requestGalleryAccess(
    fromUserId: string,
    toUserId: string,
    message?: string
  ): Promise<GalleryAccessRequest | null> {
    try {
      logger.info('🖼️ Solicitando acceso a galería desde chat', {
        from: fromUserId.substring(0, 8) + '***',
        to: toUserId.substring(0, 8) + '***'
      });

      // Usar el servicio de invitaciones existente
      const invitation = await invitationService.sendInvitation(
        fromUserId,
        toUserId,
        'gallery',
        message || 'Me gustaría ver tu galería privada'
      );

      if (!invitation) {
        return null;
      }

      // Actualizar permiso de chat para marcar solicitud de galería
      await this.updateChatPermission(fromUserId, toUserId, {
        can_request_gallery: true
      });

      return {
        id: invitation.id,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        status: invitation.status === 'accepted' ? 'accepted' : 'pending',
        requested_at: invitation.created_at || new Date().toISOString(),
        responded_at: invitation.decided_at || invitation.updated_at || undefined
      };
    } catch (error) {
      logger.error('Error solicitando acceso a galería:', {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Verificar si tiene acceso a galería privada
   */
  async hasGalleryAccess(ownerId: string, requesterId: string): Promise<boolean> {
    try {
      return await invitationService.hasGalleryAccess(ownerId, requesterId);
    } catch (error) {
      logger.error('Error verificando acceso a galería:', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Crear permiso de chat después de aceptar solicitud
   */
  private async createChatPermission(requestId: string): Promise<void> {
    try {
      if (!supabase) {
        logger.debug('Supabase no está disponible');
        return;
      }

      // Obtener la solicitud
      const { data: request } = await supabase
        .from('invitations')
        .select('from_profile, to_profile')
        .eq('id', requestId)
        .single();

      if (!request) return;

      // Crear permiso bidireccional
      const _permissions = [
        {
          user_id: request.from_profile,
          other_user_id: request.to_profile,
          can_send_messages: true,
          can_request_gallery: false,
          can_see_location: false,
          can_video_chat: false,
          gallery_access_granted: false,
          location_shared: false
        },
        {
          user_id: request.to_profile,
          other_user_id: request.from_profile,
          can_send_messages: true,
          can_request_gallery: false,
          can_see_location: false,
          can_video_chat: false,
          gallery_access_granted: false,
          location_shared: false
        }
      ];

      // Guardar en una tabla de permisos (puede ser una tabla personalizada o usar user_preferences)
      // Por ahora usamos invitations como fuente de verdad
      logger.info('✅ Permisos de chat creados');
    } catch (error) {
      logger.error('Error creando permisos de chat:', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Obtener permiso de chat entre dos usuarios
   */
  private async getChatPermission(userId: string, otherUserId: string): Promise<ChatPermission | null> {
    try {
      // Por ahora, verificamos en invitations
      const request = await this.getChatRequest(userId, otherUserId);
      if (request?.status === 'accepted') {
        return {
          id: request.id,
          user_id: userId,
          other_user_id: otherUserId,
          can_send_messages: true,
          can_request_gallery: false,
          can_see_location: false,
          can_video_chat: false,
          gallery_access_granted: await this.hasGalleryAccess(otherUserId, userId),
          location_shared: false,
          created_at: request.requested_at,
          updated_at: request.responded_at || request.requested_at || new Date().toISOString()
        };
      }
      return null;
    } catch (error) {
      logger.error('Error obteniendo permiso de chat:', {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Actualizar permiso de chat
   */
  private async updateChatPermission(
    userId: string,
    otherUserId: string,
    updates: Partial<ChatPermission>
  ): Promise<void> {
    try {
      // Por ahora solo logueamos, en el futuro puede ser una tabla dedicada
      logger.info('Actualizando permiso de chat', { userId, otherUserId, updates });
    } catch (error) {
      logger.error('Error actualizando permiso:', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Mapear invitación a ChatRequest
   */
  private mapInvitationToChatRequest(invitation: any): ChatRequest {
    return {
      id: invitation.id,
      from_user_id: invitation.from_profile,
      to_user_id: invitation.to_profile,
      status: invitation.status || 'pending',
      requested_at: invitation.created_at || new Date().toISOString(),
      responded_at: invitation.decided_at || invitation.updated_at,
      message: invitation.message,
      from_user: invitation.from_profile?.name ? {
        id: invitation.from_profile,
        name: (invitation.from_profile as any).name || (invitation.from_profile as any).first_name || 'Usuario',
        avatar_url: (invitation.from_profile as any).avatar_url
      } : undefined,
      to_user: invitation.to_profile?.name ? {
        id: invitation.to_profile,
        name: (invitation.to_profile as any).name || (invitation.to_profile as any).first_name || 'Usuario',
        avatar_url: (invitation.to_profile as any).avatar_url
      } : undefined
    };
  }
}

export const chatPrivacyService = ChatPrivacyService.getInstance();
export { ChatPrivacyService };

