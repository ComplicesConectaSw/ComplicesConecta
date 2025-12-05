import { useState, useEffect, memo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Eye, 
  Heart, 
  MessageCircle,
  X,
  Plus,
  Globe,
  EyeOff,
  UserPlus
} from 'lucide-react';
import { invitationService } from '@/lib/invitations';
import { useAuth } from '@/features/auth/useAuth';
import { InvitationDialog } from "@/components/invitations/InvitationDialog";
import { logger } from '@/lib/logger';
import { SafeImage } from '@/components/ui/SafeImage';

interface GalleryImage {
  id: number;
  userId: string;
  url: string;
  caption?: string;
  isPublic: boolean;
  createdAt: string;
  likes: number;
  comments: number;
}

interface GalleryProps {
  userId: string;
  isOwner?: boolean;
  canViewPrivate?: boolean;
  profileName?: string;
}

// Mock data
const mockGalleryImages: GalleryImage[] = [
  {
    id: 1,
    userId: "1",
    url: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&crop=face",
    caption: "Disfrutando el día",
    isPublic: true,
    createdAt: "2024-01-15T10:30:00Z",
    likes: 12,
    comments: 3
  },
  {
    id: 2,
    userId: "1",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    caption: "Momento especial",
    isPublic: false,
    createdAt: "2024-01-14T15:45:00Z",
    likes: 8,
    comments: 2
  }
];

const Gallery = ({ userId, isOwner = false, canViewPrivate = false, profileName = "Usuario" }: GalleryProps) => {
  const { user } = useAuth();
  const [images, setImages] = useState<GalleryImage[]>(mockGalleryImages);
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [hasGalleryAccess, setHasGalleryAccess] = useState(canViewPrivate);

  // Check gallery access permissions
  useEffect(() => {
    const checkAccess = async () => {
      if (!isOwner && userId && user?.id) {
        try {
          const access = await invitationService.hasGalleryAccess(userId, user.id);
          setHasGalleryAccess(access);
        } catch (error) {
          logger.error('Error verificando acceso a galería:', error as any);
          setHasGalleryAccess(false);
        }
      }
    };
    
    checkAccess();
  }, [userId, isOwner, user?.id]);

  // Filtrar imágenes por visibilidad
  const publicImages = images.filter(img => img.isPublic);
  const privateImages = images.filter(img => !img.isPublic);

  const handleImageUpload = (isPublic: boolean) => {
    // Simular subida de imagen
    const newImage: GalleryImage = {
      id: Date.now(),
      userId,
      url: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1599566150163-29194dcaad36' : '1472099645785-5658abf4ff4e'}?w=400&h=400&fit=crop&crop=face`,
      caption: isPublic ? "Nueva foto pública" : "Nueva foto privada",
      isPublic,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0
    };
    
    setImages(prev => [newImage, ...prev]);
  };

  const toggleImageVisibility = (imageId: number) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, isPublic: !img.isPublic }
        : img
    ));
  };

  const deleteImage = (imageId: number) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    setSelectedImage(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Galería</h2>
          <p className="text-white/70">
            {isOwner ? 'Gestiona tus fotos públicas y privadas' : 'Explora las fotos compartidas'}
          </p>
        </div>
        
        {isOwner && (
          <div className="flex space-x-2">
            <Button
              onClick={() => handleImageUpload(true)}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Pública
            </Button>
            <Button
              onClick={() => handleImageUpload(false)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Privada
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'public' | 'private')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/30 backdrop-blur-sm">
          <TabsTrigger 
            value="public" 
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Públicas ({publicImages.length})
          </TabsTrigger>
          <TabsTrigger 
            value="private" 
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 flex items-center gap-2"
            disabled={!isOwner && !hasGalleryAccess}
          >
            <Lock className="h-4 w-4" />
            Privadas ({isOwner || hasGalleryAccess ? privateImages.length : '?'})
          </TabsTrigger>
        </TabsList>

        {/* Galería Pública */}
        <TabsContent value="public" className="mt-6">
          {publicImages.length === 0 ? (
            <Card className="p-8 text-center bg-black/30 backdrop-blur-sm border-white/10">
              <Globe className="h-16 w-16 mx-auto mb-4 text-white/50" />
              <h3 className="text-xl font-semibold text-white mb-2">No hay fotos públicas</h3>
              <p className="text-white/70">
                {isOwner ? 'Sube tu primera foto pública para que otros puedan verte.' : 'Este usuario no ha compartido fotos públicas aún.'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {publicImages.map((image) => (
                <Card 
                  key={image.id} 
                  className="group relative overflow-hidden bg-black/30 backdrop-blur-sm border-white/10 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="aspect-square">
                    <SafeImage 
                      src={image.url} 
                      alt={image.caption || 'Foto'}
                      fallbackType={image.isPublic ? 'default' : 'private'}
                      className="w-full h-full"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-3 w-full">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-2 text-sm">
                          <Heart className="h-4 w-4" />
                          <span>{image.likes}</span>
                          <MessageCircle className="h-4 w-4" />
                          <span>{image.comments}</span>
                        </div>
                        <Badge variant="outline" className="border-green-500 text-green-400">
                          <Globe className="h-3 w-3 mr-1" />
                          Pública
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Owner Controls */}
                  {isOwner && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleImageVisibility(image.id);
                        }}
                      >
                        <EyeOff className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Galería Privada */}
        <TabsContent value="private" className="mt-6">
          {!isOwner && !hasGalleryAccess ? (
            <Card className="p-8 text-center bg-black/30 backdrop-blur-sm border-white/10">
              <Lock className="h-16 w-16 mx-auto mb-4 text-white/50" />
              <h3 className="text-xl font-semibold text-white mb-2">Contenido Privado</h3>
              <p className="text-white/70 mb-4">
                Necesitas una invitación aceptada para ver las fotos privadas de este usuario.
              </p>
              <InvitationDialog 
                targetProfileId={userId.toString()}
                targetProfileName={profileName}
              >
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Solicitar Acceso a Galería
                </Button>
              </InvitationDialog>
            </Card>
          ) : privateImages.length === 0 ? (
            <Card className="p-8 text-center bg-black/30 backdrop-blur-sm border-white/10">
              <Lock className="h-16 w-16 mx-auto mb-4 text-white/50" />
              <h3 className="text-xl font-semibold text-white mb-2">No hay fotos privadas</h3>
              <p className="text-white/70">
                {isOwner ? 'Sube fotos privadas para compartir solo con tus conexiones.' : 'Este usuario no ha compartido fotos privadas contigo aún.'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {privateImages.map((image) => (
                <Card 
                  key={image.id} 
                  className="group relative overflow-hidden bg-black/30 backdrop-blur-sm border-white/10 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="aspect-square">
                    <img 
                      src={image.url} 
                      alt={image.caption || 'Foto'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-3 w-full">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-2 text-sm">
                          <Heart className="h-4 w-4" />
                          <span>{image.likes}</span>
                          <MessageCircle className="h-4 w-4" />
                          <span>{image.comments}</span>
                        </div>
                        <Badge variant="outline" className="border-purple-500 text-purple-400">
                          <Lock className="h-3 w-3 mr-1" />
                          Privada
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Owner Controls */}
                  {isOwner && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleImageVisibility(image.id);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de imagen */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-black/90 backdrop-blur-sm border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className={selectedImage.isPublic ? "border-green-500 text-green-400" : "border-purple-500 text-purple-400"}>
                    {selectedImage.isPublic ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                    {selectedImage.isPublic ? 'Pública' : 'Privada'}
                  </Badge>
                  <span className="text-white/60 text-sm">{formatDate(selectedImage.createdAt)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isOwner && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => toggleImageVisibility(selectedImage.id)}
                      >
                        {selectedImage.isPublic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                        onClick={() => deleteImage(selectedImage.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="aspect-video mb-4">
                <SafeImage 
                  src={selectedImage.url} 
                  alt={selectedImage.caption || 'Foto'}
                  fallbackType={selectedImage.isPublic ? 'default' : 'private'}
                  className="w-full h-full rounded-lg"
                />
              </div>
              
              {selectedImage.caption && (
                <p className="text-white mb-4">{selectedImage.caption}</p>
              )}
              
              <div className="flex items-center justify-between text-white/70">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{selectedImage.likes} likes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{selectedImage.comments} comentarios</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default memo(Gallery);

