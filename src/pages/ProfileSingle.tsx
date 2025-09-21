import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, MapPin, Calendar, Heart, Star, Users, Shield, Camera, Settings, CheckCircle, Crown, Images } from 'lucide-react';
import { Header } from '@/components/Header';
import Navigation from '@/components/Navigation';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { ProfileNavigation } from '@/components/profile/ProfileNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfileQuery } from '@/hooks/useProfileQuery';
import { logger } from '@/lib/logger';
import { usePersistedState } from '@/hooks/usePersistedState';
import { generateDemoProfiles } from '@/lib/demoData';
import type { Tables } from '@/integrations/supabase/types';

const ProfileSingle: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile: authProfile, isAuthenticated } = useAuth();
  
  // Migración localStorage → usePersistedState
  const [demoAuth, setDemoAuth] = usePersistedState('demo_authenticated', 'false');
  const [demoUser, setDemoUser] = usePersistedState<any>('demo_user', null);

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
            const profileData = {
              id: parsedUser.id || 'demo-single-1',
              first_name: parsedUser.first_name || 'Demo',
              last_name: 'User',
              age: 30,
              bio: 'Perfil demo para testing',
              email: parsedUser.email,
              is_verified: true,
              is_premium: false,
              is_demo: true,
              profile_type: 'single',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            setProfile(profileData as Tables<'profiles'>);
            setIsLoading(false);
            return;
          } catch (error) {
            logger.error('Error parseando usuario demo:', { error: String(error) });
          }
        }
        
        // Si authProfile ya está disponible, usarlo directamente
        if (authProfile && authProfile.id) {
          logger.info('✅ AuthProfile disponible:', authProfile.first_name);
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
        
        // Estado inesperado final
        logger.info('⚠️ Estado inesperado: sin usuario ni perfil válido');
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
            <Button onClick={() => navigate('/discover')} variant="outline">
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
      <Navigation />
      
      {/* Header con navegación */}
      <div className="relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 pt-8 pb-6 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              Mi Perfil - {profile.first_name}
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
                    {profile.first_name?.[0]?.toUpperCase() || 'U'}
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
                    {profile.first_name} {profile.last_name}
                  </h2>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                      {profile.age} años
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                      {(profile as any).gender || 'No especificado'}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 flex items-center gap-1 text-xs sm:text-sm">
                      <MapPin className="w-3 h-3" />
                      {(profile as any).location || 'CDMX, México'}
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
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar Perfil</span>
                      <span className="sm:hidden">Editar</span>
                    </Button>
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
                    variant="secondary" 
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
              <CardTitle className="text-white">Mi Galería</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="aspect-square bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-white/20">
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-white/60" />
                    <span className="text-white/60 text-sm">Foto 1</span>
                  </div>
                </div>
                <div className="aspect-square bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-lg flex items-center justify-center border border-white/20">
                  <div className="text-center">
                    <Images className="w-8 h-8 mx-auto mb-2 text-white/60" />
                    <span className="text-white/60 text-sm">Foto 2</span>
                  </div>
                </div>
                <div className="aspect-square bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-white/20">
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-white/60" />
                    <span className="text-white/60 text-sm">Foto 3</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileSingle;
