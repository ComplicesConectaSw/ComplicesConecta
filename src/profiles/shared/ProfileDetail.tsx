import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, MapPin, Star, Shield, Camera } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent } from "@/shared/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from '@/components/Navigation';
import HeaderNav from '@/components/HeaderNav';
import { Footer } from "@/components/Footer";
import { logger } from '@/lib/logger';
import { useAuth } from '@/features/auth/useAuth';
import { DecorativeHearts } from '@/components/DecorativeHearts';

// Professional profile images from Unsplash - Production ready
// Removed local imports that fail in production

const ProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Verificar autenticación demo
  const demoAuth = localStorage.getItem('demo_authenticated');
  const demoUser = localStorage.getItem('demo_user');
  
  // Determinar si hay sesión activa (demo o producción)
  const authStatus = typeof isAuthenticated === 'function' ? isAuthenticated() : isAuthenticated;
  const hasActiveSession = (demoAuth === 'true' && demoUser) || (authStatus && user);
  
  // Allow access in demo mode or if user is authenticated
  if (demoAuth !== 'true' && !demoUser) {
    // Only redirect to auth if not in demo mode
    const isDemoMode = window.location.hostname === 'localhost' || window.location.hostname.includes('demo');
    if (!isDemoMode) {
      navigate('/auth');
      return null;
    }
  }

  // Demo profile data for beta
  const allProfiles = [
    {
      id: 1,
      name: "Demo User",
      age: 28,
      location: "Ciudad de México",
      interests: ["Lifestyle Swinger", "Mentalidad Abierta", "Experiencias Nuevas", "Conexiones Auténticas"],
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=600&fit=crop&crop=face",
      rating: 4.8,
      isOnline: true,
      bio: "Explorando el lifestyle con mentalidad abierta. Busco conexiones auténticas y experiencias únicas.",
      profession: "Profesional Independiente",
      education: "Universidad Nacional Autónoma de México",
      languages: ["Español"],
      hobbies: ["Fotografía Sensual", "Baile", "Cenas Íntimas", "Eventos Sociales"],
      lookingFor: "Personas con mentalidad abierta para compartir experiencias del lifestyle",
      images: ["https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face"],
    },
    {
      id: 2,
      name: "Antonio",
      age: 34,
      location: "Ciudad de México",
      interests: ["Lifestyle Swinger", "Intercambio de Parejas", "Eventos Lifestyle", "Mentalidad Abierta"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face&auto=format&q=80",
      rating: 4.9,
      isOnline: false,
      bio: "Chef profesional del lifestyle. Me encanta crear experiencias culinarias íntimas y ambientes sensuales.",
      profession: "Chef",
      education: "Escuela de Hostelería de Ciudad de México",
      languages: ["Español"],
      hobbies: ["Cocina Afrodisíaca", "Cenas Íntimas", "Degustación de Vinos", "Masajes Relajantes"],
      lookingFor: "Parejas y personas del lifestyle para compartir experiencias culinarias sensuales",
      images: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face"],
    },
    {
      id: 3,
      name: "Ana",
      age: 26,
      location: "Guadalajara",
      interests: ["Fiestas Temáticas", "Clubs Privados", "Experiencias Nuevas", "Ambiente Sensual"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
      rating: 4.7,
      isOnline: true,
      bio: "Artista del lifestyle. Exploro la sensualidad a través del arte y busco conexiones creativas auténticas.",
      profession: "Artista",
      education: "Bellas Artes - Universidad de Guadalajara",
      languages: ["Español"],
      hobbies: ["Arte Erótico", "Fotografía Sensual", "Baile Contemporáneo", "Literatura Erótica"],
      lookingFor: "Personas creativas del lifestyle que aprecien el arte sensual y las experiencias únicas",
      images: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=600&fit=crop&crop=face"],
    },
    {
      id: 4,
      name: "Diego",
      age: 30,
      location: "Monterrey",
      interests: ["Arte Erótico", "Fotografía Erótica", "Ambiente Sensual", "Conexiones Auténticas"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
      rating: 4.8,
      isOnline: true,
      bio: "Desarrollador del lifestyle tech. Combino mi pasión por la tecnología con experiencias sensuales auténticas.",
      profession: "Desarrollador",
      education: "Ingeniería Informática - Universidad de Monterrey",
      languages: ["Español"],
      hobbies: ["Fotografía Erótica", "Tecnología Sensual", "Spa de Parejas", "Eventos Exclusivos"],
      lookingFor: "Parejas y personas del lifestyle tech que valoren la innovación y la sensualidad",
      images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face"],
    }
  ];

  const profile = allProfiles.find(p => p.id === parseInt(id || ""));

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
        {hasActiveSession ? <Navigation /> : <HeaderNav />}
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Perfil no encontrado</h1>
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
      {/* Corazones decorativos flotantes */}
      <DecorativeHearts count={5} />
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10">
        {hasActiveSession ? <Navigation /> : <HeaderNav />}
        
        <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          onClick={() => navigate("/profiles")}
          className="mb-6 flex items-center gap-2 text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a perfiles
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                    <Avatar className="w-32 h-32">
                      <AvatarImage 
                        src={profile.image} 
                        alt={profile.name}
                        onError={(e) => {
                          // Si la imagen falla, usar fallback de Unsplash
                          const fallbackImages = [
                            'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
                            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face&auto=format&q=80'
                          ];
                          const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
                          if (e.currentTarget.src !== randomFallback) {
                            e.currentTarget.src = randomFallback;
                          } else {
                            // Si también falla el fallback, ocultar imagen y mostrar fallback
                            e.currentTarget.style.display = 'none';
                          }
                        }}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-2xl font-bold">
                        {profile.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center justify-center mt-2">
                      <div className={`w-3 h-3 rounded-full ${profile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-sm text-white/80 ml-2">
                        {profile.isOnline ? 'En línea' : 'Desconectado'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                      <Badge className="bg-white/10 border-white/30 text-white backdrop-blur-sm">{profile.age} años</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-white/80 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{profile.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-lg text-white mb-4">{profile.bio}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-white/80">Perfil verificado</span>
                    </div>
                    
                    <p className="text-sm text-white/80">
                      <strong className="text-white">Profesión:</strong> {profile.profession}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Sobre mí</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-white mb-2">Qué busco</h3>
                    <p className="text-white/80">{profile.lookingFor}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-white mb-2">Educación</h3>
                    <p className="text-white/80">{profile.education}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-white mb-2">Idiomas</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((lang) => (
                        <Badge key={lang} className="border border-white/30 bg-white/10 backdrop-blur-sm text-white">{lang}</Badge>
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
                      <div className="flex flex-wrap gap-2 items-start content-start min-h-[80px]">
                        {profile.interests.map((interest, _index) => (
                          <Badge 
                            key={interest} 
                            className="bg-purple-200/80 text-purple-900 border border-purple-300/50 px-3 py-1.5 text-sm font-semibold whitespace-nowrap"
                            style={{ flexShrink: 0 }}
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-white mb-3">Otros hobbies</h3>
                      <div className="flex flex-wrap gap-2 items-start content-start min-h-[80px]">
                        {profile.hobbies.map((hobby, _index) => (
                          <Badge 
                            key={hobby} 
                            className="bg-pink-200/80 text-pink-900 border border-pink-300/50 px-3 py-1.5 text-sm font-semibold whitespace-nowrap"
                            style={{ flexShrink: 0 }}
                          >
                            {hobby}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Gallery */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
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
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Button 
                    onClick={() => {
                      logger.info('Me gusta', { profileName: profile.name });
                      alert(`¡Has dado like a ${profile.name}!`);
                    }}
                    className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-3 text-lg"
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Me gusta
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      logger.info('Enviando mensaje a', { profileName: profile.name });
                      alert(`Mensaje enviado a ${profile.name}`);
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 text-lg"
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
                    className="w-full border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 px-6 py-3 text-lg transition-all duration-300"
                  >
                    Reportar perfil
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-4">Información rápida</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/80">Edad:</span>
                    <span className="text-white">{profile.age} años</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Ubicación:</span>
                    <span className="text-white">{profile.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Profesión:</span>
                    <span className="text-white">{profile.profession}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Valoración:</span>
                    <span className="text-white flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {profile.rating}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Estado:</span>
                    <span className={`text-sm ${profile.isOnline ? 'text-green-600' : 'text-white'}`}>
                      {profile.isOnline ? 'En línea' : 'Desconectado'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compatibility */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-4">Compatibilidad</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/80">Intereses comunes</span>
                      <span className="text-white">85%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-[85%]"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/80">Proximidad</span>
                      <span className="text-white">92%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-[92%]"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/80">Estilo de vida</span>
                      <span className="text-white">78%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-[78%]"></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm text-primary font-medium text-center">
                    ¡Gran compatibilidad! ðŸŽ‰
                  </p>
                  <p className="text-xs text-white/80 text-center mt-1">
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