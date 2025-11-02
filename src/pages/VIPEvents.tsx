import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Calendar, MapPin, Users, Star, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HeaderNav from '@/components/HeaderNav';

const VIPEvents = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const vipEvents = [
    {
      id: 1,
      title: "Fiesta Privada VIP - Polanco",
      description: "Evento exclusivo para parejas verificadas en una mansión privada de Polanco. Ambiente elegante con cócteles premium, música sofisticada y espacios íntimos para conexiones auténticas.",
      date: "2025-11-15",
      time: "21:00",
      location: "Polanco, Ciudad de México",
      capacity: 25,
      attendees: 18,
      price: "VIP",
      category: "Fiesta Privada",
      image: "https://images.unsplash.com/photo-1519167758481-83f142bb8cba?w=400&h=300&fit=crop&crop=center",
      host: "María Elena & Carlos",
      rating: 4.9,
      verified: true,
      requirements: ["Verificación completa", "Pareja", "Dress code elegante"]
    },
    {
      id: 2,
      title: "Encuentro Íntimo - Condesa",
      description: "Sesión íntima para parejas experimentadas en un loft exclusivo de la Condesa. Ambiente relajado con música ambiente, spa privado y espacios para conexiones profundas.",
      date: "2025-11-22",
      time: "20:00",
      location: "Condesa, Ciudad de México",
      capacity: 15,
      attendees: 12,
      price: "Premium",
      category: "Encuentro Íntimo",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
      host: "Sofía & Roberto",
      rating: 4.8,
      verified: true,
      requirements: ["Experiencia previa", "Pareja", "Reserva anticipada"]
    },
    {
      id: 3,
      title: "Cena Elegante - Santa Fe",
      description: "Cena gourmet seguida de sesión privada en un restaurante exclusivo de Santa Fe. Experiencia completa con chef privado, sommelier y espacios íntimos para después de la cena.",
      date: "2025-12-05",
      time: "19:30",
      location: "Santa Fe, Ciudad de México",
      capacity: 20,
      attendees: 16,
      price: "Luxury",
      category: "Cena Elegante",
      image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop&crop=center",
      host: "Anabella & Julio",
      rating: 4.9,
      verified: true,
      requirements: ["Verificación premium", "Pareja", "Reserva con anticipación"]
    },
    {
      id: 4,
      title: "Retiro Wellness - Valle de Bravo",
      description: "Retiro de fin de semana en Valle de Bravo con actividades wellness, spa, y sesiones íntimas en un ambiente natural y relajado. Incluye alojamiento y todas las comidas.",
      date: "2025-12-14",
      time: "16:00",
      location: "Valle de Bravo, Estado de México",
      capacity: 12,
      attendees: 8,
      price: "Exclusive",
      category: "Retiro Wellness",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&crop=center",
      host: "Carmen & Roberto",
      rating: 5.0,
      verified: true,
      requirements: ["Verificación completa", "Pareja", "Confirmación 48h antes"]
    }
  ];

  const filters = [
    { id: 'all', label: 'Todos los Eventos' },
    { id: 'fiesta', label: 'Fiestas Privadas' },
    { id: 'encuentro', label: 'Encuentros Íntimos' },
    { id: 'cena', label: 'Cenas Elegantes' },
    { id: 'retiro', label: 'Retiros Wellness' }
  ];

  const filteredEvents = vipEvents.filter(event => {
    if (selectedFilter === 'all') return true;
    return event.category.toLowerCase().includes(selectedFilter);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-purple-800/20 to-blue-900/20"></div>
      
      <div className="relative z-10">
        <HeaderNav />
        
        <main className="container mx-auto px-4 py-8 pt-24">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              onClick={() => navigate('/events')}
              className="bg-card/80 backdrop-blur-sm border border-primary/20 hover:bg-primary/10 transition-all duration-300 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Eventos
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Crown className="h-12 w-12 text-yellow-400 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Eventos VIP
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Acceso exclusivo a los eventos más selectos y sofisticados de la comunidad swinger mexicana
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  variant={selectedFilter === filter.id ? "default" : "outline"}
                  className={
                    selectedFilter === filter.id
                      ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white"
                      : "border-white/30 text-white hover:bg-white/10"
                  }
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="bg-card/80 backdrop-blur-sm border border-primary/10 overflow-hidden">
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-yellow-500/90 text-white font-semibold">
                      {event.price}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    {event.verified && (
                      <Badge className="bg-green-500/90 text-white">
                        ✓ Verificado
                      </Badge>
                    )}
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-white text-xl">{event.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {event.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.location}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{event.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-1 text-blue-400" />
                        <span className="text-white">{event.attendees}/{event.capacity}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                        <span className="text-white">{event.rating}</span>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/80 text-white">
                      {event.category}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-white font-medium text-sm">Requisitos:</h4>
                    <div className="flex flex-wrap gap-1">
                      {event.requirements.map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-white/30 text-white">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      Host: <span className="text-white">{event.host}</span>
                    </div>
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700">
                      Solicitar Invitación
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* VIP Benefits */}
          <section className="mb-16">
            <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-600/20 backdrop-blur-sm border border-yellow-400/30">
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center">
                  Beneficios VIP Exclusivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">Acceso Prioritario</h3>
                    <p className="text-sm text-muted-foreground">
                      Reserva anticipada a eventos exclusivos antes que otros miembros
                    </p>
                  </div>
                  <div className="text-center">
                    <Star className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">Experiencias Premium</h3>
                    <p className="text-sm text-muted-foreground">
                      Acceso a eventos de lujo con servicios de alta calidad
                    </p>
                  </div>
                  <div className="text-center">
                    <Users className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">Comunidad Selecta</h3>
                    <p className="text-sm text-muted-foreground">
                      Conecta con miembros verificados y de alta calidad
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <Card className="bg-gradient-to-r from-purple-500/20 to-blue-600/20 backdrop-blur-sm border border-purple-400/30">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  ¿Listo para vivir experiencias VIP?
                </h2>
                <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                  Únete a nuestra comunidad VIP y accede a los eventos más exclusivos y sofisticados
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/premium')}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 px-8 py-3"
                  >
                    <Crown className="mr-2 h-5 w-5" />
                    Hacerse VIP
                  </Button>
                  <Button 
                    onClick={() => navigate('/support')}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-3"
                  >
                    Más Información
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
};

export default VIPEvents;
