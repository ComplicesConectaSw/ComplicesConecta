import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Clock, Eye, Heart, Users, Zap, Shield, Star } from 'lucide-react';
import HeaderNav from '@/components/HeaderNav';

const StoriesInfo = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Clock,
      title: "24 Horas de Duración",
      description: "Contenido que desaparece automáticamente después de 24 horas para máxima privacidad"
    },
    {
      icon: Eye,
      title: "Control de Privacidad",
      description: "Decide quién puede ver tus historias con controles granulares de audiencia"
    },
    {
      icon: Heart,
      title: "Interacciones Privadas",
      description: "Reacciones y comentarios privados que solo tú puedes ver"
    },
    {
      icon: Users,
      title: "Conexiones Auténticas",
      description: "Comparte momentos reales con personas que comparten tus intereses"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Engagement Instantáneo",
      description: "Aumenta tu visibilidad y conexiones de manera natural"
    },
    {
      icon: Shield,
      title: "Seguridad Total",
      description: "Contenido encriptado y verificación de usuarios para tu tranquilidad"
    },
    {
      icon: Star,
      title: "Experiencia Premium",
      description: "Funciones exclusivas para miembros de la comunidad lifestyle"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-indigo-900">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <Camera className="h-12 w-12 text-pink-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Historias Efímeras de ComplicesConecta
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Comparte momentos auténticos que desaparecen automáticamente en 24 horas. 
              Conecta de manera más íntima y espontánea con otros miembros de la comunidad.
            </p>
          </div>

          {/* ¿Qué son las Historias? */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-white">¿Qué son las Historias Efímeras?</CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Una nueva forma de compartir y conectar en la comunidad lifestyle
              </CardDescription>
            </CardHeader>
            <CardContent className="text-white/80 space-y-4">
              <p>
                Las Historias Efímeras son una función exclusiva que permite a los miembros de ComplicesConecta 
                compartir momentos auténticos de su vida diaria, experiencias y pensamientos de manera temporal.
              </p>
              <p>
                A diferencia del contenido permanente, estas historias desaparecen automáticamente después de 24 horas, 
                creando un ambiente más relajado y espontáneo para la expresión personal.
              </p>
              <p>
                Perfectas para mostrar tu personalidad real, compartir momentos especiales, o simplemente 
                conectar de manera más casual con otros miembros que comparten tus intereses.
              </p>
            </CardContent>
          </Card>

          {/* Características */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Características Principales</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                          <p className="text-white/70">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Beneficios y Potencial */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Potencial y Beneficios</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm text-center">
                    <CardContent className="p-6">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">{benefit.title}</h3>
                      <p className="text-white/70">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Ejemplos de Uso */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Ejemplos de Historias Populares</CardTitle>
            </CardHeader>
            <CardContent className="text-white/80">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Camera className="h-8 w-8 text-pink-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Cena romántica en casa</h4>
                  <p className="text-sm text-white/70">Comparte momentos íntimos y especiales</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Users className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Viaje de fin de semana</h4>
                  <p className="text-sm text-white/70">Aventuras y experiencias únicas</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Heart className="h-8 w-8 text-red-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Momento especial juntos</h4>
                  <p className="text-sm text-white/70">Conexiones auténticas y reales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <Button 
              onClick={() => navigate('/stories')}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 text-lg font-semibold"
            >
              Explorar Historias
            </Button>
            <p className="text-white/60 mt-4">
              Únete a la comunidad y comienza a compartir tus momentos especiales
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoriesInfo;
