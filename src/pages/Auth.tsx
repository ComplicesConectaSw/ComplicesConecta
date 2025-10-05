import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users , ArrowLeft, Sparkles } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

import { LoginLoadingScreen } from "@/components/LoginLoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { Theme } from '@/hooks/useProfileTheme';
import { usePersistedState } from '@/hooks/usePersistedState';

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nickname: string;
  age: string;
  birthDate: string;
  gender: string;
  interestedIn: string;
  bio: string;
  role: string;
  accountType: string;
  partnerFirstName: string;
  partnerLastName: string;
  partnerNickname: string;
  partnerAge: string;
  partnerBirthDate: string;
  partnerGender: string;
  partnerInterestedIn: string;
  partnerBio: string;
  location: string;
  acceptTerms: boolean;
  shareLocation: boolean;
  selectedInterests: string[];
  preferredTheme: Theme;
  profileTheme: string;
}

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getCurrentLocation: _getCurrentLocation, location: _location, isLoading: _locationLoading, error: _locationError } = useGeolocation();
  const { user: _user, session: _session, profile: _profile, loading: _loading, signIn: _signIn, signOut: _signOut, isAdmin: _isAdmin, isDemo: _isDemo, getProfileType: _getProfileType, shouldUseProductionAdmin: _shouldUseProductionAdmin, appMode: _appMode } = useAuth();
  
  // Estado persistente para autenticación demo
  const [_demoUser, _setDemoUser] = usePersistedState<any>('demo_user', null);
  const [_demoAuthenticated, _setDemoAuthenticated] = usePersistedState<boolean>('demo_authenticated', false);
  const [_userType, _setUserType] = usePersistedState<string>('userType', '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [__showResetPassword, _setShowResetPassword] = useState(false);
  const [__resetEmail, _setResetEmail] = useState("");
  const [showLoginLoading, setShowLoginLoading] = useState(false);
  const [__autoLocationRequested, _setAutoLocationRequested] = useState(false);
  const [__showThemeModal, _setShowThemeModal] = useState(false);
  const [__showTermsModal, _setShowTermsModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    nickname: '',
    age: '',
    birthDate: '',
    gender: '',
    interestedIn: '',
    bio: '',
    role: 'user',
    accountType: 'single',
    partnerFirstName: '',
    partnerLastName: '',
    partnerNickname: '',
    partnerAge: '',
    partnerBirthDate: '',
    partnerGender: '',
    partnerInterestedIn: '',
    partnerBio: '',
    location: '',
    acceptTerms: false,
    shareLocation: false,
    selectedInterests: [],
    preferredTheme: 'dark',
    profileTheme: 'dark'
  });

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setShowLoginLoading(true);
    
    try {
      // Configurar credenciales demo
      const demoCredentials = {
        email: 'demo@complicesconecta.com',
        password: 'demo123'
      };
      
      // Establecer estado de autenticación demo
      setDemoAuthenticated(true);
      setDemoUser(demoCredentials);
      setUserType('single');
      
      // Configurar localStorage para demo
      localStorage.setItem('demo_authenticated', 'true');
      localStorage.setItem('demo_user', JSON.stringify(demoCredentials));
      localStorage.setItem('userType', 'single');
      
      toast({
        title: "Acceso Demo Activado",
        description: "Bienvenido al modo demo de ComplicesConecta",
      });
      
      // Navegar al feed después de un breve delay
      setTimeout(() => {
        navigate('/feed');
      }, 1500);
      
    } catch (error) {
      console.error('Error en demo login:', error);
      toast({
        title: "Error",
        description: "No se pudo activar el modo demo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowLoginLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: _data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de vuelta",
      });

      navigate('/feed');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showLoginLoading) {
    return <LoginLoadingScreen onComplete={() => setShowLoginLoading(false)} userType="single" />;
  }

  return (
    <ResponsiveContainer className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
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
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Toggle entre modo normal y admin
                  const isAdminMode = formData.email.includes('complicesconectasw@outlook.es');
                  if (!isAdminMode) {
                    setFormData(prev => ({ ...prev, email: 'complicesconectasw@outlook.es', password: 'admin123' }));
                  } else {
                    setFormData(prev => ({ ...prev, email: '', password: '' }));
                  }
                }}
                className="text-white/80 hover:text-white hover:bg-white/10"
                data-testid="toggle-auth-mode"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
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
                <TabsTrigger value="signin" data-testid="switch-to-login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup" data-testid="switch-to-register">Registrarse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4" data-testid="login-form">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      data-testid="email-input"
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
                      data-testid="password-input"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading} data-testid="login-button">
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                  
                  {/* Demo Login Button */}
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                    onClick={handleDemoLogin}
                    data-testid="demo-login-button"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Acceso Demo
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" data-testid="register-form">
                <div className="space-y-4">
                  <p className="text-center text-white/70">
                    El registro estará disponible próximamente
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
};

export default Auth;
