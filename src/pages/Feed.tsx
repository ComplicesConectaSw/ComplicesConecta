import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share, MoreHorizontal, MapPin, Clock } from 'lucide-react';
import { Header } from '@/components/Header';
import Navigation from '@/components/Navigation';
import { usePersistedState } from '@/hooks/usePersistedState';
import { logger } from '@/lib/logger';
import { useNavigate } from 'react-router-dom';

// Datos mock para publicaciones
const generateFeedPosts = () => {
  const users = [
    { name: "Ana & Carlos", type: "couple", location: "CDMX", avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop&crop=faces" },
    { name: "Valentina", type: "single", location: "Guadalajara", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" },
    { name: "Miguel", type: "single", location: "Monterrey", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
    { name: "Sofia & Diego", type: "couple", location: "Puebla", avatar: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=100&h=100&fit=crop&crop=faces" },
    { name: "Isabella", type: "single", location: "Tijuana", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
  ];

  const postTypes = [
    { type: "photo", content: "¡Noche increíble en el club! 🔥✨", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop" },
    { type: "text", content: "Buscando parejas aventureras para el fin de semana 😈💫" },
    { type: "photo", content: "Cena romántica antes de la diversión 🍷❤️", image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&h=300&fit=crop" },
    { type: "text", content: "Primera vez en el lifestyle, ¡qué experiencia tan increíble! 🌟" },
    { type: "photo", content: "Pool party privada este sábado 🏊‍♀️🎉", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop" },
  ];

  return Array.from({ length: 8 }, (_, i) => {
    const user = users[Math.floor(Math.random() * users.length)];
    const post = postTypes[Math.floor(Math.random() * postTypes.length)];
    
    return {
      id: i + 1,
      user,
      ...post,
      likes: Math.floor(Math.random() * 50) + 5,
      comments: Math.floor(Math.random() * 20) + 1,
      timeAgo: `${Math.floor(Math.random() * 12) + 1}h`,
      isLiked: Math.random() > 0.7,
    };
  });
};

const Feed = () => {
  const navigate = useNavigate();
  const [posts] = useState(generateFeedPosts());
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  
  // Estado persistente para autenticación
  const [demoAuth] = usePersistedState('demo_authenticated', 'false');
  const [apoyoAuth] = usePersistedState('apoyo_authenticated', 'false');
  const [demoUser] = usePersistedState<any>('demo_user', null);
  
  useEffect(() => {
    // Verificar autenticación
    const isAuthenticated = demoAuth === 'true' || apoyoAuth === 'true';
    
    if (!isAuthenticated) {
      logger.info('🔒 Feed: Usuario no autenticado, redirigiendo a /auth');
      navigate('/auth');
      return;
    }
    
    logger.info('✅ Feed: Acceso autorizado', { 
      demoMode: demoAuth === 'true',
      apoyoMode: apoyoAuth === 'true'
    });
  }, [navigate, demoAuth, apoyoAuth]);

  const handleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
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

        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="bg-card/80 backdrop-blur-sm border-accent/20 overflow-hidden">
              <CardContent className="p-0">
                {/* Header del post */}
                <div className="flex items-center justify-between p-4 pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 ring-2 ring-accent/20">
                      <AvatarImage src={post.user.avatar} alt={post.user.name} />
                      <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-foreground">{post.user.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.user.type === 'couple' 
                            ? 'bg-pink-500/20 text-pink-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {post.user.type === 'couple' ? 'Pareja' : 'Single'}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground space-x-2">
                        <MapPin className="w-3 h-3" />
                        <span>{post.user.location}</span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>{post.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                {/* Contenido del post */}
                <div className="px-4 pb-3">
                  <p className="text-foreground leading-relaxed">{post.content}</p>
                </div>

                {/* Imagen si existe */}
                {post.image && (
                  <div className="relative">
                    <img 
                      src={post.image} 
                      alt="Post content" 
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center justify-between p-4 pt-3 border-t border-border/50">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 ${
                        likedPosts.has(post.id) ? 'text-red-500' : 'text-muted-foreground'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                      <span>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-muted-foreground">
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comments}</span>
                    </Button>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Share className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Botón para cargar más */}
        <div className="text-center mt-8">
          <Button variant="outline" className="px-8 text-white border-white/30 hover:bg-white/10">
            Cargar más publicaciones
          </Button>
        </div>
      </main>

      <Navigation />
    </div>
  );
};

export default Feed;
