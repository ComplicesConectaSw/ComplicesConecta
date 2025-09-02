import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowLeft, Heart, Users, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface ChatUser {
  id: number;
  name: string;
  image: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  unreadCount: number;
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
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Swinger community chat data
  const chats: ChatUser[] = [
    {
      id: 1,
      name: "Sofía & Miguel",
      image: "/src/assets/profile-1.jpg",
      lastMessage: "¿Están libres este fin de semana? 🔥",
      timestamp: "5 min",
      isOnline: true,
      unreadCount: 2
    },
    {
      id: 2,
      name: "Valentina",
      image: "/src/assets/profile-2.jpg",
      lastMessage: "Me encantó conocerlos en la fiesta 💕",
      timestamp: "1 h",
      isOnline: true,
      unreadCount: 1
    },
    {
      id: 3,
      name: "Carlos & Ana",
      image: "/src/assets/profile-3.jpg",
      lastMessage: "¿Vienen al evento VIP del sábado?",
      timestamp: "3 h",
      isOnline: false,
      unreadCount: 0
    },
    {
      id: 4,
      name: "Isabella",
      image: "/src/assets/profile-4.jpg",
      lastMessage: "Gracias por la invitación privada 😘",
      timestamp: "1 día",
      isOnline: true,
      unreadCount: 0
    }
  ];

  // Swinger community messages
  const mockMessages: { [key: number]: Message[] } = {
    1: [
      { id: 1, senderId: 1, content: "¡Hola! Vimos su perfil y nos encantó 🔥", timestamp: "20:15", type: 'text' },
      { id: 2, senderId: 0, content: "¡Hola Sofía y Miguel! Gracias, el suyo también nos gustó mucho", timestamp: "20:18", type: 'text' },
      { id: 3, senderId: 1, content: "¿Les gustaría conocernos en persona? Hay una fiesta privada este sábado", timestamp: "20:22", type: 'text' },
      { id: 4, senderId: 0, content: "¡Nos encantaría! ¿Podrían contarnos más detalles?", timestamp: "20:25", type: 'text' },
      { id: 5, senderId: 1, content: "¿Están libres este fin de semana? 🔥", timestamp: "20:28", type: 'text' }
    ],
    2: [
      { id: 1, senderId: 2, content: "¡Fue increíble conocerlos anoche! 💕", timestamp: "09:30", type: 'text' },
      { id: 2, senderId: 0, content: "¡Valentina! Nosotros también la pasamos genial", timestamp: "09:45", type: 'text' },
      { id: 3, senderId: 2, content: "¿Les gustaría repetir pronto? Tengo algunas ideas 😘", timestamp: "10:15", type: 'text' },
      { id: 4, senderId: 2, content: "Me encantó conocerlos en la fiesta 💕", timestamp: "10:30", type: 'text' }
    ],
    3: [
      { id: 1, senderId: 0, content: "¿Vienen al evento VIP del Club Secreto?", timestamp: "16:00", type: 'text' },
      { id: 2, senderId: 3, content: "¡Claro! ¿A qué hora empieza?", timestamp: "16:15", type: 'text' },
      { id: 3, senderId: 0, content: "A las 22:00, es solo para miembros verificados", timestamp: "16:20", type: 'text' },
      { id: 4, senderId: 3, content: "¿Vienen al evento VIP del sábado?", timestamp: "16:25", type: 'text' }
    ],
    4: [
      { id: 1, senderId: 4, content: "Gracias por la invitación a su casa 😘", timestamp: "Ayer 22:30", type: 'text' },
      { id: 2, senderId: 0, content: "¡Fue un placer Isabella! Eres increíble", timestamp: "Ayer 22:45", type: 'text' },
      { id: 3, senderId: 4, content: "¿Cuándo podemos volver a vernos? 🔥", timestamp: "Ayer 23:00", type: 'text' },
      { id: 4, senderId: 4, content: "Gracias por la invitación privada 😘", timestamp: "Hoy 08:15", type: 'text' }
    ]
  };

  useEffect(() => {
    if (selectedChat) {
      setMessages(mockMessages[selectedChat.id] || []);
    }
  }, [selectedChat]);

  const handleSendMessage = (content: string) => {
    if (!selectedChat) return;
    
    const newMessage: Message = {
      id: Date.now() + Math.random(), // Generar un ID más único
      senderId: 0, // Current user
      content,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Advanced Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-secondary/20"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Floating Hearts */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <Heart 
              key={i}
              className={`absolute text-primary/10 animate-float-slow`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 2}s`,
                fontSize: `${Math.random() * 20 + 10}px`
              }}
              fill="currentColor"
            />
          ))}
        </div>
        
        {/* Floating Flames */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <Flame 
              key={i}
              className={`absolute text-accent/10 animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 3}s`,
                fontSize: `${Math.random() * 15 + 8}px`
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="relative z-10">
        <Header />
      
        <main className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="bg-card/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-all duration-300 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Chat Privado
              <span className="block bg-love-gradient bg-clip-text text-transparent">
                Conexiones Íntimas
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Conversaciones discretas y seguras con parejas y solteros verificados de la comunidad swinger
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
            {/* Chat List */}
            <div className="lg:col-span-1">
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-soft border border-primary/10">
                <div className="p-6 border-b border-primary/10">
                  <h2 className="text-xl font-semibold text-card-foreground mb-2 flex items-center">
                    <Users className="mr-2 h-5 w-5 text-primary" />
                    Conversaciones Activas
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {chats.filter(chat => chat.unreadCount > 0).length} mensajes sin leer
                  </p>
                </div>
                <ChatList 
                  chats={chats}
                  selectedChat={selectedChat}
                  onSelectChat={setSelectedChat}
                />
              </div>
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-2">
              {selectedChat ? (
                <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-soft border border-primary/10 h-full">
                  <ChatWindow
                    chat={selectedChat}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                  />
                </div>
              ) : (
                <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-soft border border-primary/10 h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">
                      Selecciona una conversación
                    </h3>
                    <p className="text-muted-foreground">
                      Elige un chat para comenzar a conversar de forma privada y segura
                    </p>
                    <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <Flame className="h-4 w-4 text-accent" />
                      <span>Todas las conversaciones son encriptadas</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
      
      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
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