import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubble } from '@/components/ui/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/Button';
import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name?: string;
  sender_avatar?: string;
  created_at: string;
  is_own?: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  is_online?: boolean;
  last_seen?: string;
}

interface ChatContainerProps {
  chat: ChatUser;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  isTyping?: boolean;
  className?: string;
  enableAnimations?: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  chat,
  messages,
  onSendMessage,
  onBack,
  isTyping = false,
  className,
  enableAnimations = true
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isScrolledToBottom) {
      scrollToBottom();
    }
  }, [messages, isScrolledToBottom]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
    setIsScrolledToBottom(isAtBottom);
  };

  const _formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={enableAnimations ? { opacity: 0, scale: 0.95 } : false}
      animate={enableAnimations ? { opacity: 1, scale: 1 } : false}
      className={cn(
        "flex flex-col h-full bg-gradient-to-br from-white to-gray-50",
        "rounded-lg shadow-xl overflow-hidden",
        className
      )}
    >
      {/* Header del Chat */}
      <motion.div
        initial={enableAnimations ? { y: -20, opacity: 0 } : false}
        animate={enableAnimations ? { y: 0, opacity: 1 } : false}
        className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm border-b border-gray-200/50"
      >
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <Avatar className="w-10 h-10">
          <AvatarImage src={chat.avatar} alt={chat.name} />
          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
            {chat.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{chat.name}</h3>
          <p className="text-sm text-gray-500">
            {chat.is_online ? (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                En línea
              </span>
            ) : (
              `Última vez: ${chat.last_seen || 'Hace tiempo'}`
            )}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="h-4 w-4 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="h-4 w-4 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </motion.div>

      {/* Área de Mensajes */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2"
        onScroll={handleScroll}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.05) 0%, transparent 50%)
          `
        }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message, _index) => (
            <ChatBubble
              key={message.id}
              id={message.id}
              message={message.content}
              isOwn={message.sender_id === (message as any).currentUserId}
              timestamp={new Date(message.created_at).toLocaleTimeString()}
              senderAvatar={(message as any).sender?.avatar_url}
              senderName={(message as any).sender?.display_name}
            />
          ))}
        </AnimatePresence>

        {/* Indicador de escritura */}
        <AnimatePresence>
          {isTyping && (
            <TypingIndicator
              username={chat.name}
              avatar={chat.avatar}
            />
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Botón para scroll al final */}
      <AnimatePresence>
        {!isScrolledToBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToBottom}
            className="absolute bottom-20 right-6 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-gray-600" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input de Chat */}
      <ChatInput
        onSendMessage={onSendMessage}
        placeholder={`Mensaje para ${chat.name}...`}
        enableAnimations={enableAnimations}
      />
    </motion.div>
  );
};

