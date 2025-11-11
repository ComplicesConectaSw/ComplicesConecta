import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Users, Lock, MessageCircle, Check, X, UserPlus } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Card, CardContent } from "@/shared/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { safeGetItem } from '@/utils/safeLocalStorage';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  timestamp: Date;
  isPrivate: boolean;
}

interface ChatRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined';
}

interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: Date;
}

const ChatAuthenticated = () => {
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState("");
  const [activeTab, setActiveTab] = useState("public");
  const [selectedPrivateChat, setSelectedPrivateChat] = useState<string | null>(null);
  
  // Mock data - en produccin vendra de la API
  const [publicMessages, setPublicMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      senderId: "user1",
      senderName: "Mara & Carlos",
      senderAvatar: "/placeholder.svg",
      message: "Hola a todos! Alguien sabe de eventos este fin de semana?",
      timestamp: new Date(Date.now() - 300000),
      isPrivate: false
    },
    {
      id: "2", 
      senderId: "user2",
      senderName: "Ana",
      senderAvatar: "/placeholder.svg",
      message: "Nosotros organizamos una reunin privada el sbado ??",
      timestamp: new Date(Date.now() - 180000),
      isPrivate: false
    }
  ]);

  const [privateChats, setPrivateChats] = useState<{[key: string]: ChatMessage[]}>({
    "user1": [
      {
        id: "p1",
        senderId: "user1",
        senderName: "Mara & Carlos",
        senderAvatar: "/placeholder.svg",
        message: "Hola, nos gust mucho su perfil. Les interesa conocernos?",
        timestamp: new Date(Date.now() - 3600000),
        isPrivate: true
      }
    ]
  });

  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([
    {
      id: "req1",
      fromUserId: "user3",
      fromUserName: "Roberto & Lisa",
      fromUserAvatar: "/placeholder.svg",
      message: "Nos encantara chatear con ustedes. Somos una pareja experimentada.",
      timestamp: new Date(Date.now() - 7200000),
      status: 'pending'
    },
    {
      id: "req2",
      fromUserId: "user4", 
      fromUserName: "Sofa",
      fromUserAvatar: "/placeholder.svg",
      message: "Hola! Soy nueva en esto, me gustara conocer gente como ustedes.",
      timestamp: new Date(Date.now() - 1800000),
      status: 'pending'
    }
  ]);

  const [onlineUsers, _setOnlineUsers] = useState<User[]>([
    {
      id: "user1",
      name: "Mara & Carlos",
      avatar: "/placeholder.svg",
      isOnline: true
    },
    {
      id: "user2",
      name: "Ana",
      avatar: "/placeholder.svg", 
      isOnline: true
    },
    {
      id: "user5",
      name: "Diego & Carmen",
      avatar: "/placeholder.svg",
      isOnline: true
    }
  ]);

  useEffect(() => {
    // Verificar autenticacin
    const demoAuth = safeGetItem<string>('demo_authenticated', { validate: true, defaultValue: 'false' });
    const demoUser = safeGetItem<unknown>('demo_user', { validate: false, defaultValue: null });
    
    if (demoAuth !== 'true' || !demoUser) {
      navigate('/auth');
      return;
    }
  }, [navigate]);

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: "current_user",
      senderName: "T",
      senderAvatar: "/placeholder.svg",
      message: currentMessage,
      timestamp: new Date(),
      isPrivate: activeTab === "private"
    };

    if (activeTab === "public") {
      setPublicMessages(prev => [...prev, newMessage]);
    } else if (selectedPrivateChat) {
      setPrivateChats(prev => ({
        ...prev,
        [selectedPrivateChat]: [...(prev[selectedPrivateChat] || []), newMessage]
      }));
    }

    setCurrentMessage("");
  };

  const handleChatRequest = (requestId: string, action: 'accept' | 'decline') => {
    setChatRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action === 'accept' ? 'accepted' : 'declined' }
          : req
      )
    );

    if (action === 'accept') {
      const request = chatRequests.find(req => req.id === requestId);
      if (request) {
        // Iniciar chat privado
        setPrivateChats(prev => ({
          ...prev,
          [request.fromUserId]: []
        }));
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const pendingRequests = chatRequests.filter(req => req.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver
            </Button>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-white" />
              <h1 className="text-2xl font-bold text-white">Chat Swinger</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm">{onlineUsers.length} en lnea</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6 grid lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
          {/* Sidebar - Online Users & Requests */}
          <div className="lg:col-span-1 space-y-4">
            {/* Chat Requests */}
            {pendingRequests.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <UserPlus className="h-4 w-4 text-white" />
                    <h3 className="font-semibold text-white">Solicitudes</h3>
                    <Badge variant="secondary" className="bg-pink-500 text-white">
                      {pendingRequests.length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={request.fromUserAvatar} />
                            <AvatarFallback>{request.fromUserName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm">{request.fromUserName}</p>
                            <p className="text-white/70 text-xs truncate">{request.message}</p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={() => handleChatRequest(request.id, 'accept')}
                                className="bg-green-600 hover:bg-green-700 text-white h-6 px-2 text-xs"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleChatRequest(request.id, 'decline')}
                                className="h-6 px-2 text-xs"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Online Users */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-white" />
                  <h3 className="font-semibold text-white">En Lnea</h3>
                </div>
                <div className="space-y-2">
                  {onlineUsers.map((user) => (
                    <div 
                      key={user.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => {
                        setActiveTab("private");
                        setSelectedPrivateChat(user.id);
                      }}
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{user.name}</p>
                        <p className="text-green-400 text-xs">En lnea</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 h-full flex flex-col">
              <CardContent className="p-0 flex flex-col h-full">
                {/* Chat Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                  <div className="border-b border-white/10 p-4">
                    <TabsList className="grid w-full grid-cols-2 bg-white/5">
                      <TabsTrigger value="public" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                        <Users className="h-4 w-4 mr-2" />
                        Chat Pblico
                      </TabsTrigger>
                      <TabsTrigger value="private" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                        <Lock className="h-4 w-4 mr-2" />
                        Chat Privado
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="public" className="h-full m-0">
                      <div className="h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {publicMessages.map((message) => (
                            <div key={message.id} className="flex gap-3">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={message.senderAvatar} />
                                <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-white text-sm">{message.senderName}</span>
                                  <span className="text-white/50 text-xs">{formatTime(message.timestamp)}</span>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                  <p className="text-white">{message.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="private" className="h-full m-0">
                      <div className="h-full flex flex-col">
                        {selectedPrivateChat ? (
                          <>
                            <div className="border-b border-white/10 p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src="/placeholder.svg" />
                                  <AvatarFallback>
                                    {onlineUsers.find(u => u.id === selectedPrivateChat)?.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-white">
                                    {onlineUsers.find(u => u.id === selectedPrivateChat)?.name}
                                  </p>
                                  <p className="text-green-400 text-sm">En lnea</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                              {(privateChats[selectedPrivateChat] || []).map((message) => (
                                <div key={message.id} className="flex gap-3">
                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage src={message.senderAvatar} />
                                    <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-white text-sm">{message.senderName}</span>
                                      <span className="text-white/50 text-xs">{formatTime(message.timestamp)}</span>
                                    </div>
                                    <div className="bg-purple-500/20 rounded-lg p-3">
                                      <p className="text-white">{message.message}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                              <Lock className="h-12 w-12 text-white/50 mx-auto mb-4" />
                              <p className="text-white/70">Selecciona un usuario para iniciar chat privado</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-white/10 p-4">
                    <div className="flex gap-3">
                      <Input
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder={activeTab === "public" ? "Escribe un mensaje pblico..." : "Escribe un mensaje privado..."}
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!currentMessage.trim() || (activeTab === "private" && !selectedPrivateChat)}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAuthenticated;
