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
  const [profile, setProfile] = useState<any>(null);
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
      navigate('/auth');
      return;
    }
    
    const user = JSON.parse(demoUser);
    
    // Simular tiempo de carga del perfil
    setTimeout(() => {
      // Si es perfil single, usar datos del usuario demo
      if (user.accountType === 'single') {
        setProfile(user as any);
      } else {
        // Para otros tipos, generar perfil mock
        const mockProfile = generateMockSingle();
        setProfile(mockProfile as any);
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
        profileName={profile?.firstName || profile?.name || "Usuario"}
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
    <div className="min-h-screen relative bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600">
      {/* Fixed background layers */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-600/90 via-pink-500/90 to-indigo-600/90"></div>
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400/20 via-pink-400/20 to-transparent"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-hero-gradient border-b border-white/30 p-4 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profiles')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="ml-2">Regresar</span>
          </Button>
          <h1 className="text-lg font-semibold text-white">{profile?.firstName || profile?.name || 'Mi Perfil'}</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="hover:bg-white/20">
              <Share2 className="h-5 w-5 text-white" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/edit-profile-single')}
              className="hover:bg-white/20"
            >
              <Settings className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 sm:p-4 pb-32 space-y-4 sm:space-y-6 max-w-2xl mx-auto">
        {/* Foto principal y badges */}
        <Card className="overflow-hidden bg-white/90 backdrop-blur-md shadow-glow border-0">
          <div className="relative">
            <div className="aspect-[3/4] rounded-t-lg overflow-hidden mb-4 relative bg-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1494790108755-2616c96d2e9c?w=500&h=625&fit=crop&crop=face" 
                alt={profile.name || profile.firstName || 'Perfil'} 
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
              {profile.isOnline && (
                <Badge className="absolute top-3 left-3 bg-green-500 text-white text-xs">
                  <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                  Online
                </Badge>
              )}
              {profile.isVerified && (
                <Badge className="absolute top-3 right-3 bg-blue-500 text-white text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              )}
            </div>
            
            {isOwnProfile ? (
              <div className="absolute bottom-4 right-4">
                <Button 
                  onClick={() => navigate('/edit-profile-single')}
                  className="bg-white/90 text-black hover:bg-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                <Button 
                  onClick={() => {
                    console.log('Enviando mensaje a', profile.name);
                    alert(`Mensaje enviado a ${profile.name || profile.firstName}`);
                  }}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Enviar mensaje
                </Button>
                <Button 
                  onClick={() => {
                    console.log('Me gusta', profile.name);
                    alert(`¡Has dado like a ${profile.name || profile.firstName}!`);
                  }}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Me gusta
                </Button>
                <Button 
                  onClick={() => {
                    console.log('Reportando perfil de', profile.name);
                    if (confirm(`¿Estás seguro de que quieres reportar el perfil de ${profile.name || profile.firstName}?`)) {
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
            <Card className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-sm shadow-glow border-0">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{profile.name || profile.firstName || 'Usuario'}</h2>
                  <div className="flex items-center justify-center space-x-4 text-white mb-4">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location || 'CDMX'}
                    </span>
                    <span>•</span>
                    <span>{profile.profession || 'Profesional'}</span>
                  </div>
                  
                  {/* Bio Section */}
                  <div className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 rounded-lg p-4 mb-4 border border-purple-300/30">
                    <h3 className="font-semibold text-white mb-2">Sobre mí</h3>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {profile.bio || "Persona auténtica buscando conexiones reales y experiencias memorables. Me encanta el arte y conocer gente nueva."}
                    </p>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-purple-800/30 rounded-lg p-3 border border-purple-300/30">
                      <span className="font-medium text-white">Edad:</span>
                      <p className="text-white/90">{profile.age} años</p>
                    </div>
                    <div className="bg-purple-800/30 rounded-lg p-3 border border-purple-300/30">
                      <span className="font-medium text-white">Buscando:</span>
                      <p className="text-white/90">Conexiones auténticas</p>
                    </div>
                  </div>
                </div>
                
                {/* Stats del perfil */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-300">{profile.stats?.likes || 159}</div>
                    <div className="text-sm text-white/80">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-300">{profile.stats?.matches || 17}</div>
                    <div className="text-sm text-white/80">Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-300">{profile.stats?.visits || 103}</div>
                    <div className="text-sm text-white/80">Visitas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Intereses */}
            <Card className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-sm shadow-glow border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-3">Intereses</h3>
                <div className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 backdrop-blur-sm rounded-lg p-4 border border-purple-300/30 mb-4">
                  <div className="flex flex-wrap gap-2">
                    {(profile.interests || ['Lifestyle Swinger', 'Comunicación Abierta', 'Respeto Mutuo', 'Experiencias Nuevas', 'Discreción Total']).map((interest: string, index: number) => (
                      <Badge key={index} className="bg-purple-200/80 text-purple-900 border border-purple-300/50 text-xs flex-shrink-0">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-purple-800/20 to-pink-800/20 rounded-lg p-3 border border-purple-300/20">
                    <p className="text-sm text-white/90">
                      <strong>Buscando:</strong> {profile.lookingFor || "Conexiones auténticas y experiencias únicas"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-800/20 to-pink-800/20 rounded-lg p-3 border border-purple-300/20">
                    <p className="text-sm text-white/90">
                      <strong>Estilo de vida:</strong> {profile.lifestyle || "Aventurero y espontáneo"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-800/20 to-pink-800/20 rounded-lg p-3 border border-purple-300/20">
                    <p className="text-sm text-white/90">
                      <strong>Nivel de experiencia:</strong> {profile.experienceLevel || "Intermedio"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-800/20 to-pink-800/20 rounded-lg p-3 border border-purple-300/20">
                    <p className="text-sm text-white/90">
                      <strong>Tipo de relación:</strong> {profile.relationshipType || "Pareja abierta"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'gallery' && (
          <Gallery 
            userId={profile.id} 
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
      </div>

      <Navigation />
      </div>
      
      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .bg-hero-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .shadow-glow {
          box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
        }
      `}</style>
      
      {/* ProfileLoadingScreen */}
      {isLoading && (
        <ProfileLoadingScreen
          onComplete={() => setIsLoading(false)}
          profileName={profile?.firstName || 'Usuario'}
          profileType="single"
        />
      )}
    </div>
  );
};

export default ProfileSingle;
