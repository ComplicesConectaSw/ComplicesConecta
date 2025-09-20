/**
 * Asistente IA Interactivo de Tokens CMPX/GTK
 * Flujo wizard paso a paso para usuarios Beta
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTokens } from '@/hooks/useTokens';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  actions?: ChatAction[];
}

interface ChatAction {
  id: string;
  label: string;
  action: () => void;
  variant?: 'default' | 'outline' | 'destructive';
}

type WizardStep = 'greeting' | 'balance' | 'rewards' | 'staking' | 'confirmation' | 'completed';

export function TokenChatBot() {
  const {
    balance,
    pendingRewards,
    claimWorldIdReward,
    startStaking,
    refreshTokens,
    loading,
    isWorldIdEligible,
    hasPendingRewards
  } = useTokens();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<WizardStep>('greeting');
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [stakingAmount, setStakingAmount] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat
  useEffect(() => {
    if (balance && messages.length === 0) {
      addBotMessage(getGreetingMessage());
    }
  }, [balance]);

  const addBotMessage = (content: string, actions?: ChatAction[]) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date(),
      actions
    };
    
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, message]);
      setIsTyping(false);
    }, 1000);
  };

  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const getGreetingMessage = (): string => {
    const userName = 'Usuario'; // En producción obtener del contexto
    return `👋 ¡Hola ${userName}! Bienvenido a tu asistente de tokens Beta.

🪙 Soy tu guía personal para CMPX y GTK. Puedo ayudarte a:
• Ver tu balance actual
• Reclamar recompensas disponibles  
• Configurar staking (alcancía especial)
• Aprender sobre el sistema de tokens

¿Quieres revisar tu balance actual?`;
  };

  const getBalanceMessage = (): string => {
    if (!balance) return '⚠️ No pude cargar tu balance. Intenta refrescar.';

    const totalCMPX = balance.cmpxBalance + balance.cmpxStaked;
    const pendingAmount = pendingRewards.reduce((sum, r) => sum + r.amount, 0);

    return `🪙 **Tu balance actual:**
• CMPX: ${totalCMPX} (${balance.cmpxBalance} disponibles, ${balance.cmpxStaked} en staking${pendingAmount > 0 ? `, ${pendingAmount} pendientes` : ''})
• GTK: ${balance.gtkBalance} (todos disponibles)

📊 **Límite mensual:** ${balance.monthlyRemaining}/${balance.monthlyLimit} CMPX restantes
👥 **Referidos exitosos:** ${balance.totalReferrals}

${hasPendingRewards ? '🎁 ¡Tienes recompensas pendientes!' : ''}`;
  };

  const getRewardsMessage = (): string => {
    const rewards = [];
    
    if (isWorldIdEligible) {
      rewards.push('• +100 CMPX → World ID verificado ✅');
    }
    
    pendingRewards.forEach(reward => {
      rewards.push(`• +${reward.amount} CMPX → ${reward.description}`);
    });

    if (rewards.length === 0) {
      return '😊 No tienes recompensas pendientes en este momento.\n\n💡 **Formas de ganar CMPX:**\n• Verificar World ID (+100 CMPX)\n• Invitar amigos (+50 CMPX cada uno)\n• Completar perfil (+25 CMPX)\n• Dar feedback beta (+20 CMPX)\n• Login diario (+5 CMPX)';
    }

    return `🎁 **Recompensas disponibles:**\n${rewards.join('\n')}\n\n¿Quieres reclamar todas tus recompensas ahora?`;
  };

  const getStakingMessage = (): string => {
    return `🔒 **¿Qué es staking?**
Es como una alcancía especial: guardas tus CMPX por 30 días y al final recibes un +10% de recompensa.

💡 **Ejemplo:**
Si pones 100 CMPX → En 30 días tendrás 110 CMPX

✨ **Beneficios:**
• Apoyas la red ComplicesConecta
• Ganas recompensas pasivas
• Tokens seguros durante el período

Tienes ${balance?.cmpxBalance || 0} CMPX disponibles.
¿Cuántos CMPX quieres poner en staking?`;
  };

  // Handlers para diferentes pasos del wizard
  const handleGreetingResponse = (response: string) => {
    addUserMessage(response);
    
    if (response.toLowerCase().includes('sí') || response.toLowerCase().includes('si')) {
      setCurrentStep('balance');
      addBotMessage(getBalanceMessage(), [
        {
          id: 'check-rewards',
          label: '🎁 Ver recompensas',
          action: () => handleBalanceResponse('recompensas')
        },
        {
          id: 'check-staking',
          label: '🔒 Ver staking',
          action: () => handleBalanceResponse('staking')
        }
      ]);
    } else {
      addBotMessage('😊 ¡Perfecto! Cuando quieras revisar tu balance, solo pregúntame.\n\n💡 También puedes decir:\n• "¿Cuántos tokens tengo?"\n• "Quiero hacer staking"\n• "¿Qué recompensas hay?"');
    }
  };

  const handleBalanceResponse = (response: string) => {
    if (response === 'recompensas') {
      addUserMessage('Ver recompensas');
      setCurrentStep('rewards');
      
      if (hasPendingRewards || isWorldIdEligible) {
        addBotMessage(getRewardsMessage(), [
          {
            id: 'claim-all',
            label: '✅ Reclamar todas',
            action: handleClaimRewards
          },
          {
            id: 'maybe-later',
            label: '⏰ Más tarde',
            action: () => addBotMessage('😊 ¡Perfecto! Tus recompensas estarán aquí cuando quieras reclamarlas.')
          }
        ]);
      } else {
        addBotMessage(getRewardsMessage());
      }
    } else if (response === 'staking') {
      addUserMessage('Ver staking');
      setCurrentStep('staking');
      addBotMessage(getStakingMessage());
    }
  };

  const handleClaimRewards = async () => {
    addUserMessage('Reclamar recompensas');
    addBotMessage('🔄 Procesando tus recompensas...');

    try {
      let totalClaimed = 0;
      const claimedRewards = [];

      if (isWorldIdEligible) {
        const result = await claimWorldIdReward();
        if (result) {
          totalClaimed += 100;
          claimedRewards.push('World ID (+100 CMPX)');
        }
      }

      // Aquí se procesarían otras recompensas pendientes
      // Por ahora simulamos el proceso

      if (totalClaimed > 0) {
        await refreshTokens();
        addBotMessage(`🎉 **¡Recompensas reclamadas exitosamente!**

✅ Total añadido: ${totalClaimed} CMPX
📋 Recompensas: ${claimedRewards.join(', ')}

💰 Nuevo balance: ${(balance?.cmpxBalance || 0) + totalClaimed} CMPX disponibles

¿Quieres revisar opciones de staking ahora?`, [
          {
            id: 'yes-staking',
            label: '🔒 Sí, ver staking',
            action: () => handleRewardsResponse('staking')
          },
          {
            id: 'no-staking',
            label: '😊 No, gracias',
            action: () => addBotMessage('¡Perfecto! Tus tokens están seguros en tu balance. ¡Que disfrutes ComplicesConecta! 🚀')
          }
        ]);
      } else {
        addBotMessage('⚠️ No se pudieron reclamar las recompensas. Intenta más tarde.');
      }
    } catch (error) {
      addBotMessage('❌ Error procesando recompensas. Por favor intenta nuevamente.');
    }
  };

  const handleRewardsResponse = (response: string) => {
    if (response === 'staking') {
      setCurrentStep('staking');
      addBotMessage(getStakingMessage());
    }
  };

  const handleStakingInput = async (amount: string) => {
    const stakingAmount = parseInt(amount);
    
    if (isNaN(stakingAmount) || stakingAmount < 50) {
      addBotMessage('⚠️ Por favor ingresa un número válido. Mínimo 50 CMPX para staking.');
      return;
    }

    if (stakingAmount > (balance?.cmpxBalance || 0)) {
      addBotMessage(`⚠️ No tienes suficientes CMPX. Tienes ${balance?.cmpxBalance || 0} disponibles.`);
      return;
    }

    addUserMessage(`${stakingAmount} CMPX`);
    setStakingAmount(stakingAmount);
    
    const rewardAmount = Math.round(stakingAmount * 0.1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    addBotMessage(`🔒 **Confirmación de Staking**

💰 Cantidad: ${stakingAmount} CMPX
⏰ Duración: 30 días
📅 Fecha de liberación: ${endDate.toLocaleDateString('es-ES')}
🎁 Recompensa estimada: +${rewardAmount} CMPX
💎 Total a recibir: ${stakingAmount + rewardAmount} CMPX

¿Confirmas que quieres iniciar el staking?`, [
      {
        id: 'confirm-staking',
        label: '✅ Confirmar staking',
        action: () => executeStaking(stakingAmount)
      },
      {
        id: 'cancel-staking',
        label: '❌ Cancelar',
        action: () => addBotMessage('😊 Staking cancelado. Tus CMPX siguen disponibles en tu balance.')
      }
    ]);
  };

  const executeStaking = async (amount: number) => {
    addUserMessage('Confirmar staking');
    addBotMessage('🔄 Procesando tu staking...');

    try {
      const result = await startStaking(amount);
      
      if (result) {
        await refreshTokens();
        setCurrentStep('completed');
        
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        addBotMessage(`🚀 **¡Staking iniciado exitosamente!**

✅ ${amount} CMPX bloqueados por 30 días
📅 Liberación: ${endDate.toLocaleDateString('es-ES')}
🎁 Recompensa: +${Math.round(amount * 0.1)} CMPX

💡 **¿Qué sigue?**
• Tus tokens están seguros en staking
• Recibirás la recompensa automáticamente
• Puedes seguir ganando más CMPX mientras tanto

¡Gracias por apoyar la red ComplicesConecta! 🌟`);
      } else {
        addBotMessage(`❌ Error iniciando staking. Intenta de nuevo más tarde.`);
      }
    } catch (error) {
      addBotMessage('❌ Error procesando staking. Por favor intenta nuevamente.');
    }
  };

  const handleUserInput = (input: string) => {
    const lowerInput = input.toLowerCase().trim();
    
    // Respuestas contextuales según el paso actual
    switch (currentStep) {
      case 'greeting':
        handleGreetingResponse(input);
        break;
        
      case 'staking':
        if (/^\d+$/.test(input)) {
          handleStakingInput(input);
        } else if (lowerInput.includes('no') || lowerInput.includes('cancelar')) {
          addUserMessage(input);
          addBotMessage('😊 ¡Perfecto! El staking es opcional. Tus CMPX están seguros en tu balance.\n\n¿Hay algo más en lo que pueda ayudarte?');
        } else {
          addUserMessage(input);
          addBotMessage('💡 Para hacer staking, ingresa la cantidad de CMPX (ejemplo: 100) o escribe "no" si prefieres no hacerlo ahora.');
        }
        break;
        
      default:
        // Respuestas generales
        addUserMessage(input);
        
        if (lowerInput.includes('balance') || lowerInput.includes('tokens') || lowerInput.includes('cuántos')) {
          addBotMessage(getBalanceMessage());
        } else if (lowerInput.includes('recompensa') || lowerInput.includes('reclamar')) {
          addBotMessage(getRewardsMessage());
        } else if (lowerInput.includes('staking') || lowerInput.includes('alcancía')) {
          addBotMessage(getStakingMessage());
        } else {
          addBotMessage('🤔 No estoy seguro de cómo ayudarte con eso.\n\n💡 **Puedes preguntarme:**\n• "¿Cuántos tokens tengo?"\n• "¿Qué recompensas hay?"\n• "¿Cómo funciona el staking?"\n• "Quiero reclamar recompensas"');
        }
    }
    
    setUserInput('');
  };

  const handleSendMessage = () => {
    if (userInput.trim()) {
      handleUserInput(userInput);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Cargando asistente de tokens...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-purple-600" />
          🤖 Asistente de Tokens CMPX/GTK
        </CardTitle>
        <p className="text-sm text-gray-600">
          Tu guía personal para tokens en fase Beta
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.type === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-purple-600" />
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3 break-words overflow-hidden",
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-900 border border-purple-200'
                )}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed break-words max-h-40 overflow-y-auto">
                  {message.content}
                </div>
                
                {message.actions && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.actions.map((action) => (
                      <Button
                        key={action.id}
                        size="sm"
                        variant={action.variant || 'outline'}
                        onClick={action.action}
                        className="text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-purple-600" />
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!userInput.trim() || isTyping}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
            💡 Prueba: "¿Cuántos tokens tengo?" o "Quiero hacer staking"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
