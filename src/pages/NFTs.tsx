import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNav from '@/components/HeaderNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Shield, 
  Coins, 
  CheckCircle, 
  ArrowRight, 
  FileText,
  Scale,
  Sparkles,
  TrendingUp,
  Zap,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

const NFTs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 relative overflow-hidden">
      <HeaderNav />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 py-24">
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
                <Image className="h-16 w-16 text-white" />
              </motion.div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 drop-shadow-2xl">
              Galerías NFT-Verificadas
              <span className="block text-3xl sm:text-4xl md:text-5xl font-bold text-purple-300 mt-2">
                Propiedad Digital y Autenticidad
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 font-medium max-w-3xl mx-auto leading-relaxed mb-8">
              Convierte tus galerías en NFTs verificables en blockchain. 
              Propiedad digital real, autenticidad verificable y valor potencial.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-400/30 px-4 py-2 text-base">
                <CheckCircle className="h-4 w-4 mr-2" />
                Verificación Blockchain
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-400/30 px-4 py-2 text-base">
                <Shield className="h-4 w-4 mr-2" />
                Propiedad Digital
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-400/30 px-4 py-2 text-base">
                <TrendingUp className="h-4 w-4 mr-2" />
                Valor Potencial
              </Badge>
            </div>
          </motion.div>

          {/* ¿Qué es un NFT? */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                    <Image className="h-6 w-6 text-white" />
                  </div>
                  ¿Qué es un NFT?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/90 text-lg leading-relaxed">
                  <strong className="text-white">NFT</strong> significa <strong className="text-purple-300">Non-Fungible Token</strong> (Token No Fungible). 
                  Es un certificado digital único e irreemplazable que se almacena en una blockchain (como Ethereum o Polygon) 
                  y que prueba la propiedad y autenticidad de un activo digital.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      Características Clave
                    </h4>
                    <ul className="space-y-2 text-white/80 text-sm">
                      <li>• <strong>Únicos:</strong> Cada NFT es único e irreemplazable</li>
                      <li>• <strong>Verificables:</strong> La autenticidad se puede verificar en la blockchain</li>
                      <li>• <strong>Transferibles:</strong> Se pueden comprar, vender o transferir entre usuarios</li>
                      <li>• <strong>Inmutables:</strong> Una vez creado, el registro en blockchain no se puede alterar</li>
                      <li>• <strong>Valorizables:</strong> Pueden tener valor económico y aumentar con el tiempo</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                      Beneficios en ComplicesConecta
                    </h4>
                    <ul className="space-y-2 text-white/80 text-sm">
                      <li>• <strong>Autenticidad:</strong> Tu galería tiene un certificado digital inmutable</li>
                      <li>• <strong>Propiedad:</strong> Eres el dueño real de tu NFT, no solo una copia</li>
                      <li>• <strong>Prestigio:</strong> Los perfiles con NFTs tienen mayor credibilidad</li>
                      <li>• <strong>Valor:</strong> Tus NFTs pueden aumentar de valor con el tiempo</li>
                      <li>• <strong>Transferencia:</strong> Puedes vender o transferir tus NFTs en el futuro</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* ¿Cómo Funcionan? */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  ¿Cómo Funcionan las Galerías NFT en ComplicesConecta?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      step: "1",
                      title: "Crear una Galería",
                      description: "Crea una galería de fotos en tu perfil, sube tus imágenes (pueden ser públicas o privadas) y dale un nombre y descripción.",
                      icon: <Image className="h-6 w-6" />,
                      color: "from-blue-500 to-cyan-600"
                    },
                    {
                      step: "2",
                      title: "Mint (Crear) el NFT",
                      description: "Usa tokens GTK para \"mint\" (crear) el NFT en blockchain. Costo: 1,000 GTK para mint una galería completa.",
                      icon: <Coins className="h-6 w-6" />,
                      color: "from-purple-500 to-pink-600"
                    },
                    {
                      step: "3",
                      title: "Verificación y Propiedad",
                      description: "Tu galería ahora tiene un contrato NFT único en blockchain. Recibes un Token ID y aparece con badge de verificación ✅",
                      icon: <CheckCircle className="h-6 w-6" />,
                      color: "from-green-500 to-emerald-600"
                    }
                  ].map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="p-6 bg-white/10 rounded-xl border border-white/20 hover:border-purple-400/50 transition-all duration-300"
                    >
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${step.color} text-white mb-4`}>
                        {step.icon}
                      </div>
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
                        <span className="text-purple-300 font-bold">{step.step}</span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
                      <p className="text-white/70 leading-relaxed">{step.description}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Precios y Costos */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                    <Coins className="h-6 w-6 text-white" />
                  </div>
                  Precios y Costos de NFTs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 mb-6 text-lg">
                  <strong>Costos de Mint (Q2 2026 - cuando esté en blockchain):</strong>
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { item: "Galería completa", cost: "1,000 GTK", description: "Mint completo de una galería con todas sus imágenes" },
                    { item: "Imagen individual", cost: "100 GTK", description: "Mint de una imagen individual como NFT" },
                    { item: "Perfil completo como NFT", cost: "5,000 GTK", description: "Mint de todo el perfil como NFT verificable" }
                  ].map((pricing, idx) => (
                    <div key={idx} className="p-6 bg-white/5 rounded-xl border border-white/10">
                      <h4 className="text-xl font-bold text-white mb-2">{pricing.item}</h4>
                      <div className="text-3xl font-black text-purple-300 mb-2">{pricing.cost}</div>
                      <p className="text-white/70 text-sm">{pricing.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-400/30">
                  <p className="text-white/90 font-semibold mb-2">¿Por qué usar GTK?</p>
                  <ul className="text-white/70 text-sm space-y-1">
                    <li>• GTK es el token de inversión de ComplicesConecta</li>
                    <li>• Usar GTK para mint NFTs aumenta el valor del token</li>
                    <li>• Los usuarios que hacen staking de GTK pueden obtener descuentos en mint</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Roadmap */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  Roadmap de NFTs (Q2-Q4 2026)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      phase: "Fase 1: Preparación (Q2 2026)",
                      items: [
                        "✅ Sistema de galerías NFT implementado (actual)",
                        "⏳ Smart contracts de NFTs en desarrollo",
                        "⏳ Integración con Polygon Network",
                        "⏳ Testing de mint en testnet"
                      ],
                      color: "from-blue-500/20 to-cyan-500/20"
                    },
                    {
                      phase: "Fase 2: Lanzamiento NFT (Q3 2026)",
                      items: [
                        "🚀 Mint en Mainnet: NFTs reales en blockchain",
                        "🎨 UI Mejorada: Interfaz completa para crear y gestionar NFTs",
                        "📱 Wallet Integration: Conectar wallets (MetaMask, WalletConnect)",
                        "🔍 Verificación: Sistema de verificación de autenticidad"
                      ],
                      color: "from-purple-500/20 to-pink-500/20"
                    },
                    {
                      phase: "Fase 3: Marketplace y Expansión (Q4 2026)",
                      items: [
                        "🛒 Marketplace Interno: Compra/venta de NFTs entre usuarios",
                        "🌐 Integración Externa: Listar NFTs en OpenSea, Rarible",
                        "🎟️ NFTs de Eventos: Eventos VIP como NFTs",
                        "🏆 Badges NFT: Logros y reconocimientos como NFTs"
                      ],
                      color: "from-green-500/20 to-emerald-500/20"
                    }
                  ].map((phase, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + idx * 0.1 }}
                      className={`p-6 rounded-xl border border-white/20 bg-gradient-to-br ${phase.color} backdrop-blur-sm`}
                    >
                      <h4 className="text-xl font-bold text-white mb-4">{phase.phase}</h4>
                      <ul className="space-y-2">
                        {phase.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-2 text-white/80 text-sm">
                            <ArrowRight className="h-4 w-4 text-purple-400 flex-shrink-0 mt-1" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Sección Legal */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mb-12"
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
                  Consulta nuestra documentación legal para más información sobre términos, privacidad y cumplimiento normativo relacionado con NFTs y blockchain.
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

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center"
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
                  ¿Listo para crear tu primera Galería NFT?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Convierte tus galerías en NFTs verificables y únete a la revolución de la propiedad digital.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate('/tokens')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-10 py-4 text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <Coins className="h-5 w-5 mr-2" />
                    Ver Tokens GTK
                  </Button>
                  <Button
                    onClick={() => navigate('/tokens-info')}
                    className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-4 text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Más Información
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default NFTs;

