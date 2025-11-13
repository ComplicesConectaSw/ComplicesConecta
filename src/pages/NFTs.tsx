import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNav from '@/components/HeaderNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { DecorativeHearts } from '@/components/DecorativeHearts';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  Lock,
  Users,
  Eye,
  Star,
  Camera,
  Palette,
  Gem,
  Database,
  Verified,
  DollarSign
} from 'lucide-react';

const NFTs: React.FC = () => {
  const navigate = useNavigate();

  // Información de NFTs desde la documentación
  const nftProcess = [
    {
      step: "1. Crear Galería",
      description: "Crea una galería de fotos en tu perfil con imágenes públicas o privadas",
      icon: <Camera className="h-6 w-6" />,
      details: [
        "Sube tus imágenes favoritas",
        "Configura privacidad (pública/privada)",
        "Añade nombre y descripción",
        "Organiza tu colección"
      ]
    },
    {
      step: "2. Mint NFT",
      description: "Convierte tu galería en un NFT único en blockchain usando tokens GTK",
      icon: <Gem className="h-6 w-6" />,
      details: [
        "Costo: 1,000 GTK tokens",
        "Creación en Ethereum o Polygon",
        "Proceso automático y seguro",
        "Contrato inteligente verificado"
      ]
    },
    {
      step: "3. Verificación",
      description: "Tu galería obtiene verificación blockchain y badge de autenticidad",
      icon: <Verified className="h-6 w-6" />,
      details: [
        "Contract Address único",
        "Token ID asignado",
        "Badge NFT-Verificado ✅",
        "Verificación pública en blockchain"
      ]
    },
    {
      step: "4. Propiedad",
      description: "Eres el propietario verificable con derechos de transferencia",
      icon: <Award className="h-6 w-6" />,
      details: [
        "Propiedad verificable",
        "Transferible a otros usuarios",
        "Valor económico potencial",
        "Mercado secundario futuro"
      ]
    }
  ];

  const nftBenefits = [
    {
      category: "Valor Económico",
      icon: <DollarSign className="h-8 w-8" />,
      color: "from-green-500 to-emerald-600",
      benefits: [
        "Propiedad verificable en blockchain",
        "Escasez digital garantizada",
        "Transferible y vendible",
        "Valor creciente con el tiempo",
        "Mercado secundario futuro"
      ]
    },
    {
      category: "Valor Social",
      icon: <Users className="h-8 w-8" />,
      color: "from-blue-500 to-cyan-600",
      benefits: [
        "Estatus exclusivo en la comunidad",
        "Acceso a eventos VIP",
        "Reconocimiento como creador",
        "Networking con coleccionistas",
        "Participación en governance"
      ]
    },
    {
      category: "Valor Técnico",
      icon: <Database className="h-8 w-8" />,
      color: "from-purple-500 to-pink-600",
      benefits: [
        "Inmutable y permanente",
        "Verificación automática",
        "Interoperabilidad blockchain",
        "Estándares ERC-721",
        "Metadata descentralizada"
      ]
    }
  ];

  const pricingTiers = [
    {
      name: "Mint Básico",
      price: "Gratis",
      description: "Mint gratuito para nuevos usuarios",
      features: [
        "1 NFT gratuito por usuario",
        "Galería básica (hasta 5 imágenes)",
        "Verificación estándar",
        "Badge NFT-Verificado"
      ],
      color: "from-gray-500 to-gray-600",
      popular: false
    },
    {
      name: "Mint Premium",
      price: "100 CMPX",
      description: "Mint con tokens CMPX para galerías premium",
      features: [
        "Galerías ilimitadas",
        "Hasta 20 imágenes por galería",
        "Metadata enriquecida",
        "Prioridad en verificación",
        "Soporte técnico"
      ],
      color: "from-blue-500 to-cyan-600",
      popular: true
    },
    {
      name: "Mint Profesional",
      price: "1,000 GTK",
      description: "Mint con tokens GTK para colecciones profesionales",
      features: [
        "Colecciones profesionales",
        "Galerías ilimitadas",
        "Metadata completa",
        "Verificación prioritaria",
        "Herramientas de creador",
        "Revenue sharing"
      ],
      color: "from-purple-500 to-pink-600",
      popular: false
    }
  ];

  const nftConditions = [
    {
      title: "Mint",
      icon: "🆓",
      description: "Gratis o 100 CMPX para crear NFTs"
    },
    {
      title: "Venta",
      icon: "💰", 
      description: "5% fee para la plataforma"
    },
    {
      title: "Staking",
      icon: "📈",
      description: "10% APY en tokens CMPX"
    },
    {
      title: "Parejas",
      icon: "👫",
      description: "Consentimiento doble obligatorio"
    },
    {
      title: "Revocación",
      icon: "🔄",
      description: "72h 'derecho al olvido'"
    },
    {
      title: "Verificación",
      icon: "🔐",
      description: "IA de consentimiento integrada"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 relative overflow-hidden">
      {/* Background decorativo */}
      <DecorativeHearts count={10} />
      
      <HeaderNav />
      
      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold mb-4">
              🎨 GALERÍAS NFT-VERIFICADAS
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Galerías
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> NFT-Verificadas</span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              Convierte tus galerías en NFTs únicos y verificables en blockchain. 
              Propiedad digital auténtica con verificación de consentimiento y staking del 15-35% APY.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-400/30 px-4 py-2 text-base">
                <Verified className="h-4 w-4 mr-2" />
                Blockchain Verificado
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-400/30 px-4 py-2 text-base">
                <Shield className="h-4 w-4 mr-2" />
                IA de Consentimiento
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-400/30 px-4 py-2 text-base">
                <TrendingUp className="h-4 w-4 mr-2" />
                10% APY Staking
              </Badge>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => navigate('/profile')} 
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold"
              >
                <Camera className="w-5 h-5 mr-2" />
                Crear Mi NFT
              </Button>
              <Button 
                onClick={() => navigate('/marketplace')} 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                Explorar NFTs
              </Button>
            </div>
          </motion.div>

          {/* ¿Qué es un NFT? */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-20"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  ¿Qué es un NFT?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                  <p className="text-white/90 text-lg leading-relaxed mb-4">
                    <strong>NFT</strong> significa <strong>Non-Fungible Token</strong> (Token No Fungible). 
                    Es un certificado digital único e irreemplazable que se almacena en una blockchain 
                    (como Ethereum o Polygon) y que prueba la propiedad y autenticidad de un activo digital.
                  </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                  {[
                    {
                      title: "Únicos",
                      description: "Cada NFT es único e irreemplazable",
                      icon: <Gem className="h-8 w-8" />
                    },
                    {
                      title: "Verificables", 
                      description: "La blockchain prueba autenticidad",
                      icon: <Verified className="h-8 w-8" />
                    },
                    {
                      title: "Transferibles",
                      description: "Se pueden vender o intercambiar",
                      icon: <ArrowRight className="h-8 w-8" />
                    },
                    {
                      title: "Permanentes",
                      description: "Inmutables en la blockchain",
                      icon: <Lock className="h-8 w-8" />
                    }
                  ].map((characteristic, index) => (
                    <motion.div
                      key={characteristic.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="text-center p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="text-purple-300 mb-3 flex justify-center">
                        {characteristic.icon}
                      </div>
                      <h4 className="font-semibold text-white mb-2">{characteristic.title}</h4>
                      <p className="text-white/70 text-sm">{characteristic.description}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Proceso de Creación */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              ¿Cómo Crear tu NFT?
            </h2>
            <p className="text-lg text-white/70 text-center mb-12 max-w-2xl mx-auto">
              Proceso simple de 4 pasos para convertir tus galerías en NFTs verificados
            </p>
            
            <div className="space-y-8">
              {nftProcess.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-colors">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Icono y número */}
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl text-white">
                              {step.icon}
                            </div>
                            <div className="absolute -top-2 -right-2 bg-white text-purple-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                          </div>
                        </div>

                        {/* Contenido */}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-3">{step.step}</h3>
                          <p className="text-white/80 text-lg mb-4">{step.description}</p>
                          
                          <div className="grid md:grid-cols-2 gap-3">
                            {step.details.map((detail, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-white/70">
                                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Precios y Costos */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              Precios y Costos
            </h2>
            <p className="text-lg text-white/70 text-center mb-12 max-w-2xl mx-auto">
              Opciones flexibles para crear tus NFTs, desde gratuito hasta profesional
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {pricingTiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className={`bg-gradient-to-br ${tier.color}/20 backdrop-blur-xl border-white/20 shadow-2xl h-full ${tier.popular ? 'ring-2 ring-blue-400/50' : ''}`}>
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-500 text-white px-4 py-1">
                          Más Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl font-bold text-white">{tier.name}</CardTitle>
                      <div className="text-4xl font-bold text-white mb-2">{tier.price}</div>
                      <p className="text-white/70">{tier.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-white/80">
                            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                        onClick={() => navigate('/profile')}
                      >
                        <Gem className="w-4 h-4 mr-2" />
                        Crear NFT
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Beneficios de los NFTs */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              ¿Por qué Crear NFTs?
            </h2>
            <p className="text-lg text-white/70 text-center mb-12 max-w-2xl mx-auto">
              Los NFTs ofrecen valor económico, social y técnico para creadores y coleccionistas
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {nftBenefits.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 h-full">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                          {category.icon}
                        </div>
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {category.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-white/80">
                            <Star className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Condiciones de NFTs */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mb-20"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-white text-center">
                  🎨 Condiciones de NFTs Verificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nftConditions.map((condition, index) => (
                    <motion.div
                      key={condition.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                      className="text-center p-6 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="text-4xl mb-3">{condition.icon}</div>
                      <h4 className="font-semibold text-white mb-2">{condition.title}</h4>
                      <p className="text-white/70 text-sm">{condition.description}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call to Action Final */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30 backdrop-blur-xl border-purple-400/30 shadow-2xl">
              <CardContent className="p-12">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="inline-flex p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-6"
                >
                  <Palette className="h-12 w-12 text-white" />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                  ¿Listo para Crear tu NFT?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Convierte tus galerías en activos digitales únicos y verificables. 
                  Únete a la revolución NFT en ComplicesConecta.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button
                    onClick={() => navigate('/profile')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-10 py-4 text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Crear Mi Primer NFT
                  </Button>
                  <Button
                    onClick={() => navigate('/marketplace')}
                    className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-4 text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    Explorar Marketplace
                  </Button>
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-white/80">
                  <div className="flex items-center gap-2">
                    <Verified className="h-4 w-4" />
                    <span>Blockchain Verificado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>IA de Consentimiento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>10% APY Staking</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default NFTs;
