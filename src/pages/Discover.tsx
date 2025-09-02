import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Heart, Flame, ArrowLeft, Crown, Shield, Target, X, RefreshCw, Filter, Star, CheckCircle, MapPin } from 'lucide-react';
import { Header } from '@/components/Header';
import { FilterState, DiscoverSidebar, ProfileCard } from '@/components/discover';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';

// Professional profile images from Unsplash

const allProfiles = [
  {
    id: 1,
    name: "Sofía & Diego",
    age: 32,
    location: "Ciudad de México",
    distance: 5,
    interests: ["Fiestas Privadas", "Intercambio de Parejas", "Eventos VIP"],
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=600&fit=crop&crop=faces",
    bio: "Pareja experimentada en el lifestyle. Buscamos otras parejas para experiencias íntimas y divertidas.",
    isOnline: true,
    lastActive: "Hace 2 min",
    isVerified: true,
    isPremium: true,
    matchScore: 95,
    lifestyle: "Parejas Swinger",
    relationshipType: "Pareja",
    lookingFor: ["Parejas", "Singles Femeninas"],
    experienceLevel: "Experimentado",
    ageRange: "25-40",
    bodyType: "Atlético",
    height: "170cm / 180cm",
    education: "Universitario",
    profession: "Profesionales",
    smoking: "No",
    drinking: "Socialmente",
    children: "Sí, no viven conmigo",
    religion: "Ninguna",
    aiCompatibility: 98,
    rating: 4.9
  },
  {
    id: 2,
    name: "Valentina",
    age: 29,
    location: "Guadalajara",
    distance: 10,
    interests: ["Unicornio", "Experiencias Nuevas", "Single Femenina"],
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=faces",
    bio: "Explorando mi sexualidad y buscando conexiones auténticas. Abierta a nuevas experiencias.",
    isOnline: true,
    lastActive: "En línea",
    isVerified: true,
    isPremium: false,
    matchScore: 91,
    lifestyle: "Exploradora",
    relationshipType: "Single",
    lookingFor: ["Parejas", "Singles"],
    experienceLevel: "Intermedio",
    ageRange: "25-40",
    bodyType: "Delgado",
    height: "168cm",
    education: "Posgrado",
    profession: "Psicología",
    smoking: "Ocasionalmente",
    drinking: "Socialmente",
    children: "No",
    religion: "Espiritual",
    aiCompatibility: 94,
    rating: 4.6
  },
  {
    id: 3,
    name: "Carlos",
    age: 35,
    location: "Monterrey",
    distance: 8,
    interests: ["Single Masculino", "Parejas", "Discreción"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
    bio: "Profesional discreto buscando conexiones auténticas. Respeto y diversión garantizados.",
    isOnline: false,
    lastActive: "Hace 1 hora",
    isVerified: true,
    isPremium: true,
    matchScore: 88,
    lifestyle: "Single Experimentado",
    relationshipType: "Single",
    lookingFor: ["Parejas", "Singles Femeninas"],
    experienceLevel: "Experimentado",
    ageRange: "25-45",
    bodyType: "Atlético",
    height: "180cm",
    education: "Universitario",
    profession: "Ingeniero",
    smoking: "No",
    drinking: "Socialmente",
    children: "No",
    religion: "Ninguna",
    aiCompatibility: 92,
    rating: 4.7
  },
  {
    id: 4,
    name: "Ana & Roberto",
    age: 28,
    location: "Puebla",
    distance: 15,
    interests: ["Novatos", "Soft Swap", "Eventos Sociales"],
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop&crop=faces",
    bio: "Pareja joven explorando el lifestyle. Buscamos otras parejas para comenzar esta aventura juntos.",
    isOnline: true,
    lastActive: "En línea",
    isVerified: false,
    isPremium: false,
    matchScore: 85,
    lifestyle: "Novatos",
    relationshipType: "Pareja",
    lookingFor: ["Parejas"],
    experienceLevel: "Principiante",
    ageRange: "25-35",
    bodyType: "Promedio",
    height: "165cm / 175cm",
    education: "Universitario",
    profession: "Estudiantes",
    smoking: "No",
    drinking: "Ocasionalmente",
    children: "No",
    religion: "Católica",
    aiCompatibility: 87,
    rating: 4.3
  },
  {
    id: 5,
    name: "Isabella",
    age: 31,
    location: "Tijuana",
    distance: 12,
    interests: ["Hotwife", "Cuckold", "Dominación"],
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
    bio: "Esposa caliente con esposo sumiso. Buscamos hombres seguros para experiencias intensas.",
    isOnline: true,
    lastActive: "Hace 5 min",
    isVerified: true,
    isPremium: true,
    matchScore: 93,
    lifestyle: "Hotwife",
    relationshipType: "Single",
    lookingFor: ["Singles Masculinos"],
    experienceLevel: "Experimentado",
    ageRange: "28-45",
    bodyType: "Curvilíneo",
    height: "172cm",
    education: "Posgrado",
    profession: "Abogada",
    smoking: "No",
    drinking: "Socialmente",
    children: "Sí, no viven conmigo",
    religion: "Ninguna",
    aiCompatibility: 96,
    rating: 4.8
  },
  {
    id: 6,
    name: "Miguel",
    age: 42,
    location: "Cancún",
    distance: 20,
    interests: ["Bull", "Experiencias Maduras", "Viajes"],
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face",
    bio: "Bull experimentado. Discreto, respetuoso y con mucha experiencia en el lifestyle.",
    isOnline: false,
    lastActive: "Hace 30 min",
    isVerified: true,
    isPremium: true,
    matchScore: 90,
    lifestyle: "Bull",
    relationshipType: "Single",
    lookingFor: ["Parejas", "Hotwives"],
    experienceLevel: "Muy Experimentado",
    ageRange: "30-50",
    bodyType: "Atlético",
    height: "185cm",
    education: "Universitario",
    profession: "Empresario",
    smoking: "No",
    drinking: "Socialmente",
    children: "Sí, viven conmigo",
    religion: "Ninguna",
    aiCompatibility: 89,
    rating: 4.9
  },
  {
    id: 7,
    name: "Lucia & Fernando",
    age: 26,
    location: "Guadalajara",
    distance: 3,
    interests: ["Intercambio", "Fiestas Privadas", "Soft Swap"],
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=600&fit=crop&crop=faces",
    bio: "Pareja joven y atractiva. Nos encanta conocer gente nueva y vivir experiencias únicas.",
    isOnline: true,
    lastActive: "En línea",
    isVerified: true,
    isPremium: false,
    matchScore: 92,
    lifestyle: "Swinger",
    relationshipType: "Pareja",
    lookingFor: ["Parejas"],
    experienceLevel: "Intermedio",
    ageRange: "22-35",
    bodyType: "Atlético",
    height: "165cm / 178cm",
    education: "Universitario",
    profession: "Médicos",
    smoking: "No",
    drinking: "Socialmente",
    children: "No",
    religion: "Ninguna",
    aiCompatibility: 95,
    rating: 4.8
  },
  {
    id: 8,
    name: "Alejandra",
    age: 33,
    location: "Mérida",
    distance: 25,
    interests: ["BDSM", "Dominación", "Fetiches"],
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
    bio: "Dominatrix experimentada. Busco sumisos que sepan adorar a una diosa.",
    isOnline: false,
    lastActive: "Hace 2 horas",
    isVerified: true,
    isPremium: true,
    matchScore: 87,
    lifestyle: "BDSM",
    relationshipType: "Single",
    lookingFor: ["Singles Masculinos", "Parejas"],
    experienceLevel: "Muy Experimentado",
    ageRange: "25-45",
    bodyType: "Atlético",
    height: "170cm",
    education: "Posgrado",
    profession: "Psicóloga",
    smoking: "No",
    drinking: "Ocasionalmente",
    children: "No",
    religion: "Ninguna",
    aiCompatibility: 91,
    rating: 4.7
  },
  {
    id: 15,
    name: "Carmen",
    age: 27,
    location: "León",
    image: "https://images.unsplash.com/photo-1494790108755-2616c9c0f8c3?w=400&h=600&fit=crop&crop=faces",
    rating: 4.7,
    isOnline: true,
    lifestyle: "Activa",
    relationshipType: "Soltero",
    interests: ["Yoga", "Lectura", "Cocina"],
    education: "Licenciatura",
    profession: "Nutrióloga",
    smoking: "No",
    drinking: "Ocasionalmente",
    children: "No",
    religion: "Católica",
    aiCompatibility: 92,
    description: "Apasionada por la vida saludible. Me encanta cocinar, hacer yoga y leer. Busco a alguien que comparta mis valores."
  },
  {
    id: 16,
    name: "Ricardo",
    age: 32,
    location: "Querétaro",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
    rating: 4.5,
    isOnline: false,
    lifestyle: "Equilibrada",
    relationshipType: "Soltero",
    interests: ["Tecnología", "Viajes", "Fotografía"],
    education: "Maestría",
    profession: "Ingeniero de Software",
    smoking: "No",
    drinking: "Socialmente",
    children: "No",
    religion: "Agnóstico",
    aiCompatibility: 88,
    description: "Ingeniero apasionado por la tecnología y los viajes. Busco conexiones auténticas con personas inteligentes y aventureras."
  },
  {
    id: 9,
    name: "Ricardo",
    age: 38,
    location: "León",
    distance: 18,
    interests: ["Voyeurismo", "Exhibicionismo", "Clubes"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face",
    bio: "Me gusta observar y ser observado. Busco parejas liberales para experiencias únicas.",
    isOnline: true,
    lastActive: "Hace 10 min",
    isVerified: false,
    isPremium: false,
    matchScore: 83,
    lifestyle: "Voyeur",
    relationshipType: "Single",
    lookingFor: ["Parejas", "Singles Femeninas"],
    experienceLevel: "Intermedio",
    ageRange: "30-50",
    bodyType: "Promedio",
    height: "175cm",
    education: "Universitario",
    profession: "Contador",
    smoking: "Ocasionalmente",
    drinking: "Socialmente",
    children: "Sí, no viven conmigo",
    religion: "Católica",
    aiCompatibility: 86,
    rating: 4.2
  },
  {
    id: 10,
    name: "Carmen & Javier",
    age: 45,
    location: "Oaxaca",
    distance: 35,
    interests: ["Maduras", "Experiencias Intensas", "Viajes"],
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=600&fit=crop&crop=faces",
    bio: "Pareja madura con mucha experiencia. Buscamos otras parejas para aventuras intensas.",
    isOnline: false,
    lastActive: "Hace 1 día",
    isVerified: true,
    isPremium: true,
    matchScore: 88,
    lifestyle: "Swinger Maduro",
    relationshipType: "Pareja",
    lookingFor: ["Parejas", "Singles"],
    experienceLevel: "Muy Experimentado",
    ageRange: "35-55",
    bodyType: "Promedio",
    height: "160cm / 180cm",
    education: "Universitario",
    profession: "Empresarios",
    smoking: "No",
    drinking: "Socialmente",
    children: "Sí, no viven conmigo",
    religion: "Ninguna",
    aiCompatibility: 90,
    rating: 4.6
  },
  {
    id: 11,
    name: "Daniela",
    age: 24,
    location: "Querétaro",
    distance: 12,
    interests: ["Principiante", "Curiosa", "Experiencias Nuevas"],
    image: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=600&fit=crop&crop=face",
    bio: "Nueva en esto, pero muy curiosa. Busco personas pacientes para explorar juntos.",
    isOnline: true,
    lastActive: "En línea",
    isVerified: false,
    isPremium: false,
    matchScore: 79,
    lifestyle: "Principiante",
    relationshipType: "Single",
    lookingFor: ["Parejas", "Singles"],
    experienceLevel: "Principiante",
    ageRange: "22-35",
    bodyType: "Delgado",
    height: "162cm",
    education: "Universitario",
    profession: "Estudiante",
    smoking: "No",
    drinking: "Ocasionalmente",
    children: "No",
    religion: "Ninguna",
    aiCompatibility: 82,
    rating: 4.1
  },
  {
    id: 12,
    name: "Eduardo",
    age: 50,
    location: "Aguascalientes",
    distance: 40,
    interests: ["Sugar Daddy", "Experiencias Premium", "Lujo"],
    image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=600&fit=crop&crop=face",
    bio: "Empresario exitoso buscando compañía de calidad. Ofrezco experiencias de lujo.",
    isOnline: false,
    lastActive: "Hace 3 horas",
    isVerified: true,
    isPremium: true,
    matchScore: 85,
    lifestyle: "Sugar Daddy",
    relationshipType: "Single",
    lookingFor: ["Singles Femeninas"],
    experienceLevel: "Muy Experimentado",
    ageRange: "20-40",
    bodyType: "Promedio",
    height: "182cm",
    education: "Posgrado",
    profession: "CEO",
    smoking: "No",
    drinking: "Socialmente",
    children: "Sí, no viven conmigo",
    religion: "Ninguna",
    aiCompatibility: 88,
    rating: 4.5
  },
  {
    id: 13,
    name: "Camila & Roberto",
    age: 35,
    location: "Monterrey",
    distance: 15,
    interests: ["Intercambio", "Fiestas Temáticas", "Viajes"],
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=faces",
    bio: "Pareja madura y experimentada. Nos encanta conocer gente nueva y vivir aventuras juntos.",
    isOnline: false,
    lastActive: "Hace 1 hora",
    isVerified: true,
    isPremium: true,
    matchScore: 89,
    lifestyle: "Swinger Experimentado",
    relationshipType: "Pareja",
    lookingFor: ["Parejas"],
    experienceLevel: "Muy Experimentado",
    ageRange: "30-45",
    bodyType: "Atlético",
    height: "165cm / 175cm",
    education: "Universitario",
    profession: "Ingenieros",
    smoking: "No",
    drinking: "Socialmente",
    children: "Sí, no viven conmigo",
    religion: "Ninguna",
    aiCompatibility: 92,
    rating: 4.7
  }
];

const Discover = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [filters, setFilters] = useState<FilterState>({
    ageRange: [18, 50],
    distance: [50],
    interests: [],
    education: "",
    profession: "",
    relationshipType: [],
    lifestyle: [],
    bodyType: "",
    height: [150, 200],
    smoking: "",
    drinking: "",
    children: "",
    religion: "",
    gender: "all",
    experienceLevel: "all",
    onlyVerified: false,
    onlyPremium: false,
    onlyOnline: false
  });

  const getFilteredProfiles = useCallback(() => {
    return allProfiles.filter(profile => {
      if (profile.age < filters.ageRange[0] || profile.age > filters.ageRange[1]) return false;
      if (profile.distance && profile.distance > filters.distance[0]) return false;
      if (filters.gender !== "all" && profile.relationshipType !== filters.gender) return false;
      if (filters.interests.length > 0 && !filters.interests.some(interest => profile.interests.includes(interest))) return false;
      if (filters.lifestyle.length > 0 && !filters.lifestyle.includes(profile.lifestyle)) return false;
      if (filters.experienceLevel !== "all" && profile.experienceLevel !== filters.experienceLevel) return false;
      if (filters.bodyType && filters.bodyType !== "all" && profile.bodyType !== filters.bodyType) return false;
      if (profile.height) {
        const heights = profile.height.match(/\d+/g)?.map(Number);
        if (heights && heights.length > 0) {
          const isInRange = heights.some(h => h >= filters.height[0] && h <= filters.height[1]);
          if (!isInRange) return false;
        }
      }
      if (filters.onlyVerified && !profile.isVerified) return false;
      if (filters.onlyPremium && !profile.isPremium) return false;
      if (filters.onlyOnline && !profile.isOnline) return false;
      return true;
    });
  }, [filters]);

  const [filteredProfiles, setFilteredProfiles] = useState(getFilteredProfiles());
  const [likedProfiles, setLikedProfiles] = useState<Set<number>>(new Set());

  const handleFiltersChange = useCallback((newFilters: FilterState) => setFilters(newFilters), []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      ageRange: [18, 50], distance: [50], interests: [], education: "", profession: "",
      relationshipType: [], lifestyle: [], bodyType: "", height: [150, 200], smoking: "",
      drinking: "", children: "", religion: "", gender: "all", experienceLevel: "all",
      onlyVerified: false, onlyPremium: false, onlyOnline: false
    });
  }, []);

  const [dailyStats, setDailyStats] = useState(() => ({ likes: 0, superLikes: 3, matches: 0 }));

  useEffect(() => {
    setFilteredProfiles(getFilteredProfiles());
  }, [filters, getFilteredProfiles]);

  const handleLike = (profileId: number) => {
    setLikedProfiles(prev => new Set([...prev, profileId]));
    setDailyStats(prev => ({ ...prev, likes: prev.likes + 1 }));
    if (Math.random() < 0.2) {
      setDailyStats(prev => ({ ...prev, matches: prev.matches + 1 }));
      toast({ title: "¡Es un Match!", description: "¡A ambos se gustan! Pueden empezar a chatear.", duration: 4000 });
    } else {
      toast({ title: "Like enviado", description: "Tu interés ha sido enviado.", duration: 2000 });
    }
  };

  const [showSuperLikeModal, setShowSuperLikeModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const handleSuperLike = (profile: any) => {
    if (dailyStats.superLikes <= 0) {
      toast({ title: "Super Likes agotados", description: "Has usado todos tus Super Likes de hoy. ¡Vuelve mañana!", variant: "destructive" });
      return;
    }
    setSelectedProfile(profile);
    setShowSuperLikeModal(true);
  };

  const confirmSuperLike = () => {
    if (!selectedProfile) return;
    setDailyStats(prev => ({ ...prev, superLikes: prev.superLikes - 1, likes: prev.likes + 1 }));
    setShowSuperLikeModal(false);
    if (Math.random() < 0.5) {
      setDailyStats(prev => ({ ...prev, matches: prev.matches + 1 }));
    }
    setSelectedProfile(null);
  };



  return (
    <div className="min-h-screen relative overflow-hidden">
      {showSuperLikeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md bg-card border-accent/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">¡Super Like! 🔥</h2>
              <p className="text-muted-foreground mb-6">
                ¿Estás seguro de que quieres usar un Super Like con <strong>{selectedProfile?.name}</strong>?
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowSuperLikeModal(false)} className="flex-1">Cancelar</Button>
                <Button onClick={confirmSuperLike} className="flex-1 bg-accent hover:bg-accent/90"><Flame className="mr-2 h-4 w-4" />Confirmar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="fixed inset-0 z-0 bg-gradient-to-br from-background via-muted/30 to-secondary/20"></div>

      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Desktop Sidebar */}
            {!isMobile && (
              <aside className="w-full lg:w-1/4 lg:max-w-xs xl:max-w-sm">
                <div className="sticky top-24">
                  <DiscoverSidebar 
                    filters={filters} 
                    onFiltersChange={handleFiltersChange} 
                    onReset={handleResetFilters}
                    dailyStats={dailyStats} 
                  />
                </div>
              </aside>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Conecta con <span className="bg-love-gradient bg-clip-text text-transparent">Parejas y Solteros</span>
                </h1>
                <p className="text-md text-muted-foreground max-w-2xl mx-auto">
                  🔥 Plataforma exclusiva +18 para el ambiente swinger
                </p>
              </div>

              {/* Mobile Filter Button */}
              {isMobile && (
                <div className="mb-4">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Filter className="mr-2 h-4 w-4" />
                        Mostrar Filtros
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                      <SheetHeader>
                        <SheetTitle>Filtros</SheetTitle>
                      </SheetHeader>
                      <div className="py-4">
                        <DiscoverSidebar 
                          filters={filters} 
                          onFiltersChange={handleFiltersChange} 
                          onReset={handleResetFilters}
                          dailyStats={dailyStats} 
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}

              {filteredProfiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProfiles.map(profile => (
                    <ProfileCard 
                      key={profile.id} 
                      profile={profile} 
                      onLike={handleLike}
                      onSuperLike={handleSuperLike}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <Card className="text-center p-8 bg-card/80 backdrop-blur-sm">
                    <p className="text-muted-foreground mb-4">No se encontraron perfiles.</p>
                    <Button onClick={handleResetFilters}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Limpiar Filtros
                    </Button>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Discover;