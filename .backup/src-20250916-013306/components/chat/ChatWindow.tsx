import { useState, useRef, useEffect } from "react";
import { Send, MoreVertical, Phone, Video, Image, Smile, Paperclip, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatUser, Message } from "@/pages/Chat";
import { ChatWindowEnhanced } from "@/components/chat/ChatWindowEnhanced";

interface ChatWindowProps {
  chat: ChatUser;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isTyping?: boolean;
  onGenerateSuggestion?: () => void;
}

// Wrapper de compatibilidad - MANTIENE TODAS LAS PROPS ORIGINALES
export const ChatWindow = (props: ChatWindowProps) => {
  return (
    <ChatWindowEnhanced 
      {...props}
      enableAnimations={true}
      showTypingIndicator={true}
      maxMessages={1000}
    />
  );
};

// Export del componente original para casos específicos
export const ChatWindowLegacy = ({ chat, messages, onSendMessage, isTyping, onGenerateSuggestion }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="bg-card-gradient rounded-2xl shadow-soft h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="relative">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarImage src={chat.image} alt={chat.name} />
              <AvatarFallback>{chat.name[0]}</AvatarFallback>
            </Avatar>
            {chat.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">{chat.name}</h3>
            <p className="text-xs text-muted-foreground h-4">
              {isTyping ? <span className="italic text-primary">Escribiendo...</span> : (chat.isOnline ? 'En línea' : 'Desconectado')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-10 sm:w-10" aria-label="Llamada de voz">
            <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-10 sm:w-10" aria-label="Videollamada">
            <Video className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-10 sm:w-10" aria-label="Más opciones">
            <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2 break-words ${
                message.senderId === 0
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <p className="text-xs sm:text-sm leading-relaxed break-words overflow-wrap-anywhere">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.senderId === 0 ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
              }`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-border">
        <div className="flex items-end space-x-2">
          <div className="flex space-x-1">
            {onGenerateSuggestion && (
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8 relative group" onClick={onGenerateSuggestion}>
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="absolute -top-2 -right-2 text-xs bg-purple-500 text-white font-bold px-1 rounded-full group-hover:scale-110 transition-transform">AI</span>
              </Button>
            )}
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label="Adjuntar archivo">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label="Enviar imagen">
              <Image className="h-4 w-4" />
            </Button>
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label="Insertar emoji">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <Input
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()} aria-label="Enviar mensaje">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};