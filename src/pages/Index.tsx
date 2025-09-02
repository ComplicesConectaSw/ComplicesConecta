import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ProfileCard } from "@/components/ProfileCard";
import { Footer } from "@/components/Footer";
import { BetaBanner } from "@/components/BetaBanner";
import { LoadingScreen } from "@/components/LoadingScreen";
import { WelcomeModal } from "@/components/WelcomeModal";
import Navigation from "@/components/Navigation";
import { Heart, Users, Shield, Zap, Sparkles, Star, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

// Professional profile images from Unsplash - Production ready
// Removed local imports that fail in production

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // Verificar si el usuario está autenticado (sin redirección automática)
  useEffect(() => {
    // Solo verificar autenticación sin redirigir automáticamente
    const demoAuth = localStorage.getItem('demo_authenticated');
    const demoUser = localStorage.getItem('demo_user');
    
    // Remover redirección automática para permitir acceso al Index
    // Los usuarios pueden navegar manualmente a donde deseen
  }, [navigate]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    const hasVisited = localStorage.getItem('hasVisitedComplicesConecta');
    if (!hasVisited) {
      setTimeout(() => setShowWelcome(true), 500);
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    localStorage.setItem('hasVisitedComplicesConecta', 'true');
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }
  // Professional sample profiles for presentation
  const sampleProfiles = [
    {
      id: 1,
      name: "Laura",
      age: 29,
      location: "Madrid",
      interests: ["Senderismo", "Arte Moderno", "Cocina Vegana"],
      image: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=500&h=700&fit=crop&crop=faces",
      rating: 4.9,
      isOnline: true,
      bio: "Apasionada por la naturaleza y la creatividad. Buscando a alguien con quien compartir aventuras y conversaciones profundas.",
      profession: "Arquitecta",
      verified: true
    },
    {
      id: 2,
      name: "Javier",
      age: 34,
      location: "Barcelona",
      interests: ["Navegación", "Finanzas", "Golf"],
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=700&fit=crop&crop=faces",
      rating: 4.8,
      isOnline: false,
      bio: "Emprendedor y amante del mar. Disfruto de un buen vino y una compañía inteligente.",
      profession: "Consultor Financiero",
      verified: true
    },
    {
      id: 3,
      name: "Isabella",
      age: 27,
      location: "Sevilla",
      interests: ["Baile Flamenco", "Historia", "Literatura"],
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&h=700&fit=crop&crop=faces",
      rating: 4.9,
      isOnline: true,
      bio: "Explorando la riqueza cultural de Andalucía. Me encanta perderme en libros y descubrir nuevos lugares.",
      profession: "Historiadora del Arte",
      verified: true
    },
    {
      id: 4,
      name: "Mateo",
      age: 31,
      location: "Valencia",
      interests: ["Ciclismo", "Tecnología", "Paella"],
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&h=700&fit=crop&crop=faces",
      rating: 4.7,
      isOnline: true,
      bio: "Ingeniero de software con alma de chef. Siempre en busca del equilibrio perfecto entre código y sabor.",
      profession: "Desarrollador de Software",
      verified: true
    }
  ];

  const features = [
    {
      icon: Heart,
      title: "Conexiones Auténticas",
      description: "Algoritmo inteligente que conecta personas con intereses reales en común"
    },
    {
      icon: Shield,
      title: "Verificación KYC Avanzada",
      description: "Perfiles verificados con tecnología blockchain y KYC para máxima seguridad y confianza"
    },
    {
      icon: Users,
      title: "Eventos Swinger Exclusivos",
      description: "Accede a fiestas privadas, encuentros y eventos exclusivos para la comunidad swinger"
    },
    {
      icon: Zap,
      title: "Sistema de Tokens CMPX/GTK",
      description: "Gana tokens participando, accede a funciones premium y eventos VIP"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-hero-gradient">
      {/* Fixed closing div tag */}
      {/* Advanced Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Base Gradient - Removed to use main bg-hero-gradient */}
        
        {/* Animated Mesh Gradient */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-gradient-x"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-secondary/10 to-primary/15 animate-gradient-y"></div>
        </div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-40 right-32 w-48 h-48 bg-accent/8 rounded-full blur-2xl animate-float-reverse"></div>
          <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-secondary/4 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 right-20 w-56 h-56 bg-primary/6 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
          
          {/* Hexagonal Patterns */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 transform rotate-45 animate-spin-slow blur-xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-secondary/15 to-primary/10 transform rotate-12 animate-pulse blur-lg"></div>
        </div>
        
        {/* Particle Effects */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Glowing Icons */}
        <Heart className="absolute top-32 left-1/4 w-8 h-8 text-primary/20 animate-float" fill="currentColor" style={{ animationDelay: '0.5s' }} />
        <Sparkles className="absolute top-1/3 right-1/4 w-6 h-6 text-accent/25 animate-float" style={{ animationDelay: '1.2s' }} />
        <Star className="absolute bottom-1/3 left-1/5 w-7 h-7 text-secondary/20 animate-float" style={{ animationDelay: '2s' }} />
        <Rocket className="absolute bottom-1/4 right-1/5 w-9 h-9 text-primary/15 animate-float" style={{ animationDelay: '0.8s' }} />
        <Users className="absolute top-1/2 left-1/6 w-8 h-8 text-accent/20 animate-float" style={{ animationDelay: '1.5s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <BetaBanner />
        <div className="pt-16"> {/* Add padding for fixed banner */}
          <Header />
        </div>
      </div>
      
      <main>
        <HeroSection />
        
        {/* Featured Profiles Section */}
        <section className="py-10 sm:py-20 relative">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="relative">
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-white mb-6 animate-fade-in relative z-10">
                  <span className="bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
                    Cómplices
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent animate-pulse drop-shadow-2xl">
                    Conecta
                  </span>
                </h1>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-red-500/20 blur-3xl animate-pulse" />
              </div>
              
              <p className="text-xl md:text-2xl text-white/95 max-w-4xl mx-auto leading-relaxed animate-slide-up font-medium">
                La plataforma <strong className="text-pink-300">más exclusiva</strong> para la comunidad lifestyle mexicana.
                <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                  Conexiones auténticas, experiencias únicas.
                </span>
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {sampleProfiles.map((profile, index) => (
                <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                  <ProfileCard 
                    profile={profile} 
                    onLike={() => {}} 
                    onSuperLike={() => {}} 
                  />
                </div>
              ))}
            </div>
            
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                ¿Por qué elegir ComplicesConecta?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                La plataforma más segura y discreta para la comunidad swinger. Conectamos parejas y solteros 
                con verificación avanzada, tecnología blockchain y total privacidad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                  <div className="bg-card-gradient rounded-2xl p-8 shadow-soft hover:shadow-glow transition-all duration-300">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-card-foreground mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-love-gradient relative overflow-hidden">
          {/* Enhanced CTA Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 via-accent/30 to-secondary/20 animate-gradient-x"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10 max-w-6xl">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                ¿Listos para explorar juntos?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Únete a la comunidad swinger más exclusiva y segura. Parejas y solteros verificados esperándote
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="xl" className="bg-white text-primary hover:bg-white/90" asChild>
                  <Link to="/auth">
                    <Heart className="mr-2 h-5 w-5" fill="currentColor" />
                    Crear Cuenta Gratis
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="xl" 
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                  asChild
                >
                  <a href="https://github.com/ComplicesConectaSw/complicesconectasw/releases/download/v.1.1/app-release.apk" download>
                    Descargar App
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Navigation />
      {showWelcome && <WelcomeModal isOpen={showWelcome} onClose={handleWelcomeClose} />}
      
      <style>{`
        @keyframes gradient-x {
          0%, 100% { transform: translateX(-50%); }
          50% { transform: translateX(50%); }
        }
        
        @keyframes gradient-y {
          0%, 100% { transform: translateY(-50%); }
          50% { transform: translateY(50%); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(15px) translateX(-10px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-gradient-x {
          animation: gradient-x 8s ease-in-out infinite;
        }
        
        .animate-gradient-y {
          animation: gradient-y 6s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-reverse {
          animation: float-reverse 6s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Index;