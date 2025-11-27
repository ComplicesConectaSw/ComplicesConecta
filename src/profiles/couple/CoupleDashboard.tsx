import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/useToast';
import { advancedCoupleService, CoupleProfile, CoupleEvent, CoupleMatch } from '@/profiles/couple/AdvancedCoupleService';
import {
  Users,
  Heart,
  Calendar,
  Star,
  TrendingUp,
  MessageCircle,
  Eye,
  Gift,
  Plus,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export const CoupleDashboard: React.FC = () => {
  const [coupleProfile, setCoupleProfile] = useState<CoupleProfile | null>(null);
  const [nearbyCouples, setNearbyCouples] = useState<CoupleProfile[]>([]);
  const [_compatibleCouples, setCompatibleCouples] = useState<CoupleProfile[]>([]);
  const [coupleEvents, setCoupleEvents] = useState<CoupleEvent[]>([]);
  const [coupleMatches, setCoupleMatches] = useState<CoupleMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadCoupleData();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(loadCoupleData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadCoupleData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simular carga de datos de pareja
      const mockCoupleProfile: CoupleProfile = {
        id: 'couple-1',
        partner1_id: 'user1',
        partner2_id: 'user2',
        couple_name: 'Sofía y Carlos',
        bio: 'Pareja swinger experimentada buscando conexiones auténticas y encuentros discretos. Disfrutamos de la música, viajes y conocer parejas interesantes.',
        interests: ['música', 'viajes', 'gastronomía', 'arte', 'deportes'],
        location: 'Madrid, España',
        latitude: 40.4168,
        longitude: -3.7038,
        age_range_min: 25,
        age_range_max: 45,
        looking_for: ['parejas', 'eventos', 'viajes'],
        experience_level: 'intermediate',
        relationship_type: 'married',
        relationship_duration: 24,
        is_active: true,
        is_verified: true,
        is_premium: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        photos: ['/placeholder.svg', '/placeholder.svg'],
        videos: [],
        preferences: {
          gender_preferences: ['mixed'],
          age_preferences: { min: 25, max: 45 },
          location_preferences: { max_distance: 50, cities: ['Madrid', 'Barcelona'] },
          activity_preferences: ['cena', 'eventos', 'viajes'],
          communication_preferences: ['chat', 'videollamada'],
          meeting_preferences: ['público', 'privado'],
          privacy_level: 'discrete'
        },
        statistics: {
          total_views: 156,
          total_likes: 23,
          total_matches: 8,
          total_messages: 45,
          response_rate: 85.5,
          profile_completeness: 92,
          last_active: new Date().toISOString(),
          join_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          verification_level: 3
        },
        compatibility_factors: {
          shared_interests: ['música', 'viajes'],
          compatibility_score: 0.85,
          personality_match: 0.9,
          lifestyle_match: 0.8,
          location_compatibility: 0.95,
          experience_compatibility: 0.75
        }
      };

      setCoupleProfile(mockCoupleProfile);
      
      // Simular parejas cercanas
      const mockNearbyCouples: CoupleProfile[] = [
        {
          id: 'couple-2',
          partner1_id: 'user3',
          partner2_id: 'user4',
          couple_name: 'Ana y Miguel',
          bio: 'Pareja joven explorando el lifestyle swinger',
          interests: ['música', 'deportes', 'cine'],
          location: 'Madrid, España',
          latitude: 40.4168,
          longitude: -3.7038,
          age_range_min: 28,
          age_range_max: 35,
          looking_for: ['parejas', 'eventos'],
          experience_level: 'beginner',
          relationship_type: 'dating',
          relationship_duration: 12,
          is_active: true,
          is_verified: false,
          is_premium: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          photos: ['/placeholder.svg'],
          videos: [],
          preferences: {
            gender_preferences: ['mixed'],
            age_preferences: { min: 25, max: 40 },
            location_preferences: { max_distance: 30, cities: ['Madrid'] },
            activity_preferences: ['cena', 'eventos'],
            communication_preferences: ['chat'],
            meeting_preferences: ['público'],
            privacy_level: 'public'
          },
          statistics: {
            total_views: 45,
            total_likes: 8,
            total_matches: 2,
            total_messages: 12,
            response_rate: 75.0,
            profile_completeness: 78,
            last_active: new Date().toISOString(),
            join_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            verification_level: 1
          },
          compatibility_factors: {
            shared_interests: ['música'],
            compatibility_score: 0.72,
            personality_match: 0.8,
            lifestyle_match: 0.7,
            location_compatibility: 0.9,
            experience_compatibility: 0.6
          }
        }
      ];

      setNearbyCouples(mockNearbyCouples);
      setCompatibleCouples(mockNearbyCouples);
      
      // Simular eventos
      const mockEvents: CoupleEvent[] = [
        {
          id: 'event-1',
          couple_id: 'couple-1',
          title: 'Cena Swinger en Madrid',
          description: 'Cena elegante para parejas swinger en restaurante exclusivo',
          event_type: 'dinner',
          location: 'Madrid, España',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          max_participants: 8,
          participants: ['couple-2'],
          is_public: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setCoupleEvents(mockEvents);
      
      // Simular matches
      const mockMatches: CoupleMatch[] = [
        {
          id: 'match-1',
          couple1_id: 'couple-1',
          couple2_id: 'couple-2',
          match_score: 0.85,
          compatibility_factors: {
            shared_interests: ['música'],
            compatibility_score: 0.85,
            personality_match: 0.9,
            lifestyle_match: 0.8,
            location_compatibility: 0.95,
            experience_compatibility: 0.75
          },
          match_reasons: ['Intereses compartidos', 'Ubicación cercana', 'Experiencia compatible'],
          created_at: new Date().toISOString(),
          status: 'accepted'
        }
      ];

      setCoupleMatches(mockMatches);
      
    } catch (err) {
      setError('Error loading couple data');
      console.error('Error loading couple data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeCouple = async (coupleId: string) => {
    try {
      if (!coupleProfile) return;
      
      await advancedCoupleService.recordCoupleInteraction(
        coupleProfile.id,
        coupleId,
        'like'
      );
      
      toast({
        title: "Like enviado",
        description: "Has enviado un like a la pareja",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo enviar el like",
        variant: "destructive"
      });
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      if (!coupleProfile) return;
      
      const success = await advancedCoupleService.joinCoupleEvent(eventId, coupleProfile.id);
      
      if (success) {
        toast({
          title: "Te has unido al evento",
          description: "Has sido añadido a la lista de participantes",
        });
        
        // Actualizar la lista de eventos
        setCoupleEvents(prev => 
          prev.map(event => 
            event.id === eventId 
              ? { ...event, participants: [...event.participants, coupleProfile.id] }
              : event
          )
        );
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo unir al evento",
        variant: "destructive"
      });
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'secondary';
      case 'intermediate': return 'default';
      case 'advanced': return 'default';
      case 'expert': return 'destructive';
      default: return 'secondary';
    }
  };

  const getRelationshipTypeColor = (type: string) => {
    switch (type) {
      case 'married': return 'destructive';
      case 'engaged': return 'default';
      case 'dating': return 'secondary';
      case 'open_relationship': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando dashboard de parejas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!coupleProfile) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No se encontró el perfil de pareja</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Users className="mr-2 h-6 w-6" />
            Dashboard de Parejas
          </h2>
          <p className="text-muted-foreground">
            {coupleProfile.couple_name} • {coupleProfile.location}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadCoupleData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas de la pareja */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vistas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupleProfile.statistics.total_views}</div>
            <p className="text-xs text-muted-foreground">
              Perfil visto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{coupleProfile.statistics.total_likes}</div>
            <p className="text-xs text-muted-foreground">
              Likes recibidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matches</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{coupleProfile.statistics.total_matches}</div>
            <p className="text-xs text-muted-foreground">
              Parejas compatibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{coupleProfile.statistics.total_messages}</div>
            <p className="text-xs text-muted-foreground">
              Conversaciones activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="discover">Descubrir</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Información de la pareja */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Información de la Pareja
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">{coupleProfile.couple_name}</h4>
                    <p className="text-sm text-muted-foreground">{coupleProfile.bio}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getExperienceLevelColor(coupleProfile.experience_level)}>
                      {coupleProfile.experience_level}
                    </Badge>
                    <Badge variant={getRelationshipTypeColor(coupleProfile.relationship_type)}>
                      {coupleProfile.relationship_type}
                    </Badge>
                    <Badge variant="outline">
                      {coupleProfile.relationship_duration} meses
                    </Badge>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Intereses:</h5>
                    <div className="flex flex-wrap gap-1">
                      {coupleProfile.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Completitud del perfil:</h5>
                    <Progress value={coupleProfile.statistics.profile_completeness} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {coupleProfile.statistics.profile_completeness}% completo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas de compatibilidad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Compatibilidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Score General</span>
                      <span className="text-sm text-muted-foreground">
                        {(coupleProfile.compatibility_factors.compatibility_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={coupleProfile.compatibility_factors.compatibility_score * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Personalidad</span>
                      <span className="text-sm text-muted-foreground">
                        {(coupleProfile.compatibility_factors.personality_match * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={coupleProfile.compatibility_factors.personality_match * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Estilo de Vida</span>
                      <span className="text-sm text-muted-foreground">
                        {(coupleProfile.compatibility_factors.lifestyle_match * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={coupleProfile.compatibility_factors.lifestyle_match * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Ubicación</span>
                      <span className="text-sm text-muted-foreground">
                        {(coupleProfile.compatibility_factors.location_compatibility * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={coupleProfile.compatibility_factors.location_compatibility * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Parejas Cercanas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nearbyCouples.length > 0 ? (
                  nearbyCouples.map((couple) => (
                    <div key={couple.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{couple.couple_name}</h4>
                          <p className="text-sm text-muted-foreground">{couple.location}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getExperienceLevelColor(couple.experience_level)}>
                            {couple.experience_level}
                          </Badge>
                          <Badge variant="outline">
                            {(couple.compatibility_factors.compatibility_score * 100).toFixed(0)}% match
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {couple.bio}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex flex-wrap gap-1">
                          {couple.interests.slice(0, 3).map((interest, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLikeCouple(couple.id)}
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            Like
                          </Button>
                          <Button size="sm">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Mensaje
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No hay parejas cercanas</h3>
                    <p className="text-muted-foreground">Intenta ampliar tu rango de búsqueda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5" />
                Matches de Parejas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coupleMatches.length > 0 ? (
                  coupleMatches.map((match) => (
                    <div key={match.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Match con pareja</h4>
                          <p className="text-sm text-muted-foreground">
                            Score: {(match.match_score * 100).toFixed(1)}%
                          </p>
                        </div>
                        <Badge variant={match.status === 'accepted' ? 'default' : 'secondary'}>
                          {match.status}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <h5 className="font-medium mb-2">Razones del match:</h5>
                        <ul className="text-sm space-y-1">
                          {match.match_reasons.map((reason, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Mensaje
                        </Button>
                        <Button size="sm">
                          <Gift className="mr-2 h-4 w-4" />
                          Enviar Regalo
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No hay matches aún</h3>
                    <p className="text-muted-foreground">Explora parejas cercanas para encontrar matches</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Eventos de Parejas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coupleEvents.length > 0 ? (
                  coupleEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()} • {event.location}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {event.event_type}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {event.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {event.participants.length} / {event.max_participants} participantes
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handleJoinEvent(event.id)}
                          disabled={event.participants.includes(coupleProfile.id)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {event.participants.includes(coupleProfile.id) ? 'Unido' : 'Unirse'}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No hay eventos disponibles</h3>
                    <p className="text-muted-foreground">Crea un evento o espera a que aparezcan nuevos</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
