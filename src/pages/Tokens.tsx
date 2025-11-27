/**
 * Página principal de Tokens CMPX/GTK
 * Dashboard completo para gestión de tokens con información oficial
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Home, 
  Coins, 
  Info,
  DollarSign,
  TrendingUp,
  Rocket,
  Shield,
  Star,
  BarChart3,
  Wallet,
  Gift,
  Sparkles,
  Camera,
  Crown
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useTokens } from '@/hooks/useTokens';
import { TokenDashboard } from '@/components/tokens/TokenDashboard';
import { StakingModal } from '@/components/tokens/StakingModal';
import { TokenChatBot } from '@/components/tokens/TokenChatBot';
import HeaderNav from '@/components/HeaderNav';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/features/auth/useAuth';
import { DecorativeHearts } from '@/components/DecorativeHearts';
import { motion } from 'framer-motion';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

export default function Tokens() {
  const [showStakingModal, setShowStakingModal] = useState(false);
  const { balance: _balance, refreshTokens: _refreshTokens } = useTokens();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Determinar si hay sesión activa para mostrar Navigation o HeaderNav
  const hasActiveSession = isAuthenticated();

  // Información de tokens desde la documentación
  const tokenInfo = {
    cmpx: {
      name: "Token CMPX",
      subtitle: "La Moneda de Consumo",
      description: "Suministro ilimitado diseñado para transacciones diarias dentro de la plataforma",
      supply: "Ilimitado",
      purpose: "Consumo diario",
      features: [
        "Compra directa con dinero real (MXN, USD, criptomonedas)",
        "Uso para regalos virtuales, eventos VIP, funciones premium",
        "Transferible entre usuarios de la comunidad",
        "Ingresos recurrentes para la plataforma",
        "Recompensas por referidos y actividades"
      ],
      useCases: [
        { icon: <Gift className="h-5 w-5" />, title: "Regalos Virtuales", desc: "Flores, chocolates y regalos personalizados" },
        { icon: <Crown className="h-5 w-5" />, title: "Eventos VIP", desc: "Entradas exclusivas para eventos privados" },
        { icon: <Star className="h-5 w-5" />, title: "Funciones Premium", desc: "Super likes, boosts y características avanzadas" },
        { icon: <Camera className="h-5 w-5" />, title: "Contenido Exclusivo", desc: "Acceso a galerías privadas y contenido especial" },
        { icon: <Sparkles className="h-5 w-5" />, title: "Personalización", desc: "Temas exclusivos y elementos visuales" }
      ],
      distribution: [
        { percentage: "60%", purpose: "Venta directa (ingresos recurrentes)" },
        { percentage: "25%", purpose: "Recompensas por referidos y actividades" },
        { percentage: "10%", purpose: "Eventos especiales y promociones" },
        { percentage: "5%", purpose: "Reserva para desarrollo y marketing" }
      ]
    },
    gtk: {
      name: "Token GTK",
      subtitle: "La Inversión con Futuro Blockchain",
      description: "Suministro limitado para staking, inversión y futuro blockchain",
      supply: "Limitado",
      purpose: "Inversión y Staking",
      features: [
        "Token de staking para ingresos pasivos",
        "Próxima integración blockchain (Q2-Q4 2026)",
        "APY: 15-35% según duración de staking",
        "Potencial de apreciación a largo plazo",
        "Acceso a funcionalidades blockchain exclusivas"
      ],
      stakingTiers: [
        { duration: "30 días", apy: "15%", minAmount: "1,000 GTK" },
        { duration: "90 días", apy: "20%", minAmount: "5,000 GTK" },
        { duration: "180 días", apy: "25%", minAmount: "10,000 GTK" },
        { duration: "270 días", apy: "30%", minAmount: "20,000 GTK" },
        { duration: "365 días", apy: "35%", minAmount: "25,000 GTK" }
      ],
      roadmap: [
        { phase: "Q2 2026", milestone: "Preparación y auditoría de contratos" },
        { phase: "Q3 2026", milestone: "IDO en Uniswap/PancakeSwap" },
        { phase: "Q4 2026", milestone: "Funcionalidades blockchain completas" }
      ]
    }
  };

  const revenueProjections = [
    {
      year: "Año 1 (2026)",
      cmpxSales: "$500,000",
      subscriptions: "$200,000",
      total: "$700,000",
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      year: "Año 2 (2027)", 
      cmpxSales: "$2,000,000",
      subscriptions: "$800,000",
      staking: "$100,000",
      total: "$2,900,000",
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      year: "Año 3 (2028)",
      cmpxSales: "$5,000,000",
      subscriptions: "$2,000,000",
      blockchain: "$500,000",
      total: "$7,500,000",
      color: "from-green-500/20 to-emerald-500/20"
    }
  ];

  const investorAdvantages = [
    {
      title: "Token GTK con Potencial de Apreciación",
      description: "Suministro limitado = escasez = valor creciente. Staking genera ingresos pasivos.",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Economía Dual Sostenible",
      description: "CMPX genera ingresos recurrentes. GTK crea comunidad de inversores a largo plazo.",
      icon: <Coins className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "First Mover Advantage",
      description: "Primera plataforma social en México con token nativo. 40M+ usuarios potenciales.",
      icon: <Rocket className="h-6 w-6" />,
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Diversificación de Ingresos",
      description: "Múltiples flujos: tokens, blockchain, NFTs, eventos. Resiliente a cambios.",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "from-orange-500 to-red-600"
    }
  ];

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 pb-20">
      {hasActiveSession ? <Navigation /> : <HeaderNav />}
      
      {/* Corazones decorativos flotantes */}
      <DecorativeHearts count={8} />
      
      {/* Background Uniforme */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold mb-4">
              💰 SISTEMA DUAL DE TOKENS
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Tokens
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> CMPX & GTK</span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              Dos tokens, dos propósitos: CMPX para consumo diario y GTK para inversión blockchain. 
              Economía digital única con staking del 8-18% APY.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-400/30 px-4 py-2 text-base">
                <Coins className="h-4 w-4 mr-2" />
                CMPX Consumo
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-400/30 px-4 py-2 text-base">
                <Rocket className="h-4 w-4 mr-2" />
                GTK Inversión
              </Badge>
              <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-400/30 px-4 py-2 text-base">
                <TrendingUp className="h-4 w-4 mr-2" />
                8-18% APY
              </Badge>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => navigate('/profile')} 
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8 py-3 text-lg font-semibold"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Mi Wallet
              </Button>
              <Button 
                onClick={() => setShowStakingModal(true)} 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Hacer Staking
              </Button>
            </div>
          </motion.div>

          {/* Dashboard de Tokens */}
          {hasActiveSession && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <TokenDashboard />
            </motion.div>
          )}

          {/* Información de Tokens */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              Dos Tokens, Dos Propósitos
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Token CMPX */}
              <Card className="bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-blue-600/20 backdrop-blur-xl border-blue-400/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div>{tokenInfo.cmpx.name}</div>
                      <div className="text-lg font-normal text-blue-300">{tokenInfo.cmpx.subtitle}</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-white/90 text-lg">{tokenInfo.cmpx.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-white/10 rounded-lg">
                      <div className="text-2xl font-bold text-white">{tokenInfo.cmpx.supply}</div>
                      <div className="text-white/70 text-sm">Suministro</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-lg">
                      <div className="text-2xl font-bold text-white">{tokenInfo.cmpx.purpose}</div>
                      <div className="text-white/70 text-sm">Propósito</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">Casos de Uso:</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {tokenInfo.cmpx.useCases.map((useCase, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300">
                            {useCase.icon}
                          </div>
                          <div>
                            <h5 className="font-semibold text-white text-sm">{useCase.title}</h5>
                            <p className="text-white/70 text-xs">{useCase.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">Distribución:</h4>
                    <div className="space-y-2">
                      {tokenInfo.cmpx.distribution.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded">
                          <span className="text-white/80 text-sm">{item.purpose}</span>
                          <span className="font-bold text-blue-300">{item.percentage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Token GTK */}
              <Card className="bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-purple-600/20 backdrop-blur-xl border-purple-400/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <Rocket className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div>{tokenInfo.gtk.name}</div>
                      <div className="text-lg font-normal text-purple-300">{tokenInfo.gtk.subtitle}</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-white/90 text-lg">{tokenInfo.gtk.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-white/10 rounded-lg">
                      <div className="text-2xl font-bold text-white">{tokenInfo.gtk.supply}</div>
                      <div className="text-white/70 text-sm">Suministro</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-lg">
                      <div className="text-2xl font-bold text-white">{tokenInfo.gtk.purpose}</div>
                      <div className="text-white/70 text-sm">Propósito</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">Staking Tiers:</h4>
                    <div className="space-y-2">
                      {tokenInfo.gtk.stakingTiers.map((tier, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <div>
                            <div className="font-semibold text-white text-sm">{tier.duration}</div>
                            <div className="text-white/70 text-xs">Min: {tier.minAmount}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-purple-300 text-lg">{tier.apy}</div>
                            <div className="text-white/70 text-xs">APY</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">Roadmap Blockchain:</h4>
                    <div className="space-y-2">
                      {tokenInfo.gtk.roadmap.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 bg-white/5 rounded">
                          <div className="font-bold text-purple-300 text-sm flex-shrink-0">{item.phase}</div>
                          <div className="text-white/80 text-sm">{item.milestone}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Proyecciones de Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-20"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  Modelo de Ingresos Proyectado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {revenueProjections.map((projection, index) => (
                    <motion.div
                      key={projection.year}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className={`p-6 rounded-xl border border-white/20 bg-gradient-to-br ${projection.color} backdrop-blur-sm`}
                    >
                      <h4 className="text-xl font-bold text-white mb-4">{projection.year}</h4>
                      <div className="space-y-2 text-white/80">
                        <div className="flex justify-between">
                          <span>Venta CMPX:</span>
                          <span className="font-bold text-white">{projection.cmpxSales}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Suscripciones:</span>
                          <span className="font-bold text-white">{projection.subscriptions}</span>
                        </div>
                        {projection.staking && (
                          <div className="flex justify-between">
                            <span>Staking:</span>
                            <span className="font-bold text-white">{projection.staking}</span>
                          </div>
                        )}
                        {projection.blockchain && (
                          <div className="flex justify-between">
                            <span>Blockchain:</span>
                            <span className="font-bold text-white">{projection.blockchain}</span>
                          </div>
                        )}
                        <div className="border-t border-white/20 pt-2 mt-2 flex justify-between">
                          <span className="font-semibold">Total:</span>
                          <span className="text-2xl font-black text-white">{projection.total}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ventajas para Inversores */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              Ventajas para Inversores
            </h2>
            <p className="text-lg text-white/70 text-center mb-12 max-w-2xl mx-auto">
              Sistema dual de tokens diseñado para crear valor sostenible y oportunidades de crecimiento
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {investorAdvantages.map((advantage, index) => (
                <motion.div
                  key={advantage.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="p-6 bg-white/10 rounded-xl border border-white/20 hover:border-purple-400/50 transition-all duration-300"
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${advantage.color} text-white mb-4`}>
                    {advantage.icon}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{advantage.title}</h4>
                  <p className="text-white/70 leading-relaxed">{advantage.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Botones de Acción */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30 backdrop-blur-xl border-purple-400/30 shadow-2xl">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-6">
                  ¿Listo para Comenzar con Tokens?
                </h3>
                
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  <AnimatedButton
                    onClick={() => navigate('/profile')}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Ver Mi Wallet
                  </AnimatedButton>
                  
                  <AnimatedButton
                    onClick={() => setShowStakingModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Hacer Staking
                  </AnimatedButton>
                  
                  <AnimatedButton
                    onClick={() => navigate('/tokens-info')}
                    variant="premium"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-3"
                  >
                    <Info className="w-5 h-5 mr-2" />
                    Más Información
                  </AnimatedButton>
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-white/80">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Seguro y Verificado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>8-18% APY Staking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Rocket className="h-4 w-4" />
                    <span>Blockchain Ready</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Navegación */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Home className="w-4 h-4 mr-2" />
              Inicio
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Modales */}
      {showStakingModal && (
        <StakingModal
          isOpen={showStakingModal}
          onClose={() => setShowStakingModal(false)}
        />
      )}

      {/* ChatBot de Tokens */}
      <TokenChatBot />
    </div>
  );
}
