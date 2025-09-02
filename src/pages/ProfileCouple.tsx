import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MapPin, Verified, Crown, Edit, Settings, Share2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ProfileStats from "@/components/profile/ProfileStats";
import { generateMockCouple } from "@/lib/data";

const ProfileCouple = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true); // Por defecto es perfil propio

  useEffect(() => {
    // Verificar autenticación demo y cargar perfil del usuario
    const demoAuth = localStorage.getItem('demo_authenticated');
    const demoUser = localStorage.getItem('demo_user');
    
    if (demoAuth !== 'true' || !demoUser) {
      navigate('/auth');
      return;
    }
    
    const user = JSON.parse(demoUser);
    
    // Si es perfil pareja, usar datos del usuario demo
    if (user.accountType === 'couple') {
      setProfile(user);
    } else {
      // Para otros tipos, generar perfil mock
      const mockProfile = generateMockCouple();
      setProfile(mockProfile);
    }
  }, [navigate]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

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
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-gray-600"
          >
            <Edit className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Nuestro Perfil</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Share2 className="h-5 w-5 text-gray-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/edit-profile-couple')}
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-4 pb-24 space-y-4 sm:space-y-6 max-w-2xl mx-auto">
        {/* Fotos de la pareja */}
        <Card className="overflow-hidden bg-white shadow-xl">
          <div className="relative">
            <div className="relative">
              <img 
                alt={profile.coupleName} 
                className="w-full h-96 sm:h-[500px] object-cover object-center" 
                src={profile.image || 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400'}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400';
                }}
              />
            </div>
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Badge className="bg-purple-500 text-white">
                <Users className="h-3 w-3 mr-1" />
                Pareja
              </Badge>
              {profile.isOnline && (
                <Badge className="bg-green-500 text-white">
                  En línea
                </Badge>
              )}
              {profile.isVerified && (
                <Badge className="bg-blue-500 text-white">
                  <Verified className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              )}
              {profile.isPremium && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            
            {isOwnProfile && (
              <div className="absolute bottom-4 right-4">
                <Button 
                  onClick={() => navigate('/edit-profile-couple')}
                  className="bg-white/90 text-gray-800 hover:bg-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Información básica */}
        <Card className="bg-white shadow-xl">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.coupleName}</h2>
              <div className="flex items-center justify-center space-x-4 text-gray-600 mb-4">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </span>
                <span>•</span>
                <span>{profile.ageRange}</span>
              </div>
              
              {/* Bio Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Sobre nosotros</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {profile.bio || "Pareja auténtica buscando conexiones reales y experiencias únicas. Nos encanta explorar juntos y conocer gente nueva."}
                </p>
              </div>
              
              {/* Partners Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="font-medium text-gray-900">{profile.partner1.name}:</span>
                  <p className="text-gray-600">{profile.partner1.age || 26} años</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="font-medium text-gray-900">{profile.partner2.name}:</span>
                  <p className="text-gray-600">{profile.partner2.age || 28} años</p>
                </div>
              </div>
            </div>
            
            <ProfileStats 
              stats={{
                likes: profile.stats?.likes || 245,
                matches: profile.stats?.matches || 32,
                visits: profile.stats?.visits || 187
              }}
            />
          </CardContent>
        </Card>

        {/* Intereses */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Intereses</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.interests?.map((interest: string, index: number) => (
                <Badge key={index} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm py-2 px-4 font-medium shadow-lg">
                  {interest}
                </Badge>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Buscando:</strong> {profile.lookingFor || "Conexiones auténticas y experiencias únicas"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Estilo de vida:</strong> {profile.lifestyle || "Aventurero y espontáneo"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Nivel de experiencia:</strong> {profile.experienceLevel || "Intermedio"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Galería de fotos adicionales */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Más fotos</h3>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Foto {index}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Acciones (solo si no es perfil propio) */}
        {!isOwnProfile && (
          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white py-3"
              size="lg"
            >
              <Heart className="h-5 w-5 mr-2" />
              Me gusta
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50 py-3"
              size="lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Enviar mensaje
            </Button>
          </div>
        )}
      </div>

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

export default ProfileCouple;
