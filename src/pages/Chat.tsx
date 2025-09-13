import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatList } from "@/components/chat/ChatList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, ArrowLeft, Heart, Users, Flame, Send, Lock, Globe, UserPlus, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useFeatures } from "@/hooks/useFeatures";
import { mockPrivacySettings } from "@/lib/data";
import { invitationService } from "@/lib/invitations";
import { InvitationDialog } from "@/components/invitations/InvitationDialog";
import { AnimatedTabs } from "@/components/ui/AnimatedTabs";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";

export interface ChatUser {
  id: number;
  name: string;
  image: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  unreadCount: number;
  isPrivate: boolean;
  roomType: 'private' | 'public';
}

export interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  type: 'text' | 'image';
}

const Chat = () => {
  const navigate = useNavigate();
  const { features } = useFeatures();

  // Permitir acceso al chat demo sin autenticación
  useEffect(() => {
    // Chat demo siempre disponible - no requiere autenticación
    console.log('Chat demo cargado - acceso libre');
  }, [navigate]);
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'private' | 'public'>('private');
  const [hasChatAccess, setHasChatAccess] = useState<{[key: number]: boolean}>({});
  
  // Load messages for a specific chat
  const loadMessages = (chatId: number) => {
    const mockMessages: Message[] = [
      { id: 1, senderId: chatId, content: "¡Hola! ¿Cómo están?", timestamp: "10:30", type: 'text' },
      { id: 2, senderId: 0, content: "¡Muy bien! ¿Y ustedes?", timestamp: "10:32", type: 'text' },
      { id: 3, senderId: chatId, content: "Genial, ¿les interesa conocernos mejor?", timestamp: "10:35", type: 'text' }
    ];
    setMessages(mockMessages);
  };

  // Check chat access permissions for private chats
  useEffect(() => {
    const checkChatAccess = async () => {
      const currentUserId = "1"; // Mock current user ID
      const accessMap: {[key: number]: boolean} = {};
      
      for (const chat of privateChats) {
        if (chat.isPrivate) {
          const access = await invitationService.hasChatAccess(currentUserId, chat.id.toString());
          accessMap[chat.id] = access;
        } else {
          accessMap[chat.id] = true; // Public chats are always accessible
        }
      }
      
      setHasChatAccess(accessMap);
    };
    
    checkChatAccess();
  }, []);

  // Get user from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    const roomType = urlParams.get('room') as 'private' | 'public' || 'private';
    
    setActiveTab(roomType);
    
    if (userId) {
      const allChats = [...privateChats, ...publicChats];
      const user = allChats.find(chat => chat.id.toString() === userId);
      if (user) {
        setSelectedChat(user);
        loadMessages(user.id);
      }
    }
  }, [activeTab]);
  
  // Private chats - conexiones verificadas
  const privateChats: ChatUser[] = [
    {
      id: 1,
      name: "Anabella & Julio",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop&crop=faces",
      lastMessage: "¿Están libres este fin de semana? 🔥",
      timestamp: "5 min",
      isOnline: true,
      unreadCount: 2,
      isPrivate: true,
      roomType: 'private'
    },
    {
      id: 2,
      name: "Sofía",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      lastMessage: "Me encantó conocerlos en la fiesta 💕",
      timestamp: "1 h",
      isOnline: true,
      unreadCount: 0,
      isPrivate: true,
      roomType: 'private'
    },
    {
      id: 3,
      name: "Carmen & Roberto",
      image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=100&h=100&fit=crop&crop=faces",
      lastMessage: "¿Vienen al evento VIP del sábado?",
      timestamp: "3 h",
      isOnline: false,
      unreadCount: 0,
      isPrivate: true,
      roomType: 'private'
    },
    {
      id: 4,
      name: "Raúl",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      lastMessage: "¿Qué tal si nos vemos para tomar algo?",
      timestamp: "2 h",
      isOnline: false,
      unreadCount: 1,
      isPrivate: true,
      roomType: 'private'
    }
  ];

  // Public chats - salas comunitarias
  const publicChats: ChatUser[] = [
    {
      id: 101,
      name: "🔥 Sala General Lifestyle",
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=100&h=100&fit=crop&crop=face",
      lastMessage: "¡Bienvenidos a la comunidad swinger!",
      timestamp: "10 min",
      isOnline: true,
      unreadCount: 5,
      isPrivate: false,
      roomType: 'public'
    },
    {
      id: 102,
      name: "💑 Parejas CDMX",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop&crop=faces",
      lastMessage: "Evento swinger este sábado en Polanco",
      timestamp: "30 min",
      isOnline: true,
      unreadCount: 12,
      isPrivate: false,
      roomType: 'public'
    },
    {
      id: 103,
      name: "🌟 Singles Lifestyle",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      lastMessage: "¿Alguien para intercambio hoy?",
      timestamp: "1 h",
      isOnline: true,
      unreadCount: 3,
      isPrivate: false,
      roomType: 'public'
    },
    {
      id: 104,
      name: "🎭 Eventos Privados",
      image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=100&h=100&fit=crop&crop=faces",
      lastMessage: "Club exclusivo abre sus puertas",
      timestamp: "2 h",
      isOnline: true,
      unreadCount: 8,
      isPrivate: false,
      roomType: 'public'
    }
  ];

  const getCurrentChats = () => {
    return activeTab === 'private' ? privateChats : publicChats;
  };

  const chats = getCurrentChats();

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const handleSendMessage = () => {
    if (!selectedChat || !newMessage.trim()) return;
    
    // Check chat access for private chats
    if (selectedChat.isPrivate && !hasChatAccess[selectedChat.id]) {
      alert('No tienes acceso a este chat privado. Necesitas una invitación aceptada.');
      return;
    }
    
    // Verificar permisos de mensajería según configuración de privacidad
    const canSendMessage = checkMessagePermissions(selectedChat);
    if (!canSendMessage) {
      alert('No puedes enviar mensajes a este usuario según su configuración de privacidad.');
      return;
    }
    
    const message: Message = {
      id: Date.now() + Math.random(),
      senderId: 0,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const checkMessagePermissions = (chat: ChatUser) => {
    if (!features.messagingPrivacy) return true;
    
    // Para chats públicos, siempre permitir
    if (chat.roomType === 'public') return true;
    
    // Para chats privados, verificar configuración
    const userPrivacySettings = mockPrivacySettings; // En producción, obtener del usuario específico
    
    switch (userPrivacySettings.allowMessages) {
      case 'everyone':
        return true;
      case 'connections_only':
        // Verificar si hay conexión aceptada (simulado)
        return true; // Por ahora siempre true para demo
      case 'none':
        return false;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen android-fix relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600">
      {/* Background matching Index page */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-pink-500/90 to-indigo-600/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400/20 via-pink-400/20 to-transparent"></div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row h-screen chat-container">
        {/* Sidebar - Lista de chats */}
        <div className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-1/3 bg-black/40 backdrop-blur-md border-r border-white/20`}>
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-black/60 backdrop-blur-md border-b border-white/30 shadow-lg rounded-lg mb-4">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedChat(null)}
                className="text-white hover:bg-white/20 md:hidden p-2"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="flex items-center justify-between flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">Conversaciones</h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20 p-2"
                    onClick={() => navigate('/chat-info')}
                    title="Información del sistema de chat"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20 p-2"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Tabs para Private/Public */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'private' | 'public')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <TabsTrigger 
                  value="private" 
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/80 hover:text-white flex items-center gap-2 cursor-pointer rounded-md"
                  onClick={() => setActiveTab('private')}
                >
                  <Lock className="h-4 w-4" />
                  Privado
                  {privateChats.reduce((acc, chat) => acc + chat.unreadCount, 0) > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {privateChats.reduce((acc, chat) => acc + chat.unreadCount, 0)}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="public" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/50 data-[state=active]:to-pink-600/50 data-[state=active]:text-white text-white hover:text-white flex items-center gap-2 cursor-pointer"
                  onClick={() => setActiveTab('public')}
                >
                  <Globe className="h-4 w-4" />
                  Público
                  {publicChats.reduce((acc, chat) => acc + chat.unreadCount, 0) > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {publicChats.reduce((acc, chat) => acc + chat.unreadCount, 0)}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="private" className="mt-4">
                <div className="text-white/70 text-sm mb-3 px-2">
                  💬 Chats privados con tus conexiones
                </div>
                <div className="space-y-2">
                  {privateChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        setSelectedChat(chat);
                        loadMessages(chat.id);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedChat?.id === chat.id
                          ? 'bg-white/20 border border-white/30'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img 
                            src={chat.image} 
                            alt={chat.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                          />
                          {chat.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-black/50"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white truncate flex items-center gap-2">
                              {chat.name}
                              <Lock className="h-3 w-3 text-purple-300" />
                            </h3>
                            <span className="text-xs text-white/60">{chat.timestamp}</span>
                          </div>
                          <p className="text-sm text-white/70 truncate">{chat.lastMessage}</p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="public" className="mt-4">
                <div className="text-white/70 text-sm mb-3 px-2">
                  🌍 Salas públicas de la comunidad
                </div>
                <div className="space-y-2">
                  {publicChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        setSelectedChat(chat);
                        loadMessages(chat.id);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedChat?.id === chat.id
                          ? 'bg-white/20 border border-white/30'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg border-2 border-white/20">
                            {chat.name.charAt(0)}
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-black/50"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white truncate flex items-center gap-2">
                              {chat.name}
                              <Globe className="h-3 w-3 text-green-300" />
                            </h3>
                            <span className="text-xs text-white/60">{chat.timestamp}</span>
                          </div>
                          <p className="text-sm text-white/70 truncate">{chat.lastMessage}</p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Área de chat */}
        <div className={`${selectedChat ? 'block' : 'hidden md:block'} flex-1 flex flex-col bg-black/20 backdrop-blur-sm`}>
          {selectedChat ? (
            <>
              {/* Header del chat */}
              <div className="p-4 border-b border-white/10 bg-black/30">
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="md:hidden text-white hover:bg-white/10 mr-2"
                    onClick={() => setSelectedChat(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  {selectedChat.roomType === 'public' ? (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold border-2 border-white/20">
                      {selectedChat.name.charAt(0)}
                    </div>
                  ) : (
                    <img 
                      src={selectedChat.image} 
                      alt={selectedChat.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{selectedChat.name}</h3>
                      {selectedChat.roomType === 'private' ? (
                        <Lock className="h-4 w-4 text-purple-300" />
                      ) : (
                        <Globe className="h-4 w-4 text-green-300" />
                      )}
                    </div>
                    <p className="text-sm text-white/60">
                      {selectedChat.roomType === 'public' 
                        ? `Sala pública • ${Math.floor(Math.random() * 50) + 10} miembros activos`
                        : selectedChat.isOnline ? 'En línea' : `Última vez ${selectedChat.timestamp}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 chat-messages scroll-container" style={{scrollBehavior: 'smooth'}}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl break-words word-wrap ${
                        message.senderId === 0
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-white/95 text-gray-900 shadow-md border border-gray-200 backdrop-blur-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === 0 ? 'text-purple-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input para enviar mensajes */}
              <div className="p-4 border-t border-white/10 bg-black/30 chat-input">
                {selectedChat.isPrivate && !hasChatAccess[selectedChat.id] ? (
                  <div className="text-center space-y-4 bg-black/50 rounded-lg p-6 border border-white/20">
                    <div className="flex items-center justify-center text-white mb-3">
                      <Lock className="h-6 w-6 mr-2" />
                      <span className="font-semibold text-lg">Chat privado bloqueado</span>
                    </div>
                    <p className="text-sm text-white/90 mb-6 leading-relaxed max-w-sm mx-auto">
                      Necesitas una invitación aceptada para chatear con {selectedChat.name}. Puedes enviar una invitación o esperar a que te envíen una.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        onClick={() => {
                          console.log('Enviando invitación...');
                          // Simulate invitation sent
                          setHasChatAccess(prev => ({...prev, [selectedChat.id]: true}));
                          alert('¡Invitación aceptada! Ahora puedes chatear.');
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Aceptar invitación
                      </Button>
                      <Button 
                        onClick={() => {
                          console.log('Rechazando invitación...');
                          // Properly reject the invitation and navigate back
                          setSelectedChat(null);
                          alert('Invitación rechazada. Has vuelto a la lista de chats.');
                        }}
                        variant="outline"
                        className="border-red-300/50 text-red-300 hover:bg-red-500/20 px-6 py-2 rounded-lg font-medium transition-all duration-200"
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {selectedChat.roomType === 'public' && (
                  <p className="text-xs text-white/50 mt-2 px-1">
                    🔒 Los mensajes en salas públicas son visibles para todos los miembros
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white/60">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Selecciona una conversación</h3>
                <p className="mb-4">
                  {activeTab === 'private' 
                    ? 'Elige un chat privado para conversar de forma segura'
                    : 'Únete a una sala pública para conocer la comunidad'
                  }
                </p>
                <div className="flex items-center justify-center text-sm space-x-4">
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-1 text-purple-400" />
                    <span>Chats privados encriptados</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1 text-green-400" />
                    <span>Salas públicas moderadas</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Navigation />
      
      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Chat;