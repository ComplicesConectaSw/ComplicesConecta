import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Star, Heart, Share2, Filter, Search, Plus, AlertTriangle, X, ArrowLeft, Lock, Sparkles, Crown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NavigationEnhanced from "@/components/NavigationEnhanced";
import { motion } from 'framer-motion';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { usePersistedState } from '@/hooks/usePersistedState';
import { logger } from '@/lib/logger';

const Events = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("events");
  const [showAgeModal, setShowAgeModal] = useState(false);

  // Estado persistente para verificación de edad
  const [ageVerified, setAgeVerified] = usePersistedState<boolean>('ageVerified', false);

  useEffect(() => {
    // Check if user has confirmed age verification
    if (!ageVerified) {
      setShowAgeModal(true);
    }
  }, [ageVerified]);

  const handleAgeConfirmation = (confirmed: boolean) => {
    if (confirmed) {
      setAgeVerified(true);
      setShowAgeModal(false);
    } else {
      navigate('/');
    }
  };

  const lifestyleEvents = [
    {
      id: 1,
      title: "Encuentro Elegante - Parejas Selectas CDMX",
      description: "Evento exclusivo para parejas verificadas con experiencia en el estilo de vida swinger en la Ciudad de México",
      date: "2024-03-15",
      time: "21:00",
      location: "Villa Privada Polanco, CDMX",
      attendees: 24,
      maxAttendees: 30,
      price: 2500,
      category: "VIP Exclusivo",
      image: "/placeholder.svg",
      organizer: {
        name: "Elite Connections México",
        avatar: "/placeholder.svg"
      },
      isJoined: true,
      isLiked: true,
      isVerified: true,
      ageRange: "25-45"
    },
    {
      id: 2,
      title: "Velada Íntima Swinger Guadalajara",
      description: "Encuentro sofisticado para parejas que buscan conexiones auténticas y experiencias compartidas en ambiente swinger",
      date: "2024-03-20",
      time: "20:00",
      location: "Club Privado Zapopan, Jalisco",
      attendees: 16,
      maxAttendees: 20,
      price: 1800,
      category: "Conexiones Swinger",
      image: "/placeholder.svg",
      organizer: {
        name: "Intimate Gatherings GDL",
        avatar: "/placeholder.svg"
      },
      isJoined: false,
      isLiked: true,
      isVerified: true,
      ageRange: "28-50"
    },
    {
      id: 3,
      title: "Fiesta Acuática Swinger Cancún",
      description: "Celebración en ambiente relajado con piscina climatizada para parejas del estilo de vida swinger en la Riviera Maya",
      date: "2024-03-25",
      time: "15:00",
      location: "Resort Privado Playa del Carmen, Q.Roo",
      attendees: 32,
      maxAttendees: 40,
      price: 3200,
      category: "Ambiente Playero",
      image: "/placeholder.svg",
      organizer: {
        name: "Aqua Lifestyle Cancún",
        avatar: "/placeholder.svg"
      },
      isJoined: false,
      isLiked: false,
      isVerified: true,
      ageRange: "30-55"
    }
  ];

  const lifestyleClubs = [
    {
      id: 1,
      name: "Club Elite CDMX",
      description: "Comunidad exclusiva para parejas verificadas con experiencia en el estilo de vida swinger en la Ciudad de México",
      memberCount: 156,
      maxMembers: 200,
      isPrivate: true,
      category: "Club VIP",
      image: "/placeholder.svg",
      admin: {
        name: "Administración Elite México",
        avatar: "/placeholder.svg"
      },
      lastActivity: "Hace 1h",
      isJoined: false,
      isPending: true,
      reputation: 4.9,
      verified: true,
      requirements: "Parejas 25-50 años, verificación KYC + experiencia swinger"
    },
    {
      id: 2,
      name: "Swingers Principiantes México",
      description: "Comunidad para parejas que inician en el estilo de vida swinger con ambiente relajado y educativo",
      memberCount: 89,
      maxMembers: 120,
      isPrivate: false,
      category: "Principiantes",
      image: "/placeholder.svg",
      admin: {
        name: "Coordinadores Swinger MX",
        avatar: "/placeholder.svg"
      },
      lastActivity: "Hace 2h",
      isJoined: true,
      isPending: false,
      reputation: 4.6,
      verified: true,
      requirements: "Parejas 21+ años, mente abierta, respeto mutuo"
    },
    {
      id: 3,
      name: "Aqua Swinger Riviera Maya",
      description: "Club especializado en eventos acuáticos y celebraciones swinger en destinos playeros de México",
      memberCount: 203,
      maxMembers: 250,
      isPrivate: true,
      category: "Eventos Playeros",
      image: "/placeholder.svg",
      admin: {
        name: "Aqua Team Cancún",
        avatar: "/placeholder.svg"
      },
      lastActivity: "Hace 30min",
      isJoined: false,
      isPending: false,
      reputation: 4.8,
      verified: true,
      requirements: "Parejas verificadas, eventos de temporada alta"
    }
  ];

  const handleJoinEvent = (eventId: number) => {
    logger.info('Join event:', { eventId });
  };

  const handleLikeEvent = (eventId: number) => {
    logger.info('Like event:', { eventId });
  };

  const handleJoinGroup = (groupId: number) => {
    logger.info('Join group:', { groupId });
  };

  const handleViewGroup = (groupId: number) => {
    logger.info('View group:', { groupId });
  };

  const filteredEvents = lifestyleEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClubs = lifestyleClubs.filter(club =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Age Verification Modal */}
      {showAgeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border-destructive/20">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Verificación de Edad
              </h2>
              <p className="text-white mb-6">
                Este contenido está destinado exclusivamente para adultos mayores de 18 años. 
                Al continuar, confirmas que tienes la edad legal requerida.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleAgeConfirmation(false)}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Salir
                </Button>
                <Button 
                  onClick={() => handleAgeConfirmation(true)}
                  className="flex-1"
                >
                  Soy mayor de 18 años
                </Button>
              </div>
              <p className="text-xs text-white mt-4">
                Al confirmar, aceptas nuestros{' '}
                <button 
                  onClick={() => navigate('/terms')}
                  className="text-primary hover:underline"
                >
                  Términos y Condiciones
                </button>
                {' '}y{' '}
                <button 
                  onClick={() => navigate('/privacy')}
                  className="text-primary hover:underline"
                >
                  Política de Privacidad
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-secondary/20"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Floating Hearts */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
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
      </div>
      
      <div className="relative z-10">
        <NavigationEnhanced />
        
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

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Eventos Swinger México
              <span className="block bg-love-gradient bg-clip-text text-transparent">
                Experiencias Exclusivas para Parejas
              </span>
            </h1>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Encuentros privados, clubs verificados y experiencias swinger en México
            </p>
          </div>

          {/* Coming Soon Banner */}
          <Card className="bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 mb-12">
            <CardContent className="text-center py-8">
              <Lock className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Integración de Clubs - Post Beta</h2>
              <p className="text-white mb-4">
                Los clubs swinger de México podrán integrarse a la plataforma después de la beta, 
                con sistema de reputación basado en valoraciones de usuarios verificados.
              </p>
              <Badge variant="secondary" className="bg-accent/20 text-accent">
                <Sparkles className="h-4 w-4 mr-1" />
                Próximamente
              </Badge>
            </CardContent>
          </Card>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
              <Input
                placeholder="Buscar fiestas swinger, clubs privados, eventos en México..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/80 backdrop-blur-sm border-primary/20"
              />
            </div>
          </div>

          {/* Tab Buttons */}
          <div className="flex justify-center mb-8">
            <div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-xl p-1">
              <Button
                variant={activeTab === "events" ? "default" : "ghost"}
                onClick={() => setActiveTab("events")}
                className="rounded-lg"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Eventos VIP
              </Button>
              <Button
                variant={activeTab === "clubs" ? "default" : "ghost"}
                onClick={() => setActiveTab("clubs")}
                className="rounded-lg"
              >
                <Crown className="mr-2 h-4 w-4" />
                Clubs Swinger
              </Button>
            </div>
          </div>

          {/* Events Section */}
          {activeTab === "events" && (
            <div className="space-y-6">
              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <Card 
                    key={event.id}
                    className="bg-card/80 backdrop-blur-sm border border-primary/10 overflow-hidden animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-48 object-contain bg-gradient-to-br from-muted/20 to-muted/10"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="destructive" className="bg-accent">
                          {event.category}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        {event.isVerified && (
                          <Shield className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg text-foreground mb-2">{event.title}</h3>
                      <p className="text-white text-sm mb-4">{event.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-white">
                          <Calendar className="h-4 w-4" />
                          {event.date} - {event.time}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white">
                          <Users className="h-4 w-4" />
                          {event.attendees}/{event.maxAttendees} parejas ({event.ageRange})
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">${event.price} MXN</span>
                        <Button 
                          variant={event.isJoined ? "secondary" : "default"}
                          size="sm"
                          disabled
                        >
                          {event.isJoined ? "Inscrito" : "Post-Beta"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-16">
                  <div className="bg-muted/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No se encontraron eventos
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Intenta con otros términos de búsqueda
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Clubs Section */}
          {activeTab === "clubs" && (
            <div className="space-y-6">
              {/* Clubs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubs.map((club, index) => (
                  <Card 
                    key={club.id}
                    className="bg-card/80 backdrop-blur-sm border border-primary/10 overflow-hidden animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative">
                      <img 
                        src={club.image} 
                        alt={club.name}
                        className="w-full h-48 object-contain bg-gradient-to-br from-muted/20 to-muted/10"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          {club.category}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-1 bg-black/50 backdrop-blur-sm rounded-full p-2">
                        {club.verified && (
                          <Shield className="h-5 w-5 text-green-400 drop-shadow-lg" />
                        )}
                        {club.isPrivate && (
                          <Lock className="h-5 w-5 text-yellow-400 drop-shadow-lg" />
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-foreground">{club.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-accent fill-current" />
                          <span className="text-sm font-medium">{club.reputation}</span>
                        </div>
                      </div>
                      
                      <p className="text-white text-sm mb-4">{club.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-white">
                          <Users className="h-4 w-4" />
                          {club.memberCount}/{club.maxMembers} miembros
                        </div>
                        <div className="text-xs text-white">
                          <strong>Requisitos:</strong> {club.requirements}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">{club.lastActivity}</span>
                        <Button 
                          variant={club.isJoined ? "secondary" : club.isPending ? "outline" : "default"}
                          size="sm"
                          disabled
                        >
                          {club.isJoined ? "Miembro" : club.isPending ? "Pendiente" : "Post-Beta"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredClubs.length === 0 && (
                <div className="text-center py-16">
                  <div className="bg-muted/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No se encontraron clubs
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Intenta con otros términos de búsqueda
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

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

export default Events;