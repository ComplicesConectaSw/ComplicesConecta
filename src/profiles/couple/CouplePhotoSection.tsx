import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Heart, Star, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';

interface CouplePhoto {
  id: string;
  url: string;
  partner: 'el' | 'ella';
  isMain: boolean;
  uploadedAt: Date;
}

interface CouplePhotoSectionProps {
  photos: CouplePhoto[];
  onPhotoUpload: (file: File, partner: 'el' | 'ella') => Promise<void>;
  onPhotoDelete: (photoId: string) => Promise<void>;
  onSetMainPhoto: (photoId: string, partner: 'el' | 'ella') => Promise<void>;
  isEditable?: boolean;
  maxPhotosPerPartner?: number;
}

export const CouplePhotoSection: React.FC<CouplePhotoSectionProps> = ({
  photos,
  onPhotoUpload,
  onPhotoDelete,
  onSetMainPhoto,
  isEditable = false,
  maxPhotosPerPartner = 6
}) => {
  const [uploading, setUploading] = useState<'el' | 'ella' | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fileInputElRef = useRef<HTMLInputElement>(null);
  const fileInputEllaRef = useRef<HTMLInputElement>(null);

  const getPhotosByPartner = (partner: 'el' | 'ella') => {
    return photos.filter(photo => photo.partner === partner);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, partner: 'el' | 'ella') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    // Verificar límite de fotos
    const currentPhotos = getPhotosByPartner(partner);
    if (currentPhotos.length >= maxPhotosPerPartner) {
      alert(`Máximo ${maxPhotosPerPartner} fotos por persona`);
      return;
    }

    try {
      setUploading(partner);
      await onPhotoUpload(file, partner);
    } catch (error) {
      logger.error('Error uploading photo:', { error: error instanceof Error ? error.message : String(error) });
      alert('Error al subir la foto. Inténtalo de nuevo.');
    } finally {
      setUploading(null);
      // Limpiar input
      event.target.value = '';
    }
  };

  const handleUploadClick = (partner: 'el' | 'ella') => {
    if (partner === 'el') {
      fileInputElRef.current?.click();
    } else {
      fileInputEllaRef.current?.click();
    }
  };

  const PhotoGrid: React.FC<{ partner: 'el' | 'ella' }> = ({ partner }) => {
    const partnerPhotos = getPhotosByPartner(partner);
    const _partnerColor = partner === 'el' ? 'blue' : 'pink';
    const partnerLabel = partner === 'el' ? 'Él' : 'Ella';

    return (
      <div className="space-y-4">
        {/* Header de la sección */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${partner === 'el' ? 'bg-blue-500' : 'bg-pink-500'}`} />
            <h3 className={`text-lg font-semibold ${partner === 'el' ? 'text-blue-600' : 'text-pink-600'}`}>
              Fotos de {partnerLabel}
            </h3>
            <Badge variant="outline" className="text-xs">
              {partnerPhotos.length}/{maxPhotosPerPartner}
            </Badge>
          </div>

          {isEditable && partnerPhotos.length < maxPhotosPerPartner && (
            <Button
              onClick={() => handleUploadClick(partner)}
              disabled={uploading === partner}
              size="sm"
              variant="outline"
              className={`${partner === 'el' ? 'border-blue-300 hover:bg-blue-50' : 'border-pink-300 hover:bg-pink-50'}`}
            >
              {uploading === partner ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4"
                >
                  <Upload className="w-4 h-4" />
                </motion.div>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </>
              )}
            </Button>
          )}
        </div>

        {/* Grid de fotos */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <AnimatePresence>
            {partnerPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative group"
              >
                <Card className="overflow-hidden border-2 border-transparent hover:border-gray-200 transition-all duration-300">
                  <div className="relative aspect-square">
                    <img
                      src={photo.url}
                      alt={`Foto de ${partnerLabel} ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                      onClick={() => setSelectedPhoto(photo.id)}
                    />
                    
                    {/* Badge de foto principal */}
                    {photo.isMain && (
                      <div className="absolute top-2 left-2">
                        <Badge className={`${partner === 'el' ? 'bg-blue-500' : 'bg-pink-500'} text-white`}>
                          <Star className="w-3 h-3 mr-1" />
                          Principal
                        </Badge>
                      </div>
                    )}

                    {/* Overlay con acciones */}
                    {isEditable && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          {!photo.isMain && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSetMainPhoto(photo.id, partner);
                              }}
                              className="bg-white bg-opacity-90 hover:bg-opacity-100"
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPhotoDelete(photo.id);
                            }}
                            className="bg-red-500 bg-opacity-90 hover:bg-opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Placeholder para agregar foto */}
          {isEditable && partnerPhotos.length < maxPhotosPerPartner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: partnerPhotos.length * 0.1 }}
            >
              <Card 
                className={`aspect-square border-2 border-dashed cursor-pointer transition-all duration-300 hover:border-solid ${
                  partner === 'el' 
                    ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50' 
                    : 'border-pink-300 hover:border-pink-400 hover:bg-pink-50'
                }`}
                onClick={() => handleUploadClick(partner)}
              >
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-gray-600">
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-sm text-center px-2">
                    Agregar foto de {partnerLabel}
                  </span>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Mensaje cuando no hay fotos */}
        {partnerPhotos.length === 0 && !isEditable && (
          <div className="text-center py-8 text-gray-500">
            <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay fotos de {partnerLabel} aún</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Inputs ocultos para subir archivos */}
      <input
        ref={fileInputElRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, 'el')}
        className="hidden"
      />
      <input
        ref={fileInputEllaRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, 'ella')}
        className="hidden"
      />

      {/* Sección de fotos de Él */}
      <PhotoGrid partner="el" />

      {/* Separador */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" />
            Pareja
            <Heart className="w-4 h-4 text-red-400" />
          </span>
        </div>
      </div>

      {/* Sección de fotos de Ella */}
      <PhotoGrid partner="ella" />

      {/* Modal de vista previa de foto */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos.find(p => p.id === selectedPhoto)?.url}
                alt="Vista previa"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouplePhotoSection;
