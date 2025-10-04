import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Heart, 
  MapPin, 
  Edit, 
  Lock,
  Flag,
  CheckCircle,
  Crown,
  Images
} from 'lucide-react';
import NavigationEnhanced from '@/components/NavigationEnhanced';
import { ProfileNavTabs } from '@/components/profile/ProfileNavTabs';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { Tables } from '@/integrations/supabase/types';
import { PrivateImageRequest } from '@/components/profile/PrivateImageRequest';
import { PrivateImageGallery } from '@/components/profile/PrivateImageGallery';
import { ReportDialog } from '@/components/swipe/ReportDialog';

const ProfileSingle: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile: _authProfile, isAuthenticated: _isAuthenticated } = useAuth();
  const [profile, _setProfile] = useState<Tables<'profiles'> | null>(null);
  const [_isLoading, _setIsLoading] = useState(true);
  const [_showPrivateImageRequest, _setShowPrivateImageRequest] = useState(false);
  const [_privateImageAccess, _setPrivateImageAccess] = usePersistedState<'none' | 'pending' | 'approved' | 'denied'>('private_image_access', 'none');
  const [_showReportDialog, _setShowReportDialog] = useState(false);
  
  // Determinar si es el perfil propio
  const isOwnProfile = user?.id === profile?.user_id;

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
  const [_demoAuth, _setDemoAuth] = usePersistedState('demo_authenticated', 'false');
  const [_demoUser, _setDemoUser] = usePersistedState<any>('demo_user', null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Solo log una vez al montar el componente
        if (!profile) {
          logger.info('🔍 ProfileSingle - Estado de autenticación:', {
            user: !!user,
            authProfile: !!authProfile,
            isDemo: authProfile?.is_demo,
            userEmail: user?.email,
            isAuthenticated,
            demoAuth,
            demoAuthType: typeof demoAuth,
            demoUser: !!demoUser
          });
        }
        
        // Verificar si hay sesión demo activa PRIMERO - manejar tanto string como boolean
        const isDemoActive = (String(demoAuth) === 'true') && demoUser;
        if (isDemoActive && !profile) {
          try {
            const parsedUser = typeof demoUser === 'string' ? JSON.parse(demoUser) : demoUser;
            
            // Crear perfil demo estático una sola vez
            const profileData: Tables<'profiles'> = {
              id: parsedUser.id || 'demo-single-1',
              name: parsedUser.first_name || 'Sofía',
              user_id: parsedUser.id || 'demo-user-1',
              age: 28,
              bio: 'Explorando nuevas conexiones y experiencias auténticas. Me encanta viajar, la música y conocer personas interesantes.',
              account_type: parsedUser.accountType || 'single',
              age_range_max: null,
              age_range_min: null,
              avatar_url: '/compliceslogo.png',
              blocked_at: null,
              blocked_reason: null,
              created_at: new Date().toISOString(),
              gender: 'female',
              interested_in: null,
              interests: ['Viajes', 'Música', 'Arte', 'Cocina', 'Fotografía'],
              is_active: true,
              is_blocked: false,
              is_demo: true,
              is_premium: false,
              is_verified: true,
              location: 'Ciudad de México, México',
              looking_for: null,
              max_distance: null,
              suspension_end_date: null,
              swinger_experience: null,
              updated_at: new Date().toISOString(),
              warnings_count: null
            };
            
            setProfile(profileData);
            setIsLoading(false);
            return;
          } catch (error) {
            logger.error('Error parseando usuario demo:', { error: String(error) });
          }
        }
        
        // Si authProfile ya está disponible, usarlo directamente
        if (authProfile && authProfile.id) {
          logger.info('📄 Perfil cargado exitosamente:', { name: authProfile.name });
          setProfile(authProfile);
          setIsLoading(false);
          return;
        }
        
        // Si hay usuario pero no perfil, esperar a que se cargue
        if (user && !authProfile) {
          logger.info('⏳ Usuario autenticado, esperando carga del perfil...');
          // Mantener loading state hasta que el perfil se cargue
          return;
        }
        
        // Si no hay autenticación válida Y no es demo, redirigir
        if (!isAuthenticated && !(String(demoAuth) === 'true' && demoUser)) {
          logger.info('❌ No hay autenticación válida, redirigiendo...');
          navigate('/auth', { replace: true });
          return;
        }
        
        // Si llegamos aquí sin perfil ni usuario pero con demo, mostrar error
        if (String(demoAuth) === 'true' && demoUser && !profile) {
          logger.info('⚠️ Demo autenticado pero perfil no cargado, reintentando...');
          // El perfil demo debería haberse cargado arriba, algo falló
          setIsLoading(false);
          return;
        }
        
        // Estado inesperado final - solo log una vez
        if (!profile) {
          logger.info('⚠️ Estado inesperado: sin usuario ni perfil válido');
        }
        setIsLoading(false);
      } catch (error) {
        logger.error('Error cargando perfil:', { error: String(error) });
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [user, authProfile, isAuthenticated, navigate, demoAuth, demoUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Perfil no encontrado</h2>
            <p className="text-white/80 mb-4">No se pudo cargar la información del perfil.</p>
            <Button onClick={() => navigate('/discover')} className="border border-white/30 bg-transparent text-white hover:bg-white/10">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800">
      {/* Navegación superior */}
      <NavigationEnhanced />
      
      {/* Header con navegación */}
      <div className="relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 pt-8 pb-6 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              Mi Perfil - {profile.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Contenido principal con scroll personalizado */}
      <div className="relative z-10 pb-20 px-2 sm:px-4 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Información principal del perfil */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-4xl font-bold">
                    {profile.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {profile.is_verified && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                  {profile.is_premium && (
                    <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full p-1">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                {/* Información básica */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">
                    {profile.name}
                  </h2>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                    <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                      {profile.age} años
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                      {profile.gender || 'No especificado'}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30 flex items-center gap-1 text-xs sm:text-sm">
                      <MapPin className="w-3 h-3" />
                      {profile.location || 'CDMX, México'}
                    </Badge>
                  </div>
                  
                  {/* Biografía */}
                  {profile.bio && (
                    <p className="text-white/90 mb-4 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}

                  {/* Botones de acción */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                    <Button 
                      onClick={() => navigate('/edit-profile-single')}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar Perfil</span>
                      <span className="sm:hidden">Editar</span>
                    </Button>
                    
                    <Button 
                      onClick={() => setShowReportDialog(true)}
                      className="bg-red-500/20 hover:bg-red-600/30 text-red-200 border-red-400/30 flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2 border"
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

          {/* Estadísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-3 sm:p-4 text-center">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-pink-400" />
                <div className="text-lg sm:text-2xl font-bold">{(profile as any).likes || 0}</div>
                <div className="text-xs sm:text-sm text-white/70">Likes</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-purple-400">8</div>
                <div className="text-xs sm:text-sm text-white/80">Conversaciones</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">156</div>
                <div className="text-sm text-white/80">Visitas</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-400">95%</div>
                <div className="text-xs sm:text-sm text-white/80">Compatibilidad</div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Navigation Tabs - Estilo Twitter/Instagram */}
          <ProfileNavTabs 
            isOwnProfile={isOwnProfile}
            onUploadImage={handleUploadImage}
            onDeletePost={handleDeletePost}
            onCommentPost={handleCommentPost}
          />

          {/* Intereses */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-white">Mis Intereses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Viajes', 'Música', 'Deportes', 'Cocina', 'Lectura', 'Cine', 'Arte', 'Naturaleza'].map((interest) => (
                  <Badge 
                    key={interest} 
                    className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-white border-pink-400/30 hover:bg-pink-500/30 transition-colors"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Galería */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Images className="w-5 h-5" />
                Galería de Fotos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mostrar mensaje de acceso denegado si corresponde */}
              {privateImageAccess === 'denied' && (
                <div className="text-center py-8">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-red-400" />
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Acceso Denegado</h3>
                  <p className="text-white/70">Tu solicitud para ver las fotos privadas fue denegada.</p>
                </div>
              )}
              
              {/* Galería pública siempre visible */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="aspect-square bg-gradient-to-br from-pink-400 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="/placeholder.svg" 
                    alt="Foto pública 1"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/compliceslogo.png';
                    }}
                  />
                  <Camera className="w-8 h-8 text-white hidden" />
                </div>
                <div className="aspect-square bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="/compliceslogo.png" 
                    alt="Foto pública 2"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <Camera className="w-8 h-8 text-white hidden" />
                </div>
                <div className="aspect-square bg-gradient-to-br from-blue-400 to-teal-600 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="/compliceslogo.png" 
                    alt="Foto pública 3"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <Camera className="w-8 h-8 text-white hidden" />
                </div>
              </div>

              {/* Galería privada - visible solo para el dueño del perfil */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Fotos Privadas
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="aspect-square rounded-lg overflow-hidden relative">
                    <img 
                      src="/compliceslogo.png" 
                      alt="Foto privada 1"
                      className={`w-full h-full object-cover ${(profile as any)?.isOwner ? '' : 'filter blur-md'}`}
                    />
                    {!(profile as any)?.isOwner && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden relative">
                    <img 
                      src="/compliceslogo.png" 
                      alt="Foto privada 2"
                      className={`w-full h-full object-cover ${(profile as any)?.isOwner ? '' : 'filter blur-md'}`}
                    />
                    {!(profile as any)?.isOwner && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden relative">
                    <img 
                      src="/compliceslogo.png" 
                      alt="Foto privada 3"
                      className={`w-full h-full object-cover ${(profile as any)?.isOwner ? '' : 'filter blur-md'}`}
                    />
                    {!(profile as any)?.isOwner && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Galería privada - solo si tiene acceso aprobado */}
              {privateImageAccess === 'approved' && (
                <PrivateImageGallery 
                  profileId={profile?.id || ''}
                  profileName={profile?.name || 'Usuario'}
                  profileType="single"
                  isOwner={false}
                  hasAccess={true}
                  images={[
                    {
                      id: '1',
                      url: '/placeholder.svg',
                      thumbnail: '/placeholder.svg',
                      uploadedAt: new Date()
                    }
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal de solicitud de acceso a fotos privadas */}
      {showPrivateImageRequest && (
        <PrivateImageRequest
          isOpen={showPrivateImageRequest}
          onClose={() => setShowPrivateImageRequest(false)}
          profileId={profile?.id || ''}
          profileName={profile?.name || ''}
          profileType="single"
          onRequestSent={() => {
            setPrivateImageAccess('pending');
            setShowPrivateImageRequest(false);
          }}
        />
      )}

      {/* Modal de reporte */}
      <ReportDialog
        profileId={profile?.id || ''}
        profileName={profile?.name || 'Usuario'}
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

export default ProfileSingle;
