import { useState, useEffect } from "react";
import HeaderNav from "@/components/HeaderNav";
import Navigation from "@/components/Navigation";
import { MatchCard } from "@/components/ui/MatchCard";
// import { ProfileCard } from "@/profiles/shared/ProfileCard"; // No usado actualmente
// import { UnifiedTabs } from "@/components/ui/UnifiedTabs";
import { UnifiedButton } from "@/components/ui/UnifiedButton";
import { UnifiedCard } from "@/components/ui/UnifiedCard";
import { Heart, MessageCircle, Sparkles, ArrowLeft, Flame, Users, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { logger } from '@/lib/logger';
import { useAuth } from '@/features/auth/useAuth';
import { safeGetItem } from '@/utils/safeLocalStorage';

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
  const { isAuthenticated } = useAuth();
  const [_matches, _setMatches] = useState<Match[]>([]);
  const [_isProduction, _setIsProduction] = useState(false);
  const [isLoading] = useState(false);
  
  // Verificar si hay sesin activa (demo o produccin)
  const hasActiveSession = typeof isAuthenticated === 'function' ? isAuthenticated() : !!isAuthenticated;
  const [demoMatches] = useState<Match[]>([
    {
      id: 1,
      name: "Anabella & Julio",
      age: 32,
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face",
      compatibility: 98,
      mutualInterests: ["Fiestas Privadas", "Intercambio", "Eventos VIP"],
      distance: 1.2,
      matchedAt: "Hace 2 horas",
      hasUnreadMessage: true,
      status: 'new'
    },
    {
      id: 2,
      name: "Sofa",
      age: 29,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face&v=2",
      compatibility: 94,
      mutualInterests: ["Unicornio", "Experiencias Nuevas", "Discrecin"],
      distance: 3.5,
      matchedAt: "Ayer",
      hasUnreadMessage: true,
      status: 'chatting'
    },
    {
      id: 3,
      name: "Carmen & Roberto",
      age: 35,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
      compatibility: 91,
      mutualInterests: ["Intercambio Suave", "Clubs Exclusivos", "Parejas Verificadas"],
      distance: 5.8,
      matchedAt: "Hace 3 das",
      hasUnreadMessage: false,
      status: 'viewed'
    },
    {
      id: 4,
      name: "Ral",
      age: 26,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face",
      compatibility: 89,
      mutualInterests: ["Single Masculino", "Experiencias ntimas", "Aventuras"],
      distance: 2.1,
      matchedAt: "Hace 1 semana",
      hasUnreadMessage: false,
      status: 'chatting'
    },
    {
      id: 5,
      name: "Valentina",
      age: 27,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
      compatibility: 96,
      mutualInterests: ["Lifestyle", "Aventuras", "Discrecin Total"],
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
      mutualInterests: ["Parejas Swinger", "Intercambio Completo", "Eventos Exclusivos"],
      distance: 6.8,
      matchedAt: "Hace 2 das",
      hasUnreadMessage: false,
      status: 'viewed'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'new' | 'recent' | 'unread'>('all');

  // Detectar modo de operacin (demo vs produccin)
  useEffect(() => {
    const demoAuth = safeGetItem<string>('demo_authenticated', { validate: true, defaultValue: 'false' });
    const isDemo = demoAuth === 'true';
    // _setIsProduction(!isDemo); // Commented out - variable not used

    // SIEMPRE usar datos demo para respetar la lgica de negocio
    // No cargar datos reales hasta que el sistema est completamente implementado
    // setMatches(demoMatches); // Commented out - variable not used
    logger.info('?? Matches demo cargados (respetando lgica de negocio):', { count: demoMatches.length, isDemo });
  }, []);

  const currentMatches = demoMatches; // Siempre usar datos demo para respetar lgica de negocio
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
        {hasActiveSession ? <Navigation /> : <HeaderNav />}
      
        <main className={`container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl ${hasActiveSession ? 'pt-4' : 'pt-24'}`}>
          {/* Back Button */}
          <div className="mb-6">
            <UnifiedButton 
              variant="outline" 
              onClick={() => navigate('/')}
              className="bg-gray-800/50 backdrop-blur-sm border-gray-600 hover:bg-gray-700/50 transition-all duration-300 text-gray-200 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </UnifiedButton>
          </div>

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Tus Matches
              <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
                Conexiones Swinger
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
              Parejas y solteros verificados que han mostrado inters mutuo contigo en la comunidad swinger
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <UnifiedCard className="bg-white/5 backdrop-blur-sm border-white/10 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-200 font-medium">Total Matches</p>
                  <p className="text-3xl font-bold text-white drop-shadow-lg">{currentMatches.length}</p>
                </div>
                <div className="bg-purple-500/30 p-3 rounded-full shadow-md">
                  <Heart className="h-6 w-6 text-purple-300" fill="currentColor" />
                </div>
              </div>
            </UnifiedCard>

            <UnifiedCard className="bg-white/5 backdrop-blur-sm border-white/10 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-200 font-medium">Nuevos Matches</p>
                  <p className="text-3xl font-bold text-white drop-shadow-lg">
                    {currentMatches.filter(m => m.status === 'new').length}
                  </p>
                </div>
                <div className="bg-orange-500/30 p-3 rounded-full shadow-md">
                  <Flame className="h-6 w-6 text-orange-300" />
                </div>
              </div>
            </UnifiedCard>

            <UnifiedCard className="bg-white/5 backdrop-blur-sm border-white/10 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-200 font-medium">Conversaciones</p>
                  <p className="text-3xl font-bold text-white drop-shadow-lg">
                    {currentMatches.filter(m => m.hasUnreadMessage).length}
                  </p>
                </div>
                <div className="bg-blue-500/30 p-3 rounded-full shadow-md">
                  <MessageCircle className="h-6 w-6 text-blue-300" />
                </div>
              </div>
            </UnifiedCard>

            <UnifiedCard className="bg-white/5 backdrop-blur-sm border-white/10 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-200 font-medium">Compatibilidad</p>
                  <p className="text-3xl font-bold text-white drop-shadow-lg">
                    {currentMatches.length > 0 ? `${Math.round(currentMatches.reduce((acc, m) => acc + m.compatibility, 0) / currentMatches.length)}%` : '0%'}
                  </p>
                </div>
                <div className="bg-yellow-500/30 p-3 rounded-full shadow-md">
                  <Crown className="h-6 w-6 text-yellow-300" />
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
              className={`flex items-center gap-2 ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-lg' 
                  : 'bg-gray-800/50 text-gray-200 border-gray-600 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              Todos ({currentMatches.length})
            </UnifiedButton>
            <UnifiedButton
              variant={filter === 'new' ? 'default' : 'outline'}
              onClick={() => setFilter('new')}
              className={`flex items-center gap-2 ${
                filter === 'new' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-lg' 
                  : 'bg-gray-800/50 text-gray-200 border-gray-600 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <Flame className="h-4 w-4" />
              Nuevos ({currentMatches.filter(m => m.status === 'new').length})
            </UnifiedButton>
            <UnifiedButton
              variant={filter === 'recent' ? 'default' : 'outline'}
              onClick={() => setFilter('recent')}
              className={`flex items-center gap-2 ${
                filter === 'recent' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-lg' 
                  : 'bg-gray-800/50 text-gray-200 border-gray-600 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Recientes ({currentMatches.filter(m => m.matchedAt.includes('horas') || m.matchedAt.includes('Ayer')).length})
            </UnifiedButton>
            <UnifiedButton
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
              className={`flex items-center gap-2 ${
                filter === 'unread' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-lg' 
                  : 'bg-gray-800/50 text-gray-200 border-gray-600 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              No ledos ({currentMatches.filter(m => m.hasUnreadMessage).length})
            </UnifiedButton>
          </div>
        </motion.div>

        {/* Matches Grid */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {isLoading ? (
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
            <div className="bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 shadow-lg border border-purple-300/20 transition-all duration-300 hover:scale-105">
              <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-white/70" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              No hay matches con este filtro
            </h3>
            <p className="text-sm sm:text-base text-white/70 mb-6 max-w-md mx-auto">
              Intenta cambiar los filtros o descubre ms parejas y solteros verificados
            </p>
            <UnifiedButton 
              variant="love" 
              size="lg"
              gradient={true}
              onClick={() => navigate('/discover')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:from-purple-700 hover:to-blue-700"
            >
              <Users className="mr-2 h-5 w-5" />
              Descubrir Perfiles Swinger
            </UnifiedButton>
          </div>
        )}
        </main>
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