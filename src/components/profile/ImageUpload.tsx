import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Camera, X, Edit } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  className?: string;
}

export const ImageUpload = ({ currentImage, onImageChange, className = "" }: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // For demo mode, simulate upload success
      const isDemoMode = localStorage.getItem('demo_authenticated') === 'true';
      if (isDemoMode) {
        // Use a placeholder image URL for demo
        const demoImageUrl = 'https://images.unsplash.com/photo-1494790108755-2616c96d2e9c?w=400';
        onImageChange(demoImageUrl);
      } else {
        onImageChange(url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al cargar la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        capture="environment" // For mobile camera
      />

      {previewUrl ? (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Profile preview"
            className="w-full h-64 sm:h-80 object-cover rounded-lg shadow-lg"
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
            <div className="flex gap-3">
              <Button
                onClick={triggerFileSelect}
                size="sm"
                className="bg-white/90 text-black hover:bg-white"
                disabled={isUploading}
              >
                <Edit className="h-4 w-4 mr-2" />
                Cambiar
              </Button>
              <Button
                onClick={handleRemoveImage}
                size="sm"
                variant="destructive"
                className="bg-red-500/90 hover:bg-red-500"
              >
                <X className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer" onClick={triggerFileSelect}>
          <CardContent className="flex flex-col items-center justify-center h-64 sm:h-80 p-6">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                ) : (
                  <Upload className="h-8 w-8 text-primary" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isUploading ? 'Subiendo...' : 'Subir foto de perfil'}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" disabled={isUploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar archivo
                </Button>
                <Button size="sm" variant="outline" disabled={isUploading}>
                  <Camera className="h-4 w-4 mr-2" />
                  Tomar foto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
