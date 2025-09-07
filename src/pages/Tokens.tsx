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
import { Coins, Info, ExternalLink, Bot } from 'lucide-react';

export default function Tokens() {
  const [showStakingModal, setShowStakingModal] = useState(false);
  const { balance, getBalanceMessage, getStakingMessage } = useTokens();

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Coins className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Tokens CMPX & GTK</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Gestiona tus tokens, participa en staking y reclama recompensas. 
          Durante la fase Beta, todas las funciones premium se pueden adquirir con tokens CMPX.
        </p>
      </div>

      {/* Información de fase Beta */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Info className="h-5 w-5" />
            🚀 Fase Beta - Sistema de Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🪙 Cómo obtener CMPX:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• 100 CMPX → Verificar World ID</li>
                <li>• 50 CMPX → Por cada referido exitoso</li>
                <li>• 25 CMPX → Completar perfil</li>
                <li>• 20 CMPX → Feedback beta</li>
                <li>• 5 CMPX → Login diario</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🔒 Staking Benefits:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• +10% recompensa en 30 días</li>
                <li>• Apoyas la red ComplicesConecta</li>
                <li>• Tokens seguros durante el período</li>
                <li>• Recompensa automática al finalizar</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600">
              💡 <strong>Límite Beta:</strong> Máximo 500 CMPX por usuario al mes. 
              En la versión final no habrá límites y podrás convertir CMPX a GTK (ERC20).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Asistente IA Interactivo */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
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
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Button
          onClick={() => setShowStakingModal(true)}
          className="h-16 flex flex-col items-center justify-center gap-1"
          variant="outline"
          disabled={!balance || balance.cmpxBalance < 50}
        >
          <span className="text-lg">🔒</span>
          <span className="text-sm">Iniciar Staking</span>
        </Button>

        <Button
          onClick={() => window.open('/tokens/info', '_blank')}
          className="h-16 flex flex-col items-center justify-center gap-1"
          variant="outline"
        >
          <span className="text-lg">📚</span>
          <span className="text-sm">Guía de Tokens</span>
        </Button>

        <Button
          onClick={() => window.open('/tokens/terms', '_blank')}
          className="h-16 flex flex-col items-center justify-center gap-1"
          variant="outline"
        >
          <span className="text-lg">📋</span>
          <span className="text-sm">Términos</span>
        </Button>
      </div>

      {/* Información adicional */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            🤖 Asistente IA de Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Pregunta a la IA:</strong> "¿Cuántos tokens tengo?" o "¿Qué es staking?"
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>🪙 <strong>Ejemplo de respuesta:</strong></p>
                <div className="bg-white p-2 rounded border ml-4">
                  <p>{getBalanceMessage()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Explicación de staking:</strong>
              </p>
              <div className="text-xs text-gray-600">
                <div className="bg-white p-2 rounded border ml-4">
                  <p>{getStakingMessage()}</p>
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
  );
}
