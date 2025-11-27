import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Clock, CheckCircle, Loader2, Plus } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { postsService, type Post } from '@/services/postsService';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/lib/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { SafeImage } from '@/shared/ui/SafeImage';

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, _setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const { isAuthenticated: _isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Cargar posts iniciales y estado de likes
  useEffect(() => {
    loadPosts();
    
    // Cargar likes guardados en localStorage
    const likedPostsStr = localStorage.getItem('demo_liked_posts') || '[]';
    const savedLikedPosts: string[] = JSON.parse(likedPostsStr);
    setLikedPosts(new Set(savedLikedPosts));
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
      
      // Actualizar estado de likes para animación
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (newLikedState) {
          newSet.add(post.id);
        } else {
          newSet.delete(post.id);
        }
        return newSet;
      });
        
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

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleShare = (post: Post) => {
    // En modo demo, mostrar modal con opciones de compartir
    toast({
      title: "Compartir Publicación",
      description: `Funcionalidad de compartir para "${post.content.substring(0, 30)}..."`,
    });
    
    // En producción, aquí iría la lógica de compartir
    logger.info('Share button clicked', { postId: post.id });
  };

  // Comentarios demo para modo demo
  const getDemoComments = (postId: string) => [
    { id: `${postId}-c1`, author: "Carlos M.", text: "¡Me encanta! 🔥", time: "2h", avatar: null },
    { id: `${postId}-c2`, author: "Ana L.", text: "Totalmente de acuerdo", time: "4h", avatar: null },
    { id: `${postId}-c3`, author: "Roberto S.", text: "Excelente punto de vista", time: "1d", avatar: null },
  ];

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
            Descubre las experiencias de la comunidad 🌟
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
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
              >
              <Card className="bg-card/80 backdrop-blur-sm border-accent/20 overflow-hidden">
                <CardContent className="p-0">
                  {/* Header del post */}
                  <div className="flex items-center justify-between p-4 pb-3">
                    <div className="flex items-center space-x-3">
                      <SafeImage
                        src={post.profile?.avatar_url || undefined}
                        alt={post.profile?.name || 'Usuario'}
                        fallbackType="avatar"
                        className="w-10 h-10 rounded-full border border-purple-400/30"
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
                      <SafeImage
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
                        className="flex items-center space-x-2 bg-transparent hover:bg-white/10 border-none px-2 py-1 text-sm font-semibold drop-shadow-md"
                      >
                        <motion.div
                          key={`like-${post.id}`}
                          animate={likedPosts.has(post.id) ? {
                            scale: [1, 1.3, 1],
                            rotate: [0, -10, 10, 0]
                          } : {}}
                          transition={{ 
                            duration: 0.5,
                            ease: "easeInOut"
                          }}
                        >
                          <Heart 
                            className={`w-5 h-5 transition-colors duration-300 ${
                              likedPosts.has(post.id) 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-white hover:text-red-400'
                            }`}
                          />
                        </motion.div>
                        <span className="text-white drop-shadow-md">{post.likes_count}</span>
                      </Button>
                      
                      <Button 
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center space-x-2 text-white bg-transparent hover:bg-white/10 border-none px-2 py-1 text-sm font-semibold drop-shadow-md"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="drop-shadow-md">{post.comments_count}</span>
                      </Button>
                    </div>
                    
                    <motion.div
                      whileTap={{ 
                        scale: 0.9,
                        rotate: [0, -15, 15, 0]
                      }}
                      transition={{ 
                        duration: 0.4,
                        ease: "easeOut"
                      }}
                    >
                      <Button 
                        onClick={() => handleShare(post)}
                        className="text-white bg-transparent hover:bg-white/10 border-none px-2 py-1 text-sm drop-shadow-md"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Share2 className="w-5 h-5" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </div>

                  {/* Sección de comentarios expandible con animación */}
                  <AnimatePresence>
                    {expandedComments.has(post.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ 
                          duration: 0.3,
                          ease: "easeInOut"
                        }}
                        className="border-t border-border/50 mt-4 pt-4 px-4 pb-4 space-y-3 overflow-hidden"
                      >
                        <h4 className="text-sm font-semibold text-foreground mb-3">Comentarios ({post.comments_count})</h4>
                      
                      {/* Comentarios demo */}
                      {getDemoComments(post.id).map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {comment.author.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-sm font-semibold text-foreground">{comment.author}</p>
                              <p className="text-sm text-foreground/90 mt-1">{comment.text}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 ml-1">{comment.time}</p>
                          </div>
                        </div>
                      ))}

                      {/* Campo para agregar comentario */}
                      <div className="flex space-x-2 mt-4 pt-3 border-t border-border/30">
                        <input 
                          type="text" 
                          placeholder="Escribe un comentario..." 
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              toast({
                                title: "Modo Demo",
                                description: "Los comentarios están deshabilitados en modo demo",
                              });
                            }
                          }}
                        />
                        <Button 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4"
                          onClick={() => {
                            toast({
                              title: "Modo Demo",
                              description: "Los comentarios están deshabilitados en modo demo",
                            });
                          }}
                        >
                          Enviar
                        </Button>
                      </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
              </motion.div>
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
