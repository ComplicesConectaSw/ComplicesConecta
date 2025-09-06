import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Upload, Plus, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateMockSingle } from "@/lib/data";
import ImageUpload from "../components/ImageUpload";
import { supabase } from "../integrations/supabase/client";
import { appConfig } from "../lib/app-config";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState<string>("");

  const availableInterests = [
    "Lifestyle Swinger", "Intercambio de Parejas", "Encuentros Casuales", "Comunicación Abierta", 
    "Respeto Mutuo", "Experiencias Nuevas", "Discreción Total", "Fiestas Privadas", "Clubs Exclusivos", "Conexiones Reales",
    "Aventuras", "Diversión", "Hoteles Temáticos", "Eventos VIP", "Masajes Sensuales", "Fotografía Sensual"
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (appConfig.features.demoCredentials) {
        // Modo demo
        const demoAuth = localStorage.getItem('demo_authenticated');
        const demoUser = localStorage.getItem('demo_user');
        
        if (demoAuth === 'true' && demoUser) {
          const user = JSON.parse(demoUser);
          let profileData;
          
          if (user.accountType === 'single') {
            profileData = user;
          } else {
            profileData = generateMockSingle();
          }
          
          setProfile(profileData);
          setUserId(user.id || 'demo-user');
          setFormData({
            name: profileData.name || "",
            age: profileData.age?.toString() || "",
            location: profileData.location || "",
            profession: profileData.profession || "",
            bio: profileData.bio || "",
            interests: profileData.interests || [],
            avatar: profileData.avatar || ""
          });
        }
      } else {
        // Modo producción - cargar desde Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }
        
        setUserId(user.id);
        
        // Cargar perfil desde Supabase
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          setError('Error al cargar perfil: ' + error.message);
          return;
        }
        
        if (profileData) {
          setProfile(profileData);
          setFormData({
            name: `${profileData.first_name} ${profileData.last_name}`.trim() || "",
            age: profileData.age?.toString() || "",
            location: "", // No location field in current schema
            profession: "", // No profession field in current schema
            bio: profileData.bio || "",
            interests: [], // No interests field in current schema
            avatar: "" // No avatar_url field in current schema
          });
        } else {
          // Crear perfil nuevo si no existe
          const newProfile = {
            id: user.id,
            first_name: user.user_metadata?.name?.split(' ')[0] || "Usuario",
            last_name: user.user_metadata?.name?.split(' ').slice(1).join(' ') || "",
            age: 25, // Default age
            gender: 'other',
            interested_in: 'all',
            user_id: user.id,
            created_at: new Date().toISOString()
          };
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile);
          
          if (insertError) {
            setError('Error al crear perfil: ' + insertError.message);
          } else {
            setProfile(newProfile);
          }
        }
      }
    } catch (error) {
      setError('Error inesperado al cargar perfil');
      console.error('Error loading profile:', error);
    } finally {
      console.log('Profile loaded');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSave = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (appConfig.features.demoCredentials) {
        // Modo demo - guardar en localStorage
        const demoUser = JSON.parse(localStorage.getItem('demo_user') || '{}');
        const updatedUser = {
          ...demoUser,
          ...formData,
          age: parseInt(formData.age) || undefined
        };
        localStorage.setItem('demo_user', JSON.stringify(updatedUser));
        setSuccess('Perfil guardado exitosamente (modo demo)');
      } else {
        // Modo producción - guardar en Supabase
        const nameParts = formData.name.split(' ');
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            age: parseInt(formData.age) || 25,
            bio: formData.bio,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (error) {
          setError('Error al guardar perfil: ' + error.message);
        } else {
          setSuccess('Perfil guardado exitosamente');
        }
      }
    } catch (error) {
      setError('Error inesperado al guardar perfil');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, avatar: url }));
    setSuccess('Imagen subida exitosamente');
  };
  
  const handleImageError = (error: string) => {
    setError(error);
  };

  const handleLogout = () => {
    // Limpiar datos de sesión demo
    localStorage.removeItem('demo_authenticated');
    localStorage.removeItem('demo_user');
    navigate('/auth');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden px-2 sm:px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white">Editar Perfil</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 pb-24 space-y-6">
        {/* Información básica */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-glow">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-white mb-4">Información básica</h3>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Nombre completo</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Tu nombre completo"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Edad</label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Tu edad"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
            </div>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-glow">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-white mb-4">Información adicional</h3>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Ubicación</label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ciudad donde vives"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Profesión</label>
              <Input
                value={formData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                placeholder="A qué te dedicas"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
            </div>
          </CardContent>
        </Card>

        {/* Biografía */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-glow">
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-4">Sobre ti</h3>
            <Textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Cuéntanos sobre ti, qué buscas en el lifestyle swinger..."
              rows={4}
              className="resize-none bg-white/20 border-white/30 text-white placeholder:text-white/70"
            />
            <p className="text-xs text-white/70 mt-2">
              {formData.bio.length}/500 caracteres
            </p>
          </CardContent>
        </Card>

        {/* Intereses */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-glow">
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-4">Intereses</h3>
            <p className="text-sm text-white/70 mb-4">Selecciona hasta 6 intereses que te representen en el lifestyle</p>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 border border-white/30 rounded-lg bg-white/10 backdrop-blur-sm">
              {availableInterests.map((interest) => (
                <Badge
                  key={interest}
                  variant={formData.interests.includes(interest) ? "default" : "secondary"}
                  className={`cursor-pointer transition-all ${
                    formData.interests.includes(interest)
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md border-0"
                      : "bg-white/20 text-white border border-white/30 hover:bg-white/30"
                  }`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                  {formData.interests.includes(interest) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-white/70 mt-2">
              {formData.interests.length}/6 seleccionados
            </p>
          </CardContent>
        </Card>

        {/* Configuración de privacidad */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-glow">
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-4">Configuración de privacidad</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Mostrar edad</span>
                <input type="checkbox" defaultChecked className="rounded bg-white/20 border-white/30" title="Mostrar edad en perfil" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Mostrar ubicación</span>
                <input type="checkbox" defaultChecked className="rounded bg-white/20 border-white/30" title="Mostrar ubicación en perfil" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Aparecer en búsquedas</span>
                <input type="checkbox" defaultChecked className="rounded bg-white/20 border-white/30" title="Aparecer en resultados de búsqueda" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      </div>

      <Navigation />
      
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
