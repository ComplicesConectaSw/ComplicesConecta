import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Eye, Lock, Unlock, Check, X } from 'lucide-react';
import { PrivateImageRequest } from './PrivateImageRequest';
import { SafeImage } from '@/components/ui/SafeImage';

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
  isParentalLocked?: boolean;
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
  className = '',
  isParentalLocked = true,
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
    if (!isParentalLocked && (hasAccess || isOwner)) {
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

        {/* Control parental: depende del estado global isParentalLocked */}
        {isParentalLocked ? (
          <div className="space-y-6">
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-lg overflow-hidden"
                  >
                    <SafeImage
                      src={image.thumbnail || image.url}
                      alt="Imagen privada bloqueada"
                      fallbackType="private"
                      className="w-full h-full object-cover filter blur-lg scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                      <Lock className="h-8 w-8 text-purple-300 mb-2" />
                      <p className="text-xs text-white/80">Contenido protegido por PIN</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

              <div className="max-w-md mx-auto bg-black/40 border border-white/15 rounded-2xl p-4 space-y-3">
                <p className="text-sm text-white/80 text-center font-medium">
                  🔒 Galería privada bloqueada por control parental
                </p>
                <p className="text-xs text-white/60 text-center">
                  Usa el candado global del perfil para desbloquear todo el contenido privado.
                </p>
              </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-green-300 flex items-center gap-2">
                <Unlock className="h-4 w-4" />
                Galería desbloqueada (control parental global)
              </p>
            </div>

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
                        <SafeImage
                          src={image.thumbnail || image.url}
                          alt="Imagen privada"
                          fallbackType="private"
                          className="w-full h-full rounded-lg overflow-hidden"
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
          </>
        )}

        {/* Modal de imagen ampliada */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
              <Card className="bg-black/40 backdrop-blur-2xl border-white/20 overflow-hidden">
                <CardContent className="p-2 sm:p-4">
                  <SafeImage
                    src={images.find(img => img.id === selectedImage)?.url || ''}
                    alt="Imagen privada ampliada"
                    fallbackType="private"
                    className="max-h-[80vh] w-full"
                  />
                  <Button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrivateImageGallery;

