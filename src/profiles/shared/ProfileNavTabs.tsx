import React, { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent } from '@/shared/ui/Card';
import { 
  Grid3X3, 
  Play, 
  Upload, 
  Trash2,
  MessageCircle,
  Heart,
  Share,
  MoreHorizontal
} from 'lucide-react';
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
              {/* Post Example */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">Ana & Carlos</span>
                        <span className="text-white/60 text-sm">hace 2h</span>
                      </div>
                      <p className="text-white/90 text-sm">
                        ¡Qué día tan increíble! Explorando nuevos lugares juntos ðŸ’•
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
                      src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=600&h=400&fit=crop&crop=faces&auto=format&q=80" 
                      alt="Post"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face';
                      }}
                    />
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-pink-400 hover:bg-white/10 flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">24</span>
                    </Button>
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
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-white hover:bg-white/10 ml-auto"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Empty State */}
              <div className="text-center py-12">
                <Grid3X3 className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <p className="text-white/60 mb-4">No hay posts aún</p>
                {isOwnProfile && (
                  <Button
                    onClick={onUploadImage}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Crear Post
                  </Button>
                )}
              </div>
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
          <div className="space-y-4">
            {/* Gallery Grid */}
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
              {/* Add more gallery items */}
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
    <div className="space-y-6">
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
