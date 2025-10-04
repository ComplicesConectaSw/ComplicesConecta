/**
 * Página principal de Tokens CMPX/GTK
 * Dashboard completo para gestión de tokens en fase Beta
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Coins, Info, ExternalLink, Bot, Heart, Sparkles, Star, Rocket, Users } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useTokens } from '@/hooks/useTokens';
import { TokenDashboard } from '@/components/tokens/TokenDashboard';
import { StakingModal } from '@/components/tokens/StakingModal';
import { TokenChatBot } from '@/components/tokens/TokenChatBot';
import NavigationEnhanced from "@/components/NavigationEnhanced";
import { Header } from "@/components/Header";
import { motion } from 'framer-motion';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

export default function Tokens() {
  const [showStakingModal, setShowStakingModal] = useState(false);
  const { getBalanceMessage, getStakingMessage, refreshTokens } = useTokens();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-hero-gradient pb-20">
      <Header />
      {/* Advanced Animated Background - Same as Index */}
      <div className="fixed inset-0 z-0">
        {/* Animated Mesh Gradient */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-gradient-x"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-secondary/10 to-primary/15 animate-gradient-y"></div>
        </div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-40 right-32 w-48 h-48 bg-accent/8 rounded-full blur-2xl animate-float-reverse"></div>
          <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-secondary/4 rounded-full blur-3xl animate-float-slow shape-delay-2"></div>
          <div className="absolute bottom-20 right-20 w-56 h-56 bg-primary/6 rounded-full blur-2xl animate-float shape-delay-1"></div>
          
          {/* Hexagonal Patterns */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 transform rotate-45 animate-spin-slow blur-xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-secondary/15 to-primary/10 transform rotate-12 animate-pulse blur-lg"></div>
        </div>
        
        {/* Particle Effects */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-primary/20 rounded-full animate-float particle-${i + 1}`}
            ></div>
          ))}
        </div>
        
        {/* Glowing Icons */}
        <Heart className="absolute top-32 left-1/4 w-8 h-8 text-primary/20 animate-float icon-delay-1" fill="currentColor" />
        <Sparkles className="absolute top-1/3 right-1/4 w-6 h-6 text-accent/25 animate-float icon-delay-2" />
        <Star className="absolute bottom-1/3 left-1/5 w-7 h-7 text-secondary/20 animate-float icon-delay-3" />
        <Rocket className="absolute bottom-1/4 right-1/5 w-9 h-9 text-primary/15 animate-float icon-delay-4" />
        <Users className="absolute top-1/2 left-1/6 w-8 h-8 text-accent/20 animate-float icon-delay-5" />
      </div>
      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        {/* Enhanced Header with Navigation Buttons */}
        <div className="bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-md border-b border-purple-300/30 p-3 sm:p-4 shadow-lg flex-shrink-0 rounded-t-xl mb-6">
          <div className="flex items-center justify-between">
            <AnimatedButton
              onClick={handleGoBack}
              className="text-white hover:bg-white/20 flex items-center gap-2 btn-accessible bg-transparent border-none"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline truncate">Regresar al Inicio</span>
              <span className="sm:hidden">Inicio</span>
            </AnimatedButton>
            
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white text-center">
              🪙 Tokens CMPX & GTK
            </h1>
            
            <Button
              onClick={handleGoHome}
              className="text-white hover:bg-white/20 flex items-center gap-2 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Inicio</span>
            </Button>
          </div>
        </div>
        
        {/* Main Content Header */}
        <div className="text-center mb-8 px-4">
          <div className="flex items-center gap-3 justify-center mb-4">
            <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-white animate-pulse" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-shadow">Sistema de Tokens</h2>
          </div>
          <p className="text-white/80 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Gestiona tus tokens, participa en staking y reclama recompensas. 
            Durante la fase Beta, todas las funciones premium se pueden adquirir con tokens CMPX.
          </p>
        </div>

        {/* Información de fase Beta */}
        <Card className="mb-6 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Info className="h-5 w-5" />
              🚀 Fase Beta - Sistema de Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-white">🪙 Cómo obtener CMPX:</h4>
                <ul className="space-y-1 text-white/90">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>100 CMPX → Verificar World ID</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>50 CMPX → Por cada referido exitoso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>25 CMPX → Completar perfil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>20 CMPX → Feedback beta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>5 CMPX → Login diario</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-white">🔒 Beneficios del Staking:</h4>
                <ul className="space-y-1 text-white/90">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>+10% recompensa en 30 días</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Apoyas la red ComplicesConecta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Tokens seguros durante el período</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Recompensa automática al finalizar</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/20 rounded-lg border border-white/30">
              <p className="text-xs text-white">
                💡 <strong>Límite Beta:</strong> Máximo 500 CMPX por usuario al mes. 
                En la versión final no habrá límites y podrás convertir CMPX a GTK (ERC20).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Asistente IA Interactivo */}
        <div className="mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bot className="h-5 w-5" />
                🤖 Asistente IA de Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/90 mb-4">
                Tu guía personal paso a paso para gestionar tokens CMPX/GTK. 
                Pregúntame sobre tu balance, cómo reclamar recompensas o activar staking.
              </p>
              <TokenChatBot />
            </CardContent>
          </Card>
        </div>

        {/* Dashboard principal */}
        <TokenDashboard />

        {/* Botones de acción rápida */}
        <motion.div 
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setShowStakingModal(true)}
              className="h-16 w-full flex flex-col items-center justify-center gap-1 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white hover:text-purple-200 transition-all duration-300"
              disabled={false}
            >
              <span className="text-lg">🔒</span>
              <span className="text-sm font-medium truncate">Iniciar Staking</span>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={refreshTokens}
              className="h-16 w-full flex flex-col items-center justify-center gap-1 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white hover:text-green-200 transition-all duration-300"
            >
              <span className="text-lg">🔄</span>
              <span className="text-sm font-medium truncate">Actualizar Balance</span>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => navigate('/tokens-info')}
              className="h-16 w-full flex flex-col items-center justify-center gap-1 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white hover:text-blue-200 transition-all duration-300"
            >
              <span className="text-lg">📚</span>
              <span className="text-sm font-medium truncate">Guía de Tokens</span>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => navigate('/tokens-terms')}
              className="h-16 w-full flex flex-col items-center justify-center gap-1 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white hover:text-yellow-200 transition-all duration-300"
            >
              <span className="text-lg">📋</span>
              <span className="text-sm font-medium truncate">Términos</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Información adicional */}
        <Card className="mt-6 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ExternalLink className="h-5 w-5" />
              💡 Ejemplos del Asistente IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-white/20 p-3 sm:p-4 rounded-lg border border-white/30">
                <p className="text-sm text-white mb-2">
                  <strong>Pregunta a la IA:</strong> "¿Cuántos tokens tengo?" o "¿Qué es staking?"
                </p>
                <div className="text-xs text-white/90 space-y-1">
                  <p>🪙 <strong>Ejemplo de respuesta:</strong></p>
                  <div className="bg-white/90 p-2 rounded border ml-2 sm:ml-4">
                    <p className="break-words text-gray-900">{getBalanceMessage()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/20 p-3 sm:p-4 rounded-lg border border-white/30">
                <p className="text-sm text-white mb-2">
                  <strong>Explicación de staking:</strong>
                </p>
                <div className="text-xs text-white/90">
                  <div className="bg-white/90 p-2 rounded border ml-2 sm:ml-4">
                    <p className="break-words text-gray-900">{getStakingMessage()}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de staking */}
        <StakingModal 
          isOpen={showStakingModal}
          onClose={() => setShowStakingModal(false)}
        />
      </div>
      
      {/* Navigation Menu */}
      <NavigationEnhanced />
    </div>
  );
}
