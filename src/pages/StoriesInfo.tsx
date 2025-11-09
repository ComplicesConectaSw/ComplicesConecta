import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Camera, Clock, Eye, Heart, Users, Zap, Shield, Star } from 'lucide-react';
import HeaderNav from '@/components/HeaderNav';

const StoriesInfo = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Clock,
      title: "24 Horas de Duraci�n",
      description: "Contenido que desaparece autom�ticamente despu�s de 24 horas para m�xima privacidad"
    },
    {
      icon: Eye,
      title: "Control de Privacidad",
      description: "Decide qui�n puede ver tus historias con controles granulares de audiencia"
    },
    {
      icon: Heart,
      title: "Interacciones Privadas",
      description: "Reacciones y comentarios privados que solo t� puedes ver"
    },
    {
      icon: Users,
      title: "Conexiones Aut�nticas",
      description: "Comparte momentos reales con personas que comparten tus intereses"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Engagement Instant�neo",
      description: "Aumenta tu visibilidad y conexiones de manera natural"
    },
    {
      icon: Shield,
      title: "Seguridad Total",
      description: "Contenido encriptado y verificaci�n de usuarios para tu tranquilidad"
    },
    {
      icon: Star,
      title: "Experiencia Premium",
      description: "Funciones exclusivas para miembros de la comunidad lifestyle"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <Camera className="h-12 w-12 text-purple-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Historias Ef�meras de ComplicesConecta
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Comparte momentos aut�nticos que desaparecen autom�ticamente en 24 horas. 
              Conecta de manera m�s �ntima y espont�nea con otros miembros de la comunidad.
            </p>
          </div>

          {/* �Qu� son las Historias? */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-white">�Qu� son las Historias Ef�meras?</CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Una nueva forma de compartir y conectar en la comunidad lifestyle
              </CardDescription>
            </CardHeader>
            <CardContent className="text-white/80 space-y-4">
              <p>
                Las Historias Ef�meras son una funci�n exclusiva que permite a los miembros de ComplicesConecta 
                compartir momentos aut�nticos de su vida diaria, experiencias y pensamientos de manera temporal.
              </p>
              <p>
                A diferencia del contenido permanente, estas historias desaparecen autom�ticamente despu�s de 24 horas, 
                creando un ambiente m�s relajado y espont�neo para la expresi�n personal.
              </p>
              <p>
                Perfectas para mostrar tu personalidad real, compartir momentos especiales, o simplemente 
                conectar de manera m�s casual con otros miembros que comparten tus intereses.
              </p>
            </CardContent>
          </Card>

          {/* Caracter�sticas */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Caracter�sticas Principales</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
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
                        <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
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
                  <Camera className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Cena rom�ntica en casa</h4>
                  <p className="text-sm text-white/70">Comparte momentos �ntimos y especiales</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Users className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Viaje de fin de semana</h4>
                  <p className="text-sm text-white/70">Aventuras y experiencias �nicas</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Heart className="h-8 w-8 text-red-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Momento especial juntos</h4>
                  <p className="text-sm text-white/70">Conexiones aut�nticas y reales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <Button 
              onClick={() => navigate('/stories')}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold"
            >
              Explorar Historias
            </Button>
            <p className="text-white/60 mt-4">
              �nete a la comunidad y comienza a compartir tus momentos especiales
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoriesInfo;
