import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Star, Shield, Camera, Heart, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { usePersistedState } from '@/hooks/usePersistedState';
import { logger } from '@/lib/logger';

// Perfil detallado con datos demo para la versión Beta

const ProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado persistente para autenticación
  const [demoAuth] = usePersistedState('demo_authenticated', 'false');
  const [apoyoAuth] = usePersistedState('apoyo_authenticated', 'false');
  const [demoUser] = usePersistedState<any>('demo_user', null);

  useEffect(() => {
    // Verificar autenticación
    const isAuthenticated = demoAuth === 'true' || apoyoAuth === 'true';

    if (!isAuthenticated) {
      logger.info('🔒 ProfileDetail: Usuario no autenticado, redirigiendo a /auth');
      navigate('/auth');
      return;
    }

    logger.info('✅ ProfileDetail: Acceso autorizado', { 
      profileId: id,
      demoMode: demoAuth === 'true',
      apoyoMode: apoyoAuth === 'true'
    });
  }, [navigate, demoAuth, apoyoAuth, id]);

  // Demo profile data for beta
  const allProfiles = [
    {
      id: 1,
      name: "Demo User",
      age: 28,
      location: "Tu Ciudad",
      interests: ["Música", "Viajes", "Arte"],
      image: "https://images.unsplash.com/photo-1494790108755-2616b332c1c0?w=400&h=600&fit=crop&crop=face",
      rating: 4.8,
      isOnline: true,
      bio: "Este es un perfil de demostración para la versión Beta de ComplicesConecta.",
      profession: "Beta Tester",
      education: "Universidad Demo",
      languages: ["Español", "Inglés"],
      hobbies: ["Testing", "Feedback"],
      lookingFor: "Probar la aplicación y dar feedback valioso",
      images: ["https://images.unsplash.com/photo-1494790108755-2616b332c1c0?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face"],
    },
    {
      id: 2,
      name: "Carlos",
      age: 32,
      location: "Ciudad de México",
      interests: ["Caballero", "Parejas", "Encuentros íntimos", "Aventuras"],
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
      rating: 4.9,
      isOnline: false,
      bio: "Hombre experimentado de CDMX. Especializado en hacer sentir especiales a las parejas. Discreto, respetuoso y con mucha energía.",
      profession: "Chef",
      education: "Universidad Nacional Autónoma de México",
      languages: ["Español", "Inglés"],
      hobbies: ["Liderazgo", "Intimidad", "Encuentros sociales", "Fiestas privadas"],
      lookingFor: "Parejas aventureras y personas especiales para encuentros íntimos y experiencias únicas",
      images: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1494790108755-2616b332c1c0?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face"],
    },
    {
      id: 3,
      name: "Ana",
      age: 26,
      location: "Monterrey",
      interests: ["Tercera persona", "Bisexual", "Parejas", "Sensualidad"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
      rating: 4.7,
      isOnline: true,
      bio: "Mujer independiente de Monterrey. Me encanta la compañía de parejas y ser el centro de atención. Cómoda con ambos géneros.",
      profession: "Artista",
      education: "Universidad Autónoma de Nuevo León",
      languages: ["Español", "Inglés"],
      hobbies: ["Danza sensual", "Performance", "Intimidad", "Juegos sensuales"],
      lookingFor: "Parejas liberales y personas especiales para encuentros íntimos y experiencias sin compromisos",
      images: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1494790108755-2616b332c1c0?w=400&h=600&fit=crop&crop=face"],
    },
    {
      id: 4,
      name: "Diego",
      age: 30,
      location: "Puebla",
      interests: ["Encuentros grupales", "Experiencias intensas", "Exhibicionismo", "Aventuras"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
      rating: 4.8,
      isOnline: true,
      bio: "Hombre activo del lifestyle en Puebla. Disfruto los encuentros grupales y experiencias intensas. Siempre respetuoso y discreto.",
      profession: "Desarrollador",
      education: "Instituto Tecnológico de Puebla",
      languages: ["Español", "Inglés"],
      hobbies: ["Encuentros sociales", "Experiencias intensas", "Intimidad", "Voyeurismo"],
      lookingFor: "Parejas, mujeres aventureras y grupos para encuentros intensos y experiencias únicas",
      images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face"],
    }
  ];

  const profile = allProfiles.find(p => p.id === parseInt(id || ""));

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Perfil no encontrado</h1>
          <Button onClick={() => navigate("/profiles")} className="text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
            Volver a perfiles
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          onClick={() => navigate("/profiles")}
          variant="outline"
          className="mb-6 flex items-center gap-2 text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a perfiles
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={profile.image} alt={profile.name} />
                      <AvatarFallback>{profile.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center justify-center mt-2">
                      <div className={`w-3 h-3 rounded-full ${profile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-sm text-muted-foreground ml-2">
                        {profile.isOnline ? 'En línea' : 'Desconectado'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
                      <Badge variant="secondary">{profile.age} años</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{profile.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-lg text-foreground mb-4">{profile.bio}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Perfil verificado</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      <strong>Profesión:</strong> {profile.profession}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Sobre mí</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Qué busco</h3>
                    <p className="text-muted-foreground">{profile.lookingFor}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Educación</h3>
                    <p className="text-muted-foreground">{profile.education}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Idiomas</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((lang) => (
                        <Badge key={lang} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests & Hobbies */}
            <Card className="shadow-soft bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Intereses y Hobbies</h2>
                <div className="bg-gradient-to-r from-purple-100/80 to-pink-100/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200/50">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-white mb-3">Intereses principales</h3>
                      <div className="flex flex-wrap gap-2 min-h-[80px]">
                        {profile.interests.map((interest) => (
                          <Badge key={interest} className="bg-purple-200/80 text-purple-900 border border-purple-300/50 px-3 py-1 text-sm font-semibold">{interest}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-white mb-3">Otros hobbies</h3>
                      <div className="flex flex-wrap gap-2 min-h-[80px]">
                        {profile.hobbies.map((hobby) => (
                          <Badge key={hobby} className="bg-pink-200/80 text-pink-900 border border-pink-300/50 px-3 py-1 text-sm font-semibold">{hobby}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Gallery */}
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Fotos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.images.map((photo: string, index: number) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg">
                      <img 
                        src={photo} 
                        alt={`${profile.name} - Foto ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Button 
                    onClick={() => {
                      logger.info('Me gusta', { profileName: profile.name });
                      alert(`¡Has dado like a ${profile.name}!`);
                    }}
                    variant="love" 
                    size="lg" 
                    className="w-full"
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Me gusta
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      logger.info('Enviando mensaje a', { profileName: profile.name });
                      alert(`Mensaje enviado a ${profile.name}`);
                    }}
                    variant="default" 
                    size="lg" 
                    className="w-full"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Enviar mensaje
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      logger.info('Reportando perfil de', { profileName: profile.name });
                      if (confirm(`¿Estás seguro de que quieres reportar el perfil de ${profile.name}?`)) {
                        alert('Perfil reportado. Gracias por ayudarnos a mantener la comunidad segura.');
                      }
                    }}
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                  >
                    Reportar perfil
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Información rápida</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Edad:</span>
                    <span className="text-foreground">{profile.age} años</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ubicación:</span>
                    <span className="text-foreground">{profile.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profesión:</span>
                    <span className="text-foreground">{profile.profession}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valoración:</span>
                    <span className="text-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {profile.rating}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <span className={`text-sm ${profile.isOnline ? 'text-green-600' : 'text-white'}`}>
                      {profile.isOnline ? 'En línea' : 'Desconectado'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compatibility */}
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Compatibilidad</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Intereses comunes</span>
                      <span className="text-foreground">85%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-[85%]"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Proximidad</span>
                      <span className="text-foreground">92%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-[92%]"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Estilo de vida</span>
                      <span className="text-foreground">78%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-[78%]"></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm text-primary font-medium text-center">
                    ¡Gran compatibilidad! 🎉
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    Tienes muchas cosas en común
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default ProfileDetail;