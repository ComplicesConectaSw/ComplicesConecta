import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Upload, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateMockSingle } from "@/lib/data";
import { ImageUpload } from "@/components/profile/ImageUpload";
import Navigation from "@/components/Navigation";

const EditProfileSingle = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    location: "",
    profession: "",
    bio: "",
    interests: [] as string[],
    avatar: ""
  });

  const availableInterests = [
    "Aventuras", "Diversión", "Experiencias Únicas", "Conexiones Reales", 
    "Lifestyle", "Viajes", "Arte", "Música", "Deportes", "Gastronomía",
    "Fotografía", "Lectura", "Cine", "Baile", "Yoga", "Fitness"
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
    
    // Si es perfil single, usar datos del usuario demo
    if (user.accountType === 'single') {
      profileData = user;
    } else {
      // Para otros tipos, generar perfil mock
      profileData = generateMockSingle();
    }
    
    setProfile(profileData);
    setFormData({
      name: profileData.name || "",
      age: profileData.age?.toString() || "",
      location: profileData.location || "",
      profession: profileData.profession || "",
      bio: profileData.bio || "",
      interests: profileData.interests || [],
      avatar: profileData.avatar || ""
    });
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
    // Aquí iría la lógica para guardar el perfil
    console.log("Guardando perfil:", formData);
    navigate('/profile-single');
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
    <div className="min-h-screen relative overflow-hidden px-2 sm:px-4">
      {/* Advanced Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-secondary/20"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
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
          <h1 className="text-lg font-semibold text-gray-900">Editar Perfil</h1>
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
        <div className="space-y-6">
          {/* Foto principal */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Foto de Perfil</h3>
              <ImageUpload
                currentImage={formData.avatar}
                onImageChange={(url) => setFormData(prev => ({ ...prev, avatar: url }))}
                className="mb-4"
              />
            </CardContent>
          </Card>

          {/* Información básica */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Información básica</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Tu edad"
                />
              </div>
          </CardContent>
        </Card>

        {/* Información básica */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Información básica</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Tu edad"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ciudad donde vives"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profesión</label>
              <Input
                value={formData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                placeholder="A qué te dedicas"
              />
            </div>
          </CardContent>
        </Card>

        {/* Biografía */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Sobre ti</h3>
            <Textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Cuéntanos sobre ti, qué buscas, tus intereses..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {formData.bio.length}/500 caracteres
            </p>
          </CardContent>
        </Card>

        {/* Intereses */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Intereses</h3>
            <p className="text-sm text-gray-600 mb-4">Selecciona hasta 6 intereses que te representen</p>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((interest) => (
                <Badge
                  key={interest}
                  variant={formData.interests.includes(interest) ? "default" : "secondary"}
                  className={`cursor-pointer transition-all ${
                    formData.interests.includes(interest)
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                      : "hover:bg-gray-200"
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
                <span className="text-sm text-gray-700">Mostrar edad</span>
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
            </div>
          </CardContent>
        </Card>
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
        
        .animate-blob {
          animation: blob 7s infinite;
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

export default EditProfileSingle;
