import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Camera, X, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { generateMockCouple } from "@/lib/data";

const EditProfileCouple = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    coupleName: "",
    location: "",
    bio: "",
    interests: [] as string[],
    partner1: {
      name: "",
      age: "",
      profession: "",
      bio: "",
      avatar: ""
    },
    partner2: {
      name: "",
      age: "",
      profession: "",
      bio: "",
      avatar: ""
    }
  });

  const availableInterests = [
    "Fiestas Privadas", "Intercambio de Parejas", "Eventos VIP", "Lifestyle", 
    "Experiencias Nuevas", "Viajes", "Aventuras", "Diversión", "Arte", 
    "Música", "Gastronomía", "Spa & Wellness", "Playa", "Montaña"
  ];

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
        name: profileData.partner1?.name || "",
        age: profileData.partner1?.age?.toString() || "",
        profession: profileData.partner1?.profession || "",
        bio: profileData.partner1?.bio || "",
        avatar: profileData.partner1?.avatar || ""
      },
      partner2: {
        name: profileData.partner2?.name || "",
        age: profileData.partner2?.age?.toString() || "",
        profession: profileData.partner2?.profession || "",
        bio: profileData.partner2?.bio || "",
        avatar: profileData.partner2?.avatar || ""
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

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSave = () => {
    console.log("Guardando perfil de pareja:", formData);
    navigate('/profile-couple');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
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
          <h1 className="text-lg font-semibold text-gray-900">Editar Perfil de Pareja</h1>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      <div className="p-4 pb-24 space-y-6">
        {/* Fotos de la pareja */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-500" />
              Fotos de la pareja
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <img 
                  src={profile.partner1.avatar} 
                  alt={formData.partner1.name}
                  className="w-full h-40 rounded-lg object-cover"
                />
                <Button 
                  size="sm"
                  className="absolute bottom-2 right-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <p className="text-center text-sm text-gray-600 mt-2">{formData.partner1.name}</p>
              </div>
              <div className="relative">
                <img 
                  src={profile.partner2.avatar} 
                  alt={formData.partner2.name}
                  className="w-full h-40 rounded-lg object-cover"
                />
                <Button 
                  size="sm"
                  className="absolute bottom-2 right-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <p className="text-center text-sm text-gray-600 mt-2">{formData.partner2.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información general de la pareja */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Información general</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la pareja</label>
              <Input
                value={formData.coupleName}
                onChange={(e) => handleInputChange('coupleName', e.target.value)}
                placeholder="Ej: Ana & Carlos"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ciudad donde viven"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sobre nosotros</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Cuéntanos sobre ustedes como pareja, qué buscan..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                {formData.bio.length}/500 caracteres
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información del Partner 1 */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-pink-600 mb-4">Información de {formData.partner1.name}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <Input
                  value={formData.partner1.name}
                  onChange={(e) => handleInputChange('name', e.target.value, 'partner1')}
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
                <Input
                  type="number"
                  value={formData.partner1.age}
                  onChange={(e) => handleInputChange('age', e.target.value, 'partner1')}
                  placeholder="Edad"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profesión</label>
              <Input
                value={formData.partner1.profession}
                onChange={(e) => handleInputChange('profession', e.target.value, 'partner1')}
                placeholder="Profesión"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción personal</label>
              <Textarea
                value={formData.partner1.bio}
                onChange={(e) => handleInputChange('bio', e.target.value, 'partner1')}
                placeholder="Descripción personal..."
                rows={3}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Información del Partner 2 */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-blue-600 mb-4">Información de {formData.partner2.name}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <Input
                  value={formData.partner2.name}
                  onChange={(e) => handleInputChange('name', e.target.value, 'partner2')}
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
                <Input
                  type="number"
                  value={formData.partner2.age}
                  onChange={(e) => handleInputChange('age', e.target.value, 'partner2')}
                  placeholder="Edad"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profesión</label>
              <Input
                value={formData.partner2.profession}
                onChange={(e) => handleInputChange('profession', e.target.value, 'partner2')}
                placeholder="Profesión"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción personal</label>
              <Textarea
                value={formData.partner2.bio}
                onChange={(e) => handleInputChange('bio', e.target.value, 'partner2')}
                placeholder="Descripción personal..."
                rows={3}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Intereses compartidos */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Intereses compartidos</h3>
            <p className="text-sm text-gray-600 mb-4">Seleccionen hasta 6 intereses que los representen como pareja</p>
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
            <p className="text-xs text-gray-500 mt-2">
              {formData.interests.length}/6 seleccionados
            </p>
          </CardContent>
        </Card>

        {/* Configuración de privacidad */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Configuración de privacidad</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Mostrar edades</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Mostrar ubicación</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Aparecer en búsquedas</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Solo parejas verificadas</span>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default EditProfileCouple;
