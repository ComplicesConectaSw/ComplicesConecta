import { useState, useEffect } from "react";
// import { Header } from "@/components/Header";
import NavigationEnhanced from "@/components/NavigationEnhanced";
import { MatchCard } from "@/components/ui/MatchCard";
import { UnifiedButton } from "@/components/ui/UnifiedButton";
import { UnifiedCard } from "@/components/ui/UnifiedCard";
import { Heart, MessageCircle, Sparkles, ArrowLeft, Flame, Users, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { simpleMatchService, SimpleMatch } from "@/lib/simpleMatches";
import { motion } from "framer-motion";
import { logger } from '@/lib/logger';

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

const Matches = () => {
  const navigate = useNavigate();
  const [_matches, _setMatches] = useState<Match[]>([]);
  const [_realMatches, _setRealMatches] = useState<SimpleMatch[]>([]);
  const [_isProduction, _setIsProduction] = useState(false);
  const [_isLoading, _setIsLoading] = useState(false);
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

  // Detectar modo de operación (demo vs producción)
  useEffect(() => {
    const demoAuth = localStorage.getItem('demo_authenticated');
    const isDemo = demoAuth === 'true';
    _setIsProduction(!isDemo);

    // SIEMPRE usar datos demo para respetar la lógica de negocio
    // No cargar datos reales hasta que el sistema esté completamente implementado
    _setMatches(demoMatches);
    logger.info('🎭 Matches demo cargados (respetando lógica de negocio):', { count: demoMatches.length, isDemo });
  }, []);

  // Cargar matches reales de producción
  const _loadRealMatches = async (maxDistance?: number) => {
    _setIsLoading(true);
    try {
      const result = await simpleMatchService.getMatches(20, maxDistance);
      if (result.success && result.matches) {
        _setRealMatches(result.matches);
        // Convertir matches reales al formato de la UI
        const convertedMatches: Match[] = result.matches.map((match, index) => ({
          id: parseInt(match.id),
          name: match.name,
          age: match.age,
          image: match.images[0] || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
          compatibility: match.compatibility,
          mutualInterests: match.reasons,
          distance: match.distance,
          matchedAt: match.lastSeen.includes('T') ? 'Hace unas horas' : match.lastSeen,
          hasUnreadMessage: match.isOnline,
          status: index < 2 ? 'new' : (index < 4 ? 'chatting' : 'viewed') as 'new' | 'viewed' | 'chatting'
        }));
        _setMatches(convertedMatches);
      }
    } catch (error) {
      logger.error('Error cargando matches:', { error: String(error) });
      // Fallback a datos demo en caso de error
      _setMatches(demoMatches);
    } finally {
      _setIsLoading(false);
    }
  };

  const currentMatches = demoMatches; // Siempre usar datos demo para respetar lógica de negocio
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
        <NavigationEnhanced />
      
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl pb-24">
          {/* Back Button */}
          <div className="mb-6">
            <UnifiedButton 
              variant="outline" 
              onClick={() => navigate('/')}
              className="bg-card/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-all duration-300 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </UnifiedButton>
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
            <UnifiedCard className="bg-card/80 backdrop-blur-sm border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Total Matches</p>
                  <p className="text-3xl font-bold text-white">{currentMatches.length}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-primary" fill="currentColor" />
                </div>
              </div>
            </UnifiedCard>

            <UnifiedCard className="bg-card/80 backdrop-blur-sm border-primary/10">
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
            </UnifiedCard>

            <UnifiedCard className="bg-card/80 backdrop-blur-sm border-primary/10">
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
            </UnifiedCard>

            <UnifiedCard className="bg-card/80 backdrop-blur-sm border-primary/10">
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
            </UnifiedCard>
          </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <UnifiedButton
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={`flex items-center gap-2 ${filter === 'all' ? 'text-white' : 'text-white/90 hover:text-white'}`}
            >
              <Users className="h-4 w-4" />
              Todos ({currentMatches.length})
            </UnifiedButton>
            <UnifiedButton
              variant={filter === 'new' ? 'default' : 'outline'}
              onClick={() => setFilter('new')}
              className={`flex items-center gap-2 ${filter === 'new' ? 'text-white' : 'text-white/90 hover:text-white'}`}
            >
              <Flame className="h-4 w-4" />
              Nuevos ({currentMatches.filter(m => m.status === 'new').length})
            </UnifiedButton>
            <UnifiedButton
              variant={filter === 'recent' ? 'default' : 'outline'}
              onClick={() => setFilter('recent')}
              className={`flex items-center gap-2 ${filter === 'recent' ? 'text-white' : 'text-white/90 hover:text-white'}`}
            >
              <Sparkles className="h-4 w-4" />
              Recientes ({currentMatches.filter(m => m.matchedAt.includes('horas') || m.matchedAt.includes('Ayer')).length})
            </UnifiedButton>
            <UnifiedButton
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
              className={`flex items-center gap-2 ${filter === 'unread' ? 'text-white' : 'text-white/90 hover:text-white'}`}
            >
              <MessageCircle className="h-4 w-4" />
              No leídos ({currentMatches.filter(m => m.hasUnreadMessage).length})
            </UnifiedButton>
          </div>
        </motion.div>

        {/* Matches Grid */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {_isLoading ? (
              // Loading skeleton
              [...Array(6)].map((_, index) => (
                <div key={index} className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 animate-pulse transition-all duration-300">
                  <div className="h-40 sm:h-48 bg-muted rounded-lg mb-4"></div>
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
                    id={match.id.toString()}
                    name={match.name}
                    age={match.age}
                    avatar={match.image}
                    compatibility={match.compatibility}
                    distance={match.distance}
                    reasons={match.mutualInterests}
                    verified={match.status === 'new'}
                    accountType={match.name.includes('&') ? 'couple' : 'single'}
                    variant="grid"
                    onLike={() => handleStartChat(match.id)}
                    onPass={() => logger.info('Pass:', { matchId: match.id })}
                    onSuperLike={() => handleSuperLike(match.id)}
                  />
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 shadow-lg border border-purple-300/20 transition-all duration-300 hover:scale-105">
              <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-white/70" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              No hay matches con este filtro
            </h3>
            <p className="text-sm sm:text-base text-white/70 mb-6 max-w-md mx-auto">
              Intenta cambiar los filtros o descubre más parejas y solteros verificados
            </p>
            <UnifiedButton 
              variant="love" 
              size="lg"
              gradient={true}
              onClick={() => navigate('/discover')}
            >
              <Users className="mr-2 h-5 w-5" />
              Descubrir Perfiles Swinger
            </UnifiedButton>
          </div>
        )}
        </main>

        <NavigationEnhanced />
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