/**
 * SERVICIO DE CHAT REAL-TIME - ComplicesConecta
 * 
 * Sistema completo de chat con soporte para:
 * - Salas públicas y privadas
 * - Mensajes en tiempo real con Supabase Realtime
 * - Invitaciones y permisos de acceso
 * - Multimedia (texto, imágenes, archivos)
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/types';
import { logger } from '@/lib/logger';

// Helper function to get current user ID
const _getCurrentUserId = async (): Promise<string | null> => {
  // This should be replaced with actual auth context
  return supabase.auth.getUser().then(({ data }) => data.user?.id || null).catch(() => null) as any;
}

type MessageRow = Database['public']['Tables']['messages']['Row'];
type _MessageInsert = Database['public']['Tables']['messages']['Insert'];

export interface ChatRoom {
  id: string;
  name: string;
  type: 'public' | 'private';
  created_by: string;
  created_at: string;
  updated_at: string;
  description?: string;
  is_active: boolean;
}

export interface ChatMember {
  id: string;
  room_id: string;
  profile_id: string;
  joined_at: string;
  role: 'admin' | 'member';
  is_muted: boolean;
}

export type ChatRoomInsert = any;
export type ChatMemberInsert = any;

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
  is_deleted: boolean;
  sender_profile?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export interface ChatInvitation {
  id: string;
  room_id: string;
  from_profile: string;
  to_profile: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export type ChatInvitationInsert = any;

class ChatService {
  private subscriptions: Map<string, any> = new Map();

  /**
   * Obtiene o crea la sala pública principal
   */
  async getPublicRoom(): Promise<{ success: boolean; room?: ChatRoom; error?: string }> {
    try {
      // Buscar sala pública existente
      const { data: existingRoom, error: searchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_public', true)
        .eq('is_active', true)
        .single();

      if (existingRoom && !searchError) {
        return {
          success: true,
          room: mapChatRoomRowToChatRoom(existingRoom)
        };
      }

      // Crear sala pública si no existe
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const roomData: ChatRoomInsert = {
        name: 'Chat Público',
        description: 'Sala de chat pública para todos los usuarios',
        is_public: true,
        is_active: true,
        created_by: user.user.id
      };

      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert(roomData)
        .select()
        .single();

      if (createError || !newRoom) {
        return { success: false, error: `Error al crear sala pública: ${createError?.message}` };
      }

      return {
        success: true,
        room: mapChatRoomRowToChatRoom(newRoom)
      };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Crea una sala privada con miembros específicos
   */
  async createPrivateRoom(
    name: string,
    memberIds: string[]
  ): Promise<{ success: boolean; room?: ChatRoom; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const userId = user.user.id;

      // Crear sala privada
      const roomData: ChatRoomInsert = {
        name,
        is_public: false,
        is_active: true,
        created_by: userId
      };

      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert(roomData)
        .select()
        .single();

      if (roomError || !newRoom) {
        return { success: false, error: `Error al crear sala: ${roomError?.message}` };
      }

      // Agregar creador como admin
      const creatorMember: ChatMemberInsert = {
        room_id: (newRoom as any).id,
        profile_id: userId,
        role: 'admin',
        is_muted: false
      };

      await supabase.from('chat_members').insert(creatorMember);

      // Agregar otros miembros
      const memberInserts: ChatMemberInsert[] = memberIds.map(memberId => ({
        room_id: (newRoom as any).id,
        profile_id: memberId,
        role: 'member',
        is_muted: false
      }));

      if (memberInserts.length > 0) {
        await supabase.from('chat_members').insert(memberInserts as any);
      }

      return {
        success: true,
        room: mapChatRoomRowToChatRoom(newRoom)
      };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Obtiene las salas de chat del usuario actual
   */
  async getUserRooms(): Promise<{ success: boolean; rooms?: ChatRoom[]; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const userId = user.user.id;

      // Obtener salas públicas y privadas donde el usuario es miembro
      const { data, error } = await (supabase as any)
        .from('chat_rooms')
        .select(`
          *,
          chat_members!inner(
            user_id,
            role,
            joined_at
          )
        `)
        .eq('chat_members.user_id', userId)
        .eq('is_active', true);

      if (error) {
        return { success: false, error: `Error al obtener salas: ${error.message}` };
      }

      const rooms = (data as any)?.map((room: any) => ({
        ...room,
        id: (room as any).id,
        lastMessage: null,
        unreadCount: 0
      })) || [];

      return {
        success: true,
        rooms
      };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Envía un mensaje a una sala
   */
  async sendMessage(
    roomId: string,
    content: string,
    _messageType: 'text' | 'image' | 'system' = 'text',
  ): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const userId = user.user.id;

      // Verificar acceso a la sala
      const hasAccess = await this.canAccessRoom(roomId);
      if (!hasAccess) {
        return { success: false, error: 'Sin permisos para acceder a esta sala' };
      }

      const messageData = {
        id: crypto.randomUUID(),
        content,
        senderId: userId,
        timestamp: Date.now(),
        type: 'text'
      };

      const { data: newMessage, error } = await (supabase as any)
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error || !newMessage) {
        return { success: false, error: `Error al enviar mensaje: ${error?.message}` };
      }

      return {
        success: true,
        message: newMessage as any
      };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Obtiene mensajes de una sala
   */
  async getRoomMessages(
    roomId: string,
    limit: number = 50
  ): Promise<{ success: boolean; messages?: ChatMessage[]; error?: string }> {
    try {
      // Verificar acceso a la sala
      const hasAccess = await this.canAccessRoom(roomId);
      if (!hasAccess) {
        return { success: false, error: 'Sin permisos para acceder a esta sala' };
      }

      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id(id, first_name, last_name)
        `)
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: `Error al obtener mensajes: ${error.message}` };
      }

      return {
        success: true,
        messages: messages.map(mapMessageRowToChatMessage).reverse()
      };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Suscribe a mensajes en tiempo real de una sala
   */
  subscribeToRoom(roomId: string, callback: (message: ChatMessage) => void): () => void {
    const subscription = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const newMessage = payload.new as MessageRow;
          const mappedMessage = mapMessageRowToChatMessage(newMessage);
          
          // Obtener información del perfil del remitente
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .eq('id', newMessage.sender_id || '')
            .single();

          if (profile) {
            mappedMessage.sender_profile = {
              id: (profile as any).id,
              first_name: (profile as any).first_name,
              last_name: (profile as any).last_name
            };
          }

          callback(mappedMessage);
        }
      )
      .subscribe();

    this.subscriptions.set(roomId, subscription);

    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
    };
  }

  /**
   * Cancela suscripción a una sala
   */
  unsubscribeFromRoom(roomId: string): void {
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
    }
  }

  /**
   * Verifica si el usuario puede acceder a una sala
   */
  async canAccessRoom(roomId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      // Obtener información de la sala
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .select('is_public, created_by')
        .eq('id', roomId)
        .single();

      if (roomError || !room) return false;

      // Si es pública, todos tienen acceso
      if ((room as any).is_public) return true;

      // Si es el creador, tiene acceso
      if ((room as any).created_by === user.user.id) return true;

      // Verificar si es miembro
      const { data: member, error: memberError } = await supabase
        .from('chat_members')
        .select('id')
        .eq('room_id', roomId)
        .eq('profile_id', user.user.id)
        .single();

      return !memberError && !!member;

    } catch (error) {
      logger.error('Error al verificar acceso a sala:', { error: String(error) });
      return false;
    }
  }

  /**
   * Invita a un usuario a una sala privada
   */
  async inviteToRoom(
    roomId: string,
    toProfileId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const invitationData: ChatInvitationInsert = {
        room_id: roomId,
        from_profile: user.user.id,
        to_profile: toProfileId,
        status: 'pending'
      };

      const { error } = await supabase
        .from('chat_invitations')
        .insert(invitationData);

      if (error) {
        return { success: false, error: `Error al enviar invitación: ${error.message}` };
      }

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Responde a una invitación de chat
   */
  async respondToInvitation(
    invitationId: string,
    accept: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Actualizar estado de la invitación
      const { data: invitation, error: updateError } = await (supabase as any)
        .from('chat_invitations')
        .update({ 
          status: accept ? 'accepted' : 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .eq('to_profile', user.user.id)
        .select()
        .single();

      if (updateError || !invitation) {
        return { success: false, error: `Error al responder invitación: ${updateError?.message}` };
      }

      // Si acepta, agregar como miembro
      if (accept) {
        const memberData: ChatMemberInsert = {
          room_id: (invitation as any).room_id,
          profile_id: user.user.id,
          role: 'member',
          is_muted: false
        };

        const { error: memberError } = await supabase
          .from('chat_members')
          .insert(memberData);

        if (memberError) {
          return { success: false, error: `Error al agregar miembro: ${memberError.message}` };
        }
      }

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Obtiene invitaciones pendientes del usuario
   */
  async getPendingInvitations(): Promise<{
    success: boolean;
    invitations?: ChatInvitation[];
    error?: string;
  }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data: invitations, error } = await supabase
        .from('chat_invitations')
        .select('*')
        .eq('to_profile', user.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: `Error al obtener invitaciones: ${error.message}` };
      }

      return {
        success: true,
        invitations: invitations.map(mapChatInvitationRowToChatInvitation)
      };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }
}

// Funciones de mapeo
function mapChatRoomRowToChatRoom(row: any): ChatRoom {
  return {
    id: row.id,
    name: row.name,
    type: row.is_public ? 'public' : 'private',
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    description: row.description,
    is_active: row.is_active
  };
}

function mapMessageRowToChatMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    room_id: (row as any).conversation_id || '',
    sender_id: row.sender_id || '',
    content: row.content,
    message_type: 'text' as 'text' | 'image' | 'file',
    created_at: row.created_at || '',
    is_deleted: false
  };
}

function mapChatInvitationRowToChatInvitation(row: any): ChatInvitation {
  return {
    id: row.id,
    room_id: row.room_id || '',
    from_profile: row.from_profile,
    to_profile: row.to_profile,
    status: (row.status as 'pending' | 'accepted' | 'declined') || 'pending',
    created_at: row.created_at || '',
    updated_at: row.updated_at || ''
  };
}

export const chatService = new ChatService();
