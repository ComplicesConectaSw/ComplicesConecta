import { useState, useEffect } from "react";
import HeaderNav from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Zap, Heart, Star, Shield, Calendar, Users, Coins, Lock, Sparkles, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { PremiumFeatures } from "@/components/premium/PremiumFeatures";
import VIPEvents from "@/components/premium/VIPEvents";
import VirtualGifts from "@/components/premium/VirtualGifts";
import { ComingSoonModal } from "@/components/modals/ComingSoonModal";
import { logger } from '@/lib/logger';
import { usePersistedState } from '@/hooks/usePersistedState';

const Premium = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [_userType, _setUserType] = useState('');
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState('');

  const [demoAuth, _setDemoAuth] = usePersistedState('demo_authenticated', 'false');
  const [demoUser, _setDemoUser] = usePersistedState<any>('demo_user', null);

  useEffect(() => {
    // Verificar autenticacin (demo o real)
    // Si hay sesin demo, usar esa
    if (demoAuth === 'true' && demoUser) {
      const user = typeof demoUser === 'string' ? JSON.parse(demoUser) : demoUser;
      setIsDemoUser(true);
      _setUserType(user.accountType);
      return;
    }
    
    // Si no hay demo, verificar autenticacin real
    // Por ahora permitir acceso sin autenticacin para usuarios reales
    logger.info('?? Acceso a Premium sin autenticacin requerida');
  }, [navigate, demoAuth, demoUser]);

  const handleComingSoon = (title: string) => {
    setComingSoonTitle(title);
    setShowComingSoonModal(true);
  };

  const premiumBenefits = [
    {
      icon: Heart,
      title: "Conexiones Ilimitadas",
      description: "Intercambio sin lmites con parejas verificadas",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Shield,
      title: "Verificacin VIP",
      description: "Acceso a perfiles ultra-verificados",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: Calendar,
      title: "Eventos Exclusivos",
      description: "Fiestas privadas y orgas VIP",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Coins,
      title: "Tokens CMPX",
      description: "Sistema de recompensas blockchain",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <HeaderNav />
        
        <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/settings')}
              className="bg-card/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-all duration-300 text-white hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Crown className="h-12 w-12 text-primary mr-3 animate-pulse-glow" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Premium Swinger
              </h1>
            </div>
            <div className="bg-love-gradient bg-clip-text text-transparent text-2xl md:text-3xl font-bold mb-4">
              Experiencias ntimas Exclusivas
            </div>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Accede a la lite swinger con funciones premium, eventos VIP y el sistema de tokens CMPX. 
              <strong className="text-accent"> Disponible despus de la fase Beta.</strong>
            </p>
          </div>

          {/* Donation Plans */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">Apoya el Proyecto Beta</h2>
              <p className="text-white max-w-2xl mx-auto">
                Aydanos a hacer ComplicesConecta la mejor plataforma swinger. Tu donacin nos permite mejorar 
                la experiencia y agregar nuevas funciones exclusivas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Supporter Plan */}
              <Card className="bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Supporter</CardTitle>
                  <div className="text-3xl font-bold text-primary">$100 MXN</div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Star className="h-3 w-3 mr-1" />
                      Badge de Supporter
                    </Badge>
                  </div>
                  <ul className="space-y-2 list-none">
                    <li className="text-sm text-white flex items-start gap-2">
                      <span className="text-blue-400 mt-1"></span>
                      <span>Acceso anticipado a noticias</span>
                    </li>
                    <li className="text-sm text-white flex items-start gap-2">
                      <span className="text-blue-400 mt-1"></span>
                      <span>Nuestro agradecimiento eterno</span>
                    </li>
                    <li className="text-sm text-white flex items-start gap-2">
                      <span className="text-blue-400 mt-1"></span>
                      <span>Reconocimiento en la comunidad</span>
                    </li>
                  </ul>
                  <Button 
                    asChild
                    className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Funcionalidad de pago disponible prximamente'); }}>Seleccionar</a>
                  </Button>
                </CardContent>
              </Card>

              {/* Contributor Plan */}
              <Card className="bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Contributor</CardTitle>
                  <div className="text-3xl font-bold text-primary">$300 MXN</div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <Crown className="h-3 w-3 mr-1" />
                      Badge Contributor
                    </Badge>
                  </div>
                  <ul className="space-y-2 list-none">
                    <li className="text-sm text-white flex items-start gap-2">
                      <span className="text-purple-400 mt-1"></span>
                      <span>Todo lo anterior</span>
                    </li>
                    <li className="text-sm text-white flex items-start gap-2">
                      <span className="text-purple-400 mt-1"></span>
                      <span>Acceso a contenido exclusivo</span>
                    </li>
                    <li className="text-sm text-white flex items-start gap-2">
                      <span className="text-purple-400 mt-1"></span>
                      <span>Participacin en encuestas</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                    onClick={() => {
                      if (isDemoUser) {
                        toast({
                          title: "Premium Activado! (Modo Demo)",
                          description: "En modo demo tienes acceso completo a todas las funciones premium.",
                          duration: 3000,
                        });
                      }
                    }}
                  >
                    {isDemoUser ? "Activado en Demo" : "Seleccionar"}
                  </Button>
                </CardContent>
              </Card>

              {/* VIP Supporter Plan */}
              <Card className="bg-card/80 backdrop-blur-sm border-2 border-amber-400/50 hover:border-amber-400 transition-all duration-300 hover:scale-105 relative overflow-visible">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 px-2">
                  <Badge className="bg-amber-500 text-white whitespace-nowrap shadow-lg border-2 border-amber-600">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                </div>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">VIP Supporter</CardTitle>
                  <div className="text-3xl font-bold text-primary">$600 MXN</div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      <Crown className="h-3 w-3 mr-1" />
                      Badge VIP Dorado
                    </Badge>
                  </div>
                  <ul className="space-y-2 list-none">
                    <li className="text-sm text-white flex items-start gap-2">
                      <span className="text-amber-400 mt-1"></span>
                      <span>Todo lo anterior</span>
                    </li>
                    <li className="text-sm text-white flex items-start gap-2">
                      <span className="text-amber-400 mt-1"></span>
                      <span>Acceso beta a nuevas funciones</span>
                    </li>
                    <li className="text-sm text-white flex items-start gap-2">
                      <span className="text-amber-400 mt-1"></span>
                      <span>Consulta directa con el equipo</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    onClick={() => {
                      if (isDemoUser) {
                        toast({
                          title: "Premium VIP Activado! (Modo Demo)",
                          description: "En modo demo tienes acceso completo a todas las funciones VIP.",
                          duration: 3000,
                        });
                      }
                    }}
                  >
                    {isDemoUser ? "VIP Activado en Demo" : "Seleccionar"}
                  </Button>
                </CardContent>
              </Card>

              {/* Founding Member Plan */}
              <Card className="bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Gift className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Founding Member</CardTitle>
                  <div className="text-3xl font-bold text-primary">$1,000 MXN</div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                      <Star className="h-3 w-3 mr-1" />
                      Founding Member
                    </Badge>
                  </div>
                  <p className="text-sm text-white"> Todo lo anterior</p>
                  <p className="text-sm text-white"> Tu nombre en los crditos</p>
                  <p className="text-sm text-white"> Acceso de por vida a funciones premium</p>
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    onClick={() => {
                      if (isDemoUser) {
                        toast({
                          title: "Founding Member Activado! (Modo Demo)",
                          description: "En modo demo tienes acceso completo a todas las funciones de miembro fundador.",
                          duration: 3000,
                        });
                      }
                    }}
                  >
                    {isDemoUser ? "Founding Member Demo" : "Seleccionar"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-sm text-white mb-4">
                ?? Pagos seguros procesados por Stripe  ?? Transacciones encriptadas  ???? Precios en pesos mexicanos
              </p>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                Pagos 100% Seguros
              </Badge>
            </div>
          </div>

          {/* Future Premium Features */}
          <Card className="bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 mb-12">
            <CardContent className="text-center py-8">
              <Lock className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Funciones Premium - Post Beta</h2>
              <p className="text-white mb-4">
                Las funciones Premium avanzadas se activarn al finalizar la fase beta. 
                Los donantes tendrn acceso prioritario y beneficios exclusivos.
              </p>
              <Badge variant="secondary" className="bg-accent/20 text-accent">
                <Sparkles className="h-4 w-4 mr-1" />
                Prximamente
              </Badge>
            </CardContent>
          </Card>

          {/* Benefits Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {premiumBenefits.map((benefit, index) => (
              <Card key={index} className="bg-card/80 backdrop-blur-sm border border-primary/10 overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${benefit.color} flex items-center justify-center`}>
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-white">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Premium Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Swinger Features */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" fill="currentColor" />
                  Funciones Swinger VIP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-accent mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">Parejas Verificadas Premium</h4>
                    <p className="text-sm text-white">Acceso a perfiles ultra-verificados con experiencia swinger comprobada</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-accent mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">Eventos VIP Exclusivos</h4>
                    <p className="text-sm text-white">Invitaciones a fiestas privadas, orgas y clubs swinger de lite</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-accent mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">Privacidad Mxima</h4>
                    <p className="text-sm text-white">Modo incgnito y proteccin avanzada de identidad</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blockchain & Tokens */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-6 w-6 text-accent" />
                  Sistema de Tokens CMPX
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">Recompensas por Actividad</h4>
                    <p className="text-sm text-white">Gana tokens CMPX por verificaciones, eventos y conexiones exitosas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">Intercambio de Tokens</h4>
                    <p className="text-sm text-white">Usa tokens para acceder a funciones premium y eventos exclusivos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">NFTs de Experiencias</h4>
                    <p className="text-sm text-white">Colecciona NFTs nicos de tus experiencias swinger ms memorables</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Premium Features Components */}
          <div className="mb-12">
            <PremiumFeatures />
          </div>

          {/* VIP Events */}
          <div className="mb-12">
            <VIPEvents />
          </div>

          {/* Virtual Gifts */}
          <div className="mb-12">
            <VirtualGifts />
          </div>

          {/* Call to Action */}
          <Card className="bg-hero-gradient border-0 text-white">
            <CardContent className="text-center py-12">
              <Crown className="h-16 w-16 mx-auto mb-6 text-white" />
              <h2 className="text-3xl font-bold mb-4">nete a la Lista VIP</h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                S de los primeros en acceder a las funciones Premium cuando finalice la beta. 
                Recibirs tokens CMPX gratuitos y acceso prioritario a eventos exclusivos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => handleComingSoon("Planes de Suscripcin Premium")}
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Ver Planes Premium
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                  onClick={() => handleComingSoon("Historias Premium")}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Historias VIP
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
      
      {/* Coming Soon Modal */}
      <ComingSoonModal 
        isOpen={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        title={comingSoonTitle}
        description="Esta funcionalidad estar disponible despus de la fase Beta. Los usuarios que apoyen el proyecto tendrn acceso prioritario."
        feature="Premium"
      />
      
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

export default Premium;