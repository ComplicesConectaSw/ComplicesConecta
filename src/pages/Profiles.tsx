import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import HeaderNav from '@/components/HeaderNav';
import { ContrastFixer } from '@/components/accessibility/ContrastFixer';
import { logger } from '@/lib/logger';
import { 
  Search, 
  Filter, 
  Brain, 
  Sparkles, 
  Heart, 
  MapPin,
  ArrowLeft,
  Users
} from 'lucide-react';

interface FilterState {
  location: string;
  ageRange: [number, number];
  interests: string[];
  onlineOnly: boolean;
  searchQuery: string;
}

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  images: string[];
  interests: string[];
  isOnline: boolean;
  verified: boolean;
}

const Profiles: React.FC = () => {
  const _navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiSearchMode, setAiSearchMode] = useState(false);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 9;

  // Datos de ejemplo expandidos con información completa del respaldo
  const mockProfiles: Profile[] = [
    {
      id: "1",
      name: "María Elena",
      age: 28,
      location: "Ciudad de México",
      bio: "Fotógrafa profesional especializada en retratos. Me encanta capturar momentos únicos y explorar culturas a través de mis viajes. Practico yoga desde hace 5 años y disfruto cocinando platos de diferentes países.",
      images: ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face"],
      interests: ["Fotografía", "Viajes", "Yoga", "Arte", "Cocina"],
      isOnline: true,
      verified: true
    },
    {
      id: "2",
      name: "Carlos Mendoza",
      age: 32,
      location: "Guadalajara",
      bio: "Chef ejecutivo con 8 años de experiencia. Toco la guitarra en mis ratos libres y soy un apasionado del senderismo. Leo principalmente novela histórica y filosofía. Busco a alguien con quien compartir aventuras culinarias y conversaciones profundas.",
      images: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face"],
      interests: ["Cocina", "Música", "Senderismo", "Literatura"],
      isOnline: false,
      verified: true
    },
    {
      id: "3",
      name: "Gabriela",
      age: 26,
      location: "Monterrey",
      bio: "Artista y escritora. Me encanta el café y las buenas conversaciones.",
      images: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face"],
      interests: ["Arte", "Lectura", "Café", "Cine", "Teatro"],
      isOnline: true,
      verified: true
    },
    {
      id: "4",
      name: "Diego",
      age: 30,
      location: "Puebla",
      bio: "Desarrollador de software apasionado por el deporte y la vida sana.",
      images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face"],
      interests: ["Deporte", "Tecnología", "Naturaleza", "Fitness"],
      isOnline: true,
      verified: true
    },
    {
      id: "5",
      name: "Laura",
      age: 29,
      location: "Tijuana",
      bio: "Bailarina profesional que ama explorar nuevos sabores y culturas.",
      images: ["https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=600&fit=crop&crop=face"],
      interests: ["Danza", "Música", "Viajes", "Gastronomía"],
      isOnline: true,
      verified: true
    },
    {
      id: "6",
      name: "Javier",
      age: 27,
      location: "Cancún",
      bio: "Surfista y fotógrafo de naturaleza. Siempre en busca de la ola perfecta.",
      images: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face"],
      interests: ["Surf", "Fotografía", "Aventura", "Naturaleza"],
      isOnline: false,
      verified: true
    },
    {
      id: "7",
      name: "Carmen",
      age: 31,
      location: "Mérida",
      bio: "Historiadora del arte con pasión por la arquitectura andaluza.",
      images: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face"],
      interests: ["Historia", "Arquitectura", "Vino", "Cultura"],
      isOnline: true,
      verified: true
    },
    {
      id: "8",
      name: "Pablo",
      age: 33,
      location: "León",
      bio: "Emprendedor tech y ciclista apasionado. Construyendo el futuro.",
      images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face"],
      interests: ["Ciclismo", "Tecnología", "Innovación", "Emprendimiento"],
      isOnline: true,
      verified: true
    },
    {
      id: "9",
      name: "Isabella",
      age: 26,
      location: "Playa del Carmen",
      bio: "Instructora de yoga y terapeuta holística. Conectando cuerpo, mente y espíritu.",
      images: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face"],
      interests: ["Yoga", "Meditación", "Naturaleza", "Wellness"],
      isOnline: true,
      verified: true
    }
  ];

  useEffect(() => {
    setAllProfiles(mockProfiles);
    setFilteredProfiles(mockProfiles);
  }, []);

  const handleAiSearch = async (query: string) => {
    setIsSearching(true);
    try {
      // Simulación de búsqueda IA con filtrado real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filtrar perfiles basado en la búsqueda
      const filtered = allProfiles.filter(profile => 
        profile.name.toLowerCase().includes(query.toLowerCase()) ||
        profile.bio.toLowerCase().includes(query.toLowerCase()) ||
        profile.location.toLowerCase().includes(query.toLowerCase()) ||
        profile.interests.some(interest => 
          interest.toLowerCase().includes(query.toLowerCase())
        )
      );
      
      setFilteredProfiles(filtered);
      setAiSearchMode(true);
      setAiSuggestions(["parejas aventureras", "lifestyle México", "eventos privados", "swinger"]);
      logger.info('🤖 Búsqueda IA completada', { query, results: filtered.length });
    } catch (error) {
      logger.error('❌ Error en búsqueda IA:', { error });
    } finally {
      setIsSearching(false);
    }
  };

  const _handleFilterChange = (filters: FilterState) => {
    logger.info('🔍 Filtros aplicados', { filters });
    // Lógica de filtrado simplificada
    setFilteredProfiles(allProfiles);
  };

  // Paginación
  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);
  const startIndex = (currentPage - 1) * profilesPerPage;
  const currentProfiles = filteredProfiles.slice(startIndex, startIndex + profilesPerPage);

  const ProfileCard: React.FC<{ profile: Profile; onOpenModal: () => void }> = ({ profile }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/10 backdrop-blur-sm border-white/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <img 
              src={profile.images[0]} 
              alt={profile.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${profile.name}&background=random&color=fff&size=48`;
              }}
            />
            {profile.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{profile.name}</h3>
              {profile.verified && (
                <Badge className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs">
                  ✓ Verificado
                </Badge>
              )}
            </div>
            <p className="text-sm text-white/70">{profile.age} años • {profile.location}</p>
          </div>
        </div>
        <p className="text-sm text-white/80 mb-3 line-clamp-2">{profile.bio}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {profile.interests.slice(0, 3).map((interest, idx) => (
            <Badge key={idx} className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
              {interest}
            </Badge>
          ))}
          {profile.interests.length > 3 && (
            <Badge className="text-xs bg-white/10 text-white/70 border-white/20">
              +{profile.interests.length - 3} más
            </Badge>
          )}
        </div>
        <Button 
          className="w-full px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          onClick={() => logger.info('Ver perfil:', { profileId: profile.id })}
        >
          Ver Perfil Completo
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-4 sm:p-6 lg:p-8 profile-page">
      <ContrastFixer enabled={true} level="AA" />
      
      {/* Elementos decorativos */}
      <Heart className="absolute bottom-1/3 right-1/4 w-5 h-5 text-accent/20 animate-pulse" fill="currentColor" />
      <MapPin className="absolute top-1/2 right-1/6 w-7 h-7 text-secondary/15 animate-pulse" />
      
      {/* Navegación */}
      <HeaderNav />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Encabezado de página */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Descubre
            <span className="block bg-love-gradient bg-clip-text text-transparent">
              Tu Match Perfecto
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Usa nuestra IA avanzada para encontrar personas compatibles basándose en personalidad, intereses y valores
          </p>
          
          {/* Sección de búsqueda IA */}
          <Card className="max-w-2xl mx-auto mb-8 shadow-glow border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold">Búsqueda Inteligente por IA</h3>
              </div>
              
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Busca parejas swinger, solteros lifestyle, eventos privados..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-3 text-base"
                    />
                  </div>
                  <Button 
                    onClick={() => handleAiSearch(searchQuery)}
                    disabled={isSearching || searchQuery.length < 3}
                    className="px-6 py-3"
                  >
                    {isSearching ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Buscando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Buscar
                      </div>
                    )}
                  </Button>
                </div>
                
                  {/* Sugerencias de IA */}
                  {aiSuggestions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-2">Sugerencias de IA:</p>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.map((suggestion, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="cursor-pointer hover:bg-primary/10 transition-colors"
                            onClick={() => {
                              setSearchQuery(suggestion);
                              handleAiSearch(suggestion);
                            }}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
              
              {aiSearchMode && (
                <div className="mt-4 p-3 bg-purple-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-purple-200">
                    <Brain className="h-4 w-4" />
                    <span>Resultados ordenados por compatibilidad de IA</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sección de filtros */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Filtros Avanzados</h3>
          </div>
          {/* Filtros simplificados para evitar dependencias faltantes */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <p className="text-muted-foreground">Filtros disponibles próximamente</p>
            </CardContent>
          </Card>
        </div>

        {/* Resumen de resultados */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground">
              {filteredProfiles.length} perfiles encontrados
            </p>
            {aiSearchMode && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Brain className="h-3 w-3 mr-1" />
                Ordenado por IA
              </Badge>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setFilteredProfiles(allProfiles);
              setAiSearchMode(false);
              setSearchQuery("");
              setAiSuggestions([]);
              setCurrentPage(1);
              logger.info('🧹 Filtros limpiados');
            }}
          >
            Limpiar filtros
          </Button>
        </div>

        {/* Grid de perfiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProfiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} onOpenModal={() => {}} />
          ))}
        </div>

        {/* Paginación */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-white bg-purple-600/80 border border-purple-400 rounded-md hover:bg-purple-700/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-2 text-sm font-medium text-white">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-white bg-purple-600/80 border border-purple-400 rounded-md hover:bg-purple-700/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profiles;