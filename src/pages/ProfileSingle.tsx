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
  Images,
  Share2,
  Download,
  Star,
  Eye,
  Users,
  MessageCircle,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react';
import NavigationEnhanced from '@/components/NavigationEnhanced';
import { ProfileNavTabs } from '@/components/profile/ProfileNavTabs';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { Database } from '@/types/supabase';
import { PrivateImageRequest } from '@/components/profile/PrivateImageRequest';
import { PrivateImageGallery } from '@/components/profile/PrivateImageGallery';
import { ReportDialog } from '@/components/swipe/ReportDialog';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProfileSingle: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile: authProfile, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrivateImageRequest, setShowPrivateImageRequest] = useState(false);
  const [privateImageAccess, setPrivateImageAccess] = usePersistedState<'none' | 'pending' | 'approved' | 'denied'>('private_image_access', 'none');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileStats, setProfileStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalMatches: 0,
    profileCompleteness: 0,
    lastActive: new Date(),
    joinDate: new Date(),
    verificationLevel: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  
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

  // Funciones para cargar datos adicionales
  const loadProfileStats = async () => {
    try {
      // Simular carga de estadísticas
      const mockStats = {
        totalViews: Math.floor(Math.random() * 1000) + 100,
        totalLikes: Math.floor(Math.random() * 500) + 50,
        totalMatches: Math.floor(Math.random() * 100) + 10,
        profileCompleteness: Math.floor(Math.random() * 40) + 60,
        lastActive: new Date(Date.now() - Math.random() * 86400000),
        joinDate: new Date(Date.now() - Math.random() * 365 * 86400000),
        verificationLevel: Math.floor(Math.random() * 3) + 1
      };
      setProfileStats(mockStats);
    } catch (error) {
      logger.error('Error loading profile stats:', { error: String(error) });
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Simular actividad reciente
      const mockActivity = [
        { id: 1, type: 'like', description: 'Recibiste un like de María', time: '2 horas' },
        { id: 2, type: 'view', description: 'Tu perfil fue visto 15 veces', time: '4 horas' },
        { id: 3, type: 'match', description: 'Nuevo match con Carlos', time: '1 día' },
        { id: 4, type: 'message', description: 'Nuevo mensaje de Ana', time: '2 días' }
      ];
      setRecentActivity(mockActivity);
    } catch (error) {
      logger.error('Error loading recent activity:', { error: String(error) });
    }
  };

  const loadAchievements = async () => {
    try {
      // Simular logros
      const mockAchievements = [
        { id: 1, title: 'Primer Like', description: 'Recibiste tu primer like', icon: Heart, unlocked: true },
        { id: 2, title: 'Perfil Completo', description: 'Completaste tu perfil al 100%', icon: CheckCircle, unlocked: true },
        { id: 3, title: 'Popular', description: 'Recibiste 100 likes', icon: Star, unlocked: false },
        { id: 4, title: 'Verificado', description: 'Tu perfil fue verificado', icon: Award, unlocked: profile?.is_verified || false }
      ];
      setAchievements(mockAchievements);
    } catch (error) {
      logger.error('Error loading achievements:', { error: String(error) });
    }
  };

  const handleShareProfile = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Perfil de ${profile?.name || 'Usuario'}`,
          text: `Mira el perfil de ${profile?.name || 'Usuario'} en ComplicesConecta`,
          url: window.location.href
        });
      } else {
        // Fallback para navegadores que no soportan Web Share API
        navigator.clipboard.writeText(window.location.href);
        logger.info('URL copiada al portapapeles');
      }
    } catch (error) {
      logger.error('Error sharing profile:', { error: String(error) });
    }
  };

  const handleDownloadProfile = () => {
    logger.info('Descargar perfil solicitado');
    // Implementar lógica de descarga de perfil
  };
  
  // Migración localStorage → usePersistedState
  const [demoAuth, _setDemoAuth] = usePersistedState('demo_authenticated', 'false');
  const [demoUser, _setDemoUser] = usePersistedState<any>('demo_user', null);

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
            const profileData: Database['public']['Tables']['profiles']['Row'] = {
              id: parsedUser.id || 'demo-single-1',
              name: parsedUser.name || 'Sofía Demo',
              age: 28,
              bio: 'Explorando conexiones auténticas en el lifestyle swinger. Disfruto de experiencias discretas, respeto mutuo y encuentros sofisticados. Me encanta viajar, la música y conocer parejas interesantes.',
              avatar_url: '/placeholder.svg',
              created_at: new Date().toISOString(),
              gender: 'female',
              interests: ['Lifestyle Swinger', 'Encuentros Discretos', 'Viajes', 'Música', 'Gastronomía', 'Arte', 'Fotografía', 'Eventos Sofisticados'],
              is_admin: false,
              is_premium: false,
              is_verified: true,
              location: 'CDMX, México',
              role: 'user',
              user_id: parsedUser.id || 'demo-single-1',
              updated_at: new Date().toISOString(),
              // Campos opcionales
              email: null,
              first_name: null,
              last_name: null,
              is_online: false,
              is_demo: true,
              is_public: true,
              last_active: null,
              premium_plan: null,
              premium_expires_at: null,
              latitude: null,
              longitude: null
            };
            
            setProfile(profileData);
            setIsLoading(false);
            // Cargar datos adicionales
            loadProfileStats();
            loadRecentActivity();
            loadAchievements();
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
          <p className="mt-4 text-white font-medium">Cargando perfil...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 profile-page">
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
                  {/* TODO: Implementar cuando is_premium esté disponible en la tabla profiles */}
                  {/* {profile.is_premium && (
                    <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full p-1">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                  )} */}
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
                      CDMX, México
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
                      onClick={handleShareProfile}
                      className="bg-blue-500/20 hover:bg-blue-600/30 text-blue-200 border-blue-400/30 flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2 border"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Compartir</span>
                      <span className="sm:hidden">Share</span>
                    </Button>
                    
                    <Button 
                      onClick={handleDownloadProfile}
                      className="bg-green-500/20 hover:bg-green-600/30 text-green-200 border-green-400/30 flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2 border"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Descargar</span>
                      <span className="sm:hidden">Download</span>
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

          {/* Estadísticas mejoradas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-colors">
                <CardContent className="p-3 sm:p-4 text-center">
                  <Eye className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-400" />
                  <div className="text-lg sm:text-2xl font-bold">{profileStats.totalViews}</div>
                  <div className="text-xs sm:text-sm text-white/70">Visitas</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-colors">
                <CardContent className="p-3 sm:p-4 text-center">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-pink-400" />
                  <div className="text-lg sm:text-2xl font-bold">{profileStats.totalLikes}</div>
                  <div className="text-xs sm:text-sm text-white/70">Likes</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-colors">
                <CardContent className="p-3 sm:p-4 text-center">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-purple-400" />
                  <div className="text-lg sm:text-2xl font-bold">{profileStats.totalMatches}</div>
                  <div className="text-xs sm:text-sm text-white/70">Matches</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-colors">
                <CardContent className="p-3 sm:p-4 text-center">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-green-400" />
                  <div className="text-lg sm:text-2xl font-bold">{profileStats.profileCompleteness}%</div>
                  <div className="text-xs sm:text-sm text-white/70">Completo</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tabs de contenido avanzado */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/20 text-white">
                <Eye className="w-4 h-4 mr-2" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-white/20 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Actividad
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-white/20 text-white">
                <Award className="w-4 h-4 mr-2" />
                Logros
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20 text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {/* Contenido del resumen - ProfileNavTabs existente */}
              <ProfileNavTabs 
                isOwnProfile={isOwnProfile}
                onUploadImage={handleUploadImage}
                onDeletePost={handleDeletePost}
                onCommentPost={handleCommentPost}
              />
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">{activity.description}</p>
                          <p className="text-white/60 text-xs">{activity.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="mt-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Logros y Reconocimientos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {achievements.map((achievement) => {
                      const Icon = achievement.icon;
                      return (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-4 rounded-lg border ${
                            achievement.unlocked 
                              ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/30' 
                              : 'bg-white/5 border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              achievement.unlocked 
                                ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                                : 'bg-gray-600'
                            }`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className={`font-semibold ${
                                achievement.unlocked ? 'text-yellow-300' : 'text-white/60'
                              }`}>
                                {achievement.title}
                              </h3>
                              <p className="text-white/70 text-sm">{achievement.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Analytics del Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h3 className="text-white font-semibold mb-2">Última Actividad</h3>
                        <p className="text-white/70 text-sm">
                          {profileStats.lastActive.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h3 className="text-white font-semibold mb-2">Miembro Desde</h3>
                        <p className="text-white/70 text-sm">
                          {profileStats.joinDate.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-lg">
                      <h3 className="text-white font-semibold mb-3">Nivel de Verificación</h3>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              i < profileStats.verificationLevel
                                ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                                : 'bg-gray-600'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        ))}
                        <span className="text-white/70 text-sm ml-2">
                          Nivel {profileStats.verificationLevel} de 3
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
                {['Lifestyle Swinger', 'Encuentros Discretos', 'Viajes', 'Música', 'Gastronomía', 'Arte', 'Fotografía', 'Eventos Sofisticados'].map((interest) => (
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
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=faces&auto=format&q=80" 
                    alt="Foto pública 1"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <Camera className="w-8 h-8 text-white hidden" />
                </div>
                <div className="aspect-square bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="/placeholder.svg" 
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
                    src="/placeholder.svg" 
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
                      src="/placeholder.svg" 
                      alt="Foto privada 1"
                      className={`w-full h-full object-cover ${isOwnProfile ? '' : 'filter blur-md'}`}
                    />
                    {!isOwnProfile && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden relative">
                    <img 
                      src="/placeholder.svg" 
                      alt="Foto privada 2"
                      className={`w-full h-full object-cover ${isOwnProfile ? '' : 'filter blur-md'}`}
                    />
                    {!isOwnProfile && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden relative">
                    <img 
                      src="/placeholder.svg" 
                      alt="Foto privada 3"
                      className={`w-full h-full object-cover ${isOwnProfile ? '' : 'filter blur-md'}`}
                    />
                    {!isOwnProfile && (
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
                      url: '/src/assets/people/privado/erocpriv.jpg',
                      thumbnail: '/src/assets/people/privado/erocpriv.jpg',
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
