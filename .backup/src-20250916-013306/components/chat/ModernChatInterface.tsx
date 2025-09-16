import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { UnifiedInput } from '@/components/ui/UnifiedInput';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, MessageCircle, Users, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  is_online?: boolean;
  last_seen?: string;
  last_message?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name?: string;
  sender_avatar?: string;
  created_at: string;
  is_own?: boolean;
}

interface ModernChatInterfaceProps {
  chats: ChatUser[];
  messages: Message[];
  selectedChat?: ChatUser;
  onSelectChat: (chat: ChatUser) => void;
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  isTyping?: boolean;
  className?: string;
}

export const ModernChatInterface: React.FC<ModernChatInterfaceProps> = ({
  chats,
  messages,
  selectedChat,
  onSelectChat,
  onSendMessage,
  onBack,
  isTyping = false,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState(chats);

  useEffect(() => {
    const filtered = chats.filter(chat =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChats(filtered);
  }, [chats, searchQuery]);

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Hace tiempo';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace un momento';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    return `Hace ${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <div className={cn("flex h-full bg-gray-50", className)}>
      {/* Lista de Chats */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={cn(
          "w-80 bg-white border-r border-gray-200 flex flex-col",
          selectedChat && "hidden md:flex"
        )}
      >
        {/* Header de la lista */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-pink-500" />
              Chats
            </h2>
            <UnifiedButton
              size="sm"
              variant="ghost"
              className="p-2 hover:bg-pink-50"
            >
              <Plus className="h-4 w-4 text-pink-500" />
            </UnifiedButton>
          </div>

          {/* Barra de búsqueda */}
          <UnifiedInput
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            glass
            className="w-full"
          />
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {filteredChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                onClick={() => onSelectChat(chat)}
                className={cn(
                  "p-4 border-b border-gray-50 cursor-pointer transition-all duration-200",
                  "hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50",
                  selectedChat?.id === chat.id && "bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                        {chat.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {chat.is_online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {chat.name}
                      </h3>
                      {chat.unread_count && chat.unread_count > 0 && (
                        <Badge className="bg-pink-500 text-white text-xs px-2 py-1">
                          {chat.unread_count}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {chat.last_message || 'Sin mensajes'}
                    </p>
                    
                    <p className="text-xs text-gray-400 mt-1">
                      {chat.is_online ? 'En línea' : formatLastSeen(chat.last_seen)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredChats.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron conversaciones</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatContainer
            chat={selectedChat}
            messages={messages}
            onSendMessage={onSendMessage}
            onBack={onBack}
            isTyping={isTyping}
            enableAnimations
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white"
          >
            <UnifiedCard
              glass
              className="max-w-md text-center"
              title="Selecciona una conversación"
              description="Elige un chat de la lista para comenzar a conversar"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-pink-500" />
                </div>
              </div>
              <UnifiedButton
                gradient
                className="w-full"
                onClick={() => filteredChats.length > 0 && onSelectChat(filteredChats[0])}
                disabled={filteredChats.length === 0}
              >
                <Users className="h-4 w-4 mr-2" />
                Comenzar Chat
              </UnifiedButton>
            </UnifiedCard>
          </motion.div>
        )}
      </div>
    </div>
  );
};
