import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MapPin, Verified, Crown, ArrowLeft, Settings, Share2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { generateMockCouple } from "@/lib/data";

interface Partner {
  name: string;
  age: number;
  profession: string;
  bio: string;
  avatar: string;
  interests: string[];
}

interface CoupleProfile {
  id: number;
  coupleName: string;
  location: string;
  bio: string;
  avatar: string;
  isOnline: boolean;
  isVerified: boolean;
  isPremium: boolean;
  partner1: Partner;
  partner2: Partner;
  accountType?: string;
}

const ProfileCouple: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CoupleProfile | null>(null);

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
      // Asegurar que el usuario tenga la estructura correcta
      const coupleProfile: CoupleProfile = {
        ...user,
        partner1: user.partner1 || {
          name: user.name?.split(' & ')[0] || 'Ella',
          age: 28,
          profession: 'Profesional',
          bio: 'Me encanta explorar nuevas experiencias junto a mi pareja.',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
          interests: ['Lifestyle Swinger', 'Intercambio de Parejas', 'Encuentros Casuales']
        },
        partner2: user.partner2 || {
          name: user.name?.split(' & ')[1] || 'Él',
          age: 30,
          profession: 'Profesional',
          bio: 'Aventurero y respetuoso, busco junto a mi pareja vivir experiencias únicas.',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
          interests: ['Fiestas Temáticas', 'Clubs Privados', 'Eventos Lifestyle']
        }
      };
      setProfile(coupleProfile);
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
          <p className="text-white">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600">
      {/* Fixed background layers */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-600/90 via-pink-500/90 to-indigo-600/90"></div>
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400/20 via-pink-400/20 to-transparent"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/80 backdrop-blur-md border-b border-white/30 p-3 sm:p-4 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/profile')}
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <h1 className="text-base sm:text-lg font-semibold text-white truncate flex-1 text-center">Nuestro Perfil</h1>
            <div className="flex gap-1 sm:gap-2">
              <Button variant="ghost" size="sm" className="hover:bg-white/20 p-2">
                <Share2 className="h-4 w-4 text-white" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/edit-profile-couple')}
                className="hover:bg-white/20 p-2"
              >
                <Settings className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-2 sm:p-4 pb-24 space-y-4 sm:space-y-6 max-w-2xl mx-auto max-h-screen overflow-y-auto">
          {/* Foto principal de la pareja */}
          <Card className="overflow-hidden bg-white/90 backdrop-blur-md shadow-glow border-0">
            <div className="relative">
              <img 
                alt={profile.coupleName || 'Pareja'} 
                className="w-full h-96 sm:h-[500px] object-cover object-center" 
                src={profile.avatar || 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400'}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400';
                }}
              />
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
            </div>
          </Card>

          {/* Información básica de la pareja */}
          <Card className="bg-white/90 backdrop-blur-md shadow-lg border-0">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{profile.coupleName || 'Pareja'}</h2>
                <div className="flex items-center justify-center space-x-4 text-gray-700 mb-4">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profile.location}
                  </span>
                </div>
                
                {/* Bio de la pareja */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">Sobre nosotros</h3>
                  <p className="text-gray-800 leading-relaxed">{profile.bio}</p>
                </div>
              </div>

              {/* Información individual de cada partner */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Partner 1 - Ella */}
                <div className="bg-gradient-to-br from-pink-100/80 to-rose-100/80 backdrop-blur-sm rounded-lg p-4 border-2 border-pink-300/50 shadow-lg">
                  <div className="text-center mb-4">
                    <img 
                      src={profile.partner1?.avatar || 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=faces'} 
                      alt={profile.partner1?.name || 'Ella'}
                      className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-pink-400 shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=faces';
                      }}
                    />
                    <h3 className="text-xl font-bold text-pink-900">{profile.partner1?.name || 'Ella'}</h3>
                    <p className="text-pink-700 font-medium">{profile.partner1?.age || 28} años</p>
                    <p className="text-sm text-pink-600">{profile.partner1?.profession || 'Profesional'}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-pink-800 mb-2">Sobre ella:</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{profile.partner1?.bio || 'Me encanta explorar nuevas experiencias junto a mi pareja.'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-pink-800 mb-2">Sus intereses:</h4>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {(profile.partner1?.interests || ['Lifestyle Swinger', 'Intercambio de Parejas', 'Encuentros Casuales', 'Fiestas Temáticas', 'Clubs Privados', 'Eventos Lifestyle']).map((interest: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-pink-200 text-pink-900 border border-pink-300">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Partner 2 - Él */}
                <div className="bg-gradient-to-br from-blue-100/80 to-sky-100/80 backdrop-blur-sm rounded-lg p-4 border-2 border-blue-300/50 shadow-lg">
                  <div className="text-center mb-4">
                    <img 
                      src={profile.partner2?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces'} 
                      alt={profile.partner2?.name || 'Él'}
                      className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-blue-400 shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces';
                      }}
                    />
                    <h3 className="text-xl font-bold text-blue-900">{profile.partner2?.name || 'Él'}</h3>
                    <p className="text-blue-700 font-medium">{profile.partner2?.age || 30} años</p>
                    <p className="text-sm text-blue-600">{profile.partner2?.profession || 'Profesional'}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Sobre él:</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{profile.partner2?.bio || 'Aventurero y respetuoso, busco junto a mi pareja vivir experiencias únicas.'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Sus intereses:</h4>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {(profile.partner2?.interests || ['Fiestas Temáticas', 'Clubs Privados', 'Eventos Lifestyle', 'Soft Swap', 'Full Swap', 'Experiencias Nuevas']).map((interest: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-blue-200 text-blue-900 border border-blue-300">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex gap-3">
            <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Heart className="h-4 w-4 mr-2" />
              Me Gusta
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Mensaje
            </Button>
          </div>
        </div>

        <Navigation />
      </div>
    </div>
  );
};

export default ProfileCouple;
