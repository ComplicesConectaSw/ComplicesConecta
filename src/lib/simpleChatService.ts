/**
 * SERVICIO DE CHAT SIMPLIFICADO PARA PRODUCCIÓN
 * Funciona con el esquema actual de Supabase
 */

import { supabase } from '@/integrations/supabase/client';

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
        console.error('Error obteniendo salas públicas:', publicError);
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
        console.error('Error obteniendo membresías:', memberError);
      }

      const privateRooms = memberRooms?.map(member => ({
        id: (member as any).chat_rooms.id,
        name: (member as any).chat_rooms.name,
        type: 'private' as const,
        description: (member as any).chat_rooms.description,
        created_at: (member as any).chat_rooms.created_at,
        updated_at: (member as any).chat_rooms.updated_at
      })) || [];

      const formattedPublicRooms: SimpleChatRoom[] = (publicRooms || []).map(room => ({
        id: room.id,
        name: room.name,
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
      const senderIds = [...new Set(messages?.map(m => m.sender_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', senderIds);

      const profileMap = new Map(
        profiles?.map(p => [p.id, `${p.first_name} ${p.last_name}`]) || []
      );

      const formattedMessages: SimpleChatMessage[] = (messages || []).map(message => ({
        id: message.id,
        content: message.content,
        sender_id: message.sender_id,
        sender_name: profileMap.get(message.sender_id) || 'Usuario desconocido',
        room_id: message.room_id || roomId,
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

      const formattedMessage: SimpleChatMessage = {
        id: message.id,
        content: message.content,
        sender_id: message.sender_id,
        sender_name: `${profile.first_name} ${profile.last_name}`,
        room_id: message.room_id || roomId,
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

  subscribeToRoomMessages(roomId: string, callback: (message: SimpleChatMessage) => void) {
    const subscription = supabase
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
          const newMessage = payload.new as any;
          
          // Obtener información del remitente
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', newMessage.sender_id)
            .single();

          const formattedMessage: SimpleChatMessage = {
            id: newMessage.id,
            content: newMessage.content,
            sender_id: newMessage.sender_id,
            sender_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Usuario desconocido',
            room_id: newMessage.room_id,
            created_at: newMessage.created_at,
            message_type: newMessage.message_type || 'text'
          };

          callback(formattedMessage);
        }
      )
      .subscribe();

    return subscription;
  }
}

export const simpleChatService = new SimpleChatService();
