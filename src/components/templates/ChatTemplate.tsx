import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileTheme } from '@/features/profile/useProfileTheme';
import { Gender, ProfileType, Theme } from '@/types';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Search, Send, Paperclip, Image, MoreVertical } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isOwn: boolean;
}

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen?: string;
  unreadCount?: number;
}

interface ChatTemplateProps {
  contacts?: ChatContact[];
  messages?: ChatMessage[];
  currentUserId?: string;
  theme?: Theme;
  profileType?: ProfileType;
  gender?: Gender;
  className?: string;
  onSendMessage?: (message: string) => void;
  onContactSelect?: (contactId: string) => void;
}

export const ChatTemplate: React.FC<ChatTemplateProps> = ({
  contacts = [],
  messages = [],
  currentUserId = 'user-1',
  theme = 'modern',
  profileType = 'single',
  gender = 'male',
  className,
  onSendMessage,
  onContactSelect
}) => {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get theme configuration
  const themeConfig = useProfileTheme(profileType, [gender as any], theme);

  // Demo data if none provided
  const demoContacts: ChatContact[] = contacts.length > 0 ? contacts : [
    {
      id: 'contact-1',
      name: 'Ana & Carlos',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      status: 'online',
      unreadCount: 2
    },
    {
      id: 'contact-2',
      name: 'María José',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      status: 'online'
    },
    {
      id: 'contact-3',
      name: 'Luis & Sofia',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'offline',
      lastSeen: 'hace 30 min'
    }
  ];

  const demoMessages: ChatMessage[] = messages.length > 0 ? messages : [
    {
      id: 'msg-1',
      content: '¡Hola! ¿Cómo están? Nos encantaría conocerlos mejor.',
      senderId: 'contact-1',
      senderName: 'Ana',
      timestamp: '10:30 AM',
      isOwn: false
    },
    {
      id: 'msg-2',
      content: '¡Hola Ana y Carlos! Nosotros también estamos emocionados de conocerlos.',
      senderId: currentUserId,
      senderName: 'Tú',
      timestamp: '10:32 AM',
      isOwn: true
    },
    {
      id: 'msg-3',
      content: '¿Les gustaría que nos encontremos para un café este fin de semana?',
      senderId: 'contact-1',
      senderName: 'Carlos',
      timestamp: '10:35 AM',
      isOwn: false
    }
  ];

  const selectedContact = demoContacts.find(c => c.id === selectedContactId);
  const filteredContacts = demoContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedContactId) {
      // Message object for future use
      const _message: ChatMessage = {
        id: `msg-${Date.now()}`,
        content: newMessage,
        senderId: currentUserId,
        senderName: 'Tú',
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };

      onSendMessage?.(newMessage);
      setNewMessage('');
    }
  };

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    onContactSelect?.(contactId);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [demoMessages]);

  return (
    <div className={cn("flex h-[600px] rounded-lg overflow-hidden shadow-xl", className)}>
      {/* Contacts Sidebar */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar contactos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="overflow-y-auto h-full">
          <AnimatePresence>
            {filteredContacts.map((contact) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn(
                  "p-4 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-700",
                  "hover:bg-gray-50 dark:hover:bg-gray-700",
                  selectedContactId === contact.id && "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-500"
                )}
                onClick={() => handleContactSelect(contact.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className={cn(
                      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                      contact.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {contact.name}
                      </h3>
                      {contact.unreadCount && (
                        <Badge className="bg-purple-500 text-white text-xs">
                          {contact.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {contact.status === 'online' ? 'En línea' : contact.lastSeen}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className={cn(
              "p-4 border-b border-gray-200 dark:border-gray-700",
              themeConfig.backgroundClass
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedContact.avatar}
                    alt={selectedContact.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className={cn("font-semibold", themeConfig.textClass)}>
                      {selectedContact.name}
                    </h2>
                    <p className={cn("text-sm", themeConfig.accentClass)}>
                      {selectedContact.status === 'online' ? 'En línea' : selectedContact.lastSeen}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className={themeConfig.textClass}>
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              <AnimatePresence>
                {demoMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex",
                      message.isOwn ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm",
                      message.isOwn
                        ? cn("text-white", themeConfig.backgroundClass)
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    )}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        message.isOwn 
                          ? themeConfig.accentClass 
                          : "text-gray-500 dark:text-gray-400"
                      )}>
                        {message.timestamp}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <Image className="w-5 h-5" />
                </Button>
                <Input
                  placeholder="Escribe tu mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={cn("btn-animated", themeConfig.backgroundClass)}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Selecciona un chat
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Elige un contacto para comenzar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
