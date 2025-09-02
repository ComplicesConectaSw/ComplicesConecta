import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, MessageSquare, Heart, Crown, Shield, Zap, TrendingUp, Star, MapPin, Camera } from "lucide-react";
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
          {[...Array(6)].map((_, i) => (
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
              Dashboard Swinger
              <span className="block bg-love-gradient bg-clip-text text-transparent">
                Tu Centro de Control Íntimo
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
                <p className="text-xs text-muted-foreground">
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
                <p className="text-xs text-muted-foreground">
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
                <p className="text-xs text-muted-foreground">
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
                <p className="text-xs text-muted-foreground">
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
                <p className="text-xs text-muted-foreground">
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
                <p className="text-xs text-muted-foreground">
                  Experiencias swinger valoradas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Funcionalidades Principales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {swingerFeatures.map((feature, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-sm border border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <feature.icon className="h-6 w-6 text-primary" />
                      {feature.title}
                      <Badge 
                        variant={feature.status === "Premium" ? "destructive" : "secondary"}
                        className="ml-auto"
                      >
                        {feature.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
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
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 font-semibold"
                  onClick={() => navigate('/premium')}
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Descubrir Premium
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
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