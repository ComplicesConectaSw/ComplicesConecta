/**
 * ChatRoom - Componente principal de sala de chat con privacidad
 * 
 * Funcionalidades:
 * - Sistema de privacidad (aceptar/denegar chats)
 * - Solicitud de permisos de galería privada
 * - Integración con geolocalización
 * - Preparación para video chat futuro
 * 
 * @version 3.5.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Video, MapPin, Image, Lock, UserPlus, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/features/auth/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/useToast';
import { chatPrivacyService, ChatRequest } from '@/features/chat/ChatPrivacyService';
import { ConsentIndicator } from '@/components/chat/ConsentIndicator';
import { useConsentVerification } from '@/hooks/useConsentVerification';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { MessageList } from './MessageList';

interface ChatRoomProps {
  recipientId: string;
  recipientName: string;
  recipientImage?: string;
  chatRoomId?: string;
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  location_latitude?: number;
  location_longitude?: number;
  location_address?: string;
  is_own: boolean;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  recipientId,
  recipientName,
  recipientImage,
  chatRoomId,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location, getCurrentLocation } = useGeolocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatPermission, setChatPermission] = useState<ChatRequest | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [showGalleryRequest, setShowGalleryRequest] = useState(false);
  const [hasGalleryAccess, setHasGalleryAccess] = useState(false);
  const [isRequestingGallery, setIsRequestingGallery] = useState(false);

  // Hook de verificación de consentimiento
  const {
    verification,
    isPaused,
    startMonitoring,
    stopMonitoring
  } = useConsentVerification(chatRoomId || undefined);

  // Verificar permisos al cargar
  useEffect(() => {
    if (!user?.id) return;

    checkChatPermission();
    checkGalleryAccess();
    
    if (hasPermission && chatRoomId) {
      loadMessages();
      subscribeToMessages();
      
      // Iniciar monitoreo de consentimiento
      if (user.id && recipientId) {
        startMonitoring(chatRoomId, user.id, recipientId).catch((err) => {
          logger.error('Error iniciando monitoreo de consentimiento', { error: err });
        });
      }
    }

    // Cleanup: detener monitoreo al desmontar
    return () => {
      if (chatRoomId) {
        stopMonitoring(chatRoomId).catch((err) => {
          logger.error('Error deteniendo monitoreo de consentimiento', { error: err });
        });
      }
    };
  }, [user?.id, recipientId, chatRoomId, hasPermission, startMonitoring, stopMonitoring]);

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Verificar si tiene permiso para chatear
   */
  const checkChatPermission = async () => {
    if (!user?.id) return;

    try {
      const canChat = await chatPrivacyService.canChat(user.id, recipientId);
      
      if (canChat) {
        setHasPermission(true);
      } else {
        // Verificar si hay solicitud pendiente
        const request = await chatPrivacyService.getChatRequest(user.id, recipientId);
        if (request) {
          setChatPermission(request);
          setHasPermission(request.status === 'accepted');
        } else {
          setHasPermission(false);
        }
      }
    } catch (error) {
      logger.error('Error verificando permiso de chat:', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * Verificar acceso a galería
   */
  const checkGalleryAccess = async () => {
    if (!user?.id) return;

    try {
      const access = await chatPrivacyService.hasGalleryAccess(recipientId, user.id);
      setHasGalleryAccess(access);
    } catch (error) {
      logger.error('Error verificando acceso a galería:', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * Solicitar permiso para chatear
   */
  const requestChatPermission = async () => {
    if (!user?.id || isRequestingPermission) return;

    setIsRequestingPermission(true);
    try {
      const request = await chatPrivacyService.requestChatPermission(
        user.id,
        recipientId,
        'Me gustaría chatear contigo'
      );

      if (request) {
        setChatPermission(request);
        toast({
          title: 'Solicitud enviada',
          description: 'Esperando respuesta del usuario...'
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo enviar la solicitud'
      });
    } finally {
      setIsRequestingPermission(false);
    }
  };

  /**
   * Cargar mensajes del chat
   */
  const loadMessages = async () => {
    if (!user?.id) return;

    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return;
      }

      // Buscar mensajes usando room_id si existe, o filtrar por sender_id
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (chatRoomId) {
        query = query.eq('room_id', chatRoomId);
      } else {
        // Filtrar mensajes donde el usuario es el sender o el mensaje está en una sala compartida
        query = query.or(`sender_id.eq.${user.id},sender_id.eq.${recipientId}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content || '',
        sender_id: msg.sender_id || '',
        receiver_id: recipientId, // Usar recipientId como receiver
        created_at: msg.created_at || new Date().toISOString(),
        is_own: msg.sender_id === user.id
      }));

      setMessages(formattedMessages);
    } catch (error) {
      logger.error('Error cargando mensajes:', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * Suscribirse a nuevos mensajes en tiempo real
   */
  const subscribeToMessages = () => {
    if (!user?.id) return;

    if (!supabase) {
      logger.error('Supabase no está disponible');
      return () => {};
    }

    const channel = supabase
      .channel(`chat:${recipientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: chatRoomId ? `room_id.eq.${chatRoomId}` : `or(sender_id.eq.${user.id},sender_id.eq.${recipientId})`
        },
        (payload) => {
          const newMessage = payload.new as any;
          setMessages(prev => [...prev, {
            id: newMessage.id,
            content: newMessage.content || '',
            sender_id: newMessage.sender_id || '',
            receiver_id: recipientId,
            created_at: newMessage.created_at || new Date().toISOString(),
            is_own: newMessage.sender_id === user.id
          }]);
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  };

  /**
   * Enviar mensaje con verificación de consentimiento
   */
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user?.id || !hasPermission) return;

    // Bloquear envío si el chat está pausado por bajo consenso
    if (isPaused) {
      toast({
        variant: 'destructive',
        title: 'Chat pausado',
        description: verification?.pauseReason || 'El chat está pausado por bajo consenso. Por favor, espera a que mejore el consenso antes de enviar mensajes.'
      });
      return;
    }

    try {

      const messageData: any = {
        sender_id: user.id,
        content: newMessage.trim(),
        room_id: chatRoomId || null
      };

      // Agregar geolocalización si está disponible
      if (location?.latitude && location?.longitude) {
        messageData.location_latitude = location.latitude;
        messageData.location_longitude = location.longitude;
      }

      if (!supabase) {
        logger.error('Supabase no está disponible');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo enviar el mensaje'
        });
        return;
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // El monitoreo de consentimiento se actualiza automáticamente a través de Supabase Realtime
      // No es necesario actualizar manualmente aquí

      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      logger.error('Error enviando mensaje:', {
        error: error instanceof Error ? error.message : String(error)
      });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo enviar el mensaje'
      });
    }
  };

  /**
   * Solicitar acceso a galería privada
   */
  const requestGalleryAccess = async () => {
    if (!user?.id || isRequestingGallery) return;

    setIsRequestingGallery(true);
    try {
      const request = await chatPrivacyService.requestGalleryAccess(
        user.id,
        recipientId,
        'Me gustaría ver tu galería privada'
      );

      if (request) {
        toast({
          title: 'Solicitud enviada',
          description: 'Esperando aprobación para ver la galería privada'
        });
        setShowGalleryRequest(false);
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo enviar la solicitud'
      });
    } finally {
      setIsRequestingGallery(false);
    }
  };

  /**
   * Compartir ubicación
   */
  const handleShareLocation = async () => {
    try {
      await getCurrentLocation();
      toast({
        title: 'Ubicación actualizada',
        description: 'Tu ubicación se compartirá en el próximo mensaje'
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo obtener la ubicación'
      });
    }
  };

  // Si no tiene permiso, mostrar solicitud
  if (!hasPermission) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Avatar className="mx-auto h-20 w-20">
              <AvatarImage src={recipientImage} />
              <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">Iniciar Chat con {recipientName}</h3>
            <p className="text-muted-foreground">
              Necesitas permiso para chatear con este usuario
            </p>

            {chatPermission?.status === 'pending' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Solicitud pendiente de respuesta
                </AlertDescription>
              </Alert>
            )}

            {!chatPermission && (
              <Button
                onClick={requestChatPermission}
                disabled={isRequestingPermission}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isRequestingPermission ? 'Enviando...' : 'Solicitar Permiso'}
              </Button>
            )}

            {onClose && (
              <Button variant="outline" onClick={onClose} className="w-full">
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Interfaz de chat principal
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={recipientImage} />
            <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{recipientName}</h3>
            <Badge variant="secondary" className="text-xs">En línea</Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Video Chat (futuro) */}
          <Button variant="ghost" size="icon" title="Video Chat (Próximamente)" disabled>
            <Video className="h-5 w-5" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Indicador de consentimiento */}
      {chatRoomId && user?.id && recipientId && (
        <div className="px-4 py-2 border-b bg-muted/30">
          <ConsentIndicator
            chatId={chatRoomId}
            userId1={user.id}
            userId2={recipientId}
            currentUserId={user.id}
            onPauseChange={(paused) => {
              if (paused) {
                logger.warn('Chat pausado por bajo consenso', { chatRoomId });
              }
            }}
          />
        </div>
      )}

      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} currentUserId={user?.id || ''} />
        <div ref={messagesEndRef} />
      </div>

      {/* Solicitud de galería (si no tiene acceso) */}
      {!hasGalleryAccess && (
        <div className="px-4 py-2 border-t bg-muted/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGalleryRequest(true)}
            className="w-full"
          >
            <Image className="h-4 w-4 mr-2" />
            Solicitar Acceso a Galería Privada
          </Button>
        </div>
      )}

      {/* Formulario de envío */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-card">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleShareLocation}
            title="Compartir ubicación"
            disabled={isPaused}
          >
            <MapPin className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isPaused ? "Chat pausado - esperando mejor consenso..." : "Escribe un mensaje..."}
            className="flex-1"
            disabled={isPaused}
          />
          <Button type="submit" disabled={!newMessage.trim() || isPaused}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {isPaused && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            ⚠️ El chat está pausado por bajo consenso. El envío de mensajes está bloqueado.
          </p>
        )}
      </form>

      {/* Modal de solicitud de galería */}
      {showGalleryRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Lock className="h-6 w-6 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Solicitar Acceso a Galería</h3>
                </div>
                <p className="text-muted-foreground">
                  ¿Deseas solicitar acceso a la galería privada de {recipientName}?
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={requestGalleryAccess}
                    disabled={isRequestingGallery}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {isRequestingGallery ? 'Enviando...' : 'Solicitar'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowGalleryRequest(false)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};


