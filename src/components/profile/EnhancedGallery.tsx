import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Eye, 
  Lock, 
  Trash2, 
  Heart, 
  MessageCircle,
  Globe,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  isPublic: boolean;
  uploadedAt: string;
  likes: number;
  comments: number;
}

interface GalleryProps {
  userId: string;
  profileName: string;
  profileType: 'single' | 'couple';
  isOwner: boolean;
}

// Datos demo para galerías
const getDemoImages = (profileType: 'single' | 'couple'): GalleryImage[] => {
  const baseImages = [
    {
      id: 'demo-1',
      url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      caption: 'Disfrutando el día',
      isPublic: true,
      uploadedAt: '2024-01-15T10:30:00Z',
      likes: 12,
      comments: 3
    },
    {
      id: 'demo-2',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      caption: 'Momento especial',
      isPublic: true,
      uploadedAt: '2024-01-14T15:20:00Z',
      likes: 8,
      comments: 1
    },
    {
      id: 'demo-3',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      caption: 'Aventura increíble',
      isPublic: false,
      uploadedAt: '2024-01-13T09:15:00Z',
      likes: 15,
      comments: 5
    },
    {
      id: 'demo-4',
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      caption: 'Conexión auténtica',
      isPublic: false,
      uploadedAt: '2024-01-12T18:45:00Z',
      likes: 20,
      comments: 7
    }
  ];

  if (profileType === 'couple') {
    return [
      ...baseImages,
      {
        id: 'demo-5',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
        caption: 'Pareja perfecta',
        isPublic: true,
        uploadedAt: '2024-01-11T12:00:00Z',
        likes: 25,
        comments: 9
      }
    ];
  }

  return baseImages;
};

export const EnhancedGallery: React.FC<GalleryProps> = ({
  userId,
  profileName,
  profileType,
  isOwner
}) => {
  const { user: _user } = useAuth();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [_privateAccessRequests, _setPrivateAccessRequests] = useState<any[]>([]);

  useEffect(() => {
    checkModeAndLoadImages();
  }, [userId]);

  const checkModeAndLoadImages = async () => {
    const demoAuth = localStorage.getItem('demo_authenticated');
    const isDemo = demoAuth === 'true';
    setIsDemoMode(isDemo);

    if (isDemo) {
      // Cargar datos demo
      setImages(getDemoImages(profileType));
      setLoading(false);
      logger.info('🎭 Galería demo cargada:', { profileType, imageCount: getDemoImages(profileType).length });
    } else {
      // Cargar datos reales de Supabase
      await loadRealImages();
    }
  };

  const loadRealImages = async () => {
    try {
      setLoading(true);
      
      // Cargar imágenes públicas
      const { data: publicImages, error: publicError } = await (supabase as any)
        .from('media')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (publicError) {
        logger.error('Error cargando imágenes públicas:', { error: String(publicError) });
      }

      // Cargar imágenes privadas si es el propietario o tiene acceso
      let privateImages: any[] = [];
      if (isOwner) {
        const { data: privateData, error: privateError } = await (supabase as any)
          .from('media')
          .select('*')
          .eq('owner_id', userId)
          .eq('is_public', false)
          .order('created_at', { ascending: false });

        if (privateError) {
          logger.error('Error cargando imágenes privadas:', { error: String(privateError) });
        } else {
          privateImages = privateData || [];
        }
      }

      // Combinar imágenes
      const allImages = [
        ...(publicImages || []),
        ...privateImages
      ].map((img: any) => ({
        id: img.id || 'unknown',
        url: img.image_url || '/placeholder.svg',
        caption: img.caption || '',
        isPublic: img.is_public || false,
        uploadedAt: img.created_at || new Date().toISOString(),
        likes: img.likes_count || 0,
        comments: img.comments_count || 0
      }));

      setImages(allImages);
      logger.info('✅ Galería real cargada:', { userId, imageCount: allImages.length });
    } catch (error) {
      logger.error('Error cargando galería real:', { error: String(error) });
      // Fallback a datos demo en caso de error
      setImages(getDemoImages(profileType));
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const _handleImageUpload = async (file: File) => {
    if (isDemoMode) {
      // Simular upload en modo demo
      const newImage: GalleryImage = {
        id: `demo-${Date.now()}`,
        url: URL.createObjectURL(file),
        caption: 'Nueva imagen',
        isPublic: true,
        uploadedAt: new Date().toISOString(),
        likes: 0,
        comments: 0
      };
      setImages(prev => [newImage, ...prev]);
      logger.info('🎭 Imagen demo agregada');
      return;
    }

    try {
      // Upload real a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(fileName, file);

      if (uploadError) {
        logger.error('Error subiendo imagen:', { error: String(uploadError) });
        return;
      }

      // Guardar metadata en base de datos
      const { data: imageData, error: dbError } = await (supabase as any)
        .from('media')
        .insert({
          owner_id: userId,
          storage_path: uploadData.path,
          file_type: file.type,
          is_public: true,
          is_profile_photo: false
        })
        .select()
        .single();

      if (dbError) {
        logger.error('Error guardando metadata:', { error: String(dbError) });
        return;
      }

      // Actualizar estado local
      const newImage: GalleryImage = {
        id: String(imageData.id) || 'unknown',
        url: (imageData as any).storage_path || '/placeholder.svg',
        caption: 'Nueva imagen',
        isPublic: (imageData as any).is_public || false,
        uploadedAt: (imageData as any).created_at || new Date().toISOString(),
        likes: 0,
        comments: 0
      };

      setImages(prev => [newImage, ...prev]);
      logger.info('✅ Imagen real subida:', { imageId: imageData.id });
    } catch (error) {
      logger.error('Error en upload:', { error: String(error) });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (isDemoMode) {
      setImages(prev => prev.filter(img => img.id !== imageId));
      logger.info('🎭 Imagen demo eliminada');
      return;
    }

    try {
      // Eliminar de base de datos
      const { error: dbError } = await (supabase as any)
        .from('media')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        logger.error('Error eliminando imagen:', { error: String(dbError) });
        return;
      }

      // Eliminar de storage
      const image = images.find(img => img.id === imageId);
      if (image) {
        const { error: storageError } = await supabase.storage
          .from('gallery-images')
          .remove([image.url]);

        if (storageError) {
          logger.error('Error eliminando de storage:', { error: String(storageError) });
        }
      }

      setImages(prev => prev.filter(img => img.id !== imageId));
      logger.info('✅ Imagen real eliminada:', { imageId });
    } catch (error) {
      logger.error('Error eliminando imagen:', { error: String(error) });
    }
  };

  const toggleImageVisibility = async (imageId: string, isPublic: boolean) => {
    if (isDemoMode) {
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, isPublic: !img.isPublic } : img
      ));
      logger.info('🎭 Visibilidad demo cambiada');
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('media')
        .update({ is_public: !isPublic })
        .eq('id', imageId);

      if (error) {
        logger.error('Error cambiando visibilidad:', { error: String(error) });
        return;
      }

      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, isPublic: !img.isPublic } : img
      ));
      logger.info('✅ Visibilidad cambiada:', { imageId, isPublic: !isPublic });
    } catch (error) {
      logger.error('Error cambiando visibilidad:', { error: String(error) });
    }
  };

  const publicImages = images.filter(img => img.isPublic);
  const privateImages = images.filter(img => !img.isPublic);

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
        <CardContent className="p-6">
          <div className="text-center text-white">Cargando galería...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Galería de {profileName}</span>
          {isDemoMode && (
            <Badge className="bg-purple-500/80 text-white">
              🎭 Modo Demo
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="public" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
            <TabsTrigger value="public" className="text-white data-[state=active]:bg-primary">
              <Globe className="w-4 h-4 mr-2" />
              Públicas ({publicImages.length})
            </TabsTrigger>
            <TabsTrigger value="private" className="text-white data-[state=active]:bg-primary">
              <Lock className="w-4 h-4 mr-2" />
              Privadas ({privateImages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {publicImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-48 object-cover rounded-lg cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  />
                  {isOwner && (
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleImageVisibility(image.id, image.isPublic)}
                      >
                        <Lock className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 flex space-x-2">
                    <Badge className="bg-green-500/80 text-white text-xs">
                      <Heart className="w-3 h-3 mr-1" />
                      {image.likes}
                    </Badge>
                    <Badge className="bg-blue-500/80 text-white text-xs">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {image.comments}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="private" className="mt-6">
            {isOwner ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {privateImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={image.caption}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    />
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleImageVisibility(image.id, image.isPublic)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2 flex space-x-2">
                      <Badge className="bg-red-500/80 text-white text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Privada
                      </Badge>
                      <Badge className="bg-green-500/80 text-white text-xs">
                        <Heart className="w-3 h-3 mr-1" />
                        {image.likes}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white text-lg mb-2">Galería Privada</h3>
                <p className="text-muted-foreground mb-4">
                  Esta galería contiene contenido privado. Solicita acceso para ver las imágenes.
                </p>
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Solicitar Acceso
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal de imagen seleccionada */}
        {selectedImage && (
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">{selectedImage.caption}</DialogTitle>
              </DialogHeader>
              <div className="relative">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.caption}
                  className="w-full h-96 object-contain rounded-lg"
                />
                <div className="absolute bottom-4 left-4 flex space-x-2">
                  <Badge className="bg-green-500/80 text-white">
                    <Heart className="w-3 h-3 mr-1" />
                    {selectedImage.likes}
                  </Badge>
                  <Badge className="bg-blue-500/80 text-white">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {selectedImage.comments}
                  </Badge>
                  {!selectedImage.isPublic && (
                    <Badge className="bg-red-500/80 text-white">
                      <Lock className="w-3 h-3 mr-1" />
                      Privada
                    </Badge>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedGallery;
