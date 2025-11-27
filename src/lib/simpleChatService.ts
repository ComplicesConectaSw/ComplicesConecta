/**
 * SERVICIO DE CHAT SIMPLIFICADO PARA PRODUCCIÓN
 * Funciona con el esquema actual de Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { Database } from '@/types/supabase-generated';

export interface SimpleChatRoom {
  id: string;
  name: string;
  type: 'public' | 'private';
  description?: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
}

export interface SimpleChatMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  room_id: string;
  created_at: string;
  message_type: string;
}

export class SimpleChatService {
  async getUserChatRooms(): Promise<{
    success: boolean;
    publicRooms?: SimpleChatRoom[];
    privateRooms?: SimpleChatRoom[];
    error?: string;
  }> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return { success: false, error: 'Supabase no está disponible' };
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Obtener salas públicas
      const { data: publicRooms, error: publicError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_public', true)
        .eq('is_active', true);

      if (publicError) {
        logger.error('Error obteniendo salas públicas:', { error: String(publicError) });
      }

      // Obtener salas privadas donde el usuario es miembro
      const { data: memberRooms, error: memberError } = await supabase
        .from('chat_members')
        .select(`
          room_id,
          chat_rooms!inner(*)
        `)
        .eq('profile_id', user.user.id);

      if (memberError) {
        logger.error('Error obteniendo membresías:', { error: String(memberError) });
      }

      type ChatMemberWithRoom = Database['public']['Tables']['chat_members']['Row'] & {
        chat_rooms: Database['public']['Tables']['chat_rooms']['Row'];
      };
      
      const privateRooms = (memberRooms as ChatMemberWithRoom[] | null)?.map((member) => ({
        id: member.chat_rooms.id,
        name: member.chat_rooms.name || 'Sala sin nombre',
        type: 'private' as const,
        description: (member.chat_rooms as Database['public']['Tables']['chat_rooms']['Row'] & { description?: string | null }).description || undefined,
        created_at: member.chat_rooms.created_at || new Date().toISOString(),
        updated_at: member.chat_rooms.updated_at || new Date().toISOString()
      })) || [];

      type ChatRoomRow = Database['public']['Tables']['chat_rooms']['Row'] & {
        description?: string | null;
        is_public?: boolean | null;
        is_active?: boolean | null;
      };
      
      const formattedPublicRooms: SimpleChatRoom[] = ((publicRooms || []) as unknown as ChatRoomRow[]).map((room) => ({
        id: room.id,
        name: room.name || 'Sala sin nombre',
        type: 'public' as const,
        description: room.description || undefined,
        created_at: room.created_at || new Date().toISOString(),
        updated_at: room.updated_at || new Date().toISOString()
      }));

      return {
        success: true,
        publicRooms: formattedPublicRooms,
        privateRooms
      };

    } catch (error) {
      return {
        success: false,
        error: `Error obteniendo salas: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  async getRoomMessages(roomId: string, limit: number = 50): Promise<{
    success: boolean;
    messages?: SimpleChatMessage[];
    error?: string;
  }> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return { success: false, error: 'Supabase no está disponible' };
      }

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      // Obtener información de los remitentes
      const senderIds = [...new Set((messages || []).map((m) => m.sender_id).filter((id): id is string => id !== null))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', senderIds);

      const profileMap = new Map(
        profiles?.map((p) => [p.id, `${p.first_name} ${p.last_name}`]) || []
      );

      const formattedMessages: SimpleChatMessage[] = (messages || [])
        .filter((message) => message.sender_id !== null && message.room_id !== null)
        .map((message) => ({
          id: message.id,
          content: message.content,
          sender_id: message.sender_id!,
          sender_name: profileMap.get(message.sender_id!) || 'Usuario desconocido',
          room_id: message.room_id!,
          created_at: message.created_at || new Date().toISOString(),
          message_type: message.message_type || 'text'
        }));

      return { success: true, messages: formattedMessages };

    } catch (error) {
      return {
        success: false,
        error: `Error obteniendo mensajes: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  async sendMessage(roomId: string, content: string, messageType: string = 'text'): Promise<{
    success: boolean;
    message?: SimpleChatMessage;
    error?: string;
  }> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return { success: false, error: 'Supabase no está disponible' };
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Obtener perfil del usuario
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('user_id', user.user.id)
        .single();

      if (!profile) {
        return { success: false, error: 'Perfil no encontrado' };
      }

      // Enviar mensaje
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: profile.id,
          room_id: roomId,
          message_type: messageType
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (!message.sender_id || !message.room_id) {
        return { success: false, error: 'Mensaje inválido: sender_id o room_id faltante' };
      }

      const formattedMessage: SimpleChatMessage = {
        id: message.id,
        content: message.content,
        sender_id: message.sender_id,
        sender_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Usuario',
        room_id: message.room_id,
        created_at: message.created_at || new Date().toISOString(),
        message_type: message.message_type || 'text'
      };

      return { success: true, message: formattedMessage };

    } catch (error) {
      return {
        success: false,
        error: `Error enviando mensaje: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  subscribeToRoomMessages(roomId: string, callback: (message: SimpleChatMessage) => void): {
    unsubscribe: () => void;
    channel: ReturnType<NonNullable<typeof supabase>['channel']> | null;
  } {
    if (!supabase) {
      logger.error('Supabase no está disponible');
      return {
        unsubscribe: () => {},
        channel: null
      };
    }

    const supabaseClient = supabase; // Guardar referencia para usar en callback
    const channel = supabaseClient
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const newMessage = payload.new as Database['public']['Tables']['messages']['Row'];
          
          if (!newMessage.sender_id || !newMessage.room_id) {
            logger.error('Mensaje inválido: sender_id o room_id faltante');
            return;
          }
          
          // Obtener información del remitente
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', newMessage.sender_id)
            .single();

          const formattedMessage: SimpleChatMessage = {
            id: newMessage.id,
            content: newMessage.content,
            sender_id: newMessage.sender_id,
            sender_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Usuario' : 'Usuario desconocido',
            room_id: newMessage.room_id,
            created_at: newMessage.created_at || new Date().toISOString(),
            message_type: newMessage.message_type || 'text'
          };

          callback(formattedMessage);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        if (supabaseClient) {
          supabaseClient.removeChannel(channel);
        }
      },
      channel: channel as ReturnType<typeof supabaseClient.channel> | null
    };
  }
}

export const simpleChatService = new SimpleChatService();
