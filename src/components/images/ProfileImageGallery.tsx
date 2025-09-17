import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Lock, Unlock, Trash2, MessageSquare } from 'lucide-react';
import { getUserImages, deleteImage, ImageUpload } from '@/lib/images';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

interface ProfileImageGalleryProps {
  profileId: string;
  isOwner?: boolean;
  showUpload?: boolean;
}

export function ProfileImageGallery({ profileId, isOwner = false, showUpload = false }: ProfileImageGalleryProps) {
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageUpload | null>(null);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadImages();
  }, [profileId]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const images = await getUserImages(profileId, isOwner);
      setImages(images);
    } catch (error) {
      logger.error('Error loading images:', { error: String(error) });
      toast({
        variant: "destructive",
        title: "Error al cargar imágenes",
        description: "Error de conexión",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return;
    }

    try {
      const success = await deleteImage(imageId, profileId);
      
      if (success) {
        setImages(images.filter(img => img.id !== imageId));
        setSelectedImage(null);
        toast({
          title: "Imagen eliminada",
          description: "La imagen se eliminó correctamente.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error al eliminar",
          description: "No se pudo eliminar la imagen",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: "No se pudo eliminar la imagen",
      });
    }
  };

  const handleRequestAccess = async () => {
    if (!user) return;

    setRequestingAccess(true);
    try {
      // Funcionalidad de solicitud de acceso no implementada aún
      toast({
        title: "Funcionalidad en desarrollo",
        description: "La solicitud de acceso estará disponible pronto.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: "No se pudo enviar la solicitud",
      });
    } finally {
      setRequestingAccess(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 animate-pulse rounded-xl shadow-sm" />
        ))}
      </div>
    );
  }

  const publicImages = images.filter(img => img.is_public);
  const privateImages = images.filter(img => !img.is_public);
  const hasPrivateImages = privateImages.length > 0;

  return (
    <div className="space-y-6">
      {/* Imágenes públicas */}
      {publicImages.length > 0 && (
        <div>
          <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-purple-800">
            <Unlock className="h-5 w-5 text-purple-600" />
            Galería Pública ({publicImages.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            {publicImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                isOwner={isOwner}
                onView={setSelectedImage}
                onDelete={handleDeleteImage}
              />
            ))}
          </div>
        </div>
      )}

      {/* Imágenes privadas */}
      {privateImages.length > 0 && (
        <div>
          <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-pink-800">
            <Lock className="h-5 w-5 text-pink-600" />
            Galería Privada ({privateImages.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            {privateImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                isOwner={isOwner}
                onView={setSelectedImage}
                onDelete={handleDeleteImage}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay imágenes */}
      {images.length === 0 && (
        <Card className="p-6 sm:p-8 text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50">
          <CardContent>
            <Eye className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-purple-400" />
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-purple-800">No hay imágenes</h3>
            <p className="text-purple-600 text-sm sm:text-base">
              {isOwner 
                ? "Sube tu primera imagen para comenzar tu galería"
                : "Este perfil no tiene imágenes públicas disponibles"
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Botón para solicitar acceso a galería privada */}
      {!isOwner && hasPrivateImages && user && (
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200/50">
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-pink-800">Galería Privada</h4>
              <p className="text-sm text-pink-600">
                Este perfil tiene imágenes privadas. Solicita acceso para verlas.
              </p>
            </div>
            <Button
              onClick={handleRequestAccess}
              disabled={requestingAccess}
              className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {requestingAccess ? 'Enviando...' : 'Solicitar Acceso'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de imagen */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-sm sm:max-w-md lg:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
                {selectedImage.is_public ? (
                  <Unlock className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
                {selectedImage.title || 'Imagen'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.title || 'Imagen'}
                className="w-full max-h-60 sm:max-h-80 lg:max-h-96 object-contain rounded-lg"
              />
              {selectedImage.description && (
                <p className="text-muted-foreground">{selectedImage.description}</p>
              )}
              <div className="flex items-center justify-between">
                <Badge variant={selectedImage.is_public ? "default" : "secondary"}>
                  {selectedImage.is_public ? 'Pública' : 'Privada'}
                </Badge>
                {isOwner && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteImage(selectedImage.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface ImageCardProps {
  image: ImageUpload;
  isOwner: boolean;
  onView: (image: ImageUpload) => void;
  onDelete: (imageId: string) => void;
}

function ImageCard({ image, isOwner, onView, onDelete }: ImageCardProps) {
  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm border-purple-200/50">
      <div className="relative aspect-square" onClick={() => onView(image)}>
        <img
          src={image.url}
          alt={image.title || 'Imagen'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Overlay con controles */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <Button 
            variant="secondary" 
            size="sm"
            className="bg-white/90 hover:bg-white text-purple-700 shadow-lg"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Ver</span>
          </Button>
        </div>

        {/* Badge de privacidad */}
        <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
          <Badge 
            variant={image.is_public ? "default" : "secondary"} 
            className={`text-xs shadow-lg ${
              image.is_public 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
            }`}
          >
            {image.is_public ? (
              <Unlock className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
            ) : (
              <Lock className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
            )}
            <span className="hidden sm:inline">{image.is_public ? 'Pública' : 'Privada'}</span>
          </Badge>
        </div>

        {/* Botón eliminar para propietario */}
        {isOwner && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-1 sm:top-2 right-1 sm:right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 h-6 w-6 sm:h-8 sm:w-8 p-0 bg-red-500 hover:bg-red-600 shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(image.id);
            }}
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>

      {/* Información de la imagen */}
      {image.title && (
        <CardContent className="p-2 sm:p-3">
          <p className="text-xs sm:text-sm font-medium truncate text-purple-800">{image.title}</p>
          {image.description && (
            <p className="text-xs text-purple-600 truncate mt-1">
              {image.description}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
