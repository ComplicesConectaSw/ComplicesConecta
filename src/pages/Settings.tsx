import Navigation from '@/components/Navigation';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, MessageSquare, Heart, Crown, Shield, Zap, Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  const swingerStats = {
    totalCouples: "8,247",
    activeSwingers: "1,834",
    verifiedProfiles: "99.2%",
    intimateConnections: "4,156",
    monthlyEvents: "127",
    satisfactionRate: 4.9
  };

  const swingerFeatures = [
    {
      icon: Shield,
      title: "Verificación Lifestyle KYC",
      description: "Verificación de identidad + validación de experiencia swinger para comunidad auténtica",
      status: "Activo"
    },
    {
      icon: MessageSquare,
      title: "Chat Íntimo Encriptado",
      description: "Conversaciones privadas entre parejas con encriptación militar para máxima discreción",
      status: "Activo"
    },
    {
      icon: MapPin,
      title: "Encuentros Gelocalizados",
      description: "Localiza parejas swinger y clubs exclusivos cerca de tu ubicación",
      status: "Activo"
    },
    {
      icon: Calendar,
      title: "Fiestas Privadas VIP",
      description: "Acceso exclusivo a eventos swinger, even privadas y clubs de intercambio",
      status: "Premium"
    }
  ];

  return (
    <div className="min-h-screen bg-hero-gradient relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-gradient-x"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-secondary/10 to-primary/15 animate-gradient-y"></div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-40 right-32 w-48 h-48 bg-accent/8 rounded-full blur-2xl animate-float-reverse"></div>
        </div>
      </div>
      
      <div className="relative z-10">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              onClick={() => navigate('/')}
              className="bg-card/80 backdrop-blur-sm border border-primary/20 hover:bg-primary/10 transition-all duration-300 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </div>

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Dashboard Swinger
              <span className="block bg-love-gradient bg-clip-text text-transparent">
                Tu Centro de Control Íntimo
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Gestiona tu experiencia swinger: conexiones, eventos privados y estadísticas de tu vida íntima
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Parejas Registradas</CardTitle>
                <Heart className="h-4 w-4 text-primary" fill="currentColor" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{swingerStats.totalCouples}</div>
                <p className="text-xs text-white/80">
                  <span className="text-accent">+15%</span> parejas nuevas este mes
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Swingers Activos</CardTitle>
                <Users className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{swingerStats.activeSwingers}</div>
                <p className="text-xs text-white/80">
                  <span className="text-accent">+8.3%</span> conectados hoy
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conexiones Íntimas</CardTitle>
                <Zap className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{swingerStats.intimateConnections}</div>
                <p className="text-xs text-white/80">
                  <span className="text-accent">+22%</span> encuentros exitosos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Perfiles Verificados</CardTitle>
                <Shield className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{swingerStats.verifiedProfiles}</div>
                <p className="text-xs text-white/80">
                  Verificación KYC + Lifestyle
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos Mensuales</CardTitle>
                <Calendar className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{swingerStats.monthlyEvents}</div>
                <p className="text-xs text-white/80">
                  Fiestas privadas y encuentros
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
                <Star className="h-4 w-4 text-accent" fill="currentColor" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{swingerStats.satisfactionRate}/5</div>
                <p className="text-xs text-white/80">
                  Experiencias swinger valoradas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
              <p className="text-white/80">Personaliza tu experiencia en ComplicesConecta</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {swingerFeatures.map((feature, index) => (
                <Card 
                  key={index} 
                  className="bg-card/80 backdrop-blur-sm border border-primary/10 cursor-pointer hover:bg-card/90 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/20"
                  onClick={() => {
                    if (feature.title === "Verificación Lifestyle KYC") {
                      navigate('/profile-single');
                    } else if (feature.title === "Chat Íntimo Encriptado") {
                      navigate('/chat-info');
                    } else if (feature.title === "Encuentros Gelocalizados") {
                      navigate('/discover');
                    } else if (feature.title === "Fiestas Privadas VIP") {
                      navigate('/events');
                    }
                  }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <feature.icon className="h-6 w-6 text-primary" />
                      <span className="text-white">{feature.title}</span>
                      <Badge 
                        variant={feature.status === "Premium" ? "destructive" : "secondary"}
                        className="ml-auto"
                      >
                        {feature.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Premium Upgrade */}
          <Card className="bg-hero-gradient border-0 text-white">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-3xl">
                <Crown className="h-8 w-8" />
                Experiencia Premium Swinger
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-white/90 text-lg max-w-2xl mx-auto">
                Accede a la élite swinger: fiestas VIP exclusivas, parejas verificadas premium 
                y experiencias íntimas que transformarán tu vida sexual.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-white text-primary hover:bg-white/90 font-semibold px-6 py-3 text-lg"
                  onClick={() => navigate('/premium')}
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Descubrir Premium
                </Button>
                <Button 
                  className="bg-white/10 border border-white/30 text-white hover:bg-white/20 backdrop-blur-sm px-6 py-3 text-lg"
                  onClick={() => navigate('/events')}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Ver Eventos VIP                </Button>
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

export default Settings;