/**
 * DemoSelector - Componente para seleccionar tipo de cuenta demo
 * Fecha: 15 Noviembre 2025
 * Propósito: Permitir al usuario elegir entre cuenta Single o Pareja para modo demo
 * Evita el auto-login forzado y mejora la experiencia de usuario
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/hooks/useToast';
import { safeSetItem } from '@/utils/safeLocalStorage';
import { usePersistedState } from '@/hooks/usePersistedState';

interface DemoSelectorProps {
  className?: string;
}

export const DemoSelector: React.FC<DemoSelectorProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'single' | 'couple' | null>(null);
  
  // Estado persistente para demo
  const [, setDemoUser] = usePersistedState<any>('demo_user', null);
  const [, setDemoAuthenticated] = usePersistedState<boolean>('demo_authenticated', false);
  const [, setUserType] = usePersistedState<string>('userType', '');

  /**
   * Maneja el inicio de sesión demo según el tipo seleccionado
   * @param type - Tipo de cuenta: 'single' o 'couple'
   */
  const handleDemoLogin = async (type: 'single' | 'couple') => {
    setIsLoading(true);
    setSelectedType(type);
    
    try {
      // Configurar credenciales demo según el tipo
      const demoCredentials = {
        email: 'demo@complicesconecta.com',
        password: 'demo123',
        accountType: type,
        displayName: type === 'single' ? 'Demo User' : 'Demo Pareja',
        first_name: type === 'single' ? 'Demo' : 'Demo Pareja',
        role: 'user'
      };
      
      // Establecer estado de autenticación demo
      setDemoAuthenticated(true);
      setDemoUser(demoCredentials);
      setUserType(type);
      
      // Configurar localStorage para demo
      safeSetItem('demo_authenticated', 'true', { validate: true });
      safeSetItem('demo_user', demoCredentials, { validate: false, sanitize: true });
      safeSetItem('userType', type, { validate: false });
      
      // Usar el método signIn del hook useAuth
      await signIn('demo@complicesconecta.com', 'demo123', type);
      
      toast({
        title: "🎭 Modo Demo Activado",
        description: `Bienvenido al modo demo como ${type === 'single' ? 'Usuario Single' : 'Pareja'}`,
      });
      
      // Navegar según el tipo de cuenta
      setTimeout(() => {
        if (type === 'couple') {
          navigate('/profile-couple');
        } else {
          navigate('/profile-single');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error en demo login:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo activar el modo demo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedType(null);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <Card className="bg-white/10 backdrop-blur-xl border-white/30 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-12 w-12 text-purple-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">
            Modo Demo
          </CardTitle>
          <CardDescription className="text-white/90 text-lg mt-2">
            Selecciona el tipo de cuenta demo que deseas explorar
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {/* Descripción del modo demo */}
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
            <p className="text-white/90 text-sm leading-relaxed">
              <strong>💡 Modo Demo:</strong> Explora ComplicesConecta sin crear una cuenta.
              Puedes navegar por la aplicación, ver perfiles de ejemplo y probar todas las funcionalidades.
            </p>
          </div>

          {/* Grid de opciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opción Single */}
            <Card 
              className={`
                cursor-pointer transition-all duration-300 transform hover:scale-105
                ${selectedType === 'single' ? 'ring-4 ring-purple-500 bg-purple-500/20' : 'bg-white/5 hover:bg-white/10'}
                border-2 border-white/20 hover:border-purple-400
              `}
              onClick={() => !isLoading && handleDemoLogin('single')}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-purple-500/30 rounded-full">
                    <User className="h-12 w-12 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      👤 Usuario Single
                    </h3>
                    <p className="text-white/80 text-sm">
                      Explora como usuario individual buscando conexiones y experiencias
                    </p>
                  </div>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDemoLogin('single');
                    }}
                  >
                    {isLoading && selectedType === 'single' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Cargando...
                      </>
                    ) : (
                      <>
                        Explorar como Single
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Opción Pareja */}
            <Card 
              className={`
                cursor-pointer transition-all duration-300 transform hover:scale-105
                ${selectedType === 'couple' ? 'ring-4 ring-pink-500 bg-pink-500/20' : 'bg-white/5 hover:bg-white/10'}
                border-2 border-white/20 hover:border-pink-400
              `}
              onClick={() => !isLoading && handleDemoLogin('couple')}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-pink-500/30 rounded-full">
                    <Users className="h-12 w-12 text-pink-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      💑 Pareja
                    </h3>
                    <p className="text-white/80 text-sm">
                      Descubre la experiencia como pareja buscando otras parejas o singles
                    </p>
                  </div>
                  <Button
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDemoLogin('couple');
                    }}
                  >
                    {isLoading && selectedType === 'couple' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Cargando...
                      </>
                    ) : (
                      <>
                        Explorar como Pareja
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nota informativa */}
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
            <p className="text-white/90 text-xs leading-relaxed">
              <strong>ℹ️ Nota:</strong> Los datos en modo demo son ficticios y no se guardarán.
              Para una experiencia completa, crea una cuenta real desde el botón "Registrarse".
            </p>
          </div>

          {/* Botón para volver */}
          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Volver al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoSelector;

