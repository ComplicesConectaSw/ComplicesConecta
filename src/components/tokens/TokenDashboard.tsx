/**
 * Dashboard Interactivo de Tokens CMPX/GTK
 * Visualización amigable para usuarios Beta con gráficos y métricas
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTokens } from '../../hooks/useTokens';
import { Coins, TrendingUp, Lock, Gift, Users, Calendar } from 'lucide-react';

export function TokenDashboard() {
  const {
    balance,
    transactions,
    stakingRecords,
    pendingRewards,
    loading,
    error,
    claimWorldIdReward,
    startStaking,
    completeStaking,
    refreshTokens,
    hasActiveStaking,
    hasPendingRewards,
    isWorldIdEligible
  } = useTokens();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">🪙 Cargando tu balance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">❌ {error}</p>
        <Button onClick={refreshTokens} className="mt-2" size="sm">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-600">⚠️ No se pudo cargar el balance</p>
      </div>
    );
  }

  const totalCMPX = balance.cmpxBalance + balance.cmpxStaked;
  const availablePercentage = totalCMPX > 0 ? (balance.cmpxBalance / totalCMPX) * 100 : 0;
  const stakedPercentage = totalCMPX > 0 ? (balance.cmpxStaked / totalCMPX) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header con balance principal */}
      <div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">🪙 Tu Balance de Tokens</h2>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div>
            <p className="text-blue-100">CMPX Total</p>
            <p className="text-3xl font-bold">{totalCMPX}</p>
          </div>
          <div>
            <p className="text-purple-100">GTK</p>
            <p className="text-3xl font-bold">{balance.gtkBalance}</p>
          </div>
        </div>
      </div>

      {/* Distribución de CMPX */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Distribución CMPX
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Barra de progreso visual */}
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="flex h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${availablePercentage}%` }}
                ></div>
                <div 
                  className="bg-blue-500 transition-all duration-500"
                  style={{ width: `${stakedPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Leyenda */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Disponibles: {balance.cmpxBalance} CMPX</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>En Staking: {balance.cmpxStaked} CMPX</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Límite mensual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Límite Mensual Beta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Ganados este mes:</span>
              <span className="font-semibold">{balance.monthlyEarned} CMPX</span>
            </div>
            <div className="flex justify-between">
              <span>Restantes:</span>
              <span className="font-semibold text-green-600">{balance.monthlyRemaining} CMPX</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(balance.monthlyEarned / balance.monthlyLimit) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              En fase beta cada usuario puede ganar máximo {balance.monthlyLimit} CMPX al mes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recompensas disponibles */}
      {(isWorldIdEligible || hasPendingRewards) && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Gift className="h-5 w-5" />
              🎁 Recompensas Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isWorldIdEligible && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-semibold">🌍 World ID Verificado</p>
                  <p className="text-sm text-gray-600">Reclama 100 CMPX por verificar tu identidad</p>
                </div>
                <Button 
                  onClick={claimWorldIdReward}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Reclamar 100 CMPX
                </Button>
              </div>
            )}
            
            {pendingRewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-semibold">{reward.description}</p>
                  <p className="text-sm text-gray-600">+{reward.amount} {reward.tokenType}</p>
                </div>
                <Badge variant="secondary">Pendiente</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Staking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            🔒 Staking (Alcancía Especial)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                💡 <strong>¿Qué es staking?</strong>
              </p>
              <p className="text-sm text-blue-700">
                Guardas tus CMPX por 30 días y recibes +10% de recompensa. 
                Ejemplo: 100 CMPX → 110 CMPX después de 30 días.
              </p>
            </div>

            {stakingRecords.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Tus Stakings:</h4>
                {stakingRecords.map((staking) => (
                  <div key={staking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{staking.amount} CMPX</p>
                      <p className="text-sm text-gray-600">
                        {staking.status === 'active' 
                          ? `${staking.daysRemaining} días restantes`
                          : `Completado (+${Math.round(staking.amount * staking.rewardPercentage / 100)} CMPX)`
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={staking.status === 'active' ? 'default' : 'secondary'}
                      >
                        {staking.status === 'active' ? 'Activo' : 'Completado'}
                      </Badge>
                      {staking.status === 'active' && staking.daysRemaining === 0 && (
                        <Button 
                          size="sm" 
                          className="ml-2"
                          onClick={() => completeStaking(staking.id)}
                        >
                          Reclamar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!hasActiveStaking && balance.cmpxBalance >= 50 && (
              <Button 
                onClick={() => startStaking(Math.min(100, balance.cmpxBalance))}
                className="w-full"
                variant="outline"
              >
                🔒 Iniciar Staking ({Math.min(100, balance.cmpxBalance)} CMPX por 30 días)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            👥 Sistema de Referidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Tu código de referido:</span>
              <Badge variant="outline" className="font-mono">
                {balance.referralCode}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Referidos exitosos:</span>
              <span className="font-semibold">{balance.totalReferrals}</span>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                💰 <strong>Gana 50 CMPX</strong> por cada amigo que invites y se registre.
                Tu amigo también recibe <strong>50 CMPX de bienvenida</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transacciones recientes */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              📋 Transacciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} {tx.tokenType}
                    </p>
                    <p className="text-xs text-gray-500">
                      Balance: {tx.balanceAfter}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón de actualizar */}
      <div className="text-center">
        <Button onClick={refreshTokens} variant="outline">
          🔄 Actualizar Balance
        </Button>
      </div>
    </div>
  );
}
