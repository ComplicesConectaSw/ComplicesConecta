import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Clock, CheckCircle, Loader2, Plus } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { postsService, type Post } from '@/services/postsService';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/lib/logger';

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, _setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { isAuthenticated: _isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Cargar posts iniciales
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (pageNum = 0) => {
    try {
      if (pageNum === 0) setLoading(true);

      const newPosts = await postsService.getFeed(pageNum, 20);
      
      if (pageNum === 0) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === 20);
      setPage(pageNum);
    } catch (error) {
      logger.error('Error loading posts', { error });
      toast({
        title: "Error",
        description: "No se pudieron cargar las publicaciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (post: Post) => {
    try {
      const newLikedState = await postsService.toggleLike(post.id);
        
      // Actualizar el contador de likes en el post
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === post.id 
            ? { ...p, likes_count: p.likes_count + (newLikedState ? 1 : -1) }
            : p
        )
      );
    } catch (error) {
      logger.error('Error toggling like', { error });
      toast({
        title: "Error",
        description: "No se pudo procesar el like",
        variant: "destructive"
      });
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadPosts(page + 1);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Ahora';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString('es-MX');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Feed <span className="bg-love-gradient bg-clip-text text-transparent">Lifestyle</span>
          </h1>
          <p className="text-white">
            Descubre las experiencias de la comunidad ??
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <span className="ml-2 text-white">Cargando publicaciones...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-white mb-2">S el primero en publicar!</h3>
              <p className="text-white/80 mb-4">Comparte tus experiencias con la comunidad lifestyle</p>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Crear publicacin
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="bg-card/80 backdrop-blur-sm border-accent/20 overflow-hidden">
                <CardContent className="p-0">
                  {/* Header del post */}
                  <div className="flex items-center justify-between p-4 pb-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.profile?.avatar_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzkzNkU2RiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPuKGkiBCPC90ZXh0Pjwvc3ZnPg=='}
                        alt={post.profile?.name || 'Usuario'}
                        className="w-10 h-10 rounded-full object-cover border border-purple-400/30"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzkzNkU2RiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPuKGkiBCPC90ZXh0Pjwvc3ZnPg==';
                          target.onerror = null;
                        }}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-foreground">
                            {post.profile?.name || 'Usuario Annimo'}
                          </h3>
                          {post.profile?.is_verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground space-x-2">
                          {post.location && (
                            <>
                              <MapPin className="w-3 h-3" />
                              <span>{post.location}</span>
                            </>
                          )}
                          <Clock className="w-3 h-3 ml-2" />
                          <span>{formatTimeAgo(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-transparent hover:bg-white/10 border-none px-2 py-1 text-sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Contenido del post */}
                  <div className="px-4 pb-3">
                    <p className="text-foreground leading-relaxed">{post.content}</p>
                  </div>

                  {/* Imagen si existe */}
                  {post.image_url && (
                    <div className="px-4 pb-3">
                      <img
                        src={post.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM5MzZFNkYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGNDMzOTYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+8J+TniBJbWFnZW48L3RleHQ+PC9zdmc+'}
                        alt="Post image"
                        className="w-full rounded-lg max-h-96 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM5MzZFNkYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGNDMzOTYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+8J+TniBJbWFnZW48L3RleHQ+PC9zdmc+';
                          target.onerror = null;
                        }}
                      />
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex items-center justify-between p-4 pt-3 border-t border-border/50">
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={() => handleLike(post)}
                        className="flex items-center space-x-2 text-white hover:text-red-400 bg-transparent hover:bg-white/10 border-none px-2 py-1 text-sm font-semibold drop-shadow-md"
                      >
                        <Heart className="w-5 h-5" />
                        <span className="drop-shadow-md">{post.likes_count}</span>
                      </Button>
                      
                      <Button className="flex items-center space-x-2 text-white bg-transparent hover:bg-white/10 border-none px-2 py-1 text-sm font-semibold drop-shadow-md">
                        <MessageCircle className="w-5 h-5" />
                        <span className="drop-shadow-md">{post.comments_count}</span>
                      </Button>
                    </div>
                    
                    <Button className="text-white bg-transparent hover:bg-white/10 border-none px-2 py-1 text-sm drop-shadow-md">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Botn para cargar ms */}
        {!loading && posts.length > 0 && hasMore && (
          <div className="text-center mt-8">
            <Button 
              className="px-8 py-3 text-white font-semibold border-2 border-white/50 hover:bg-white/20 bg-gradient-to-r from-purple-600/50 to-blue-600/50 backdrop-blur-sm shadow-lg drop-shadow-lg transition-all duration-300"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="drop-shadow-md">Cargando...</span>
                </>
              ) : (
                <span className="drop-shadow-md">Cargar ms publicaciones</span>
              )}
            </Button>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
};

export default Feed;
