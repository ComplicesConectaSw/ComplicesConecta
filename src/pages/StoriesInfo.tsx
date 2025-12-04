import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Camera, Clock, Eye, Heart, Users, Zap, Shield, Star } from 'lucide-react';
import HeaderNav from '@/components/HeaderNav';

const StoriesInfo = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Clock,
      title: "24 Horas de Duracin",
      description: "Contenido que desaparece automticamente despus de 24 horas para maxima privacidad"
    },
    {
      icon: Eye,
      title: "Control de Privacidad",
      description: "Decide quin puede ver tus historias con controles granulares de audiencia"
    },
    {
      icon: Heart,
      title: "Interacciones Privadas",
      description: "Reacciones y comentarios privados que solo tu puedes ver"
    },
    {
      icon: Users,
      title: "Conexiones Autnticas",
      description: "Comparte momentos reales con personas que comparten tus intereses"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Engagement Instantneo",
      description: "Aumenta tu visibilidad y conexiones de manera natural"
    },
    {
      icon: Shield,
      title: "Seguridad Total",
      description: "Contenido encriptado y verificacin de usuarios para tu tranquilidad"
    },
    {
      icon: Star,
      title: "Experiencia Premium",
      description: "Funciones exclusivas para miembros de la comunidad lifestyle"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-black text-zinc-100">
      <HeaderNav />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-24">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-900/40">
            <Camera className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Historias Efímeras ComplicesConecta
          </h1>
          <p className="mt-4 text-base text-zinc-300 max-w-3xl mx-auto">
            Comparte momentos auténticos que desaparecen en 24 horas. Controlas quién ve tus historias
            y cómo interactúan contigo.
          </p>
        </div>

        <Card className="mb-10 border-white/10 bg-black/50 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">¿Qué son las Historias Efímeras?</CardTitle>
            <CardDescription className="text-zinc-300">
              El formato más íntimo de la plataforma: contenido temporal, protegido y verificado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-zinc-200">
            <p>
              Las Historias permiten publicar escenas reales sin presión, sabiendo que desaparecerán en 24
              horas. Nada queda para capturas o divulgaciones.
            </p>
            <p>
              Puedes segmentar por ciudad, permitir comentarios privados o solo reacciones, y activar filtros
              anti-screen para garantizar que cada visualización quede registrada.
            </p>
            <p>
              Perfecto para mostrar tu estilo de vida de forma confidencial y atraer conexiones compatibles.
            </p>
          </CardContent>
        </Card>

        <div className="mb-12">
          <h2 className="text-center text-3xl font-semibold text-white mb-8">Características principales</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-white/10 bg-white/5">
                  <CardContent className="flex items-start gap-4 p-6 text-sm text-zinc-200">
                    <div className="rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 p-3">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                      <p className="mt-2 text-zinc-300">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-center text-3xl font-semibold text-white mb-8">Beneficios exclusivos</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="border-white/10 bg-black/40 text-center">
                  <CardContent className="p-6">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{benefit.title}</h3>
                    <p className="mt-2 text-sm text-zinc-300">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="mb-10 border-white/10 bg-black/50 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Ideas de historias populares</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {["Cena romántica", "Weekend trip", "Behind the scenes"].map((title, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <Camera className="mx-auto mb-3 h-8 w-8 text-purple-300" />
                <h4 className="font-semibold text-white">{title}</h4>
                <p className="text-xs text-zinc-300">Comparte la vibra real sin miedo a filtraciones.</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-purple-900/70 via-indigo-900/60 to-purple-900/70 p-8 text-center shadow-2xl shadow-purple-900/30">
          <h2 className="text-2xl font-semibold text-white">Activa tus historias efímeras</h2>
          <p className="mt-3 text-sm text-zinc-300">
            Verifica tu perfil, obtén el badge oficial y desbloquea métricas de visualizaciones privadas.
          </p>
          <Button
            onClick={() => navigate('/auth')}
            className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 text-white shadow-xl hover:from-purple-500 hover:to-indigo-500"
          >
            Comenzar registro
          </Button>
          <p className="mt-3 text-xs text-zinc-400">
            Control total sobre audiencia • Reportes instantáneos • Anti-screen activo
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoriesInfo;

