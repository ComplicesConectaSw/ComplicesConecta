import HeaderNav from '@/components/HeaderNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Star, 
  Zap, 
  Shield, 
  Users,
  Database,
  Palette,
  BarChart3,
  Bell
} from 'lucide-react';

const News: React.FC = () => {
  const navigate = useNavigate();

  const versionUpdates = [
    {
      version: "v3.3.0",
      date: "2025-09-23",
      title: "Dashboard Administrativo y Monitoreo Avanzado",
      type: "major",
      icon: <BarChart3 className="h-6 w-6" />,
      highlights: [
        "Dashboard administrativo completo con 6 subpaneles modulares",
        "Sistema de monitoreo de performance en tiempo real",
        "Analytics avanzados de tokens CMPX/GTK",
        "Sistema de notificaciones push con Firebase FCM",
        "Seguridad avanzada con 2FA y fraud detection"
      ],
      color: "from-blue-500 to-purple-600"
    },
    {
      version: "v3.0.0",
      date: "2025-09-21", 
      title: "Sistema de Temas y Optimización Android",
      type: "major",
      icon: <Palette className="h-6 w-6" />,
      highlights: [
        "5 temas únicos personalizables (Light, Dark, Elegant, Modern, Vibrant)",
        "Selección de tema durante registro con modal interactivo",
        "Optimización completa para Android con Material Design",
        "LazyImageLoader con detección WebP/AVIF",
        "Reducción 30% en tiempo de carga inicial"
      ],
      color: "from-purple-500 to-pink-600"
    },
    {
      version: "v2.1.8",
      date: "2025-01-14",
      title: "Geolocalización y Matches Inteligentes",
      type: "major",
      icon: <Users className="h-6 w-6" />,
      highlights: [
        "Sistema de geolocalización con fórmula de Haversine",
        "Filtros por proximidad: 'Muy cerca' (≤5km), 'En tu zona' (≤15km)",
        "Algoritmo de compatibilidad con scoring inteligente",
        "Chat en tiempo real optimizado con Supabase Realtime",
        "Privacidad de ubicación configurable"
      ],
      color: "from-green-500 to-teal-600"
    },
    {
      version: "v2.1.0 - v2.1.7",
      date: "2025-01-11 - 2025-01-13",
      title: "Consolidación y Estabilidad",
      type: "minor",
      icon: <Shield className="h-6 w-6" />,
      highlights: [
        "Sistema de tokens CMPX/GTK completamente funcional",
        "Auditoría DevOps completa con puntuación 96/100",
        "Navegación unificada y responsiva",
        "Configuración de storage buckets y funciones de BD",
        "Corrección de errores TypeScript críticos"
      ],
      color: "from-orange-500 to-red-600"
    },
    {
      version: "v1.0 - v2.0",
      date: "2024-12 - 2025-01",
      title: "Fundación y Arquitectura Base",
      type: "foundation",
      icon: <Database className="h-6 w-6" />,
      highlights: [
        "Arquitectura base con React + TypeScript + Supabase",
        "Sistema de autenticación y perfiles (single/pareja)",
        "Base de datos con RLS y políticas de seguridad",
        "UI/UX inicial con Tailwind CSS",
        "Funcionalidades core: matches, chat, galería"
      ],
      color: "from-gray-500 to-slate-600"
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'minor': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'foundation': return 'bg-purple-500/20 text-purple-400 border-purple-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'major': return 'Actualización Mayor';
      case 'minor': return 'Mejoras y Correcciones';
      case 'foundation': return 'Versión Fundacional';
      default: return 'Actualización';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800">
      <HeaderNav />
      
      {/* Page Header */}
      <div className="bg-black/80 backdrop-blur-md border-b border-white/30 p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10 flex items-center gap-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Regresar</span>
          </Button>
          
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Star className="h-6 w-6" />
            Novedades y Actualizaciones
          </h1>
          
          <div className="w-16 sm:w-20" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Introducción */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5" />
              Evolución de ComplicesConecta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/90 leading-relaxed">
              Descubre todas las mejoras, nuevas funcionalidades y optimizaciones que hemos implementado 
              desde el lanzamiento de ComplicesConecta. Cada actualización está diseñada para mejorar 
              tu experiencia y la seguridad de la plataforma.
            </p>
          </CardContent>
        </Card>

        {/* Timeline de Versiones */}
        <div className="space-y-6">
          {versionUpdates.map((update, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${update.color} text-white flex-shrink-0`}>
                    {update.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{update.title}</h3>
                      <Badge className={getTypeColor(update.type)}>
                        {getTypeLabel(update.type)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 text-white/70">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{update.date}</span>
                      </div>
                      <Badge className="border-white/30 text-white border bg-transparent">
                        {update.version}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white/90 mb-3">Principales novedades:</h4>
                      <ul className="space-y-2">
                        {update.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-white/80">
                            <div className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm leading-relaxed">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Estadísticas de Desarrollo */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5" />
              Estadísticas de Desarrollo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-300">50+</div>
                <div className="text-sm text-white/70">Funcionalidades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300">15+</div>
                <div className="text-sm text-white/70">Versiones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-300">100%</div>
                <div className="text-sm text-white/70">TypeScript</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300">96/100</div>
                <div className="text-sm text-white/70">Puntuación QA</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próximas Actualizaciones */}
        <Card className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bell className="h-5 w-5" />
              Próximas Actualizaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-white/90">Integración MongoDB Atlas para analytics avanzados</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-white/90">Sistema de video chat P2P con WebRTC</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/90">Marketplace de productos premium</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span className="text-white/90">Notificaciones push nativas mejoradas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Button
            onClick={() => navigate('/feedback')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3"
          >
            <Star className="h-4 w-4 mr-2" />
            Comparte tu Feedback
          </Button>
          <p className="text-white/60 text-sm mt-2">
            Tu opinión nos ayuda a mejorar la plataforma
          </p>
        </div>
      </div>
    </div>
  );
};

export default News;
