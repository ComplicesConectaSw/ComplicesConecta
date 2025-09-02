import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Lock
} from "lucide-react";

// Check if user is in demo mode
const isDemoMode = () => {
  return localStorage.getItem('demo_authenticated') === 'true';
};

import { useFeatures } from "@/hooks/useFeatures";
import { mockStories, Story } from "@/lib/data";

const Stories = () => {
  const { features } = useFeatures();
  const [stories] = useState<Story[]>(mockStories);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

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
    // Lógica para crear nueva historia
    console.log('Crear nueva historia...');
  };

  const canViewStory = (story: Story) => {
    // En modo demo, todas las historias están disponibles
    if (isDemoMode()) {
      return true;
    }
    return features.stories;
  };

  const handleViewStory = (story: Story) => {
    if (canViewStory(story)) {
      setSelectedStory(story);
      // Marcar como vista
    }
  };

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
              
              {/* Indicador de tiempo */}
              <div className="absolute top-2 right-2">
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
              </div>
              
              {/* Nombre del usuario */}
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-xs font-medium truncate">
                  {story.user.name}
                </p>
              </div>
              
              {/* Indicador de tipo de contenido */}
              {story.content.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>

      {/* Estadísticas de historias */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10 p-4">
        <h3 className="font-semibold text-white mb-3">Estadísticas de Historias</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-white/70 text-sm">Historias creadas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">156</p>
            <p className="text-white/70 text-sm">Visualizaciones</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">23</p>
            <p className="text-white/70 text-sm">Interacciones</p>
          </div>
        </div>
      </Card>

      {/* Modal de historia */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative w-full max-w-md h-full max-h-[80vh] mx-4">
            {/* Barra de progreso */}
            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="w-full h-1 bg-white/30 rounded-full">
                <div className="h-full bg-white rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            
            {/* Header */}
            <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img 
                  src={selectedStory.user.avatar} 
                  alt={selectedStory.user.name}
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <div>
                  <p className="text-white font-medium text-sm">{selectedStory.user.name}</p>
                  <p className="text-white/70 text-xs">{formatTimeAgo(selectedStory.createdAt)}</p>
                </div>
              </div>
              
              <Button
                onClick={() => setSelectedStory(null)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>
            
            {/* Contenido */}
            <Card className="h-full bg-black border-white/20 overflow-hidden">
              {selectedStory.content.type === 'image' ? (
                <img 
                  src={selectedStory.content.url} 
                  alt="Historia"
                  className="w-full h-full object-cover"
                />
              ) : selectedStory.content.type === 'video' ? (
                <video 
                  src={selectedStory.content.url} 
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                  <p className="text-white text-xl font-bold text-center px-8">
                    {selectedStory.content.text}
                  </p>
                </div>
              )}
            </Card>
            
            {/* Controles inferiores */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">{selectedStory.views}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
