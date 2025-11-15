import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Users } from 'lucide-react';
import { ProfileImageService, ImageUploadResult } from '@/lib/storage';
import { cn } from '@/shared/lib/cn';

interface CoupleImageUploadProps {
  onImagesUploaded: (partner1Url: string, partner2Url: string) => void;
  onError: (error: string) => void;
  coupleId: string;
  currentImages?: {
    partner1?: string;
    partner2?: string;
  };
  partnerNames?: {
    partner1: string;
    partner2: string;
  };
  className?: string;
  disabled?: boolean;
}

export const CoupleImageUpload: React.FC<CoupleImageUploadProps> = ({
  onImagesUploaded,
  onError,
  coupleId,
  currentImages = {},
  partnerNames = { partner1: 'Pareja 1', partner2: 'Pareja 2' },
  className = '',
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState<{
    partner1: boolean;
    partner2: boolean;
  }>({ partner1: false, partner2: false });
  
  const [dragActive, setDragActive] = useState<{
    partner1: boolean;
    partner2: boolean;
  }>({ partner1: false, partner2: false });

  const partner1InputRef = useRef<HTMLInputElement>(null);
  const partner2InputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File, partner: 'partner1' | 'partner2') => {
    if (disabled || isUploading[partner]) return;

    setIsUploading(prev => ({ ...prev, [partner]: true }));
    
    try {
      // Use couple-specific path for image storage
      const result: ImageUploadResult = await ProfileImageService.uploadProfileImage(
        file, 
        `${coupleId}_${partner}`
      );

      if (result.success && result.url) {
        // Update the specific partner's image
        const updatedImages = {
          partner1: partner === 'partner1' ? result.url : currentImages.partner1 || '',
          partner2: partner === 'partner2' ? result.url : currentImages.partner2 || ''
        };
        onImagesUploaded(updatedImages.partner1, updatedImages.partner2);
      } else {
        onError(result.error || `Error al subir imagen de ${partnerNames[partner]}`);
      }
    } catch {
      onError(`Error inesperado al subir imagen de ${partnerNames[partner]}`);
    } finally {
      setIsUploading(prev => ({ ...prev, [partner]: false }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, partner: 'partner1' | 'partner2') => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, partner);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, partner: 'partner1' | 'partner2') => {
    e.preventDefault();
    setDragActive(prev => ({ ...prev, [partner]: false }));
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file, partner);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, partner: 'partner1' | 'partner2') => {
    e.preventDefault();
    setDragActive(prev => ({ ...prev, [partner]: true }));
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, partner: 'partner1' | 'partner2') => {
    e.preventDefault();
    setDragActive(prev => ({ ...prev, [partner]: false }));
  };

  const handleClick = (partner: 'partner1' | 'partner2') => {
    if (!disabled && !isUploading[partner]) {
      const inputRef = partner === 'partner1' ? partner1InputRef : partner2InputRef;
      inputRef.current?.click();
    }
  };

  const handleRemoveImage = async (partner: 'partner1' | 'partner2') => {
    const currentImage = currentImages[partner];
    if (!currentImage || disabled || isUploading[partner]) return;

    setIsUploading(prev => ({ ...prev, [partner]: true }));
    
    try {
      const result = await ProfileImageService.deleteProfileImage(currentImage);
      if (result.success) {
        // Update images with empty string for removed partner
        const updatedImages = {
          partner1: partner === 'partner1' ? '' : currentImages.partner1 || '',
          partner2: partner === 'partner2' ? '' : currentImages.partner2 || ''
        };
        onImagesUploaded(updatedImages.partner1, updatedImages.partner2);
      } else {
        onError(result.error || `Error al eliminar imagen de ${partnerNames[partner]}`);
      }
    } catch {
      onError(`Error inesperado al eliminar imagen de ${partnerNames[partner]}`);
    } finally {
      setIsUploading(prev => ({ ...prev, [partner]: false }));
    }
  };

  const renderPartnerUpload = (partner: 'partner1' | 'partner2') => {
    const currentImage = currentImages[partner];
    const isPartnerUploading = isUploading[partner];
    const isPartnerDragActive = dragActive[partner];
    const inputRef = partner === 'partner1' ? partner1InputRef : partner2InputRef;
    const partnerName = partnerNames[partner];

    return (
      <div className="flex-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, partner)}
          className="hidden"
          disabled={disabled || isPartnerUploading}
        />

        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {partnerName}
          </h3>
        </div>

        {currentImage ? (
          // Mostrar imagen actual del partner
          <div className="relative group">
            <img
              src={currentImage}
              alt={`Imagen de ${partnerName}`}
              className="w-full h-48 object-cover rounded-lg"
            />
            
            {/* Overlay con acciones */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
              <div className="flex gap-2">
                <button
                  onClick={() => handleClick(partner)}
                  disabled={disabled || isPartnerUploading}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  title={`Cambiar imagen de ${partnerName}`}
                >
                  {isPartnerUploading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 text-white" />
                  )}
                </button>
                
                <button
                  onClick={() => handleRemoveImage(partner)}
                  disabled={disabled || isPartnerUploading}
                  className="p-2 bg-red-500/70 hover:bg-red-500/90 rounded-full transition-colors"
                  title={`Eliminar imagen de ${partnerName}`}
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Área de subida cuando no hay imagen
          <div
            onClick={() => handleClick(partner)}
            onDrop={(e) => handleDrop(e as React.DragEvent<HTMLDivElement>, partner)}
            onDragOver={(e) => handleDragOver(e as React.DragEvent<HTMLDivElement>, partner)}
            onDragLeave={(e) => handleDragLeave(e as React.DragEvent<HTMLDivElement>, partner)}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 h-48 flex flex-col items-center justify-center",
              isPartnerDragActive 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500',
              disabled || isPartnerUploading ? 'opacity-50 cursor-not-allowed' : ''
            )}
          >
            {isPartnerUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Subiendo imagen...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Imagen de {partnerName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Clic o arrastra aquí
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, WEBP hasta 3MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Imágenes de Pareja
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderPartnerUpload('partner1')}
        {renderPartnerUpload('partner2')}
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Sube una imagen para cada miembro de la pareja. Las imágenes se mostrarán lado a lado en tu perfil.
        </p>
      </div>
    </div>
  );
};

export default CoupleImageUpload;
