import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Camera, 
  Upload, 
  X, 
  MapPin, 
  Globe, 
  Lock, 
  Loader2,
  Image as ImageIcon 
} from 'lucide-react';
import { storyService } from './StoryService';
import { CreateStoryData } from './StoryTypes';
import { safeGetItem } from '@/utils/safeLocalStorage';

interface CreateStoryProps {
  onStoryCreated: () => void;
  onClose: () => void;
}

export const CreateStory: React.FC<CreateStoryProps> = ({ onStoryCreated, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleCreateStory = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      // En modo demo, simular la creación de historia
      const isDemoMode = safeGetItem<string>('demo_authenticated', { validate: true, defaultValue: 'false' }) === 'true';
      
      const storyData: CreateStoryData = {
        contentUrl: selectedImage,
        description,
        location: location || undefined,
        visibility
      };

      if (isDemoMode) {
        // Simular delay de subida
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      await storyService.createStory(storyData);
      onStoryCreated();
      onClose();
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-md border-white/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Camera className="h-5 w-5 text-purple-400" />
              Crear Historia
            </CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive 
                ? 'border-purple-400 bg-purple-400/10' 
                : 'border-white/30 hover:border-white/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {selectedImage ? (
              <div className="relative">
                <img 
                  src={selectedImage} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  onClick={() => setSelectedImage(null)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-white/50" />
                <p className="text-white mb-2">Arrastra una imagen aquí</p>
                <p className="text-white/70 text-sm mb-4">o</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar Archivo
                </Button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Description */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Descripción (opcional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿Qué está pasando?"
              maxLength={280}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
              rows={3}
            />
            <p className="text-white/50 text-xs mt-1">
              {description.length}/280 caracteres
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Ubicación (opcional)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ciudad, País"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10"
              />
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Visibilidad
            </label>
            <div className="flex gap-2">
              <Button
                onClick={() => setVisibility('public')}
                variant={visibility === 'public' ? 'default' : 'outline'}
                size="sm"
                className={visibility === 'public' 
                  ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                  : 'border-white/30 text-white hover:bg-white/10'
                }
              >
                <Globe className="h-4 w-4 mr-2" />
                Público
              </Button>
              <Button
                onClick={() => setVisibility('private')}
                variant={visibility === 'private' ? 'default' : 'outline'}
                size="sm"
                className={visibility === 'private' 
                  ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                  : 'border-white/30 text-white hover:bg-white/10'
                }
              >
                <Lock className="h-4 w-4 mr-2" />
                Privado
              </Button>
            </div>
            <p className="text-white/50 text-xs mt-1">
              {visibility === 'public' 
                ? 'Todos los usuarios registrados pueden ver esta historia' 
                : 'Solo tus seguidores pueden ver esta historia'
              }
            </p>
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreateStory}
            disabled={!selectedImage || isUploading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Crear Historia
              </>
            )}
          </Button>

          {/* Demo Notice */}
          {safeGetItem<string>('demo_authenticated', { validate: true, defaultValue: 'false' }) === 'true' && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-200 text-xs text-center">
                📱 Modo Demo: Esta historia solo se guardará localmente
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
