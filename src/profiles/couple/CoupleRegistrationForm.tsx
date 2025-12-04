import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PasswordValidator, isPasswordValid } from '@/components/auth/PasswordValidator';
import { NicknameValidator } from '@/components/auth/NicknameValidator';
import { InterestsSelector } from '@/components/auth/InterestsSelector';
import { TermsModal } from '@/components/auth/TermsModal';
import { Users } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/useToast';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CoupleRegistrationData {
  // Información de él
  hisFirstName: string;
  hisLastName: string;
  hisAge: string;
  hisGender: string;
  hisInterests: string[];
  
  // Información de ella
  herFirstName: string;
  herLastName: string;
  herAge: string;
  herGender: string;
  herInterests: string[];
  
  // Información compartida
  coupleNickname: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  
  // Perfil de pareja
  bio: string;
  profileTheme: string;
  interestedIn: string[];
  relationshipType: string;
  
  // Términos
  acceptTerms: boolean;
}

interface CoupleRegistrationFormProps {
  onSuccess: (userData: any) => void;
  onBack?: () => void;
}

const GENDER_OPTIONS = [
  'Hombre',
  'Mujer',
  'Transexual',
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

const RELATIONSHIP_TYPES = [
  'Pareja heterosexual',
  'Pareja homosexual (hombres)',
  'Pareja homosexual (mujeres)',
  'Pareja bisexual',
  'Relación abierta',
  'Matrimonio swinger',
  'Otro'
];

export const CoupleRegistrationForm: React.FC<CoupleRegistrationFormProps> = ({
  onSuccess,
  onBack: _onBack
}) => {
  const [formData, setFormData] = useState<CoupleRegistrationData>({
    hisFirstName: '',
    hisLastName: '',
    hisAge: '',
    hisGender: '',
    hisInterests: [],
    herFirstName: '',
    herLastName: '',
    herAge: '',
    herGender: '',
    herInterests: [],
    coupleNickname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bio: '',
    profileTheme: 'Clásico',
    interestedIn: [],
    relationshipType: '',
    acceptTerms: false
  });

  const [validation, setValidation] = useState({
    nickname: { isValid: false, isAvailable: false },
    password: false,
    email: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field: keyof CoupleRegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: 'interestedIn', value: string) => {
    const currentArray = formData[field] as string[];
    if (currentArray.includes(value)) {
      handleInputChange(field, currentArray.filter(item => item !== value));
    } else {
      handleInputChange(field, [...currentArray, value]);
    }
  };

  const handleInterestsChange = (person: 'his' | 'her', interests: string[]) => {
    if (person === 'his') {
      handleInputChange('hisInterests', interests);
    } else {
      handleInputChange('herInterests', interests);
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

  const canProceedToStep2 = () => {
    return (
      validateName(formData.hisFirstName) &&
      validateName(formData.hisLastName) &&
      parseInt(formData.hisAge) >= 18 &&
      formData.hisGender &&
      validateName(formData.herFirstName) &&
      validateName(formData.herLastName) &&
      parseInt(formData.herAge) >= 18 &&
      formData.herGender &&
      validation.nickname.isValid &&
      validation.nickname.isAvailable
    );
  };

  const canProceedToStep3 = () => {
    return (
      validateEmail(formData.email) &&
      validatePhone(formData.phone) &&
      isPasswordValid(formData.password) &&
      formData.password === formData.confirmPassword &&
      formData.relationshipType
    );
  };

  const canSubmit = () => {
    return (
      canProceedToStep3() &&
      formData.hisInterests.length >= 6 &&
      formData.herInterests.length >= 6 &&
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
            first_name: formData.hisFirstName,
            last_name: formData.hisLastName,
            account_type: 'couple'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Crear perfil de pareja en la tabla couple_profiles
        if (!supabase) {
          throw new Error('Supabase no está disponible');
        }
        
        const { error: coupleProfileError } = await supabase
          .from('couple_profiles')
          .insert({
            user_id: authData.user.id,
            couple_name: formData.coupleNickname,
            email: formData.email,
            phone: formData.phone,
            bio: formData.bio,
            profile_theme: formData.profileTheme,
            interested_in: formData.interestedIn,
            relationship_type: formData.relationshipType,
            his_name: `${formData.hisFirstName} ${formData.hisLastName}`.trim(),
            his_age: parseInt(formData.hisAge),
            his_gender: formData.hisGender,
            his_interests: formData.hisInterests,
            her_name: `${formData.herFirstName} ${formData.herLastName}`.trim(),
            her_age: parseInt(formData.herAge),
            her_gender: formData.herGender,
            her_interests: formData.herInterests,
            is_verified: false
          });

        // También crear un perfil básico en la tabla profiles para compatibilidad
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            name: formData.coupleNickname,
            nickname: formData.coupleNickname,
            email: formData.email,
            phone: formData.phone,
            account_type: 'couple',
            bio: formData.bio,
            interests: [...formData.hisInterests, ...formData.herInterests],
            profile_theme: formData.profileTheme,
            interested_in: formData.interestedIn,
            role: 'user',
            is_verified: false
          });

        if (coupleProfileError || profileError) {
          console.error('Error creating profiles:', { coupleProfileError, profileError });
          throw new Error('Error al crear el perfil de pareja');
        }

        toast({
          title: "¡Registro exitoso!",
          description: "Por favor verifica tu email para activar la cuenta de pareja",
        });

        onSuccess({
          user: authData.user,
          profile: {
            account_type: 'couple',
            name: formData.coupleNickname,
            nickname: formData.coupleNickname
          }
        });
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
        <h3 className="text-xl font-semibold text-white mb-2">Información de la Pareja</h3>
        <p className="text-white/70">Paso 1 de 3</p>
      </div>

      {/* Información de él */}
      <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
        <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          Información de él
        </h4>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-white">Nombre *</Label>
            <Input
              value={formData.hisFirstName}
              onChange={(e) => handleInputChange('hisFirstName', e.target.value)}
              className={`bg-white/10 text-white placeholder:text-white/80 ${
                formData.hisFirstName && !validateName(formData.hisFirstName) ? 'border-red-400' : 'border-white/20'
              }`}
              placeholder="Su nombre"
              required
            />
          </div>
          <div>
            <Label className="text-white">Apellidos *</Label>
            <Input
              value={formData.hisLastName}
              onChange={(e) => handleInputChange('hisLastName', e.target.value)}
              className={`bg-white/10 text-white placeholder:text-white/80 ${
                formData.hisLastName && !validateName(formData.hisLastName) ? 'border-red-400' : 'border-white/20'
              }`}
              placeholder="Sus apellidos"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Edad *</Label>
            <Input
              type="number"
              value={formData.hisAge}
              onChange={(e) => handleInputChange('hisAge', e.target.value)}
              className={`bg-white/10 text-white placeholder:text-white/80 ${
                formData.hisAge && parseInt(formData.hisAge) < 18 ? 'border-red-400' : 'border-white/20'
              }`}
              placeholder="Su edad"
              min="18"
              max="99"
              required
            />
          </div>
          <div>
            <Label className="text-white">Género *</Label>
            <Select value={formData.hisGender} onValueChange={(value) => handleInputChange('hisGender', value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Su género" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Información de ella */}
      <div className="bg-pink-500/10 p-4 rounded-lg border border-pink-500/20">
        <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
          Información de ella
        </h4>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-white">Nombre *</Label>
            <Input
              value={formData.herFirstName}
              onChange={(e) => handleInputChange('herFirstName', e.target.value)}
              className={`bg-white/10 text-white placeholder:text-white/80 ${
                formData.herFirstName && !validateName(formData.herFirstName) ? 'border-red-400' : 'border-white/20'
              }`}
              placeholder="Su nombre"
              required
            />
          </div>
          <div>
            <Label className="text-white">Apellidos *</Label>
            <Input
              value={formData.herLastName}
              onChange={(e) => handleInputChange('herLastName', e.target.value)}
              className={`bg-white/10 text-white placeholder:text-white/80 ${
                formData.herLastName && !validateName(formData.herLastName) ? 'border-red-400' : 'border-white/20'
              }`}
              placeholder="Sus apellidos"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Edad *</Label>
            <Input
              type="number"
              value={formData.herAge}
              onChange={(e) => handleInputChange('herAge', e.target.value)}
              className={`bg-white/10 text-white placeholder:text-white/80 ${
                formData.herAge && parseInt(formData.herAge) < 18 ? 'border-red-400' : 'border-white/20'
              }`}
              placeholder="Su edad"
              min="18"
              max="99"
              required
            />
          </div>
          <div>
            <Label className="text-white">Género *</Label>
            <Select value={formData.herGender} onValueChange={(value) => handleInputChange('herGender', value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Su género" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <NicknameValidator
        value={formData.coupleNickname}
        onChange={(value) => handleInputChange('coupleNickname', value)}
        onValidationChange={(isValid, isAvailable) => 
          setValidation(prev => ({ ...prev, nickname: { isValid, isAvailable } }))
        }
        label="Apodo de Pareja *"
        placeholder="El apodo único de su pareja"
      />

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
        <h3 className="text-xl font-semibold text-white mb-2">Contacto y Seguridad</h3>
        <p className="text-white/70">Paso 2 de 3</p>
      </div>

      <div>
        <Label className="text-white">Tipo de Relación *</Label>
        <Select value={formData.relationshipType} onValueChange={(value) => handleInputChange('relationshipType', value)}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Selecciona el tipo de relación" />
          </SelectTrigger>
          <SelectContent>
            {RELATIONSHIP_TYPES.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-white">Email Compartido *</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`bg-white/10 text-white placeholder:text-white/80 ${
            formData.email && !validateEmail(formData.email) ? 'border-red-400' : 'border-white/20'
          }`}
          placeholder="pareja@email.com"
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
        <Label className="text-white">Contraseña Compartida *</Label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/80"
          placeholder="Contraseña segura para ambos"
          required
        />
        <PasswordValidator password={formData.password} />
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
          placeholder="Confirma la contraseña"
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
        <h3 className="text-xl font-semibold text-white mb-2">Intereses y Perfil</h3>
        <p className="text-white/70">Paso 3 de 3</p>
      </div>

      <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
        <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          Intereses de él
        </h4>
        <InterestsSelector
          selectedInterests={formData.hisInterests}
          onInterestsChange={(interests) => handleInterestsChange('his', interests)}
          minRequired={6}
          label="Selecciona sus intereses *"
        />
      </div>

      <div className="bg-pink-500/10 p-4 rounded-lg border border-pink-500/20">
        <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
          Intereses de ella
        </h4>
        <InterestsSelector
          selectedInterests={formData.herInterests}
          onInterestsChange={(interests) => handleInterestsChange('her', interests)}
          minRequired={6}
          label="Selecciona sus intereses *"
        />
      </div>

      <div>
        <Label className="text-white">Biografía de Pareja * (mínimo 120 caracteres)</Label>
        <Textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/80 min-h-[120px]"
          placeholder="Cuéntanos sobre ustedes como pareja, qué buscan, sus experiencias..."
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
        <Label className="text-white mb-3 block">¿En quién están interesados? * (pueden seleccionar varios)</Label>
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
          Aceptamos los{' '}
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
              <Users className="h-4 w-4 mr-2" />
              Crear Cuenta de Pareja
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
            <Users className="h-6 w-6" />
            Registro Pareja
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
          handleInputChange('acceptTerms', accepted);
          setShowTermsModal(false);
        }}
        accepted={formData.acceptTerms}
      />
    </>
  );
};

