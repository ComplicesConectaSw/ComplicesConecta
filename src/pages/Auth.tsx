import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { isDemoCredential, getAppConfig, handleDemoAuth } from "@/lib/app-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Shield, Users, Zap } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { MapPin, ArrowLeft, Sparkles } from "lucide-react";
import { lifestyleInterests, getAutoInterests } from "@/lib/lifestyle-interests";
import { LoginLoadingScreen } from "@/components/LoginLoadingScreen";
import { useAuth } from "@/hooks/useAuth";

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
  const { user, session, profile, loading, signIn, signOut, isAdmin, isDemo, getProfileType, shouldUseProductionAdmin, appMode } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
      if (error) throw error;
      
      toast({
        title: "Email enviado",
        description: "Revisa tu correo para restablecer tu contraseña",
      });
      setShowResetPassword(false);
      setResetEmail("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el email de restablecimiento",
      });
    }
  };

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
      const appConfig = getAppConfig();
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
            role: 'admin',
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
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
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
        setShowLoginLoading(true);
        
        // Determinar tipo de usuario usando email normalizado
        const accountType = normalizedEmail.includes('pareja') ? 'couple' : 
                           normalizedEmail.includes('djwacko28') ? 'admin' : 
                           normalizedEmail.includes('complicesconectasw') ? 'admin' : 'single';
        
        // Usar la función handleDemoAuth para crear sesión demo correcta
        const demoAuthResult = handleDemoAuth(normalizedEmail, accountType);
        
        // Sobrescribir localStorage con datos correctos para admins
        if (accountType === 'admin' && demoAuthResult) {
          const correctedUser = {
            ...demoAuthResult.user,
            role: 'admin',
            accountType: 'admin',
            first_name: normalizedEmail === 'djwacko28@gmail.com' ? 'DJ Wacko' : 'Complices Admin'
          };
          
          localStorage.setItem('demo_user', JSON.stringify(correctedUser));
          localStorage.setItem('demo_authenticated', 'true');
          localStorage.setItem('userType', 'admin');
        }
        
        if (demoAuthResult) {
          console.log('✅ Sesión demo creada correctamente:', demoAuthResult);
          
          // Simular tiempo de carga y luego redirigir
          setTimeout(() => {
            setShowLoginLoading(false);
            // Redirigir según el tipo de usuario
            if (accountType === 'admin') {
              navigate("/admin");
            } else if (accountType === 'couple') {
              navigate("/profile-couple");
            } else {
              navigate("/discover");
            }
          }, 3000);
        } else {
          console.error('❌ Error al crear sesión demo');
          setShowLoginLoading(false);
          toast({
            variant: "destructive",
            title: "Error al iniciar sesión",
            description: "Error interno al crear sesión demo",
          });
        }
        return;
      }

      // Usar el hook useAuth para autenticación real
      if (!isDemoCredential(normalizedEmail) && getAppConfig().features.realAuth) {
        console.log('🔐 Usando useAuth para autenticación real:', formData.email);
        console.log('📧 Email normalizado:', normalizedEmail);
        
        try {
          const result = await signIn(formData.email, formData.password, formData.accountType);
          
          if (result?.user) {
            console.log('✅ Autenticación exitosa, esperando carga de perfil...');
            
            // Esperar hasta que el perfil se cargue completamente
            let profileCheckAttempts = 0;
            const maxAttempts = 20; // 10 segundos máximo (20 * 500ms)
            
            const waitForProfile = () => {
              profileCheckAttempts++;
              
              console.log(`🔍 Intento ${profileCheckAttempts}/${maxAttempts} - Verificando perfil:`, {
                profileExists: !!profile,
                first_name: profile?.first_name,
                role: profile?.role,
                email: profile?.email,
                userEmail: user?.email
              });
              
              // Condición mejorada: verificar si el perfil existe O si tenemos datos del usuario
              const hasValidProfile = profile && (
                profile.first_name || 
                profile.role || 
                profile.email || 
                profile.id
              );
              
              const hasUserData = user && user.email;
              
              if (hasValidProfile || hasUserData) {
                console.log('📋 Perfil/Usuario disponible - procediendo con redirección');
                
                // Verificar si es admin para redirección
                const adminCheck = isAdmin();
                console.log('🔐 Verificación admin:', adminCheck);
                
                if (adminCheck) {
                  console.log('👑 Admin detectado - verificando tipo de panel');
                  const useProduction = shouldUseProductionAdmin();
                  console.log('🏭 Usar panel producción:', useProduction);
                  
                  if (useProduction) {
                    console.log('📊 Redirigiendo a AdminProduction (datos reales)');
                    navigate("/admin-production");
                  } else {
                    console.log('🎭 Redirigiendo a Admin (datos demo)');
                    navigate("/admin");
                  }
                } else {
                  console.log('👤 Usuario regular - redirigiendo a discover');
                  navigate("/discover");
                }
              } else if (profileCheckAttempts >= maxAttempts) {
                console.warn('⚠️ Timeout alcanzado - redirigiendo sin perfil completo');
                
                // Fallback: usar email del usuario para determinar si es admin
                const userEmail = user?.email?.toLowerCase();
                const adminEmails = [
                  'djwacko28@gmail.com',        // Admin demo solamente
                  'complicesconectasw@outlook.es'  // Único admin real
                ];
                const isAdminByEmail = userEmail && adminEmails.includes(userEmail);
                
                console.log('🔐 Verificación admin por email (fallback):', isAdminByEmail);
                
                if (isAdminByEmail) {
                  console.log('👑 Admin detectado por email - verificando tipo de panel');
                  const useProduction = shouldUseProductionAdmin();
                  console.log('🏭 Usar panel producción (fallback):', useProduction);
                  
                  if (useProduction) {
                    console.log('📊 Redirigiendo a AdminProduction (datos reales)');
                    navigate("/admin-production");
                  } else {
                    console.log('🎭 Redirigiendo a Admin (datos demo)');
                    navigate("/admin");
                  }
                } else {
                  console.log('👤 Usuario regular por defecto - redirigiendo a discover');
                  navigate("/discover");
                }
              } else {
                console.log('⏳ Perfil aún no cargado, reintentando...');
                // Reintentar después de 500ms
                setTimeout(waitForProfile, 500);
              }
            };
            
            // Iniciar verificación después de 200ms (más rápido)
            setTimeout(waitForProfile, 200);
          }
        } catch (error) {
          console.error('❌ Error en signIn:', error);
          
          // Mensaje de error más específico
          let errorMessage = "Credenciales inválidas. Verifique su email y contraseña.";
          if (error instanceof Error) {
            if (error.message?.includes('Invalid login credentials')) {
              errorMessage = "Email o contraseña incorrectos. Verifique sus credenciales.";
            } else if (error.message?.includes('Email not confirmed')) {
              errorMessage = "Email no confirmado. Revise su bandeja de entrada.";
            }
          }
          
          toast({
            variant: "destructive",
            title: "Error al iniciar sesión",
            description: errorMessage,
          });
        }
      } else if (!isDemoCredential(normalizedEmail)) {
        // Credencial no reconocida y no es demo
        toast({
          variant: "destructive",
          title: "Error al iniciar sesión",
          description: "Credenciales inválidas. Verifique su email y contraseña o use las credenciales demo disponibles.",
        });
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error de autenticación:', error);
      toast({
        title: "Error al iniciar sesión",
        description: errorMessage || "Credenciales incorrectas. Por favor, intenta de nuevo.",
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
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', formData.email)
        .maybeSingle();

      // Si hay error diferente a "no encontrado", manejarlo
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error verificando email:', checkError);
        toast({
          title: "Error",
          description: "Debes aceptar los términos y condiciones",
          variant: "destructive",
        });
        return;
      }

      if (parseInt(formData.age) < 18 || (formData.accountType === "couple" && parseInt(formData.partnerAge) < 18)) {
        toast({
          title: "Error",
          description: "Debes ser mayor de 18 años para registrarte",
          variant: "destructive",
        });
        return;
      }

      // Preparar datos del perfil
      const profileData = {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        nickname: formData.nickname,
        age: parseInt(formData.age),
        gender: formData.gender,
        interested_in: formData.interestedIn,
        bio: formData.bio,
        account_type: formData.accountType,
        location: location || formData.location,
        interests: formData.selectedInterests,
        ...(formData.accountType === "couple" && {
          partner_first_name: formData.partnerFirstName,
          partner_last_name: formData.partnerLastName,
          partner_nickname: formData.partnerNickname,
          partner_age: parseInt(formData.partnerAge),
          partner_gender: formData.partnerGender,
          partner_interested_in: formData.partnerInterestedIn,
          partner_bio: formData.partnerBio,
        }),
      };

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: profileData,
        },
      });

      if (error) throw error;

      toast({
        title: "¡Registro exitoso!",
        description: "Revisa tu correo para confirmar tu cuenta",
      });

      // Limpiar formulario
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        nickname: '',
        age: '',
        gender: '',
        interestedIn: '',
        bio: '',
        role: '',
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
        selectedInterests: [],
      });

    } catch (error: any) {
      let errorMessage = "Error desconocido al crear la cuenta";
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "Este email ya está registrado. Intenta iniciar sesión.";
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = "La contraseña debe tener al menos 6 caracteres.";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "El formato del email no es válido.";
      } else if (error.message?.includes('Signup is disabled')) {
        errorMessage = "El registro está temporalmente deshabilitado. Intenta más tarde.";
      } else if (error.message) {
        errorMessage = error.message;
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
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <Heart className="absolute top-20 left-10 w-8 h-8 text-white/20 animate-float" fill="currentColor" />
        <Sparkles className="absolute top-32 right-16 w-6 h-6 text-white/30 animate-float" style={{ animationDelay: '1s' }} />
        <Heart className="absolute bottom-32 left-20 w-6 h-6 text-white/25 animate-float" style={{ animationDelay: '2s' }} fill="currentColor" />
        <Users className="absolute bottom-20 right-10 w-8 h-8 text-white/20 animate-float" style={{ animationDelay: '0.5s' }} />
      </div>
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-1"></div>
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-2"></div>
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-3"></div>
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-4"></div>
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-5"></div>
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-6"></div>
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-7"></div>
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-8"></div>
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-9"></div>
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-10"></div>
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-11"></div>
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-12"></div>
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-13"></div>
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-14"></div>
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-15"></div>
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-16"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">ComplicesConecta</CardTitle>
            <CardDescription className="text-white/70">
              Conecta con personas afines en un entorno seguro
            </CardDescription>
            
            <div className="flex justify-center space-x-8 mt-6 mb-4">
              <div className="text-center">
                <Shield className="h-6 w-6 text-green-400 mx-auto mb-1" />
                <p className="text-xs text-white">Seguro</p>
              </div>
              <div className="text-center">
                <Users className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                <p className="text-xs text-white">Comunidad</p>
              </div>
              <div className="text-center">
                <Sparkles className="h-6 w-6 text-pink-400 mx-auto mb-1" />
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
                
                {/* Reset Password Link */}
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-sm text-white hover:text-white/80 underline font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </form>
              
              {/* Reset Password Modal */}
              {showResetPassword && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-background rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-4">Restablecer Contraseña</h3>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="resetEmail">Correo electrónico</Label>
                        <Input
                          id="resetEmail"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="Ingresa tu email"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setShowResetPassword(false);
                            setResetEmail("");
                          }}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="flex-1">
                          {isLoading ? "Enviando..." : "Enviar"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
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
                  
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-thin smooth-scroll scroll-container">
                    {lifestyleInterests.map((interest, index) => (
                      <div 
                        key={index} 
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-purple-500/10 transition-all duration-300 hover:scale-105 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <Checkbox
                          id={`interest-${index}`}
                          checked={formData.selectedInterests.includes(interest)}
                          onCheckedChange={() => handleInterestToggle(interest)}
                          className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                        />
                        <Label 
                          htmlFor={`interest-${index}`} 
                          className="text-xs cursor-pointer text-white hover:text-purple-300 transition-colors duration-200 select-none"
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