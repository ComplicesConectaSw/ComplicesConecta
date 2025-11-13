import React from 'react';
import HeaderNav from '@/components/HeaderNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { DecorativeHearts } from '@/components/DecorativeHearts';
import { motion } from 'framer-motion';
import {
  Heart,
  Brain,
  Shield,
  Zap,
  TrendingUp,
  DollarSign,
  Rocket,
  Users,
  Globe,
  Database,
  Lock,
  Sparkles,
  Coins,
  BarChart3,
  CheckCircle2,
  Star,
  Target,
  Award,
  Mail,
  ArrowRight,
  ChevronRight,
  FileText,
  Scale
} from 'lucide-react';

const Investors: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 relative overflow-hidden">
      {/* Background decorativo */}
      <DecorativeHearts count={12} />
      
      <HeaderNav />
      
      {/* Hero Section para Inversores */}
      <section className="relative z-10 pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-600 rounded-2xl shadow-2xl"
              >
                <Heart className="h-16 w-16 text-white" fill="currentColor" />
              </motion.div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 drop-shadow-2xl">
              ComplicesConecta
              <span className="block text-3xl sm:text-4xl md:text-5xl font-bold text-purple-300 mt-2">
                Oportunidad de Inversión
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 font-medium max-w-3xl mx-auto leading-relaxed mb-8">
              La primera plataforma social en México con economía tokenizada, 
              tecnología AI-Native y crecimiento exponencial proyectado
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-400/30 px-4 py-2 text-base">
                <Rocket className="h-4 w-4 mr-2" />
                Beta Activa
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-400/30 px-4 py-2 text-base">
                <Brain className="h-4 w-4 mr-2" />
                AI-Native
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-400/30 px-4 py-2 text-base">
                <Coins className="h-4 w-4 mr-2" />
                Economía Tokenizada
              </Badge>
              <Badge className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border-orange-400/30 px-4 py-2 text-base">
                <TrendingUp className="h-4 w-4 mr-2" />
                Blockchain Roadmap
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/about')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                <Target className="h-5 w-5 mr-2" />
                Conocer Más
              </Button>
              <Button
                onClick={() => window.location.href = 'mailto:complicesconectasw@outlook.es?subject=Consulta de Inversión'}
                className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <Mail className="h-5 w-5 mr-2" />
                Contactar
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-8 pb-20">
        
        {/* Qué es ComplicesConecta */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                ¿Qué es ComplicesConecta?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/90 text-lg leading-relaxed">
                <strong className="text-white">ComplicesConecta</strong> es una plataforma social exclusiva diseñada para adultos mayores de 18 años 
                que buscan conectar con personas afines de manera segura, discreta y verificada. Somos la <strong className="text-purple-300">primera plataforma en México</strong> 
                que combina tecnología de inteligencia artificial nativa con un sistema robusto de privacidad y seguridad.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <Users className="h-8 w-8 text-blue-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Comunidad Verificada</h4>
                  <p className="text-white/70 text-sm">Sistema de verificación multi-nivel para asegurar perfiles auténticos</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <Brain className="h-8 w-8 text-purple-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">IA Nativa + Neo4j</h4>
                  <p className="text-white/70 text-sm">Algoritmos ML para matching inteligente. Neo4j Graph Database para conexiones sociales. Verificador IA de Consentimiento.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <Shield className="h-8 w-8 text-green-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Privacidad Total</h4>
                  <p className="text-white/70 text-sm">Control granular sobre quién te ve y te contacta</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Sistema de Tokens */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                  <Coins className="h-6 w-6 text-white" />
                </div>
                Sistema de Tokens: Economía Digital Única
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Token CMPX */}
                <div className="p-6 bg-white/10 rounded-xl border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Token CMPX</h3>
                  </div>
                  <p className="text-white/80 mb-4 text-lg">La Moneda de Consumo - Suministro Ilimitado</p>
                  <ul className="space-y-2 text-white/70">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Compra directa con dinero real (MXN, USD, criptomonedas)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Uso para regalos virtuales, eventos VIP, funciones premium</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Transferible entre usuarios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Ingresos recurrentes para la plataforma</span>
                    </li>
                  </ul>
                  
                  <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-400/30">
                    <p className="text-white/90 font-semibold mb-2">Distribución:</p>
                    <ul className="text-sm text-white/70 space-y-1">
                      <li>• 60%: Venta directa (ingresos recurrentes)</li>
                      <li>• 25%: Recompensas por referidos y actividades</li>
                      <li>• 10%: Eventos especiales y promociones</li>
                      <li>• 5%: Reserva para desarrollo y marketing</li>
                    </ul>
                  </div>
                </div>

                {/* Token GTK */}
                <div className="p-6 bg-white/10 rounded-xl border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <Rocket className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Token GTK</h3>
                  </div>
                  <p className="text-white/80 mb-4 text-lg">La Inversión con Futuro Blockchain - Suministro Limitado</p>
                  <ul className="space-y-2 text-white/70">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Token de Staking para ingresos pasivos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Próxima integración blockchain (Q2-Q4 2026)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>APY: 8-18% según duración de staking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Potencial de apreciación a largo plazo</span>
                    </li>
                  </ul>
                  
                  <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-400/30">
                    <p className="text-white/90 font-semibold mb-2">Roadmap Blockchain:</p>
                    <ul className="text-sm text-white/70 space-y-1">
                      <li>• Q2 2026: Preparación y auditoría</li>
                      <li>• Q3 2026: IDO en Uniswap/PancakeSwap</li>
                      <li>• Q4 2026: Funcionalidades blockchain completas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Modelo de Ingresos */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                Modelo de Ingresos Proyectado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    year: "Año 1 (2026)",
                    cmpx: "$500,000",
                    subscriptions: "$200,000",
                    total: "$700,000",
                    color: "from-blue-500/20 to-cyan-500/20"
                  },
                  {
                    year: "Año 2 (2027)",
                    cmpx: "$2,000,000",
                    subscriptions: "$800,000",
                    staking: "$100,000",
                    total: "$2,900,000",
                    color: "from-purple-500/20 to-pink-500/20"
                  },
                  {
                    year: "Año 3 (2028)",
                    cmpx: "$5,000,000",
                    subscriptions: "$2,000,000",
                    blockchain: "$500,000",
                    total: "$7,500,000",
                    color: "from-green-500/20 to-emerald-500/20"
                  }
                ].map((projection, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className={`p-6 rounded-xl border border-white/20 bg-gradient-to-br ${projection.color} backdrop-blur-sm`}
                  >
                    <h4 className="text-xl font-bold text-white mb-4">{projection.year}</h4>
                    <div className="space-y-2 text-white/80">
                      <div className="flex justify-between">
                        <span>Venta CMPX:</span>
                        <span className="font-bold text-white">{projection.cmpx}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Suscripciones:</span>
                        <span className="font-bold text-white">{projection.subscriptions}</span>
                      </div>
                      {projection.staking && (
                        <div className="flex justify-between">
                          <span>Comisiones Staking:</span>
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
        </motion.section>

        {/* Tecnología de Vanguardia */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                Tecnología de Vanguardia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-400" />
                    Arquitectura Empresarial
                  </h4>
                  <ul className="space-y-2 text-white/80">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span><strong>107 tablas</strong> optimizadas para escalabilidad masiva</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span><strong>122 políticas RLS</strong> de seguridad multicapa</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Google S2 Geosharding</strong> - Consultas 50-300x más rápidas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Neo4j Graph Database</strong> - 200x más rápido en queries sociales</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Monitoreo en tiempo real</strong> con Sentry, New Relic, Datadog</span>
                      </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-400" />
                    Inteligencia Artificial Integrada
                  </h4>
                  <ul className="space-y-2 text-white/80">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span><strong>ML Compatibility Scoring</strong> - 400K parámetros</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Chat Summaries ML</strong> - GPT-4, BART, Fallback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Aprendizaje continuo</strong> - Mejora con cada interacción</span>
                    </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Hybrid scoring</strong> - AI + legacy fallback</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Verificador IA de Consentimiento</strong> - Detección proactiva en chats (Ley Olimpia)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Matching Predictivo con Graphs</strong> - Neo4j + IA para conexiones emocionales</span>
                      </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Ventajas para Inversores */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Card className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
                Ventajas para Inversores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Token GTK con Potencial de Apreciación",
                    desc: "Suministro limitado = escasez = valor creciente. Staking genera ingresos pasivos.",
                    icon: <TrendingUp className="h-6 w-6" />,
                    color: "from-green-500 to-emerald-600"
                  },
                  {
                    title: "Economía Dual Sostenible",
                    desc: "CMPX genera ingresos recurrentes. GTK crea comunidad de inversores a largo plazo.",
                    icon: <Coins className="h-6 w-6" />,
                    color: "from-blue-500 to-cyan-600"
                  },
                  {
                    title: "Primeros Mover Advantage",
                    desc: "Primera plataforma social en México con token nativo. 40M+ usuarios potenciales.",
                    icon: <Rocket className="h-6 w-6" />,
                    color: "from-purple-500 to-pink-600"
                  },
                  {
                    title: "Diversificación de Ingresos",
                    desc: "Múltiples flujos: tokens, blockchain, NFTs, eventos. Resiliente a cambios.",
                    icon: <BarChart3 className="h-6 w-6" />,
                    color: "from-orange-500 to-red-600"
                  }
                ].map((advantage, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-6 bg-white/10 rounded-xl border border-white/20 hover:border-purple-400/50 transition-all duration-300"
                  >
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${advantage.color} text-white mb-4`}>
                      {advantage.icon}
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3">{advantage.title}</h4>
                    <p className="text-white/70 leading-relaxed">{advantage.desc}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Estado del Proyecto */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                Estado del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/90 font-semibold">Completitud General</span>
                  <span className="text-2xl font-bold text-green-400">~85%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Áreas Completadas ✅</h4>
                  <ul className="space-y-2 text-white/80">
                    {[
                      "Arquitectura base (100%)",
                      "Sistema de autenticación y seguridad (100%)",
                      "Base de datos y backend (100%) - 107 tablas, 122 RLS",
                      "Sistema de matching con IA + Neo4j (100%)",
                      "Chat en tiempo real con verificación IA (100%)",
                      "Sistema de perfiles + Galerías NFT (100%)",
                      "Panel administrativo (95%)",
                      "Monitoreo y analytics (95%)",
                      "4 Features Innovadoras (100%)",
                      "Neo4j Graph Database (100%)"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Métricas Técnicas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Tablas DB", value: "107" },
                      { label: "Políticas RLS", value: "122" },
                      { label: "Índices", value: "209" },
                      { label: "Triggers", value: "35" },
                      { label: "Tests Passing", value: "100%" },
                      { label: "QA Score", value: "87/100" }
                    ].map((metric, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10 text-center">
                        <div className="text-2xl font-bold text-white">{metric.value}</div>
                        <div className="text-xs text-white/70 mt-1">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Próximas Funcionalidades */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                Próximas Funcionalidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                    {
                      period: "Corto Plazo (3-6 meses)",
                      items: [
                        "Video Chat en tiempo real con WebRTC",
                        "Mapas Interactivos con S2 Geohashing",
                        "Sistema de Regalos Virtuales ampliado",
                        "Analytics Personalizados",
                        "Dashboard de Neo4j Graph Analytics"
                      ],
                      color: "from-blue-500/20 to-cyan-500/20"
                    },
                    {
                      period: "Mediano Plazo (6-12 meses)",
                      items: [
                        "Asistente Virtual Avanzado con IA",
                        "App iOS Nativa",
                        "Expansión Internacional",
                        "Suscripciones Premium exclusivas",
                        "Integración completa de blockchain (GTK)"
                      ],
                      color: "from-purple-500/20 to-pink-500/20"
                    },
                  {
                    period: "Largo Plazo (12+ meses)",
                    items: [
                      "Red Social Expandida",
                      "Eventos en Vivo con Streaming",
                      "Contenido Original educativo",
                      "Ecosistema Completo integrado"
                    ],
                    color: "from-green-500/20 to-emerald-500/20"
                  }
                ].map((roadmap, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 + idx * 0.1 }}
                    className={`p-6 rounded-xl border border-white/20 bg-gradient-to-br ${roadmap.color} backdrop-blur-sm`}
                  >
                    <h4 className="text-xl font-bold text-white mb-4">{roadmap.period}</h4>
                    <ul className="space-y-2">
                      {roadmap.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2 text-white/80">
                          <ArrowRight className="h-4 w-4 text-purple-400 flex-shrink-0 mt-1" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Valores y Principios */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          <Card className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                Valores y Principios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Privacidad Primero",
                    desc: "Tus datos son tuyos. Control total sobre quién te ve y te contacta. Transparencia en el manejo de información.",
                    icon: <Lock className="h-6 w-6" />,
                    color: "from-blue-500 to-cyan-600"
                  },
                  {
                    title: "Seguridad Garantizada",
                    desc: "Verificación de identidad, moderación activa y sistema de reportes efectivo para una experiencia segura.",
                    icon: <Shield className="h-6 w-6" />,
                    color: "from-green-500 to-emerald-600"
                  },
                  {
                    title: "Comunidad Respetuosa",
                    desc: "Zero tolerancia a acoso. Ambiente seguro y discreto. Conexiones consensuadas y auténticas.",
                    icon: <Users className="h-6 w-6" />,
                    color: "from-purple-500 to-pink-600"
                  },
                  {
                    title: "Innovación Continua",
                    desc: "Mejoras constantes basadas en tecnología de punta. Feedback de usuarios integrado al desarrollo.",
                    icon: <Zap className="h-6 w-6" />,
                    color: "from-orange-500 to-red-600"
                  }
                ].map((value, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + idx * 0.1 }}
                    className="p-6 bg-white/10 rounded-xl border border-white/20 hover:border-purple-400/50 transition-all duration-300"
                  >
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${value.color} text-white mb-4`}>
                      {value.icon}
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3">{value.title}</h4>
                    <p className="text-white/70 leading-relaxed">{value.desc}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Oportunidad de Inversión */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                ¿Por qué ComplicesConecta?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Mercado en Crecimiento",
                    points: [
                      "Mercado de apps sociales para adultos en expansión global",
                      "México: 40M+ usuarios potenciales",
                      "Creciente demanda de plataformas seguras y verificadas",
                      "Mercado blockchain social: $50B+ proyectado para 2026"
                    ],
                    icon: <TrendingUp className="h-6 w-6" />,
                    color: "from-green-500 to-emerald-600"
                  },
                  {
                    title: "Tecnología Diferenciadora",
                    points: [
                      "Primera plataforma en México con IA nativa integrada",
                      "Sistema de privacidad más avanzado del mercado",
                      "Arquitectura preparada para escalar masivamente",
                      "Primera plataforma social en México con economía tokenizada"
                    ],
                    icon: <Brain className="h-6 w-6" />,
                    color: "from-blue-500 to-purple-600"
                  },
                  {
                    title: "Economía Tokenizada Innovadora",
                    points: [
                      "Token GTK con potencial de apreciación (suministro limitado)",
                      "Token CMPX para ingresos recurrentes",
                      "Modelo probado: inspirado en Axie Infinity, The Sandbox",
                      "Roadmap blockchain claro: Q2-Q4 2026"
                    ],
                    icon: <Coins className="h-6 w-6" />,
                    color: "from-yellow-500 to-orange-600"
                  },
                  {
                    title: "Posicionamiento Estratégico",
                    points: [
                      "Enfoque en calidad sobre cantidad",
                      "Comunidad exclusiva y verificada",
                      "Discreción y seguridad como pilares",
                      "Primeros mover advantage en espacio blockchain social México"
                    ],
                    icon: <Star className="h-6 w-6" />,
                    color: "from-purple-500 to-pink-600"
                  }
                ].map((reason, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5 + idx * 0.1 }}
                    className="p-6 bg-white/10 rounded-xl border border-white/20 hover:border-purple-400/50 transition-all duration-300"
                  >
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${reason.color} text-white mb-4`}>
                      {reason.icon}
                    </div>
                    <h4 className="text-xl font-bold text-white mb-4">{reason.title}</h4>
                    <ul className="space-y-2">
                      {reason.points.map((point, pointIdx) => (
                        <li key={pointIdx} className="flex items-start gap-2 text-white/80 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Call to Action Final */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="text-center pt-8"
        >
          <Card className="bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30 backdrop-blur-xl border-purple-400/30 shadow-2xl">
            <CardContent className="p-12">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-flex p-4 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl mb-6"
              >
                <Award className="h-12 w-12 text-white" />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                ¿Interesado en Invertir?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Únete a nosotros en esta emocionante jornada. Estamos abiertos a conversaciones 
                con inversores estratégicos que compartan nuestra visión.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  onClick={() => window.location.href = 'mailto:complicesconectasw@outlook.es?subject=Consulta de Inversión - ComplicesConecta'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-10 py-4 text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Contactar para Inversión
                </Button>
                <Button
                  onClick={() => navigate('/news')}
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-4 text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Ver Novedades
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>complicesconectasw@outlook.es</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>complicesconecta.com</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Sección Legal */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                Información Legal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 mb-6 text-center text-lg">
                ComplicesConecta opera bajo estricto cumplimiento del marco legal mexicano e internacional. 
                Consulta nuestra documentación legal para más información sobre términos, privacidad y cumplimiento normativo.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  onClick={() => navigate('/legal')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Marco Legal Completo
                </Button>
                <Button
                  onClick={() => navigate('/terms')}
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Términos de Servicio
                </Button>
                <Button
                  onClick={() => navigate('/privacy')}
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Política de Privacidad
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};

export default Investors;

