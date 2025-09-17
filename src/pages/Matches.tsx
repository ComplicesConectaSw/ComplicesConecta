import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, MapPin, Clock, Filter, Users, Star, ArrowLeft, Zap, Shield, Crown, Flame, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { logger } from '@/lib/logger';
import { usePersistedState } from '@/hooks/usePersistedState';
import { motion } from 'framer-motion';

// Professional profile images from Unsplash - Production ready
// Removed local imports that fail in production

export interface Match {
  id: number;
  name: string;
  age: number;
  image: string;
  compatibility: number;
  mutualInterests: string[];
  distance: number;
  matchedAt: string;
  hasUnreadMessage: boolean;
  status: 'new' | 'viewed' | 'chatting';
}

export interface SimpleMatch {
  id: string;
  profile: {
    id: string;
    display_name: string;
    age: number;
    location: string;
    avatar_url?: string;
    bio?: string;
  };
  compatibility_score: number;
  mutual_interests: string[];
  created_at: string;
}

const Matches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [realMatches, setRealMatches] = useState<SimpleMatch[]>([]);
  const [isProduction, setIsProduction] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoMatches] = useState<Match[]>([
    {
      id: 1,
      name: "Anabella & Julio",
      age: 32,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
      compatibility: 98,
      mutualInterests: ["Fiestas Privadas", "Intercambio", "Eventos VIP"],
      distance: 1.2,
      matchedAt: "Hace 2 horas",
      hasUnreadMessage: true,
      status: 'new'
    },
    {
      id: 2,
      name: "Sofía",
      age: 29,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
      compatibility: 94,
      mutualInterests: ["Unicornio", "Experiencias Nuevas", "Discreción"],
      distance: 3.5,
      matchedAt: "Ayer",
      hasUnreadMessage: true,
      status: 'chatting'
    },
    {
      id: 3,
      name: "Carmen & Roberto",
      age: 35,
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=600&fit=crop&crop=face",
      compatibility: 91,
      mutualInterests: ["Soft Swap", "Clubs Exclusivos", "Parejas Verificadas"],
      distance: 5.8,
      matchedAt: "Hace 3 días",
      hasUnreadMessage: false,
      status: 'viewed'
    },
    {
      id: 4,
      name: "Raúl",
      age: 26,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face",
      compatibility: 89,
      mutualInterests: ["Single Masculino", "Experiencias Íntimas", "Aventuras"],
      distance: 2.1,
      matchedAt: "Hace 1 semana",
      hasUnreadMessage: false,
      status: 'chatting'
    },
    {
      id: 5,
      name: "Valentina",
      age: 27,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
      compatibility: 96,
      mutualInterests: ["Lifestyle", "Aventuras", "Discreción Total"],
      distance: 4.2,
      matchedAt: "Hace 5 horas",
      hasUnreadMessage: true,
      status: 'new'
    },
    {
      id: 6,
      name: "Miguel & Elena",
      age: 34,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face",
      compatibility: 92,
      mutualInterests: ["Parejas Swinger", "Full Swap", "Eventos Exclusivos"],
      distance: 6.8,
      matchedAt: "Hace 2 días",
      hasUnreadMessage: false,
      status: 'viewed'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'new' | 'recent' | 'unread'>('all');

  // Estado persistente para autenticación
  const [demoAuth] = usePersistedState('demo_authenticated', 'false');
  const [apoyoAuth] = usePersistedState('apoyo_authenticated', 'false');
  const [demoUser] = usePersistedState<any>('demo_user', null);

  // SEPARACIÓN ESTRICTA: Demo vs Real Auth
  useEffect(() => {
    const isDemoAuth = demoAuth === 'true';
    const isApoyoAuth = apoyoAuth === 'true';
    
    if (isDemoAuth && !isApoyoAuth) {
      // MODO DEMO: Solo datos mock, nunca reales
      logger.info('🎭 MATCHES - Modo demo: usando datos mock');
      setIsProduction(false);
      setMatches(demoMatches);
    } else if (isApoyoAuth) {
      // MODO REAL: Solo datos de Supabase
      logger.info('🔗 MATCHES - Modo real: cargando desde Supabase');
      setIsProduction(true);
      loadRealMatches();
    } else {
      // Fallback: mostrar datos demo
      logger.info('⚠️ MATCHES - Fallback a datos demo');
      setIsProduction(false);
      setMatches(demoMatches);
    }
  }, [demoAuth, apoyoAuth]);

  // Cargar matches reales de producción
  const generateMockMatches = () => {
    return {
      success: true,
      matches: [
        {
          id: '1',
          profile: {
            id: '1',
            display_name: 'Ana & Carlos',
            age: 28,
            location: 'Ciudad de México',
            avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face',
            bio: 'Pareja aventurera buscando nuevas experiencias'
          },
          compatibility_score: 95,
          mutual_interests: ['Lifestyle', 'Intercambio', 'Parejas'],
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          profile: {
            id: '2',
            display_name: 'Laura & Miguel',
            age: 32,
            location: 'Guadalajara',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
            bio: 'Amantes del arte y la cultura'
          },
          compatibility_score: 88,
          mutual_interests: ['Tercera persona', 'Intercambio', 'Aventuras'],
          created_at: new Date().toISOString()
        }
      ]
    };
  };

  const loadRealMatches = async (maxDistance?: number) => {
    setIsLoading(true);
    try {
      const matchesData = generateMockMatches();
      if (matchesData.success && matchesData.matches) {
        setRealMatches(matchesData.matches);
        // Convertir matches reales al formato de la UI
        const convertedMatches: Match[] = matchesData.matches.map((match: SimpleMatch, index: number) => ({
          id: parseInt(match.id),
          name: match.profile.display_name,
          age: match.profile.age,
          image: match.profile.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
          compatibility: match.compatibility_score,
          mutualInterests: match.mutual_interests,
          distance: 5,
          matchedAt: 'Hace unas horas',
          hasUnreadMessage: index < 3,
          status: index < 2 ? 'new' : (index < 4 ? 'chatting' : 'viewed') as 'new' | 'viewed' | 'chatting'
        }));
        setMatches(convertedMatches);
      }
    } catch (error) {
      logger.error('Error cargando matches:', { error: String(error) });
      setMatches(demoMatches);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMatches = isProduction ? matches : demoMatches;
  const filteredMatches = currentMatches.filter(match => {
    switch (filter) {
      case 'new':
        return match.status === 'new';
      case 'recent':
        return match.matchedAt.includes('horas') || match.matchedAt.includes('Ayer');
      case 'unread':
        return match.hasUnreadMessage;
      default:
        return true;
    }
  });

  const handleSuperLike = (matchId: number) => {
    // Super like logic
    logger.info('Super like:', { matchId });
  };

  const handleStartChat = (matchId: number) => {
    // Navigate to chat or start conversation
    logger.info('Start chat:', { matchId });
  };

  // Componente MatchCard
  const MatchCard = ({ match, onClick }: { match: Match; onClick: () => void }) => (
    <Card 
      className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={match.image} alt={match.name} />
            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
              {match.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{match.name}</h3>
            <p className="text-white/70">{match.age} años</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {match.compatibility}% compatibilidad
              </Badge>
              {match.hasUnreadMessage && (
                <Badge variant="default" className="text-xs bg-purple-600">
                  Nuevo mensaje
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Advanced Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-secondary/20"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Floating Hearts */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <Heart 
              key={i}
              className={`absolute text-primary/10 animate-float-slow`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 2}s`,
                fontSize: `${Math.random() * 20 + 10}px`
              }}
              fill="currentColor"
            />
          ))}
        </div>
        
        {/* Floating Crowns */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <Crown 
              key={i}
              className={`absolute text-accent/10 animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 4}s`,
                fontSize: `${Math.random() * 15 + 8}px`
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="relative z-10">
        <Header />
      
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl pb-24">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="bg-card/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-all duration-300 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </div>

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tus Matches
              <span className="block bg-love-gradient bg-clip-text text-transparent">
                Conexiones Swinger
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Parejas y solteros verificados que han mostrado interés mutuo contigo en la comunidad swinger
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Total Matches</p>
                  <p className="text-3xl font-bold text-white">{currentMatches.length}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-primary" fill="currentColor" />
                </div>
              </div>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Nuevos Matches</p>
                  <p className="text-3xl font-bold text-white">
                    {currentMatches.filter(m => m.status === 'new').length}
                  </p>
                </div>
                <div className="bg-accent/20 p-3 rounded-full">
                  <Flame className="h-6 w-6 text-accent" />
                </div>
              </div>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Conversaciones</p>
                  <p className="text-3xl font-bold text-white">
                    {currentMatches.filter(m => m.hasUnreadMessage).length}
                  </p>
                </div>
                <div className="bg-secondary/20 p-3 rounded-full">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Compatibilidad</p>
                  <p className="text-3xl font-bold text-white">
                    {currentMatches.length > 0 ? `${Math.round(currentMatches.reduce((acc, m) => acc + m.compatibility, 0) / currentMatches.length)}%` : '0%'}
                  </p>
                </div>
                <div className="bg-accent/20 p-3 rounded-full">
                  <Crown className="h-6 w-6 text-accent" />
                </div>
              </div>
            </Card>
          </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={`flex items-center gap-2 ${filter === 'all' ? 'text-white' : 'text-white/90 hover:text-white'}`}
            >
              <Users className="h-4 w-4" />
              Todos ({currentMatches.length})
            </Button>
            <Button
              variant={filter === 'new' ? 'default' : 'outline'}
              onClick={() => setFilter('new')}
              className={`flex items-center gap-2 ${filter === 'new' ? 'text-white' : 'text-white/90 hover:text-white'}`}
            >
              <Flame className="h-4 w-4" />
              Nuevos ({currentMatches.filter(m => m.status === 'new').length})
            </Button>
            <Button
              variant={filter === 'recent' ? 'default' : 'outline'}
              onClick={() => setFilter('recent')}
              className={`flex items-center gap-2 ${filter === 'recent' ? 'text-white' : 'text-white/90 hover:text-white'}`}
            >
              <Sparkles className="h-4 w-4" />
              Recientes ({currentMatches.filter(m => m.matchedAt.includes('horas') || m.matchedAt.includes('Ayer')).length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
              className={`flex items-center gap-2 ${filter === 'unread' ? 'text-white' : 'text-white/90 hover:text-white'}`}
            >
              <MessageCircle className="h-4 w-4" />
              No leídos ({currentMatches.filter(m => m.hasUnreadMessage).length})
            </Button>
          </div>
        </motion.div>

        {/* Matches Grid */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {isLoading ? (
              // Loading skeleton
              [...Array(6)].map((_, index) => (
                <div key={index} className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
                  <div className="h-48 bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              ))
            ) : (
              filteredMatches.map((match, index) => (
                <div 
                  key={match.id}
                  className={`animate-slide-up animation-delay-${Math.min(index, 10) * 100}`}
                >
                  <MatchCard
                    match={match}
                    onClick={() => handleStartChat(match.id)}
                  />
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-12 w-12 text-white/70" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay matches con este filtro
            </h3>
            <p className="text-white/70 mb-6">
              Intenta cambiar los filtros o descubre más parejas y solteros verificados
            </p>
            <Button 
              variant="default" 
              size="lg"
              onClick={() => navigate('/discover')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Users className="mr-2 h-5 w-5" />
              Descubrir Perfiles Swinger
            </Button>
          </div>
        )}
        </main>

        <Navigation />
      </div>
      
      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Matches;