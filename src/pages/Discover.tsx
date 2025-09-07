import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Heart, Flame, Crown, RefreshCw, Filter, Star, CheckCircle, MapPin, Home, User, Search } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { useGeolocation } from '@/hooks/useGeolocation';
import { pickProfileImage, inferProfileKind, resetImageCounters, type ProfileType, type Gender } from '@/lib/media';
import { lifestyleInterests as importedLifestyleInterests } from '@/lib/lifestyle-interests';

// Definición del tipo para un perfil
interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: number;
  interests: string[];
  image: string;
  bio: string;
  isOnline: boolean;
  lastActive: string;
  isVerified: boolean;
  isPremium: boolean;
  rating: number;
  matchScore: number;
  profileType: ProfileType;
  gender?: Gender;
}

interface Filters {
  ageRange: [number, number];
  distance: number;
  interests: string[];
  verified: boolean;
  premium: boolean;
  online: boolean;
}

const Discover = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { location, error: locationError } = useGeolocation();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    ageRange: [18, 65],
    distance: 50,
    interests: [],
    verified: false,
    premium: false,
    online: false
  });

  // Generar perfiles aleatorios
  const generateRandomProfiles = useCallback(() => {
    const nombres = [
      'Alejandro', 'María', 'Carlos', 'Ana', 'José', 'Laura', 'Miguel', 'Carmen',
      'Antonio', 'Isabel', 'Manuel', 'Pilar', 'Francisco', 'Dolores', 'David',
      'Cristina', 'Javier', 'Rosa', 'Daniel', 'Antonia', 'Rafael', 'Francisca',
      'José Luis', 'Lucía', 'Jesús', 'Mercedes', 'Ángel', 'Josefa', 'Marcos',
      'Elena', 'Pedro', 'Teresa', 'Sergio', 'Raquel', 'Pablo', 'Manuela'
    ];

    const ubicaciones = [
      'Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana',
      'León', 'Juárez', 'Torreón', 'Querétaro', 'San Luis Potosí',
      'Mérida', 'Mexicali', 'Aguascalientes', 'Cuernavaca', 'Saltillo'
    ];

    const bios = [
      'Aventurero en busca de nuevas experiencias y conexiones auténticas.',
      'Amante de la vida, los viajes y las buenas conversaciones.',
      'Explorando el mundo del lifestyle swinger con mente abierta.',
      'Buscando parejas y personas afines para compartir momentos únicos.',
      'Discreto, respetuoso y con ganas de conocer gente interesante.',
      'Pareja liberal en busca de otras parejas para intercambios.',
      'Nuevo en esto, pero con muchas ganas de aprender y disfrutar.',
      'Experiencia y diversión garantizada. Siempre con respeto.',
      'Mente abierta, corazón libre. Buscando conexiones reales.',
      'Lifestyle swinger desde hace años. Conocemos el ambiente.'
    ];

    resetImageCounters();

    const newProfiles: Profile[] = Array.from({ length: 50 }, (_, index) => {
      const name = nombres[Math.floor(Math.random() * nombres.length)];
      const profileKind = inferProfileKind({ name });
      const profileType: ProfileType = profileKind.kind === 'couple' ? 'couple' : 'single';
      const gender: Gender = profileKind.gender;
      const id = uuidv4();
      const usedImages = new Set<string>();
      
      return {
        id,
        name,
        age: Math.floor(Math.random() * (45 - 22 + 1)) + 22,
        location: ubicaciones[Math.floor(Math.random() * ubicaciones.length)],
        distance: Math.floor(Math.random() * 100) + 1,
        interests: importedLifestyleInterests
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 5) + 3),
        image: pickProfileImage({ id, name, type: profileType, gender }, usedImages),
        bio: bios[Math.floor(Math.random() * bios.length)],
        isOnline: Math.random() > 0.6,
        lastActive: Math.random() > 0.5 ? 'Hace 1 hora' : 'Hace 2 días',
        isVerified: Math.random() > 0.7,
        isPremium: Math.random() > 0.8,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        matchScore: Math.floor(Math.random() * 40) + 60,
        profileType,
        gender
      };
    });

    setProfiles(newProfiles);
    setFilteredProfiles(newProfiles);
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = profiles.filter(profile => {
      const ageMatch = profile.age >= filters.ageRange[0] && profile.age <= filters.ageRange[1];
      const distanceMatch = profile.distance <= filters.distance;
      const interestsMatch = filters.interests.length === 0 || 
        filters.interests.some(interest => profile.interests.includes(interest));
      const verifiedMatch = !filters.verified || profile.isVerified;
      const premiumMatch = !filters.premium || profile.isPremium;
      const onlineMatch = !filters.online || profile.isOnline;

      return ageMatch && distanceMatch && interestsMatch && verifiedMatch && premiumMatch && onlineMatch;
    });

    setFilteredProfiles(filtered);
  }, [profiles, filters]);

  // Función para cargar perfiles reales desde Supabase
  const loadRealProfiles = useCallback(async () => {
    try {
      // Por ahora, usar perfiles mock para usuarios reales también
      // TODO: Implementar carga real desde Supabase cuando esté configurado
      generateRandomProfiles();
    } catch (error) {
      console.error('Error loading real profiles:', error);
      // Fallback a perfiles mock
      generateRandomProfiles();
    }
  }, [generateRandomProfiles]);

  // Generar perfiles al cargar - solo para usuarios demo
  useEffect(() => {
    const demoAuth = localStorage.getItem('demo_authenticated');
    if (demoAuth === 'true') {
      generateRandomProfiles();
    } else {
      // Para usuarios reales, cargar perfiles desde Supabase
      loadRealProfiles();
    }
  }, [generateRandomProfiles, loadRealProfiles]);

  const handleProfileClick = (profile: Profile) => {
    navigate(`/profile/${profile.id}`, { state: { profile } });
  };

  const handleLike = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "¡Like enviado!",
      description: "Tu interés ha sido registrado.",
    });
  };

  const handleSuperLike = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "¡Super Like enviado!",
      description: "Has mostrado interés especial en este perfil.",
    });
  };

  const handleRefresh = () => {
    generateRandomProfiles();
    toast({
      title: "Perfiles actualizados",
      description: "Se han cargado nuevos perfiles para ti.",
    });
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-gradient-x"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-secondary/10 to-primary/15 animate-gradient-y"></div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-40 right-32 w-48 h-48 bg-accent/8 rounded-full blur-2xl animate-float-reverse"></div>
          <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-secondary/4 rounded-full blur-3xl animate-float-slow"></div>
        </div>
      </div>
      
      <div className="relative z-10">
        <Navigation />
      </div>
      
      {/* Header con navegación */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4 shadow-lg relative z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 p-2 sm:px-4"
            >
              <Home className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
              <span className="hidden sm:inline">Inicio</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="text-gray-700 hover:bg-white/50 p-2 sm:px-4"
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
              <span className="hidden sm:inline">Perfil</span>
            </Button>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Search className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="hidden sm:inline">Descubrir</span>
          </h1>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-700 hover:bg-white/50 p-2 sm:px-4"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
            <Button
              variant="ghost"
              onClick={handleRefresh}
              className="text-gray-700 hover:bg-white/50 p-2"
            >
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-full overflow-x-hidden">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/90 backdrop-blur-md border-0 text-center p-4">
            <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-600">Likes</div>
          </Card>
          <Card className="bg-white/90 backdrop-blur-md border-0 text-center p-4">
            <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold text-gray-900">5</div>
            <div className="text-sm text-gray-600">Super Likes</div>
          </Card>
          <Card className="bg-white/90 backdrop-blur-md border-0 text-center p-4">
            <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Matches</div>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Panel de filtros */}
          {showFilters && (
            <Card className="w-full lg:w-80 bg-white/90 backdrop-blur-md border-0 p-4 lg:p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Filtros Avanzados</h3>
              
              {/* Edad */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad: {filters.ageRange[0]} - {filters.ageRange[1]} años
                </label>
                <Slider
                  value={filters.ageRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value as [number, number] }))}
                  min={18}
                  max={65}
                  step={1}
                  className="w-full"
                />
              </div>
              
              {/* Distancia */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distancia: {filters.distance} km
                </label>
                <Slider
                  value={[filters.distance]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, distance: value[0] }))}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              
              {/* Intereses */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intereses
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {importedLifestyleInterests.slice(0, 12).map((interest) => (
                    <Badge
                      key={interest}
                      variant={filters.interests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          interests: prev.interests.includes(interest)
                            ? prev.interests.filter(i => i !== interest)
                            : [...prev.interests, interest]
                        }));
                      }}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          )}
          
          {/* Grid de perfiles */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredProfiles.map((profile) => (
                <Card
                  key={profile.id}
                  className="bg-white/90 backdrop-blur-md border-0 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleProfileClick(profile)}
                >
                  <div className="relative">
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="w-full h-48 sm:h-64 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex flex-col sm:flex-row gap-1 sm:gap-2">
                      {profile.isVerified && (
                        <Badge className="bg-green-500 text-white text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                      {profile.isPremium && (
                        <Badge className="bg-yellow-500 text-white text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-2 left-2">
                      {profile.isOnline && (
                        <Badge className="bg-green-500 text-white text-xs">
                          En línea
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{profile.name}, {profile.age}</h3>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleLike(profile.id, e)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2"
                        >
                          <Heart className="h-5 w-5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleSuperLike(profile.id, e)}
                          className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 p-2"
                        >
                          <Flame className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location} • {profile.distance}km
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{profile.bio}</p>
                    
                    {/* Intereses */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {profile.interests.slice(0, 3).map((interest, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                      {profile.interests.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.interests.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Match score */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Compatibilidad: {profile.matchScore}%</span>
                      </div>
                      <span className="text-xs text-gray-500">{profile.lastActive}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Navigation />
    </div>
  );
};

export default Discover;
