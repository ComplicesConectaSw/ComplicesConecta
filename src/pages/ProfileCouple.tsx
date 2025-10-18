import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Verified, Crown, Settings, Share2, Lock, Images, Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavigationEnhanced from "@/components/NavigationEnhanced";
import { generateMockCoupleProfiles, type CoupleProfileWithPartners } from "@/lib/coupleProfiles";
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import { usePersistedState } from '@/hooks/usePersistedState';
import { PrivateImageRequest } from '@/components/profile/PrivateImageRequest';
import { PrivateImageGallery } from '@/components/profile/PrivateImageGallery';
import { ReportDialog } from '@/components/swipe/ReportDialog';
import { ProfileNavTabs } from '@/components/profile/ProfileNavTabs';

const ProfileCouple: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CoupleProfileWithPartners | null>(null);
  const [loading, setLoading] = useState(true);
  const [_activeTab, _setActiveTab] = useState<'couple' | 'individual'>('couple');
  const [showPrivateImageRequest, setShowPrivateImageRequest] = useState(false);
  const [privateImageAccess, setPrivateImageAccess] = useState<'none' | 'pending' | 'approved' | 'denied'>('none');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const { isAuthenticated, user, profile: authProfile } = useAuth();
  
  // Determinar si es el perfil propio
  const isOwnProfile = user?.id === profile?.id;

  // Handlers para las acciones del perfil
  const handleUploadImage = () => {
    logger.info('Subir imagen solicitado');
    // Implementar lógica de subida de imagen
  };

  const handleDeletePost = (postId: string) => {
    logger.info('Eliminar post solicitado', { postId });
    // Implementar lógica de eliminación de post
  };

  const handleCommentPost = (postId: string) => {
    logger.info('Comentar post solicitado', { postId });
    // Implementar lógica de comentario
  };
  
  // Migración localStorage → usePersistedState
  const [demoAuth, _setDemoAuth] = usePersistedState('demo_authenticated', 'false');
  const [demoUser, _setDemoUser] = usePersistedState<any>('demo_user', null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        logger.info('🔍 ProfileCouple - Estado de autenticación:', {
          isAuthenticated,
          user: !!user,
          authProfile: !!authProfile
        });

        // Verificar si hay sesión demo activa PRIMERO
        if (demoAuth === 'true' && demoUser) {
          try {
            const parsedUser = typeof demoUser === 'string' ? JSON.parse(demoUser) : demoUser;
            logger.info('🎭 Cargando perfil demo pareja:', parsedUser);
            
            // Usar el perfil demo o generar uno basado en los datos demo
            const mockCoupleProfiles = generateMockCoupleProfiles();
            const demoProfile = mockCoupleProfiles[0]; // Usar el primer perfil como demo
            
            setProfile(demoProfile);
            setLoading(false);
            return;
          } catch (error) {
            logger.error('Error parseando usuario demo pareja:', { error: String(error) });
          }
        }
        
        // Verificar autenticación usando useAuth
        if (!isAuthenticated) {
          logger.info('❌ No autenticado, redirigiendo a auth');
          navigate('/auth', { replace: true });
          return;
        }
        
        // Simular carga de perfil de pareja real
        setTimeout(() => {
          const mockCoupleProfiles = generateMockCoupleProfiles();
          const selectedProfile = mockCoupleProfiles[0];
          
          setProfile(selectedProfile);
          setLoading(false);
        }, 1500);
        
      } catch (error) {
        logger.error('Error loading profile:', { error: String(error) });
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
    <div className="min-h-screen relative overflow-hidden bg-hero-gradient profile-page">
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
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white text-center flex-1 min-w-0 px-2 truncate">
              {profile ? profile.couple_name : 'Pareja'}
            </h1>
            <div className="flex gap-1 sm:gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="bg-white/10 hover:bg-white/20 p-2 transition-all duration-300 hover:scale-105"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({
                      title: `Perfil de ${profile ? profile.partner1_first_name : 'Ella'} y ${profile ? profile.partner2_first_name : 'Él'}`,
                      text: `Conoce a esta pareja en ComplicesConecta`,
                      url: window.location.href
                    }).catch(console.error);
                  } else {
                    navigator.clipboard.writeText(window.location.href).then(() => 
                      alert('Enlace copiado al portapapeles')
                    ).catch(console.error);
                  }
                }}
              >
                <Share2 className="h-4 w-4 text-white opacity-90" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/edit-profile-couple');
                }}
                className="hover:bg-white/20 p-2 transition-all duration-300 hover:scale-105"
              >
                <Settings className="h-4 w-4 text-white" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/tokens');
                }}
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate('/edit-profile-couple');
                        }}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
                        size="sm"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">Editar Perfil</span>
                        <span className="sm:hidden">Editar</span>
                      </Button>
                      
                      <Button 
                        onClick={() => setShowReportDialog(true)}
                        variant="outline"
                        className="bg-red-500/20 hover:bg-red-600/30 text-red-200 border-red-400/30 flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
                        size="sm"
                      >
                        <Flag className="w-4 h-4" />
                        <span className="hidden sm:inline">Reportar</span>
                        <span className="sm:hidden">Report</span>
                      </Button>
                      
                      {/* Botón para solicitar acceso a fotos privadas */}
                      {privateImageAccess === 'none' && (
                        <Button 
                          onClick={() => setShowPrivateImageRequest(true)}
                          className="bg-purple-600/80 hover:bg-purple-700/80 text-white flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
                          size="sm"
                        >
                          <Lock className="w-4 h-4" />
                          <span className="hidden sm:inline">Ver Fotos Privadas</span>
                          <span className="sm:hidden">Privadas</span>
                        </Button>
                      )}
                      
                      {/* Estado de solicitud pendiente */}
                      {privateImageAccess === 'pending' && (
                        <Button 
                          disabled
                          className="bg-yellow-600/80 text-white flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
                          size="sm"
                        >
                          <Lock className="w-4 h-4" />
                          <span className="hidden sm:inline">Solicitud Pendiente</span>
                          <span className="sm:hidden">Pendiente</span>
                        </Button>
                      )}
                      
                      {/* Acceso aprobado */}
                      {privateImageAccess === 'approved' && (
                        <Button 
                          onClick={() => {/* Mostrar galería privada */}}
                          className="bg-green-600/80 hover:bg-green-700/80 text-white flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
                          size="sm"
                        >
                          <Images className="w-4 h-4" />
                          <span className="hidden sm:inline">Fotos Privadas</span>
                          <span className="sm:hidden">Privadas</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Navigation Tabs - Estilo Twitter/Instagram */}
            <ProfileNavTabs 
              isOwnProfile={isOwnProfile}
              onUploadImage={handleUploadImage}
              onDeletePost={handleDeletePost}
              onCommentPost={handleCommentPost}
            />

            {/* Galería privada - solo si tiene acceso aprobado */}
            {privateImageAccess === 'approved' && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white mt-6">
                <CardContent className="p-4 sm:p-6">
                  <PrivateImageGallery 
                    profileId={profile?.id || ''}
                    profileName={profile ? `${profile.partner1_first_name || ''} & ${profile.partner2_first_name || ''}` : 'Pareja'}
                    profileType="couple"
                    isOwner={false}
                    hasAccess={true}
                    images={[
                      {
                        id: '1',
                        url: '/src/assets/people/privado/coupleprivjpg.jpg',
                        thumbnail: '/src/assets/people/privado/coupleprivjpg.jpg',
                        uploadedAt: new Date()
                      }
                    ]}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navegación inferior fija */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <NavigationEnhanced />
        </div>
      </div>
      
      {/* Modal de solicitud de acceso a fotos privadas */}
      {showPrivateImageRequest && (
        <PrivateImageRequest
          isOpen={showPrivateImageRequest}
          onClose={() => setShowPrivateImageRequest(false)}
          profileId={profile?.id || ''}
          profileName={profile ? `${profile.partner1_first_name || ''} & ${profile.partner2_first_name || ''}` : 'Pareja'}
          profileType="couple"
          onRequestSent={() => {
            setPrivateImageAccess('pending');
            setShowPrivateImageRequest(false);
          }}
        />
      )}

      {/* Modal de reporte */}
      <ReportDialog
        profileId={profile?.id || ''}
        profileName={profile ? `${profile.partner1_first_name || ''} & ${profile.partner2_first_name || ''}` : 'Pareja'}
        isOpen={showReportDialog}
        onOpenChange={setShowReportDialog}
        onReport={(reason) => {
          console.log('Perfil reportado por:', reason);
          // Aquí se implementará la lógica de reporte
        }}
      />
    </div>
  );
};

export default ProfileCouple;