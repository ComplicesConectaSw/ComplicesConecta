import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  X, 
  Send,
  Trash2,
  MapPin,
  Globe,
  Lock
} from 'lucide-react';
import { Story } from './StoryTypes';
import { storyService } from './StoryService';

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
  onStoryChange?: (updatedStory: Story) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ 
  story, 
  onClose, 
  onStoryChange 
}) => {
  const [currentStory, setCurrentStory] = useState<Story>(story);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const isDemoMode = localStorage.getItem('demo_authenticated') === 'true';
  const currentUserId = "1"; // Usuario demo

  useEffect(() => {
    // Marcar como vista
    storyService.markAsViewed(currentStory.id);
    
    // Verificar si ya le dio like
    const userLike = currentStory.likes?.find(like => like.userId === currentUserId);
    setIsLiked(!!userLike);

    // Simular progreso de la historia (15 segundos)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onClose();
          return 100;
        }
        return prev + (100 / 150); // 15 segundos = 150 intervalos de 100ms
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStory.id, currentUserId, onClose]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const storyDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - storyDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    return 'Expirada';
  };

  const handleLike = async () => {
    const success = await storyService.likeStory(currentStory.id);
    if (success) {
      setIsLiked(!isLiked);
      // Actualizar el estado local de la historia
      const updatedStory = { ...currentStory };
      if (isLiked) {
        // Quitar like
        updatedStory.likes = updatedStory.likes?.filter(like => like.userId !== currentUserId) || [];
      } else {
        // Agregar like
        const newLike = {
          id: `like_${Date.now()}`,
          storyId: currentStory.id.toString(),
          userId: currentUserId,
          createdAt: new Date(),
          user: { id: currentUserId, name: "Usuario Demo", avatar: "/src/assets/people/profile-1.jpg" }
        };
        updatedStory.likes = updatedStory.likes || [];
        updatedStory.likes.push(newLike);
      }
      setCurrentStory(updatedStory);
      onStoryChange?.(updatedStory);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    const success = await storyService.commentStory(currentStory.id, newComment.trim());
    
    if (success) {
      const updatedStory = { ...currentStory };
      const newCommentObj = {
        id: `comment_${Date.now()}`,
        storyId: currentStory.id.toString(),
        userId: currentUserId,
        comment: newComment.trim(),
        createdAt: new Date(),
        user: { id: currentUserId, name: "Usuario Demo", avatar: "/src/assets/people/profile-1.jpg" }
      };
      
      updatedStory.comments = updatedStory.comments || [];
      updatedStory.comments.push(newCommentObj);
      setCurrentStory(updatedStory);
      onStoryChange?.(updatedStory);
      setNewComment('');
    }
    
    setIsSubmittingComment(false);
  };

  const handleShare = async () => {
    const shareUrl = await storyService.shareStory(currentStory.id);
    if (shareUrl) {
      if (navigator.share) {
        navigator.share({
          title: `Historia de ${currentStory.user.name}`,
          text: currentStory.description || 'Mira esta historia',
          url: shareUrl
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "¡Enlace copiado!",
          description: "El enlace de la historia se ha copiado al portapapeles",
          duration: 3000,
        });
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const success = await storyService.deleteComment(currentStory.id, commentId);
    if (success) {
      const updatedStory = { ...currentStory };
      updatedStory.comments = updatedStory.comments?.filter(c => c.id !== commentId) || [];
      setCurrentStory(updatedStory);
      onStoryChange?.(updatedStory);
    }
  };

  const isOwner = currentStory.userId.toString() === currentUserId;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-full max-w-md h-full max-h-[90vh] mx-4">
        {/* Barra de progreso */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="w-full h-1 bg-white/30 rounded-full">
            <div 
              className="h-full bg-white rounded-full transition-all duration-100 ease-linear" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src={currentStory.user.avatar} 
              alt={currentStory.user.name}
              className="w-8 h-8 rounded-full border-2 border-white"
            />
            <div>
              <p className="text-white font-medium text-sm">{currentStory.user.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-white/70 text-xs">{formatTimeAgo(currentStory.createdAt)}</p>
                {currentStory.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-white/70" />
                    <p className="text-white/70 text-xs">{currentStory.location}</p>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  {currentStory.visibility === 'private' ? (
                    <Lock className="h-3 w-3 text-white/70" />
                  ) : (
                    <Globe className="h-3 w-3 text-white/70" />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Contenido */}
        <Card className="h-full bg-black border-white/20 overflow-hidden">
          {currentStory.content.type === 'image' ? (
            <div className="relative h-full">
              <img 
                src={currentStory.content.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM5MzZFNkYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGNDMzOTYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+8J+TniBJbWFnZW4gTm8gRGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4='} 
                alt="Historia"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM5MzZFNkYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGNDMzOTYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+8J+TniBJbWFnZW4gTm8gRGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
                  target.onerror = null; // Prevenir loops infinitos
                }}
              />
              {currentStory.description && (
                <div className="absolute bottom-20 left-4 right-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-white text-sm drop-shadow-lg">{currentStory.description}</p>
                  </div>
                </div>
              )}
            </div>
          ) : currentStory.content.type === 'video' ? (
            <video 
              src={currentStory.content.url} 
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
              <div className="text-center px-8">
                <p className="text-white text-xl font-bold mb-4">
                  {currentStory.content.text}
                </p>
                {currentStory.description && (
                  <p className="text-white/80 text-sm">{currentStory.description}</p>
                )}
              </div>
            </div>
          )}
        </Card>
        
        {/* Controles inferiores */}
        <div className="absolute bottom-4 left-4 right-4 z-10 space-y-3">
          {/* Stats */}
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{currentStory.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{currentStory.likes?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{currentStory.comments?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleLike}
                size="sm"
                variant="ghost"
                className={`text-white hover:bg-white/10 ${isLiked ? 'text-red-400' : ''}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Button
                onClick={() => setShowComments(!showComments)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleShare}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="space-y-2 mb-3">
                {currentStory.comments && currentStory.comments.length > 0 ? (
                  currentStory.comments
                    .filter(comment => comment.comment && comment.comment.trim().length > 0) // Filtrar comentarios vacíos
                    .map((comment) => (
                      <div key={comment.id} className="flex items-start gap-2">
                        <img 
                          src={comment.user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iIzkzNkU2RiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPuKGkiBCPC90ZXh0Pjwvc3ZnPg=='} 
                          alt={comment.user.name}
                          className="w-6 h-6 rounded-full border border-white/20 flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iIzkzNkU2RiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPuKGkiBCPC90ZXh0Pjwvc3ZnPg==';
                            target.onerror = null;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white text-xs font-medium drop-shadow-md">{comment.user.name}</p>
                            {(isOwner || comment.userId === currentUserId) && (
                              <Button
                                onClick={() => handleDeleteComment(comment.id)}
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0 text-red-400 hover:bg-red-400/10"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-white/90 text-xs drop-shadow-md">{comment.comment}</p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-white/60 text-xs text-center py-2">No hay comentarios aún</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                />
                <Button
                  onClick={handleComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold shadow-lg drop-shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-1" />
                  <span className="drop-shadow-md">Enviar</span>
                </Button>
              </div>
            </div>
          )}

          {/* Demo Notice */}
          {isDemoMode && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2">
              <p className="text-yellow-200 text-xs text-center">
                📱 Modo Demo: Las interacciones son simuladas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

