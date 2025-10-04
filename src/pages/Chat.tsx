import { useState, useEffect } from "react";
import { MessageCircle, Video, MoreVertical, ArrowLeft, Heart, Send, Lock, Globe, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UnifiedButton } from "@/components/ui/UnifiedButton";
import { UnifiedInput } from "@/components/ui/UnifiedInput";
import { useNavigate } from "react-router-dom";
import { useFeatures } from "@/hooks/useFeatures";
import { toast } from "@/hooks/use-toast";
import NavigationEnhanced from "@/components/NavigationEnhanced";
// import { Header } from "@/components/Header";
import { mockPrivacySettings } from "@/lib/data";
import { invitationService } from "@/lib/invitations";
import { simpleChatService, type SimpleChatRoom, type SimpleChatMessage } from '@/lib/simpleChatService';
import { logger } from '@/lib/logger';

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

  // Estados para chat real y demo
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [realMessages, setRealMessages] = useState<SimpleChatMessage[]>([]);
  const [realRooms, setRealRooms] = useState<SimpleChatRoom[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'private' | 'public'>('private');
  const [tabError, setTabError] = useState<string | null>(null);
  const [hasChatAccess, setHasChatAccess] = useState<{[key: number]: boolean}>({});
  const [isProduction, setIsProduction] = useState(false);
  const [_isLoading, _setIsLoading] = useState(false);

  // Detectar modo de operación (demo vs producción)
  useEffect(() => {
    const demoAuth = localStorage.getItem('demo_authenticated');
    const isDemo = demoAuth === 'true';
    setIsProduction(!isDemo);
    
    if (!isDemo) {
      // Modo producción - cargar datos reales
      loadRealChatData();
    } else {
      // Modo demo - usar datos mock SIEMPRE
      logger.info('Chat demo cargado - acceso libre');
      // Forzar acceso a todos los chats demo
      const demoAccessMap: {[key: number]: boolean} = {};
      [...privateChats, ...publicChats].forEach(chat => {
        demoAccessMap[chat.id] = true;
      });
      setHasChatAccess(demoAccessMap);
      _setIsLoading(false);
    }
  }, [navigate]);

  // Convertir salas reales a formato ChatUser para compatibilidad con UI
  const convertRoomToChatUser = (room: SimpleChatRoom): ChatUser => {
    return {
      id: parseInt(room.id),
      name: room.name,
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=100&h=100&fit=crop&crop=face",
      lastMessage: room.last_message || "Sin mensajes",
      timestamp: room.updated_at ? new Date(room.updated_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : "Ahora",
      isOnline: true,
      unreadCount: 0,
      isPrivate: room.type === 'private',
      roomType: room.type
    };
  };

  // Cargar datos reales de chat para producción
  const loadRealChatData = async () => {
    _setIsLoading(true);
    try {
      // Obtener salas del usuario
      const roomsResult = await simpleChatService.getUserChatRooms();
      if (roomsResult.success) {
        const allRooms = [...(roomsResult.publicRooms || []), ...(roomsResult.privateRooms || [])];
        setRealRooms(allRooms);
      }
    } catch (error) {
      logger.error('Error cargando datos de chat:', { error: String(error) });
    } finally {
      _setIsLoading(false);
    }
  };

  // Cargar mensajes reales de una sala
  const loadRealMessages = async (roomId: string) => {
    _setIsLoading(true);
    try {
      const result = await simpleChatService.getRoomMessages(roomId, 50);
      if (result.success && result.messages) {
        setRealMessages(result.messages);
        
        // Suscribirse a nuevos mensajes en tiempo real
        simpleChatService.subscribeToRoomMessages(roomId, (message) => {
          setRealMessages(prev => [...prev, message]);
        });
      }
    } catch (error) {
      logger.error('Error cargando mensajes:', { error: String(error) });
    } finally {
      _setIsLoading(false);
    }
  };

  // Enviar mensaje real
  const sendRealMessage = async (content: string) => {
    if (!selectedChat || !content.trim()) return;

    try {
      const roomId = selectedChat.id.toString();
      const result = await simpleChatService.sendMessage(roomId, content, 'text');
      
      if (result.success && result.message) {
        setRealMessages(prev => [...prev, result.message!]);
        setNewMessage('');
      } else {
        alert(result.error || 'Error al enviar mensaje');
      }
    } catch (error) {
      logger.error('Error enviando mensaje:', { error: String(error) });
      alert('Error al enviar mensaje');
    }
  };
  
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

  const _getCurrentChats = () => {
    if (isProduction) {
      // Usar datos reales de Supabase
      const realChats = realRooms
        .filter(room => room.type === activeTab)
        .map(room => convertRoomToChatUser(room));
      return realChats;
    } else {
      // Usar datos mock para demo
      return activeTab === 'private' ? privateChats : publicChats;
    }
  };

  // const _chats = await loadChats(); // Código no válido fuera de función async

  useEffect(() => {
    if (selectedChat) {
      if (isProduction) {
        loadRealMessages(selectedChat.id.toString());
      } else {
        loadMessages(selectedChat.id);
      }
    }
  }, [selectedChat, isProduction]);

  const handleSendMessage = () => {
    if (!selectedChat || !newMessage.trim()) return;
    
    // Usar datos reales en producción, mock en demo
    if (isProduction) {
      sendRealMessage(newMessage);
      return;
    }
    
    // Lógica para modo demo
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden pb-20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header removido para usuarios demo - solo NavigationLegacy */}
      
      <div className="relative z-10 flex h-screen pt-16 pb-20">
        {/* Chat List Sidebar */}
        <div className="w-full sm:w-80 flex-shrink-0 bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-purple-800/40 backdrop-blur-sm border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <UnifiedButton 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 p-2 sm:hidden"
                onClick={() => navigate('/feed')}
              >
                <ArrowLeft className="h-4 w-4" />
              </UnifiedButton>
              <div className="flex items-center justify-between flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">Conversaciones</h2>
                <div className="flex items-center gap-2">
                  <UnifiedButton 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10"
                  >
                    <Video className="h-4 w-4" />
                  </UnifiedButton>
                  <UnifiedButton 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </UnifiedButton>
                  <UnifiedButton 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 md:hidden"
                    onClick={() => setSelectedChat(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </UnifiedButton>
                </div>
              </div>
            </div>
            
            {/* Tabs para Private/Public */}
            <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
              <UnifiedButton
                variant={activeTab === 'private' ? 'default' : 'ghost'}
                size="sm"
                className={`flex-1 flex items-center gap-2 transition-all duration-200 ${
                  activeTab === 'private' 
                    ? 'bg-purple-500 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => {
                  setTabError(null);
                  setActiveTab('private');
                  logger.info('🔒 Cambiando a tab privado');
                }}
              >
                <Lock className="h-4 w-4" />
                Privado
                {privateChats.reduce((acc, chat) => acc + chat.unreadCount, 0) > 0 && (
                  <Badge className="bg-red-500 text-white text-xs">
                    {privateChats.reduce((acc, chat) => acc + chat.unreadCount, 0)}
                  </Badge>
                )}
              </UnifiedButton>
              <UnifiedButton
                variant={activeTab === 'public' ? 'default' : 'ghost'}
                size="sm"
                className={`flex-1 flex items-center gap-2 transition-all duration-200 ${
                  activeTab === 'public' 
                    ? 'bg-pink-500 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => {
                  setTabError(null);
                  setActiveTab('public');
                  logger.info('🌐 Cambiando a tab público');
                }}
              >
                <Globe className="h-4 w-4" />
                Público
                {publicChats.reduce((acc, chat) => acc + chat.unreadCount, 0) > 0 && (
                  <Badge className="bg-red-500 text-white text-xs">
                    {publicChats.reduce((acc, chat) => acc + chat.unreadCount, 0)}
                  </Badge>
                )}
              </UnifiedButton>
            </div>

            {/* Error display */}
            {tabError && (
              <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm">{tabError}</p>
              </div>
            )}
            
            {/* Tab Content */}
            {activeTab === 'private' && (
              <div className="mt-4">
                <div className="text-white/70 text-sm mb-3 px-2">
                  💬 Chats privados con tus conexiones
                </div>
                <div className="space-y-2">
                  {privateChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        if (isProduction) {
                          setSelectedChat(chat);
                          loadRealMessages(chat.id.toString());
                        } else {
                          setSelectedChat(chat);
                          loadMessages(chat.id);
                        }
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
              </div>
            )}
            
            {activeTab === 'public' && (
              <div className="mt-4">
                <div className="text-white/70 text-sm mb-3 px-2">
                  🌍 Salas públicas de la comunidad
                </div>
                <div className="space-y-2">
                  {publicChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        if (isProduction) {
                          setSelectedChat(chat);
                          loadRealMessages(chat.id.toString());
                        } else {
                          setSelectedChat(chat);
                          loadMessages(chat.id);
                        }
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
              </div>
            )}
          </div>
        </div>

        {/* Área de chat */}
        <div className={`${selectedChat ? 'block' : 'hidden md:block'} flex-1 flex flex-col bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-purple-800/20 backdrop-blur-sm`}>
          {selectedChat ? (
            <>
              {/* Header del chat */}
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-800/30">
                <div className="flex items-center space-x-3">
                  <UnifiedButton 
                    variant="ghost" 
                    size="sm" 
                    className="md:hidden text-white hover:bg-white/10 mr-2"
                    onClick={() => setSelectedChat(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </UnifiedButton>
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
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 chat-messages scroll-container btn-animated" style={{scrollBehavior: 'smooth'}}>
                {isProduction ? (
                  // Renderizar mensajes reales de Supabase
                  realMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === localStorage.getItem('user_id') ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-xs lg:max-w-sm px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 hover:scale-102 ${
                          message.sender_id === localStorage.getItem('user_id')
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white/95 text-gray-900 shadow-md border border-gray-200 backdrop-blur-sm'
                        }`}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === localStorage.getItem('user_id') ? 'text-purple-100' : 'text-gray-700 dark:text-gray-200'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  // Renderizar mensajes mock para demo
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-xs lg:max-w-sm px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 hover:scale-102 ${
                          message.senderId === 0
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white/95 text-gray-900 shadow-md border border-gray-200 backdrop-blur-sm'
                        }`}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === 0 ? 'text-purple-100' : 'text-gray-700 dark:text-gray-200'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input para enviar mensajes */}
              <div className="p-4 border-t border-white/10 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-800/30 chat-input">
                {selectedChat?.isPrivate && !hasChatAccess[selectedChat.id] ? (
                  <div className="text-center space-y-4 bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-purple-800/50 rounded-lg p-6 border border-white/20">
                    <div className="flex items-center justify-center text-white mb-3">
                      <Lock className="h-6 w-6 mr-2" />
                      <span className="font-semibold text-lg">Chat privado bloqueado</span>
                    </div>
                    <p className="text-sm text-white/90 mb-6 leading-relaxed max-w-sm mx-auto">
                      Necesitas una invitación aceptada para chatear con {selectedChat?.name}. Puedes enviar una invitación o esperar a que te envíen una.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <UnifiedButton 
                        onClick={() => {
                          logger.info('Enviando invitación...');
                          // Simulate invitation sent
                          setHasChatAccess(prev => ({...prev, [selectedChat?.id || 0]: true}));
                          alert('¡Invitación aceptada! Ahora puedes chatear.');
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Aceptar invitación
                      </UnifiedButton>
                      <UnifiedButton 
                        onClick={() => {
                          logger.info('Rechazando invitación...');
                          // Properly reject the invitation and navigate back
                          setSelectedChat(null);
                          alert('Invitación rechazada. Has vuelto a la lista de chats.');
                        }}
                        variant="outline"
                        className="border-red-300/50 text-red-300 hover:bg-red-500/20 px-6 py-2 rounded-lg font-medium transition-all duration-200"
                      >
                        Rechazar
                      </UnifiedButton>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Botones de galería y solicitudes */}
                    <div className="flex gap-2 justify-center">
                      <UnifiedButton
                        onClick={() => navigate('/gallery')}
                        variant="outline"
                        className="flex-1 border-purple-400/50 text-purple-300 hover:bg-purple-500/20 text-xs py-2"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Galería
                      </UnifiedButton>
                      <UnifiedButton
                        onClick={() => navigate('/requests')}
                        variant="outline"
                        className="flex-1 border-pink-400/50 text-pink-300 hover:bg-pink-500/20 text-xs py-2"
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Solicitudes
                      </UnifiedButton>
                      <UnifiedButton
                        onClick={() => {
                          if (selectedChat?.roomType === 'private') {
                            toast({ title: "Galería Privada", description: "Accediendo a galería privada con " + selectedChat.name });
                          } else {
                            toast({ title: "Galería Pública", description: "Accediendo a galería pública de la sala" });
                          }
                        }}
                        variant="outline"
                        className="flex-1 border-green-400/50 text-green-300 hover:bg-green-500/20 text-xs py-2"
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        {selectedChat?.roomType === 'private' ? 'Privada' : 'Pública'}
                      </UnifiedButton>
                    </div>
                    
                    {/* Input de mensaje */}
                    <div className="flex space-x-2">
                      <UnifiedInput
                        type="text"
                        placeholder="Escribe tu mensaje..."
                        value={newMessage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40"
                      />
                      <UnifiedButton 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        gradient={true}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                      >
                        <Send className="h-4 w-4" />
                      </UnifiedButton>
                    </div>
                  </div>
                )}
                {selectedChat?.roomType === 'public' && (
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

      <NavigationEnhanced />
      
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