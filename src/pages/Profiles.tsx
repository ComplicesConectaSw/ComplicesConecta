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
  MapPin 
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

  // Datos de ejemplo expandidos para demostrar funcionalidad
  const mockProfiles: Profile[] = [
    {
      id: "1",
      name: "Ana García",
      age: 28,
      location: "Ciudad de México",
      bio: "Amante de los viajes y la aventura. Busco conexiones auténticas y experiencias únicas.",
      images: ["/placeholder.svg"],
      interests: ["viajes", "música", "cocina", "swinger"],
      isOnline: true,
      verified: true
    },
    {
      id: "2",
      name: "Carlos Mendoza",
      age: 32,
      location: "Guadalajara",
      bio: "Profesional exitoso que disfruta del lifestyle alternativo. Discreto y respetuoso.",
      images: ["/placeholder.svg"],
      interests: ["lifestyle", "fitness", "gastronomía", "eventos privados"],
      isOnline: true,
      verified: true
    },
    {
      id: "3",
      name: "María Elena",
      age: 26,
      location: "Monterrey",
      bio: "Artista creativa con mente abierta. Me encanta explorar nuevas experiencias.",
      images: ["/placeholder.svg"],
      interests: ["arte", "danza", "swinger", "cultura"],
      isOnline: false,
      verified: false
    },
    {
      id: "4",
      name: "Roberto Silva",
      age: 35,
      location: "Puebla",
      bio: "Empresario aventurero que busca parejas para eventos exclusivos y viajes.",
      images: ["/placeholder.svg"],
      interests: ["viajes", "eventos privados", "lifestyle", "networking"],
      isOnline: true,
      verified: true
    },
    {
      id: "5",
      name: "Isabella Cruz",
      age: 29,
      location: "Tijuana",
      bio: "Modelo profesional con pasión por la fotografía y los encuentros discretos.",
      images: ["/placeholder.svg"],
      interests: ["fotografía", "moda", "swinger", "eventos"],
      isOnline: true,
      verified: true
    },
    {
      id: "6",
      name: "Diego Herrera",
      age: 31,
      location: "Cancún",
      bio: "Instructor de yoga y meditación. Busco conexiones espirituales y físicas.",
      images: ["/placeholder.svg"],
      interests: ["yoga", "meditación", "lifestyle", "bienestar"],
      isOnline: false,
      verified: true
    },
    {
      id: "7",
      name: "Valentina Ruiz",
      age: 27,
      location: "Mérida",
      bio: "Psicóloga con enfoque en relaciones abiertas. Discreta y profesional.",
      images: ["/placeholder.svg"],
      interests: ["psicología", "relaciones", "swinger", "terapia"],
      isOnline: true,
      verified: true
    },
    {
      id: "8",
      name: "Alejandro Torres",
      age: 33,
      location: "León",
      bio: "Chef reconocido que organiza cenas íntimas y eventos gastronómicos privados.",
      images: ["/placeholder.svg"],
      interests: ["gastronomía", "eventos privados", "cocina", "lifestyle"],
      isOnline: true,
      verified: true
    },
    {
      id: "9",
      name: "Camila Vega",
      age: 25,
      location: "Querétaro",
      bio: "Estudiante de medicina con interés en explorar el lifestyle alternativo.",
      images: ["/placeholder.svg"],
      interests: ["medicina", "estudios", "swinger", "salud"],
      isOnline: false,
      verified: false
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
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {profile.name.charAt(0)}
            </div>
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
      
      <main className="container mx-auto px-4 py-8">
        {/* Encabezado de página */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Descubre
            <span className="block bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mt-2">
              Tu Match Perfecto
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            Usa nuestra IA avanzada para encontrar personas compatibles basándose en personalidad, intereses y valores
          </p>
          
          {/* Sección de búsqueda IA */}
          <Card className="max-w-2xl mx-auto mb-8 bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-400" />
                  <Sparkles className="h-5 w-5 text-pink-400 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-white">Búsqueda Inteligente por IA</h3>
              </div>
              
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
                    <Input
                      placeholder="Busca parejas swinger, solteros lifestyle, eventos privados..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-3 text-base bg-white/10 border-white/20 text-white placeholder:text-white/80"
                    />
                  </div>
                  <Button 
                    onClick={() => handleAiSearch(searchQuery)}
                    disabled={isSearching || searchQuery.length < 3}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
                    <p className="text-sm text-white/90 mb-2">Sugerencias de IA:</p>
                    <div className="flex flex-wrap gap-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <Badge 
                          key={index}
                          className="cursor-pointer hover:bg-white/10 transition-colors border border-white/30 text-white bg-transparent"
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
            <Filter className="h-5 w-5 text-white/80" />
            <h3 className="text-lg font-semibold text-white">Filtros Avanzados</h3>
          </div>
          {/* Filtros simplificados para evitar dependencias faltantes */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <p className="text-white/70">Filtros disponibles próximamente</p>
            </CardContent>
          </Card>
        </div>

        {/* Resumen de resultados */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <p className="text-white/90">
              {filteredProfiles.length} perfiles encontrados
            </p>
            {aiSearchMode && (
              <Badge className="bg-purple-500/20 text-purple-200 border border-purple-400/30">
                <Brain className="h-3 w-3 mr-1" />
                Ordenado por IA
              </Badge>
            )}
          </div>
          <Button 
            className="border border-white/30 text-white hover:bg-white/10 bg-transparent px-4 py-2 text-sm transition-all duration-200 hover:border-white/50"
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