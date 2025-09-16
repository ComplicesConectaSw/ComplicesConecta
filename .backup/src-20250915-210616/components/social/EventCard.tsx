import { useState } from "react";
import { Calendar, MapPin, Users, Clock, Heart, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  price: number;
  category: string;
  organizer: {
    id: string;
    name: string;
    avatar: string;
  };
  isInterested?: boolean;
  isAttending?: boolean;
}

export const EventCard = ({ 
  id,
  title, 
  description, 
  image, 
  date, 
  time, 
  location, 
  attendees, 
  maxAttendees,
  price,
  category,
  organizer,
  isInterested = false,
  isAttending = false
}: EventCardProps) => {
  const [interested, setInterested] = useState(isInterested);
  const [attending, setAttending] = useState(isAttending);
  const [currentAttendees, setCurrentAttendees] = useState(attendees);
  const { toast } = useToast();

  const handleInterest = () => {
    setInterested(!interested);
    toast({
      title: interested ? "Interés removido" : "Marcado como interesante",
      description: interested 
        ? "Has removido tu interés en este evento" 
        : "Has marcado este evento como interesante"
    });
  };

  const handleAttendance = () => {
    if (attending) {
      setAttending(false);
      setCurrentAttendees(prev => prev - 1);
      toast({
        title: "Asistencia cancelada",
        description: "Has cancelado tu asistencia a este evento"
      });
    } else {
      if (currentAttendees >= maxAttendees) {
        toast({
          title: "Evento completo",
          description: "Este evento ha alcanzado el máximo de asistentes",
          variant: "destructive"
        });
        return;
      }
      setAttending(true);
      setCurrentAttendees(prev => prev + 1);
      toast({
        title: "¡Asistencia confirmada!",
        description: "Te has registrado para este evento"
      });
    }
  };

  const handleShare = () => {
    if (typeof window === 'undefined' || !navigator) return;
    if (navigator.share) {
      navigator.share({
        title: title,
        text: description,
        url: window.location.href + `/events/${id}`,
      });
    } else {
      // Fallback para navegadores que no soporten Web Share API
      navigator.clipboard.writeText(window.location.href + `/events/${id}`);
      toast({
        title: "Enlace copiado",
        description: "El enlace del evento se ha copiado al portapapeles"
      });
    }
  };

  const getAvailabilityColor = () => {
    const percentage = (currentAttendees / maxAttendees) * 100;
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <Card className="group overflow-hidden hover:shadow-primary transition-all duration-300 hover:scale-105">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={image} 
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Badges overlay */}
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge variant="secondary" className="bg-background/90">
              {category}
            </Badge>
            {price === 0 && (
              <Badge variant="secondary" className="bg-green-500/90 text-white">
                Gratis
              </Badge>
            )}
          </div>
          
          {/* Actions overlay */}
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="bg-background/80 hover:bg-background"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="bg-background/80 hover:bg-background"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Organizador */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={organizer.avatar} alt={organizer.name} />
              <AvatarFallback className="text-xs">{organizer?.name?.[0] ?? 'U'}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              Organizado por {organizer.name}
            </span>
          </div>

          {/* Título */}
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Descripción */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>

          {/* Información del evento */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
              <Clock className="h-4 w-4 ml-2" />
              <span>{time}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span className={getAvailabilityColor()}>
                  {currentAttendees}/{maxAttendees} asistentes
                </span>
              </div>
              {price > 0 && (
                <span className="text-lg font-semibold text-primary">
                  €{price}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button
          variant={attending ? "default" : "outline"}
          className="flex-1"
          onClick={handleAttendance}
          disabled={!attending && currentAttendees >= maxAttendees}
        >
          {attending ? "Asistiré" : "Asistir"}
        </Button>
        
        <Button
          variant={interested ? "default" : "outline"}
          size="icon"
          onClick={handleInterest}
        >
          <Heart 
            className={`h-4 w-4 ${interested ? 'fill-current' : ''}`} 
          />
        </Button>
      </CardFooter>
    </Card>
  );
};