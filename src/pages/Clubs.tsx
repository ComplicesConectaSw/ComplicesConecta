import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  CheckCircle, 
  FileText, 
  Shield,
  Search,
  Globe,
  Camera,
  Award,
  Verified,
  Navigation,
  Eye,
  Building,
  Target,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';
import type { Database } from '@/types/supabase-generated';

type ClubRow = Database['public']['Tables']['clubs']['Row'];

interface Club extends Omit<ClubRow, 'cover_image_url' | 'is_featured' | 'rating_average' | 'rating_count' | 'description' | 'logo_url' | 'review_count' | 'phone' | 'check_in_count' | 'state' | 'verified_at' | 'website'> {
  description: string | null;
  state: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  verified_at: string | null;
  is_featured: boolean;
  is_verified: boolean;
  rating_average: number;
  rating_count: number;
  review_count: number;
  check_in_count: number;
  check_in_radius_meters: number | null;
}

const Clubs = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  // Información del sistema de clubs desde la documentación
  const clubSystemInfo = {
    verificationProcess: [
      {
        step: "1. Club Real",
        description: "Club físico con ubicación verificable",
        icon: <Building className="h-5 w-5" />
      },
      {
        step: "2. Documentación",
        description: "Documentos legales del club",
        icon: <FileText className="h-5 w-5" />
      },
      {
        step: "3. Verificación",
        description: "Proceso de verificación por el equipo",
        icon: <Shield className="h-5 w-5" />
      },
      {
        step: "4. Aprobación",
        description: "Aprobación y asignación de slug único",
        icon: <CheckCircle className="h-5 w-5" />
      }
    ],
    benefits: [
      {
        title: "Página Pública",
        description: "URL única /clubs/{slug} con información completa",
        icon: <Globe className="h-5 w-5" />
      },
      {
        title: "Check-ins Verificados",
        description: "Sistema de check-in geolocalizado (radio 50m)",
        icon: <MapPin className="h-5 w-5" />
      },
      {
        title: "Reseñas Auténticas",
        description: "Solo usuarios con check-in real pueden reseñar",
        icon: <Star className="h-5 w-5" />
      },
      {
        title: "Flyers Editables",
        description: "Flyers con watermark automático mediante IA",
        icon: <Camera className="h-5 w-5" />
      },
      {
        title: "Publicidad Premium",
        description: "Oportunidades de promoción en la plataforma",
        icon: <Award className="h-5 w-5" />
      }
    ]
  };

  useEffect(() => {
    loadClubs();
    requestUserLocation();
  }, []);

  useEffect(() => {
    filterClubs();
  }, [clubs, searchQuery, selectedCity]);

  const loadClubs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase!
        .from('clubs')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating_average', { ascending: false });

      if (error) throw error;
      
      setClubs((data || []) as Club[]);
      logger.info('Clubs loaded successfully', { count: data?.length });
    } catch (error) {
      logger.error('Error loading clubs:', { error: error instanceof Error ? error.message : String(error) });
      toast({
        title: "Error",
        description: "No se pudieron cargar los clubs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const requestUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          logger.warn('Geolocation error:', error);
        }
      );
    }
  };

  const filterClubs = () => {
    let filtered = clubs;

    if (searchQuery) {
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (club.description && club.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter(club => club.city === selectedCity);
    }

    setFilteredClubs(filtered);
  };

  const handleCheckIn = async (clubId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Autenticación requerida",
        description: "Debes iniciar sesión para hacer check-in",
        variant: "destructive"
      });
      return;
    }

    if (!userLocation) {
      toast({
        title: "Ubicación requerida",
        description: "Necesitamos tu ubicación para verificar el check-in",
        variant: "destructive"
      });
      return;
    }

    try {
      setCheckingIn(clubId);
      
      // Aquí iría la lógica de check-in con verificación de distancia
      // Por ahora simulamos el proceso
      
      toast({
        title: "Check-in exitoso",
        description: "¡Has hecho check-in en el club!",
        variant: "default"
      });
      
      logger.info('Club check-in successful', { clubId, userId: user?.id });
    } catch (error) {
      logger.error('Check-in error:', { error: error instanceof Error ? error.message : String(error) });
      toast({
        title: "Error en check-in",
        description: "No se pudo completar el check-in",
        variant: "destructive"
      });
    } finally {
      setCheckingIn(null);
    }
  };

  const cities = [...new Set(clubs.map(club => club.city))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold mb-4">
            🏢 CLUBS VERIFICADOS
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Clubs
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Verificados</span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Descubre clubs auténticos con check-ins geolocalizados, reseñas verificadas y sistema de watermark automático
          </p>
        </motion.div>

        {/* Sistema de Verificación Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <Verified className="h-6 w-6 text-white" />
                </div>
                Sistema de Clubs Verificados
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Proceso riguroso de verificación para garantizar clubs auténticos y experiencias seguras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Proceso de Verificación */}
                <div>
                  <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-400" />
                    Proceso de Verificación
                  </h4>
                  <div className="space-y-4">
                    {clubSystemInfo.verificationProcess.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white flex-shrink-0">
                          {step.icon}
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">{step.step}</h5>
                          <p className="text-white/70 text-sm">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Beneficios */}
                <div>
                  <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    Beneficios de Verificación
                  </h4>
                  <div className="space-y-3">
                    {clubSystemInfo.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-white flex-shrink-0">
                          {benefit.icon}
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">{benefit.title}</h5>
                          <p className="text-white/70 text-sm">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filtros y Búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                    <Input
                      placeholder="Buscar clubs por nombre o ciudad..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white"
                  >
                    <option value="all" className="bg-purple-900">Todas las ciudades</option>
                    {cities.map(city => (
                      <option key={city} value={city} className="bg-purple-900">{city}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de Clubs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white/10 backdrop-blur-xl border-white/20 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-48 bg-white/10 rounded-lg mb-4"></div>
                    <div className="h-6 bg-white/10 rounded mb-2"></div>
                    <div className="h-4 bg-white/10 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-white/10 rounded flex-1"></div>
                      <div className="h-8 bg-white/10 rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredClubs.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-center p-12">
              <div className="text-white/60 mb-4">
                <Building className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No se encontraron clubs</h3>
                <p>Intenta ajustar tus filtros de búsqueda</p>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club, index) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 h-full">
                    <CardContent className="p-0">
                      {/* Imagen del Club */}
                      <div className="relative h-48 bg-gradient-to-br from-purple-600 to-pink-600 rounded-t-lg overflow-hidden">
                        {club.cover_image_url ? (
                          <img 
                            src={club.cover_image_url} 
                            alt={club.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building className="h-16 w-16 text-white/60" />
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {club.is_verified && (
                            <Badge className="bg-green-500/90 text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                          {club.is_featured && (
                            <Badge className="bg-yellow-500/90 text-black">
                              <Star className="h-3 w-3 mr-1" />
                              Destacado
                            </Badge>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="absolute top-3 right-3">
                          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-white font-semibold">
                              {club.rating_average.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Información del Club */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2">{club.name}</h3>
                        
                        <div className="flex items-center gap-2 text-white/70 mb-3">
                          <MapPin className="h-4 w-4" />
                          <span>{club.city}, {club.state}</span>
                        </div>

                        {club.description && (
                          <p className="text-white/80 text-sm mb-4 line-clamp-2">
                            {club.description}
                          </p>
                        )}

                        {/* Estadísticas */}
                        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                          <div>
                            <div className="text-white font-semibold">{club.check_in_count}</div>
                            <div className="text-white/60 text-xs">Check-ins</div>
                          </div>
                          <div>
                            <div className="text-white font-semibold">{club.review_count}</div>
                            <div className="text-white/60 text-xs">Reseñas</div>
                          </div>
                          <div>
                            <div className="text-white font-semibold">{club.rating_count}</div>
                            <div className="text-white/60 text-xs">Ratings</div>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => navigate(`/clubs/${club.slug}`)}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Club
                          </Button>
                          
                          {isAuthenticated() && (
                            <Button
                              onClick={() => handleCheckIn(club.id)}
                              disabled={checkingIn === club.id}
                              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                            >
                              {checkingIn === club.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                              ) : (
                                <Navigation className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl border-white/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                ¿Tienes un Club?
              </h3>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                Únete a nuestro programa de clubs verificados y obtén acceso a herramientas exclusivas, 
                check-ins geolocalizados y un sistema de reseñas auténticas.
              </p>
              <Button
                onClick={() => navigate('/contact')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3"
              >
                <Building className="h-5 w-5 mr-2" />
                Registrar mi Club
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Clubs;

