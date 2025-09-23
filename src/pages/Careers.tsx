import { ArrowLeft, Code2, Rocket, Star, Users, Heart, MapPin, Clock, DollarSign, Send, Trophy, Zap, Target, Code, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const ProjectSupport = () => {
  const navigate = useNavigate();

  const supportOpportunities = [
    {
      id: 1,
      title: "Desarrollador Full Stack - Integración Largo Plazo",
      department: "Desarrollo Core",
      location: "Remoto / México",
      type: "Colaboración Continua",
      compensation: "$50,000 - $150,000 MXN/año",
      description: "Únete como desarrollador principal en la evolución de ComplicesConecta. Participarás en el desarrollo de nuevas funcionalidades, optimizaciones y expansión a nuevos proyectos dentro del ecosistema.",
      requirements: [
        "Experiencia demostrable en React, TypeScript, Node.js",
        "Conocimiento en Supabase, PostgreSQL, APIs REST",
        "Capacidad de trabajar de forma autónoma y proactiva",
        "Compromiso a largo plazo (mínimo 2 años)",
        "Portfolio con proyectos similares"
      ],
      benefits: [
        "Compensación basada en contribuciones y resultados",
        "Participación en futuros proyectos del ecosistema",
        "Reconocimiento como desarrollador principal",
        "Flexibilidad total de horarios y ubicación"
      ],
      icon: Code2,
      color: "from-blue-500 to-cyan-600"
    },
    {
      id: 2,
      title: "Especialista en UX/UI - Diseño de Ecosistema",
      department: "Experiencia de Usuario",
      location: "Remoto / México",
      type: "Colaboración Creativa",
      compensation: "$40,000 - $100,000 MXN/año",
      description: "Lidera el diseño visual y de experiencia para ComplicesConecta y futuros proyectos. Crearás interfaces innovadoras y sistemas de diseño escalables.",
      requirements: [
        "Portfolio excepcional en aplicaciones web/móvil",
        "Dominio de Figma, Adobe Creative Suite, Framer",
        "Experiencia en design systems y componentes",
        "Visión para crear experiencias únicas y memorables",
        "Conocimiento en tendencias de UX para aplicaciones sociales"
      ],
      benefits: [
        "Libertad creativa total en decisiones de diseño",
        "Participación en la identidad visual de nuevos proyectos",
        "Reconocimiento como diseñador principal",
        "Compensación por proyectos completados"
      ],
      icon: Star,
      color: "from-purple-500 to-pink-600"
    },
    {
      id: 3,
      title: "Arquitecto de Sistemas - Escalabilidad",
      department: "Infraestructura",
      location: "Remoto / Global",
      type: "Consultoría Técnica",
      compensation: "$80,000 - $200,000 MXN/año",
      description: "Define la arquitectura técnica para el crecimiento exponencial de ComplicesConecta y la creación de nuevas plataformas dentro del ecosistema.",
      requirements: [
        "Experiencia senior en arquitectura de sistemas escalables",
        "Conocimiento profundo en cloud computing (AWS, Azure, GCP)",
        "Experiencia con microservicios, APIs, bases de datos distribuidas",
        "Capacidad de planificación técnica a largo plazo",
        "Historial en proyectos de alto tráfico"
      ],
      benefits: [
        "Compensación premium por expertise técnico",
        "Decisiones arquitectónicas de alto nivel",
        "Participación en múltiples proyectos simultáneos",
        "Reconocimiento como arquitecto principal del ecosistema"
      ],
      icon: Rocket,
      color: "from-green-500 to-emerald-600"
    }
  ];

  const ecosystemBenefits = [
    {
      icon: Trophy,
      title: "Reconocimiento",
      description: "Créditos como desarrollador principal en todos los proyectos del ecosistema"
    },
    {
      icon: Zap,
      title: "Innovación",
      description: "Participación en decisiones técnicas y arquitectónicas de alto nivel"
    },
    {
      icon: Target,
      title: "Impacto",
      description: "Contribuciones directas al crecimiento y éxito de múltiples proyectos"
    },
    {
      icon: DollarSign,
      title: "Compensación Escalable",
      description: "Ingresos que crecen proporcionalmente al éxito de los proyectos"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold text-white">Apoyo al Proyecto</h1>
            <div className="w-20"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Hero Section */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full">
                  <Rocket className="h-12 w-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Únete al Ecosistema ComplicesConecta</h2>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                Buscamos desarrolladores, diseñadores y arquitectos comprometidos a largo plazo para construir 
                el futuro del ecosistema ComplicesConecta. Compensación monetaria acorde al desarrollo y crecimiento.
              </p>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">¿Por Qué Unirte al Ecosistema?</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ecosystemBenefits.map((benefit, index) => (
                  <div key={index} className="text-center group">
                    <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <benefit.icon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{benefit.title}</h4>
                    <p className="text-white/70 text-sm">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Job Openings */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white text-center">Oportunidades de Colaboración</h3>
            {supportOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`p-3 bg-gradient-to-r ${opportunity.color} rounded-lg`}>
                          <opportunity.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white mb-2">{opportunity.title}</h4>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary" className="bg-white/20 text-white">
                              {opportunity.department}
                            </Badge>
                            <Badge variant="outline" className="border-white/30 text-white">
                              {opportunity.type}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 text-white/80 text-sm mb-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {opportunity.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {opportunity.compensation}
                            </div>
                          </div>
                          <p className="text-white/90 mb-4">{opportunity.description}</p>
                          <div className="mb-4">
                            <h5 className="font-semibold text-white mb-2">Requisitos:</h5>
                            <ul className="space-y-1">
                              {opportunity.requirements.map((req: string, index: number) => (
                                <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                                  <span className="text-pink-400 mt-1">•</span>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-white mb-2">Beneficios:</h5>
                            <ul className="space-y-1">
                              {opportunity.benefits.map((benefit: string, index: number) => (
                                <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                                  <span className="text-green-400 mt-1">✓</span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="lg:w-48">
                      <Button 
                        onClick={() => navigate('/support')}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold transition-all duration-300 hover:scale-105"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Postularme
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Culture */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Filosofía del Ecosistema</h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="group">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Colaboración</h4>
                  <p className="text-white/70">Construimos juntos un ecosistema de proyectos interconectados, compartiendo conocimientos y creciendo mutuamente.</p>
                </div>
                <div className="group">
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Compromiso</h4>
                  <p className="text-white/70">Buscamos colaboradores comprometidos a largo plazo que crezcan junto con el ecosistema de proyectos.</p>
                </div>
                <div className="group">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Code className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Innovación</h4>
                  <p className="text-white/70">Creamos tecnologías de vanguardia que definen el futuro de las plataformas sociales y de conexión.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 backdrop-blur-md border-pink-300/30 shadow-xl">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">¿Tienes una Propuesta Diferente?</h3>
              <p className="text-white/90 mb-6">
                Estamos abiertos a colaboraciones únicas y propuestas innovadoras. Si tienes una idea para contribuir 
                al ecosistema ComplicesConecta, compártela con nosotros.
              </p>
              <Button 
                onClick={() => navigate('/support')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-3 transition-all duration-300 hover:scale-105"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Propuesta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectSupport;
