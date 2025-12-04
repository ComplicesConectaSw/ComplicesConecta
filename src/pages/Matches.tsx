import { useState, useEffect } from "react";
import HeaderNav from "@/components/HeaderNav";
import { Heart, MessageCircle, User, Flame, Users, Crown, Sparkles } from "lucide-react";
// useNavigate removido por no utilizarse
import { motion } from "framer-motion";
import { logger } from '@/lib/logger';
import { useAuth } from '@/features/auth/useAuth';
import { safeGetItem } from '@/utils/safeLocalStorage';
import { SafeImage } from '@/components/ui/SafeImage';

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
  const { isAuthenticated: _isAuthenticated } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading] = useState(false);
  
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

    // SIEMPRE usar datos demo para respetar la lgica de negocio
    // No cargar datos reales hasta que el sistema est completamente implementado
    setTimeout(() => {
      setMatches(demoMatches);
      logger.info('?? Matches demo cargados (respetando lgica de negocio):', { count: demoMatches.length, isDemo });
    }, 0);
  }, []);

  const currentMatches = matches; // Siempre usar datos demo para respetar lgica de negocio
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

  const handleStartChat = (matchId: number) => {
    // Navigate to chat or start conversation
    logger.info('Start chat:', { matchId });
  };

  const handleViewProfile = (matchId: number) => {
    // Navigate to profile
    logger.info('View profile:', { matchId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 p-4 sm:p-6">
      <HeaderNav />
      
      <main className="max-w-6xl mx-auto mt-6 space-y-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tarjeta de nuevos matches */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Nuevos Matches</p>
                <p className="text-2xl font-bold text-white">
                  {currentMatches.filter(m => m.status === 'new').length}
                </p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-full">
                <Flame className="h-5 w-5 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Tarjeta de conversaciones */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Conversaciones</p>
                <p className="text-2xl font-bold text-white">
                  {currentMatches.filter(m => m.hasUnreadMessage).length}
                </p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-full">
                <MessageCircle className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Tarjeta de compatibilidad */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Compatibilidad</p>
                <p className="text-2xl font-bold text-white">
                  {currentMatches.length > 0 
                    ? `${Math.round(currentMatches.reduce((acc, m) => acc + m.compatibility, 0) / currentMatches.length)}%` 
                    : '0%'}
                </p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <Crown className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'all', label: 'Todos', icon: Users, count: currentMatches.length },
              { 
                id: 'new', 
                label: 'Nuevos', 
                icon: Flame, 
                count: currentMatches.filter(m => m.status === 'new').length 
              },
              { 
                id: 'recent', 
                label: 'Recientes', 
                icon: Sparkles, 
                count: currentMatches.filter(m => m.matchedAt.includes('horas') || m.matchedAt.includes('Ayer')).length 
              },
              { 
                id: 'unread', 
                label: 'No leídos', 
                icon: MessageCircle, 
                count: currentMatches.filter(m => m.hasUnreadMessage).length 
              }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
                  filter === item.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-200 hover:bg-gray-700/50 border border-gray-600/50'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid de Matches */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800/30 rounded-2xl p-4 animate-pulse h-80">
                <div className="bg-gray-700/50 rounded-lg h-48 mb-4"></div>
                <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match, _) => (
              <MatchCard 
                key={match.id}
                match={match}
                onMessage={handleStartChat}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-dashed border-gray-700/50">
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-purple-400/50" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No hay matches</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              No se encontraron coincidencias con los filtros actuales. Intenta ajustar tus preferencias.
            </p>
            <button 
              onClick={() => setFilter('all')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Ver todos los matches
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

// Componente MatchCard mejorado
const MatchCard = ({ 
  match, 
  onMessage, 
  onViewProfile 
}: { 
  match: Match;
  onMessage: (id: number) => void;
  onViewProfile: (id: number) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 group"
    >
      {/* Imagen de perfil */}
      <div className="relative h-64 overflow-hidden">
        <SafeImage
          src={match.image}
          alt={match.name}
          fallbackType="avatar"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badge de estado */}
        {match.status === 'new' && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>
            NUEVO
          </div>
        )}
        
        {/* Overlay de información */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xl font-bold text-white">{match.name}</h3>
              <div className="flex items-center text-sm text-gray-200">
                <span>{match.age} años</span>
                <span className="mx-2">•</span>
                <span>{match.distance} km</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white">
              {match.compatibility}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenido de la tarjeta */}
      <div className="p-4">
        {/* Intereses en común */}
        <div className="flex flex-wrap gap-2 mb-4">
          {match.mutualInterests.slice(0, 3).map((interest, i) => (
            <span 
              key={i}
              className="text-xs bg-purple-900/40 text-purple-100 px-3 py-1 rounded-full border border-purple-500/20"
            >
              {interest}
            </span>
          ))}
          {match.mutualInterests.length > 3 && (
            <span className="text-xs bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full">
              +{match.mutualInterests.length - 3}
            </span>
          )}
        </div>
        
        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={() => onMessage(match.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              match.hasUnreadMessage
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg'
                : 'bg-gray-700/50 text-gray-200 hover:bg-gray-600/50 border border-gray-600/30'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            {match.hasUnreadMessage ? 'Nuevo mensaje' : 'Mensaje'}
          </button>
          
          <button
            onClick={() => onViewProfile(match.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30 transition-all"
          >
            <User className="h-4 w-4" />
            Ver perfil
          </button>
        </div>
        
        {/* Fecha del match */}
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-400">Conectado {match.matchedAt.toLowerCase()}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Matches;
