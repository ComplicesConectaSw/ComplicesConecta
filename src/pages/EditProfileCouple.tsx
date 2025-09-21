import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Camera, X, Users, MapPin, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavigationEnhanced from "@/components/NavigationEnhanced";
import type { Tables } from '@/integrations/supabase/types';
import { generateMockCouple } from "@/lib/data";
import { lifestyleInterests } from "@/lib/lifestyle-interests";
import { useGeolocation } from "@/hooks/useGeolocation";
import { logger } from '@/lib/logger';

const EditProfileCouple = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    coupleName: "",
    location: "",
    bio: "",
    interests: [] as string[],
    partner1: {
      firstName: "",
      lastName: "",
      nickname: "",
      age: "",
      profession: "",
      bio: "",
      avatar: "",
      interests: [] as string[],
      publicImages: [] as string[],
      privateImages: [] as string[]
    },
    partner2: {
      firstName: "",
      lastName: "",
      nickname: "",
      age: "",
      profession: "",
      bio: "",
      avatar: "",
      interests: [] as string[],
      publicImages: [] as string[],
      privateImages: [] as string[]
    }
  });
  
  const { location, error: locationError, getCurrentLocation } = useGeolocation();
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const availableInterests = lifestyleInterests;

  useEffect(() => {
    // Verificar autenticación demo y cargar perfil del usuario
    const demoAuth = localStorage.getItem('demo_authenticated');
    const demoUser = localStorage.getItem('demo_user');
    
    if (demoAuth !== 'true' || !demoUser) {
      navigate('/auth');
      return;
    }
    
    const user = JSON.parse(demoUser);
    let profileData;
    
    // Si es perfil pareja, usar datos del usuario demo
    if (user.accountType === 'couple') {
      profileData = user;
    } else {
      // Para otros tipos, generar perfil mock
      profileData = generateMockCouple();
    }
    
    setProfile(profileData);
    setFormData({
      coupleName: profileData.name || profileData.coupleName || "",
      location: profileData.location || "",
      bio: profileData.bio || "",
      interests: profileData.interests || [],
      partner1: {
        firstName: profileData.partner1?.name?.split(' ')[0] || "",
        lastName: profileData.partner1?.name?.split(' ')[1] || "",
        nickname: profileData.partner1?.nickname || "",
        age: profileData.partner1?.age?.toString() || "",
        profession: profileData.partner1?.profession || "",
        bio: profileData.partner1?.bio || "",
        avatar: profileData.partner1?.avatar || "",
        interests: profileData.partner1?.interests || [],
        publicImages: profileData.partner1?.publicImages || [],
        privateImages: profileData.partner1?.privateImages || []
      },
      partner2: {
        firstName: profileData.partner2?.name?.split(' ')[0] || "",
        lastName: profileData.partner2?.name?.split(' ')[1] || "",
        nickname: profileData.partner2?.nickname || "",
        age: profileData.partner2?.age?.toString() || "",
        profession: profileData.partner2?.profession || "",
        bio: profileData.partner2?.bio || "",
        avatar: profileData.partner2?.avatar || "",
        interests: profileData.partner2?.interests || [],
        publicImages: profileData.partner2?.publicImages || [],
        privateImages: profileData.partner2?.privateImages || []
      }
    });
  }, [navigate]);

  const handleInputChange = (field: string, value: string, partner?: 'partner1' | 'partner2') => {
    if (partner) {
      setFormData(prev => ({
        ...prev,
        [partner]: {
          ...prev[partner],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const toggleInterest = (interest: string, partner?: 'partner1' | 'partner2') => {
    if (partner) {
      setFormData(prev => ({
        ...prev,
        [partner]: {
          ...prev[partner],
          interests: prev[partner].interests.includes(interest)
            ? prev[partner].interests.filter(i => i !== interest)
            : [...prev[partner].interests, interest]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        interests: prev.interests.includes(interest)
          ? prev.interests.filter(i => i !== interest)
          : [...prev.interests, interest]
      }));
    }
  };
  
  const handleLocationDetection = () => {
    setLocationStatus('loading');
    getCurrentLocation();
  };
  
  useEffect(() => {
    if (location) {
      // Simular geocodificación inversa para obtener ciudad
      const mockCities = ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Torreón', 'Querétaro', 'Mérida'];
      const randomCity = mockCities[Math.floor(Math.random() * mockCities.length)];
      setFormData(prev => ({
        ...prev,
        location: randomCity
      }));
      setLocationStatus('success');
    }
    if (locationError) {
      setLocationStatus('error');
    }
  }, [location, locationError, setLocationStatus]);
  
  const handleImageUpload = (partner: 'partner1' | 'partner2', type: 'public' | 'private' | 'avatar') => {
    // Simulación de subida de imagen
    logger.info(`Subiendo imagen ${type} para ${partner}`);
    // Aquí iría la lógica real de subida de imagen
  };

  const handleSave = () => {
    logger.info("Guardando perfil de pareja:", formData);
    navigate('/profile-couple');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 pb-20">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile-couple')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al perfil
          </Button>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Editar Perfil de Pareja
          </h1>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 pb-24 space-y-6 max-w-4xl">
        {/* Fotos de la pareja */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-purple-300/30 shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-400" />
              Fotos de la pareja
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <img 
                  src={profile.partner1.avatar} 
                  alt={`${formData.partner1.firstName} ${formData.partner1.lastName}`}
                  className="w-full h-40 rounded-lg object-cover"
                />
                <Button 
                  size="sm"
                  className="absolute bottom-2 right-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white"
                  onClick={() => handleImageUpload('partner1', 'avatar')}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <p className="text-center text-sm text-white mt-2">{formData.partner1.firstName} (Ella)</p>
              </div>
              <div className="relative">
                <img 
                  src={profile.partner2.avatar} 
                  alt={`${formData.partner2.firstName} ${formData.partner2.lastName}`}
                  className="w-full h-40 rounded-lg object-cover"
                />
                <Button 
                  size="sm"
                  className="absolute bottom-2 right-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => handleImageUpload('partner2', 'avatar')}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <p className="text-center text-sm text-white mt-2">{formData.partner2.firstName} (Él)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información general de la pareja */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-purple-300/30 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-white mb-4">Información general</h3>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Nombre de la pareja</label>
              <Input
                value={formData.coupleName}
                onChange={(e) => handleInputChange('coupleName', e.target.value)}
                placeholder="Ej: Ana & Carlos"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Ubicación</label>
              <div className="space-y-2">
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ciudad donde viven"
                />
                {locationError && (
                  <div className="flex items-center text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Error al detectar ubicación
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLocationDetection}
                  disabled={locationStatus === 'loading'}
                  className="w-full"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {locationStatus === 'loading' ? 'Detectando...' : 'Reintentar detección de ubicación'}
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Sobre nosotros</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Cuéntanos sobre ustedes como pareja, qué buscan..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-white/80 mt-2">
                {formData.bio.length}/500 caracteres
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información del Partner 1 (Ella) */}
        <Card className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-md border-l-4 border-pink-400 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-white mb-4">Información de Ella</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nombre</label>
                <Input
                  value={formData.partner1.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value, 'partner1')}
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Apellido</label>
                <Input
                  value={formData.partner1.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value, 'partner1')}
                  placeholder="Apellido"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Apodo</label>
                <Input
                  value={formData.partner1.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value, 'partner1')}
                  placeholder="Apodo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Edad</label>
                <Input
                  type="number"
                  value={formData.partner1.age}
                  onChange={(e) => handleInputChange('age', e.target.value, 'partner1')}
                  placeholder="Edad"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Profesión</label>
              <Input
                value={formData.partner1.profession}
                onChange={(e) => handleInputChange('profession', e.target.value, 'partner1')}
                placeholder="Profesión"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Descripción personal</label>
              <Textarea
                value={formData.partner1.bio}
                onChange={(e) => handleInputChange('bio', e.target.value, 'partner1')}
                placeholder="Descripción personal..."
                rows={3}
                className="resize-none"
              />
            </div>
            
            {/* Galería de imágenes para Partner 1 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Galería de Imágenes</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/80 mb-2">Imágenes Públicas</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Camera className="h-8 w-8 mx-auto text-white/60 mb-2" />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleImageUpload('partner1', 'public')}
                    >
                      Subir Públicas
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/80 mb-2">Imágenes Privadas</p>
                  <div className="border-2 border-dashed border-pink-300 rounded-lg p-4 text-center">
                    <Camera className="h-8 w-8 mx-auto text-pink-400 mb-2" />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleImageUpload('partner1', 'private')}
                      className="border-pink-300 text-pink-600"
                    >
                      Subir Privadas
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Intereses individuales para Partner 1 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Intereses Lifestyle</label>
              <p className="text-xs text-white/80 mb-3">Selecciona sus intereses para encontrar matches compatibles</p>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-pink-50">
                {availableInterests.map((interest) => (
                  <Badge
                    key={interest}
                    variant={formData.partner1.interests.includes(interest) ? "default" : "secondary"}
                    className={`cursor-pointer transition-all text-xs ${
                      formData.partner1.interests.includes(interest)
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                        : "hover:bg-pink-100 text-gray-800 border border-pink-200"
                    }`}
                    onClick={() => toggleInterest(interest, 'partner1')}
                  >
                    {interest}
                    {formData.partner1.interests.includes(interest) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-white/80 mt-2">
                {formData.partner1.interests.length}/10 seleccionados
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información del Partner 2 (Él) */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-md border-l-4 border-purple-400 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-white mb-4">Información de Él</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nombre</label>
                <Input
                  value={formData.partner2.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value, 'partner2')}
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Apellido</label>
                <Input
                  value={formData.partner2.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value, 'partner2')}
                  placeholder="Apellido"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Apodo</label>
                <Input
                  value={formData.partner2.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value, 'partner2')}
                  placeholder="Apodo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Edad</label>
                <Input
                  type="number"
                  value={formData.partner2.age}
                  onChange={(e) => handleInputChange('age', e.target.value, 'partner2')}
                  placeholder="Edad"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Profesión</label>
              <Input
                value={formData.partner2.profession}
                onChange={(e) => handleInputChange('profession', e.target.value, 'partner2')}
                placeholder="Profesión"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Descripción personal</label>
              <Textarea
                value={formData.partner2.bio}
                onChange={(e) => handleInputChange('bio', e.target.value, 'partner2')}
                placeholder="Descripción personal..."
                rows={3}
                className="resize-none"
              />
            </div>
            
            {/* Galería de imágenes para Partner 2 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Galería de Imágenes</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/80 mb-2">Imágenes Públicas</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Camera className="h-8 w-8 mx-auto text-white/60 mb-2" />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleImageUpload('partner2', 'public')}
                    >
                      Subir Públicas
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/80 mb-2">Imágenes Privadas</p>
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
                    <Camera className="h-8 w-8 mx-auto text-blue-400 mb-2" />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleImageUpload('partner2', 'private')}
                      className="border-blue-300 text-blue-600"
                    >
                      Subir Privadas
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Intereses individuales para Partner 2 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Intereses Lifestyle</label>
              <p className="text-xs text-white/80 mb-3">Selecciona sus intereses para encontrar matches compatibles</p>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-blue-50">
                {availableInterests.map((interest) => (
                  <Badge
                    key={interest}
                    variant={formData.partner2.interests.includes(interest) ? "default" : "secondary"}
                    className={`cursor-pointer transition-all text-xs ${
                      formData.partner2.interests.includes(interest)
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                        : "hover:bg-blue-100 text-gray-800 border border-blue-200"
                    }`}
                    onClick={() => toggleInterest(interest, 'partner2')}
                  >
                    {interest}
                    {formData.partner2.interests.includes(interest) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-white/80 mt-2">
                {formData.partner2.interests.length}/10 seleccionados
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Intereses compartidos */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-purple-300/30 shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-4">Intereses compartidos</h3>
            <p className="text-sm text-white/80 mb-4">Seleccionen hasta 6 intereses que los representen como pareja</p>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg bg-gray-50">
              {availableInterests.map((interest) => (
                <Badge
                  key={interest}
                  variant={formData.interests.includes(interest) ? "default" : "secondary"}
                  className={`cursor-pointer transition-all text-contrast ${
                    formData.interests.includes(interest)
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
                      : "hover:bg-gray-200 text-gray-800 border border-gray-300"
                  }`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                  {formData.interests.includes(interest) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-white/80 mt-2">
              {formData.interests.length}/6 seleccionados
            </p>
          </CardContent>
        </Card>

        {/* Configuración de privacidad */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-purple-300/30 shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-4">Configuración de privacidad</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Mostrar edades</span>
                <input type="checkbox" defaultChecked className="rounded bg-white/20 border-white/30" title="Mostrar edades en perfil" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Mostrar ubicación</span>
                <input type="checkbox" defaultChecked className="rounded bg-white/20 border-white/30" title="Mostrar ubicación en perfil" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Aparecer en búsquedas</span>
                <input type="checkbox" defaultChecked className="rounded bg-white/20 border-white/30" title="Aparecer en resultados de búsqueda" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Solo parejas verificadas</span>
                <input type="checkbox" className="rounded bg-white/20 border-white/30" title="Solo mostrar parejas verificadas" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <NavigationEnhanced />
    </div>
  );
};

export default EditProfileCouple;
