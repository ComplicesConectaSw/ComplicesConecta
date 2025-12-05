import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Grid3X3, 
  Play, 
  Upload, 
  Trash2,
  MessageCircle,
  Heart,
  Share,
  MoreHorizontal,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import StoriesContainer from '@/components/stories/StoriesContainer';
import { ComingSoonModal } from '@/components/modals/ComingSoonModal';
import { FeatureModal } from '@/components/modals/FeatureModal';

type TabType = 'posts' | 'stories' | 'gallery';

interface ProfileNavTabsProps {
  isOwnProfile?: boolean;
  onUploadImage?: () => void;
  onDeletePost?: (postId: string) => void;
  onCommentPost?: (postId: string) => void;
}

export const ProfileNavTabs: React.FC<ProfileNavTabsProps> = ({
  isOwnProfile = false,
  onUploadImage,
  onDeletePost,
  onCommentPost
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [likeCount, setLikeCount] = useState(24);
  const [isLiked, setIsLiked] = useState(false);
  const [demoPost, setDemoPost] = useState<any>(null);
  const [demoPostLikes, setDemoPostLikes] = useState(0);
  const [demoPostComments, setDemoPostComments] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [demoPostCount, setDemoPostCount] = useState(0);
  const [privateToastVisible, setPrivateToastVisible] = useState(false);

  const showPrivateAccessToast = () => {
    setPrivateToastVisible(true);
    setTimeout(() => setPrivateToastVisible(false), 3000);
  };

  const tabs = [
    {
      id: 'posts' as TabType,
      label: 'Posts',
      icon: Grid3X3,
      count: 12
    },
    {
      id: 'stories' as TabType,
      label: 'Historias',
      icon: Play,
      count: 5
    },
    {
      id: 'gallery' as TabType,
      label: 'Galería',
      icon: Upload,
      count: 24
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="space-y-4">
            {/* Posts Grid */}
            <div className="grid grid-cols-1 gap-4">
              {/* Post Example - Perfil Single (Ana) */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">Ana</span>
                        <span className="text-white/60 text-sm">hace 2h</span>
                      </div>
                      <p className="text-white/90 text-sm">
                        Disfrutando de un día increíble y conociendo nuevos lugares ✨
                      </p>
                    </div>
                    {isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-white hover:bg-white/10"
                        onClick={() => onDeletePost?.('post-1')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Post Image */}
                  <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg mb-3 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop" 
                      alt="Post"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=400&fit=crop';
                      }}
                    />
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-2 transition-colors ${
                          isLiked 
                            ? 'text-pink-400 hover:text-pink-500' 
                            : 'text-white/60 hover:text-pink-400'
                        } hover:bg-white/10`}
                        onClick={() => {
                          setIsLiked(!isLiked);
                          setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
                        }}
                      >
                        <Heart className={`w-4 h-4 ${
                          isLiked ? 'fill-pink-400' : ''
                        }`} />
                        <span className="text-sm">{likeCount}</span>
                      </Button>
                    </motion.div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-blue-400 hover:bg-white/10 flex items-center gap-2"
                      onClick={() => onCommentPost?.('post-1')}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">8</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-green-400 hover:bg-white/10"
                      onClick={() => {
                        alert('🔗 Compartir post\n\n(Función demo)');
                      }}
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-white hover:bg-white/10 ml-auto"
                      onClick={() => {
                        const options = window.confirm(
                          '⚙️ MÁS OPCIONES\n\n✅ Guardar post\n✅ Reportar\n✅ Ocultar\n\n(Función demo)'
                        );
                        if (options) {
                          alert('✅ Acción guardada');
                        }
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Post Demo Creado */}
              {demoPost && (
                <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                        D
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">Demo User</span>
                          <span className="text-white/60 text-sm">hace 1 min</span>
                        </div>
                        <p className="text-white/90 text-sm">{demoPost.content}</p>
                      </div>
                    </div>
                    <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-white text-6xl">🎉</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`flex items-center gap-2 ${demoPostLikes > 0 ? 'text-pink-400' : 'text-white/60 hover:text-pink-400'}`}
                          onClick={() => setDemoPostLikes(prev => prev + 1)}
                        >
                          <Heart className={`w-4 h-4 ${demoPostLikes > 0 ? 'fill-pink-400' : ''}`} />
                          <span className="text-sm">{demoPostLikes}</span>
                        </Button>
                      </motion.div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-white/60 hover:text-blue-400 flex items-center gap-2"
                        onClick={() => {
                          setShowComments(!showComments);
                          if (!showComments) {
                            setDemoPostComments(prev => prev + 1);
                          }
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{demoPostComments}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white/60 hover:text-green-400">
                        <Share className="w-4 h-4" />
                      </Button>
                    </div>
                    {showComments && (
                      <div className="mt-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-white/70 text-sm mb-2">💬 Comentarios demo:</p>
                        <div className="space-y-2">
                          <div className="text-xs text-white/60">
                            <span className="font-semibold text-white">Usuario 1:</span> ¡Me encanta! 😍
                          </div>
                          <div className="text-xs text-white/60">
                            <span className="font-semibold text-white">Usuario 2:</span> Genial 👏
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Empty State */}
              {!demoPost && (
                <div className="text-center py-12">
                  <Grid3X3 className="w-12 h-12 mx-auto mb-4 text-white/40" />
                  <p className="text-white/60 mb-4">No hay posts aún</p>
                  {isOwnProfile && (
                    <Button
                      onClick={() => {
                        if (demoPostCount >= 4) {
                          alert('📸 LÍMITE DEMO\n\nSolo puedes crear hasta 4 posts demo en esta vista.\nRefresca la página para reiniciar.');
                          return;
                        }

                        onUploadImage?.();
                        setDemoPost({
                          id: `demo-${Date.now()}`,
                          content: '¡Nuevo post demo creado! 🎉',
                          timestamp: new Date().toISOString()
                        });
                        setDemoPostCount((prev) => prev + 1);
                      }}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Crear Post
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'stories':
        return (
          <div className="space-y-4">
            <StoriesContainer />
            <div className="text-center py-8">
              <Play className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <p className="text-white/60 mb-4">Tus historias aparecerán aquí</p>
              {isOwnProfile && (
                <Button
                  onClick={onUploadImage}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Crear Historia
                </Button>
              )}
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-6">
            {/* Gallery Grid Pública */}
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Fotos Públicas
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="aspect-square bg-gradient-to-br from-pink-400 to-purple-600 rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=faces&auto=format&q=80" 
                    alt="Galería 1"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face';
                    }}
                  />
                </div>
                <div className="aspect-square bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces&auto=format&q=80" 
                    alt="Galería 2"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Gallery Privada con Lock */}
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Fotos Privadas 🔒
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div
                  className="aspect-square rounded-lg overflow-hidden relative cursor-pointer"
                  onClick={showPrivateAccessToast}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop" 
                    alt="Foto privada 1"
                    className="w-full h-full object-cover filter blur-lg"
                  />
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                    <span className="text-6xl mb-2">🔒</span>
                    <span className="text-white text-sm">Click para solicitar</span>
                  </div>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden relative cursor-pointer" onClick={() => alert('🔒 Solicita acceso para ver fotos privadas')}>
                  <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop" 
                    alt="Foto privada 2"
                    className="w-full h-full object-cover filter blur-lg"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-6xl">🔒</span>
                  </div>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden relative cursor-pointer" onClick={() => alert('🔒 Solicita acceso para ver fotos privadas')}>
                  <img 
                    src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=400&fit=crop" 
                    alt="Foto privada 3"
                    className="w-full h-full object-cover filter blur-lg"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-6xl">🔒</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Button for Own Profile */}
            {isOwnProfile && (
              <div className="text-center py-8">
                <Button
                  onClick={onUploadImage}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Imagen
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Tab Navigation */}
      <div className="flex border-b border-white/20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors relative",
                activeTab === tab.id
                  ? "text-white border-b-2 border-pink-400"
                  : "text-white/60 hover:text-white/80"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Toast verde para acceso a fotos privadas */}
      {privateToastVisible && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] px-6 py-3 rounded-full bg-emerald-500 text-white text-sm font-medium shadow-xl border border-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Solicitud enviada para acceder a fotos privadas.</span>
        </div>
      )}

      {/* Modales */}
      <ComingSoonModal 
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        title="Galería Privada"
        feature="Galería Privada"
      />
      
      <FeatureModal 
        isOpen={showFeatureModal}
        onClose={() => setShowFeatureModal(false)}
        feature="connections"
      />
    </div>
  );
};

