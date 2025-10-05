import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Clock, CheckCircle, Loader2, Plus } from 'lucide-react';
import { Header } from '@/components/Header';
import NavigationEnhanced from "@/components/NavigationEnhanced";
import { postsService, type Post } from '@/services/postsService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
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
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Feed <span className="bg-love-gradient bg-clip-text text-transparent">Lifestyle</span>
          </h1>
          <p className="text-white">
            Descubre las experiencias de la comunidad 🔥
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
              <h3 className="text-xl font-semibold text-white mb-2">¡Sé el primero en publicar!</h3>
              <p className="text-white/80 mb-4">Comparte tus experiencias con la comunidad lifestyle</p>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Crear publicación
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
                        src={post.profile?.avatar_url || '/compliceslogo.png'}
                        alt={post.profile?.name || 'Usuario'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-foreground">
                            {post.profile?.name || 'Usuario Anónimo'}
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
                        src={post.image_url}
                        alt="Post image"
                        className="w-full rounded-lg max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex items-center justify-between p-4 pt-3 border-t border-border/50">
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={() => handleLike(post)}
                        className="flex items-center space-x-2 text-muted-foreground hover:text-red-500 bg-transparent hover:bg-white/10 border-none px-2 py-1 text-sm"
                      >
                        <Heart className="w-5 h-5" />
                        <span>{post.likes_count}</span>
                      </Button>
                      
                      <Button className="flex items-center space-x-2 text-muted-foreground bg-transparent hover:bg-white/10 border-none px-2 py-1 text-sm">
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.comments_count}</span>
                      </Button>
                    </div>
                    
                    <Button className="text-muted-foreground bg-transparent hover:bg-white/10 border-none px-2 py-1 text-sm">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Botón para cargar más */}
        {!loading && posts.length > 0 && hasMore && (
          <div className="text-center mt-8">
            <Button 
              className="px-8 text-white border border-white/30 hover:bg-white/10 bg-transparent"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cargando...
                </>
              ) : (
                'Cargar más publicaciones'
              )}
            </Button>
          </div>
        )}
      </main>

      <NavigationEnhanced />
    </div>
  );
};

export default Feed;
