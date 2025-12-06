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
      title: 'Bienvenida a Cómplices Conecta',
      description: profileType === 'couple'
        ? 'La comunidad para parejas que buscan nuevas experiencias seguras'
        : 'Conecta con personas increíbles en un ambiente seguro',
      icon: <Sparkles className="h-12 w-12 text-purple-500" />,
      content: (
        <div className="text-center space-y-6">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-8 rounded-2xl">
            <div className="text-6xl mb-4">
              {profileType === 'couple' ? '💑' : '✨'}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {profileType === 'couple' ? '¡Bienvenidos a la comunidad!' : '¡Bienvenido a la comunidad!'}
            </h3>
            <p className="text-white/90">
              Aquí cuidamos tu privacidad, tu tiempo y tus conexiones.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white/10 rounded-lg border border-white/15">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-xs font-medium text-white/90">Seguridad primero</p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg border border-white/15">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-xs font-medium text-white/90">Chat privado</p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg border border-white/15">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-xs font-medium text-white/90">Eventos & comunidad</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Configura tu Perfil',
      description: 'Un buen perfil mejora tus matches y tu seguridad',
      icon: <Heart className="h-12 w-12 text-pink-500" />,
      content: (
        <div className="space-y-6">
          <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📸</div>
              <p className="text-lg font-medium">Sube fotos claras y recientes</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Evita contenido explícito, recuerda la Ley Olimpia.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border-2 border-purple-200 dark:border-purple-700 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="font-medium">Bio auténtica</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cuenta quién eres y qué buscas sin compartir datos sensibles.
              </p>
            </div>

            <div className="p-4 border-2 border-purple-200 dark:border-purple-700 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="font-medium">Intereses claros</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Define tus límites, preferencias y acuerdos como cómplices.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Privacidad, Seguridad y Ley Olimpia',
      description: 'Antes de empezar, revisa cómo protegemos tu contenido',
      icon: <Shield className="h-12 w-12 text-green-500" />,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-green-500" />
              <h4 className="text-xl font-bold">Protección Total</h4>
            </div>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="font-medium flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Aplicamos principios de la Ley Olimpia para proteger tu intimidad digital.</span>
              </p>
              <p className="font-medium flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Contamos con reportes, bloqueo y moderación activa 24/7.</span>
              </p>
              <p className="font-medium flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Tú decides quién ve tu perfil, tus fotos y tus galerías privadas.</span>
              </p>
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
              . Usa la plataforma siempre con consentimiento informado.
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

