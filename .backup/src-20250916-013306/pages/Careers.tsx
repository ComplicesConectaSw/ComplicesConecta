import { ArrowLeft, Briefcase, Code, Palette, Users, Heart, MapPin, Clock, DollarSign, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Careers = () => {
  const navigate = useNavigate();

  const jobOpenings = [
    {
      id: 1,
      title: "Desarrollador Full Stack Senior",
      department: "Tecnología",
      location: "Ciudad de México / Remoto",
      type: "Tiempo Completo",
      salary: "$80,000 - $120,000 MXN",
      description: "Buscamos un desarrollador experimentado en React, Node.js y bases de datos para liderar el desarrollo de nuevas funcionalidades.",
      requirements: [
        "5+ años de experiencia en desarrollo web",
        "Dominio de React, TypeScript, Node.js",
        "Experiencia con bases de datos SQL y NoSQL",
        "Conocimientos en AWS o Azure"
      ],
      icon: Code,
      color: "from-blue-500 to-cyan-600"
    },
    {
      id: 2,
      title: "Diseñador UX/UI Senior",
      department: "Diseño",
      location: "Guadalajara / Remoto",
      type: "Tiempo Completo",
      salary: "$60,000 - $90,000 MXN",
      description: "Únete a nuestro equipo de diseño para crear experiencias de usuario excepcionales en nuestra plataforma.",
      requirements: [
        "4+ años de experiencia en diseño UX/UI",
        "Dominio de Figma, Adobe Creative Suite",
        "Experiencia en diseño de aplicaciones móviles",
        "Portfolio sólido con casos de estudio"
      ],
      icon: Palette,
      color: "from-purple-500 to-pink-600"
    },
    {
      id: 3,
      title: "Community Manager",
      department: "Marketing",
      location: "Monterrey / Remoto",
      type: "Tiempo Completo",
      salary: "$35,000 - $50,000 MXN",
      description: "Gestiona nuestra comunidad online y crea contenido engaging para nuestras redes sociales.",
      requirements: [
        "3+ años de experiencia en community management",
        "Excelentes habilidades de comunicación",
        "Experiencia con redes sociales y analytics",
        "Creatividad para generar contenido viral"
      ],
      icon: Users,
      color: "from-green-500 to-emerald-600"
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Salud y Bienestar",
      description: "Seguro médico premium, días de salud mental y gimnasio gratuito"
    },
    {
      icon: Clock,
      title: "Flexibilidad",
      description: "Horarios flexibles, trabajo remoto y vacaciones ilimitadas"
    },
    {
      icon: DollarSign,
      title: "Compensación",
      description: "Salarios competitivos, bonos por performance y stock options"
    },
    {
      icon: Code,
      title: "Crecimiento",
      description: "Capacitación continua, conferencias y certificaciones pagadas"
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
            <h1 className="text-2xl font-bold text-white">Carreras</h1>
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
                  <Briefcase className="h-12 w-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Únete a Nuestro Equipo</h2>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                Estamos buscando personas talentosas y apasionadas que quieran revolucionar 
                la forma en que las personas se conectan. Construye el futuro con nosotros.
              </p>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">¿Por Qué Trabajar con Nosotros?</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
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
            <h3 className="text-2xl font-bold text-white text-center">Posiciones Disponibles</h3>
            {jobOpenings.map((job) => (
              <Card key={job.id} className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`p-3 bg-gradient-to-r ${job.color} rounded-lg`}>
                          <job.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white mb-2">{job.title}</h4>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary" className="bg-white/20 text-white">
                              {job.department}
                            </Badge>
                            <Badge variant="outline" className="border-white/30 text-white">
                              {job.type}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 text-white/80 text-sm mb-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.salary}
                            </div>
                          </div>
                          <p className="text-white/90 mb-4">{job.description}</p>
                          <div>
                            <h5 className="font-semibold text-white mb-2">Requisitos:</h5>
                            <ul className="space-y-1">
                              {job.requirements.map((req, index) => (
                                <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                                  <span className="text-pink-400 mt-1">•</span>
                                  {req}
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
                        Aplicar
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
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Nuestra Cultura</h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="group">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Colaboración</h4>
                  <p className="text-white/70">Trabajamos juntos como un equipo unido, compartiendo conocimientos y apoyándonos mutuamente.</p>
                </div>
                <div className="group">
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Pasión</h4>
                  <p className="text-white/70">Nos apasiona lo que hacemos y creemos en el impacto positivo de nuestro trabajo.</p>
                </div>
                <div className="group">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Code className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Innovación</h4>
                  <p className="text-white/70">Constantemente buscamos nuevas formas de mejorar y revolucionar la industria.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 backdrop-blur-md border-pink-300/30 shadow-xl">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">¿No Encuentras la Posición Perfecta?</h3>
              <p className="text-white/90 mb-6">
                Siempre estamos buscando talento excepcional. Envíanos tu CV y te contactaremos cuando tengamos algo que se ajuste a tu perfil.
              </p>
              <Button 
                onClick={() => navigate('/support')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-3 transition-all duration-300 hover:scale-105"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar CV Espontáneo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Careers;
