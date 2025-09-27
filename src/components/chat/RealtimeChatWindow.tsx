import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, Wifi, WifiOff, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface RealtimeChatWindowProps {
  chatRoomId: string;
  recipientId: string;
  recipientName: string;
  recipientImage?: string;
  onClose?: () => void;
}

export const RealtimeChatWindow: React.FC<RealtimeChatWindowProps> = ({
  chatRoomId,
  recipientId,
  recipientName,
  recipientImage,
  onClose
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isTypingInput, setIsTypingInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    typingUsers,
    isConnected,
    onlineUsers,
    isLoading,
    sendMessage,
    sendTypingIndicator,
    getTypingUsersText
  } = useRealtimeChat({
    userId: user?.id || '',
    chatRoomId,
    onMessageReceived: (message) => {
      logger.info('🔔 Nuevo mensaje recibido:', message);
      // Aquí podrías agregar notificaciones, sonidos, etc.
    },
    onUserJoined: (userId) => {
      logger.info('👋 Usuario se unió al chat:', { userId });
    },
    onUserLeft: (userId) => {
      logger.info('👋 Usuario salió del chat:', { userId });
    }
  });

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Manejar envío de mensaje
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user?.id) return;

    try {
      await sendMessage(newMessage, 'text');
      setNewMessage('');
      setIsTypingInput(false);
      
      // Focus en input después de enviar
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (error) {
      logger.error('❌ Error enviando mensaje:', { error: error instanceof Error ? error.message : String(error) });
    }
  };

  // Manejar typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Enviar typing indicator solo cuando empieza a escribir
    if (value.length > 0 && !isTypingInput) {
      setIsTypingInput(true);
      sendTypingIndicator(chatRoomId);
    } else if (value.length === 0 && isTypingInput) {
      setIsTypingInput(false);
    }
  };

  // Formatear timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Verificar si el destinatario está online
  const isRecipientOnline = onlineUsers.includes(recipientId);

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-white/50">
                <AvatarImage src={recipientImage} alt={recipientName} />
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                  {recipientName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Indicador de estado online */}
              <AnimatePresence>
                {isRecipientOnline && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-full h-full bg-green-400 rounded-full"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800">{recipientName}</h3>
              <div className="flex items-center space-x-2">
                {/* Estado de conexión */}
                <div className="flex items-center space-x-1">
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs text-gray-500">
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                
                {/* Usuarios online */}
                {onlineUsers.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {onlineUsers.length}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-8 w-8">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "flex",
                  message.sender_id === user?.id ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2 break-words",
                    "backdrop-blur-sm border shadow-sm",
                    message.sender_id === user?.id
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300/30"
                      : "bg-white/80 text-gray-800 border-gray-200/50"
                  )}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      message.sender_id === user?.id ? "text-white/70" : "text-gray-500"
                    )}
                  >
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {/* Indicador de typing */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 rounded-2xl px-4 py-2 flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {getTypingUsersText()}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200/50 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={handleInputChange}
            disabled={!isConnected}
            className="flex-1 bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-purple-300 focus:ring-purple-200"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || !isConnected}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2">
            Sin conexión. Reintentando...
          </p>
        )}
      </form>
    </div>
  );
};

export default RealtimeChatWindow;
