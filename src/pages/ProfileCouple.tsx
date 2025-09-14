import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MapPin, Verified, Crown, ArrowLeft, Settings, Share2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { generateMockCoupleProfiles, type CoupleProfileWithPartners } from "@/lib/coupleProfiles";
import CoupleProfileHeader from "@/components/profile/CoupleProfileHeader";
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

const ProfileCouple: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CoupleProfileWithPartners | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'couple' | 'individual'>('couple');
  const { isAuthenticated, user, profile: authProfile } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        logger.info('🔍 ProfileCouple - Estado de autenticación:', {
          isAuthenticated,
          user: !!user,
          authProfile: !!authProfile
        });

        // Verificar autenticación usando useAuth
        if (!isAuthenticated) {
          logger.info('❌ No autenticado, redirigiendo a auth');
          navigate('/auth', { replace: true });
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
        logger.error('Error loading profile:', error);
        // Fallback a perfil mock
        const mockCoupleProfiles = generateMockCoupleProfiles();
        setProfile(mockCoupleProfiles[0]);
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [isAuthenticated, navigate]);

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
        {/* Header con navegación completa */}
        <Navigation />
        
        <div className="bg-black/80 backdrop-blur-md border-b border-white/30 p-3 sm:p-4 shadow-lg flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
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
          <div className="max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
            {/* Información principal de la pareja */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  {/* Avatares de la pareja */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                        {profile?.partner1_first_name?.[0]?.toUpperCase() || 'E'}
                      </div>
                      {profile?.is_verified && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                          <Verified className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400 animate-pulse" />
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                        {profile?.partner2_first_name?.[0]?.toUpperCase() || 'É'}
                      </div>
                      {profile?.is_verified && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                          <Verified className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información básica */}
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">
                      {profile?.partner1_first_name} & {profile?.partner2_first_name}
                    </h2>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                        Pareja
                      </Badge>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 flex items-center gap-1 text-xs sm:text-sm">
                        <MapPin className="w-3 h-3" />
                        {profile?.location || 'CDMX, México'}
                      </Badge>
                    </div>
                    
                    {/* Biografía */}
                    <p className="text-white/90 mb-4 leading-relaxed text-sm sm:text-base">
                      Una pareja aventurera que busca nuevas experiencias y conexiones auténticas.
                    </p>

                    {/* Botones de acción */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                      <Button 
                        onClick={() => navigate('/edit-profile-couple')}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
                        size="sm"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">Editar Perfil</span>
                        <span className="sm:hidden">Editar</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-purple-300/30 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{profile ? profile.couple_name : 'Pareja'}</h3>
                  <div className="flex items-center justify-center space-x-4 text-white/90 mb-4">
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
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/20 shadow-sm">
                    <h3 className="font-semibold text-white mb-2">Sobre nosotros</h3>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {profile?.couple_bio}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-sm rounded-lg p-4 border-2 border-pink-400/30 shadow-lg">
                      <div className="text-center mb-4">
                        <img 
                          src='https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=faces' 
                          alt={profile?.partner1_first_name || 'Ella'}
                          className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-pink-400 shadow-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=faces';
                          }}
                        />
                        <h3 className="text-xl font-bold text-white">{profile?.partner1_first_name || 'Ella'}</h3>
                        <p className="text-white/90 font-medium">{profile?.partner1_age || 28} años</p>
                        <p className="text-sm text-white/80 leading-relaxed">{profile?.partner1_bio || 'Soy una persona aventurera que disfruta de la vida al máximo.'}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-2">Sobre ella:</h4>
                        <p className="text-sm text-white/90 leading-relaxed">{profile?.partner1_bio || 'Me encanta explorar nuevas experiencias junto a mi pareja.'}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2">Sus intereses:</h4>
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar">
                          {['Lifestyle Swinger', 'Intercambio de Parejas', 'Encuentros Casuales', 'Fiestas Temáticas', 'Clubs Privados', 'Eventos Lifestyle'].map((interest: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-white/20 text-white border border-white/30">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-lg p-4 border-2 border-purple-400/30 shadow-lg">
                      <div className="text-center mb-4">
                        <img 
                          src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces' 
                          alt={profile?.partner2_first_name || 'Él'}
                          className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-purple-400 shadow-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces';
                          }}
                        />
                        <h3 className="text-xl font-bold text-white">{profile?.partner2_first_name || 'Él'}</h3>
                        <p className="text-white/90 font-medium">{profile?.partner2_age || 30} años</p>
                        <p className="text-white/80 text-sm">Profesional</p>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-2">Sobre él:</h4>
                        <p className="text-sm text-white/90 leading-relaxed">{profile?.partner2_bio || 'Aventurero y respetuoso, busco junto a mi pareja vivir experiencias únicas.'}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2">Sus intereses:</h4>
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar">
                          {['Fiestas Temáticas', 'Clubs Privados', 'Eventos Lifestyle', 'Soft Swap', 'Full Swap', 'Experiencias Nuevas'].map((interest: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-white/20 text-white border border-white/30">
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