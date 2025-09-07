import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Heart, MessageCircle, MapPin, Calendar, Shield, Eye, EyeOff, Lock, Globe, Users, UserPlus, Settings, Edit, Share2, Crown, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import Navigation from '@/components/Navigation';
import { generateMockSingle, mockPrivacySettings, type ProfilePrivacySettings } from '@/lib/data';
import type { Tables } from '@/integrations/supabase/types';
import { useFeatures } from '@/hooks/useFeatures';
import Gallery from '@/components/profile/Gallery';
import { InvitationDialog } from '@/components/invitations/InvitationDialog';
import { ProfileLoadingScreen } from '@/components/ProfileLoadingScreen';

const ProfileSingle: React.FC = () => {
  const navigate = useNavigate();
  const { features } = useFeatures();
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true); // Por defecto es perfil propio
  const [privacySettings, setPrivacySettings] = useState<ProfilePrivacySettings>(mockPrivacySettings);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'gallery' | 'privacy'>('profile');
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
    }, 2500);
  }, [navigate]);

  const updatePrivacySetting = (key: keyof ProfilePrivacySettings, value: boolean | string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSendConnectionRequest = () => {
    // Lógica para enviar solicitud de conexión
    console.log('Enviando solicitud de conexión...');
  };

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
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Perfil no encontrado</p>
          <Button onClick={() => navigate('/profiles')} className="mt-4 text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
            Volver a perfiles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-hero-gradient">
      {/* Advanced Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Animated Mesh Gradient */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-gradient-x"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-secondary/10 to-primary/15 animate-gradient-y"></div>
        </div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-40 right-32 w-48 h-48 bg-accent/8 rounded-full blur-2xl animate-float-reverse"></div>
          <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-secondary/4 rounded-full blur-3xl animate-float-slow shape-delay-2"></div>
          <div className="absolute bottom-20 right-20 w-56 h-56 bg-primary/6 rounded-full blur-2xl animate-float shape-delay-1"></div>
        </div>
      </div>

      {/* Header */}
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
            {profile.first_name || 'Usuario'}
          </h1>
          <div className="flex gap-1 sm:gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-white/10 hover:bg-white/20 p-2 transition-all duration-300 hover:scale-105"
              onClick={() => {
                navigator.share ? 
                  navigator.share({
                    title: `Perfil de ${profile.first_name}`,
                    text: `Conoce a ${profile.first_name} en ComplicesConecta`,
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
              onClick={() => navigate('/edit-profile-single')}
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

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <div className="p-2 sm:p-4 pb-20 sm:pb-32 space-y-4 sm:space-y-6 max-w-2xl mx-auto min-h-full">
        {/* Foto principal y badges */}
        <Card className="overflow-hidden bg-white/90 backdrop-blur-md shadow-glow border-0">
          <div className="relative">
            <div className="aspect-[3/4] rounded-t-lg overflow-hidden mb-4 relative bg-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=625&fit=crop&crop=face" 
                alt={profile.first_name || 'Perfil'} 
                className="w-full h-full object-cover"
                onLoad={() => console.log('Imagen cargada correctamente')}
                onError={(e) => {
                  console.log('Error cargando imagen, usando fallback');
                  e.currentTarget.src = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=625&fit=crop&crop=face";
                  e.currentTarget.onerror = () => {
                    console.log('Fallback también falló, usando SVG');
                    e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjYyNSIgdmlld0JveD0iMCAwIDUwMCA2MjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNjI1IiBmaWxsPSIjOTMzM2VhIi8+Cjx0ZXh0IHg9IjI1MCIgeT0iMzEyLjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj5Gb3RvIGRlIFBlcmZpbDwvdGV4dD4KPHN2Zz4=";
                  };
                }}
              />
              {(profile as any).isOnline && (
                <Badge className="bg-green-500 text-white px-2 py-1 text-xs">
                  En línea
                </Badge>
              )}
              {profile.is_verified && (
                <Badge className="bg-blue-500 text-white px-2 py-1 text-xs">
                  ✓ Verificado
                </Badge>
              )}
            </div>
            
            {isOwnProfile ? (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button 
                  onClick={() => navigate('/edit-profile-single')}
                  className="bg-white/90 text-black hover:bg-white transition-all duration-300 hover:scale-105"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  onClick={() => setActiveTab('privacy')}
                  className="bg-purple-500/90 text-white hover:bg-purple-600 transition-all duration-300 hover:scale-105"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Privacidad
                </Button>
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                <Button 
                  onClick={() => {
                    console.log('Enviando mensaje a', profile.first_name);
                    alert(`Mensaje enviado a ${profile.first_name}`);
                  }}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Enviar mensaje
                </Button>
                <Button 
                  onClick={() => {
                    console.log('Me gusta', profile.first_name);
                    alert(`¡Has dado like a ${profile.first_name}!`);
                  }}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Me gusta
                </Button>
                <Button 
                  onClick={() => {
                    console.log('Reportando perfil de', profile.first_name);
                    if (confirm(`¿Estás seguro de que quieres reportar el perfil de ${profile.first_name}?`)) {
                      alert('Perfil reportado. Gracias por ayudarnos a mantener la comunidad segura.');
                    }
                  }}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Reportar perfil
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex bg-white/90 backdrop-blur-md rounded-lg shadow-lg mb-6">
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            className="flex-1 rounded-r-none"
            onClick={() => setActiveTab('profile')}
          >
            Perfil
          </Button>
          <Button
            variant={activeTab === 'gallery' ? 'default' : 'ghost'}
            className="flex-1 rounded-none"
            onClick={() => setActiveTab('gallery')}
          >
            Galería
          </Button>
          {isOwnProfile && features.profileVisibility && (
            <Button
              variant={activeTab === 'privacy' ? 'default' : 'ghost'}
              className="flex-1 rounded-l-none"
              onClick={() => setActiveTab('privacy')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Privacidad
            </Button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <>
            {/* Información básica */}
            <Card className="bg-white/90 backdrop-blur-md shadow-lg border-0">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{profile.first_name}</h3>
                  <div className="flex items-center justify-center space-x-4 text-gray-700 mb-4">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {(profile as any).location || 'CDMX'}
                    </span>
                    <span>•</span>
                    <span>{(profile as any).profession || 'Profesional'}</span>
                  </div>
                  
                  {/* Bio Section */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 mb-4 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">Sobre mí</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {profile.bio || "Persona auténtica buscando conexiones reales y experiencias memorables. Me encanta el arte y conocer gente nueva."}
                    </p>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
                      <span className="font-medium text-gray-900">Edad: </span>
                      <span className="text-gray-700">{profile.age}</span>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
                      <span className="font-medium text-gray-900">Buscando: </span>
                      <p className="text-gray-700">Conexiones auténticas</p>
                    </div>
                  </div>
                </div>
                
                {/* Stats del perfil */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{(profile as any).stats?.matches || 0}</div>
                    <div className="text-xs text-gray-600">Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{(profile as any).stats?.likes || 0}</div>
                    <div className="text-xs text-gray-600">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{(profile as any).stats?.views || 0}</div>
                    <div className="text-xs text-gray-600">Vistas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Intereses */}
            <Card className="bg-white/90 backdrop-blur-md shadow-lg border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Intereses</h3>
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-gray-200 shadow-sm mb-4">
                  <div className="flex flex-wrap gap-2">
                    {((profile as any).interests || ['Lifestyle Swinger', 'Comunicación Abierta', 'Respeto Mutuo', 'Experiencias Nuevas', 'Discreción Total']).map((interest: string, index: number) => (
                      <Badge key={index} className="bg-purple-100 text-purple-800 border border-purple-200 text-xs flex-shrink-0 hover:bg-purple-200 transition-colors">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-800">
                      <strong className="text-gray-900">Buscando:</strong> {(profile as any).lookingFor || "Conexiones auténticas y experiencias únicas"}
                    </p>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-800">
                      <strong className="text-gray-900">Estilo de vida:</strong> {(profile as any).lifestyle || "Aventurero y espontáneo"}
                    </p>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-800">
                      <strong className="text-gray-900">Nivel de experiencia:</strong> {(profile as any).experienceLevel || "Intermedio"}
                    </p>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-800">
                      <strong className="text-gray-900">Tipo de relación:</strong> {(profile as any).relationship_type || "Single"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'gallery' && (
          <Gallery 
            userId={profile.id as string} 
            isOwner={isOwnProfile}
            canViewPrivate={true} // Simular que tiene acceso
          />
        )}

        {activeTab === 'privacy' && isOwnProfile && features.profileVisibility && (
          <Card className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-sm shadow-glow border-0">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Configuración de Privacidad</h3>
              
              <div className="space-y-6">
                {/* Visibilidad del perfil */}
                <div className="border-b border-white/20 pb-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Visibilidad del Perfil
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value="public"
                        checked={privacySettings.profileVisibility === 'public'}
                        onChange={(e) => updatePrivacySetting('profileVisibility', e.target.value)}
                        className="text-purple-600"
                      />
                      <div>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-green-400" />
                          <span className="font-medium text-white">Público</span>
                        </div>
                        <p className="text-sm text-white/80">Visible para todos los usuarios</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value="connections_only"
                        checked={privacySettings.profileVisibility === 'connections_only'}
                        onChange={(e) => updatePrivacySetting('profileVisibility', e.target.value)}
                        className="text-purple-600"
                      />
                      <div>
                        <div className="flex items-center">
                          <UserPlus className="h-4 w-4 mr-2 text-blue-400" />
                          <span className="font-medium text-white">Solo conexiones</span>
                        </div>
                        <p className="text-sm text-white/80">Visible solo para usuarios conectados</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value="hidden"
                        checked={privacySettings.profileVisibility === 'hidden'}
                        onChange={(e) => updatePrivacySetting('profileVisibility', e.target.value)}
                        className="text-purple-600"
                      />
                      <div>
                        <div className="flex items-center">
                          <EyeOff className="h-4 w-4 mr-2 text-red-400" />
                          <span className="font-medium text-white">Oculto</span>
                        </div>
                        <p className="text-sm text-white/80">No apareces en búsquedas</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Mensajería */}
                <div className="border-b border-white/20 pb-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Mensajes
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="allowMessages"
                        value="everyone"
                        checked={privacySettings.allowMessages === 'everyone'}
                        onChange={(e) => updatePrivacySetting('allowMessages', e.target.value)}
                        className="text-purple-600"
                      />
                      <div>
                        <span className="font-medium text-white">Cualquier persona</span>
                        <p className="text-sm text-white/80">Todos pueden enviarte mensajes</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="allowMessages"
                        value="connections_only"
                        checked={privacySettings.allowMessages === 'connections_only'}
                        onChange={(e) => updatePrivacySetting('allowMessages', e.target.value)}
                        className="text-purple-600"
                      />
                      <div>
                        <span className="font-medium text-white">Solo conexiones</span>
                        <p className="text-sm text-white/80">Solo usuarios conectados</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="allowMessages"
                        value="none"
                        checked={privacySettings.allowMessages === 'none'}
                        onChange={(e) => updatePrivacySetting('allowMessages', e.target.value)}
                        className="text-purple-600"
                      />
                      <div>
                        <span className="font-medium text-white">Nadie</span>
                        <p className="text-sm text-white/80">Desactivar mensajes</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Configuraciones adicionales */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-white">Mostrar estado en línea</span>
                      <p className="text-sm text-white/80">Otros pueden ver cuando estás activo</p>
                    </div>
                    <Switch
                      checked={privacySettings.showOnlineStatus}
                      onCheckedChange={(checked) => updatePrivacySetting('showOnlineStatus', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-white">Mostrar última conexión</span>
                      <p className="text-sm text-white/80">Mostrar cuándo estuviste activo por última vez</p>
                    </div>
                    <Switch
                      checked={privacySettings.showLastSeen}
                      onCheckedChange={(checked) => updatePrivacySetting('showLastSeen', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
            {features.requests && (
              <Button 
                onClick={handleSendConnectionRequest}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3"
                size="lg"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Conectar
              </Button>
            )}
            <Button 
              variant="outline" 
              className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50 py-3"
              size="lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Mensaje
            </Button>
          </div>
        )}
        </div>
        
        <Navigation />
      </div>
    </div>
  );
};

export default ProfileSingle;
