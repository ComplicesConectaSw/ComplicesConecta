import React, { useState } from 'react';
import { Card, CardContent } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Eye, Lock, Unlock, Check, X } from 'lucide-react';
import { PrivateImageRequest } from './PrivateImageRequest';

interface PrivateImage {
  id: string;
  url: string;
  thumbnail?: string;
  uploadedAt: Date;
}

interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  respondedAt?: Date;
}

interface PrivateImageGalleryProps {
  images: PrivateImage[];
  profileId: string;
  profileName: string;
  profileType: 'single' | 'couple';
  isOwner: boolean;
  hasAccess?: boolean;
  accessRequests?: AccessRequest[];
  onRequestAccess?: () => void;
  onApproveRequest?: (requestId: string) => void;
  onRejectRequest?: (requestId: string) => void;
  className?: string;
}

export const PrivateImageGallery: React.FC<PrivateImageGalleryProps> = ({
  images,
  profileId,
  profileName,
  profileType,
  isOwner,
  hasAccess,
  accessRequests = [],
  onRequestAccess,
  onApproveRequest,
  onRejectRequest,
  className = ''
}) => {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pendingRequests = accessRequests.filter(req => req.status === 'pending');

  const handleRequestAccess = () => {
    setShowRequestDialog(true);
  };

  const handleRequestSent = () => {
    setShowRequestDialog(false);
    onRequestAccess?.();
  };

  const handleImageClick = (imageId: string) => {
    if (hasAccess || isOwner) {
      setSelectedImage(imageId);
    }
  };

  if (showRequestDialog) {
    return (
      <PrivateImageRequest
        isOpen={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        profileId={profileId}
        profileName={profileName}
        profileType={profileType}
        onRequestSent={handleRequestSent}
        className={className}
      />
    );
  }

  return (
    <Card className={`bg-white/10 backdrop-blur-md border-white/20 shadow-glow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-400" />
            <h3 className="font-semibold text-white">
              Imágenes Privadas
            </h3>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
              {images.length}
            </Badge>
          </div>
          
          {isOwner && pendingRequests.length > 0 && (
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
              {pendingRequests.length} solicitudes
            </Badge>
          )}
        </div>

        {/* Solicitudes pendientes (solo para el propietario) */}
        {isOwner && pendingRequests.length > 0 && (
          <div className="mb-6 space-y-3">
            <h4 className="text-sm font-medium text-white">Solicitudes de acceso</h4>
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {request.requesterName}
                    </p>
                    {request.message && (
                      <p className="text-xs text-white/70 mt-1">
                        "{request.message}"
                      </p>
                    )}
                    <p className="text-xs text-white/50 mt-2">
                      {request.requestedAt.toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => onApproveRequest?.(request.id)}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onRejectRequest?.(request.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Galería de imágenes */}
        {images.length === 0 ? (
          <div className="text-center py-8">
            <Lock className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">
              {isOwner ? 'No has subido imágenes privadas' : 'No hay imágenes privadas disponibles'}
            </p>
          </div>
        ) : (
          <>
            {hasAccess || isOwner ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square cursor-pointer group"
                    onClick={() => handleImageClick(image.id)}
                  >
                    <img
                      src={image.thumbnail || image.url}
                      alt="Imagen privada"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border-2 border-dashed border-purple-400/30">
                  <Lock className="h-8 w-8 text-purple-400" />
                </div>
                <p className="text-white/80 mb-4">
                  {profileName} tiene {images.length} imagen{images.length !== 1 ? 'es' : ''} privada{images.length !== 1 ? 's' : ''}
                </p>
                <Button
                  onClick={handleRequestAccess}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Solicitar Acceso
                </Button>
              </div>
            )}
          </>
        )}

        {/* Modal de imagen ampliada */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <img
                src={images.find(img => img.id === selectedImage)?.url}
                alt="Imagen privada ampliada"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <Button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrivateImageGallery;
