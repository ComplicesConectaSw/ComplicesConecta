import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { imagesService } from '@/lib/images';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  profileId: string;
  onImageUploaded?: (imageId: string, url: string) => void;
  type?: 'profile' | 'gallery' | 'cover';
  maxFiles?: number;
}

export function ImageUpload({ 
  profileId, 
  onImageUploaded, 
  type = 'gallery',
  maxFiles = 5 
}: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        variant: "destructive",
        title: "Demasiados archivos",
        description: `Máximo ${maxFiles} imágenes permitidas.`,
      });
      return;
    }

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);

    // Generar previews
    const newPreviews = [...previews];
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "Sin archivos",
        description: "Selecciona al menos una imagen para subir.",
      });
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        const result = await imagesService.uploadImage(
          file,
          profileId,
          isPublic,
          type,
          title || undefined,
          description || undefined
        );

        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Error al subir imagen",
            description: result.error,
          });
          continue;
        }

        if (onImageUploaded && result.imageId && result.url) {
          onImageUploaded(result.imageId, result.url);
        }
      }

      toast({
        title: "Imágenes subidas",
        description: `${files.length} imagen(es) subida(s) correctamente.`,
      });

      // Limpiar formulario
      setFiles([]);
      setPreviews([]);
      setTitle('');
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: "Ocurrió un error al subir las imágenes.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Subir Imágenes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selector de archivos */}
        <div>
          <Label htmlFor="file-upload">Seleccionar imágenes</Label>
          <Input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple={maxFiles > 1}
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Máximo {maxFiles} imagen(es). Formatos: JPG, PNG, WebP. Tamaño máximo: 10MB cada una.
          </p>
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Configuración de privacidad */}
        <div className="flex items-center space-x-2">
          <Switch
            id="is-public"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
          <Label htmlFor="is-public">
            {isPublic ? 'Imagen pública (visible para todos)' : 'Imagen privada (requiere permiso)'}
          </Label>
        </div>

        {/* Metadatos opcionales */}
        <div className="space-y-2">
          <div>
            <Label htmlFor="title">Título (opcional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la imagen"
            />
          </div>
          <div>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la imagen"
              rows={2}
            />
          </div>
        </div>

        {/* Botón de subida */}
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Subiendo...' : `Subir ${files.length} imagen(es)`}
        </Button>
      </CardContent>
    </Card>
  );
}
