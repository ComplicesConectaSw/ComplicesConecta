import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeaderNav from "@/components/HeaderNav";
import { HeroSection } from "@/components/HeroSection";
import { ProfileCard } from "@/profiles/shared/MainProfileCard";
import { Footer } from "@/components/Footer";
import { BetaBanner } from "@/components/BetaBanner";
import { LoadingScreen } from "@/components/LoadingScreen";
import { WelcomeModal } from "@/components/WelcomeModal";
import { FeatureModal } from "@/components/modals/FeatureModal";
import { InstallAppModal } from "@/components/modals/InstallAppModal";
import { ActionButtonsModal } from "@/components/modals/ActionButtonsModal";
import { DecorativeHearts } from "@/components/DecorativeHearts";
// StoriesContainer removido - ya está en HeaderNav
import { Heart, Users, Shield, Zap, Smartphone as Android, Info, Briefcase, DollarSign, UserCheck } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import "@/styles/animations.css";
import { logger } from '@/lib/logger';
import { useAuth } from '@/features/auth/useAuth';
import { usePersistedState } from '@/hooks/usePersistedState';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import ModeratorApplicationForm from "@/components/forms/ModeratorApplicationForm";

import { getRandomProfileImage } from '@/lib/imageService';

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<'connections' | 'verification' | 'events' | 'tokens'>('connections');
  const [isRunningInApp, setIsRunningInApp] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showActionButtonsModal, setShowActionButtonsModal] = useState(false);
  const [showModeratorForm, setShowModeratorForm] = useState(false);

  // Estado persistente
  const [demoAuthenticated] = usePersistedState<boolean>('demo_authenticated', false);
  const [demoUser] = usePersistedState<any>('demo_user', null);
  const [hasVisited, setHasVisited] = usePersistedState<boolean>('hasVisitedComplicesConecta', false);
  
  // Autenticación real
  const { user, profile, isAuthenticated } = useAuth();
  
  // Ref para evitar múltiples ejecuciones del efecto del modal de bienvenida
  const welcomeModalChecked = useRef(false);
  const welcomeModalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref para rastrear si el timeout de loading ya se ejecutó
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutExecutedRef = useRef(false);

  // Verificar si el usuario está autenticado y detectar Android
  useEffect(() => {
    // Detectar si se está ejecutando desde la APK instalada
    const isInWebView = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      logger.info('🔍 Detectando entorno de ejecución', { userAgent: userAgent });
      // Detectar si está en un WebView de Android (APK instalada)
      return userAgent.includes('wv') || // Android WebView
             userAgent.includes('version/') && userAgent.includes('chrome/') && userAgent.includes('mobile') && !userAgent.includes('browser');
    };
    
    setIsRunningInApp(isInWebView());
    
    // CRÍTICO: Timeout garantizado para evitar que se quede en loading indefinidamente
    // Usar un solo timeout con cleanup mechanism para evitar múltiples actualizaciones de estado
    // El timeout se ejecuta solo una vez al montar el componente y se cancela si el componente se desmonta
    if (!loadingTimeoutExecutedRef.current && !loadingTimeoutRef.current) {
      loadingTimeoutRef.current = setTimeout(() => {
        // Verificar que aún estamos en loading antes de actualizar
        if (!loadingTimeoutExecutedRef.current) {
          loadingTimeoutExecutedRef.current = true;
          logger.info('⏱️ Timeout de seguridad: Forzando setIsLoading(false) y mostrar contenido');
          setIsLoading(false);
          setLoadingTimeoutPassed(true);
          loadingTimeoutRef.current = null;
        }
      }, 2000); // 2 segundos - timeout único y suficiente
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, []); // Sin dependencias - solo se ejecuta una vez al montar

  // Separar la lógica de redirección para evitar loops
  useEffect(() => {
    // Redirección para usuarios demo
    if (!isLoading && demoAuthenticated && demoUser) {
      const redirectTimer = setTimeout(() => {
        try {
          const userData = typeof demoUser === 'string' ? JSON.parse(demoUser) : demoUser;
          const accountType = userData.account_type || userData.accountType || 'single';
          
          // Redirigir al perfil correspondiente según el tipo de cuenta
          if (accountType === 'couple') {
            navigate('/profile-couple');
          } else {
            navigate('/profile-single');
          }
        } catch (error) {
          logger.error('Error parsing user data', { error });
          // Si hay error, redirigir al perfil single por defecto
          navigate('/profile-single');
        }
      }, 500);

      return () => clearTimeout(redirectTimer);
    }
    
    // Redirección para usuarios reales autenticados
    if (!isLoading && isAuthenticated() && user && profile) {
      const redirectTimer = setTimeout(() => {
        try {
          const accountType = profile.account_type || 'single';
          
          logger.info('🔄 Redirigiendo usuario real autenticado:', { 
            userId: user.id, 
            accountType,
            profileName: profile.first_name 
          });
          
          // Redirigir al perfil correspondiente según el tipo de cuenta
          if (accountType === 'couple') {
            navigate('/profile-couple');
          } else {
            navigate('/profile-single');
          }
        } catch (error) {
          logger.error('Error redirigiendo usuario real:', { error });
          // Si hay error, redirigir al perfil single por defecto
          navigate('/profile-single');
        }
      }, 500);

      return () => clearTimeout(redirectTimer);
    }
  }, [isLoading, demoAuthenticated, demoUser, isAuthenticated, user, profile, navigate]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };
  
  // Efecto para mostrar modal de bienvenida en primera visita
  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (welcomeModalTimeoutRef.current) {
      clearTimeout(welcomeModalTimeoutRef.current);
      welcomeModalTimeoutRef.current = null;
    }
    
    // Esperar a que termine el loading y luego verificar
    if (!isLoading && !welcomeModalChecked.current) {
      const checkAndShowWelcome = () => {
        // Marcar como verificado inmediatamente para evitar múltiples ejecuciones
        welcomeModalChecked.current = true;
        
        const demoAuth = localStorage.getItem('demo_authenticated') === 'true';
        const isAuth = isAuthenticated();
        
        logger.info('🔍 Verificando condiciones para modal de bienvenida:', {
          hasVisited: hasVisited,
          demoAuthenticated: demoAuth,
          isAuthenticated: isAuth,
          showWelcome: showWelcome,
          alreadyChecked: welcomeModalChecked.current
        });
        
        // Solo mostrar si no se ha visitado, no hay demo activo, no está autenticado y el modal no está ya visible
        if (!hasVisited && !demoAuth && !isAuth && !showWelcome) {
          logger.info('✅ Mostrando modal de bienvenida - Primera visita');
          welcomeModalTimeoutRef.current = setTimeout(() => {
            setShowWelcome(true);
            welcomeModalTimeoutRef.current = null;
          }, 1200);
        } else {
          logger.info('❌ Modal de bienvenida no se mostrará:', {
            reason: hasVisited ? 'Ya visitó' : demoAuth ? 'Demo activo' : isAuth ? 'Autenticado' : 'Ya mostrado'
          });
        }
      };
      
      // Ejecutar después de un pequeño delay para asegurar que el DOM esté listo
      welcomeModalTimeoutRef.current = setTimeout(checkAndShowWelcome, 800);
    }
    
    return () => {
      if (welcomeModalTimeoutRef.current) {
        clearTimeout(welcomeModalTimeoutRef.current);
        welcomeModalTimeoutRef.current = null;
      }
    };
  }, [isLoading, isAuthenticated, hasVisited]); // Removido showWelcome de dependencias para evitar loops

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    setHasVisited(true);
  };

  // CRÍTICO: Asegurar que el contenido siempre se muestre, incluso si isLoading está en true
  // Solo mostrar LoadingScreen si realmente está cargando Y no ha pasado el timeout de seguridad
  const [loadingTimeoutPassed, setLoadingTimeoutPassed] = useState(false);
  
  // Este timeout está consolidado con el timeout principal en el useEffect anterior
  // No necesita un timeout separado - se maneja junto con loadingTimeoutRef
  useEffect(() => {
    // El timeout de seguridad se maneja en el useEffect principal (líneas 65-77)
    // Solo establecer loadingTimeoutPassed cuando isLoading cambia a false
    if (!isLoading && !loadingTimeoutPassed) {
      setLoadingTimeoutPassed(true);
    }
    
    // CRÍTICO: También establecer loadingTimeoutPassed cuando el timeout se ejecuta
    // Esto asegura que el contenido se muestre incluso si isLoading no cambia
    if (loadingTimeoutExecutedRef.current && !loadingTimeoutPassed) {
      setLoadingTimeoutPassed(true);
    }
  }, [isLoading, loadingTimeoutPassed]);

  // DEBUG: Log del estado de renderizado (debe estar antes del return condicional)
  useEffect(() => {
    logger.info('📊 Estado de renderizado Index:', {
      isLoading,
      loadingTimeoutPassed,
      showWelcome,
      hasVisited,
      isAuthenticated: isAuthenticated(),
      user: !!user,
      profile: !!profile
    });
  }, [isLoading, loadingTimeoutPassed, showWelcome, hasVisited, user, profile]);

  // DEBUG: Log del renderizado del contenido principal (debe estar antes del return condicional)
  useEffect(() => {
    if (!isLoading || loadingTimeoutPassed) {
      logger.info('✅ Renderizando contenido principal de Index');
    }
  }, [isLoading, loadingTimeoutPassed]);
  
  // Solo mostrar LoadingScreen si está cargando Y el timeout de seguridad no ha pasado
  if (isLoading && !loadingTimeoutPassed) {
    logger.info('⏳ Mostrando LoadingScreen:', { isLoading, loadingTimeoutPassed });
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Professional sample profiles for presentation using dynamic image service
  const sampleProfiles = [
    {
      id: "1",
      name: "Gabriela",
      age: 29,
      location: "Ciudad de México",
      interests: ["Intercambio de Parejas", "Fiestas Privadas", "Encuentros Íntimos"],
      image: getRandomProfileImage('female', { width: 500, height: 700 }),
      rating: 4.9,
      isOnline: true,
      bio: "Apasionada por la naturaleza y la creatividad. Buscando a alguien con quien compartir aventuras y conversaciones profundas.",
      profession: "Arquitecta",
      verified: true
    },
    {
      id: "2",
      name: "Antonio",
      age: 34,
      location: "Guadalajara",
      interests: ["Experiencias Grupales", "Clubs Liberales", "Aventuras Sensuales"],
      image: getRandomProfileImage('male', { width: 500, height: 700 }),
      rating: 4.8,
      isOnline: false,
      bio: "Emprendedor y amante del mar. Disfruto de un buen vino y una compañía inteligente.",
      profession: "Consultor Financiero",
      verified: true
    },
    {
      id: "3",
      name: "Isabella",
      age: 27,
      location: "Monterrey",
      interests: ["Tantra y Sensualidad", "Juegos de Rol", "Experiencias Nuevas"],
      image: getRandomProfileImage('female', { width: 500, height: 700 }),
      rating: 4.9,
      isOnline: true,
      bio: "Explorando la riqueza cultural de México. Me encanta perderme en libros y descubrir nuevos lugares.",
      profession: "Historiadora del Arte",
      verified: true
    },
    {
      id: "4",
      name: "Mateo",
      age: 31,
      location: "Puebla",
      interests: ["Encuentros Casuales", "Fantasías Compartidas", "Vida Nocturna Liberal"],
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&h=700&fit=crop&crop=faces&auto=format&q=80",
      rating: 4.7,
      isOnline: true,
      bio: "Ingeniero de software con alma de chef. Siempre en busca del equilibrio perfecto entre código y sabor.",
      profession: "Desarrollador de Software",
      verified: true
    }
  ];

  const handleFeatureClick = (featureType: 'connections' | 'verification' | 'events' | 'tokens') => {
    setSelectedFeature(featureType);
    setShowFeatureModal(true);
  };

  const features = [
    {
      icon: Heart,
      title: "Conexiones Auténticas",
      description: "Algoritmo inteligente que conecta personas con intereses reales en común",
      type: 'connections' as const,
      iconBg: "bg-gradient-to-r from-purple-500 to-purple-600"
    },
    {
      icon: Shield,
      title: "Verificación KYC Avanzada",
      description: "Perfiles verificados con tecnología blockchain y KYC para máxima seguridad y confianza",
      type: 'verification' as const,
      iconBg: "bg-gradient-to-r from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Eventos Swinger Exclusivos",
      description: "Accede a fiestas privadas, encuentros y eventos exclusivos para la comunidad swinger",
      type: 'events' as const,
      iconBg: "bg-gradient-to-r from-purple-500 to-purple-600"
    },
    {
      icon: Zap,
      title: "Sistema de Tokens CMPX/GTK",
      description: "Gana tokens participando, accede a funciones premium y eventos VIP",
      type: 'tokens' as const,
      iconBg: "bg-gradient-to-r from-amber-500 to-orange-500"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-900 via-purple-900 to-blue-900">
      {/* Background uniforme continuo rosa-púrpura-azul - aplicado directamente al contenedor principal */}
      {/* Corazones decorativos flotantes */}
      <DecorativeHearts count={8} />
      {/* Content */}
      <div className="relative z-10">
        <BetaBanner />
        <div className="pt-16"> {/* Add padding for fixed banner */}
          <HeaderNav />
        </div>
      </div>
      
      <main>
        <HeroSection />
        
        {/* Featured Profiles Section */}
        <section className="py-10 sm:py-20 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              <div className="space-y-6">
                <h1 data-testid="main-heading" className="text-4xl md:text-6xl font-bold text-white mb-6 animate-slide-up">
                  Bienvenido a la Plataforma Social
                </h1>
                <p className="text-xl md:text-2xl text-white/95 max-w-4xl mx-auto leading-relaxed animate-slide-up font-medium px-4">
                  La plataforma <strong className="text-purple-300">más exclusiva</strong> para la comunidad lifestyle mexicana.
                  <br className="hidden md:block" />
                  <span className="text-purple-200">
                    Conexiones auténticas, experiencias únicas.
                  </span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 px-2">
                {sampleProfiles.map((profile, index) => (
                  <div key={index} className={`animate-slide-up slide-up-delay-${index}`}>
                    <ProfileCard 
                      profile={profile} 
                      onLike={() => {}} 
                      onSuperLike={() => {}}
                      onOpenModal={() => setShowActionButtonsModal(true)} 
                    />
                  </div>
                ))}
              </div>
              
            </div>
          </div>
        </section>

        {/* Stories Section - Removida porque ya está en HeaderNav (sin elementos fantasma) */}

        {/* About, Careers, Donations Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-xl">
                Conoce Más Sobre Nuestra Plataforma
              </h2>
              <p className="text-xl text-white max-w-3xl mx-auto drop-shadow-md">
                Descubre nuestra misión, únete a nuestro equipo o apoya nuestro crecimiento
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {/* About Section */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full">
                      <Info className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-center text-xl drop-shadow-lg">
                    Acerca de Nosotros
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-white mb-6 drop-shadow-sm">
                    Conoce nuestra misión, visión y valores. Descubre por qué somos la plataforma más confiable para la comunidad lifestyle.
                  </p>
                  <Button 
                    variant="default" 
                    className="bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 border border-purple-400 w-full"
                    asChild
                  >
                    <Link to="/about">
                      Conocer Más
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              {/* Careers Section */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full">
                      <Briefcase className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-center text-xl drop-shadow-lg">
                    Únete al Equipo
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-white drop-shadow-sm mb-6">
                    Forma parte de nuestro equipo innovador. Buscamos talento apasionado por la tecnología y la comunidad lifestyle.
                  </p>
                  <Button 
                    variant="default" 
                    className="bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 border border-purple-400 w-full"
                    asChild
                  >
                    <Link to="/careers">
                      Ver Vacantes
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              {/* Moderator Section */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-full">
                      <UserCheck className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-center text-xl drop-shadow-lg">
                    Ser Moderador
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-white drop-shadow-sm mb-6">
                    Ayuda a mantener una comunidad segura y respetuosa. Únete a nuestro equipo de moderadores voluntarios.
                  </p>
                  <Button 
                    variant="default" 
                    className="bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 border border-purple-400 w-full"
                    onClick={() => setShowModeratorForm(true)}
                  >
                    Aplicar Ahora
                  </Button>
                </CardContent>
              </Card>
              
              {/* Donations Section */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
                      <DollarSign className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-center text-xl drop-shadow-lg">
                    Apoya el Proyecto
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-white drop-shadow-sm mb-6">
                    Ayúdanos a crecer y mejorar la plataforma. Tu apoyo nos permite seguir innovando para la comunidad.
                  </p>
                  <Button 
                    variant="default" 
                    className="bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 border border-purple-400 w-full"
                    asChild
                  >
                    <Link to="/donations">
                      Donar Ahora
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                ¿Por qué elegir nuestra plataforma?
              </h2>
              <p className="text-xl text-white drop-shadow-sm max-w-3xl mx-auto">
                La plataforma más segura y discreta para la comunidad swinger. Conectamos parejas y solteros 
                con verificación avanzada, tecnología blockchain y total privacidad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="text-center group hover:transform hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => handleFeatureClick(feature.type)}
                >
                  <div className="bg-card-gradient rounded-2xl p-8 shadow-soft hover:shadow-glow transition-all duration-300">
                    <div className={`${feature.iconBg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-white drop-shadow-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          {/* Sin elementos adicionales que creen bordes */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10 max-w-6xl">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Atrévete a Vivir Nuevas Fantasías
              </h2>
              <p className="text-xl text-white drop-shadow-sm mb-8">
                Conecta con parejas y solteros liberales en un ambiente seguro y discreto. La aventura de tu vida te espera.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="default" size="xl" className="bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700" asChild>
                  <Link to="/auth">
                    <Heart className="mr-2 h-5 w-5" fill="currentColor" />
                    Crear Cuenta Gratis
                  </Link>
                </Button>
                {!isRunningInApp && (
                  <Button 
                    variant="outline" 
                    size="xl" 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 border-green-400 text-white hover:from-green-600 hover:to-emerald-700 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                    onClick={() => setShowInstallModal(true)}
                  >
                    <Android className="w-5 h-5 mr-2" />
                    Instalar Aplicación
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      {showWelcome && <WelcomeModal isOpen={showWelcome} onClose={handleWelcomeClose} />}
      <InstallAppModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
      <FeatureModal
        isOpen={showFeatureModal}
        onClose={() => setShowFeatureModal(false)}
        feature={selectedFeature}
      />
      <ActionButtonsModal
        isOpen={showActionButtonsModal}
        onClose={() => setShowActionButtonsModal(false)}
      />
      
      {/* Moderator Application Modal */}
      {showModeratorForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-black/80 backdrop-blur-sm p-4 border-b border-white/20 z-10">
              <Button
                variant="ghost"
                onClick={() => setShowModeratorForm(false)}
                className="text-white hover:bg-white/10 float-right"
              >
                ✕ Cerrar
              </Button>
              <div className="clear-both"></div>
            </div>
            <div className="p-6">
              <ModeratorApplicationForm />
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Screen - REMOVIDO: Ya está manejado arriba con loadingTimeoutPassed */}
    </div>
  );
};

export default Index;
