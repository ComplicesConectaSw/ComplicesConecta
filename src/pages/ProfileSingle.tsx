import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, CheckCircle, Crown, Heart, MessageCircle, Edit } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { generateMockSingle } from '@/lib/data';
import type { Tables } from '@/integrations/supabase/types';
import Gallery from '@/components/profile/Gallery';
import { ProfileLoadingScreen } from '@/components/ProfileLoadingScreen';
import { useAuth } from '@/hooks/useAuth';
import { getAppConfig } from '@/lib/app-config';

const ProfileSingle: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile: authProfile, isAuthenticated } = useAuth();
  const config = getAppConfig();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log('🔍 ProfileSingle - Estado de autenticación:', {
          user: !!user,
          authProfile: !!authProfile,
          isDemo: authProfile?.is_demo,
          userEmail: user?.email
        });
        
        // Si authProfile ya está disponible, usarlo directamente
        if (authProfile && authProfile.id) {
          console.log('✅ AuthProfile disponible inmediatamente:', authProfile);
          setProfile(authProfile);
          setIsLoading(false);
          return;
        }
        
        // FORZAR carga del perfil real si hay usuario autenticado
        if (user && user.email === 'apoyofinancieromexicano@gmail.com') {
          console.log('🛡️ Usuario protegido detectado - forzando carga de perfil');
          
          if (authProfile) {
            console.log('✅ Perfil disponible - usando datos reales:', authProfile);
            setProfile(authProfile);
            setIsLoading(false);
            return;
          } else {
            console.log('⏳ Esperando carga del perfil...');
            // Mantener loading hasta que el perfil esté disponible
            setIsLoading(true);
            return;
          }
        }
        
        // VERIFICAR si hay sesión del usuario especial en localStorage
        const apoyoAuth = localStorage.getItem('apoyo_authenticated');
        const apoyoUser = localStorage.getItem('apoyo_user');
        
        if (apoyoAuth === 'true' && apoyoUser) {
          console.log('🔑 Sesión especial encontrada en localStorage');
          const parsedUser = JSON.parse(apoyoUser);
          console.log('👤 Usuario especial desde localStorage:', parsedUser);
          setProfile(parsedUser as Tables<'profiles'>);
          setIsLoading(false);
          return;
        }
        
        // Verificar si hay usuario real autenticado en Supabase
        if (user && authProfile && !authProfile.is_demo) {
          console.log('🏢 Usuario real de Supabase detectado:', authProfile);
          setProfile(authProfile);
          setIsLoading(false);
          return;
        }
        
        // Verificar si hay sesión demo activa
        const demoAuth = localStorage.getItem('demo_authenticated');
        const demoUser = localStorage.getItem('demo_user');
        
        if (demoAuth === 'true' && demoUser) {
          const parsedUser = JSON.parse(demoUser);
          console.log('🎭 Cargando perfil demo:', parsedUser);
          
          // Usar datos del usuario demo
          setProfile(parsedUser as Tables<'profiles'>);
          setIsLoading(false);
          return;
        }
        
        // Si no hay autenticación, redirigir con verificación condicional
        if (!user && !localStorage.getItem('apoyo_authenticated')) {
          console.log('❌ No hay autenticación válida, redirigiendo...');
          // Usar setTimeout y replace para evitar bucles
          setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 100);
        }
      } catch (error) {
        console.error('Error cargando perfil:', error);
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [user, authProfile]); // Agregar dependencias para reaccionar a cambios

  if (isLoading) {
    return (
      <ProfileLoadingScreen 
        onComplete={() => setIsLoading(false)}
        profileName={profile?.first_name || "Usuario"}
        profileType="single"
      />
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
      {/* Header sin navegación superior */}
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
      <div className="relative z-10 pb-20 px-4 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Información principal del perfil */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
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
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {profile.age} años
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {profile.gender}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 flex items-center gap-1">
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
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Button 
                      onClick={() => navigate('/edit-profile-single')}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      variant="outline"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                    <Button 
                      onClick={() => navigate('/matches')}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Ver Matches
                    </Button>
                    <Button 
                      onClick={() => navigate('/chat-info')}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Mensajes
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-pink-400">12</div>
                <div className="text-sm text-white/80">Matches</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">8</div>
                <div className="text-sm text-white/80">Conversaciones</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">156</div>
                <div className="text-sm text-white/80">Visitas</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">89%</div>
                <div className="text-sm text-white/80">Compatibilidad</div>
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
              <Gallery userId={profile.id} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navegación inferior */}
      <Navigation />
    </div>
  );
};

export default ProfileSingle;
