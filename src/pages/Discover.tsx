import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Heart, Flame, ArrowLeft, Crown, Shield, Target, X, RefreshCw, Filter, Star, CheckCircle, MapPin, Settings, Home, User } from 'lucide-react';
import { Header } from '@/components/Header';
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
  matchScore: number;
  lifestyle: string;
  relationshipType: string;
  lookingFor: string[];
  experienceLevel: string;
  ageRange: string;
  bodyType: string;
  height: string;
  education: string;
  profession: string;
  smoking: string;
  drinking: string;
  children: string;
  religion: string;
  aiCompatibility: number;
  rating: string;
  type: ProfileType;
  gender: Gender;
}

// Intereses lifestyle para perfiles
const lifestyleInterests = [
  "Lifestyle Swinger", "Intercambio de Parejas", "Encuentros Casuales", "Fiestas Temáticas", 
  "Clubs Privados", "Eventos Lifestyle", "Soft Swap", "Full Swap", "Unicornios", 
  "Parejas Experimentadas", "Principiantes Curiosos", "Mentalidad Abierta", "Sin Tabúes", 
  "Comunicación Abierta", "Respeto Mutuo", "Discreción Total", "Ambiente Relajado", 
  "Experiencias Nuevas", "Conexiones Auténticas", "Diversión Adulta", "Aventuras Compartidas",
  "Hoteles Temáticos", "Resorts Lifestyle", "Cruceros Swinger", "Viajes en Grupo",
  "Pool Parties", "Jacuzzi Sessions", "Masajes en Pareja", "Juegos de Rol"
];

// Professional profile images from Unsplash

// Función para generar perfiles aleatorios con imágenes coherentes
const generateRandomProfiles = (userType = 'single') => {
  resetImageCounters();

  // Mezclar arrays de nombres para obtener perfiles únicos en cada carga
  const shuffleArray = (arr: string[]) => arr.sort(() => 0.5 - Math.random());

  const coupleNames = shuffleArray([
    "Ana & Carlos", "María & Luis", "Carmen & Roberto", "Elena & Miguel",
    "Sofía & Diego", "Laura & Javier", "Patricia & Fernando", "Isabel & Antonio",
    "Cristina & Pablo", "Mónica & Raúl", "Beatriz & Sergio", "Natalia & Andrés"
  ]);

  const singleNames = shuffleArray([
    "Alejandra", "Valentina", "Isabella", "Camila", "Lucía", "Daniela", "Gabriela", "Andrea",
    "Carlos", "Miguel", "Alejandro", "Fernando", "Roberto", "Javier", "Antonio", "Pablo",
    "Sergio", "Raúl", "Andrés", "Diego", "Luis", "Manuel", "Ricardo", "Eduardo"
  ]);

  const locations = ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Torreón"];
  const interests = {
    couple: ["Intercambio de Parejas", "Parejas Experimentadas", "Eventos Lifestyle", "Clubs Privados", "Hoteles Temáticos"],
    single: ["Lifestyle Swinger", "Comunicación Abierta", "Respeto Mutuo", "Experiencias Nuevas", "Discreción Total"]
  };

  const profiles = [];
  const profileCount = userType === 'couple' ? 12 : 20;
  const usedImages = new Set<string>();
  let singleNameIndex = 0;
  let coupleNameIndex = 0;

  console.log(`🎯 Generando ${profileCount} perfiles para tipo: ${userType}`);

  for (let i = 0; i < profileCount; i++) {
    const isCouple = userType === 'couple' || (userType === 'single' && Math.random() > 0.7);
    let name;
    if (isCouple) {
      name = coupleNames[coupleNameIndex++ % coupleNames.length];
    } else {
      name = singleNames[singleNameIndex++ % singleNames.length];
    }
    
    // Determinar género basado en el nombre para singles
    const profileInfo = inferProfileKind({ 
      name, 
      type: isCouple ? 'couple' : 'single' as ProfileType 
    });
    
    // Asignar imagen coherente sin repetir en viewport
    const profileImage = pickProfileImage({
      id: i.toString(),
      name,
      type: isCouple ? 'couple' : 'single' as ProfileType,
      gender: profileInfo.gender
    }, usedImages);
    
    console.log(`📸 Perfil ${i}: ${name} (${profileInfo.kind}/${profileInfo.gender}) -> ${profileImage.split('/').pop()?.split('?')[0]}`);
    
    profiles.push({
      id: uuidv4(),
      name,
      age: Math.floor(Math.random() * 20) + 25, // 25-44
      location: locations[Math.floor(Math.random() * locations.length)],
      distance: Math.floor(Math.random() * 50) + 1, // 1-50 km
      interests: interests[isCouple ? 'couple' : 'single'].slice(0, 3),
      image: profileImage,
      bio: isCouple ? 
        "Pareja experimentada en el lifestyle. Buscamos nuevas experiencias y conexiones auténticas." :
        "Persona auténtica buscando conexiones reales y experiencias memorables en el lifestyle.",
      isOnline: Math.random() > 0.5,
      lastActive: Math.random() > 0.3 ? "En línea" : `Hace ${Math.floor(Math.random() * 60)} min`,
      isVerified: Math.random() > 0.3,
      isPremium: Math.random() > 0.7,
      matchScore: Math.floor(Math.random() * 30) + 70, // 70-99
      lifestyle: isCouple ? "Parejas Swinger" : "Single Lifestyle",
      relationshipType: isCouple ? "Pareja" : "Single",
      lookingFor: isCouple ? ["Parejas", "Singles"] : ["Parejas", "Singles"],
      experienceLevel: ["Principiante", "Intermedio", "Experimentado"][Math.floor(Math.random() * 3)],
      ageRange: "25-45",
      bodyType: ["Atlético", "Promedio", "Curvilíneo"][Math.floor(Math.random() * 3)],
      height: isCouple ? "165cm / 175cm" : `${Math.floor(Math.random() * 30) + 160}cm`,
      education: ["Universitario", "Técnico", "Posgrado"][Math.floor(Math.random() * 3)],
      profession: ["Profesional", "Empresario", "Creativo", "Técnico"][Math.floor(Math.random() * 4)],
      smoking: Math.random() > 0.7 ? "Sí" : "No",
      drinking: ["No", "Ocasionalmente", "Socialmente"][Math.floor(Math.random() * 3)],
      children: Math.random() > 0.6 ? "Sí, no viven conmigo" : "No",
      religion: ["Ninguna", "Católica", "Otra"][Math.floor(Math.random() * 3)],
      aiCompatibility: Math.floor(Math.random() * 30) + 70,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5-5.0
      type: isCouple ? 'couple' : 'single' as ProfileType,
      gender: profileInfo.gender
    });
  }
  
  console.log(`✅ Generados ${profiles.length} perfiles con ${usedImages.size} imágenes únicas`);
  return profiles;
};

// Obtener tipo de usuario de localStorage
const getUserType = () => {
  const demoUser = localStorage.getItem('demo_user');
  if (demoUser) {
    const user = JSON.parse(demoUser);
    return user.accountType || 'single';
  }
  return 'single';
};

function Discover() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { getCurrentLocation, isLoading: locationLoading } = useGeolocation();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ageRange: [18, 50],
    distance: 50,
    interests: [] as string[],
    relationshipType: 'all',
    experienceLevel: 'all',
    onlineOnly: false,
    verifiedOnly: false,
    premiumOnly: false
  });

  useEffect(() => {
    const userType = getUserType() || 'single';
    console.log('🔍 Discover independiente - Cargando perfiles para tipo:', userType);
    setProfiles(generateRandomProfiles(userType));
    setIsLoading(false);
  }, []);

  const handleLike = (profileId: string) => {
    // Implementar lógica de like
  };

  const handleSuperLike = (profile: Profile) => {
    // Implementar lógica de super like
  };

  const handleRefresh = () => {
    // Implementar lógica de refresco
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600">
      {/* Header con navegación */}
      <div className="bg-white/90 backdrop-blur-md border-b border-white/30 p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-700 hover:bg-white/50"
            >
              <Home className="h-5 w-5 mr-2" />
              Inicio
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="text-gray-700 hover:bg-white/50"
            >
              <User className="h-5 w-5 mr-2" />
              Perfil
            </Button>
          </div>
          
          <h1 className="text-xl font-bold text-gray-900">Conecta con Parejas y Solteros</h1>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-700 hover:bg-white/50"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </Button>
            <Button
              variant="ghost"
              onClick={handleRefresh}
              className="text-gray-700 hover:bg-white/50"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Estadísticas del día */}
        <div className="grid grid-cols-3 gap-4 mb-6 max-w-md">
          <Card className="bg-white/90 backdrop-blur-md border-0 text-center p-4">
            <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold text-gray-900">0</div>
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
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Panel de filtros */}
          {showFilters && (
            <Card className="w-full lg:w-80 bg-white/90 backdrop-blur-md border-0 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Filtros Avanzados</h3>
              
              {/* Edad */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad: {filters.ageRange[0]} - {filters.ageRange[1]} años
                </label>
                <Slider
                  value={filters.ageRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value }))}
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
                
                {/* Filtros adicionales */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.onlineOnly}
                      onChange={(e) => setFilters(prev => ({ ...prev, onlineOnly: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Solo en línea</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.verifiedOnly}
                      onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Solo verificados</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.premiumOnly}
                      onChange={(e) => setFilters(prev => ({ ...prev, premiumOnly: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Solo premium</span>
                  </label>
                </div>
              </div>
            </Card>
          )}
            
          {/* Grid de perfiles */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                // Skeleton loading
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-white/90 backdrop-blur-md border-0 shadow-lg animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : profiles.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Target className="h-16 w-16 mx-auto text-white/50 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No hay perfiles disponibles</h3>
                  <p className="text-white/70 mb-4">Intenta ajustar tus filtros o actualizar la búsqueda</p>
                  <Button onClick={handleRefresh} className="bg-white/20 hover:bg-white/30 text-white">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                </div>
              ) : (
                profiles.map((profile) => (
                  <div key={profile.id} className="group relative bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      <img 
                        src={profile.image} 
                        alt={profile.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onClick={() => navigate(`/profile/${profile.id}`)}
                        onLoad={() => console.log(`✅ Imagen cargada: ${profile.name}`)}
                        onError={(e) => {
                          console.log(`❌ Error cargando imagen: ${profile.name}, usando fallback`);
                          const fallbacks = [
                            'https://images.unsplash.com/photo-1494790108755-2616c96d2e9c?w=400&h=400&fit=crop&crop=face',
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
                          ];
                          e.currentTarget.src = fallbacks[Math.floor(Math.random() * fallbacks.length)];
                        }}
                      />
                      
                      {/* Badges superiores */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {profile.isOnline && (
                          <Badge className="bg-green-500 text-white text-xs">
                            En línea
                          </Badge>
                        )}
                        {profile.isVerified && (
                          <Badge className="bg-blue-500 text-white text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        )}
                        {profile.isPremium && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      
                      {/* Rating */}
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-medium text-white">{profile.rating}</span>
                        </div>
                      </div>
                      
                      {/* Botones de acción */}
                      <div className="absolute bottom-4 right-4 flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 hover:bg-white text-gray-800 rounded-full w-12 h-12 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(profile.id);
                          }}
                        >
                          <Heart className="h-5 w-5" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full w-12 h-12 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSuperLike(profile);
                          }}
                        >
                          <Flame className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Información del perfil */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{profile.name}</h3>
                        <span className="text-sm text-gray-600">{profile.age} años</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{profile.location} • {profile.distance}km</span>
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
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Navigation />
    </div>
  );
}

export default Discover;