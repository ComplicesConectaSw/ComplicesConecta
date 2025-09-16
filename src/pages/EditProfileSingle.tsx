import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Upload, Plus, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateMockSingle } from "@/lib/data";
import ImageUpload from "@/components/profile/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { getAppConfig } from "@/lib/app-config";
import Navigation from "@/components/Navigation";
import type { Tables } from '@/integrations/supabase/types';
import { logger } from '@/lib/logger';
import { usePersistedState } from '@/hooks/usePersistedState';

const EditProfileSingle = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Tables<'profiles'> | any>(null);
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
  const [profileLoaded, setProfileLoaded] = useState(false);

  const availableInterests = [
    "Lifestyle Swinger", "Intercambio de Parejas", "Encuentros Casuales", "Comunicación Abierta", 
    "Respeto Mutuo", "Experiencias Nuevas", "Discreción Total", "Fiestas Privadas", "Clubs Exclusivos", "Conexiones Reales",
    "Aventuras", "Diversión", "Hoteles Temáticos", "Eventos VIP", "Masajes Sensuales", "Fotografía Sensual"
  ];

  const loadProfile = useCallback(async () => {
    if (profileLoaded) return;
    
    try {
      // Verificar autenticación demo primero
      const demoAuth = localStorage.getItem('demo_authenticated');
      const demoUser = localStorage.getItem('demo_user');
      
      if (demoAuth === 'true' && demoUser) {
        const user = JSON.parse(demoUser);
        let profileData;
        
        if (user.accountType === 'single' || user.type === 'single') {
          profileData = generateMockSingle(user.id);
          setFormData({
            name: profileData.first_name + ' ' + profileData.last_name,
            age: profileData.age.toString(),
            bio: profileData.bio,
            location: profileData.location,
            profession: profileData.profession || '',
            interests: profileData.interests || [],
            avatar: profileData.avatar || ''
          });
          setUserId(user.id);
          setProfile(profileData);
          setProfileLoaded(true);
          return;
        }
      }
      
      // Si no hay demo auth, intentar con Supabase
      if (getAppConfig().features.demoCredentials) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile, error } = await (supabase as any)
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            logger.error('Error fetching profile:', { error: error.message });
            setError('Error al cargar perfil');
          } else if (profile) {
            const profileData = profile as any;
            setFormData({
              name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
              age: profileData.age?.toString() || '',
              bio: profileData.bio || '',
              location: `${profileData.latitude || ''}, ${profileData.longitude || ''}`,
              profession: '',
              interests: [],
              avatar: ''
            });
            setUserId(user.id);
            setProfile(profile);
            setProfileLoaded(true);
            return;
          }
        }
      }
      
      // Fallback: crear perfil demo
      const newProfile = generateMockSingle();
      setFormData({
        name: `${newProfile.first_name} ${newProfile.last_name}`,
        age: newProfile.age.toString(),
        bio: newProfile.bio,
        location: newProfile.location,
        profession: newProfile.profession,
        interests: newProfile.interests,
        avatar: newProfile.avatar
      });
      
      if (newProfile.id) {
        setUserId(newProfile.id);
        setProfile(newProfile);
        setProfileLoaded(true);
      }
    } catch (error) {
      setError('Error inesperado al cargar perfil');
      logger.error('Error loading profile:', { error: String(error) });
      
      // En caso de error, crear perfil demo como fallback
      const fallbackProfile = generateMockSingle();
      setFormData({
        name: `${fallbackProfile.first_name} ${fallbackProfile.last_name}`,
        age: fallbackProfile.age.toString(),
        bio: fallbackProfile.bio,
        location: fallbackProfile.location,
        profession: fallbackProfile.profession,
        interests: fallbackProfile.interests,
        avatar: fallbackProfile.avatar
      });
      setUserId(fallbackProfile.id);
      setProfile(fallbackProfile);
      setProfileLoaded(true);
    }
  }, [profileLoaded]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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
      if (getAppConfig().features.demoCredentials) {
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
        const { error } = await (supabase as any)
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden pb-20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4 shadow-lg relative z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile-single')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al perfil
          </Button>
          <h1 className="text-xl font-bold text-white">Editar Perfil</h1>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 pb-24 space-y-6 max-w-4xl">
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
