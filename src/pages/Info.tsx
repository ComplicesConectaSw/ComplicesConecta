import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Info as InfoIcon, ArrowLeft, Shield, Users, Heart, Star, Globe, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import HeaderNav from '@/components/HeaderNav';

const Info = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Seguridad Total",
      description: "Verificacin de identidad, encriptacin end-to-end y proteccin de datos personales.",
      color: "text-green-400"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Comunidad Verificada",
      description: "Solo perfiles autnticos y verificados. Sin bots ni perfiles falsos.",
      color: "text-blue-400"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Conexiones Autnticas",
      description: "Algoritmo inteligente que conecta personas con intereses y valores compatibles.",
      color: "text-purple-400"
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Privacidad Garantizada",
      description: "Control total sobre tu informacin. Solo compartes lo que quieres.",
      color: "text-purple-400"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Experiencia Premium",
      description: "Interfaz elegante, eventos exclusivos y funcionalidades avanzadas.",
      color: "text-yellow-400"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Comunidad Global",
      description: "Conecta con personas de todo Mxico y expande tu red social.",
      color: "text-cyan-400"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Usuarios Activos" },
    { number: "95%", label: "Satisfaccin" },
    { number: "24/7", label: "Soporte" },
    { number: "100%", label: "Verificado" }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-purple-800/20 to-blue-900/20"></div>
      
      <div className="relative z-10">
        <HeaderNav />
        
        <main className="container mx-auto px-4 py-8 pt-24">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              onClick={() => navigate('/')}
              className="bg-card/80 backdrop-blur-sm border border-primary/20 hover:bg-primary/10 transition-all duration-300 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <InfoIcon className="h-12 w-12 text-purple-400 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Informacin
              </h1>
            </div>
            <p className="text-xl text-white font-medium max-w-3xl mx-auto drop-shadow-lg">
              Conoce ms sobre ComplicesConecta, la plataforma social ms exclusiva y segura para la comunidad swinger en Mxico
            </p>
          </div>

          {/* Stats Section */}
          <section className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-purple-800/90 backdrop-blur-sm border border-purple-500/30 text-center shadow-lg">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-white mb-2 drop-shadow-md">{stat.number}</div>
                    <div className="text-white font-medium drop-shadow-md">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Por qu elegir ComplicesConecta?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-purple-800/90 backdrop-blur-sm border border-purple-500/30 shadow-lg">
                  <CardContent className="p-6">
                    <div className={`${feature.color} mb-4 drop-shadow-md`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 drop-shadow-md">{feature.title}</h3>
                    <p className="text-white font-medium leading-relaxed drop-shadow-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* About Section */}
          <section className="mb-16">
            <Card className="bg-purple-800/90 backdrop-blur-sm border border-purple-500/30 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center font-bold drop-shadow-md">
                  Sobre ComplicesConecta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-lg text-white font-medium max-w-4xl mx-auto leading-relaxed drop-shadow-md">
                    ComplicesConecta es la plataforma social ms exclusiva y segura diseada especficamente 
                    para la comunidad swinger mexicana. Nuestra misin es crear un espacio donde parejas y 
                    solteros puedan conectar de manera autntica, discreta y verificada.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 drop-shadow-md">Nuestra Misin</h3>
                    <p className="text-white font-medium leading-relaxed drop-shadow-sm">
                      Crear la comunidad swinger ms exclusiva y segura de Mxico, donde las conexiones 
                      autnticas y el respeto mutuo son los pilares fundamentales de nuestra plataforma.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 drop-shadow-md">Nuestros Valores</h3>
                    <ul className="space-y-2 text-white font-medium">
                      <li className="flex items-center drop-shadow-sm">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                        Discrecin y privacidad
                      </li>
                      <li className="flex items-center drop-shadow-sm">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                        Respeto mutuo
                      </li>
                      <li className="flex items-center drop-shadow-sm">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                        Autenticidad
                      </li>
                      <li className="flex items-center drop-shadow-sm">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                        Seguridad total
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>


          {/* CTA Section */}
          <section className="text-center">
            <Card className="bg-gradient-to-r from-purple-600/90 to-blue-700/90 backdrop-blur-sm border border-purple-400/50 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                  Listo para unirte a nuestra comunidad?
                </h2>
                <p className="text-xl text-white font-medium mb-6 max-w-2xl mx-auto drop-shadow-md">
                  Descubre conexiones autnticas en un ambiente seguro y discreto diseado especialmente para ti
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 px-8 py-3"
                  >
                    Crear Cuenta Gratis
                  </Button>
                  <Button 
                    onClick={() => navigate('/about')}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-3"
                  >
                    Ms Informacin
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Info;
