import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/useToast';
import { User } from 'lucide-react';
import { InterestsSelector } from '@/components/auth/InterestsSelector';
import { NicknameValidator } from '@/components/auth/NicknameValidator';
import { TermsModal } from '@/components/auth/TermsModal';
import { logger } from '@/lib/logger';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SingleRegistrationData {
  // Información personal
  identity: string;
  firstName: string;
  lastName: string;
  age: string;
  nickname: string;
  useRealName: boolean;
  
  // Orientación y género
  gender: string;
  sexualOrientation: string[];
  
  // Contacto
  email: string;
  phone: string;
  
  // Seguridad
  password: string;
  confirmPassword: string;
  
  // Perfil
  interests: string[];
  bio: string;
  profileTheme: string;
  interestedIn: string[];
  
  // Términos
  acceptTerms: boolean;
}

interface SingleRegistrationFormProps {
  onSuccess: (userData: any) => void;
  onBack?: () => void;
}

const IDENTITY_OPTIONS = [
  'Hombre',
  'Mujer',
  'Transexual',
  'Gay',
  'Otro'
];

const SEXUAL_ORIENTATION_OPTIONS = [
  'Heterosexual',
  'Homosexual',
  'Bisexual',
  'Pansexual',
  'Demisexual',
  'Asexual',
  'Otro'
];

const PROFILE_THEMES = [
  'Clásico',
  'Moderno',
  'Elegante',
  'Minimalista',
  'Colorido',
  'Nocturno'
];

const INTERESTED_IN_OPTIONS = [
  'Parejas',
  'Hombres',
  'Mujeres',
  'Personas trans',
  'Otros'
];

export const SingleRegistrationForm: React.FC<SingleRegistrationFormProps> = ({
  onSuccess: _onSuccess
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<SingleRegistrationData>({
    identity: '',
    firstName: '',
    lastName: '',
    age: '',
    nickname: '',
    useRealName: false,
    gender: '',
    sexualOrientation: [],
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    interests: [],
    bio: '',
    profileTheme: 'Clásico',
    interestedIn: [],
    acceptTerms: false
  });

  const [validation, setValidation] = useState({
    nickname: { isValid: false, isAvailable: false },
    password: false,
    email: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [_showEmailVerification, setShowEmailVerification] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field: keyof SingleRegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: 'sexualOrientation' | 'interestedIn', value: string) => {
    const currentArray = formData[field] as string[];
    if (currentArray.includes(value)) {
      handleInputChange(field, currentArray.filter(item => item !== value));
    } else {
      handleInputChange(field, [...currentArray, value]);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[1-9]\d{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateName = (name: string): boolean => {
    return /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(name) && name.trim().length >= 2;
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /\d/.test(password);
  };

  const canProceedToStep2 = () => {
    return (
      formData.identity &&
      validateName(formData.firstName) &&
      validateName(formData.lastName) &&
      parseInt(formData.age) >= 18 &&
      validation.nickname.isValid &&
      validation.nickname.isAvailable
    );
  };

  const canProceedToStep3 = () => {
    return (
      formData.sexualOrientation.length > 0 &&
      validateEmail(formData.email) &&
      validatePhone(formData.phone) &&
      validatePassword(formData.password) &&
      formData.password === formData.confirmPassword
    );
  };

  const canSubmit = () => {
    return (
      canProceedToStep3() &&
      formData.interests.length >= 6 &&
      formData.bio.length >= 120 &&
      formData.interestedIn.length > 0 &&
      formData.acceptTerms
    );
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!canSubmit()) {
      toast({
        variant: "destructive",
        title: "Formulario incompleto",
        description: "Por favor completa todos los campos requeridos",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (!supabase) {
        toast({
          variant: "destructive",
          title: "Error de conexión",
          description: "No se pudo conectar con el servidor",
        });
        setIsLoading(false);
        return;
      }
      
      // Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            account_type: 'single'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        logger.info('✅ Usuario registrado exitosamente:', { userId: authData.user.id });
        
        // Crear perfil en la tabla profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            display_name: formData.nickname,
            nickname: formData.nickname,
            email: formData.email,
            phone: formData.phone,
            account_type: 'single',
            age: parseInt(formData.age),
            gender: formData.gender,
            sexual_orientation: formData.sexualOrientation,
            bio: formData.bio,
            interests: formData.interests,
            profile_theme: formData.profileTheme,
            interested_in: formData.interestedIn,
            role: 'user',
            is_verified: false,
            is_demo: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          logger.error('❌ Error creando perfil:', profileError);
          throw new Error('Error al crear el perfil de usuario');
        }

        logger.info('✅ Perfil creado exitosamente para usuario:', { userId: authData.user.id });
        
        toast({
          title: "¡Registro exitoso!",
          description: "Se ha enviado un código de verificación a tu email.",
          duration: 5000
        });

        // Mostrar pantalla de verificación de email
        setShowEmailVerification(true);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al registrarse",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Información Personal</h3>
        <p className="text-white/70">Paso 1 de 3</p>
      </div>

      <div>
        <Label className="text-white">Identidad *</Label>
        <Select value={formData.identity} onValueChange={(value) => handleInputChange('identity', value)}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Selecciona tu identidad" />
          </SelectTrigger>
          <SelectContent>
            {IDENTITY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Nombre *</Label>
          <Input
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`bg-white/10 text-white placeholder:text-white/80 ${
              formData.firstName && !validateName(formData.firstName) ? 'border-red-400' : 'border-white/20'
            }`}
            placeholder="Tu nombre"
            required
          />
          {formData.firstName && !validateName(formData.firstName) && (
            <p className="text-red-400 text-sm mt-1">Solo letras y espacios</p>
          )}
        </div>
        <div>
          <Label className="text-white">Apellidos *</Label>
          <Input
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`bg-white/10 text-white placeholder:text-white/80 ${
              formData.lastName && !validateName(formData.lastName) ? 'border-red-400' : 'border-white/20'
            }`}
            placeholder="Tus apellidos"
            required
          />
          {formData.lastName && !validateName(formData.lastName) && (
            <p className="text-red-400 text-sm mt-1">Solo letras y espacios</p>
          )}
        </div>
      </div>

      <div>
        <Label className="text-white">Edad *</Label>
        <Input
          type="number"
          value={formData.age}
          onChange={(e) => handleInputChange('age', e.target.value)}
          className={`bg-white/10 text-white placeholder:text-white/80 ${
            formData.age && parseInt(formData.age) < 18 ? 'border-red-400' : 'border-white/20'
          }`}
          placeholder="Tu edad"
          min="18"
          max="99"
          required
        />
        {formData.age && parseInt(formData.age) < 18 && (
          <p className="text-red-400 text-sm mt-1">Debes ser mayor de 18 años</p>
        )}
      </div>

      <NicknameValidator
        value={formData.nickname}
        onChange={(value) => handleInputChange('nickname', value)}
        onValidationChange={(isValid, isAvailable) => 
          setValidation(prev => ({ ...prev, nickname: { isValid, isAvailable } }))
        }
      />
      <div className="text-xs text-white/70 mt-1">
        La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="useRealName"
          checked={formData.useRealName}
          onCheckedChange={(checked) => handleInputChange('useRealName', checked)}
        />
        <Label htmlFor="useRealName" className="text-white/80 text-sm">
          Usar mi nombre real como nombre visible (en lugar del apodo)
        </Label>
      </div>

      <Button
        onClick={() => setCurrentStep(2)}
        disabled={!canProceedToStep2()}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
      >
        Continuar
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Orientación y Contacto</h3>
        <p className="text-white/70">Paso 2 de 3</p>
      </div>

      <div>
        <Label className="text-white mb-3 block">Orientación Sexual * (puedes seleccionar varias)</Label>
        <div className="grid grid-cols-2 gap-2">
          {SEXUAL_ORIENTATION_OPTIONS.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`orientation-${option}`}
                checked={formData.sexualOrientation.includes(option)}
                onCheckedChange={() => handleArrayToggle('sexualOrientation', option)}
              />
              <Label htmlFor={`orientation-${option}`} className="text-white/80 text-sm">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-white">Email *</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`bg-white/10 text-white placeholder:text-white/80 ${
            formData.email && !validateEmail(formData.email) ? 'border-red-400' : 'border-white/20'
          }`}
          placeholder="tu@email.com"
          required
        />
        {formData.email && !validateEmail(formData.email) && (
          <p className="text-red-400 text-sm mt-1">Email inválido</p>
        )}
      </div>

      <div>
        <Label className="text-white">Teléfono *</Label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className={`bg-white/10 text-white placeholder:text-white/80 ${
            formData.phone && !validatePhone(formData.phone) ? 'border-red-400' : 'border-white/20'
          }`}
          placeholder="+52 55 1234 5678"
          required
        />
        {formData.phone && !validatePhone(formData.phone) && (
          <p className="text-red-400 text-sm mt-1">Formato de teléfono inválido</p>
        )}
      </div>

      <div>
        <Label className="text-white">Contraseña *</Label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/80"
          placeholder="Tu contraseña segura"
          required
        />
        <div className="text-xs text-white/70 mt-1">
          La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números
        </div>
      </div>

      <div>
        <Label className="text-white">Confirmar Contraseña *</Label>
        <Input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          className={`bg-white/10 text-white placeholder:text-white/80 ${
            formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-400' : 'border-white/20'
          }`}
          placeholder="Confirma tu contraseña"
          required
        />
        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <p className="text-red-400 text-sm mt-1">Las contraseñas no coinciden</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setCurrentStep(1)}
          variant="outline"
          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          Atrás
        </Button>
        <Button
          onClick={() => setCurrentStep(3)}
          disabled={!canProceedToStep3()}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
        >
          Continuar
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Perfil e Intereses</h3>
        <p className="text-white/70">Paso 3 de 3</p>
      </div>

      <InterestsSelector
        selectedInterests={formData.interests}
        onInterestsChange={(interests) => handleInputChange('interests', interests)}
        minRequired={6}
      />

      <div>
        <Label className="text-white">Biografía * (mínimo 120 caracteres)</Label>
        <Textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/80 min-h-[120px]"
          placeholder="Cuéntanos sobre ti, tus gustos, lo que buscas..."
          required
        />
        <div className={`text-sm mt-1 ${formData.bio.length >= 120 ? 'text-green-400' : 'text-white/60'}`}>
          {formData.bio.length}/120 caracteres mínimos
        </div>
      </div>

      <div>
        <Label className="text-white">Tema de Perfil</Label>
        <Select value={formData.profileTheme} onValueChange={(value) => handleInputChange('profileTheme', value)}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROFILE_THEMES.map((theme) => (
              <SelectItem key={theme} value={theme}>{theme}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-white mb-3 block">¿En quién estás interesado? * (puedes seleccionar varios)</Label>
        <div className="grid grid-cols-2 gap-2">
          {INTERESTED_IN_OPTIONS.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`interested-${option}`}
                checked={formData.interestedIn.includes(option)}
                onCheckedChange={() => handleArrayToggle('interestedIn', option)}
              />
              <Label htmlFor={`interested-${option}`} className="text-white/80 text-sm">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="acceptTerms"
          checked={formData.acceptTerms}
          onCheckedChange={(checked) => handleInputChange('acceptTerms', checked)}
        />
        <Label htmlFor="acceptTerms" className="text-white/80 text-sm">
          Acepto los{' '}
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="text-pink-400 hover:text-pink-300 underline"
          >
            términos y condiciones
          </button>
          {' '}*
        </Label>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setCurrentStep(2)}
          variant="outline"
          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          Atrás
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit() || isLoading}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Registrando...
            </>
          ) : (
            <>
              <User className="h-4 w-4 mr-2" />
              Crear Cuenta
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
            <User className="h-6 w-6" />
            Registro Single
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </CardContent>
      </Card>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={(accepted) => {
          setFormData(prev => ({ ...prev, acceptTerms: accepted }));
          setShowTermsModal(false);
        }}
        accepted={formData.acceptTerms}
      />
    </>
  );
};

