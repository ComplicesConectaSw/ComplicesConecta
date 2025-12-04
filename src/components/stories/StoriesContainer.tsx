import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Play, 
  Eye, 
  Plus,
  Crown,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Lock,
  Globe
} from 'lucide-react';
import { useFeatures } from '@/hooks/useFeatures';
import { Story } from './StoryTypes';
import { storyService } from './StoryService';
import { safeGetItem } from '@/utils/safeLocalStorage';
import { CreateStory } from './CreateStory';
import { StoryViewer } from './StoryViewer';
import { logger } from '@/lib/logger';

const StoriesContainer: React.FC = () => {
  const { features } = useFeatures();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [loading, setLoading] = useState(true);

  const isDemoMode = () => {
    return safeGetItem<string>('demo_authenticated', { validate: true, defaultValue: 'false' }) === 'true';
  };

  const isAuthenticated = () => {
    return isDemoMode() || safeGetItem<string>('authenticated', { validate: true, defaultValue: 'false' }) === 'true';
  };

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      logger.info('🎬 Cargando stories...');
      
      if (isDemoMode()) {
        // Demo stories with placeholders
        const demoStories: Story[] = [
          {
            id: 1,
            userId: 1,
            content: {
              type: 'image',
              url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=600&fit=crop&crop=faces&auto=format&q=80'
            },
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 22 hours from now
            views: 15,
            isViewed: false,
            description: 'Cena íntima en casa 🍷✨',
            visibility: 'public',
            user: {
              name: 'Ana García',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces&auto=format&q=80'
            },
            location: 'Ciudad de México'
          },
          {
            id: 2,
            userId: 2,
            content: {
              type: 'image',
              url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop&crop=faces&auto=format&q=80'
            },
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
            expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), // 20 hours from now
            views: 8,
            isViewed: false,
            description: 'Escapada de fin de semana 🌅',
            visibility: 'public',
            user: {
              name: 'Carlos López',
              avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop&crop=faces&auto=format&q=80'
            },
            location: 'Guadalajara'
          },
          {
            id: 3,
            userId: 3,
            content: {
              type: 'image',
              url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop&crop=faces&auto=format&q=80'
            },
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18 hours from now
            views: 23,
            isViewed: false,
            description: 'Momento especial juntos 💕',
            visibility: 'private',
            user: {
              name: 'María Rodríguez',
              avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces&auto=format&q=80'
            },
            location: 'Monterrey'
          },
          {
            id: 4,
            userId: 4,
            content: {
              type: 'video',
              url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&crop=faces&auto=format&q=80'
            },
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
            expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(), // 23 hours from now
            views: 12,
            isViewed: true,
            description: 'Video íntimo para conexiones especiales 🔥',
            visibility: 'private',
            user: {
              name: 'Roberto & Sofía',
              avatar: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=100&h=100&fit=crop&crop=faces&auto=format&q=80'
            },
            location: 'Puebla'
          },
          {
            id: 5,
            userId: 5,
            content: {
              type: 'image',
              url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=600&fit=crop&crop=faces&auto=format&q=80'
            },
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
            expiresAt: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString(), // 21 hours from now
            views: 19,
            isViewed: false,
            description: 'Celebración especial de la comunidad 🎉',
            visibility: 'public',
            user: {
              name: 'Carmen & Luis',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces&auto=format&q=80'
            },
            location: 'Tijuana'
          }
        ];
        
        logger.info('🎬 Demo stories cargadas:', { count: demoStories.length });
        setStories(demoStories);
      } else {
        // Production stories from database
        const fetchedStories = await storyService.getStories();
        logger.info('🎬 Stories cargadas:', { count: fetchedStories.length });
        setStories(fetchedStories);
      }
    } catch (error) {
      logger.error('Error loading stories:', { error: error instanceof Error ? error.message : String(error) });
      // En caso de error, cargar stories demo como fallback
      if (isDemoMode()) {
        logger.info('🎬 Cargando stories demo como fallback');
        setStories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const storyDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - storyDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    return 'Expirada';
  };

  const isExpired = (expiresAt: string) => {
    return new Date() > new Date(expiresAt);
  };

  const handleCreateStory = () => {
    if (!isAuthenticated()) {
      // Mostrar modal de registro/login
      return;
    }
    setShowCreateStory(true);
  };

  const handleStoryCreated = () => {
    loadStories();
  };

  const handleViewStory = (story: Story) => {
    if (!isAuthenticated()) {
      // Mostrar modal de registro/login
      return;
    }
    setSelectedStory(story);
  };

  const handleStoryChange = (updatedStory: Story) => {
    setStories(prev => prev.map(s => s.id === updatedStory.id ? updatedStory : s));
  };

  // Preview para usuarios no registrados
  if (!isAuthenticated()) {
    return (
      <div className="space-y-6">
        {/* Descripción detallada de la funcionalidad */}
        <Card className="bg-black/30 backdrop-blur-sm border-white/10 p-6">
          <div className="text-center mb-6">
            <Camera className="h-16 w-16 mx-auto mb-4 text-purple-400" />
            <h3 className="text-2xl font-semibold text-white mb-3">Historias Efímeras de ComplicesConecta</h3>
            <p className="text-white/90 text-lg leading-relaxed max-w-3xl mx-auto">
              Comparte momentos auténticos que desaparecen automáticamente en 24 horas. 
              Conecta de manera más íntima y espontánea con otros miembros de la comunidad swinger mexicana.
            </p>
          </div>

          {/* Características principales */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <h4 className="font-semibold text-white mb-1">24 Horas</h4>
              <p className="text-white/70 text-sm">Contenido que desaparece automáticamente</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <Eye className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <h4 className="font-semibold text-white mb-1">Privacidad</h4>
              <p className="text-white/70 text-sm">Control total sobre quién ve tus historias</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <Heart className="h-8 w-8 mx-auto mb-2 text-pink-400" />
              <h4 className="font-semibold text-white mb-1">Interacción</h4>
              <p className="text-white/70 text-sm">Reacciones y comentarios privados</p>
            </div>
          </div>

          {/* Ejemplos de historias */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3 text-center">Ejemplos de Historias Populares</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=400&fit=crop&crop=faces&auto=format&q=80" 
                  alt="Cena íntima"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-2">
                  <Camera className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium text-center">Cena íntima en casa</span>
                </div>
              </div>
              <div className="aspect-square bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=faces&auto=format&q=80" 
                  alt="Viaje de fin de semana"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-2">
                  <Globe className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium text-center">Escapada de fin de semana</span>
                </div>
              </div>
              <div className="aspect-square bg-gradient-to-br from-orange-500 to-red-500 rounded-lg relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=400&fit=crop&crop=faces&auto=format&q=80" 
                  alt="Momento especial"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-2">
                  <MessageCircle className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium text-center">Momento especial juntos</span>
                </div>
              </div>
              <div className="aspect-square bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop&crop=faces&auto=format&q=80" 
                  alt="Celebración"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-2">
                  <Heart className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium text-center">Celebración especial</span>
                </div>
              </div>
              <div className="aspect-square bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=faces&auto=format&q=80" 
                  alt="Video íntimo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-2">
                  <Play className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium text-center">Video íntimo</span>
                </div>
              </div>
              <div className="aspect-square bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces&auto=format&q=80" 
                  alt="Aventura compartida"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-2">
                  <Share2 className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium text-center">Aventura compartida</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tipos de contenido */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-400/20">
            <h4 className="font-semibold text-white mb-2">¿Qué puedes compartir?</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-purple-400" />
                <span>Fotos de momentos especiales</span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-blue-400" />
                <span>Videos cortos (hasta 30 segundos)</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-400" />
                <span>Momentos íntimos y románticos</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-green-400" />
                <span>Experiencias y aventuras</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-yellow-400" />
                <span>Contenido privado para parejas</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-400" />
                <span>Viajes y escapadas</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-orange-400" />
                <span>Eventos exclusivos de la comunidad</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-indigo-400" />
                <span>Mensajes especiales para conexiones</span>
              </div>
            </div>
          </div>

          {/* Beneficios adicionales */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-teal-500/10 rounded-lg border border-blue-400/20">
            <h4 className="font-semibold text-white mb-2">Beneficios de las Historias</h4>
            <div className="grid md:grid-cols-3 gap-3 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>Desaparecen automáticamente en 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-400" />
                <span>Control de privacidad total</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-purple-400" />
                <span>Comentarios privados</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-yellow-400" />
                <span>Contenido solo para conexiones</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-400" />
                <span>Reacciones discretas</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-orange-400" />
                <span>Acceso exclusivo a eventos</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg">
              <Crown className="h-5 w-5 mr-2" />
              Únete para Ver y Crear Historias
            </Button>
            <p className="text-white/60 text-sm mt-2">
              Regístrate gratis y comienza a compartir tus momentos especiales
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Check premium access for non-demo users
  if (!features.stories && !isDemoMode()) {
    return (
      <Card className="p-8 text-center bg-black/30 backdrop-blur-sm border-white/10">
        <Camera className="h-16 w-16 mx-auto mb-4 text-white/50" />
        <h3 className="text-xl font-semibold text-white mb-2">Historias Efímeras</h3>
        <p className="text-white/70 mb-4">
          Comparte momentos que desaparecen en 24 horas con tu membresía Premium.
        </p>
        <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
          <Crown className="h-4 w-4 mr-2" />
          Actualizar a Premium
        </Button>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-8 text-center bg-black/30 backdrop-blur-sm border-white/10">
        <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white/70">Cargando historias...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center">
            <Camera className="h-6 w-6 mr-2 text-purple-400" />
            Historias
          </h2>
          <p className="text-white/70 text-sm">Momentos que desaparecen en 24 horas</p>
        </div>
        
        <Button
          onClick={handleCreateStory}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Historia
        </Button>
      </div>

      {/* Lista de historias */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {/* Tu historia */}
        <div className="flex-shrink-0">
          <Card 
            className="w-24 h-32 bg-black/30 backdrop-blur-sm border-white/10 cursor-pointer hover:scale-105 transition-transform relative overflow-hidden"
            onClick={handleCreateStory}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mb-2">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium">Tu Historia</span>
            </div>
          </Card>
        </div>

        {/* Historias de otros usuarios */}
        {stories.map((story) => (
          <div key={story.id} className="flex-shrink-0">
            <Card 
              className={`w-24 h-32 cursor-pointer hover:scale-105 transition-transform relative overflow-hidden ${
                story.isViewed ? 'border-gray-500' : 'border-purple-500 border-2'
              }`}
              onClick={() => handleViewStory(story)}
            >
              <img 
                src={story.content.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM5MzZFNkYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGNDMzOTYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+8J+TniBJbWFnZW48L3RleHQ+PC9zdmc+'} 
                alt="Historia"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM5MzZFNkYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGNDMzOTYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+8J+TniBJbWFnZW48L3RleHQ+PC9zdmc+';
                  target.onerror = null;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
              
              {/* Avatar del usuario */}
              <div className="absolute top-2 left-2">
                <img 
                  src={story.user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iIzkzNkU2RiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPuKGkiBCPC90ZXh0Pjwvc3ZnPg=='} 
                  alt={story.user.name}
                  className="w-6 h-6 rounded-full border-2 border-white"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iIzkzNkU2RiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPuKGkiBCPC90ZXh0Pjwvc3ZnPg==';
                    target.onerror = null;
                  }}
                />
              </div>
              
              {/* Indicadores */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs px-1 py-0 ${
                    isExpired(story.expiresAt) 
                      ? 'border-red-500 text-red-400' 
                      : 'border-white/50 text-white'
                  }`}
                >
                  <Clock className="h-2 w-2 mr-1" />
                  {formatTimeAgo(story.createdAt)}
                </Badge>
                
                {story.visibility === 'private' && (
                  <Badge variant="outline" className="text-xs px-1 py-0 border-yellow-500 text-yellow-400">
                    <Lock className="h-2 w-2" />
                  </Badge>
                )}
              </div>
              
              {/* Nombre del usuario */}
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-xs font-medium truncate">
                  {story.user.name}
                </p>
                {story.location && (
                  <p className="text-white/70 text-xs truncate">
                    {story.location}
                  </p>
                )}
              </div>
              
              {/* Indicador de tipo de contenido */}
              {story.content.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              {/* Stats overlay */}
              <div className="absolute bottom-8 left-2 right-2 flex items-center justify-between text-white text-xs">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{story.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3 w-3" />
                    <span>{story.likes?.length || 0}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Estadísticas de historias */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10 p-4">
        <h3 className="font-semibold text-white mb-3">Estadísticas de Historias</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{stories.length}</p>
            <p className="text-white/70 text-sm">Historias activas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {stories.reduce((sum, story) => sum + story.views, 0)}
            </p>
            <p className="text-white/70 text-sm">Visualizaciones</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {stories.reduce((sum, story) => sum + (story.likes?.length || 0) + (story.comments?.length || 0), 0)}
            </p>
            <p className="text-white/70 text-sm">Interacciones</p>
          </div>
        </div>
      </Card>

      {/* Modals */}
      {showCreateStory && (
        <CreateStory
          onStoryCreated={handleStoryCreated}
          onClose={() => setShowCreateStory(false)}
        />
      )}

      {selectedStory && (
        <StoryViewer
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          onStoryChange={handleStoryChange}
        />
      )}
    </div>
  );
};

export default StoriesContainer;

