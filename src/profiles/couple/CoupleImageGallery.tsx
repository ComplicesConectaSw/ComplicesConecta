import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Loader2, Users, Eye, EyeOff, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ProfileImageService, ImageUploadResult } from '@/lib/storage';
import { cn } from '@/shared/lib/cn';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/lib/logger';

interface CoupleImage {
  id: string;
  url: string;
  isPublic: boolean;
  uploadedBy: 'partner1' | 'partner2';
  createdAt: string;
  likes?: number;
}

interface CoupleImageGalleryProps {
  coupleId: string;
  images: CoupleImage[];
  onImagesUpdated: (images: CoupleImage[]) => void;
  onError: (error: string) => void;
  partnerNames?: {
    partner1: string;
    partner2: string;
  };
  currentPartner: 'partner1' | 'partner2';
  canManageAll?: boolean; // Admin or both partners can manage
  className?: string;
  disabled?: boolean;
  maxImages?: number;
}

export const CoupleImageGallery: React.FC<CoupleImageGalleryProps> = ({
  coupleId,
  images,
  onImagesUpdated,
  onError,
  partnerNames = { partner1: 'Pareja 1', partner2: 'Pareja 2' },
  currentPartner,
  canManageAll = false,
  className = '',
  disabled = false,
  maxImages = 10
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newImagePublic, setNewImagePublic] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (files: FileList) => {
    if (disabled || isUploading) return;

    const fileArray = Array.from(files);
    if (images.length + fileArray.length > maxImages) {
      onError(`Máximo ${maxImages} imágenes permitidas en la galería`);
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadPromises = fileArray.map(async (file, index) => {
        const result: ImageUploadResult = await ProfileImageService.uploadGalleryImage(
          file, 
          `${coupleId}_gallery_${Date.now()}_${index}`
        );

        if (result.success && result.url) {
          const newImage: CoupleImage = {
            id: `${coupleId}_${Date.now()}_${index}`,
            url: result.url,
            isPublic: newImagePublic,
            uploadedBy: currentPartner,
            createdAt: new Date().toISOString(),
            likes: 0
          };
          return newImage;
        } else {
          throw new Error(result.error || 'Error al subir imagen');
        }
      });

      const newImages = await Promise.all(uploadPromises);
      const updatedImages = [...images, ...newImages];
      onImagesUpdated(updatedImages);

      toast({
        title: "Imágenes subidas",
        description: `${newImages.length} imagen(es) añadida(s) a la galería de pareja`,
      });

    } catch (_error) {
      logger.error('Error subiendo imágenes:', { error: _error });
      onError('Error al subir algunas imágenes a la galería');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (!imageToRemove) return;

    // Check permissions
    if (!canManageAll && imageToRemove.uploadedBy !== currentPartner) {
      onError('Solo puedes eliminar imágenes que hayas subido tú');
      return;
    }

    try {
      const result = await ProfileImageService.deleteProfileImage(imageToRemove.url);
      if (result.success) {
        const updatedImages = images.filter(img => img.id !== imageId);
        onImagesUpdated(updatedImages);
        
        toast({
          title: "Imagen eliminada",
          description: "La imagen ha sido eliminada de la galería",
        });
      } else {
        onError(result.error || 'Error al eliminar imagen');
      }
    } catch (_error) {
      logger.error('Error cargando galería:', { error: _error });
      onError('Error al eliminar imagen');
    }
  };

  const handleToggleVisibility = async (imageId: string) => {
    const imageToUpdate = images.find(img => img.id === imageId);
    if (!imageToUpdate) return;

    // Check permissions
    if (!canManageAll && imageToUpdate.uploadedBy !== currentPartner) {
      onError('Solo puedes cambiar la visibilidad de imágenes que hayas subido tú');
      return;
    }

    const updatedImages = images.map(img => 
      img.id === imageId 
        ? { ...img, isPublic: !img.isPublic }
        : img
    );
    
    onImagesUpdated(updatedImages);
    
    toast({
      title: "Visibilidad actualizada",
      description: `La imagen ahora es ${imageToUpdate.isPublic ? 'privada' : 'pública'}`,
    });
  };

  const canManageImage = (image: CoupleImage) => {
    return canManageAll || image.uploadedBy === currentPartner;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Galería de Pareja
          </h2>
          <span className="text-sm text-gray-500">
            ({images.length}/{maxImages})
          </span>
        </div>
      </div>

      {/* Upload Area */}
      {images.length < maxImages && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || isUploading}
            aria-label="Subir múltiples imágenes para galería de pareja"
            title="Seleccionar archivos de imagen para la galería"
          />

          <div
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
              dragActive 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500',
              disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Subiendo imágenes a la galería...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <ImageIcon className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Añadir imágenes a la galería de pareja
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Haz clic o arrastra imágenes aquí
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, WEBP hasta 5MB cada una
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Setting for New Images */}
          <div className="flex items-center space-x-2 justify-center">
            <Switch
              id="new-image-public"
              checked={newImagePublic}
              onCheckedChange={setNewImagePublic}
              disabled={disabled || isUploading}
            />
            <Label htmlFor="new-image-public" className="text-sm">
              {newImagePublic ? 'Nuevas imágenes públicas' : 'Nuevas imágenes privadas'}
            </Label>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url}
                alt="Imagen de pareja"
                className="w-full h-32 object-cover rounded-lg"
              />
              
              {/* Image Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg">
                {/* Image Info */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  {image.isPublic ? (
                    <Eye className="w-4 h-4 text-white" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-white" />
                  )}
                  <span className="text-xs text-white">
                    {partnerNames[image.uploadedBy]}
                  </span>
                </div>

                {/* Likes */}
                {image.likes !== undefined && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 rounded-full px-2 py-1">
                    <Heart className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-white">{image.likes}</span>
                  </div>
                )}

                {/* Action Buttons */}
                {canManageImage(image) && (
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30"
                      onClick={() => handleToggleVisibility(image.id)}
                      title={image.isPublic ? 'Hacer privada' : 'Hacer pública'}
                    >
                      {image.isPublic ? (
                        <EyeOff className="w-4 h-4 text-white" />
                      ) : (
                        <Eye className="w-4 h-4 text-white" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-red-500/70 hover:bg-red-500/90"
                      onClick={() => handleRemoveImage(image.id)}
                      title="Eliminar imagen"
                    >
                      <X className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Aún no hay imágenes en la galería de pareja
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Sube algunas fotos para compartir vuestros momentos especiales
          </p>
        </div>
      )}

      {/* Gallery Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Las imágenes públicas son visibles para todos. Las privadas requieren solicitud de acceso.
        </p>
      </div>
    </div>
  );
};

export default CoupleImageGallery;

