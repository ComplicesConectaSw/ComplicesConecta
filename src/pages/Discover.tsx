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
import { pickProfileImage, inferProfileKind, type ProfileType, type Gender } from '@/lib/media';

// Professional profile images from Unsplash

// Función para generar perfiles aleatorios con imágenes coherentes
const generateRandomProfiles = (userType = 'single') => {
  const coupleNames = [
    "Ana & Carlos", "María & Luis", "Carmen & Roberto", "Elena & Miguel", 
    "Sofía & Diego", "Laura & Javier", "Patricia & Fernando", "Isabel & Antonio",
    "Cristina & Pablo", "Mónica & Raúl", "Beatriz & Sergio", "Natalia & Andrés"
  ];
  
  const singleNames = [
    "Alejandra", "Valentina", "Isabella", "Camila", "Lucía", "Daniela", "Gabriela", "Andrea",
    "Carlos", "Miguel", "Alejandro", "Fernando", "Roberto", "Javier", "Antonio", "Pablo",
    "Sergio", "Raúl", "Andrés", "Diego", "Luis", "Manuel", "Ricardo", "Eduardo"
  ];

  const locations = ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Torreón"];
  const interests = {
    couple: ["Fiestas Privadas", "Intercambio de Parejas", "Eventos VIP", "Lifestyle", "Experiencias Nuevas"],
    single: ["Aventuras", "Diversión", "Experiencias Únicas", "Conexiones Reales", "Lifestyle"]
  };

  const profiles = [];
  const profileCount = userType === 'couple' ? 15 : 20;
  const usedImages = new Set<string>();
  
  for (let i = 1; i <= profileCount; i++) {
    const isCouple = userType === 'couple' || (userType === 'single' && Math.random() > 0.7);
    const name = isCouple ? 
      coupleNames[Math.floor(Math.random() * coupleNames.length)] :
      singleNames[Math.floor(Math.random() * singleNames.length)];
    
    // Determinar género basado en el nombre para singles
    const profileInfo = inferProfileKind({ 
      name, 
      type: isCouple ? 'couple' : 'single' as ProfileType 
    });
    
    // Asignar imagen coherente sin repetir
    const profileImage = pickProfileImage({
      id: i.toString(),
      name,
      type: isCouple ? 'couple' : 'single' as ProfileType,
      gender: profileInfo.gender
    }, usedImages);
    
    profiles.push({
      id: i,
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

const allProfiles = generateRandomProfiles(getUserType());

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