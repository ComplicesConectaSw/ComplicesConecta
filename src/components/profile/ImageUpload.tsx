import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ProfileImageService, ImageUploadResult } from '@/lib/storage';
import { safeGetItem } from '@/utils/safeLocalStorage';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  onError: (error: string) => void;
  userId: string;
  currentImage?: string;
  type?: 'profile' | 'gallery';
  className?: string;
  disabled?: boolean;
  // New props for couple profile support
  profileType?: 'single' | 'couple';
  partnerName?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onError,
  userId,
  currentImage,
  type = 'profile',
  className = '',
  disabled = false,
  profileType = 'single',
  partnerName
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (disabled || isUploading) return;

    setIsUploading(true);
    
    try {
      // Check if user is in demo mode
      const isDemoMode = safeGetItem<string>('demo_authenticated', { validate: true, defaultValue: 'false' }) === 'true';
      
      if (isDemoMode) {
        // Simulate upload for demo users
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload time
        
        // Create a temporary URL for the uploaded file
        const tempUrl = URL.createObjectURL(file);
        onImageUploaded(tempUrl);
        return;
      }

      let result: ImageUploadResult;
      
      if (type === 'profile') {
        result = await ProfileImageService.uploadProfileImage(file, userId);
      } else {
        result = await ProfileImageService.uploadGalleryImage(file, userId);
      }

      if (result.success && result.url) {
        onImageUploaded(result.url);
      } else {
        onError(result.error || 'Error al subir imagen');
      }
    } catch {
      onError('Error inesperado al subir imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
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

  const handleRemoveImage = async () => {
    if (!currentImage || disabled || isUploading) return;

    setIsUploading(true);
    
    try {
      const result = await ProfileImageService.deleteProfileImage(currentImage);
      if (result.success) {
        onImageUploaded(''); // Imagen vacía
      } else {
        onError(result.error || 'Error al eliminar imagen');
      }
    } catch {
      onError('Error inesperado al eliminar imagen');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
        aria-label="Subir imagen"
      />

      {currentImage ? (
        // Mostrar imagen actual
        <div className="relative group">
          <img
            src={currentImage}
            alt={profileType === 'couple' && partnerName ? `Imagen de ${partnerName}` : "Imagen de perfil"}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              // Fallback a gradiente con inicial si la imagen falla
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM5MzZFNkYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGNDMzOTYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+8J+TniBJbWFnZW48L3RleHQ+PC9zdmc+';
              target.onerror = null; // Evitar bucle infinito
            }}
          />
          
          {/* Overlay con acciones */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
            <div className="flex gap-2">
              <button
                onClick={handleClick}
                disabled={disabled || isUploading}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                title="Cambiar imagen"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-white" />
                )}
              </button>
              
              <button
                onClick={handleRemoveImage}
                disabled={disabled || isUploading}
                className="p-2 bg-red-500/70 hover:bg-red-500/90 rounded-full transition-colors"
                title="Eliminar imagen"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Área de subida cuando no hay imagen
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${dragActive 
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
            }
            ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Subiendo imagen...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <ImageIcon className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Haz clic o arrastra una imagen aquí
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  PNG, JPG, WEBP hasta {type === 'profile' ? '3MB' : '5MB'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
