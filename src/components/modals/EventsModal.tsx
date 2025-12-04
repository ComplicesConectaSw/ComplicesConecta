import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Crown, Shield, Clock, Star } from 'lucide-react';

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinPremium?: () => void;
}

const EventsModal: React.FC<EventsModalProps> = ({ 
  isOpen, 
  onClose, 
  onJoinPremium 
}) => {
  const eventTypes = [
    {
      icon: Crown,
      title: 'Fiestas VIP Exclusivas',
      description: 'Eventos privados en ubicaciones premium con parejas verificadas',
      color: 'text-yellow-400'
    },
    {
      icon: Users,
      title: 'Encuentros Temáticos',
      description: 'Noches especiales con temáticas específicas del lifestyle',
      color: 'text-purple-400'
    },
    {
      icon: Shield,
      title: 'Ambiente Seguro',
      description: 'Todos los asistentes están verificados y son miembros activos',
      color: 'text-green-400'
    },
    {
      icon: MapPin,
      title: 'Ubicaciones Premium',
      description: 'Clubs exclusivos, hoteles boutique y espacios privados',
      color: 'text-blue-400'
    }
  ];

  const upcomingEvents = [
    {
      title: 'Noche de Parejas Premium',
      date: '15 Sep 2024',
      time: '21:00',
      location: 'Club Privado CDMX',
      attendees: 24,
      maxAttendees: 30
    },
    {
      title: 'Encuentro Lifestyle Guadalajara',
      date: '22 Sep 2024',
      time: '20:30',
      location: 'Hotel Boutique',
      attendees: 18,
      maxAttendees: 25
    },
    {
      title: 'Fiesta Temática Monterrey',
      date: '29 Sep 2024',
      time: '22:00',
      location: 'Espacio Privado',
      attendees: 12,
      maxAttendees: 20
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 backdrop-blur-md border-purple-500/30 text-white max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white drop-shadow-lg">
            <Calendar className="h-6 w-6 text-purple-400" />
            Eventos VIP Exclusivos
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-500/50">
              <Calendar className="h-8 w-8 text-white drop-shadow-md" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white drop-shadow-lg">
              Vive experiencias únicas
            </h3>
            <p className="text-white font-medium text-sm drop-shadow-md">
              Accede a eventos exclusivos de la comunidad swinger más premium de México.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {eventTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
                  <Icon className={`h-5 w-5 ${type.color} mt-0.5`} />
                  <div>
                    <p className="font-medium text-sm">{type.title}</p>
                    <p className="text-xs text-white/70">{type.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              Próximos Eventos
            </h4>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium">{event.title}</h5>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                      VIP
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-white/80">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.attendees}/{event.maxAttendees}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
                        style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-lg border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-yellow-400" />
              <span className="font-medium">Acceso Premium Requerido</span>
            </div>
            <p className="text-xs text-white/70 mb-3">
              Los eventos VIP están disponibles exclusivamente para miembros Premium verificados. 
              Incluye entrada, bebidas de bienvenida y ambiente 100% seguro.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Shield className="h-3 w-3 text-green-400" />
              <span className="text-white/80">Todos los asistentes están verificados</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Tal vez después
            </Button>
            {onJoinPremium && (
              <Button
                onClick={onJoinPremium}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
              >
                <Crown className="h-4 w-4 mr-2" />
                Ser Premium
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventsModal;

