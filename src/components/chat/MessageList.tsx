/**
 * MessageList - Componente para listar mensajes en el chat
 * 
 * Funcionalidades:
 * - Muestra lista de mensajes con formato adecuado
 * - Soporte para mensajes propios y ajenos
 * - Indicadores de tiempo y estado
 * - Soporte para ubicaciones compartidas
 * 
 * @version 3.5.0
 */

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  is_own: boolean;
  sender_name?: string;
  sender_avatar?: string;
}

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  recipientName?: string;
  recipientAvatar?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  recipientName,
  recipientAvatar
}) => {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-muted-foreground space-y-2">
          <p className="text-lg font-medium">No hay mensajes aún</p>
          <p className="text-sm">Comienza la conversación enviando un mensaje</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const isOwn = message.is_own || message.sender_id === currentUserId;
        const showAvatar = !isOwn && (
          index === 0 || 
          messages[index - 1].sender_id !== message.sender_id ||
          new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000 // 5 minutos
        );

        const timeAgo = formatDistanceToNow(new Date(message.created_at), {
          addSuffix: true,
          locale: es
        });

        return (
          <div
            key={message.id}
            className={cn(
              'flex items-end space-x-2',
              isOwn ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            )}
          >
            {/* Avatar (solo para mensajes ajenos) */}
            {showAvatar && !isOwn && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={recipientAvatar || message.sender_avatar} />
                <AvatarFallback>
                  {(recipientName || message.sender_name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            
            {!showAvatar && !isOwn && (
              <div className="w-8" /> // Espaciador
            )}

            {/* Mensaje */}
            <div
              className={cn(
                'flex flex-col max-w-[70%]',
                isOwn ? 'items-end' : 'items-start'
              )}
            >
              {/* Contenido del mensaje */}
              <div
                className={cn(
                  'rounded-lg px-4 py-2 break-words',
                  isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Ubicación compartida */}
                {message.location && (
                  <div className="mt-2 pt-2 border-t border-white/20 flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs">
                      {message.location.address || 
                       `${message.location.latitude.toFixed(4)}, ${message.location.longitude.toFixed(4)}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Tiempo */}
              <span
                className={cn(
                  'text-xs text-muted-foreground mt-1 px-1',
                  isOwn ? 'text-right' : 'text-left'
                )}
              >
                {timeAgo}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

