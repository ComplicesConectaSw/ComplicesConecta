import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Zap, Heart, Star, Shield, Calendar, Users, Coins, Lock, Sparkles, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Premium = () => {
  const navigate = useNavigate();

  const premiumBenefits = [
    {
      icon: Heart,
      title: "Conexiones Ilimitadas",
      description: "Intercambio sin límites con parejas verificadas",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Shield,
      title: "Verificación VIP",
      description: "Acceso a perfiles ultra-verificados",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: Calendar,
      title: "Eventos Exclusivos",
      description: "Fiestas privadas y orgías VIP",
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
      {/* Advanced Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-secondary/20"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Floating Hearts */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
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
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
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
              Experiencias Íntimas Exclusivas
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Accede a la élite swinger con funciones premium, eventos VIP y el sistema de tokens CMPX. 
              <strong className="text-accent"> Disponible después de la fase Beta.</strong>
            </p>
          </div>

          {/* Donation Plans */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">Apoya el Proyecto Beta</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ayúdanos a hacer ComplicesConecta la mejor plataforma swinger. Tu donación nos permite mejorar 
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
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Star className="h-3 w-3 mr-1" />
                      Badge de Supporter
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">• Acceso anticipado a noticias</p>
                  <p className="text-sm text-muted-foreground">• Nuestro agradecimiento eterno</p>
                  <p className="text-sm text-muted-foreground">• Reconocimiento en la comunidad</p>
                  <Button 
                    asChild
                    className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    <a href="https://buy.stripe.com/bIY3fGdHKfWG5Gg9AA" target="_blank" rel="noopener noreferrer">Seleccionar</a>
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
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <Crown className="h-3 w-3 mr-1" />
                      Badge Contributor
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">• Todo lo anterior</p>
                  <p className="text-sm text-muted-foreground">• Acceso a contenido exclusivo</p>
                  <p className="text-sm text-muted-foreground">• Participación en encuestas</p>
                  <Button 
                    asChild
                    className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <a href="https://buy.stripe.com/28o17y5fieSOd2I000" target="_blank" rel="noopener noreferrer">Seleccionar</a>
                  </Button>
                </CardContent>
              </Card>

              {/* VIP Supporter Plan */}
              <Card className="bg-card/80 backdrop-blur-sm border-2 border-amber-400/50 hover:border-amber-400 transition-all duration-300 hover:scale-105 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-amber-500 text-white">
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
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      <Crown className="h-3 w-3 mr-1" />
                      Badge VIP Dorado
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">• Todo lo anterior</p>
                  <p className="text-sm text-muted-foreground">• Acceso beta a nuevas funciones</p>
                  <p className="text-sm text-muted-foreground">• Consulta directa con el equipo</p>
                  <Button 
                    asChild
                    className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    <a href="https://buy.stripe.com/6oE9E4bzu2c8d2I8wx" target="_blank" rel="noopener noreferrer">Seleccionar</a>
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
                  <p className="text-sm text-muted-foreground">• Todo lo anterior</p>
                  <p className="text-sm text-muted-foreground">• Tu nombre en los créditos</p>
                  <p className="text-sm text-muted-foreground">• Acceso de por vida a funciones premium</p>
                  <Button 
                    asChild
                    className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    <a href="https://buy.stripe.com/14k5nOdHK7wocYE4gj" target="_blank" rel="noopener noreferrer">Seleccionar</a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                💳 Pagos seguros procesados por Stripe • 🔒 Transacciones encriptadas • 🇲🇽 Precios en pesos mexicanos
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
              <p className="text-muted-foreground mb-4">
                Las funciones Premium avanzadas se activarán al finalizar la fase beta. 
                Los donantes tendrán acceso prioritario y beneficios exclusivos.
              </p>
              <Badge variant="secondary" className="bg-accent/20 text-accent">
                <Sparkles className="h-4 w-4 mr-1" />
                Próximamente
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
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
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
                    <p className="text-sm text-muted-foreground">Acceso a perfiles ultra-verificados con experiencia swinger comprobada</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-accent mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">Eventos VIP Exclusivos</h4>
                    <p className="text-sm text-muted-foreground">Invitaciones a fiestas privadas, orgías y clubs swinger de élite</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-accent mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">Privacidad Máxima</h4>
                    <p className="text-sm text-muted-foreground">Modo incógnito y protección avanzada de identidad</p>
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
                    <p className="text-sm text-muted-foreground">Gana tokens CMPX por verificaciones, eventos y conexiones exitosas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">Intercambio de Tokens</h4>
                    <p className="text-sm text-muted-foreground">Usa tokens para acceder a funciones premium y eventos exclusivos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">NFTs de Experiencias</h4>
                    <p className="text-sm text-muted-foreground">Colecciona NFTs únicos de tus experiencias swinger más memorables</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="bg-hero-gradient border-0 text-white">
            <CardContent className="text-center py-12">
              <Crown className="h-16 w-16 mx-auto mb-6 text-white" />
              <h2 className="text-3xl font-bold mb-4">Únete a la Lista VIP</h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Sé de los primeros en acceder a las funciones Premium cuando finalice la beta. 
                Recibirás tokens CMPX gratuitos y acceso prioritario a eventos exclusivos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 font-semibold"
                  disabled
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Lista VIP (Próximamente)
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                  onClick={() => navigate('/faq')}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Más Información
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
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

export default Premium;