import { useState, useEffect } from "react";
import { MessageCircle, Video, MoreVertical, ArrowLeft, Heart, Send, Lock, Globe, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UnifiedButton } from "@/components/ui/UnifiedButton";
import { UnifiedInput } from "@/components/ui/UnifiedInput";
import { useNavigate } from "react-router-dom";
import { useFeatures } from "@/hooks/useFeatures";
import { toast } from "@/hooks/useToast";
import HeaderNav from "@/components/HeaderNav";
import Navigation from "@/components/Navigation";
import { DecorativeHearts } from '@/components/DecorativeHearts';
import { mockPrivacySettings } from "@/lib/data";
import { invitationService } from "@/lib/invitations";
import { simpleChatService, type SimpleChatRoom, type SimpleChatMessage } from '@/lib/simpleChatService';
import { logger } from '@/lib/logger';
import { useAuth } from '@/features/auth/useAuth';
import { ConsentIndicator } from '@/components/chat/ConsentIndicator';
import { useConsentVerification } from '@/hooks/useConsentVerification';
import { safeGetItem } from '@/utils/safeLocalStorage';

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
  const { isAuthenticated } = useAuth();

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
  const [_isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // Hook de verificacin de consentimiento
  const currentRoomId = selectedChat?.id.toString();
  const {
    verification,
    isPaused,
    startMonitoring,
    stopMonitoring
  } = useConsentVerification(currentRoomId);
  
  // Verificar si hay sesin activa (demo o produccin)
  const hasActiveSession = typeof isAuthenticated === 'function' ? isAuthenticated() : !!isAuthenticated;

  // Detectar modo de operacin (demo vs produccin)
  useEffect(() => {
    const demoAuth = safeGetItem<string>('demo_authenticated', { validate: true, defaultValue: 'false' });
    const isDemo = demoAuth === 'true';
    setIsProduction(!isDemo);
    
    if (!isDemo) {
      // Modo produccin - cargar datos reales
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
      setIsLoading(false);
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

  // Cargar datos reales de chat para produccin
  const loadRealChatData = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  // Cargar mensajes reales de una sala
  const loadRealMessages = async (roomId: string) => {
    setIsLoading(true);
    try {
      const result = await simpleChatService.getRoomMessages(roomId, 50);
      if (result.success && result.messages) {
        setRealMessages(result.messages);
        
        // Suscribirse a nuevos mensajes en tiempo real
        simpleChatService.subscribeToRoomMessages(roomId, (message) => {
          setRealMessages(prev => [...prev, message]);
        });
      }
    } catch (_error) {
      logger.error('Error cargando mensajes:', { error: String(_error) });
    } finally {
      setIsLoading(false);
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
    } catch (_error) {
      logger.error('Error enviando mensaje:', { error: String(_error) });
      alert('Error al enviar mensaje');
    }
  };
  
  // Load messages for a specific chat
  const loadMessages = (chatId: number) => {
    const mockMessages: Message[] = [
      { id: 1, senderId: chatId, content: "Hola! Cmo estn?", timestamp: "10:30", type: 'text' },
      { id: 2, senderId: 0, content: "Muy bien! Y ustedes?", timestamp: "10:32", type: 'text' },
      { id: 3, senderId: chatId, content: "Genial, les interesa conocernos mejor?", timestamp: "10:35", type: 'text' }
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
      lastMessage: "Estn libres este fin de semana? ??",
      timestamp: "5 min",
      isOnline: true,
      unreadCount: 2,
      isPrivate: true,
      roomType: 'private'
    },
    {
      id: 2,
      name: "Sofa",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      lastMessage: "Me encant conocerlos en la fiesta ??",
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
      lastMessage: "Vienen al evento VIP del sbado?",
      timestamp: "3 h",
      isOnline: false,
      unreadCount: 0,
      isPrivate: true,
      roomType: 'private'
    },
    {
      id: 4,
      name: "Ral",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      lastMessage: "Qu tal si nos vemos para tomar algo?",
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
      name: "?? Sala General Lifestyle",
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=100&h=100&fit=crop&crop=face",
      lastMessage: "Bienvenidos a la comunidad swinger!",
      timestamp: "10 min",
      isOnline: true,
      unreadCount: 5,
      isPrivate: false,
      roomType: 'public'
    },
    {
      id: 102,
      name: "?? Parejas CDMX",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop&crop=faces",
      lastMessage: "Evento swinger este sbado en Polanco",
      timestamp: "30 min",
      isOnline: true,
      unreadCount: 12,
      isPrivate: false,
      roomType: 'public'
    },
    {
      id: 103,
      name: "?? Singles Lifestyle",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      lastMessage: "Alguien para intercambio hoy?",
      timestamp: "1 h",
      isOnline: true,
      unreadCount: 3,
      isPrivate: false,
      roomType: 'public'
    },
    {
      id: 104,
      name: "?? Eventos Privados",
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

  const _chats = getCurrentChats();

  useEffect(() => {
    if (selectedChat) {
      if (isProduction) {
        loadRealMessages(selectedChat.id.toString());
      } else {
        loadMessages(selectedChat.id);
      }
    }
  }, [selectedChat, isProduction]);

  // Iniciar monitoreo de consentimiento cuando se selecciona un chat
  useEffect(() => {
    if (!selectedChat || !user?.id || !isProduction) return;
    
    const roomId = selectedChat.id.toString();
    // Obtener el otro usuario del chat (simplificado - en produccin obtener de la sala)
    const otherUserId = selectedChat.id.toString(); // TODO: Obtener el ID real del otro usuario
    
    // Iniciar monitoreo de consentimiento
    if (roomId && user.id && otherUserId) {
      startMonitoring(roomId, user.id, otherUserId).catch((err) => {
        logger.error('Error iniciando monitoreo de consentimiento', { error: err });
      });
    }

    // Cleanup: detener monitoreo al cambiar de chat
    return () => {
      if (roomId) {
        stopMonitoring(roomId).catch((err) => {
          logger.error('Error deteniendo monitoreo de consentimiento', { error: err });
        });
      }
    };
  }, [selectedChat, user?.id, isProduction, startMonitoring, stopMonitoring]);

  const handleSendMessage = () => {
    if (!selectedChat || !newMessage.trim()) return;
    
    // Bloquear envo si el chat est pausado por bajo consenso
    if (isPaused) {
      toast({
        variant: 'destructive',
        title: 'Chat pausado',
        description: verification?.pauseReason || 'El chat est pausado por bajo consenso. Por favor, espera a que mejore el consenso antes de enviar mensajes.'
      });
      return;
    }
    
    // Usar datos reales en produccin, mock en demo
    if (isProduction) {
      sendRealMessage(newMessage);
      return;
    }
    
    // Lgica para modo demo
    if (selectedChat.isPrivate && !hasChatAccess[selectedChat.id]) {
      alert('No tienes acceso a este chat privado. Necesitas una invitacin aceptada.');
      return;
    }
    
    // Verificar permisos de mensajera segn configuracin de privacidad
    const canSendMessage = checkMessagePermissions(selectedChat);
    if (!canSendMessage) {
      alert('No puedes enviar mensajes a este usuario segn su configuracin de privacidad.');
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
    
    // Para chats pblicos, siempre permitir
    if (chat.roomType === 'public') return true;
    
    // Para chats privados, verificar configuracin
    const userPrivacySettings = mockPrivacySettings; // En produccin, obtener del usuario especfico
    
    switch (userPrivacySettings.allowMessages) {
      case 'everyone':
        return true;
      case 'connections_only':
        // Verificar si hay conexin aceptada (simulado)
        return true; // Por ahora siempre true para demo
      case 'none':
        return false;
      default:
        return true;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 relative overflow-hidden ${hasActiveSession ? '' : 'pb-20'}`}>
      <DecorativeHearts />
      
      {/* Background decorativo uniforme */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-purple-800/20 to-blue-900/20"></div>
      </div>

      {/* Navegacin condicional */}
      {hasActiveSession ? <Navigation /> : <HeaderNav />}
      
      <div className={`relative z-10 flex h-screen ${hasActiveSession ? 'pt-4' : 'pt-16'} ${hasActiveSession ? 'pb-4' : 'pb-20'}`}>
        {/* Chat List Sidebar */}
        <div className="w-full sm:w-80 flex-shrink-0 bg-gradient-to-br from-purple-900/40 via-purple-800/40 to-blue-900/40 backdrop-blur-sm border-r border-white/10 flex flex-col">
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
            <div className="flex gap-2 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-lg p-1 border border-purple-400/20">
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
                  setSelectedChat(null); // Limpiar chat seleccionado al cambiar tab
                  logger.info('?? Cambiando a tab privado');
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
                    ? 'bg-purple-500 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => {
                  setTabError(null);
                  setActiveTab('public');
                  setSelectedChat(null); // Limpiar chat seleccionado al cambiar tab
                  logger.info('?? Cambiando a tab pblico');
                }}
              >
                <Globe className="h-4 w-4" />
                Pblico
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
                <div className="text-white font-semibold text-sm mb-3 px-2 drop-shadow-lg">
                  ?? Chats privados con tus conexiones
                </div>
                <div className="space-y-2">
                  {privateChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        console.log('Chat clicked:', chat.name, 'isProduction:', isProduction);
                        setSelectedChat(chat);
                        if (isProduction) {
                          loadRealMessages(chat.id.toString());
                        } else {
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
                            <span className="text-xs text-white/90 font-medium">{chat.timestamp}</span>
                          </div>
                          <p className="text-sm text-white/90 truncate font-medium">{chat.lastMessage}</p>
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
                <div className="text-white font-semibold text-sm mb-3 px-2 drop-shadow-lg">
                  ?? Salas pblicas de la comunidad
                </div>
                <div className="space-y-2">
                  {publicChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        console.log('Chat clicked:', chat.name, 'isProduction:', isProduction);
                        setSelectedChat(chat);
                        if (isProduction) {
                          loadRealMessages(chat.id.toString());
                        } else {
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
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg border-2 border-white/20">
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
                            <span className="text-xs text-white/90 font-medium">{chat.timestamp}</span>
                          </div>
                          <p className="text-sm text-white/90 truncate font-medium">{chat.lastMessage}</p>
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

        {/* rea de chat */}
        <div className={`${selectedChat ? 'block' : 'hidden md:block'} flex-1 flex flex-col bg-gradient-to-br from-purple-900/20 via-purple-800/20 to-blue-900/20 backdrop-blur-sm`}>
          {selectedChat ? (
            <>
              {/* Header del chat */}
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/30 via-purple-800/30 to-blue-900/30">
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold border-2 border-white/20">
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
                    <p className="text-sm text-white/90 drop-shadow-md">
                      {selectedChat.roomType === 'public' 
                        ? `Sala pblica  ${Math.floor(Math.random() * 50) + 10} miembros activos`
                        : selectedChat.isOnline ? 'En lnea' : `ltima vez ${selectedChat.timestamp}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Indicador de consentimiento */}
              {isProduction && selectedChat && user?.id && (
                <div className="px-4 py-2 border-b border-white/10 bg-gradient-to-r from-purple-900/30 via-purple-800/30 to-blue-900/30">
                  <ConsentIndicator
                    chatId={selectedChat.id.toString()}
                    userId1={user.id}
                    userId2={selectedChat.id.toString()} // TODO: Obtener el ID real del otro usuario
                    currentUserId={user.id}
                    onPauseChange={(paused) => {
                      if (paused) {
                        logger.warn('Chat pausado por bajo consenso', { chatId: selectedChat.id });
                      }
                    }}
                  />
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 chat-messages scroll-container btn-animated" style={{scrollBehavior: 'smooth'}}>
                {isProduction ? (
                  // Renderizar mensajes reales de Supabase
                  realMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === safeGetItem<string>('user_id', { validate: false, defaultValue: '' }) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-xs lg:max-w-sm px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 hover:scale-102 ${
                          message.sender_id === safeGetItem<string>('user_id', { validate: false, defaultValue: '' })
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                            : 'bg-gradient-to-r from-blue-500/95 to-purple-600/95 text-white shadow-md border border-blue-400/50 backdrop-blur-sm'
                        }`}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere hyphens-auto font-medium text-white drop-shadow-md" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>{message.content}</p>
                        <p className={`text-xs mt-1 font-medium ${
                          message.sender_id === safeGetItem<string>('user_id', { validate: false, defaultValue: '' }) ? 'text-purple-100 drop-shadow-sm' : 'text-white/90 drop-shadow-sm'
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
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                            : 'bg-gradient-to-r from-blue-500/95 to-purple-600/95 text-white shadow-md border border-blue-400/50 backdrop-blur-sm'
                        }`}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere hyphens-auto font-medium text-white drop-shadow-md" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>{message.content}</p>
                        <p className={`text-xs mt-1 font-medium ${
                          message.senderId === 0 ? 'text-purple-100 drop-shadow-sm' : 'text-white/90 drop-shadow-sm'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input para enviar mensajes */}
              <div className="p-4 border-t border-white/10 bg-gradient-to-r from-purple-900/30 via-purple-800/30 to-blue-900/30 chat-input">
                {selectedChat?.isPrivate && !hasChatAccess[selectedChat.id] ? (
                  <div className="text-center space-y-4 bg-gradient-to-br from-purple-900/50 via-purple-800/50 to-blue-900/50 rounded-lg p-6 border border-white/20">
                    <div className="flex items-center justify-center text-white mb-3">
                      <Lock className="h-6 w-6 mr-2" />
                      <span className="font-semibold text-lg">Chat privado bloqueado</span>
                    </div>
                    <p className="text-sm text-white/90 mb-6 leading-relaxed max-w-sm mx-auto">
                      Necesitas una invitacin aceptada para chatear con {selectedChat?.name}. Puedes enviar una invitacin o esperar a que te enven una.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <UnifiedButton 
                        onClick={() => {
                          logger.info('Enviando invitacin...');
                          // Simulate invitation sent
                          setHasChatAccess(prev => ({...prev, [selectedChat?.id || 0]: true}));
                          alert('Invitacin aceptada! Ahora puedes chatear.');
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Aceptar invitacin
                      </UnifiedButton>
                      <UnifiedButton 
                        onClick={() => {
                          logger.info('Rechazando invitacin...');
                          // Properly reject the invitation and navigate back
                          setSelectedChat(null);
                          alert('Invitacin rechazada. Has vuelto a la lista de chats.');
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
                    {/* Botones de galera y solicitudes */}
                    <div className="flex gap-2 justify-center">
                      <UnifiedButton
                        onClick={() => navigate('/gallery')}
                        variant="outline"
                        className="flex-1 border-purple-400/50 text-purple-300 hover:bg-purple-500/20 text-xs py-2"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Galera
                      </UnifiedButton>
                      <UnifiedButton
                        onClick={() => navigate('/requests')}
                        variant="outline"
                        className="flex-1 border-purple-400/50 text-purple-300 hover:bg-purple-500/20 text-xs py-2"
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Solicitudes
                      </UnifiedButton>
                      <UnifiedButton
                        onClick={() => {
                          if (selectedChat?.roomType === 'private') {
                            toast({ title: "Galera Privada", description: "Accediendo a galera privada con " + selectedChat.name });
                          } else {
                            toast({ title: "Galera Pblica", description: "Accediendo a galera pblica de la sala" });
                          }
                        }}
                        variant="outline"
                        className="flex-1 border-green-400/50 text-green-300 hover:bg-green-500/20 text-xs py-2"
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        {selectedChat?.roomType === 'private' ? 'Privada' : 'Pblica'}
                      </UnifiedButton>
                    </div>
                    
                    {/* Input de mensaje */}
                    <div className="flex space-x-2">
                      <UnifiedInput
                        type="text"
                        placeholder={isPaused ? "Chat pausado - esperando mejor consenso..." : "Escribe tu mensaje..."}
                        value={newMessage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && !isPaused && handleSendMessage()}
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40"
                        disabled={isPaused}
                      />
                      <UnifiedButton 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isPaused}
                        gradient={true}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                      >
                        <Send className="h-4 w-4" />
                      </UnifiedButton>
                    </div>
                    {isPaused && (
                      <p className="text-xs text-white/70 mt-2 text-center">
                        ?? El chat est pausado por bajo consenso. El envo de mensajes est bloqueado.
                      </p>
                    )}
                  </div>
                )}
                {selectedChat?.roomType === 'public' && (
                  <p className="text-xs text-white/50 mt-2 px-1">
                    ?? Los mensajes en salas pblicas son visibles para todos los miembros
                  </p>
                )}
              </div>
            </>
          ) : (
              <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-white opacity-80 drop-shadow-lg" />
                <h3 className="text-xl font-semibold mb-2 text-white drop-shadow-md">Selecciona una conversacin</h3>
                <p className="mb-4 text-white/90 drop-shadow-md">
                  {activeTab === 'private' 
                    ? 'Elige un chat privado para conversar de forma segura'
                    : 'nete a una sala pblica para conocer la comunidad'
                  }
                </p>
                <div className="flex items-center justify-center text-sm space-x-4">
                  <div className="flex items-center text-white/90">
                    <Lock className="h-4 w-4 mr-1 text-purple-300" />
                    <span className="drop-shadow-md">Chats privados encriptados</span>
                  </div>
                  <div className="flex items-center text-white/90">
                    <Globe className="h-4 w-4 mr-1 text-green-300" />
                    <span className="drop-shadow-md">Salas pblicas moderadas</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Styles */}
      <style>{`
        /* Estilos simplificados - sin animaciones blob */
        .chat-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }
        
        .chat-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .chat-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .chat-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        
        .chat-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Chat;