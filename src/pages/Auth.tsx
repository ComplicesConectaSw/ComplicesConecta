import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Shield, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";
import { MapPin, ArrowLeft, Sparkles } from "lucide-react";
import { lifestyleInterests, getAutoInterests } from "@/lib/lifestyle-interests";
import { LoginLoadingScreen } from "@/components/LoginLoadingScreen";
import { appConfig, isDemoCredential } from "@/lib/app-config";

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nickname: string;
  age: string;
  gender: string;
  interestedIn: string;
  bio: string;
  role: string;
  accountType: string;
  partnerFirstName: string;
  partnerLastName: string;
  partnerNickname: string;
  partnerAge: string;
  partnerGender: string;
  partnerInterestedIn: string;
  partnerBio: string;
  location: string;
  acceptTerms: boolean;
  shareLocation: boolean;
  selectedInterests: string[];
}

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getCurrentLocation, location, isLoading: locationLoading, error: locationError } = useGeolocation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginLoading, setShowLoginLoading] = useState(false);
  const [autoLocationRequested, setAutoLocationRequested] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    nickname: '',
    age: '',
    gender: '',
    interestedIn: '',
    bio: '',
    role: 'user',
    accountType: 'single',
    partnerFirstName: '',
    partnerLastName: '',
    partnerNickname: '',
    partnerAge: '',
    partnerGender: '',
    partnerInterestedIn: '',
    partnerBio: '',
    location: '',
    acceptTerms: false,
    shareLocation: false,
    selectedInterests: []
  });

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      selectedInterests: prev.selectedInterests.includes(interest)
        ? prev.selectedInterests.filter(i => i !== interest)
        : [...prev.selectedInterests, interest]
    }));
  };

  // Auto-request location when component mounts
  useEffect(() => {
    if (!autoLocationRequested) {
      getCurrentLocation();
      setAutoLocationRequested(true);
    }
  }, [getCurrentLocation, autoLocationRequested]);

  // Update form location when geolocation changes
  useEffect(() => {
    if (location) {
      const locationString = `${location.latitude.toFixed(6)},${location.longitude.toFixed(6)}`;
      handleInputChange("location", locationString);
      toast({
        title: "Ubicación detectada",
        description: "Tu ubicación ha sido detectada automáticamente",
      });
    }
  }, [location, toast]);

    const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const normalizedEmail = formData.email.toLowerCase().trim()
        .replace('@otlook.es', '@outlook.es')
        .replace('@outllok.es', '@outlook.es')
        .replace('@outlok.es', '@outlook.es')
        .replace('@outook.es', '@outlook.es');

      // Verificar si es credencial demo Y si el modo demo está habilitado
      if (isDemoCredential(normalizedEmail) && appConfig.features.demoCredentials) {
        console.log('🎭 Modo demo activado para:', formData.email);
        
        // Configurar usuario demo completo en localStorage
        const demoUser = {
          id: normalizedEmail.includes('single') ? 'single-demo-id' : 
              normalizedEmail.includes('pareja') ? 'couple-demo-id' : 'admin-demo-id',
          email: normalizedEmail,
          displayName: normalizedEmail.includes('pareja') ? 'Ana & Carlos' : 
                      normalizedEmail.includes('single') ? 'María González' : 'Administrador',
          accountType: normalizedEmail.includes('pareja') ? 'couple' : 
                      normalizedEmail.includes('single') ? 'single' : 'admin',
          isDemo: true,
          isAuthenticated: true,
          // Perfil completo para single
          ...(normalizedEmail.includes('single') && {
            age: 28,
            bio: 'Me encanta viajar, la fotografía y conocer gente nueva. Busco conexiones auténticas y experiencias únicas.',
            location: 'Ciudad de México, México',
            interests: ['Lifestyle Swinger', 'Comunicación Abierta', 'Respeto Mutuo', 'Experiencias Nuevas', 'Discreción Total'],
            photos: [
              'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=faces',
              'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
              'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400'
            ],
            avatar: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=faces',
            gender: 'female',
            interestedIn: 'both',
            verified: true,
            premium: false,
            relationshipType: 'single'
          }),
          // Perfil completo para administrador demo
          ...(normalizedEmail.includes('djwacko28') && {
            id: 'admin-demo-id',
            accountType: 'admin',
            role: 'administrador',
            displayName: 'Administrador Demo',
            permissions: ['admin', 'moderator', 'user']
          }),
          // Perfil completo para pareja
          ...(normalizedEmail.includes('pareja') && {
            id: 'couple-demo-id',
            coupleName: 'Sofia & Miguel',
            location: 'Guadalajara, México',
            bio: 'Somos una pareja aventurera que busca nuevas experiencias y conexiones. Nos gusta explorar juntos y conocer gente interesante.',
            avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400',
            verified: true,
            premium: true,
            relationshipType: 'couple',
            accountType: 'couple',
            partner1: {
              name: 'Sofia',
              age: 26,
              bio: 'Me encanta explorar nuevas experiencias junto a mi pareja. Soy diseñadora gráfica y disfruto de la vida al máximo.',
              interests: ['Lifestyle Swinger', 'Comunicación Abierta', 'Respeto Mutuo', 'Experiencias Nuevas', 'Discreción Total'],
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616c96d2e9c?w=400',
              profession: 'Diseñadora Gráfica'
            },
            partner2: {
              name: 'Miguel',
              age: 29,
              bio: 'Aventurero y respetuoso, busco junto a mi pareja vivir experiencias únicas. Trabajo como ingeniero de software.',
              interests: ['Intercambio de Parejas', 'Parejas Experimentadas', 'Eventos Lifestyle', 'Clubs Privados', 'Hoteles Temáticos'],
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
              profession: 'Ingeniero de Software'
            },
            isOnline: true,
            isVerified: true,
            isPremium: true
          })
        };
        
        localStorage.setItem('demo_user', JSON.stringify(demoUser));
        localStorage.setItem('demo_authenticated', 'true');
        
        // Disparar evento para notificar cambios en localStorage
        window.dispatchEvent(new Event('storage'));
        
        // Simular autenticación exitosa para demo
        toast({
          title: `¡Bienvenido de vuelta! ${appConfig.ui.demoLabel}`,
          description: appConfig.mode === 'demo' 
            ? "Has iniciado sesión correctamente en modo demostración."
            : "Has iniciado sesión correctamente.",
          duration: 3000,
        });

        // Mostrar LoginLoadingScreen antes de redirigir
        setShowLoginLoading(true);
        
        // Determinar tipo de usuario y nombre usando email normalizado
        const userType = normalizedEmail.includes('pareja') ? 'couple' : 
                         normalizedEmail.includes('djwacko28') ? 'admin' : 'single';
        const userName = normalizedEmail.includes('pareja') ? 'Pareja Demo' : 
                        normalizedEmail.includes('djwacko28') ? 'Admin Demo' : 'Usuario Demo';
        
        // Guardar tipo de usuario en localStorage
        localStorage.setItem('userType', userType);
        localStorage.setItem('demo_session', 'active');
        
        // Simular tiempo de carga y luego redirigir
        setTimeout(() => {
          setShowLoginLoading(false);
          // Redirigir según el tipo de usuario usando email normalizado
          if (normalizedEmail.includes('complicesconectasw')) {
            navigate("/admin-production");
          } else if (normalizedEmail.includes('pareja')) {
            navigate("/profile-couple");
          } else if (normalizedEmail.includes('single')) {
            navigate("/profile-single");
          } else {
            navigate("/discover");
          }
        }, 3000);
        return;
      }

      // En modo producción, intentar autenticación real con Supabase para TODOS los usuarios
      if (appConfig.features.realAuth) {
        console.log('🔐 Intentando autenticación real con Supabase para:', formData.email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error('❌ Error de autenticación:', error);
          const errorMessage = appConfig.mode === 'demo' 
            ? "Credenciales inválidas. Use las credenciales demo: single@outlook.es o pareja@outlook.es"
            : "Credenciales inválidas. Verifique su email y contraseña.";
          
          toast({
            variant: "destructive",
            title: "Error al iniciar sesión",
            description: errorMessage,
          });
          return;
        }

        // Redirigir según el tipo de usuario
        if (normalizedEmail.includes('complicesconectasw')) {
          navigate("/admin-production");
        } else if (normalizedEmail.includes('pareja')) {
          navigate("/profile-couple");
        } else if (normalizedEmail.includes('single')) {
          navigate("/profile-single");
        } else {
          navigate("/discover");
        }
      } else {
        // En modo demo sin credenciales demo válidas
        toast({
          variant: "destructive",
          title: "Error al iniciar sesión",
          description: "Use las credenciales demo: single@outlook.es o pareja@outlook.es",
        });
      }

    } catch (error: any) {
      console.error('❌ Error de autenticación:', error);
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Verificar email único antes del registro
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existingProfile) {
        toast({
          variant: "destructive",
          title: "Email ya registrado",
          description: "Este email ya está en uso. Intenta iniciar sesión o usa otro email.",
        });
        return;
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            age: Number(formData.age) || null,
            gender: formData.gender,
            interested_in: formData.interestedIn,
            bio: formData.bio,
            role: formData.role,
            account_type: formData.accountType,
            // Datos de pareja (si aplica)
            partner_first_name: formData.accountType === "couple" ? formData.partnerFirstName : null,
            partner_last_name: formData.accountType === "couple" ? formData.partnerLastName : null,
            partner_age: formData.accountType === "couple" ? (Number(formData.partnerAge) || null) : null,
            partner_gender: formData.accountType === "couple" ? formData.partnerGender : null,
            partner_interested_in: formData.accountType === "couple" ? formData.partnerInterestedIn : null,
            partner_bio: formData.accountType === "couple" ? formData.partnerBio : null,
            latitude: location?.latitude || null,
            longitude: location?.longitude || null,
            share_location: formData.shareLocation,
            selected_interests: formData.selectedInterests
          }
        }
      });

      if (error) throw error;

      toast({
        title: "¡Cuenta creada!",
        description: "Revisa tu correo para confirmar tu cuenta.",
      });
    } catch (error: unknown) {
      console.error('❌ Error de registro:', error);
      let errorMessage = "Ha ocurrido un error inesperado.";
      const errorObj = error as { message?: string };
      
      if (errorObj.message?.includes('Failed to fetch') || errorObj.message?.includes('fetch')) {
        errorMessage = "Problema de conexión. Verifica tu internet y vuelve a intentar.";
      } else if (errorObj.message?.includes('User already registered')) {
        errorMessage = "Este email ya está registrado. Intenta iniciar sesión o usa otro email.";
      } else if (errorObj.message?.includes('Password should be at least')) {
        errorMessage = "La contraseña debe tener al menos 6 caracteres.";
      } else if (errorObj.message?.includes('Invalid email')) {
        errorMessage = "El formato del email no es válido.";
      } else if (errorObj.message?.includes('Signup is disabled')) {
        errorMessage = "El registro está temporalmente deshabilitado. Intenta más tarde.";
      } else if (errorObj.message) {
        errorMessage = errorObj.message;
      }
      
      toast({
        variant: "destructive",
        title: "Error al crear cuenta",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-hero-gradient">
      {/* Advanced Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-32 right-32 w-48 h-48 bg-accent/8 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-secondary/6 rounded-full blur-xl animate-float animation-delay-1000"></div>
        </div>
        {/* Floating Icons */}
        <Heart className="absolute top-32 left-1/4 w-6 h-6 text-primary/20 animate-float animation-delay-500" fill="currentColor" />
        <Sparkles className="absolute bottom-1/3 right-1/4 w-5 h-5 text-accent/25 animate-float animation-delay-1200" />
        <Shield className="absolute top-1/3 right-1/5 w-7 h-7 text-secondary/20 animate-float animation-delay-2000" />
        <Users className="absolute bottom-1/4 left-1/6 w-6 h-6 text-primary/15 animate-float animation-delay-800" />
      </div>
      
      {/* Back Button */}
      <div className="relative z-10 p-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-foreground hover:bg-primary/10 transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Button>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 pt-0">
        <Card className="w-full max-w-md shadow-glow border-0 backdrop-blur-sm bg-background/95">
        <CardHeader className="text-center relative">
          {/* Animated Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="relative">
              <Heart className="h-10 w-10 text-primary animate-pulse-glow" fill="currentColor" />
              <div className="absolute inset-0 animate-ping opacity-30">
                <Heart className="h-10 w-10 text-primary/50" fill="currentColor" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-love-gradient bg-clip-text text-transparent">
              ComplicesConecta
            </h1>
          </div>
          <CardTitle className="text-2xl mb-2">Encuentra tu cómplice perfecto</CardTitle>
          <CardDescription className="text-base">
            Conecta con personas que comparten tus intereses y valores
          </CardDescription>
          
          {/* Features Preview */}
          <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <Shield className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="text-xs text-white">Verificado</p>
            </div>
            <div className="text-center">
              <Users className="h-6 w-6 text-accent mx-auto mb-1" />
              <p className="text-xs text-white">Comunidad</p>
            </div>
            <div className="text-center">
              <Sparkles className="h-6 w-6 text-secondary mx-auto mb-1" />
              <p className="text-xs text-white">IA Match</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountType">Tipo de perfil</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleInputChange("accountType", "single")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.accountType === "single"
                          ? "border-pink-500 bg-pink-50 text-pink-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">👤</div>
                        <div className="font-semibold">Single</div>
                        <div className="text-xs text-white">Perfil individual</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange("accountType", "couple")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.accountType === "couple"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">👫</div>
                        <div className="font-semibold">Pareja</div>
                        <div className="text-xs text-white">Perfil de pareja</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                {formData.accountType === "single" ? (
                  // Formulario para Single
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="nickname">Apodo (como te mostrarás)</Label>
                      <Input
                        id="nickname"
                        value={formData.nickname}
                        onChange={(e) => handleInputChange("nickname", e.target.value)}
                        placeholder="Ej: Alex, María, etc."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="age">Edad</Label>
                        <Input
                          id="age"
                          type="number"
                          min="18"
                          max="99"
                          value={formData.age}
                          onChange={(e) => handleInputChange("age", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Género</Label>
                        <Select onValueChange={(value) => handleInputChange("gender", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar género" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Hombre</SelectItem>
                            <SelectItem value="female">Mujer</SelectItem>
                            <SelectItem value="non-binary">No binario</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                ) : (
                  // Formulario para Pareja
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="nickname">Apodo de la pareja (como se mostrarán)</Label>
                      <Input
                        id="nickname"
                        value={formData.nickname}
                        onChange={(e) => handleInputChange("nickname", e.target.value)}
                        placeholder="Ej: Ana & Carlos, Los Aventureros, etc."
                        required
                      />
                    </div>
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-semibold text-center">Información de Él</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Nombre</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Apellido</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="age">Edad</Label>
                          <Input
                            id="age"
                            type="number"
                            min="18"
                            max="99"
                            value={formData.age}
                            onChange={(e) => handleInputChange("age", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender">Género</Label>
                          <Select onValueChange={(value) => handleInputChange("gender", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar género" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Hombre</SelectItem>
                              <SelectItem value="female">Mujer</SelectItem>
                              <SelectItem value="non-binary">No binario</SelectItem>
                              <SelectItem value="other">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-semibold text-center">Información de Ella</h3>
                      <div className="space-y-2">
                        <Label htmlFor="partnerNickname">Apodo de ella</Label>
                        <Input
                          id="partnerNickname"
                          value={formData.partnerNickname}
                          onChange={(e) => handleInputChange("partnerNickname", e.target.value)}
                          placeholder="Ej: Ana, Carmen, etc."
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="partnerFirstName">Nombre</Label>
                          <Input
                            id="partnerFirstName"
                            value={formData.partnerFirstName}
                            onChange={(e) => handleInputChange("partnerFirstName", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="partnerLastName">Apellido</Label>
                          <Input
                            id="partnerLastName"
                            value={formData.partnerLastName}
                            onChange={(e) => handleInputChange("partnerLastName", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="partnerAge">Edad</Label>
                          <Input
                            id="partnerAge"
                            type="number"
                            min="18"
                            max="99"
                            value={formData.partnerAge}
                            onChange={(e) => handleInputChange("partnerAge", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="partnerGender">Género</Label>
                          <Select onValueChange={(value) => handleInputChange("partnerGender", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar género" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Hombre</SelectItem>
                              <SelectItem value="female">Mujer</SelectItem>
                              <SelectItem value="non-binary">No binario</SelectItem>
                              <SelectItem value="other">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Preferencias - Dinámicas según tipo de cuenta */}
                {formData.accountType === "single" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="interestedIn">Interesado en</Label>
                      <Select onValueChange={(value) => handleInputChange("interestedIn", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar preferencia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Hombres</SelectItem>
                          <SelectItem value="female">Mujeres</SelectItem>
                          <SelectItem value="both">Ambos</SelectItem>
                          <SelectItem value="couples">Parejas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía</Label>
                      <Input
                        id="bio"
                        placeholder="Cuéntanos sobre ti..."
                        value={formData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-semibold text-center">Preferencias de Él</h3>
                      <div className="space-y-2">
                        <Label htmlFor="interestedIn">Interesado en</Label>
                        <Select onValueChange={(value) => handleInputChange("interestedIn", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar preferencia" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Hombres</SelectItem>
                            <SelectItem value="female">Mujeres</SelectItem>
                            <SelectItem value="both">Ambos</SelectItem>
                            <SelectItem value="couples">Parejas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Biografía de él</Label>
                        <Input
                          id="bio"
                          placeholder="Cuéntanos sobre él..."
                          value={formData.bio}
                          onChange={(e) => handleInputChange("bio", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-semibold text-center">Preferencias de Ella</h3>
                      <div className="space-y-2">
                        <Label htmlFor="partnerInterestedIn">Interesada en</Label>
                        <Select onValueChange={(value) => handleInputChange("partnerInterestedIn", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar preferencia" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Hombres</SelectItem>
                            <SelectItem value="female">Mujeres</SelectItem>
                            <SelectItem value="both">Ambos</SelectItem>
                            <SelectItem value="couples">Parejas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="partnerBio">Biografía de ella</Label>
                        <Input
                          id="partnerBio"
                          placeholder="Cuéntanos sobre ella..."
                          value={formData.partnerBio}
                          onChange={(e) => handleInputChange("partnerBio", e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {/* Sección de Intereses Lifestyle */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-400">
                  <div className="text-center">
                    <h3 className="font-semibold text-white mb-2">Intereses Lifestyle</h3>
                    <p className="text-sm text-white/90">Selecciona tus intereses para encontrar matches compatibles</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {lifestyleInterests.map((interest, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`interest-${index}`}
                          checked={formData.selectedInterests.includes(interest)}
                          onCheckedChange={() => handleInterestToggle(interest)}
                        />
                        <Label 
                          htmlFor={`interest-${index}`} 
                          className="text-xs cursor-pointer text-white hover:text-purple-300"
                        >
                          {interest}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const autoInterests = getAutoInterests(formData.accountType as 'single' | 'couple');
                        handleInputChange("selectedInterests", autoInterests);
                      }}
                      className="text-purple-600 border-purple-300 hover:bg-purple-100"
                    >
                      Selección automática
                    </Button>
                  </div>
                </div>

                {/* Sección de Foto de Perfil */}
                {formData.accountType === 'couple' ? (
                  <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="text-center">
                      <h3 className="font-semibold text-purple-900 mb-2">Fotos de Perfil de Pareja</h3>
                      <p className="text-sm text-purple-700">Agrega fotos para ambos miembros de la pareja</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Foto para Ella */}
                      <div className="flex flex-col items-center space-y-3">
                        <h4 className="text-sm font-medium text-purple-800">Ella</h4>
                        <div className="w-20 h-20 bg-pink-200 rounded-full flex items-center justify-center overflow-hidden">
                          <span className="text-xl text-pink-600">👩</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-pink-600 border-pink-300 hover:bg-pink-100 text-xs"
                          >
                            Subir foto
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-pink-600 border-pink-300 hover:bg-pink-100 text-xs"
                          >
                            Avatar
                          </Button>
                        </div>
                      </div>
                      
                      {/* Foto para Él */}
                      <div className="flex flex-col items-center space-y-3">
                        <h4 className="text-sm font-medium text-purple-800">Él</h4>
                        <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center overflow-hidden">
                          <span className="text-xl text-blue-600">👨</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-100 text-xs"
                          >
                            Subir foto
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-100 text-xs"
                          >
                            Avatar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <h3 className="font-semibold text-blue-900 mb-2">Foto de Perfil</h3>
                      <p className="text-sm text-blue-700">Agrega una foto para tu perfil</p>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        <span className="text-2xl text-gray-500">📷</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-300 hover:bg-blue-100"
                        >
                          Subir foto
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-300 hover:bg-blue-100"
                        >
                          Avatar temporal
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-400">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">Ubicación</span>
                      </div>
                      {location && (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Detectada automáticamente
                        </span>
                      )}
                      {locationLoading && (
                        <span className="text-xs text-blue-600">
                          🔄 Detectando...
                        </span>
                      )}
                      {locationError && (
                        <span className="text-xs text-red-600">
                          ❌ Error al detectar
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-white/80 mb-3">
                      Tu ubicación se detecta automáticamente para encontrar matches cercanos
                    </p>
                    
                    {!location && !locationLoading && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={getCurrentLocation}
                        className="w-full flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-100"
                      >
                        <MapPin className="h-4 w-4" />
                        Reintentar detección de ubicación
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shareLocation"
                      checked={formData.shareLocation}
                      onCheckedChange={(checked) => handleInputChange("shareLocation", checked as boolean)}
                    />
                    <Label htmlFor="shareLocation" className="text-sm">
                      Compartir mi ubicación en tiempo real para matches dinámicos
                    </Label>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        </Card>
      </div>
      
      {/* LoginLoadingScreen */}
      {showLoginLoading && (
        <LoginLoadingScreen
          onComplete={() => setShowLoginLoading(false)}
          userType={formData.email.includes('pareja') ? 'couple' : 'single'}
          userName={formData.email.includes('pareja') ? 'Pareja Demo' : 'Usuario Demo'}
          userProfile={JSON.parse(localStorage.getItem('demo_user') || '{}')}
        />
      )}
    </div>
  );
};

export default Auth;