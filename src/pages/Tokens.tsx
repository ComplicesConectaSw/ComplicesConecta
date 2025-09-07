/**
 * Página principal de Tokens CMPX/GTK
 * Dashboard completo para gestión de tokens en fase Beta
 */

import React, { useState } from 'react';
import { TokenDashboard } from '../components/tokens/TokenDashboard';
import { TokenChatBot } from '../components/tokens/TokenChatBot';
import { StakingModal } from '../components/tokens/StakingModal';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useTokens } from '../hooks/useTokens';
import { Coins, Info, ExternalLink, Bot, ArrowLeft } from 'lucide-react';

export default function Tokens() {
  const [showStakingModal, setShowStakingModal] = useState(false);
  const { balance, getBalanceMessage, getStakingMessage } = useTokens();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-pink-100/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl animate-spin-slow"></div>
      </div>
      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 px-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="text-purple-700 hover:bg-purple-100"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="ml-1 sm:ml-2">Regresar</span>
            </Button>
            <div className="flex items-center gap-3 flex-1 justify-center">
              <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Tokens CMPX & GTK</h1>
            </div>
            <div className="w-20"></div> {/* Spacer for balance */}
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Gestiona tus tokens, participa en staking y reclama recompensas. 
            Durante la fase Beta, todas las funciones premium se pueden adquirir con tokens CMPX.
          </p>
        </div>

        {/* Información de fase Beta */}
        <Card className="mb-6 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Info className="h-5 w-5" />
              🚀 Fase Beta - Sistema de Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-purple-800">🪙 Cómo obtener CMPX:</h4>
                <ul className="space-y-1 text-gray-700">
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
                <h4 className="font-semibold mb-2 text-purple-800">🔒 Beneficios del Staking:</h4>
                <ul className="space-y-1 text-gray-700">
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
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-700">
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
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Bot className="h-5 w-5" />
                🤖 Asistente IA de Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-600 mb-4">
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
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button
            onClick={() => setShowStakingModal(true)}
            className="h-16 flex flex-col items-center justify-center gap-1 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-gray-800 transition-all duration-300"
            variant="outline"
            disabled={!balance || balance.cmpxBalance < 50}
          >
            <span className="text-lg">🔒</span>
            <span className="text-sm font-medium">Iniciar Staking</span>
          </Button>

          <Button
            onClick={() => window.open('/tokens-info', '_blank')}
            className="h-16 flex flex-col items-center justify-center gap-1 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-gray-800 transition-all duration-300"
            variant="outline"
          >
            <span className="text-lg">📚</span>
            <span className="text-sm font-medium">Guía de Tokens</span>
          </Button>

          <Button
            onClick={() => window.open('/tokens-terms', '_blank')}
            className="h-16 flex flex-col items-center justify-center gap-1 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-gray-800 transition-all duration-300 sm:col-span-2 md:col-span-1"
            variant="outline"
          >
            <span className="text-lg">📋</span>
            <span className="text-sm font-medium">Términos</span>
          </Button>
        </div>

        {/* Información adicional */}
        <Card className="mt-6 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <ExternalLink className="h-5 w-5" />
              💡 Ejemplos del Asistente IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-purple-50/80 p-3 sm:p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800 mb-2">
                  <strong>Pregunta a la IA:</strong> "¿Cuántos tokens tengo?" o "¿Qué es staking?"
                </p>
                <div className="text-xs text-purple-700 space-y-1">
                  <p>🪙 <strong>Ejemplo de respuesta:</strong></p>
                  <div className="bg-white/90 p-2 rounded border ml-2 sm:ml-4">
                    <p className="break-words">{getBalanceMessage()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50/80 p-3 sm:p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800 mb-2">
                  <strong>Explicación de staking:</strong>
                </p>
                <div className="text-xs text-purple-700">
                  <div className="bg-white/90 p-2 rounded border ml-2 sm:ml-4">
                    <p className="break-words">{getStakingMessage()}</p>
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
    </div>
  );
}
