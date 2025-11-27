import { Search, MessageCircleOff } from "lucide-react";
import { Input } from "@/shared/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChatUser } from "@/pages/Chat";
import { useState } from "react";

interface ChatListProps {
  chats: ChatUser[];
  selectedChat: ChatUser | null;
  onSelectChat: (chat: ChatUser) => void;
}

export const ChatList = ({ chats, selectedChat, onSelectChat }: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-card-gradient rounded-2xl shadow-soft h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">
          Conversaciones
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`p-4 border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/30 ${
                selectedChat?.id === chat.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.image} alt={chat.name} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  {chat.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-card-foreground truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {chat.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <Badge className="ml-2 bg-primary text-primary-foreground min-w-[20px] h-5 flex items-center justify-center text-xs">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
            <MessageCircleOff className="h-10 w-10 mb-4" />
            <h3 className="font-semibold">No hay conversaciones</h3>
            <p className="text-sm text-center">
              {searchQuery ? 'No se encontraron resultados.' : 'Inicia una nueva conversación para verla aquí.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};