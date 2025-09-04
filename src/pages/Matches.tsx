import { useState } from "react";
import { Header } from "@/components/Header";
import Navigation from "@/components/Navigation";
import { MatchCard } from "@/components/matches/MatchCard";
import { MatchFilters } from "@/components/matches/MatchFilters";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Sparkles, ArrowLeft, Flame, Users, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [matches, setMatches] = useState<Match[]>([
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

  const filteredMatches = matches.filter(match => {
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
    console.log('Super like:', matchId);
  };

  const handleStartChat = (matchId: number) => {
    // Navigate to chat or start conversation
    console.log('Start chat:', matchId);
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
            <p className="text-xl text-white max-w-2xl mx-auto">
              Parejas y solteros verificados que han mostrado interés mutuo contigo en la comunidad swinger
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Matches</p>
                  <p className="text-3xl font-bold text-card-foreground">{matches.length}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-primary" fill="currentColor" />
                </div>
              </div>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nuevos Matches</p>
                  <p className="text-3xl font-bold text-card-foreground">
                    {matches.filter(m => m.status === 'new').length}
                  </p>
                </div>
                <div className="bg-accent/20 p-3 rounded-full">
                  <Flame className="h-6 w-6 text-accent" />
                </div>
              </div>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversaciones</p>
                  <p className="text-3xl font-bold text-card-foreground">
                    {matches.filter(m => m.hasUnreadMessage).length}
                  </p>
                </div>
                <div className="bg-secondary/20 p-3 rounded-full">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Compatibilidad</p>
                  <p className="text-3xl font-bold text-card-foreground">
                    {matches.length > 0 ? `${Math.round(matches.reduce((acc, m) => acc + m.compatibility, 0) / matches.length)}%` : '0%'}
                  </p>
                </div>
                <div className="bg-accent/20 p-3 rounded-full">
                  <Crown className="h-6 w-6 text-accent" />
                </div>
              </div>
            </div>
          </div>

        {/* Filters */}
        <MatchFilters currentFilter={filter} onFilterChange={setFilter} />

        {/* Matches Grid */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredMatches.map((match, index) => (
              <div 
                key={match.id}
                className={`animate-slide-up animation-delay-${Math.min(index, 10) * 100}`}
              >
                <MatchCard
                  match={match}
                  onSuperLike={handleSuperLike}
                  onStartChat={handleStartChat}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-muted rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No hay matches con este filtro
            </h3>
            <p className="text-muted-foreground mb-6">
              Intenta cambiar los filtros o descubre más parejas y solteros verificados
            </p>
            <Button 
              variant="love" 
              size="lg"
              onClick={() => navigate('/discover')}
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