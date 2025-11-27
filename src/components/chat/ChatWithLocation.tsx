import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Send, Share2 } from 'lucide-react';
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/useToast";
import { logger } from '@/lib/logger';

// Interfaces importadas de @/types/supabase-messages

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  created_at: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

interface ChatWithLocationProps {
  conversationId: string;
  currentUserId: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export const ChatWithLocation = ({ conversationId, currentUserId, otherUser }: ChatWithLocationProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { location, getCurrentLocation, calculateDistance, isLoading: locationLoading } = useGeolocation();
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return;
      }
      
      const { data, error } = await supabase
        .from('messages')
        .select("*, sender:profiles!sender_id(*)")
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        sender_name: `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`.trim() || 'Usuario',
        created_at: msg.created_at,
        location: msg.location_latitude && msg.location_longitude ? {
          latitude: msg.location_latitude,
          longitude: msg.location_longitude,
          address: msg.location_address || undefined
        } : undefined
      }));

      setMessages(formattedMessages);
    } catch (error) {
      logger.error('Error fetching messages:', { error: error instanceof Error ? error.message : String(error) });
    }
  }, [conversationId]);

  const subscribeToMessages = useCallback(() => {
    if (!supabase) {
      logger.error('Supabase no está disponible');
      return () => {};
    }
    
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        () => {
          fetchMessages(); // Refetch to get sender details
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, fetchMessages]);

  const sendMessage = async (includeLocation = false) => {
    if (!newMessage.trim() && !includeLocation) return;

    setIsLoading(true);
    try {
      const messageData = {
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: newMessage.trim() || "📍 Ubicación compartida",
        ...(includeLocation && location && {
          location_latitude: location.latitude,
          location_longitude: location.longitude,
          location_address: "Ubicación actual"
        })
      };

      if (!supabase) {
        logger.error('Supabase no está disponible');
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo enviar el mensaje.",
        });
        return;
      }

      // Usar tabla chat_messages que existe en la BD
      const { error } = await (supabase as any)
        .from('chat_messages')
        .insert([{
          conversation_id: messageData.conversation_id,
          sender_id: messageData.sender_id,
          content: messageData.content,
          location_latitude: messageData.location_latitude,
          location_longitude: messageData.location_longitude,
          location_address: messageData.location_address
        }]);


      if (error) throw error;

      setNewMessage("");
      
      if (includeLocation) {
        toast({
          title: "Ubicación compartida",
          description: "Tu ubicación actual ha sido enviada.",
        });
      }
    } catch (error) {
      logger.error('Error sending message:', { error: error instanceof Error ? error.message : String(error) });
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shareLocation = async () => {
    if (!location) {
      await getCurrentLocation();
      return;
    }
    await sendMessage(true);
  };

  const formatDistance = (msgLocation: { latitude: number; longitude: number }) => {
    if (!location) return null;
    const distance = calculateDistance(
      location.latitude, 
      location.longitude, 
      msgLocation.latitude, 
      msgLocation.longitude
    );
    return `${distance} km de distancia`;
  };

  useEffect(() => {
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    return unsubscribe;
  }, [conversationId, fetchMessages, subscribeToMessages]);

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherUser.avatar} />
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{otherUser.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              En línea
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] space-y-2`}>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender_id === currentUserId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.location && (
                    <div className="mt-2 p-2 rounded bg-background/20 border">
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin className="h-3 w-3" />
                        <span>Ubicación compartida</span>
                      </div>
                      {location && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {formatDistance(message.location)}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(message.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={() => sendMessage()} 
              disabled={isLoading || !newMessage.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={shareLocation}
              disabled={locationLoading || isLoading}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              {location ? "Compartir ubicación" : "Obtener ubicación"}
            </Button>
            {location && (
              <Badge variant="secondary" className="text-xs">
                Ubicación disponible
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};