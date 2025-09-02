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
import { useFeatures } from '@/hooks/useFeatures';
import Gallery from '@/components/profile/Gallery';
import { InvitationDialog } from '@/components/invitations/InvitationDialog';

const ProfileSingle: React.FC = () => {
  const navigate = useNavigate();
  const { features } = useFeatures();
  const [profile, setProfile] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true); // Por defecto es perfil propio
  const [privacySettings, setPrivacySettings] = useState<ProfilePrivacySettings>(mockPrivacySettings);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'gallery' | 'privacy'>('profile');

  useEffect(() => {
    // Verificar autenticación demo y cargar perfil del usuario
    const demoAuth = localStorage.getItem('demo_authenticated');
    const demoUser = localStorage.getItem('demo_user');
    
    if (demoAuth !== 'true' || !demoUser) {
      navigate('/auth');
      return;
    }
    
    const user = JSON.parse(demoUser);
    
    // Si es perfil single, usar datos del usuario demo
    if (user.accountType === 'single') {
      setProfile(user);
    } else {
      // Para otros tipos, generar perfil mock
      const mockProfile = generateMockSingle();
      setProfile(mockProfile);
    }
  }, [navigate]);

  const updatePrivacySetting = (key: keyof ProfilePrivacySettings, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSendConnectionRequest = () => {
    // Lógica para enviar solicitud de conexión
    console.log('Enviando solicitud de conexión...');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600">
      {/* Fixed background layers */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-600/90 via-pink-500/90 to-indigo-600/90"></div>
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400/20 via-pink-400/20 to-transparent"></div>
      
      <div className="relative z-10">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-white/30 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="text-gray-700 hover:bg-white/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Mi Perfil</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="hover:bg-white/50">
              <Share2 className="h-5 w-5 text-gray-700" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/edit-profile-single')}
              className="hover:bg-white/50"
            >
              <Settings className="h-5 w-5 text-gray-700" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-4 pb-24 space-y-4 sm:space-y-6 max-w-2xl mx-auto max-h-screen overflow-y-auto">
        {/* Foto principal y badges */}
        <Card className="overflow-hidden bg-white/90 backdrop-blur-md shadow-glow border-0">
          <div className="relative">
            <div className="relative aspect-[3/4] overflow-hidden">
              <img 
                alt={profile.name} 
                className="w-full h-full object-cover object-center" 
                src={profile.avatar || profile.photos?.[0] || 'https://images.unsplash.com/photo-1494790108755-2616c96d2e9c?w=400&h=600&fit=crop&crop=faces'}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1494790108755-2616c96d2e9c?w=400&h=600&fit=crop&crop=faces';
                }}
              />
            </div>
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {profile.isOnline && (
                <Badge className="bg-green-500 text-white">
                  En línea
                </Badge>
              )}
              {profile.isVerified && (
                <Badge className="bg-blue-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              )}
              {profile.isPremium && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            
            {isOwnProfile ? (
              <div className="absolute bottom-4 right-4">
                <Button 
                  onClick={() => navigate('/edit-profile-single')}
                  className="bg-white/90 text-gray-800 hover:bg-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            ) : (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Like
                </Button>
                <InvitationDialog 
                  targetProfileId={profile.id}
                  targetProfileName={profile.name}
                >
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invitar
                  </Button>
                </InvitationDialog>
              </div>
            )}
          </div>
        </Card>

        {/* Información básica */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-glow border-0">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h2>
              <div className="flex items-center justify-center space-x-4 text-gray-600 mb-4">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </span>
                <span>•</span>
                <span>{profile.profession}</span>
              </div>
              
              {/* Bio Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Sobre mí</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {profile.bio || "Persona auténtica buscando conexiones reales y experiencias memorables. Me encanta el arte y conocer gente nueva."}
                </p>
              </div>
              
              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="font-medium text-gray-900">Edad:</span>
                  <p className="text-gray-600">{profile.age} años</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="font-medium text-gray-900">Buscando:</span>
                  <p className="text-gray-600">Conexiones auténticas</p>
                </div>
              </div>
            </div>
            
            {/* Stats del perfil */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{profile.stats?.likes || 159}</div>
                <div className="text-sm text-gray-500">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{profile.stats?.matches || 17}</div>
                <div className="text-sm text-gray-500">Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{profile.stats?.visits || 103}</div>
                <div className="text-sm text-gray-500">Visitas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intereses */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-glow border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Intereses</h3>
            <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto">
              {(profile.interests || ['Lifestyle Swinger', 'Intercambio de Parejas', 'Encuentros Casuales', 'Fiestas Temáticas', 'Clubs Privados', 'Eventos Lifestyle', 'Soft Swap', 'Full Swap', 'Experiencias Nuevas', 'Conexiones Auténticas']).map((interest: string, index: number) => (
                <Badge key={index} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm py-2 px-4 font-medium shadow-lg">
                  {interest}
                </Badge>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Buscando:</strong> {profile.lookingFor || "Conexiones auténticas y experiencias únicas"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Estilo de vida:</strong> {profile.lifestyle || "Aventurero y espontáneo"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Nivel de experiencia:</strong> {profile.experienceLevel || "Intermedio"}
              </p>
            </div>
          </CardContent>
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
            <Card className="bg-white/90 backdrop-blur-md shadow-xl border-0">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h2>
                  <div className="flex items-center justify-center space-x-4 text-gray-600 mb-4">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location}
                    </span>
                    <span>•</span>
                    <span>{profile.profession}</span>
                  </div>
                  
                  {/* Bio Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Sobre mí</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {profile.bio || "Persona auténtica buscando conexiones reales y experiencias memorables. Me encanta el arte y conocer gente nueva."}
                    </p>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="font-medium text-gray-900">Edad:</span>
                      <p className="text-gray-600">{profile.age} años</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="font-medium text-gray-900">Buscando:</span>
                      <p className="text-gray-600">Conexiones auténticas</p>
                    </div>
                  </div>
                </div>
                
                {/* Stats del perfil */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{profile.stats?.likes || 159}</div>
                    <div className="text-sm text-gray-500">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">{profile.stats?.matches || 17}</div>
                    <div className="text-sm text-gray-500">Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile.stats?.visits || 103}</div>
                    <div className="text-sm text-gray-500">Visitas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-md shadow-lg border-0">
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Intereses</h3>
                <div className="bg-gradient-to-r from-purple-100/80 to-pink-100/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200/50">
                  <div className="bg-gradient-to-r from-purple-100/80 to-pink-100/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200/50">
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {(profile.interests || ['Lifestyle Swinger', 'Intercambio de Parejas', 'Encuentros Casuales', 'Fiestas Temáticas', 'Clubs Privados', 'Eventos Lifestyle']).map((interest: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs bg-purple-200/80 text-purple-900 border border-purple-300/50">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Buscando:</strong> {profile.lookingFor || "Conexiones auténticas y experiencias únicas"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Estilo de vida:</strong> {profile.lifestyle || "Aventurero y espontáneo"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Nivel de experiencia:</strong> {profile.experienceLevel || "Intermedio"}
                  </p>
                </div>
              </div>
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
          <Card className="bg-white/90 backdrop-blur-md shadow-xl border-0 shadow-purple-500/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Configuración de Privacidad</h3>
              
              <div className="space-y-6">
                {/* Visibilidad del perfil */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
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
                          <Globe className="h-4 w-4 mr-2 text-green-600" />
                          <span className="font-medium">Público</span>
                        </div>
                        <p className="text-sm text-gray-600">Visible para todos los usuarios</p>
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
                          <UserPlus className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-medium">Solo conexiones</span>
                        </div>
                        <p className="text-sm text-gray-600">Visible solo para usuarios conectados</p>
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
                          <EyeOff className="h-4 w-4 mr-2 text-red-600" />
                          <span className="font-medium">Oculto</span>
                        </div>
                        <p className="text-sm text-gray-600">No apareces en búsquedas</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Mensajería */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
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
                        <span className="font-medium">Cualquier persona</span>
                        <p className="text-sm text-gray-600">Todos pueden enviarte mensajes</p>
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
                        <span className="font-medium">Solo conexiones</span>
                        <p className="text-sm text-gray-600">Solo usuarios conectados</p>
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
                        <span className="font-medium">Nadie</span>
                        <p className="text-sm text-gray-600">Desactivar mensajes</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Configuraciones adicionales */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">Mostrar estado en línea</span>
                      <p className="text-sm text-gray-600">Otros pueden ver cuando estás activo</p>
                    </div>
                    <Switch
                      checked={privacySettings.showOnlineStatus}
                      onCheckedChange={(checked) => updatePrivacySetting('showOnlineStatus', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">Mostrar última conexión</span>
                      <p className="text-sm text-gray-600">Mostrar cuándo estuviste activo por última vez</p>
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
      `}</style>
    </div>
  );
};

export default ProfileSingle;
