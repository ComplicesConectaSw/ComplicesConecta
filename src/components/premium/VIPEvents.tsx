import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Crown,
  Ticket,
  Heart
} from "lucide-react";
import { safeGetItem } from '@/utils/safeLocalStorage';

// Check if user is in demo mode
const isDemoMode = () => {
  return safeGetItem<string>('demo_authenticated', { validate: true, defaultValue: 'false' }) === 'true';
};

import { useFeatures } from "@/hooks/useFeatures";
import { mockVIPEvents, VIPEvent } from "@/lib/data";

const VIPEvents = () => {
  const { features } = useFeatures();
  const [events] = useState<VIPEvent[]>(mockVIPEvents);
  const [selectedEvent, setSelectedEvent] = useState<VIPEvent | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  if (!features.eventsVIP && !isDemoMode()) {
    return (
      <Card className="p-8 text-center bg-black/30 backdrop-blur-sm border-white/10">
        <Calendar className="h-16 w-16 mx-auto mb-4 text-white/50" />
        <h3 className="text-xl font-semibold text-white mb-2">Eventos VIP Exclusivos</h3>
        <p className="text-white/70 mb-4">
          Accede a eventos privados y experiencias únicas para miembros Premium.
        </p>
        <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
          <Crown className="h-4 w-4 mr-2" />
          Actualizar a Premium
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
          <Crown className="h-6 w-6 mr-2 text-yellow-400" />
          Eventos VIP Exclusivos
        </h2>
        <p className="text-white/70">Experiencias únicas para miembros Premium</p>
      </div>

      <div className="grid gap-6">
        {events.map((event) => (
          <Card 
            key={event.id} 
            className="bg-black/30 backdrop-blur-sm border-white/10 overflow-hidden hover:scale-105 transition-transform cursor-pointer"
            onClick={() => setSelectedEvent(event)}
          >
            <div className="relative">
              <img 
                src={event.images[0]} 
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-yellow-500 text-black font-bold">
                  <Crown className="h-3 w-3 mr-1" />
                  VIP
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant="outline" className="border-white/20 text-white bg-black/50">
                  {event.currentAttendees}/{event.maxAttendees} asistentes
                </Badge>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
              <p className="text-white/70 mb-4 line-clamp-2">{event.description}</p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-white/80">
                  <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="text-sm">{formatDate(event.date)}</span>
                </div>
                
                <div className="flex items-center text-white/80">
                  <MapPin className="h-4 w-4 mr-2 text-green-400" />
                  <span className="text-sm">{event.location}</span>
                </div>
                
                <div className="flex items-center text-white/80">
                  <Users className="h-4 w-4 mr-2 text-purple-400" />
                  <span className="text-sm">Organizado por {event.organizer.name}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-white">
                  {formatPrice(event.price)}
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  <Ticket className="h-4 w-4 mr-2" />
                  Reservar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de evento */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-black/90 backdrop-blur-sm border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img 
                src={selectedEvent.images[0]} 
                alt={selectedEvent.title}
                className="w-full h-64 object-cover"
              />
              <Button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70"
                size="sm"
              >
                ✕
              </Button>
              <div className="absolute bottom-4 left-4">
                <Badge className="bg-yellow-500 text-black font-bold text-lg px-3 py-1">
                  <Crown className="h-4 w-4 mr-1" />
                  EVENTO VIP
                </Badge>
              </div>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">{selectedEvent.title}</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center text-white">
                    <Calendar className="h-5 w-5 mr-3 text-blue-400" />
                    <div>
                      <p className="font-medium">Fecha y Hora</p>
                      <p className="text-white/70 text-sm">{formatDate(selectedEvent.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-white">
                    <MapPin className="h-5 w-5 mr-3 text-green-400" />
                    <div>
                      <p className="font-medium">Ubicación</p>
                      <p className="text-white/70 text-sm">{selectedEvent.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-white">
                    <Users className="h-5 w-5 mr-3 text-purple-400" />
                    <div>
                      <p className="font-medium">Capacidad</p>
                      <p className="text-white/70 text-sm">
                        {selectedEvent.currentAttendees} de {selectedEvent.maxAttendees} confirmados
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <img 
                        src={selectedEvent.organizer.avatar} 
                        alt={selectedEvent.organizer.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div>
                        <p className="font-medium text-white">Organizador</p>
                        <p className="text-white/70 text-sm">{selectedEvent.organizer.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white mb-2">
                      {formatPrice(selectedEvent.price)}
                    </p>
                    <p className="text-white/70 text-sm">por persona</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-2">Descripción</h3>
                <p className="text-white/80 leading-relaxed">{selectedEvent.description}</p>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  size="lg"
                  onClick={() => {
                    alert('🎫 Reserva confirmada! Te contactaremos pronto con los detalles del evento VIP.');
                  }}
                >
                  <Ticket className="h-5 w-5 mr-2" />
                  Reservar Ahora
                </Button>
                <Button 
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  size="lg"
                  onClick={() => {
                    alert('❤️ Evento agregado a favoritos! Lo encontrarás en tu lista de eventos guardados.');
                  }}
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VIPEvents;

