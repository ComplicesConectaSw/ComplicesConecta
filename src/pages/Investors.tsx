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

  const investmentTiers = [
    {
      name: "Bronze",
      investment: "$10,000 MXN",
      returns: "10%",
      tokens: "5,000 CMPX",
      equity: "-",
      vipDinner: false,
      color: "from-amber-600 to-yellow-700",
      features: [
        "Retorno garantizado 10% anual",
        "5,000 tokens CMPX",
        "Acceso a reportes trimestrales",
        "Soporte prioritario"
      ]
    },
    {
      name: "Silver",
      investment: "$25,000 MXN",
      returns: "10%",
      tokens: "15,000 CMPX",
      equity: "-",
      vipDinner: true,
      color: "from-gray-400 to-gray-600",
      features: [
        "Retorno garantizado 10% anual",
        "15,000 tokens CMPX",
        "VIP Dinner exclusivo",
        "Reportes mensuales",
        "Acceso a beta features"
      ]
    },
    {
      name: "Gold",
      investment: "$50,000 MXN",
      returns: "10%",
      tokens: "35,000 CMPX",
      equity: "0.1%",
      vipDinner: true,
      color: "from-yellow-400 to-yellow-600",
      features: [
        "Retorno garantizado 10% anual",
        "35,000 tokens CMPX",
        "0.1% equity en la empresa",
        "VIP Dinner exclusivo",
        "Acceso directo al equipo fundador"
      ]
    },
    {
      name: "Platinum",
      investment: "$100,000 MXN",
      returns: "10%",
      tokens: "80,000 CMPX",
      equity: "0.25%",
      vipDinner: true,
      color: "from-purple-400 to-purple-600",
      features: [
        "Retorno garantizado 10% anual",
        "80,000 tokens CMPX",
        "0.25% equity en la empresa",
        "VIP Dinner exclusivo",
        "Participación en decisiones estratégicas",
        "Acceso a roadmap blockchain"
      ]
    }
  ];

  const blockchainFeatures = [
    {
      icon: <Coins className="h-8 w-8" />,
      title: "Sistema Dual de Tokens",
      description: "CMPX para consumo interno y GTK para blockchain con staking y NFTs"
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "NFTs Verificados",
      description: "Galerías NFT con verificación de consentimiento y staking del 10% APY"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Seguridad Blockchain",
      description: "Contratos inteligentes auditados y almacenamiento descentralizado"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Modelo Económico",
      description: "5% fee en ventas NFT, comisiones por transacciones y staking rewards"
    }
  ];

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
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold mb-4">
              💼 OPORTUNIDAD DE INVERSIÓN SAFTE
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Invierte en el Futuro de las
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"> Conexiones Sociales</span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              La primera plataforma social en México con economía tokenizada y IA nativa integrada. 
              Sistema SAFTE con retornos garantizados del 10% anual + tokens CMPX + equity opcional.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => navigate('/auth')} 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 text-lg font-semibold"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Invertir Ahora
              </Button>
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg"
                onClick={() => document.getElementById('investment-tiers')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <FileText className="w-5 h-5 mr-2" />
                Ver Tiers de Inversión
              </Button>
            </div>
          </motion.div>

          {/* Tiers de Inversión */}
          <motion.div
            id="investment-tiers"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              Tiers de Inversión SAFTE
            </h2>
            <p className="text-lg text-white/70 text-center mb-12 max-w-2xl mx-auto">
              Simple Agreement for Future Token/Equity - Retornos garantizados con potencial de crecimiento
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {investmentTiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className={`bg-gradient-to-br ${tier.color} border-0 text-white relative overflow-hidden h-full`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <CardHeader className="relative z-10 text-center">
                      <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                      <div className="text-3xl font-bold">{tier.investment}</div>
                      <Badge className="bg-white/20 text-white border-white/30">
                        {tier.returns} Retorno Anual
                      </Badge>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Tokens CMPX:</span>
                          <span className="font-semibold">{tier.tokens}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Equity:</span>
                          <span className="font-semibold">{tier.equity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>VIP Dinner:</span>
                          <span className="font-semibold">{tier.vipDinner ? '✅' : '❌'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {tier.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-300 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                        onClick={() => navigate('/auth')}
                      >
                        Invertir en {tier.name}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Blockchain Features */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              Tecnología Blockchain Integrada
            </h2>
            <p className="text-lg text-white/70 text-center mb-12 max-w-2xl mx-auto">
              Roadmap hacia blockchain completo en Q2-Q4 2026 con tokens ERC-20 y NFTs verificados
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {blockchainFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-colors h-full">
                    <CardContent className="p-6 text-center">
                      <div className="text-purple-300 mb-4 flex justify-center">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-white/70">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* NFT Conditions */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-20"
          >
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white text-center">
                  🎨 Condiciones de NFTs Verificados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🆓</div>
                    <h4 className="font-semibold text-white mb-2">Mint Gratuito</h4>
                    <p className="text-white/70">Gratis o 100 CMPX para crear NFTs</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">💰</div>
                    <h4 className="font-semibold text-white mb-2">Fee de Venta</h4>
                    <p className="text-white/70">5% fee para la plataforma</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">📈</div>
                    <h4 className="font-semibold text-white mb-2">Staking</h4>
                    <p className="text-white/70">10% APY en tokens CMPX</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">👫</div>
                    <h4 className="font-semibold text-white mb-2">Parejas</h4>
                    <p className="text-white/70">Consentimiento doble obligatorio</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔄</div>
                    <h4 className="font-semibold text-white mb-2">Revocación</h4>
                    <p className="text-white/70">72h "derecho al olvido"</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔐</div>
                    <h4 className="font-semibold text-white mb-2">Verificación</h4>
                    <p className="text-white/70">IA de consentimiento integrada</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Final */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0 text-white">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">
                  ¿Listo para Invertir en el Futuro?
                </h2>
                <p className="text-lg mb-6 opacity-90">
                  Únete a la revolución de las conexiones sociales tokenizadas en México
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3"
                    onClick={() => navigate('/auth')}
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Comenzar Inversión
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 px-8 py-3"
                    onClick={() => window.open('mailto:inversores@complicesconecta.com')}
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Contactar Equipo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Investors;
