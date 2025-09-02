import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useGeolocation } from "@/hooks/useGeolocation";
import { MapPin, Heart, ArrowLeft, Sparkles, Shield, Users } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getCurrentLocation, location, isLoading: locationLoading } = useGeolocation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    interestedIn: "",
    bio: "",
    shareLocation: false,
    role: "user" as "user" | "admin",
    accountType: "single" as "single" | "couple",
    // Campos para parejas
    partnerFirstName: "",
    partnerLastName: "",
    partnerAge: "",
    partnerGender: "",
    partnerInterestedIn: "",
    partnerBio: ""
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // If admin login is selected, update the profile role
      if (formData.role === "admin" && data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              role: 'administrador'
            });
          
          if (profileError) {
            console.warn('Could not update admin role in profile:', profileError);
          }
        } catch (profileError) {
          console.warn('Error updating profile role:', profileError);
        }
      }

      toast({
        title: "¡Bienvenido de vuelta!",
        description: "Has iniciado sesión exitosamente.",
      });

      // Navigate to admin panel if admin login, otherwise to discover
      navigate(formData.role === "admin" ? "/admin" : "/discover");
    } catch (error: unknown) {
      console.error('❌ Error de autenticación:', error);
      let errorMessage = "Ha ocurrido un error inesperado.";
      const errorObj = error as { message?: string };
      
      if (errorObj.message?.includes('Invalid login credentials')) {
        errorMessage = "Credenciales incorrectas. Verifica tu email y contraseña.";
      } else if (errorObj.message?.includes('Email not confirmed')) {
        errorMessage = "Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.";
      } else if (errorObj.message?.includes('Too many requests')) {
        errorMessage = "Demasiados intentos. Espera unos minutos antes de intentar nuevamente.";
      } else if (errorObj.message) {
        errorMessage = errorObj.message;
      }
      
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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
            share_location: formData.shareLocation
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
      
      if (errorObj.message?.includes('User already registered')) {
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
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-secondary/6 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        {/* Floating Icons */}
        <Heart className="absolute top-32 left-1/4 w-6 h-6 text-primary/20 animate-float" fill="currentColor" style={{ animationDelay: '0.5s' }} />
        <Sparkles className="absolute bottom-1/3 right-1/4 w-5 h-5 text-accent/25 animate-float" style={{ animationDelay: '1.2s' }} />
        <Shield className="absolute top-1/3 right-1/5 w-7 h-7 text-secondary/20 animate-float" style={{ animationDelay: '2s' }} />
        <Users className="absolute bottom-1/4 left-1/6 w-6 h-6 text-primary/15 animate-float" style={{ animationDelay: '0.8s' }} />
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
              <p className="text-xs text-muted-foreground">Verificado</p>
            </div>
            <div className="text-center">
              <Users className="h-6 w-6 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Comunidad</p>
            </div>
            <div className="text-center">
              <Sparkles className="h-6 w-6 text-secondary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">IA Match</p>
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adminLogin"
                    checked={formData.role === "admin"}
                    onCheckedChange={(checked) => handleInputChange("role", checked ? "admin" : "user")}
                  />
                  <Label htmlFor="adminLogin" className="text-sm">
                    Iniciar sesión como administrador
                  </Label>
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
                  <Select onValueChange={(value) => handleInputChange("accountType", value)} defaultValue="single">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="couple">Pareja</SelectItem>
                    </SelectContent>
                  </Select>
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
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      {locationLoading ? "Obteniendo..." : "Obtener ubicación"}
                    </Button>
                    {location && (
                      <span className="text-sm text-muted-foreground">
                        ✓ Ubicación obtenida
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shareLocation"
                      checked={formData.shareLocation}
                      onCheckedChange={(checked) => handleInputChange("shareLocation", checked as boolean)}
                    />
                    <Label htmlFor="shareLocation" className="text-sm">
                      Compartir mi ubicación en tiempo real para chat
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
    </div>
  );
}