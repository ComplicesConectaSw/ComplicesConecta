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
import type { Database } from '@/integrations/supabase/types';

type ChatRoomRow = Database['public']['Tables']['chat_rooms']['Row'];
type ChatRoomInsert = Database['public']['Tables']['chat_rooms']['Insert'];
type ChatMemberRow = Database['public']['Tables']['chat_members']['Row'];
type ChatMemberInsert = Database['public']['Tables']['chat_members']['Insert'];
type MessageRow = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];
type ChatInvitationRow = Database['public']['Tables']['chat_invitations']['Row'];
type ChatInvitationInsert = Database['public']['Tables']['chat_invitations']['Insert'];

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

      // Crear sala privada
      const roomData: ChatRoomInsert = {
        name,
        is_public: false,
        is_active: true,
        created_by: user.user.id
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
        room_id: newRoom.id,
        profile_id: user.user.id,
        role: 'admin',
        is_muted: false
      };

      await supabase.from('chat_members').insert(creatorMember);

      // Agregar otros miembros
      const memberInserts: ChatMemberInsert[] = memberIds.map(memberId => ({
        room_id: newRoom.id,
        profile_id: memberId,
        role: 'member',
        is_muted: false
      }));

      if (memberInserts.length > 0) {
        await supabase.from('chat_members').insert(memberInserts);
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

      // Obtener salas públicas y privadas donde el usuario es miembro
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_members!inner(profile_id)
        `)
        .or(`is_public.eq.true,chat_members.profile_id.eq.${user.user.id}`)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) {
        return { success: false, error: `Error al obtener salas: ${error.message}` };
      }

      return {
        success: true,
        rooms: rooms.map(mapChatRoomRowToChatRoom)
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
    messageType: 'text' | 'image' | 'file' = 'text'
  ): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Verificar acceso a la sala
      const hasAccess = await this.canAccessRoom(roomId);
      if (!hasAccess) {
        return { success: false, error: 'Sin permisos para acceder a esta sala' };
      }

      const messageData: MessageInsert = {
        room_id: roomId,
        sender_id: user.user.id,
        content,
        message_type: messageType,
        is_deleted: false
      };

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error || !newMessage) {
        return { success: false, error: `Error al enviar mensaje: ${error?.message}` };
      }

      return {
        success: true,
        message: mapMessageRowToChatMessage(newMessage)
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
            .eq('id', newMessage.sender_id)
            .single();

          if (profile) {
            mappedMessage.sender_profile = {
              id: profile.id,
              first_name: profile.first_name,
              last_name: profile.last_name
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
      if (room.is_public) return true;

      // Si es el creador, tiene acceso
      if (room.created_by === user.user.id) return true;

      // Verificar si es miembro
      const { data: member, error: memberError } = await supabase
        .from('chat_members')
        .select('id')
        .eq('room_id', roomId)
        .eq('profile_id', user.user.id)
        .single();

      return !memberError && !!member;

    } catch (error) {
      console.error('Error al verificar acceso a sala:', error);
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
      const { data: invitation, error: updateError } = await supabase
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
          room_id: invitation.room_id!,
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
function mapChatRoomRowToChatRoom(row: ChatRoomRow): ChatRoom {
  return {
    id: row.id,
    name: row.name,
    type: row.is_public ? 'public' : 'private',
    created_by: row.created_by,
    created_at: row.created_at || '',
    updated_at: row.updated_at || '',
    description: row.description || undefined,
    is_active: row.is_active || false
  };
}

function mapMessageRowToChatMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    room_id: row.room_id || '',
    sender_id: row.sender_id,
    content: row.content,
    message_type: (row.message_type as 'text' | 'image' | 'file') || 'text',
    created_at: row.created_at || '',
    is_deleted: row.is_deleted || false
  };
}

function mapChatInvitationRowToChatInvitation(row: ChatInvitationRow): ChatInvitation {
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
