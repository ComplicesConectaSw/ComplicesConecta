/**
 * SERVICIO DE CHAT SIMPLIFICADO PARA PRODUCCIÓN - ComplicesConecta
 * 
 * Sistema de chat basado en esquema actual de Supabase:
 * - Usa tablas existentes (chat_rooms, messages, profiles)
 * - Chats públicos y privados funcionales
 * - Sin dependencias de tablas inexistentes
 * - Mensajes en tiempo real
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface ProductionChatRoom {
  id: string;
  name: string;
  type: 'public' | 'private';
  created_by: string;
  created_at: string;
  updated_at: string;
  description?: string;
  is_active: boolean;
  participant_count: number;
  last_message?: string;
  last_message_at?: string;
}

export interface ProductionChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
  is_deleted: boolean;
  sender_profile: {
    id: string;
    display_name: string;
    first_name: string;
    last_name: string;
    account_type: 'single' | 'couple';
    partner_first_name?: string;
    partner_last_name?: string;
  };
}

export interface ChatParticipant {
  profile_id: string;
  display_name: string;
  account_type: 'single' | 'couple';
  is_online: boolean;
  joined_at: string;
}

class ProductionChatService {
  private subscriptions: Map<string, any> = new Map();

  /**
   * Obtiene todas las salas de chat disponibles para el usuario
   */
  async getUserChatRooms(): Promise<{ 
    success: boolean; 
    publicRooms?: ProductionChatRoom[]; 
    privateRooms?: ProductionChatRoom[];
    error?: string 
  }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Obtener salas públicas
      const { data: publicRooms, error: publicError } = await (supabase as any)
        .from('chat_rooms')
        .select('*')
        .eq('is_public', true)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (publicError) {
        logger.error('Error obteniendo salas públicas:', publicError);
        // Continuar sin error crítico
      }

      // Obtener salas privadas donde el usuario es miembro
      const { data: privateRooms, error: privateError } = await (supabase as any)
        .from('chat_rooms')
        .select(`
          *,
          chat_members!inner(profile_id)
        `)
        .eq('is_public', false)
        .eq('is_active', true)
        .eq('chat_members.profile_id', user.user.id)
        .order('updated_at', { ascending: false });

      if (privateError) {
        logger.error('Error obteniendo salas privadas:', privateError);
        // Continuar sin error crítico
      }

      const mapRoomData = (rooms: unknown[]): ProductionChatRoom[] => {
        if (!rooms) return [];
        return rooms.map(room => {
          const r = room as { id: string; name: string; is_public: boolean; created_by: string; created_at?: string; updated_at?: string; description?: string; is_active?: boolean };
          return {
            id: r.id,
            name: r.name,
            type: r.is_public ? 'public' : 'private',
            created_by: r.created_by,
            created_at: r.created_at || '',
            updated_at: r.updated_at || '',
            description: r.description || undefined,
            is_active: r.is_active || false,
            participant_count: r.is_public ? 0 : 1,
            last_message: undefined,
            last_message_at: undefined
          };
        });
      };

      return {
        success: true,
        publicRooms: mapRoomData(publicRooms || []),
        privateRooms: mapRoomData(privateRooms || [])
      };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Crea una sala de chat pública
   */
  async createPublicChatRoom(name: string, description?: string): Promise<{ 
    success: boolean; 
    room?: ProductionChatRoom; 
    error?: string 
  }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data: newRoom, error: roomError } = await (supabase as any)
        .from('chat_rooms')
        .insert({
          name,
          description,
          is_public: true,
          is_active: true,
          created_by: user.user.id
        })
        .select()
        .single();

      if (roomError || !newRoom) {
        return { success: false, error: `Error al crear sala: ${roomError?.message}` };
      }

      return {
        success: true,
        room: {
          id: newRoom.id,
          name: newRoom.name,
          type: 'public',
          created_by: newRoom.created_by,
          created_at: newRoom.created_at || '',
          updated_at: newRoom.updated_at || '',
          description: newRoom.description || undefined,
          is_active: newRoom.is_active || false,
          participant_count: 0
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Obtiene mensajes de una sala específica
   */
  async getRoomMessages(
    roomId: string,
    limit: number = 50
  ): Promise<{ success: boolean; messages?: ProductionChatMessage[]; error?: string }> {
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

      const { data: messages, error } = await (supabase as any)
        .from('messages')
        .select(`
          id,
          room_id,
          sender_id,
          content,
          message_type,
          created_at,
          is_deleted
        `)
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: `Error al obtener mensajes: ${error.message}` };
      }

      // Obtener información de perfiles de los remitentes
      const senderIds = [...new Set(messages.map((msg: { sender_id: string }) => msg.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name
        `)
        .in('id', senderIds.filter((id): id is string => typeof id === 'string'));

      const profileMap = new Map(profiles?.map((p) => [p.id, { 
        id: p.id, 
        first_name: p.first_name || '', 
        last_name: p.last_name || '' 
      }]) || []);

      const productionMessages: ProductionChatMessage[] = messages.map((msg: { id: string; content: string; sender_id: string; created_at: string; message_type?: string; room_id?: string; is_deleted?: boolean }) => {
        const profile = profileMap.get(msg.sender_id) as { id: string; first_name: string; last_name: string } | undefined;
        const displayName = profile 
          ? profile.first_name
          : 'Usuario';

        return {
          id: msg.id,
          room_id: msg.room_id || '',
          sender_id: msg.sender_id,
          content: msg.content,
          message_type: (msg.message_type as 'text' | 'image' | 'file') || 'text',
          created_at: msg.created_at || '',
          is_deleted: msg.is_deleted || false,
          sender_profile: {
            id: profile?.id || msg.sender_id,
            display_name: displayName,
            first_name: profile?.first_name || 'Usuario',
            last_name: profile?.last_name || '',
            account_type: 'single' as 'single' | 'couple',
            partner_first_name: undefined,
            partner_last_name: undefined
          }
        };
      }).reverse();

      return { success: true, messages: productionMessages };

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
  ): Promise<{ success: boolean; message?: ProductionChatMessage; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Verificar acceso a la sala
      const hasAccess = await this.canAccessRoom(roomId);
      if (!hasAccess) {
        return { success: false, error: 'Sin permisos para enviar mensajes en esta sala' };
      }

      const { data: newMessage, error } = await (supabase as any)
        .from('messages')
        .insert({
          room_id: roomId,
          sender_id: user.user.id,
          content: content.trim(),
          message_type: messageType,
          is_deleted: false
        })
        .select()
        .single();

      if (error || !newMessage) {
        return { success: false, error: `Error al enviar mensaje: ${error?.message}` };
      }

      // Actualizar timestamp de la sala
      await (supabase as any)
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', roomId);

      // Obtener información del perfil del remitente
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name
        `)
        .eq('id', user.user.id)
        .single();

      const displayName = profile 
        ? profile.first_name
        : 'Usuario';

      const productionMessage: ProductionChatMessage = {
        id: newMessage.id,
        room_id: newMessage.room_id || '',
        sender_id: newMessage.sender_id,
        content: newMessage.content,
        message_type: (newMessage.message_type as 'text' | 'image' | 'file') || 'text',
        created_at: newMessage.created_at || '',
        is_deleted: newMessage.is_deleted || false,
        sender_profile: {
          id: profile?.id || user.user.id,
          display_name: displayName,
          first_name: profile?.first_name || 'Usuario',
          last_name: profile?.last_name || '',
          account_type: 'single' as 'single' | 'couple',
          partner_first_name: undefined,
          partner_last_name: undefined
        }
      };

      return { success: true, message: productionMessage };

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
  subscribeToRoomMessages(
    roomId: string, 
    callback: (message: ProductionChatMessage) => void
  ): () => void {
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
          const newMessage = payload.new as any;
          
          // Obtener información del perfil del remitente
          const { data: profile } = await (supabase as any)
            .from('profiles')
            .select(`
              id,
              first_name,
              last_name
            `)
            .eq('id', newMessage.sender_id)
            .single();

          if (profile) {
            const displayName = profile.first_name;

            const productionMessage: ProductionChatMessage = {
              id: newMessage.id,
              room_id: newMessage.room_id || '',
              sender_id: newMessage.sender_id,
              content: newMessage.content,
              message_type: (newMessage.message_type as 'text' | 'image' | 'file') || 'text',
              created_at: newMessage.created_at || '',
              is_deleted: newMessage.is_deleted || false,
              sender_profile: {
                id: profile.id,
                display_name: displayName,
                first_name: profile.first_name,
                last_name: profile.last_name,
                account_type: 'single' as 'single' | 'couple',
                partner_first_name: undefined,
                partner_last_name: undefined
              }
            };

            callback(productionMessage);
          }
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
   * Verifica si el usuario puede acceder a una sala
   */
  async canAccessRoom(roomId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      // Obtener información de la sala
      const { data: room, error: roomError } = await (supabase as any)
        .from('chat_rooms')
        .select('is_public, created_by')
        .eq('id', roomId)
        .single();

      if (roomError || !room) return false;

      // Si es pública, todos tienen acceso
      if (room.is_public) return true;

      // Si es el creador, tiene acceso
      if (room.created_by === user.user.id) return true;

      // Verificar si es miembro de la sala privada
      const { data: member, error: memberError } = await (supabase as any)
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
   * Cancela todas las suscripciones activas
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }
}

export const productionChatService = new ProductionChatService();
