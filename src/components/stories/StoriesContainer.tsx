import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    return localStorage.getItem('demo_authenticated') === 'true';
  };

  const isAuthenticated = () => {
    return isDemoMode() || localStorage.getItem('authenticated') === 'true';
  };

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const fetchedStories = await storyService.getStories();
      setStories(fetchedStories);
    } catch (error) {
      logger.error('Error loading stories:', { error: error instanceof Error ? error.message : String(error) });
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
      <Card className="p-8 text-center bg-black/30 backdrop-blur-sm border-white/10">
        <Camera className="h-16 w-16 mx-auto mb-4 text-white/50" />
        <h3 className="text-xl font-semibold text-white mb-2">Historias Efímeras</h3>
        <p className="text-white/70 mb-4">
          Comparte momentos que desaparecen en 24 horas. Únete para ver y crear historias.
        </p>
        <div className="grid grid-cols-3 gap-2 mb-6 opacity-50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>
          ))}
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
          <Crown className="h-4 w-4 mr-2" />
          Registrarse para Ver Historias
        </Button>
      </Card>
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
                src={story.content.url} 
                alt="Historia"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
              
              {/* Avatar del usuario */}
              <div className="absolute top-2 left-2">
                <img 
                  src={story.user.avatar} 
                  alt={story.user.name}
                  className="w-6 h-6 rounded-full border-2 border-white"
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
        <div className="grid grid-cols-3 gap-4 text-center">
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
