/**
 * =====================================================
 * ONBOARDING FLOW
 * =====================================================
 * Flujo de bienvenida para nuevos usuarios
 * Features: Steps, progress, animaciones
 * Fecha: 19 Nov 2025
 * Versión: v3.6.5
 * =====================================================
 */

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Sparkles, Heart, Users, Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip?: () => void;
  profileType: 'single' | 'couple';
}

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onSkip,
  profileType
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: '¡Bienvenido a Cómplices Conecta!',
      description: profileType === 'couple' 
        ? 'La plataforma #1 para parejas que buscan nuevas experiencias'
        : 'Conecta con personas increíbles en un ambiente seguro',
      icon: <Sparkles className="h-12 w-12 text-purple-500" />,
      content: (
        <div className="text-center space-y-6">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-8 rounded-2xl">
            <div className="text-6xl mb-4">
              {profileType === 'couple' ? '💑' : '✨'}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {profileType === 'couple' ? '¡Bienvenidos!' : '¡Bienvenido!'}
            </h3>
            <p className="text-white/90">
              Estás a punto de unirte a una comunidad increíble
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-sm font-medium">100% Seguro</p>
            </div>
            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-sm font-medium">Chat Privado</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm font-medium">Eventos</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Crea tu Perfil Único',
      description: 'Destaca y atrae a las personas correctas',
      icon: <Heart className="h-12 w-12 text-pink-500" />,
      content: (
        <div className="space-y-6">
          <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📸</div>
              <p className="text-lg font-medium">Sube tus mejores fotos</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border-2 border-purple-200 dark:border-purple-700 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="font-medium">Fotos recientes</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Muestra tu mejor versión actual
              </p>
            </div>

            <div className="p-4 border-2 border-purple-200 dark:border-purple-700 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="font-medium">Bio atractiva</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cuéntanos qué te hace especial
              </p>
            </div>

            <div className="p-4 border-2 border-purple-200 dark:border-purple-700 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="font-medium">Intereses</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comparte tus pasiones
              </p>
            </div>

            <div className="p-4 border-2 border-purple-200 dark:border-purple-700 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="font-medium">Verificación</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gana confianza con la verificación
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Conecta con Personas Afines',
      description: 'Descubre matches basados en tus preferencias',
      icon: <Users className="h-12 w-12 text-blue-500" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-2 border-purple-200 dark:border-purple-700">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h4 className="font-bold mb-2">Búsqueda Inteligente</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Filtros avanzados para encontrar exactamente lo que buscas
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-pink-200 dark:border-pink-700">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-3">💕</div>
                <h4 className="font-bold mb-2">Matches Inteligentes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Algoritmo de compatibilidad para mejores conexiones
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 dark:border-blue-700">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-3">💬</div>
                <h4 className="font-bold mb-2">Chat Seguro</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Conversaciones privadas y protegidas
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-700">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h4 className="font-bold mb-2">Eventos</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Conoce personas en eventos exclusivos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Privacidad y Seguridad',
      description: 'Tu seguridad es nuestra prioridad',
      icon: <Shield className="h-12 w-12 text-green-500" />,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-green-500" />
              <h4 className="text-xl font-bold">Protección Total</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Cumplimiento Ley Olimpia</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tu contenido está protegido contra descargas no autorizadas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Verificación de Usuarios</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sistema de verificación para garantizar perfiles reales
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Control de Privacidad</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tú decides quién puede ver tu perfil y fotos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Reportes y Moderación</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Equipo 24/7 para mantener un ambiente seguro
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Bloqueo y Filtros</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Herramientas para controlar tu experiencia
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Al continuar, aceptas nuestros{' '}
              <a href="/terms" className="text-purple-500 hover:underline">
                Términos de Servicio
              </a>{' '}
              y{' '}
              <a href="/privacy" className="text-purple-500 hover:underline">
                Política de Privacidad
              </a>
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {currentStepData.icon}
              <div>
                <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">{currentStepData.description}</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Saltar onboarding"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Paso {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(progress)}% completado</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepData.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700 flex items-center justify-between">
          <div className="flex gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                aria-label={`Ir al paso ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-purple-500'
                    : index < currentStep
                    ? 'w-2 bg-green-500'
                    : 'w-2 bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {!isFirstStep && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
            )}

            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isLastStep ? (
                <>
                  Comenzar
                  <Check className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingFlow;

