import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Info as InfoIcon, ArrowLeft, Shield, Users, Heart, Star, Globe, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HeaderNav from '@/components/HeaderNav';

const Info = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Seguridad Total",
      description: "Verificación de identidad, encriptación end-to-end y protección de datos personales.",
      color: "text-green-400"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Comunidad Verificada",
      description: "Solo perfiles auténticos y verificados. Sin bots ni perfiles falsos.",
      color: "text-blue-400"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Conexiones Auténticas",
      description: "Algoritmo inteligente que conecta personas con intereses y valores compatibles.",
      color: "text-pink-400"
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Privacidad Garantizada",
      description: "Control total sobre tu información. Solo compartes lo que quieres.",
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
      description: "Conecta con personas de todo México y expande tu red social.",
      color: "text-cyan-400"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Usuarios Activos" },
    { number: "95%", label: "Satisfacción" },
    { number: "24/7", label: "Soporte" },
    { number: "100%", label: "Verificado" }
  ];

  const testimonials = [
    {
      name: "María Elena",
      location: "Ciudad de México",
      text: "ComplicesConecta me ha permitido conocer personas increíbles de manera segura y discreta.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Carlos & Ana",
      location: "Guadalajara",
      text: "La plataforma más profesional y segura que hemos encontrado. Totalmente recomendada.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Roberto",
      location: "Monterrey",
      text: "Excelente experiencia. La verificación de perfiles me da mucha confianza.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20"></div>
      
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
              <InfoIcon className="h-12 w-12 text-pink-400 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Información
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Conoce más sobre ComplicesConecta, la plataforma social más exclusiva y segura para la comunidad swinger en México
            </p>
          </div>

          {/* Stats Section */}
          <section className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-sm border border-primary/10 text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              ¿Por qué elegir ComplicesConecta?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-sm border border-primary/10">
                  <CardContent className="p-6">
                    <div className={`${feature.color} mb-4`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* About Section */}
          <section className="mb-16">
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center">
                  Sobre ComplicesConecta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-lg text-white/90 max-w-4xl mx-auto">
                    ComplicesConecta es la plataforma social más exclusiva y segura diseñada específicamente 
                    para la comunidad swinger mexicana. Nuestra misión es crear un espacio donde parejas y 
                    solteros puedan conectar de manera auténtica, discreta y verificada.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Nuestra Misión</h3>
                    <p className="text-muted-foreground">
                      Crear la comunidad swinger más exclusiva y segura de México, donde las conexiones 
                      auténticas y el respeto mutuo son los pilares fundamentales de nuestra plataforma.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Nuestros Valores</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        Discreción y privacidad
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        Respeto mutuo
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        Autenticidad
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        Seguridad total
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Testimonials Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Lo que dicen nuestros usuarios
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-sm border border-primary/10">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4 object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-white">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <Card className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 backdrop-blur-sm border border-pink-400/30">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  ¿Listo para unirte a nuestra comunidad?
                </h2>
                <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                  Descubre conexiones auténticas en un ambiente seguro y discreto diseñado especialmente para ti
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 px-8 py-3"
                  >
                    Crear Cuenta Gratis
                  </Button>
                  <Button 
                    onClick={() => navigate('/about')}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-3"
                  >
                    Más Información
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
