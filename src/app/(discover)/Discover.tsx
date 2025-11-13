import { useState, useEffect, useCallback, memo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Heart, Flame, RefreshCw, Filter, Star, Home, User, Search } from 'lucide-react';
import HeaderNav from '@/components/HeaderNav';
import SuperLikesModal from '@/components/modals/SuperLikesModal';
import PremiumModal from '@/components/modals/PremiumModal';
import CompatibilityModal from '@/components/modals/CompatibilityModal';
import EventsModal from '@/components/modals/EventsModal';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from "@/hooks/useToast";
import { useGeolocation } from '@/hooks/useGeolocation';
import { pickProfileImage, inferProfileKind, resetImageCounters, type ProfileType, type Gender } from '@/lib/media';
import { calculateDistance, getLocationDisplay } from '@/lib/distance-utils';
import { type CoupleProfileWithPartners } from "@/features/profile/coupleProfiles";
import { getAllCoupleProfiles } from "@/features/profile/coupleProfiles";
import { generateDemoProfiles, type DemoProfile } from '@/demo/demoData';
import { safeGetItem } from '@/utils/safeLocalStorage';
import { generateFilterDemoCards, type FilterDemoCard } from '@/lib/infoCards';
import { FilterDemoCard as FilterDemoCardComponent } from '@/components/ui/FilterDemoCard';
import { supabase } from "@/integrations/supabase/client";
import CoupleProfileCard from '@/profiles/couple/CoupleProfileCard';
import { AnimatedProfileCard } from '@/profiles/shared/AnimatedProfileCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';
import { DecorativeHearts } from '@/components/DecorativeHearts';
import { logger } from '@/lib/logger';

// Definicin del tipo para un perfil
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
  relationshipType: string[];
}

const Discover = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [_isMobile] = useState(false);
  const { location } = useGeolocation();
  const { user, isAuthenticated } = useAuth();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [demoProfiles, setDemoProfiles] = useState<DemoProfile[]>([]);
  const [filterCards, setFilterCards] = useState<FilterDemoCard[]>([]);
  const [coupleProfiles, setCoupleProfiles] = useState<CoupleProfileWithPartners[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [filteredDemoProfiles, setFilteredDemoProfiles] = useState<DemoProfile[]>([]);
  const [filteredCoupleProfiles, setFilteredCoupleProfiles] = useState<CoupleProfileWithPartners[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCouples, setShowCouples] = useState(false);
  
  // Modal states
  const [showSuperLikesModal, setShowSuperLikesModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    ageRange: [18, 65],
    distance: 50,
    interests: [],
    verified: false,
    premium: false,
    online: false,
    relationshipType: []
  });

  // Intereses generales (para todos los usuarios)
  const generalInterests = [
    'Lifestyle', 'Aventura', 'Diversin', 'Respeto', 'Discrecin', 
    'Experiencia', 'Naturaleza', 'Viajes', 'Msica', 'Arte', 
    'Deportes', 'Cine', 'Literatura', 'Tecnologa', 'Gastronoma'
  ];

  // Intereses explcitos (solo para perfiles demo y produccin)
  const explicitInterests = [
    'Swinger', 'Parejas', 'Intercambio', 'Liberal', 'Soft Swap',
    'Hard Swap', 'Clubs Exclusivos', 'Eventos VIP', 'Fiestas Privadas',
    'Tantra', 'BDSM', 'Poliamor', 'Cuckolding', 'Hotwife', 'Lifestyle Swinger'
  ];

  // Determinar si el usuario es demo/produccin
  const isDemoOrProduction = () => {
    const authStatus = isAuthenticated();
    if (!authStatus || !user) return false;
    const demoAuth = safeGetItem<string>('demo_authenticated', { validate: true, defaultValue: 'false' }) === 'true';
    const isDemoUser = user.email === 'single@outlook.es' || user.email === 'pareja@outlook.es';
    // Tambin considerar usuarios de produccin (que tienen cuenta real)
    return (demoAuth && isDemoUser) || (authStatus && !isDemoUser);
  };

  // Intereses disponibles segn el tipo de usuario
  const availableInterests = isDemoOrProduction() 
    ? [...generalInterests, ...explicitInterests]
    : generalInterests;

  // Load couple profiles
  const loadCoupleProfiles = useCallback(async () => {
    try {
      const couples = await getAllCoupleProfiles(20, 0);
      setCoupleProfiles(couples);
      setFilteredCoupleProfiles(couples);
    } catch (error) {
      logger.error('Error loading single profiles', { error: error instanceof Error ? error.message : String(error) });
    }
  }, []);

  // Generar perfiles aleatorios
  const generateRandomProfiles = useCallback(() => {
    const nombres = [
      'Alejandro', 'Mara', 'Carlos', 'Ana', 'Jos', 'Laura', 'Miguel', 'Carmen',
      'Antonio', 'Isabel', 'Manuel', 'Pilar', 'Francisco', 'Dolores', 'David',
      'Cristina', 'Javier', 'Rosa', 'Daniel', 'Antonia', 'Rafael', 'Francisca',
      'Jos Luis', 'Luca', 'Jess', 'Mercedes', 'ngel', 'Josefa', 'Marcos',
      'Elena', 'Pedro', 'Teresa', 'Sergio', 'Raquel', 'Pablo', 'Manuela'
    ];

    const ubicaciones = [
      'Ciudad de Mxico', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana',
      'Len', 'Jurez', 'Torren', 'Quertaro', 'San Luis Potos',
      'Mrida', 'Mexicali', 'Aguascalientes', 'Cuernavaca', 'Saltillo'
    ];

    const bios = [
      'Aventurero en busca de nuevas experiencias y conexiones autnticas.',
      'Amante de la vida, los viajes y las buenas conversaciones.',
      'Explorando el mundo del lifestyle swinger con mente abierta.',
      'Buscando parejas y personas afines para compartir momentos nicos.',
      'Discreto, respetuoso y con ganas de conocer gente interesante.',
      'Pareja liberal en busca de otras parejas para intercambios.',
      'Nuevo en esto, pero con muchas ganas de aprender y disfrutar.',
      'Experiencia y diversin garantizada. Siempre con respeto.',
      'Mente abierta, corazn libre. Buscando conexiones reales.',
      'Lifestyle swinger desde hace aos. Conocemos el ambiente.'
    ];

    resetImageCounters();

    const newProfiles: Profile[] = Array.from({ length: 50 }, (_, _index) => {
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
        interests: ['Lifestyle', 'Swinger', 'Parejas', 'Intercambio']
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3) + 2),
        image: pickProfileImage({ id, name, type: profileType, gender }, usedImages),
        bio: bios[Math.floor(Math.random() * bios.length)],
        isOnline: Math.random() > 0.6,
        lastActive: Math.random() > 0.5 ? 'Hace 1 hora' : 'Hace 2 das',
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
    const applyFilters = () => {
      // Filtrar perfiles demo
      const filteredDemo = demoProfiles.filter(profile => {
        const ageMatch = profile.age >= filters.ageRange[0] && profile.age <= filters.ageRange[1];
        const distanceMatch = !location || profile.distance <= filters.distance;
        const interestsMatch = filters.interests.length === 0 || 
          filters.interests.some(interest => profile.interests.includes(interest));
        const verifiedMatch = !filters.verified || profile.isVerified;
        const premiumMatch = !filters.premium || profile.isPremium;
        const onlineMatch = !filters.online || profile.isOnline;
        
        return ageMatch && distanceMatch && interestsMatch && verifiedMatch && premiumMatch && onlineMatch;
      });
      
      setFilteredDemoProfiles(filteredDemo);

      // Filtrar perfiles individuales reales
      const filtered = profiles.filter(profile => {
        const ageMatch = profile.age >= filters.ageRange[0] && profile.age <= filters.ageRange[1];
        
        // Filtro de distancia mejorado - siempre aplicar si hay distancia disponible
        let distanceMatch = true;
        if (location) {
          // Si el perfil tiene distancia calculada, usarla
          if (profile.distance !== undefined) {
            distanceMatch = profile.distance <= filters.distance;
          } else {
            // Si no tiene distancia pero tiene coordenadas, calcularla
            // Esto se maneja en loadRealProfiles, as que aqu solo verificamos la distancia ya calculada
            distanceMatch = true; // Permitir si no hay distancia disponible
          }
        }
        
        const interestsMatch = filters.interests.length === 0 || 
          filters.interests.some(interest => profile.interests.includes(interest));
        const verifiedMatch = !filters.verified || profile.isVerified;
        const premiumMatch = !filters.premium || profile.isPremium;
        const onlineMatch = !filters.online || profile.isOnline;
        
        return ageMatch && distanceMatch && interestsMatch && verifiedMatch && premiumMatch && onlineMatch;
      });
      
      setFilteredProfiles(filtered);

      // Filtrar perfiles de parejas
      const filteredCouples = coupleProfiles.filter(couple => {
        const avgAge = (couple.partner1_age + couple.partner2_age) / 2;
        const ageMatch = avgAge >= filters.ageRange[0] && avgAge <= filters.ageRange[1];
        
        // Filtro de distancia para parejas
        let distanceMatch = true;
        if (location && couple.location) {
          // Calcular distancia - los perfiles de pareja pueden no tener coordenadas exactas
          // Usar la distancia calculada previamente o permitir el match si no hay coordenadas
          distanceMatch = true; // Por ahora permitir todos si no hay coordenadas precisas
        }
        
        // Los perfiles de pareja no tienen interests en el tipo actual, permitir match
        const interestsMatch = filters.interests.length === 0;
        const verifiedMatch = !filters.verified || couple.is_verified;
        const premiumMatch = !filters.premium || couple.is_premium;
        const onlineMatch = !filters.online || couple.isOnline;
        
        return ageMatch && distanceMatch && interestsMatch && verifiedMatch && premiumMatch && onlineMatch;
      });
      
      setFilteredCoupleProfiles(filteredCouples);
    };

    applyFilters();
  }, [filters, demoProfiles, profiles, coupleProfiles, location]);

  // Funcin para cargar perfiles reales desde Supabase
  const loadRealProfiles = useCallback(async () => {
    try {
      // Solo log una vez por carga
      if (profiles.length === 0) {
        logger.info('?? Cargando perfiles reales desde Supabase...');
      }
      
      if (!supabase) {
        logger.error('Supabase no est disponible');
        generateRandomProfiles();
        return;
      }
      
      const { data: realProfiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .neq('is_demo', true)
        .limit(50);

      if (error) {
        logger.error('? Error cargando perfiles reales:', error);
        // Fallback a perfiles mock
        generateRandomProfiles();
        return;
      }

      if (realProfiles && realProfiles.length > 0) {
        logger.info(`? ${realProfiles.length} perfiles reales cargados`);
        
        // Convertir perfiles de Supabase al formato esperado
        const convertedProfiles: Profile[] = realProfiles.map((profile: any) => ({
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name || ''}`.trim(),
          age: profile.age || 25,
          location: getLocationDisplay(location), // Ubicacin real implementada con useGeolocation
          distance: calculateDistance(
            location, 
            profile.latitude && profile.longitude 
              ? { latitude: profile.latitude, longitude: profile.longitude } 
              : null
          ), // Clculo de distancia implementado con coordenadas reales
          interests: Array.isArray(profile.interests) ? profile.interests : [], // Sistema de intereses conectado con Supabase
          image: pickProfileImage({ id: profile.id, name: profile.first_name, type: 'single', gender: profile.gender as Gender }, new Set()), // Avatar URL desde Supabase profiles
          bio: profile.bio || 'Sin descripcin',
          isOnline: profile.is_online || false,
          lastActive: profile.last_active ? new Date(profile.last_active).toLocaleString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            day: 'numeric',
            month: 'short'
          }) : 'Hace 1 hora',
          isVerified: profile.is_premium || false,
          isPremium: profile.is_premium || false,
          rating: 4.5,
          matchScore: Math.floor(Math.random() * 40) + 60,
          profileType: (profile.account_type as ProfileType) || 'single',
          gender: profile.gender as Gender || 'other'
        }));

        setProfiles(convertedProfiles);
        setFilteredProfiles(convertedProfiles);
      } else {
        logger.info('?? No hay perfiles reales disponibles, usando mock');
        generateRandomProfiles();
      }
    } catch (error) {
      logger.error('? Error inesperado cargando perfiles', { error: error instanceof Error ? error.message : String(error) });
      // Fallback a perfiles mock
      generateRandomProfiles();
    }
  }, [generateRandomProfiles]);

  // Cargar cards de filtros demo para usuarios no autenticados
  useEffect(() => {
    if (filterCards.length === 0) {
      const cards = generateFilterDemoCards();
      setFilterCards(cards);
    }
  }, [filterCards.length]);

  // Cargar perfiles demo solo para usuarios con credenciales especficas
  useEffect(() => {
    const demoAuth = safeGetItem<string>('demo_authenticated', { validate: true, defaultValue: 'false' }) === 'true';
    const isDemoUser = user?.email === 'single@outlook.es' || user?.email === 'pareja@outlook.es';
    
    if (demoAuth && isDemoUser && demoProfiles.length === 0) {
      const demos = generateDemoProfiles(20);
      setDemoProfiles(demos);
      setFilteredDemoProfiles(demos);
    }
  }, [user?.email, demoProfiles.length]);

  // Verificar autenticacin y cargar perfiles reales
  useEffect(() => {
    // Si no est autenticado, mostrar cards informativos
    if (!isAuthenticated()) {
      logger.info('?? Usuario no autenticado - mostrando cards informativos');
      return;
    }
    
    logger.info('? Usuario autenticado en Discover:', { user: user?.email || user?.id, isAuthenticated: isAuthenticated() });
    
    // Verificar autenticacin local adicional (demo)
    const demoAuth = safeGetItem<string>('demo_authenticated', { validate: true, defaultValue: 'false' }) === 'true';
    
    // Solo cargar perfiles reales una vez para usuarios autenticados
    if (profiles.length === 0) {
      // Cargar perfiles segn el tipo de usuario
      if (demoAuth) {
        // Solo log una vez para demo
        if (demoProfiles.length === 0) {
          logger.info('?? Usuario demo - cargando perfiles adicionales');
        }
        generateRandomProfiles();
      } else {
        // Solo log una vez para usuarios reales
        logger.info('?? Cargando perfiles reales');
        loadRealProfiles();
      }
    }
    
    // Solo cargar parejas una vez
    if (coupleProfiles.length === 0) {
      loadCoupleProfiles();
    }
  }, [isAuthenticated, navigate, profiles.length, coupleProfiles.length]);

  const _handleProfileClick = useCallback((_profileId: string) => {
    navigate(`/profile/${_profileId}`, { state: { profile: profiles.find(p => p.id === _profileId) } });
  }, [profiles]);

  const handleLike = (_profileId: number | string) => {
    if (!isAuthenticated()) {
      setShowPremiumModal(true);
      return;
    }
    toast({
      title: "Like enviado!",
      description: "Le has dado like a este perfil.",
    });
  };

  const _handleSuperLike = useCallback((_profileId: string) => {
    if (!isAuthenticated()) {
      setShowSuperLikesModal(true);
      return;
    }
    toast({
      title: "Super Like enviado!",
      description: "Has enviado un Super Like especial.",
      variant: "default",
    });
  }, []);

  const _handlePass = useCallback((_profileId: string) => {
    // Simplemente no mostrar mensaje para pass
  }, []);

  const _handleCompatibilityClick = useCallback(() => {
    if (!isAuthenticated()) {
      setShowCompatibilityModal(true);
    }
  }, []);

  const _handleEventsClick = useCallback(() => {
    if (!isAuthenticated()) {
      setShowEventsModal(true);
    }
  }, []);

  const handleViewProfile = (profileId: number | string) => {
    const profile = profiles.find(p => p.id === profileId.toString()) || 
                   demoProfiles.find(p => p.id === profileId.toString());
    if (profile) {
      navigate(`/profile/${profile.id}`, { state: { profile } });
    }
  };

  const handleMessage = (profileId: number | string) => {
    if (!isAuthenticated()) {
      setShowPremiumModal(true);
      return;
    }
    navigate(`/chat/${profileId}`);
  };

  const handleCtaClick = (action: 'register' | 'login' | 'premium') => {
    switch (action) {
      case 'register':
        navigate('/auth?mode=register');
        break;
      case 'login':
        navigate('/auth');
        break;
      case 'premium':
        setShowPremiumModal(true);
        break;
    }
  };

  const handleRefresh = () => {
    generateRandomProfiles();
    toast({
      title: "Perfiles actualizados",
      description: "Se han cargado nuevos perfiles para ti.",
    });
  };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden pb-20">
        {/* Corazones decorativos flotantes */}
        <DecorativeHearts count={6} />
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10">
        <HeaderNav />
      </div>
      
      {/* Header con navegacin */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4 shadow-lg relative z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 p-2 sm:px-4 bg-transparent border-none"
            >
              <Home className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
              <span className="hidden sm:inline">Inicio</span>
            </Button>
            <Button
              onClick={() => navigate('/profile')}
              className="text-white hover:bg-white/20 p-2 sm:px-4 bg-transparent border-none"
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
              onClick={() => setShowCouples(!showCouples)}
              className={`p-2 sm:px-4 bg-transparent hover:bg-white/20 ${showCouples ? 'text-purple-300 bg-white/20' : 'text-white'}`}
            >
              <span className="hidden sm:inline">{showCouples ? 'Singles' : 'Parejas'}</span>
              <span className="sm:hidden">{showCouples ? 'S' : 'P'}</span>
            </Button>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="text-white hover:bg-white/20 p-2 sm:px-4 bg-transparent"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
            <Button
              onClick={handleRefresh}
              className="text-white hover:bg-white/20 p-2 bg-transparent"
            >
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-full overflow-x-hidden">
        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="text-center p-4">
            <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold text-white">12</div>
            <div className="text-sm text-white/80">Likes</div>
          </GlassCard>
          <GlassCard className="text-center p-4">
            <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold text-white">5</div>
            <div className="text-sm text-white/80">Super Likes</div>
          </GlassCard>
          <GlassCard className="text-center p-4">
            <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-sm text-white/80">Matches</div>
          </GlassCard>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Panel de filtros */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="w-full lg:w-80 p-4 lg:p-6" variant="colored">
              <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent font-bold">
                  Filtros Avanzados
                </span>
              </h3>
              
              {/* Edad */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-3">
                  Edad: {filters.ageRange[0]} - {filters.ageRange[1]} aos
                </label>
                <Slider
                  value={filters.ageRange}
                  onValueChange={(value: number[]) => setFilters(prev => ({ ...prev, ageRange: value as [number, number] }))}
                  min={18}
                  max={65}
                  step={1}
                  className="w-full"
                />
              </div>
              
              {/* Distancia */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-3">
                  Distancia: {filters.distance} km
                </label>
                <Slider
                  value={[filters.distance]}
                  onValueChange={(value: number[]) => setFilters(prev => ({ ...prev, distance: value[0] }))}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              
              {/* Intereses */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-3">
                  Intereses
                  {isDemoOrProduction() && (
                    <span className="ml-2 text-xs text-purple-300">(Demo/Produccin)</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-white/20 rounded-lg border border-white/30">
                  {availableInterests.map((interest: string) => (
                    <Badge
                      key={interest}
                      className={`cursor-pointer text-xs font-medium transition-all duration-200 hover:scale-105 ${
                        filters.interests.includes(interest) 
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg" 
                          : "border-white/60 text-white hover:border-white hover:bg-white/20 border bg-transparent"
                      }`}
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

              {/* Tipo de Relacin */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-purple-800 mb-3">
                  Tipo de Relacin
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Pareja", "Soltero/a", "Abierto", "Poliamoroso"].map((type) => {
                    const isSelected = filters.relationshipType.includes(type);
                    return (
                      <Badge
                        key={type}
                        className={`cursor-pointer text-xs p-2 text-center transition-all duration-200 ${
                          isSelected 
                            ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700" 
                            : "border-purple-300 text-purple-700 hover:border-purple-500 hover:bg-purple-50 border bg-transparent"
                        }`}
                        onClick={() => {
                          setFilters(prev => ({
                            ...prev,
                            relationshipType: isSelected 
                              ? prev.relationshipType.filter(t => t !== type)
                              : [...prev.relationshipType, type]
                          }));
                        }}
                      >
                        {type}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Verificacin */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-purple-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filters.verified}
                    className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                    onChange={(e) => {
                      setFilters(prev => ({
                        ...prev,
                        verified: e.target.checked
                      }));
                    }}
                  />
                  Solo perfiles verificados
                </label>
              </div>

              {/* Botn Limpiar Filtros */}
              <AnimatedButton 
                variant="love"
                className="w-full"
                onClick={() => {
                  setFilters({
                    ageRange: [18, 65],
                    distance: 50,
                    interests: [],
                    verified: false,
                    premium: false,
                    online: false,
                    relationshipType: []
                  });
                }}
              >
                Limpiar Filtros
              </AnimatedButton>
              </GlassCard>
            </motion.div>
          )}
          
          {/* Grid de perfiles */}
          <div className="flex-1">
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {showCouples ? (
                // Show couple profiles
                filteredCoupleProfiles.map((coupleProfile, index) => (
                  <motion.div
                    key={coupleProfile.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CoupleProfileCard
                      profile={{
                        ...coupleProfile,
                        location: coupleProfile.location || 'Ciudad de Mxico',
                        isOnline: coupleProfile.isOnline || Math.random() > 0.6
                      }}
                      onLike={() => {
                        toast({
                          title: "Like enviado!",
                          description: `Tu inters en ${coupleProfile.couple_name} ha sido registrado.`,
                        });
                      }}
                      _onMessage={() => {
                        toast({
                          title: "Chat iniciado",
                          description: `Iniciando conversacin con ${coupleProfile.couple_name}...`,
                        });
                        navigate('/chat-info');
                      }}
                      onOpenModal={() => {
                        toast({
                          title: "Accin requerida",
                          description: "Funcionalidad de modal disponible prximamente.",
                        });
                      }}
                    />
                  </motion.div>
                ))
              ) : (
                // Show content based on authentication status
                <>
                  {/* Usuarios NO autenticados: Cards de filtros demo */}
                  {!isAuthenticated() && filterCards.map((card, index) => (
                    <FilterDemoCardComponent
                      key={card.id}
                      card={card}
                      index={index}
                      onCtaClick={handleCtaClick}
                    />
                  ))}
                  
                  {/* Usuarios autenticados con credenciales demo: Perfiles demo */}
                  {isAuthenticated() && user?.email === 'single@outlook.es' && filteredDemoProfiles.map((profile, index) => (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <AnimatedProfileCard
                        id={parseInt(profile.id.slice(-8), 16) || index}
                        name={profile.name}
                        age={profile.age}
                        location={profile.location}
                        image={profile.image}
                        bio={profile.bio}
                        interests={profile.interests}
                        isOnline={profile.isOnline}
                        isPremium={profile.isPremium}
                        isPrivate={false}
                        lastSeen={profile.isOnline ? undefined : profile.lastActive}
                        onLike={handleLike}
                        onMessage={handleMessage}
                        onViewProfile={handleViewProfile}
                      />
                    </motion.div>
                  ))}
                  
                  {/* Usuarios autenticados con credenciales demo: Perfiles demo */}
                  {isAuthenticated() && user?.email === 'pareja@outlook.es' && filteredDemoProfiles.map((profile, index) => (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <AnimatedProfileCard
                        id={parseInt(profile.id.slice(-8), 16) || index}
                        name={profile.name}
                        age={profile.age}
                        location={profile.location}
                        image={profile.image}
                        bio={profile.bio}
                        interests={profile.interests}
                        isOnline={profile.isOnline}
                        isPremium={profile.isPremium}
                        isPrivate={false}
                        lastSeen={profile.isOnline ? undefined : profile.lastActive}
                        onLike={handleLike}
                        onMessage={handleMessage}
                        onViewProfile={handleViewProfile}
                      />
                    </motion.div>
                  ))}
                  
                  {/* Usuarios autenticados reales: Perfiles reales */}
                  {isAuthenticated() && user?.email !== 'single@outlook.es' && user?.email !== 'pareja@outlook.es' && filteredProfiles.map((profile, index) => (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <AnimatedProfileCard
                        id={parseInt(profile.id)}
                        name={profile.name}
                        age={profile.age}
                        location={profile.location}
                        image={profile.image}
                        bio={profile.bio}
                        interests={profile.interests}
                        isOnline={profile.isOnline}
                        isPremium={profile.isPremium}
                        isPrivate={false}
                        lastSeen={profile.isOnline ? undefined : profile.lastActive}
                        onLike={handleLike}
                        onMessage={handleMessage}
                        onViewProfile={handleViewProfile}
                      />
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      
      {/* Navigation removido - ahora usa HeaderNav */}
      
      {/* Presentation Modals */}
      <SuperLikesModal 
        isOpen={showSuperLikesModal} 
        onClose={() => setShowSuperLikesModal(false)} 
      />
      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
      <CompatibilityModal 
        isOpen={showCompatibilityModal} 
        onClose={() => setShowCompatibilityModal(false)} 
      />
      <EventsModal 
        isOpen={showEventsModal} 
        onClose={() => setShowEventsModal(false)} 
      />
    </div>
  );
};

export default memo(Discover);
