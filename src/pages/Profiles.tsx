import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileCard } from '@/components/profile/MainProfileCard';
import { ProfileFilters } from '@/components/ProfileFilters';
import { useAuth } from '@/hooks/useAuth';
import { generateDemoProfiles } from '@/lib/demoData';

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
import { Search, Sparkles, Brain, Filter, Users, MapPin, Heart } from "lucide-react";
import Navigation from "@/components/Navigation";

// Professional profile images from Unsplash - Production ready
// Removed local imports that fail in production

const Profiles = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSearchMode, setAiSearchMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isProduction, setIsProduction] = useState(false);
  const [realProfiles, setRealProfiles] = useState([]);
  
  // Extended sample profiles data with unique characteristics
  const allProfiles = [
    {
      id: "1",
      name: "María Elena & Jorge",
      age: 28,
      location: "Ciudad de México",
      interests: ["Lifestyle", "Intercambio", "Nuevas experiencias", "Clubs liberales"],
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
      rating: 4.8,
      isOnline: true,
      bio: "Pareja aventurera de CDMX. Ella disfruta la atención, él comparte las experiencias. Buscamos conexiones auténticas con parejas y personas especiales.",
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
      id: "2",
      name: "Carlos Mendoza",
      age: 32,
      location: "Guadalajara",
      interests: ["Caballero", "Parejas", "Encuentros íntimos", "Aventuras"],
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
      rating: 4.9,
      isOnline: false,
      bio: "Hombre experimentado de Guadalajara. Especializado en hacer sentir especiales a las parejas. Discreto, respetuoso y con mucha energía para compartir.",
      profession: "Chef Ejecutivo",
      personality: ["Apasionado", "Intelectual", "Aventurero"],
      languages: ["Español", "Inglés"],
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
      id: "3",
      name: "Gabriela",
      age: 26,
      location: "Monterrey",
      interests: ["Tercera persona", "Bisexual", "Parejas", "Sensualidad"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
      rating: 4.7,
      isOnline: true,
      bio: "Mujer independiente de Monterrey. Me encanta la compañía de parejas y ser el centro de atención. Cómoda con ambos géneros, busco momentos especiales.",
      profession: "Artista"
    },
    {
      id: "4",
      name: "Diego",
      age: 30,
      location: "Puebla",
      interests: ["Encuentros grupales", "Experiencias intensas", "Exhibicionismo", "Aventuras"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
      rating: 4.8,
      isOnline: true,
      bio: "Hombre activo del lifestyle en Puebla. Disfruto los encuentros grupales y experiencias intensas. Siempre respetuoso, discreto y con mucha energía.",
      profession: "Desarrollador"
    },
    {
      id: "5",
      name: "Laura",
      age: 29,
      location: "Tijuana",
      interests: ["Danza sensual", "Performance", "Exhibicionismo", "Voyeurismo"],
      image: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=600&fit=crop&crop=face",
      rating: 4.9,
      isOnline: true,
      bio: "Bailarina profesional de Tijuana. Me encanta el arte del movimiento y ser observada. Muy liberal y abierta a experiencias únicas.",
      profession: "Bailarina"
    },
    {
      id: "6",
      name: "Javier",
      age: 27,
      location: "Cancún",
      interests: ["Fotografía artística", "Aventuras al aire libre", "Naturaleza", "Voyeurismo"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
      rating: 4.6,
      isOnline: false,
      bio: "Fotógrafo artístico de Cancún. Especializado en capturar la belleza natural y momentos especiales. Me gusta documentar y vivir experiencias únicas.",
      profession: "Fotógrafo"
    },
    {
      id: "7",
      name: "Carmen",
      age: 31,
      location: "Mérida",
      interests: ["Mujer madura", "Experiencia", "Fiestas privadas", "Mentorazgo"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
      rating: 4.8,
      isOnline: true,
      bio: "Mujer experimentada de Mérida. Organizadora de encuentros privados en casa. Disfruto la compañía de personas jóvenes y guiar a quienes inician en el lifestyle.",
      profession: "Historiadora"
    },
    {
      id: "8",
      name: "Pablo",
      age: 33,
      location: "León",
      interests: ["Fitness", "Liderazgo", "BDSM suave", "Juegos de poder"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
      rating: 4.7,
      isOnline: true,
      bio: "Empresario de León con excelente condición física. Me gusta tomar el control y ser admirado. Busco personas que disfruten los juegos de poder y la sumisión.",
      profession: "Emprendedor"
    },
    {
      id: "9",
      name: "Isabella",
      age: 26,
      location: "Playa del Carmen",
      interests: ["Tantra", "Masajes sensuales", "Yoga", "Conexión espiritual"],
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
      rating: 4.8,
      isOnline: true,
      bio: "Instructora de tantra de Playa del Carmen. Especializada en masajes sensuales y conexión espiritual. Ayudo a parejas a descubrir nuevas formas de intimidad.",
      profession: "Instructora de Yoga"
    }
  ];

  // Detectar modo demo vs real
  useEffect(() => {
    const demoAuth = localStorage.getItem('demo_authenticated');
    const isDemo = demoAuth === 'true';
    setIsProduction(!isDemo);
    
    if (!isDemo) {
      // Modo producción - cargar perfiles reales (placeholder)
      setRealProfiles([]);
    }
  }, []);

  // Usar perfiles demo o reales según el modo
  const currentProfilesData = isProduction ? realProfiles : allProfiles;
  const [filteredProfiles, setFilteredProfiles] = useState(currentProfilesData);
  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 6;

  // Pagination calculations
  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);
  const startIndex = (currentPage - 1) * profilesPerPage;
  const endIndex = startIndex + profilesPerPage;
  const currentProfiles = filteredProfiles.slice(startIndex, endIndex);

  const handleFilterChange = (filters: FilterState) => {
    let filtered = currentProfilesData;

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
    let aiFilteredProfiles = currentProfilesData.filter(profile => {
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
    
    // Allow access in demo mode or if user is authenticated
    if (demoAuth !== 'true' && !demoUser) {
      // Only redirect to auth if not in demo mode
      const isDemoMode = window.location.hostname === 'localhost' || window.location.hostname.includes('demo');
      if (!isDemoMode) {
        navigate('/auth');
        return;
      }
    }
    
    setFilteredProfiles(allProfiles);
  }, [navigate, allProfiles]);

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
        
        {/* Header con navegación completa */}
        <Navigation />
      
        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Descubre
              <span className="block bg-love-gradient bg-clip-text text-transparent">
                Tu Match Perfecto
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
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
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
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
                      <p className="text-sm text-white/80 mb-2">Sugerencias de IA:</p>
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
              <Filter className="h-5 w-5 text-white/80" />
              <h3 className="text-lg font-semibold text-white">Filtros Avanzados</h3>
            </div>
            <ProfileFilters onFilterChange={handleFilterChange} />
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <p className="text-white/80">
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