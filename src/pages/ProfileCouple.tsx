import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MapPin, Verified, Crown, ArrowLeft, Settings, Share2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { generateMockCoupleProfiles, type CoupleProfileWithPartners } from "@/lib/coupleProfiles";
import CoupleProfileHeader from "@/components/profile/CoupleProfileHeader";

const ProfileCouple: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CoupleProfileWithPartners | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'couple' | 'individual'>('couple');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Verificar autenticación demo y cargar perfil del usuario
        const demoAuth = localStorage.getItem('demo_authenticated');
        const demoUser = localStorage.getItem('demo_user');
        
        if (demoAuth !== 'true' || !demoUser) {
          navigate('/discover');
          return;
        }
        
        // Simular carga de perfil de pareja
        setTimeout(() => {
          // Usar el nuevo sistema de perfiles de pareja
          const mockCoupleProfiles = generateMockCoupleProfiles();
          const selectedProfile = mockCoupleProfiles[0]; // Usar el primer perfil como ejemplo
          
          setProfile(selectedProfile);
          setLoading(false);
        }, 1500);
        
      } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback a perfil mock
        const mockCoupleProfiles = generateMockCoupleProfiles();
        setProfile(mockCoupleProfiles[0]);
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [navigate]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-hero-gradient">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-gradient-x"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-secondary/10 to-primary/15 animate-gradient-y"></div>
          </div>
          
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-slow"></div>
            <div className="absolute top-40 right-32 w-48 h-48 bg-accent/8 rounded-full blur-2xl animate-float-reverse"></div>
            <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-secondary/4 rounded-full blur-3xl animate-float-slow shape-delay-2"></div>
            <div className="absolute bottom-20 right-20 w-56 h-56 bg-primary/6 rounded-full blur-2xl animate-float shape-delay-1"></div>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="bg-black/80 backdrop-blur-md border-b border-white/30 p-3 sm:p-4 shadow-lg flex-shrink-0">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-3 text-white">Cargando perfil...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-hero-gradient">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-gradient-x"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-secondary/10 to-primary/15 animate-gradient-y"></div>
        </div>
        
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-40 right-32 w-48 h-48 bg-accent/8 rounded-full blur-2xl animate-float-reverse"></div>
          <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-secondary/4 rounded-full blur-3xl animate-float-slow shape-delay-2"></div>
          <div className="absolute bottom-20 right-20 w-56 h-56 bg-primary/6 rounded-full blur-2xl animate-float shape-delay-1"></div>
        </div>
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="bg-black/80 backdrop-blur-md border-b border-white/30 p-3 sm:p-4 shadow-lg flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/profiles')}
              className="text-white hover:bg-white/20 text-sm sm:text-base p-2"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="ml-1 sm:ml-2">Regresar</span>
            </Button>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white text-center flex-1 min-w-0 px-2 truncate">
              {profile ? profile.couple_name : 'Pareja'}
            </h1>
            <div className="flex gap-1 sm:gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="bg-white/10 hover:bg-white/20 p-2 transition-all duration-300 hover:scale-105"
                onClick={() => {
                  navigator.share ? 
                    navigator.share({
                      title: `Perfil de ${profile ? profile.partner1_first_name : 'Ella'} y ${profile ? profile.partner2_first_name : 'Él'}`,
                      text: `Conoce a esta pareja en ComplicesConecta`,
                      url: window.location.href
                    }) : 
                    navigator.clipboard.writeText(window.location.href).then(() => 
                      alert('Enlace copiado al portapapeles')
                    )
                }}
              >
                <Share2 className="h-4 w-4 text-white opacity-90" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/edit-profile-couple')}
                className="hover:bg-white/20 p-2 transition-all duration-300 hover:scale-105"
              >
                <Settings className="h-4 w-4 text-white" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/tokens')}
                className="hover:bg-white/20 p-2 transition-all duration-300 hover:scale-105"
              >
                <Crown className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-2 sm:p-4 pb-20 sm:pb-32 space-y-4 sm:space-y-6 max-w-2xl mx-auto min-h-full">
            <Card className="overflow-hidden bg-white/90 backdrop-blur-md shadow-glow border-0">
              <div className="relative">
                <div className="aspect-[3/4] rounded-t-lg overflow-hidden mb-4 relative bg-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&h=625&fit=crop&crop=faces" 
                    alt={profile ? profile.couple_name : 'Pareja'} 
                    className="w-full h-full object-cover"
                  />
                  {profile && profile.isOnline && (
                    <Badge className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 text-xs">
                      En línea
                    </Badge>
                  )}
                  {profile && profile.is_verified && (
                    <Badge className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 text-xs">
                      <Verified className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                  {profile && profile.is_premium && (
                    <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button 
                    onClick={() => navigate('/edit-profile-couple')}
                    className="bg-white/90 text-black hover:bg-white transition-all duration-300 hover:scale-105"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button 
                    onClick={() => navigate('/tokens')}
                    className="bg-purple-500/90 text-white hover:bg-purple-600 transition-all duration-300 hover:scale-105"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Tokens
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="bg-white/90 backdrop-blur-md shadow-lg border-0">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{profile ? profile.couple_name : 'Pareja'}</h3>
                  <div className="flex items-center justify-center space-x-4 text-gray-600 mb-4">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile ? profile.location : 'Ubicación'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Pareja
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-2">Sobre nosotros</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {profile?.couple_bio}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-pink-100/80 to-rose-100/80 backdrop-blur-sm rounded-lg p-4 border-2 border-pink-300/50 shadow-lg">
                      <div className="text-center mb-4">
                        <img 
                          src='https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=faces' 
                          alt={profile?.partner1_first_name || 'Ella'}
                          className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-pink-400 shadow-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=faces';
                          }}
                        />
                        <h3 className="text-xl font-bold text-pink-900">{profile?.partner1_first_name || 'Ella'}</h3>
                        <p className="text-pink-700 font-medium">{profile?.partner1_age || 28} años</p>
                        <p className="text-sm text-pink-700 leading-relaxed">{profile?.partner1_bio || 'Soy una persona aventurera que disfruta de la vida al máximo.'}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-pink-800 mb-2">Sobre ella:</h4>
                        <p className="text-sm text-pink-700 leading-relaxed">{profile?.partner1_bio || 'Me encanta explorar nuevas experiencias junto a mi pareja.'}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-pink-800 mb-2">Sus intereses:</h4>
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar">
                          {['Lifestyle Swinger', 'Intercambio de Parejas', 'Encuentros Casuales', 'Fiestas Temáticas', 'Clubs Privados', 'Eventos Lifestyle'].map((interest: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-pink-200 text-pink-900 border border-pink-300">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-100/80 to-sky-100/80 backdrop-blur-sm rounded-lg p-4 border-2 border-blue-300/50 shadow-lg">
                      <div className="text-center mb-4">
                        <img 
                          src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces' 
                          alt={profile?.partner2_first_name || 'Él'}
                          className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-blue-400 shadow-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces';
                          }}
                        />
                        <h3 className="text-xl font-bold text-blue-900">{profile?.partner2_first_name || 'Él'}</h3>
                        <p className="text-blue-700 font-medium">{profile?.partner2_age || 30} años</p>
                        <p className="text-blue-700 text-sm">Profesional</p>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Sobre él:</h4>
                        <p className="text-sm text-blue-700 leading-relaxed">{profile?.partner2_bio || 'Aventurero y respetuoso, busco junto a mi pareja vivir experiencias únicas.'}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">Sus intereses:</h4>
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar">
                          {['Fiestas Temáticas', 'Clubs Privados', 'Eventos Lifestyle', 'Soft Swap', 'Full Swap', 'Experiencias Nuevas'].map((interest: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-blue-200 text-blue-900 border border-blue-300">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          
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
        </div>

        <Navigation />
      </div>
    </div>
  );
};

export default ProfileCouple;