import { useState, useEffect } from 'react';
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

const ProfileSingle = () => {
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Advanced Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-secondary/20"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Floating Hearts */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <Heart 
              key={i}
              className={`absolute text-primary/10 animate-float-slow`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 2}s`,
                fontSize: `${Math.random() * 20 + 10}px`
              }}
              fill="currentColor"
            />
          ))}
        </div>
      </div>
      
      <div className="relative z-10">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Mi Perfil</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Share2 className="h-5 w-5 text-gray-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/edit-profile-single')}
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-4 pb-24 space-y-4 sm:space-y-6 max-w-2xl mx-auto">
        {/* Foto principal y badges */}
        <Card className="overflow-hidden bg-white shadow-xl">
          <div className="relative">
            <img 
              alt={profile.name} 
              className="w-full h-96 sm:h-[500px] object-cover object-center" 
              src={profile.image || profile.avatar || 'https://images.unsplash.com/photo-1494790108755-2616c96d2e9c?w=400'}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1494790108755-2616c96d2e9c?w=400';
              }}
            />
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
        <Card className="bg-white shadow-xl">
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
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Intereses</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest: string, index: number) => (
                <Badge key={index} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm py-2 px-4 font-medium shadow-lg">
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-lg shadow-lg mb-6">
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
            <Card className="bg-white shadow-xl">
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
            <Card className="bg-white shadow-lg">
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Intereses</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests?.map((interest: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none text-sm py-2 px-4 font-medium shadow-lg hover:shadow-xl transition-shadow"
                    >
                      {interest}
                    </Badge>
                  ))}
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
          <Card className="bg-white shadow-xl">
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
