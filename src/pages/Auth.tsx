import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, User, Users, ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { LoginLoadingScreen } from '@/components/LoginLoadingScreen';
import { SingleRegistrationForm } from '@/components/auth/SingleRegistrationForm';
import { CoupleRegistrationForm } from '@/components/auth/CoupleRegistrationForm';
import { logger } from '@/lib/logger';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Auth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [registrationMode, setRegistrationMode] = useState<'single' | 'couple' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginLoading, setShowLoginLoading] = useState(false);
  
  // Estados de login
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Por favor ingresa email y contraseña",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Obtener información del perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_type, name')
          .eq('id', data.user.id)
          .single();

        setShowLoginLoading(true);
        
        // Simular carga y luego redirigir
        setTimeout(() => {
          if (profile?.account_type === 'couple') {
            navigate('/profile-couple');
          } else {
            navigate('/profile-single');
          }
        }, 2000);
      }
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

  const handleRegistrationSuccess = (userData: any) => {
    logger.info('✅ Registro exitoso:', userData);
    setShowLoginLoading(true);
    
    // Simular carga y luego redirigir
    setTimeout(() => {
      if (userData.profile?.account_type === 'couple') {
        navigate('/profile-couple');
      } else {
        navigate('/profile-single');
      }
    }, 2000);
  };

  const handleBackToRegistrationChoice = () => {
    setRegistrationMode(null);
    setActiveTab('register');
  };

  if (showLoginLoading) {
    return <LoginLoadingScreen onComplete={() => setShowLoginLoading(false)} userType="single" />;
  }

  // Si hay un modo de registro seleccionado, mostrar el formulario correspondiente
  if (registrationMode === 'single') {
    return (
      <SingleRegistrationForm
        onSuccess={handleRegistrationSuccess}
        onBack={handleBackToRegistrationChoice}
      />
    );
  }

  if (registrationMode === 'couple') {
    return (
      <CoupleRegistrationForm
        onSuccess={handleRegistrationSuccess}
        onBack={handleBackToRegistrationChoice}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-${i + 1}`}
          />
        ))}
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
                  const isAdminMode = loginData.email.includes('complicesconectasw@outlook.es');
                  if (!isAdminMode) {
                    setLoginData(prev => ({ ...prev, email: 'complicesconectasw@outlook.es', password: 'admin123' }));
                  } else {
                    setLoginData(prev => ({ ...prev, email: '', password: '' }));
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="switch-to-login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register" data-testid="switch-to-register">Registrarse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      data-testid="email-input"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                        minLength={6}
                        data-testid="password-input"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-white/60" />
                        ) : (
                          <Eye className="h-4 w-4 text-white/60" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading} data-testid="login-button">
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register" data-testid="register-form">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">¿Qué tipo de cuenta deseas crear?</h3>
                    <p className="text-sm text-white/70">Selecciona el tipo de perfil que mejor se adapte a ti</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 bg-white/5 border-white/20 hover:bg-white/10 text-white flex flex-col items-center justify-center space-y-2"
                      onClick={() => setRegistrationMode('single')}
                    >
                      <User className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">Perfil Individual</div>
                        <div className="text-xs text-white/70">Para personas solteras</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-20 bg-white/5 border-white/20 hover:bg-white/10 text-white flex flex-col items-center justify-center space-y-2"
                      onClick={() => setRegistrationMode('couple')}
                    >
                      <Users className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">Perfil de Pareja</div>
                        <div className="text-xs text-white/70">Para parejas que buscan juntas</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
