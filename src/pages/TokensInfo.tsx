import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  UserPlus, 
  Coins, 
  Shield, 
  Gift, 
  TrendingUp, 
  Lock, 
  Unlock,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Users,
  Calendar,
  FileText,
  Scale,
  Globe,
  DollarSign,
  Rocket,
  Building2,
  Target,
  BarChart3,
  Heart,
  Video,
  MessageSquare,
  Crown,
  Ticket,
  Sparkles,
  Award,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TOKEN_CONFIG } from '@/lib/tokens';
import HeaderNav from "@/components/HeaderNav";
import Navigation from "@/components/Navigation";
import { useAuth } from '@/hooks/useAuth';
import { DecorativeHearts } from '@/components/DecorativeHearts';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { useTokens } from '@/hooks/useTokens';
import { TokenAnalyticsService } from '@/services/TokenAnalyticsService';
import { useEffect, useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'security' | 'rewards' | 'premium' | 'blockchain' | 'investors';
}

const faqData: FAQItem[] = [
  {
    question: "¿Qué son los tokens CMPX?",
    answer: "Los CMPX son tokens internos de ComplicesConecta que puedes ganar participando en la comunidad. Durante la fase beta funcionan off-chain y en el futuro se convertirán en tokens GTK en blockchain.",
    category: "general"
  },
  {
    question: "¿Cómo gano tokens CMPX?",
    answer: "Actualmente puedes ganar 50 CMPX por cada amigo que invites exitosamente, más 50 CMPX de bienvenida cuando uses un código de referido válido.",
    category: "rewards"
  },
  {
    question: "¿Cuál es el límite mensual?",
    answer: "Puedes ganar máximo 500 CMPX por mes. Este límite se resetea automáticamente el primer día de cada mes.",
    category: "rewards"
  },
  {
    question: "¿Los tokens son seguros?",
    answer: "Sí, el sistema tiene múltiples capas de seguridad: validación de códigos, prevención de auto-referidos, límites mensuales y auditoría de transacciones.",
    category: "security"
  },
  {
    question: "¿Qué son los tokens GTK?",
    answer: "GTK son tokens blockchain (ERC20) que representarán el valor real de CMPX en el futuro. Durante la beta están pausados y se activarán en la versión de producción.",
    category: "blockchain"
  },
  {
    question: "¿Para qué sirven los tokens?",
    answer: "Los tokens te darán acceso a funciones premium, eventos VIP, contenido exclusivo y beneficios especiales en la comunidad (disponible después de la beta).",
    category: "premium"
  },
  {
    question: "¿Puedo transferir mis tokens?",
    answer: "Durante la beta, los CMPX son internos y no transferibles. Cuando se activen los GTK en blockchain, podrás transferirlos libremente.",
    category: "security"
  },
  {
    question: "¿Qué es World ID y cómo funciona?",
    answer: "World ID es un sistema de verificación de identidad humana desarrollado por Worldcoin. Próximamente podrás verificar tu identidad y ganar 100 CMPX adicionales. Utiliza tecnología blockchain para garantizar privacidad y seguridad.",
    category: "security"
  },
  {
    question: "¿Cuándo estará disponible World ID?",
    answer: "La integración con World ID está en desarrollo y se activará próximamente. Te notificaremos cuando esté disponible para que puedas verificar tu identidad y obtener las recompensas.",
    category: "general"
  },
  {
    question: "¿Qué pasa si encuentro un error?",
    answer: "Reporta cualquier problema a través del soporte. Todas las transacciones están auditadas y podemos corregir errores legítimos.",
    category: "security"
  }
];

interface TokenGlobalStats {
  totalCirculation: number;
  locked: number;
  globalStaking: number;
  monthlyRelease: number;
  available: number;
}

export default function TokensInfo() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSection, setActiveSection] = useState<'general' | 'investors' | 'blockchain'>('general');
  const [globalStats, setGlobalStats] = useState<TokenGlobalStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Determinar si hay sesión activa para mostrar Navigation o HeaderNav
  const hasActiveSession = isAuthenticated();
  
  // Cargar estadísticas globales
  useEffect(() => {
    const loadGlobalStats = async () => {
      try {
        setLoadingStats(true);
        const analytics = TokenAnalyticsService.getInstance();
        const metrics = await analytics.generateCurrentMetrics();
        
        // Calcular estadísticas globales
        const stats: TokenGlobalStats = {
          totalCirculation: metrics.circulatingSupply.cmpx,
          locked: metrics.totalSupply.cmpx - metrics.circulatingSupply.cmpx,
          globalStaking: metrics.stakingMetrics.totalStaked,
          monthlyRelease: 50000, // Valor estimado de liberación mensual
          available: metrics.circulatingSupply.cmpx - metrics.stakingMetrics.totalStaked
        };
        
        setGlobalStats(stats);
      } catch (error) {
        console.error('Error cargando estadísticas globales:', error);
        // Valores por defecto en caso de error
        setGlobalStats({
          totalCirculation: 0,
          locked: 0,
          globalStaking: 0,
          monthlyRelease: 0,
          available: 0
        });
      } finally {
        setLoadingStats(false);
      }
    };
    
    loadGlobalStats();
  }, []);

  const filteredFAQ = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  // Precios de compra CMPX
  const cmpxPricing = [
    { amount: 100, price: 20, currency: 'MXN', discount: 0, pricePerToken: 0.20 },
    { amount: 500, price: 90, currency: 'MXN', discount: 10, pricePerToken: 0.18 },
    { amount: 1000, price: 160, currency: 'MXN', discount: 20, pricePerToken: 0.16 },
    { amount: 2500, price: 350, currency: 'MXN', discount: 30, pricePerToken: 0.14 },
    { amount: 5000, price: 600, currency: 'MXN', discount: 40, pricePerToken: 0.12 }
  ];

  // Casos de uso CMPX con precios
  const cmpxUseCases = [
    { name: 'Super Like', icon: <Heart className="h-5 w-5" />, cost: 10, description: 'Destaca tu like entre otros usuarios' },
    { name: 'Boost de Perfil', icon: <Rocket className="h-5 w-5" />, cost: 50, description: 'Aparece más en Discover por 24 horas' },
    { name: 'Regalo Virtual (Básico)', icon: <Gift className="h-5 w-5" />, cost: 50, description: 'Envía flores, chocolates virtuales' },
    { name: 'Regalo Virtual (Premium)', icon: <Gift className="h-5 w-5" />, cost: 200, description: 'Regalos personalizados y exclusivos' },
    { name: 'Regalo Virtual (Lujo)', icon: <Crown className="h-5 w-5" />, cost: 500, description: 'Regalos premium con efectos especiales' },
    { name: 'Video Llamada (15 min)', icon: <Video className="h-5 w-5" />, cost: 75, description: 'Sesión de video chat en tiempo real' },
    { name: 'Video Llamada (30 min)', icon: <Video className="h-5 w-5" />, cost: 120, description: 'Sesión extendida de video chat' },
    { name: 'Video Llamada (60 min)', icon: <Video className="h-5 w-5" />, cost: 200, description: 'Sesión premium de video chat' },
    { name: 'Evento VIP (Entrada)', icon: <Ticket className="h-5 w-5" />, cost: 200, description: 'Acceso a evento exclusivo' },
    { name: 'Evento VIP (Premium)', icon: <Crown className="h-5 w-5" />, cost: 500, description: 'Acceso VIP con beneficios extra' },
    { name: 'Evento VIP (Lujo)', icon: <Sparkles className="h-5 w-5" />, cost: 1000, description: 'Acceso exclusivo con todos los beneficios' },
    { name: 'Desbloquear Galería Privada', icon: <Lock className="h-5 w-5" />, cost: 100, description: 'Acceso temporal a contenido exclusivo' },
    { name: 'Chat Premium (30 días)', icon: <MessageSquare className="h-5 w-5" />, cost: 100, description: 'Mensajes ilimitados y funciones avanzadas' },
    { name: 'Filtros Avanzados (30 días)', icon: <Zap className="h-5 w-5" />, cost: 75, description: 'Búsquedas más precisas' },
    { name: 'Likes Ilimitados (30 días)', icon: <Heart className="h-5 w-5" />, cost: 50, description: 'Sin límites en conexiones diarias' }
  ];

  // Staking GTK - Opciones
  const stakingOptions = [
    { duration: 90, apy: 8, minTokens: 100, penalty: 5 },
    { duration: 180, apy: 12, minTokens: 100, penalty: 5 },
    { duration: 365, apy: 18, minTokens: 100, penalty: 5 }
  ];

  // Distribución de tokens
  const gtkDistribution = [
    { category: 'Venta Pública (ICO/IDO)', percentage: 40, description: 'Para inversores y usuarios tempranos', tokens: '2,000,000 GTK (ejemplo)' },
    { category: 'Staking Rewards Pool', percentage: 20, description: 'Recompensas para stakers a largo plazo', tokens: '1,000,000 GTK' },
    { category: 'Team y Desarrollo', percentage: 15, description: 'Vesting de 3 años para el equipo', tokens: '750,000 GTK' },
    { category: 'Liquidez en Exchanges', percentage: 10, description: 'DEX/CEX para comercio', tokens: '500,000 GTK' },
    { category: 'Marketing y Partnerships', percentage: 10, description: 'Alianzas estratégicas y promociones', tokens: '500,000 GTK' },
    { category: 'Reserva de Emergencias', percentage: 5, description: 'Desarrollo futuro y contingencia', tokens: '250,000 GTK' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 relative overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/95 to-purple-800/95 backdrop-blur-xl border-b border-white/30 shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/tokens')}
              className="text-white hover:bg-white/20 flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Regresar a Tokens</span>
              <span className="sm:hidden">Regresar</span>
            </Button>
            
            <h1 className="text-lg sm:text-xl font-bold text-white text-center">Guía Completa de Tokens</h1>
            
            <Button
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105"
            >
              <span className="hidden sm:inline">Inicio</span>
              <span className="sm:hidden">🏠</span>
            </Button>
          </div>
        </div>
      </div>

      <DecorativeHearts count={8} />

      <div className="container mx-auto px-4 py-8 space-y-8 pb-20 relative z-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-500 rounded-full mb-6 shadow-2xl">
            <Coins className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Sistema de Tokens
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400">
              CMPX & GTK
            </span>
          </h1>
          
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Economía digital dual: <strong className="text-purple-300">CMPX</strong> para consumo dentro de la app y 
            <strong className="text-blue-300"> GTK</strong> para staking e inversión en blockchain.
          </p>

          {/* Tabs para cambiar entre secciones */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Button
              onClick={() => setActiveSection('general')}
              className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                activeSection === 'general' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Público General
            </Button>
            <Button
              onClick={() => setActiveSection('investors')}
              className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                activeSection === 'investors' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
              }`}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Para Inversores
            </Button>
            <Button
              onClick={() => setActiveSection('blockchain')}
              className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                activeSection === 'blockchain' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
              }`}
            >
              <Globe className="h-4 w-4 mr-2" />
              Blockchain Roadmap
            </Button>
          </div>
        </motion.div>

        {/* SECCIÓN: PÚBLICO GENERAL */}
        {activeSection === 'general' && (
          <div className="space-y-8">
            {/* Token CMPX - Moneda de Consumo */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  Token CMPX: La Moneda de Consumo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Características</h3>
                    <ul className="space-y-2 text-white/80">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Suministro Ilimitado:</strong> Diseñado para transacciones diarias</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Compra Directa:</strong> Adquiere con dinero real (MXN, USD, criptomonedas)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Uso Inmediato:</strong> Para funciones premium dentro de la app</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Transferible:</strong> Envía tokens como regalo entre usuarios</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Obtención de CMPX</h3>
                    <ul className="space-y-2 text-white/80">
                      <li className="flex items-start gap-2">
                        <Gift className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Referidos:</strong> 50 CMPX por cada amigo invitado (límite 500/mes)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span><strong>World ID:</strong> 100 CMPX por verificación</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <UserPlus className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Completar Perfil:</strong> 25 CMPX</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Login Diario:</strong> 5 CMPX</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <DollarSign className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Compra Directa:</strong> Ver precios abajo</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Precios de Compra */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-white mb-4">💳 Precios de Compra de CMPX</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cmpxPricing.map((pkg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl border border-white/20 hover:border-purple-400/50 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-2xl font-bold text-white">{pkg.amount} CMPX</div>
                          {pkg.discount > 0 && (
                            <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                              -{pkg.discount}%
                            </Badge>
                          )}
                        </div>
                        <div className="text-3xl font-black text-purple-300 mb-2">
                          ${pkg.price} {pkg.currency}
                        </div>
                        <div className="text-sm text-white/70">
                          ${pkg.pricePerToken.toFixed(2)} por token
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Casos de Uso Detallados */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-white mb-4">🎯 ¿Para Qué Puedo Usar CMPX?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cmpxUseCases.map((useCase, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-purple-400/50 transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-purple-400 group-hover:scale-110 transition-transform">
                            {useCase.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{useCase.name}</div>
                            <div className="text-purple-300 font-bold">{useCase.cost} CMPX</div>
                          </div>
                        </div>
                        <p className="text-sm text-white/70">{useCase.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Distribución de CMPX */}
                <div className="mt-6 p-6 bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-xl border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4">📊 Distribución de CMPX</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    {[
                      { label: 'Venta Directa', percentage: 60, color: 'from-blue-500 to-cyan-600' },
                      { label: 'Recompensas', percentage: 25, color: 'from-purple-500 to-pink-600' },
                      { label: 'Eventos Especiales', percentage: 10, color: 'from-yellow-500 to-orange-600' },
                      { label: 'Desarrollo/Marketing', percentage: 5, color: 'from-green-500 to-emerald-600' }
                    ].map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${item.color} mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg`}>
                          {item.percentage}%
                        </div>
                        <div className="text-white/80 text-sm">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token GTK - Staking e Inversión */}
            <Card className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                    <Rocket className="h-6 w-6 text-white" />
                  </div>
                  Token GTK: Staking e Inversión Blockchain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Características</h3>
                    <ul className="space-y-2 text-white/80">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Suministro Limitado:</strong> Cantidad fija predefinida</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Token de Staking:</strong> Diseñado para ingresos pasivos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Blockchain ERC-20:</strong> Ethereum/Polygon</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Gobernanza DAO:</strong> Votación en decisiones (futuro)</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Opciones de Staking</h3>
                    <div className="space-y-3">
                      {stakingOptions.map((option, idx) => (
                        <div key={idx} className="p-4 bg-white/10 rounded-lg border border-white/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-semibold">{option.duration} días</span>
                            <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-400/30">
                              {option.apy}% APY
                            </Badge>
                          </div>
                          <div className="text-sm text-white/70">
                            Mínimo: {option.minTokens} GTK • Penalización: {option.penalty}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ejemplo de Staking */}
                <div className="mt-6 p-6 bg-white/10 rounded-xl border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4">💡 Ejemplo Práctico de Staking</h3>
                  <div className="space-y-3 text-white/90">
                    <p><strong>Usuario invierte en GTK:</strong></p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>Compra 1,000 GTK tokens</li>
                      <li>Selecciona "Staking" en el panel de tokens</li>
                      <li>Elige duración: 365 días</li>
                      <li>APY: 18% anual</li>
                      <li>Después del período, recibe: <strong className="text-green-300">1,000 GTK (capital) + 180 GTK (intereses) = 1,180 GTK</strong></li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SECCIÓN: PARA INVERSORES */}
        {activeSection === 'investors' && (
          <div className="space-y-8">
            {/* Información Técnica para Inversores */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  Información para Inversores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Token CMPX - Economía de Consumo</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="text-white/70 text-sm mb-1">Suministro</div>
                        <div className="text-white font-bold text-lg">Ilimitado</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="text-white/70 text-sm mb-1">Modelo</div>
                        <div className="text-white font-bold text-lg">Ingresos Recurrentes</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="text-white/70 text-sm mb-1">Distribución Principal</div>
                        <div className="text-white font-bold text-lg">60% Venta Directa</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Token GTK - Economía de Inversión</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="text-white/70 text-sm mb-1">Suministro</div>
                        <div className="text-white font-bold text-lg">Limitado (5M GTK aprox.)</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="text-white/70 text-sm mb-1">Modelo</div>
                        <div className="text-white font-bold text-lg">Inversión a Largo Plazo</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="text-white/70 text-sm mb-1">Distribución Principal</div>
                        <div className="text-white font-bold text-lg">40% Venta Pública</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Distribución Detallada de GTK */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-white mb-4">📊 Distribución Detallada de GTK en Blockchain</h3>
                  <div className="space-y-3">
                    {gtkDistribution.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-lg border border-white/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                              {item.percentage}%
                            </div>
                            <div>
                              <div className="font-semibold text-white">{item.category}</div>
                              <div className="text-sm text-white/70">{item.description}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-purple-300 font-bold">{item.tokens}</div>
                          </div>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Equipo y Desarrollo */}
                <div className="mt-6 p-6 bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-xl border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4">👥 Equipo y Desarrollo</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/10 rounded-lg">
                      <div className="text-white/70 text-sm mb-1">Porcentaje Total</div>
                      <div className="text-white font-bold text-2xl">15%</div>
                      <div className="text-white/70 text-sm mt-1">Team & Desarrollo</div>
                    </div>
                    <div className="p-4 bg-white/10 rounded-lg">
                      <div className="text-white/70 text-sm mb-1">Vesting Period</div>
                      <div className="text-white font-bold text-2xl">3 años</div>
                      <div className="text-white/70 text-sm mt-1">Distribución gradual</div>
                    </div>
                    <div className="p-4 bg-white/10 rounded-lg">
                      <div className="text-white/70 text-sm mb-1">Distribución Mensual</div>
                      <div className="text-white font-bold text-2xl">~2.78%</div>
                      <div className="text-white/70 text-sm mt-1">Durante 36 meses</div>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mt-4">
                    <strong>Nota:</strong> El equipo recibe tokens mediante un sistema de vesting de 3 años para 
                    asegurar compromiso a largo plazo y alinear intereses con los inversores.
                  </p>
                </div>

                {/* Roadmap Blockchain */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-white mb-4">🗓️ Roadmap Blockchain (Q2-Q4 2026)</h3>
                  <div className="space-y-4">
                    {[
                      { 
                        phase: 'Fase 1: Preparación (Q2 2026)',
                        items: [
                          'Auditoría de smart contracts',
                          'Listing en CoinGecko/CoinMarketCap',
                          'KYC/AML compliance',
                          'Desarrollo de DApp'
                        ]
                      },
                      { 
                        phase: 'Fase 2: Lanzamiento GTK (Q3 2026)',
                        items: [
                          'IDO en Uniswap/PancakeSwap',
                          'Hard Cap: 2,000,000 GTK',
                          'Soft Cap: 500,000 GTK',
                          'Listing en exchanges (Binance, Coinbase)'
                        ]
                      },
                      { 
                        phase: 'Fase 3: Funcionalidades (Q4 2026)',
                        items: [
                          'Bridge CMPX → GTK',
                          'NFTs de perfiles verificados',
                          'DAO para gobernanza',
                          'Multi-chain (Polygon, Arbitrum, Optimism)'
                        ]
                      }
                    ].map((phase, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.2 }}
                        className="p-6 bg-white/10 rounded-xl border border-white/20"
                      >
                        <h4 className="text-lg font-semibold text-white mb-3">{phase.phase}</h4>
                        <ul className="space-y-2">
                          {phase.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-2 text-white/80">
                              <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-1" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Modelo de Ingresos Proyectado */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-white mb-4">💰 Modelo de Ingresos Proyectado</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { 
                        year: 'Año 1 (2026)',
                        cmpx: '$500,000',
                        subscriptions: '$200,000',
                        total: '$700,000'
                      },
                      { 
                        year: 'Año 2 (2027)',
                        cmpx: '$2,000,000',
                        subscriptions: '$800,000',
                        staking: '$100,000',
                        total: '$2,900,000'
                      },
                      { 
                        year: 'Año 3 (2028)',
                        cmpx: '$5,000,000',
                        subscriptions: '$2,000,000',
                        blockchain: '$500,000',
                        total: '$7,500,000'
                      }
                    ].map((projection, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl border border-white/20"
                      >
                        <h4 className="text-lg font-bold text-white mb-4">{projection.year}</h4>
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
                            <span className="text-2xl font-black text-green-300">{projection.total}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SECCIÓN: BLOCKCHAIN ROADMAP */}
        {activeSection === 'blockchain' && (
          <div className="space-y-8">
            {/* Migración a Blockchain */}
            <Card className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  Migración a Blockchain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-white/10 rounded-xl border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4">🔄 Conversión CMPX → GTK</h3>
                  <div className="space-y-4">
                    <p className="text-white/90 leading-relaxed">
                      Cuando se lance la blockchain en Q4 2026, los usuarios podrán convertir sus CMPX acumulados 
                      a GTK mediante un <strong className="text-purple-300">bridge automático</strong>. La tasa de conversión 
                      será determinada antes del lanzamiento y anunciada públicamente.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg border border-blue-400/30">
                        <div className="text-blue-300 font-bold text-sm mb-2">ANTES (Beta)</div>
                        <div className="text-white font-semibold">CMPX Off-Chain</div>
                        <ul className="text-white/70 text-sm mt-2 space-y-1">
                          <li>• Tokens internos</li>
                          <li>• No transferibles</li>
                          <li>• Solo uso en app</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg border border-purple-400/30">
                        <div className="text-purple-300 font-bold text-sm mb-2">DESPUÉS (Blockchain)</div>
                        <div className="text-white font-semibold">GTK On-Chain</div>
                        <ul className="text-white/70 text-sm mt-2 space-y-1">
                          <li>• Token ERC-20</li>
                          <li>• Transferible libremente</li>
                          <li>• Staking y gobernanza</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gobernanza DAO */}
                <div className="mt-6 p-6 bg-white/10 rounded-xl border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4">🏛️ Gobernanza Descentralizada (DAO)</h3>
                  <div className="space-y-4">
                    <p className="text-white/90 leading-relaxed">
                      Los holders de GTK tendrán derecho a votar en decisiones importantes de la plataforma a través 
                      de un sistema de gobernanza descentralizada (DAO).
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-white">Votaciones Propuestas</h4>
                        <ul className="space-y-2 text-white/80">
                          <li className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-purple-400 flex-shrink-0 mt-1" />
                            <span>Cambios en funcionalidades de la plataforma</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-purple-400 flex-shrink-0 mt-1" />
                            <span>Distribución de fondos del treasury</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-purple-400 flex-shrink-0 mt-1" />
                            <span>Parámetros de staking (APY, duraciones)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-purple-400 flex-shrink-0 mt-1" />
                            <span>Nuevas integraciones blockchain</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold text-white">Sistema de Votación</h4>
                        <ul className="space-y-2 text-white/80">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-1" />
                            <span><strong>1 GTK = 1 Voto</strong></span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-1" />
                            <span>Votación por peso de tokens</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-1" />
                            <span>Período de votación: 7 días</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-1" />
                            <span>Mínimo de participación: 10% de supply</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Multi-chain */}
                <div className="mt-6 p-6 bg-white/10 rounded-xl border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4">🌐 Multi-Chain Strategy</h3>
                  <p className="text-white/90 leading-relaxed mb-4">
                    ComplicesConecta planea expandirse a múltiples blockchains para maximizar accesibilidad y reducir costos.
                  </p>
                  <div className="grid md:grid-cols-4 gap-4">
                    {[
                      { name: 'Ethereum', status: 'Principal', color: 'from-blue-500 to-cyan-600' },
                      { name: 'Polygon', status: 'Bajo costo', color: 'from-purple-500 to-pink-600' },
                      { name: 'Arbitrum', status: 'Optimizado', color: 'from-cyan-500 to-blue-600' },
                      { name: 'Optimism', status: 'Rápido', color: 'from-orange-500 to-red-600' }
                    ].map((chain, idx) => (
                      <div key={idx} className={`p-4 rounded-lg bg-gradient-to-r ${chain.color} text-white text-center`}>
                        <div className="font-bold text-lg mb-1">{chain.name}</div>
                        <div className="text-sm opacity-90">{chain.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Cards (siempre visible) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-green-900/80 to-blue-900/80 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <Gift className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{TOKEN_CONFIG.REFERRAL_REWARD}</div>
              <div className="text-white/70">CMPX por referido</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-900/80 to-purple-800/80 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{TOKEN_CONFIG.MONTHLY_LIMIT}</div>
              <div className="text-white/70">CMPX límite mensual</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-900/80 to-red-900/80 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-orange-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">18%</div>
              <div className="text-white/70">APY máximo (GTK)</div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Preguntas Frecuentes</CardTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              {['all', 'general', 'rewards', 'security', 'premium', 'blockchain', 'investors'].map(cat => (
                <Button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs h-9 rounded-md px-3 ${
                    selectedCategory === cat 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                      : 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {cat === 'all' ? 'Todas' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredFAQ.map((item, index) => (
              <div
                key={index}
                className="border border-white/10 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-4 text-left hover:bg-white/5 transition-colors flex items-center justify-between"
                >
                  <span className="text-white font-medium">{item.question}</span>
                  {expandedFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-white/60" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-white/60" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="p-4 pt-0 text-white/80 border-t border-white/10">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Legal Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            onClick={() => navigate('/tokens-terms')}
            className="border-white/20 text-white hover:bg-white/10 border backdrop-blur-sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Términos y Condiciones
          </Button>
          <Button
            onClick={() => navigate('/tokens-privacy')}
            className="border-white/20 text-white hover:bg-white/10 border backdrop-blur-sm"
          >
            <Shield className="h-4 w-4 mr-2" />
            Política de Privacidad
          </Button>
          <Button
            onClick={() => navigate('/tokens-legal')}
            className="border-white/20 text-white hover:bg-white/10 border backdrop-blur-sm"
          >
            <Scale className="h-4 w-4 mr-2" />
            Responsabilidad Legal
          </Button>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">
            ¿Listo para empezar a ganar tokens?
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Únete a ComplicesConecta, invita a tus amigos y comienza a acumular CMPX. 
            El futuro de las recompensas digitales te espera.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-11 rounded-md px-8"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Registrarse Ahora
            </Button>
            <Button
              onClick={() => navigate(-1)}
              className="border-white/20 text-white hover:bg-white/10 border h-11 rounded-md px-8"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver al Inicio
            </Button>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu - Condicional basado en autenticación */}
      {hasActiveSession ? <Navigation /> : <HeaderNav />}
    </div>
  );
}
