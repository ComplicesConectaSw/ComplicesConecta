import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, CheckCircle, AlertTriangle, Clock, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HeaderNav from '@/components/HeaderNav';

const Moderators = () => {
  const navigate = useNavigate();

  const moderatorRoles = [
    {
      id: 1,
      title: "Moderador de Contenido",
      description: "Supervisa y modera el contenido de la plataforma, incluyendo perfiles, mensajes y publicaciones.",
      responsibilities: [
        "Revisar reportes de contenido inapropiado",
        "Moderar conversaciones públicas y privadas",
        "Verificar perfiles y galerías",
        "Aplicar políticas de la comunidad"
      ],
      requirements: [
        "Experiencia en moderación de comunidades online",
        "Conocimiento del lifestyle swinger",
        "Disponibilidad de 10-15 horas semanales",
        "Excelente comunicación y discreción"
      ],
      benefits: [
        "Acceso premium a la plataforma",
        "Tokens CMPX como recompensa",
        "Experiencia en gestión de comunidades",
        "Networking con la comunidad"
      ],
      status: "Disponible",
      applications: 12
    },
    {
      id: 2,
      title: "Moderador de Eventos",
      description: "Organiza y supervisa eventos VIP, fiestas privadas y encuentros de la comunidad.",
      responsibilities: [
        "Coordinar eventos VIP y fiestas privadas",
        "Verificar asistencia y seguridad",
        "Mediar en conflictos durante eventos",
        "Mantener ambiente seguro y respetuoso"
      ],
      requirements: [
        "Experiencia en organización de eventos",
        "Presencia en Ciudad de México o Guadalajara",
        "Conocimiento profundo del ambiente swinger",
        "Habilidades de liderazgo y mediación"
      ],
      benefits: [
        "Acceso gratuito a eventos VIP",
        "Tokens CMPX y recompensas especiales",
        "Networking exclusivo",
        "Experiencia en gestión de eventos"
      ],
      status: "Disponible",
      applications: 8
    },
    {
      id: 3,
      title: "Moderador de Seguridad",
      description: "Se especializa en seguridad digital, privacidad y protección de datos de usuarios.",
      responsibilities: [
        "Monitorear actividad sospechosa",
        "Investigar reportes de seguridad",
        "Verificar identidades y perfiles",
        "Implementar medidas de protección"
      ],
      requirements: [
        "Conocimientos en ciberseguridad",
        "Experiencia en protección de datos",
        "Disponibilidad 24/7 para emergencias",
        "Certificaciones en seguridad (preferible)"
      ],
      benefits: [
        "Acceso completo a herramientas de seguridad",
        "Compensación económica mensual",
        "Tokens CMPX premium",
        "Desarrollo profesional en ciberseguridad"
      ],
      status: "Disponible",
      applications: 5
    }
  ];

  const currentModerators = [
    {
      name: "María Elena",
      role: "Moderador Senior",
      experience: "2 años",
      rating: 4.9,
      location: "Ciudad de México",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Carlos Mendoza",
      role: "Moderador de Eventos",
      experience: "1.5 años",
      rating: 4.8,
      location: "Guadalajara",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Ana Sofía",
      role: "Moderador de Contenido",
      experience: "1 año",
      rating: 4.7,
      location: "Monterrey",
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
              <Shield className="h-12 w-12 text-pink-400 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Moderadores
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Únete al equipo de moderadores de ComplicesConecta y ayuda a mantener nuestra comunidad segura, respetuosa y auténtica
            </p>
          </div>

          {/* Current Moderators */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Nuestro Equipo de Moderadores
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {currentModerators.map((moderator, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-sm border border-primary/10">
                  <CardContent className="p-6 text-center">
                    <img
                      src={moderator.avatar}
                      alt={moderator.name}
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="text-xl font-semibold text-white mb-2">{moderator.name}</h3>
                    <p className="text-primary mb-2">{moderator.role}</p>
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-white font-medium">{moderator.rating}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">{moderator.experience}</p>
                    <p className="text-muted-foreground text-sm">{moderator.location}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Available Positions */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Posiciones Disponibles
            </h2>
            <div className="grid lg:grid-cols-3 gap-8">
              {moderatorRoles.map((role) => (
                <Card key={role.id} className="bg-card/80 backdrop-blur-sm border border-primary/10">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-white text-xl">{role.title}</CardTitle>
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                        {role.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{role.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {role.applications} aplicaciones
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-white mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                        Responsabilidades
                      </h4>
                      <ul className="space-y-2">
                        {role.responsibilities.map((resp, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start">
                            <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-3 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" />
                        Requisitos
                      </h4>
                      <ul className="space-y-2">
                        {role.requirements.map((req, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-3 flex items-center">
                        <Star className="h-4 w-4 mr-2 text-pink-400" />
                        Beneficios
                      </h4>
                      <ul className="space-y-2">
                        {role.benefits.map((benefit, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start">
                            <span className="w-2 h-2 bg-pink-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button 
                      onClick={() => navigate('/moderator-request')}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                    >
                      Aplicar Ahora
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Application Process */}
          <section className="mb-16">
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center">
                  Proceso de Aplicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Aplicación</h3>
                    <p className="text-sm text-muted-foreground">
                      Completa el formulario de aplicación con tu experiencia y motivación
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Revisión</h3>
                    <p className="text-sm text-muted-foreground">
                      Nuestro equipo revisa tu aplicación y experiencia en 3-5 días
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Entrevista</h3>
                    <p className="text-sm text-muted-foreground">
                      Entrevista virtual para conocer tu perfil y experiencia
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold">4</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Capacitación</h3>
                    <p className="text-sm text-muted-foreground">
                      Programa de capacitación de 2 semanas antes de comenzar
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <Card className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 backdrop-blur-sm border border-pink-400/30">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  ¿Listo para ser parte del equipo?
                </h2>
                <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                  Únete a nuestro equipo de moderadores y ayuda a crear la comunidad swinger más segura y respetuosa de México
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/moderator-request')}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 px-8 py-3"
                  >
                    Aplicar como Moderador
                  </Button>
                  <Button 
                    onClick={() => navigate('/support')}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-3"
                  >
                    Contactar Soporte
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

export default Moderators;
