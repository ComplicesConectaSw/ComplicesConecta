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

const ProfileSingle: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación demo y cargar perfil del usuario
    const demoAuth = localStorage.getItem('demo_authenticated');
    const demoUser = localStorage.getItem('demo_user');
    
    if (demoAuth !== 'true' || !demoUser) {
      navigate('/discover');
      return;
    }
    
    const user = JSON.parse(demoUser);
    
    // Simular tiempo de carga del perfil
    setTimeout(() => {
      // Si es perfil single, usar datos del usuario demo
      if (user.accountType === 'single') {
        setProfile(user as Tables<'profiles'>);
      } else {
        // Para otros tipos, generar perfil mock
        const mockProfile = generateMockSingle();
        setProfile(mockProfile as Tables<'profiles'>);
      }
      setIsLoading(false);
    }, 1500);
  }, [navigate]);

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
            <p className="text-gray-600 mb-4">No se pudo cargar la información del perfil.</p>
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
      <div className="relative z-10 pb-20 px-4 max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-hide">
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
                      Madrid, España
                    </Badge>
                  </div>
                  
                  {/* Biografía */}
                  {profile.bio && (
                    <p className="text-gray-300 mb-4 leading-relaxed">
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
                <div className="text-sm text-gray-300">Matches</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">8</div>
                <div className="text-sm text-gray-300">Conversaciones</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">156</div>
                <div className="text-sm text-gray-300">Visitas</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">89%</div>
                <div className="text-sm text-gray-300">Compatibilidad</div>
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
