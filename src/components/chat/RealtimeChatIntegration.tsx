// =====================================================
// REALTIME CHAT INTEGRATION COMPONENT
// Fecha: 14/09/2025 08:58hrs
// Versión: v2.8.1 - Chat Real-time con Match System
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatMessage {
  id: string;
  match_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface ChatMatch {
  id: string;
  other_user: {
    id: string;
    display_name: string;
    avatar_url?: string;
    is_online?: boolean;
  };
  compatibility_score: number;
  unread_messages: number;
  last_interaction: string;
}

interface RealtimeChatIntegrationProps {
  matchId?: string;
  onBack?: () => void;
  className?: string;
}

export const RealtimeChatIntegration = ({ 
  matchId, 
  onBack, 
  className = "" 
}: RealtimeChatIntegrationProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<ChatMatch | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load match data and messages
  useEffect(() => {
    if (!matchId || !user) return;

    loadMatchData();
    loadMessages();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [matchId, user]);

  const loadMatchData = async () => {
    if (!matchId || !user) return;

    try {
      // Simular datos del match hasta que las tablas estén creadas
      const mockMatch: ChatMatch = {
        id: matchId,
        other_user: {
          id: 'other-user-id',
          display_name: 'Usuario Demo',
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          is_online: true
        },
        compatibility_score: 85,
        unread_messages: 0,
        last_interaction: new Date().toISOString()
      };

      setCurrentMatch(mockMatch);
    } catch (error) {
      console.error('Error loading match data:', error);
    }
  };

  const loadMessages = async () => {
    if (!matchId || !user) return;

    setIsLoading(true);
    try {
      // Simular mensajes hasta que las tablas estén creadas
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          match_id: matchId,
          user_id: 'other-user-id',
          content: '¡Hola! Me encanta tu perfil 😊',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user_profile: {
            display_name: 'Usuario Demo',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
          }
        },
        {
          id: '2',
          match_id: matchId,
          user_id: user.id,
          content: '¡Hola! Gracias, el tuyo también es muy interesante',
          created_at: new Date(Date.now() - 3000000).toISOString(),
          user_profile: {
            display_name: 'Tú',
            avatar_url: undefined
          }
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!matchId || !user) return;

    // Configurar suscripción a mensajes en tiempo real
    channelRef.current = supabase
      .channel(`match_chat_${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'match_interactions',
        filter: `match_id=eq.${matchId}`
      }, (payload) => {
        if (payload.new.interaction_type === 'message' && payload.new.user_id !== user.id) {
          const newMessage: ChatMessage = {
            id: payload.new.id,
            match_id: payload.new.match_id,
            user_id: payload.new.user_id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            user_profile: {
              display_name: currentMatch?.other_user.display_name || 'Usuario',
              avatar_url: currentMatch?.other_user.avatar_url
            }
          };
          
          setMessages(prev => [...prev, newMessage]);
        }
      })
      .subscribe();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !matchId || !user || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      // Simular envío hasta que las tablas estén creadas
      const mockMessage: ChatMessage = {
        id: Date.now().toString(),
        match_id: matchId,
        user_id: user.id,
        content: messageContent,
        created_at: new Date().toISOString(),
        user_profile: {
          display_name: 'Tú',
          avatar_url: undefined
        }
      };

      setMessages(prev => [...prev, mockMessage]);

      // TODO: Implementar envío real cuando las tablas estén creadas
      /*
      const { error } = await supabase
        .from('match_interactions')
        .insert({
          match_id: matchId,
          user_id: user.id,
          interaction_type: 'message',
          content: messageContent,
          metadata: { timestamp: new Date().toISOString() }
        });

      if (error) throw error;
      */

    } catch (error) {
      console.error('Error sending message:', error);
      // Restaurar mensaje en caso de error
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const markAsRead = async () => {
    if (!matchId || !user) return;

    try {
      // TODO: Implementar cuando las tablas estén creadas
      /*
      await supabase
        .from('match_interactions')
        .insert({
          match_id: matchId,
          user_id: user.id,
          interaction_type: 'view',
          metadata: { viewed_at: new Date().toISOString() }
        });
      */
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Marcar como leído al abrir el chat
  useEffect(() => {
    if (matchId && user) {
      markAsRead();
    }
  }, [matchId, user]);

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Debes iniciar sesión para usar el chat</p>
        </CardContent>
      </Card>
    );
  }

  if (!matchId || !currentMatch) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Selecciona un match para comenzar a chatear</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} flex flex-col h-full max-h-[600px]`}>
      {/* Header del chat */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentMatch.other_user.avatar_url} />
              <AvatarFallback>
                {currentMatch.other_user.display_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {currentMatch.other_user.display_name}
              </CardTitle>
              <div className="flex items-center gap-2">
                {currentMatch.other_user.is_online && (
                  <Badge variant="secondary" className="text-xs">
                    En línea
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {currentMatch.compatibility_score}% compatibilidad
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Área de mensajes */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.user_id === user.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      message.user_id === user.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                        locale: es
                      })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input de mensaje */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            disabled={isSending}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || isSending}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RealtimeChatIntegration;
