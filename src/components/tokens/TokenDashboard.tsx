/**
 * Dashboard Interactivo de Tokens CMPX/GTK
 * Visualización amigable para usuarios Beta con gráficos y métricas
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { useTokens } from '@/hooks/useTokens';
import { Coins, TrendingUp, Lock, Gift, Users, Calendar, Sparkles } from 'lucide-react';

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
      <main role="main" className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/90">🪙 Cargando tu balance...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main role="main" className="p-4 bg-red-500/20 backdrop-blur-md border border-red-300/30 rounded-lg">
        <p className="text-white">❌ {error}</p>
        <Button onClick={refreshTokens} className="mt-2 bg-white/20 hover:bg-white/30 text-white border-white/30" size="sm">
          Reintentar
        </Button>
      </main>
    );
  }

  if (!balance) {
    return (
      <main role="main" className="p-4 bg-yellow-500/20 backdrop-blur-md border border-yellow-300/30 rounded-lg">
        <p className="text-white">⚠️ No se pudo cargar el balance</p>
      </main>
    );
  }

  const totalCMPX = balance.cmpxBalance + balance.cmpxStaked;
  const availablePercentage = totalCMPX > 0 ? (balance.cmpxBalance / totalCMPX) * 100 : 0;
  const stakedPercentage = totalCMPX > 0 ? (balance.cmpxStaked / totalCMPX) * 100 : 0;

  return (
    <main role="main" className="space-y-6 p-4">
      {/* Header con balance principal */}
      <div className="text-center bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-md border border-white/20 text-white p-6 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold mb-2 text-white">🪙 Tu Balance de Tokens</h2>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div>
            <p className="text-white/80">CMPX Total</p>
            <p className="text-3xl font-bold text-white">{totalCMPX}</p>
          </div>
          <div>
            <p className="text-white/80">GTK</p>
            <p className="text-3xl font-bold text-white">{balance.gtkBalance}</p>
          </div>
        </div>
      </div>

      {/* Distribución de CMPX */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
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
                <span className="text-white/90 truncate">Disponibles: {balance.cmpxBalance} CMPX</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-white/90 truncate">En Staking: {balance.cmpxStaked} CMPX</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Límite mensual */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            Límite Mensual Beta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/90 truncate">Ganados este mes:</span>
              <span className="font-semibold text-white truncate">{balance.monthlyEarned} CMPX</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/90 truncate">Restantes:</span>
              <span className="font-semibold text-green-400 truncate">{balance.monthlyRemaining} CMPX</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(balance.monthlyEarned / balance.monthlyLimit) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-white/70 break-words">
              En fase beta cada usuario puede ganar máximo {balance.monthlyLimit} CMPX al mes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recompensas disponibles */}
      {(isWorldIdEligible || hasPendingRewards) && (
        <Card className="border-green-400/30 bg-green-500/20 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Gift className="h-5 w-5" />
              🎁 Recompensas Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isWorldIdEligible && (
              <div className="flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">🌍 World ID Verificado</p>
                  <p className="text-sm text-white/80 break-words">Reclama 100 CMPX por verificar tu identidad</p>
                </div>
                <Button 
                  onClick={claimWorldIdReward}
                  className="bg-green-600 hover:bg-green-700 text-white ml-2 flex-shrink-0"
                >
                  Reclamar 100 CMPX
                </Button>
              </div>
            )}
            
            {pendingRewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{reward.amount} {reward.token_type}</p>
                  <p className="text-sm text-white/80 truncate">Balance: {reward.amount}</p>
                </div>
                <Badge variant="secondary" className="bg-yellow-500/80 text-white ml-2 flex-shrink-0">Pendiente</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Staking */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Lock className="h-5 w-5" />
            🔒 Staking (Alcancía Especial)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-500/20 backdrop-blur-sm p-4 rounded-lg border border-blue-400/30">
              <p className="text-sm text-white mb-2">
                💡 <strong>¿Qué es staking?</strong>
              </p>
              <p className="text-sm text-white/90 break-words">
                Guardas tus CMPX por 30 días y recibes +10% de recompensa. 
                Ejemplo: 100 CMPX → 110 CMPX después de 30 días.
              </p>
            </div>

            {stakingRecords && stakingRecords.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Tus Stakings:</h4>
                {stakingRecords.map((staking) => (
                  <div key={staking.id} className="flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{staking.amount} CMPX</p>
                      <p className="text-sm text-white/80 break-words">
                        {staking.status === 'active' 
                          ? `${Math.ceil((new Date(staking.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} días restantes`
                          : `Completado (+${Math.round(staking.amount * staking.apy / 100)} CMPX)`
                        }
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <Badge 
                        variant={staking.status === 'active' ? 'default' : 'secondary'}
                        className={staking.status === 'active' ? 'bg-blue-500/80 text-white' : 'bg-green-500/80 text-white'}
                      >
                        {staking.status === 'active' ? 'Activo' : 'Completado'}
                      </Badge>
                      {staking.status === 'active' && new Date(staking.end_date) <= new Date() && (
                        <Button 
                          size="sm" 
                          className="ml-2 bg-green-600 hover:bg-green-700 text-white"
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
                className="w-full bg-purple-600/80 hover:bg-purple-700/80 text-white border-purple-400/30"
                variant="outline"
              >
                🔒 Iniciar Staking ({Math.min(100, balance.cmpxBalance)} CMPX por 30 días)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referidos */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            👥 Sistema de Referidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/90 truncate">Tu código de referido:</span>
              <Badge variant="outline" className="font-mono bg-white/20 text-white border-white/30 ml-2 flex-shrink-0">
                {balance.referralCode}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/90 truncate">Referidos exitosos:</span>
              <span className="font-semibold text-white flex-shrink-0 ml-2">{balance.totalReferrals}</span>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur-sm p-3 rounded-lg border border-yellow-400/30">
              <p className="text-sm text-white break-words">
                💰 <strong>Gana 50 CMPX</strong> por cada amigo que invites y se registre.
                Tu amigo también recibe <strong>50 CMPX de bienvenida</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Galerías NFT-Verificadas */}
      <Card className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5" />
            🎨 Galerías NFT-Verificadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-purple-500/20 backdrop-blur-sm p-4 rounded-lg border border-purple-400/30">
              <p className="text-sm text-white mb-2">
                💡 <strong>¿Qué son los NFTs?</strong>
              </p>
              <p className="text-sm text-white/90 break-words">
                Convierte tus galerías en NFTs verificados usando tokens GTK. 
                Verifica la autenticidad de tus fotos en blockchain y aumenta el valor de tu perfil.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <div className="text-xs text-white/70 mb-1">Costo Galería</div>
                <div className="text-lg font-semibold text-white">1,000 GTK</div>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <div className="text-xs text-white/70 mb-1">Costo Imagen</div>
                <div className="text-lg font-semibold text-white">100 GTK</div>
              </div>
            </div>

            <div className="text-xs text-white/60 text-center">
              ⚠️ Los NFTs se activarán en blockchain en Q2 2026. Actualmente en preparación.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transacciones recientes */}
      {transactions.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Coins className="h-5 w-5" />
              📋 Transacciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2 bg-white/20 backdrop-blur-sm rounded border border-white/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                    <p className="text-sm text-white/70 truncate">{new Date(tx.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className={`text-sm font-semibold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} {tx.token_type}
                    </p>
                    <p className="text-xs text-white/60 truncate">
                      Balance: {tx.amount}
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
        <Button onClick={refreshTokens} variant="outline" className="bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white/20">
          🔄 Actualizar Balance
        </Button>
      </div>
    </main>
  );
};
