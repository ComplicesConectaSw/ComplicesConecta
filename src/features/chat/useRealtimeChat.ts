import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export interface RealtimeMessage {
  id: string;
  content: string;
  sender_id: string;
  room_id: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  reply_to?: string | null;
  is_edited?: boolean;
  is_deleted?: boolean;
  metadata?: {
    file_url?: string;
    file_name?: string;
    file_size?: number;
  };
}

export interface ChatRoom {
  id: string;
  name?: string;
  participants: string[];
  created_at: string;
  updated_at: string;
  last_message?: RealtimeMessage;
}

export interface TypingUser {
  user_id: string;
  user_name: string;
  timestamp: number;
}

interface UseRealtimeChatOptions {
  userId?: string;
  chatRoomId?: string;
  onMessageReceived?: (message: RealtimeMessage) => void;
  onMessageSent?: (message: RealtimeMessage) => void;
  onTypingUpdate?: (typingUsers: TypingUser[]) => void;
  _onTypingUpdate?: (typingUsers: TypingUser[]) => void;
  onUserJoined?: (userId: string) => void;
  onUserLeft?: (userId: string) => void;
  onError?: (error: Error) => void;
}

export const useRealtimeChat = ({
  userId,
  chatRoomId,
  onMessageReceived,
  onMessageSent,
  _onTypingUpdate,
  onUserJoined,
  onUserLeft,
  onError
}: UseRealtimeChatOptions) => {
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar mensajes históricos
  const loadMessages = useCallback(async (roomId: string) => {
    if (!roomId) return;
    
    setIsLoading(true);
    try {
      logger.info('📥 Cargando mensajes históricos para sala:', { roomId });
      
      if (!supabase) {
        logger.error('Supabase no está disponible');
        setIsLoading(false);
        return;
      }
      
      // Usar tabla messages existente con estructura compatible
      const { data, error } = await (supabase as any)
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at
        `)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        logger.error('❌ Error cargando mensajes:', error);
        return;
      }

      // Mapear a estructura RealtimeMessage
      const mappedMessages: RealtimeMessage[] = (data || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        room_id: roomId,
        created_at: msg.created_at || new Date().toISOString(),
        message_type: 'text' as const,
        reply_to: null,
        is_edited: false,
        is_deleted: false,
        metadata: {}
      }));

      setMessages(mappedMessages);
      logger.info('📨 Mensajes cargados:', { count: data?.length || 0 });
    } catch (error) {
      logger.error('Error in realtime subscription:', { error: String(error) });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback(async (
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    metadata?: Record<string, any>
  ) => {
    if (!chatRoomId || !userId || !content.trim()) return;

    try {
      logger.info('📤 Enviando mensaje:', { content, messageType, chatRoomId });

      if (!supabase) {
        logger.error('Supabase no está disponible');
        onError?.(new Error('Supabase no está disponible'));
        return;
      }

      const { data, error } = await (supabase as any)
        .from('messages')
        .insert({
          content: content.trim(),
          sender_id: userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('❌ Error enviando mensaje:', { error: String(error) });
        onError?.(error);
        return;
      }

      logger.info('📨 Mensaje recibido en tiempo real:', { payload: String(data) });
      
      // Crear mensaje compatible para el estado local
      const realtimeMessage: RealtimeMessage = {
        id: (data as any).id,
        content: (data as any).content,
        sender_id: (data as any).sender_id,
        room_id: chatRoomId,
        created_at: (data as any).created_at || new Date().toISOString(),
        message_type: messageType,
        reply_to: null,
        is_edited: false,
        is_deleted: false,
        metadata: metadata || {}
      };

      onMessageSent?.(realtimeMessage);
    } catch (error) {
      logger.error('Error in sendMessage:', { error: String(error) });
      onError?.(error as Error);
    }
  }, [chatRoomId, userId, onError, onMessageSent]);

  // Indicar que el usuario está escribiendo
  const sendTypingIndicator = useCallback((roomId: string, isTyping: boolean) => {
    if (!channelRef.current || !roomId || !userId) return;

    try {
      if (isTyping) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user_id: userId,
            chat_room_id: roomId,
            is_typing: true,
            timestamp: Date.now()
          }
        });

        // Auto-stop typing después de 3 segundos
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          sendTypingIndicator(roomId, false);
        }, 3000);
      } else {
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user_id: userId,
            chat_room_id: roomId,
            is_typing: false,
            timestamp: Date.now()
          }
        });
      }
    } catch (error) {
      logger.error('Error enviando typing indicator:', { error: String(error) });
    }
  }, [userId]);

  // Configurar canal de tiempo real
  useEffect(() => {
    if (!chatRoomId || !userId) return;

    logger.info('Initializing realtime chat for conversation:', { conversationId: chatRoomId });
    
    if (!supabase) {
      logger.error('Supabase no está disponible');
      return;
    }
    
    // Crear canal único para la sala de chat
    const channel = supabase.channel(`chat_room_${chatRoomId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: userId }
      }
    });

    channelRef.current = channel;

    // Escuchar nuevos mensajes
    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        logger.info('New message received:', { messageId: (payload.new as any).id });
        const newMessage = payload.new as RealtimeMessage;
        
        setMessages(prev => {
          // Evitar duplicados
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });

        onMessageReceived?.(newMessage);
      })
      
      // Escuchar indicadores de escritura
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, is_typing, timestamp } = payload.payload;
        
        if (user_id === userId) return; // Ignorar propio typing
        
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.user_id !== user_id);
          
          if (is_typing) {
            return [...filtered, { 
              user_id, 
              user_name: `Usuario ${user_id.slice(0, 8)}`, 
              timestamp 
            }];
          }
          
          return filtered;
        });
      })
      
      // Escuchar presencia (usuarios online)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state);
        setOnlineUsers(users);
        logger.info('Messages updated, count:', { count: messages.length });
      })
      
      .on('presence', { event: 'join' }, ({ key }) => {
        logger.info('Usuario se unió:', { key });
        onUserJoined?.(key);
      })
      
      .on('presence', { event: 'leave' }, ({ key }) => {
        logger.info('👋 Usuario se fue:', { key });
        onUserLeft?.(key);
      });

    // Suscribirse al canal
    channel.subscribe(async (status) => {
      logger.info('🔌 Canal conectado:', { status: String(status) });
      
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        
        // Trackear presencia
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString()
        });
        
        // Cargar mensajes históricos
        await loadMessages(chatRoomId);
      } else {
        setIsConnected(false);
      }
    });

    // Cleanup
    return () => {
      logger.info('🧹 Limpiando canal realtime');
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      channel.unsubscribe();
      channelRef.current = null;
      setIsConnected(false);
      setTypingUsers([]);
      setOnlineUsers([]);
    };
  }, [chatRoomId, userId, loadMessages, onMessageReceived, onUserJoined, onUserLeft]);

  // Limpiar typing indicators antiguos
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => 
        prev.filter(user => now - user.timestamp < 5000) // 5 segundos
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Callback para typing con debounce
  const handleTyping = useCallback((roomId: string) => {
    sendTypingIndicator(roomId, true);
  }, [sendTypingIndicator]);

  return {
    // Estado
    messages,
    typingUsers,
    isConnected,
    onlineUsers,
    isLoading,
    
    // Acciones
    sendMessage,
    sendTypingIndicator: handleTyping,
    loadMessages,
    
    // Utilidades
    isUserTyping: (userId: string) => typingUsers.some(u => u.user_id === userId),
    getTypingUsersText: () => {
      if (typingUsers.length === 0) return '';
      if (typingUsers.length === 1) return `${typingUsers[0].user_name} está escribiendo...`;
      if (typingUsers.length === 2) return `${typingUsers[0].user_name} y ${typingUsers[1].user_name} están escribiendo...`;
      return `${typingUsers.length} usuarios están escribiendo...`;
    }
  };
};

export default useRealtimeChat;
