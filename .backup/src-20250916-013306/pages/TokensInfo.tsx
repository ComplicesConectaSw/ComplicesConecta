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
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TOKEN_CONFIG } from '@/lib/tokens';
import Navigation from '@/components/Navigation';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'security' | 'rewards' | 'premium';
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
    category: "general"
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

export default function TokensInfo() {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredFAQ = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/tokens')}
              className="text-white hover:bg-white/20 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Regresar a Tokens</span>
              <span className="sm:hidden">Regresar</span>
            </Button>
            
            <h1 className="text-lg sm:text-xl font-bold text-white text-center truncate">Guía de Tokens</h1>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20"
            >
              <span className="hidden sm:inline">Inicio</span>
              <span className="sm:hidden">🏠</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8 pb-20">
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6">
            <Coins className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Sistema de Tokens
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              CMPX/GTK
            </span>
          </h1>
          
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Gana tokens participando en la comunidad, invita amigos y accede a funciones exclusivas. 
            Tu puerta de entrada al futuro premium de ComplicesConecta.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
          <Card className="bg-gradient-to-r from-green-900/80 to-blue-900/80 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <Gift className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{TOKEN_CONFIG.REFERRAL_REWARD}</div>
              <div className="text-white/70">CMPX por referido</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-900/80 to-pink-900/80 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{TOKEN_CONFIG.MONTHLY_LIMIT}</div>
              <div className="text-white/70">CMPX límite mensual</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-900/80 to-red-900/80 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-orange-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">∞</div>
              <div className="text-white/70">Beneficios futuros</div>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-400" />
              ¿Cómo Funciona?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  Invita Amigos
                </h3>
                <p className="text-white/80">
                  Comparte tu código de referido único. Cuando alguien se registre usando tu código, 
                  ambos reciben tokens CMPX instantáneamente.
                </p>
                <div className="bg-green-900/30 p-4 rounded-lg">
                  <div className="text-green-400 font-semibold">Tu ganas: 50 CMPX</div>
                  <div className="text-green-400 font-semibold">Tu amigo gana: 50 CMPX</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  Límites Mensuales
                </h3>
                <p className="text-white/80">
                  Puedes ganar hasta 500 CMPX por mes. El límite se resetea automáticamente 
                  el primer día de cada mes para mantener el equilibrio del sistema.
                </p>
                <div className="bg-purple-900/30 p-4 rounded-lg">
                  <div className="text-purple-400 font-semibold">Máximo: 500 CMPX/mes</div>
                  <div className="text-purple-400 font-semibold">Reset: 1° de cada mes</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
          <Card className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Coins className="h-6 w-6 text-blue-400" />
                CMPX (Beta)
              </CardTitle>
              <Badge variant="secondary" className="w-fit">Activo Ahora</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80">
                Tokens internos que funcionan durante la fase beta. Son seguros, 
                auditados y se convertirán en GTK en el futuro.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-400">
                  <Unlock className="h-4 w-4" />
                  <span className="text-sm">Disponible ahora</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Sistema seguro</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <Gift className="h-4 w-4" />
                  <span className="text-sm">Gana por referidos</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-900/80 to-blue-900/80 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-6 w-6 text-cyan-400" />
                World ID
              </CardTitle>
              <Badge variant="outline" className="w-fit border-cyan-400 text-cyan-400">Próximamente</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80">
                Verificación de identidad humana con Worldcoin. Gana 100 CMPX 
                adicionales verificando tu identidad de forma segura y privada.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Verificación humana</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-400">
                  <Gift className="h-4 w-4" />
                  <span className="text-sm">100 CMPX bonus</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-400">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Worldchain integration</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-900/80 to-red-900/80 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-6 w-6 text-orange-400" />
                GTK (Futuro)
              </CardTitle>
              <Badge variant="outline" className="w-fit border-orange-400 text-orange-400">Próximamente</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80">
                Tokens blockchain (ERC20) que representarán el valor real. 
                Transferibles, intercambiables y con utilidad completa.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-orange-400">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">Pausado hasta release</span>
                </div>
                <div className="flex items-center gap-2 text-orange-400">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Blockchain ERC20</span>
                </div>
                <div className="flex items-center gap-2 text-orange-400">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Funciones premium</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security */}
        <Card className="bg-gradient-to-r from-red-900/80 to-pink-900/80 backdrop-blur-sm border border-white/10 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-400" />
              Seguridad y Protección
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Protecciones Implementadas:</h4>
                <ul className="space-y-2 text-white/80">
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    Validación de códigos de referido
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    Prevención de auto-referidos
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    Límites mensuales automáticos
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    Auditoría de todas las transacciones
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Tu Información:</h4>
                <ul className="space-y-2 text-white/80">
                  <li className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-400" />
                    Datos encriptados y seguros
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-400" />
                    Sin acceso a información personal
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-400" />
                    Cumplimiento de regulaciones
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-400" />
                    Soporte 24/7 disponible
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Preguntas Frecuentes</CardTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="text-xs"
              >
                Todas
              </Button>
              <Button
                variant={selectedCategory === 'general' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('general')}
                className="text-xs"
              >
                General
              </Button>
              <Button
                variant={selectedCategory === 'rewards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('rewards')}
                className="text-xs"
              >
                Recompensas
              </Button>
              <Button
                variant={selectedCategory === 'security' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('security')}
                className="text-xs"
              >
                Seguridad
              </Button>
              <Button
                variant={selectedCategory === 'premium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('premium')}
                className="text-xs"
              >
                Premium
              </Button>
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
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <FileText className="h-4 w-4 mr-2" />
            Términos y Condiciones
          </Button>
          <Button
            onClick={() => navigate('/tokens-privacy')}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Shield className="h-4 w-4 mr-2" />
            Política de Privacidad
          </Button>
          <Button
            onClick={() => navigate('/tokens-legal')}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Scale className="h-4 w-4 mr-2" />
            Responsabilidad Legal
          </Button>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 animate-fade-in">
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
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Registrarse Ahora
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver al Inicio
            </Button>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <Navigation />
    </div>
  );
}
