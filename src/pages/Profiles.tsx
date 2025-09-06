import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileCard } from '@/components/ProfileCard';
import { ProfileFilters } from '@/components/ProfileFilters';

interface FilterState {
  location: string;
  ageRange: [number, number];
  interests: string[];
  onlineOnly: boolean;
  searchQuery: string;
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Sparkles, Brain, Filter, Users, MapPin, Heart } from "lucide-react";

// Professional profile images from Unsplash - Production ready
// Removed local imports that fail in production

const Profiles = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSearchMode, setAiSearchMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  // Extended sample profiles data with unique characteristics
  const allProfiles = [
    {
      id: 1,
      name: "María Elena",
      age: 28,
      location: "Ciudad de México",
      interests: ["Fotografía", "Viajes", "Yoga", "Arte", "Cocina"],
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
      rating: 4.8,
      isOnline: true,
      bio: "Fotógrafa profesional especializada en retratos. Me encanta capturar momentos únicos y explorar culturas a través de mis viajes. Practico yoga desde hace 5 años y disfruto cocinando platos de diferentes países.",
      profession: "Diseñadora Gráfica",
      personality: ["Creativa", "Aventurera", "Empática"],
      languages: ["Español", "Inglés", "Francés"],
      education: "Licenciatura en Bellas Artes",
      lifestyle: "Activo",
      relationshipGoals: "Relación seria",
      zodiacSign: "Libra",
      height: "165 cm",
      children: "No tengo, pero me gustaría",
      smoking: "No fumo",
      drinking: "Socialmente",
      aiCompatibility: 92
    },
    {
      id: 2,
      name: "Carlos Mendoza",
      age: 32,
      location: "Guadalajara",
      interests: ["Cocina", "Música", "Senderismo", "Literatura"],
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
      rating: 4.9,
      isOnline: false,
      bio: "Chef ejecutivo con 8 años de experiencia. Toco la guitarra en mis ratos libres y soy un apasionado del senderismo. Leo principalmente novela histórica y filosofía. Busco a alguien con quien compartir aventuras culinarias y conversaciones profundas.",
      profession: "Chef Ejecutivo",
      personality: ["Apasionado", "Intelectual", "Aventurero"],
      languages: ["Español", "Catalán", "Inglés"],
      education: "Culinary Arts Institute",
      lifestyle: "Equilibrado",
      relationshipGoals: "Conocer gente nueva",
      zodiacSign: "Escorpio",
      height: "178 cm",
      children: "No tengo, indeciso",
      smoking: "No fumo",
      drinking: "Regularmente",
      aiCompatibility: 87
    },
    {
      id: 3,
      name: "Gabriela",
      age: 26,
      location: "Monterrey",
      interests: ["Arte", "Lectura", "Café", "Cine", "Teatro"],
      image: "https://images.unsplash.com/photo-1494790108755-2616c96d2e9c?w=400&h=600&fit=crop&crop=face",
      rating: 4.7,
      isOnline: true,
      bio: "Artista y escritora. Me encanta el café y las buenas conversaciones.",
      profession: "Artista"
    },
    {
      id: 4,
      name: "Diego",
      age: 30,
      location: "Puebla",
      interests: ["Deporte", "Tecnología", "Naturaleza", "Fitness"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
      rating: 4.8,
      isOnline: true,
      bio: "Desarrollador de software apasionado por el deporte y la vida sana.",
      profession: "Desarrollador"
    },
    {
      id: 5,
      name: "Laura",
      age: 29,
      location: "Tijuana",
      interests: ["Danza", "Música", "Viajes", "Gastronomía"],
      image: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=600&fit=crop&crop=face",
      rating: 4.9,
      isOnline: true,
      bio: "Bailarina profesional que ama explorar nuevos sabores y culturas.",
      profession: "Bailarina"
    },
    {
      id: 6,
      name: "Javier",
      age: 27,
      location: "Cancún",
      interests: ["Surf", "Fotografía", "Aventura", "Naturaleza"],
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
      rating: 4.6,
      isOnline: false,
      bio: "Surfista y fotógrafo de naturaleza. Siempre en busca de la ola perfecta.",
      profession: "Fotógrafo"
    },
    {
      id: 7,
      name: "Carmen",
      age: 31,
      location: "Mérida",
      interests: ["Historia", "Arquitectura", "Vino", "Cultura"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
      rating: 4.8,
      isOnline: true,
      bio: "Historiadora del arte con pasión por la arquitectura andaluza.",
      profession: "Historiadora"
    },
    {
      id: 8,
      name: "Pablo",
      age: 33,
      location: "León",
      interests: ["Ciclismo", "Tecnología", "Innovación", "Emprendimiento"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
      rating: 4.7,
      isOnline: true,
      bio: "Emprendedor tech y ciclista apasionado. Construyendo el futuro.",
      profession: "Emprendedor"
    },
    {
      id: 9,
      name: "Isabella",
      age: 26,
      location: "Playa del Carmen",
      interests: ["Yoga", "Meditación", "Naturaleza", "Wellness"],
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
      rating: 4.8,
      isOnline: true,
      bio: "Instructora de yoga y terapeuta holística. Conectando cuerpo, mente y espíritu.",
      profession: "Instructora de Yoga"
    }
  ];

  const [filteredProfiles, setFilteredProfiles] = useState(allProfiles);
  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 6;

  // Pagination calculations
  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);
  const startIndex = (currentPage - 1) * profilesPerPage;
  const endIndex = startIndex + profilesPerPage;
  const currentProfiles = filteredProfiles.slice(startIndex, endIndex);

  const handleFilterChange = (filters: FilterState) => {
    let filtered = allProfiles;

    if (filters.location && filters.location !== "all") {
      filtered = filtered.filter(profile => {
        const profileData = (profile as Record<string, unknown>).profiles || profile;
        return (profileData as Record<string, unknown>).location?.toString().toLowerCase().includes(filters.location.toLowerCase())
      });
    }

    if (filters.ageRange) {
      filtered = filtered.filter(profile => {
        const profileData = (profile as Record<string, unknown>).profiles || profile;
        const age = (profileData as Record<string, unknown>).age as number;
        return age >= filters.ageRange[0] && age <= filters.ageRange[1];
      });
    }

    if (filters.interests && filters.interests.length > 0) {
      filtered = filtered.filter(profile => {
        const profileData = (profile as Record<string, unknown>).profiles || profile;
        const interests = (profileData as Record<string, unknown>).interests as string[] || [];
        return filters.interests.some(interest => interests.includes(interest));
      });
    }

    // accountType filter removed as it doesn't exist in FilterState

    setFilteredProfiles(filtered);
    setCurrentPage(1);
  };

  // AI Search Suggestions
  const generateAiSuggestions = (query: string) => {
    const suggestions = [
      "Parejas aventureras y de mente abierta",
      "Swingers experimentados y discretos",
      "Amantes del intercambio y nuevas experiencias",
      "Parejas liberales y sin prejuicios",
      "Exploradores del estilo de vida swinger",
      "Conexiones auténticas y respetuosas",
      "Parejas maduras y comunicativas",
      "Intercambio consensual y seguro"
    ];
    return suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
  };

  const handleAiSearch = async (query: string) => {
    setIsSearching(true);
    setAiSearchMode(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // AI-powered filtering based on personality, interests, and compatibility
    let aiFilteredProfiles = allProfiles.filter(profile => {
      const queryLower = query.toLowerCase();
      return (
        profile.personality?.some(trait => trait.toLowerCase().includes(queryLower)) ||
        (profile.interests ?? []).some(interest => interest.toLowerCase().includes(queryLower)) ||
        (profile.bio ?? '').toLowerCase().includes(queryLower) ||
        (profile.profession ?? '').toLowerCase().includes(queryLower) ||
        profile.lifestyle?.toLowerCase().includes(queryLower)
      );
    });
    
    // Sort by relevance (mock AI scoring)
    aiFilteredProfiles = aiFilteredProfiles.sort((a, b) => {
      // Simple relevance scoring based on query matches
      const scoreA = 0; // Mock relevance score
      const scoreB = 0; // Mock relevance score
      return scoreB - scoreA;
    });
    
    setFilteredProfiles(aiFilteredProfiles);
    setIsSearching(false);
  };

  useEffect(() => {
    // Verificar autenticación demo
    const demoAuth = localStorage.getItem('demo_authenticated');
    const demoUser = localStorage.getItem('demo_user');
    
    if (demoAuth !== 'true' || !demoUser) {
      navigate('/auth');
      return;
    }
    
    setFilteredProfiles(allProfiles);
  }, [navigate]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      setAiSuggestions(generateAiSuggestions(searchQuery));
    } else {
      setAiSuggestions([]);
    }
  }, [searchQuery]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Advanced Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-primary/5"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-32 left-32 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-40 right-40 w-64 h-64 bg-accent/8 rounded-full blur-2xl animate-pulse"></div>
        </div>
        {/* Floating Icons */}
        <Users className="absolute top-1/4 left-1/5 w-6 h-6 text-primary/15 animate-float" style={{ animationDelay: '0.5s' }} />
        <Heart className="absolute bottom-1/3 right-1/4 w-5 h-5 text-accent/20 animate-float" fill="currentColor" style={{ animationDelay: '1.2s' }} />
        <MapPin className="absolute top-1/2 right-1/6 w-7 h-7 text-secondary/15 animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header component removed - not found */}
        
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white hover:bg-primary/10 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
        </div>
      
        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Descubre
              <span className="block bg-love-gradient bg-clip-text text-transparent">
                Tu Match Perfecto
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Usa nuestra IA avanzada para encontrar personas compatibles basándose en personalidad, intereses y valores
            </p>
            
            {/* AI Search Section */}
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
                  
                  {/* AI Suggestions */}
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
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Brain className="h-4 w-4" />
                      <span>Resultados ordenados por compatibilidad de IA</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Filters Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-white">Filtros Avanzados</h3>
            </div>
            <ProfileFilters onFilterChange={handleFilterChange} />
          </div>

          {/* Results Summary */}
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
              }}
            >
              Limpiar filtros
            </Button>
          </div>

          {/* Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProfiles.map((profile) => (
              profile && <ProfileCard key={profile.id} profile={profile} onOpenModal={() => {}} />
            ))}
          </div>

          {/* Pagination */}
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

        {/* Footer component removed - not found */}
      </div>
    </div>
  );
};

export default Profiles;