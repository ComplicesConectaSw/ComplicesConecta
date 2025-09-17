import React, { useState, useEffect } from 'react';
import { Camera, Upload, Eye, EyeOff, Trash2, Lock, Unlock, Heart, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';

interface ImageData {
  id: string;
  url: string;
  isPrivate: boolean;
  uploadedAt: Date;
  title?: string;
  thumbnail?: string;
  accessRequests?: AccessRequest[];
  likes?: number;
  comments?: Comment[];
}

interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

interface UserGalleryPageProps {
  userId?: string;
  isOwner?: boolean;
  isDemo?: boolean;
  viewerUserId?: string;
}

export const UserGalleryPage: React.FC<UserGalleryPageProps> = ({ 
  userId, 
  isOwner = false,
  isDemo = false,
  viewerUserId
}) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'publicas' | 'privadas'>('publicas');
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  
  const toast = (options: any) => {
    console.log('Toast:', options.title, options.description);
  };

  // Datos demo para desarrollo con thumbnails y datos completos
  const demoImages: ImageData[] = [
    {
      id: '1',
      url: '/src/assets/profile-1.jpg',
      thumbnail: '/src/assets/profile-1.jpg',
      isPrivate: false,
      uploadedAt: new Date('2024-01-15'),
      title: 'Foto de perfil pública',
      likes: 12,
      comments: [
        { id: '1', userId: 'user1', userName: 'María', text: '¡Qué bella foto!', createdAt: new Date() }
      ]
    },
    {
      id: '2', 
      url: '/src/assets/profile-2.jpg',
      thumbnail: '/src/assets/profile-2.jpg',
      isPrivate: true,
      uploadedAt: new Date('2024-01-20'),
      title: 'Foto privada exclusiva',
      likes: 8,
      accessRequests: [
        { id: '1', requesterId: 'user2', requesterName: 'Carlos', status: 'pending', requestedAt: new Date() }
      ]
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      thumbnail: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200',
      isPrivate: false,
      uploadedAt: new Date('2024-01-25'),
      title: 'Foto de galería',
      likes: 15
    }
  ];

  useEffect(() => {
    loadImages();
  }, [userId, isDemo]);

  const loadImages = async () => {
    setLoading(true);
    try {
      if (isDemo) {
        // Modo demo: usar imágenes simuladas
        setTimeout(() => {
          setImages(demoImages);
          setLoading(false);
        }, 1000);
      } else {
        // Modo real: cargar desde Supabase
        // TODO: Implementar carga real desde Supabase Storage
        setImages([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: "Error", 
        description: "La imagen no puede ser mayor a 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      if (isDemo) {
        // Modo demo: simular subida
        setTimeout(() => {
          const newImage: ImageData = {
            id: Date.now().toString(),
            url: URL.createObjectURL(file),
            thumbnail: URL.createObjectURL(file),
            isPrivate: false,
            uploadedAt: new Date(),
            title: file.name,
            likes: 0
          };
          
          setImages(prev => [newImage, ...prev]);
          setUploading(false);
          
          toast({
            title: "¡Éxito!",
            description: "Imagen subida correctamente en modo demo",
          });
        }, 2000);
      } else {
        // Modo real: subir a Supabase Storage
        // TODO: Implementar subida real a Supabase
        setUploading(false);
        toast({
          title: "Info",
          description: "Subida real a Supabase pendiente de implementar",
        });
      }
    } catch (error) {
      setUploading(false);
      toast({
        title: "Error",
        description: "Error al subir la imagen",
        variant: "destructive"
      });
    }
  };

  const togglePrivacy = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, isPrivate: !img.isPrivate }
        : img
    ));
    
    toast({
      title: "Privacidad actualizada",
      description: `Imagen marcada como ${!image.isPrivate ? 'privada' : 'pública'}`,
    });
  };

  const deleteImage = async (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    
    toast({
      title: "Imagen eliminada",
      description: "La imagen se ha eliminado de tu galería",
    });
  };

  const requestAccess = async (imageId: string) => {
    if (!viewerUserId) return;
    
    const newRequest: AccessRequest = {
      id: Date.now().toString(),
      requesterId: viewerUserId,
      requesterName: 'Usuario Demo',
      status: 'pending',
      requestedAt: new Date()
    };
    
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, accessRequests: [...(img.accessRequests || []), newRequest] }
        : img
    ));
    
    toast({
      title: "Solicitud enviada",
      description: "Tu solicitud de acceso ha sido enviada al propietario",
    });
  };

  const handleAccessRequest = async (imageId: string, requestId: string, action: 'approve' | 'reject') => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { 
            ...img, 
            accessRequests: img.accessRequests?.map(req => 
              req.id === requestId 
                ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' }
                : req
            )
          }
        : img
    ));
    
    toast({
      title: action === 'approve' ? "Acceso concedido" : "Acceso denegado",
      description: `La solicitud ha sido ${action === 'approve' ? 'aprobada' : 'rechazada'}`,
    });
  };

  const canViewPrivateImage = (image: ImageData): boolean => {
    if (isOwner) return true;
    if (!image.isPrivate) return true;
    return image.accessRequests?.some(req => 
      req.requesterId === viewerUserId && req.status === 'approved'
    ) || false;
  };

  const filteredImages = images.filter(img => 
    selectedTab === 'publicas' ? !img.isPrivate : img.isPrivate
  );

  const publicImages = images.filter(img => !img.isPrivate);
  const privateImages = images.filter(img => img.isPrivate);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isOwner ? 'Mi Galería de Fotos' : 'Galería de Fotos'}
          </h2>
          {isDemo && (
            <Badge variant="outline" className="mt-1">
              Modo Demo
            </Badge>
          )}
        </div>
        
        {isOwner && (
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              data-testid="image-upload-input"
            />
            <Button
              onClick={() => document.getElementById('image-upload')?.click()}
              disabled={uploading || loading}
              className="bg-pink-600 hover:bg-pink-700"
              data-testid="upload-image-btn"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Subiendo...' : 'Subir Foto'}
            </Button>
          </div>
        )}
      </div>

      {/* Tabs para público/privado */}
      {isOwner && (
        <div className="flex mb-6 border-b">
          <button
            onClick={() => setSelectedTab('publicas')}
            className={`px-4 py-2 font-medium ${
              selectedTab === 'publicas'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            data-testid="public-gallery-tab"
          >
            Públicas ({publicImages.length})
          </button>
          <button
            onClick={() => setSelectedTab('privadas')}
            className={`px-4 py-2 font-medium ml-4 ${
              selectedTab === 'privadas'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            data-testid="private-gallery-tab"
          >
            Privadas ({privateImages.length})
          </button>
        </div>
      )}

      {/* Grid de imágenes */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        data-testid="image-gallery"
      >
        {loading && (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          </div>
        )}

        {!loading && filteredImages.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {selectedTab === 'publicas' 
                ? 'No hay fotos públicas aún' 
                : 'No hay fotos privadas aún'
              }
            </p>
            {isOwner && (
              <p className="text-sm text-gray-400 mt-2">
                Sube tu primera foto para comenzar
              </p>
            )}
          </div>
        )}

        {!loading && filteredImages.map((image) => (
          <Card key={image.id} className="overflow-hidden group">
            <CardContent className="p-0 relative">
              {canViewPrivateImage(image) ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer">
                      <img
                        src={image.thumbnail || image.url}
                        alt={image.title || 'Foto de galería'}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform"
                        data-testid={`gallery-image-${image.id}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
                        }}
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>{image.title}</DialogTitle>
                    </DialogHeader>
                    <img
                      src={image.url}
                      alt={image.title || 'Foto de galería'}
                      className="w-full max-h-96 object-contain"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm">
                          <Heart className="w-4 h-4 mr-1" />
                          {image.likes || 0}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {image.comments?.length || 0}
                        </Button>
                      </div>
                      <Badge variant={image.isPrivate ? "destructive" : "secondary"}>
                        {image.isPrivate ? (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            Privada
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3 mr-1" />
                            Pública
                          </>
                        )}
                      </Badge>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Imagen Privada</p>
                      {!isOwner && viewerUserId && (
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() => requestAccess(image.id)}
                          data-testid={`request-access-${image.id}`}
                        >
                          Solicitar Acceso
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Overlay con controles para propietario */}
              {isOwner && canViewPrivateImage(image) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => togglePrivacy(image.id)}
                    data-testid={`privacy-toggle-${image.id}`}
                    title={image.isPrivate ? 'Hacer pública' : 'Hacer privada'}
                  >
                    {image.isPrivate ? (
                      <Unlock className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteImage(image.id)}
                    data-testid={`delete-image-${image.id}`}
                    title="Eliminar imagen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Badge de privacidad */}
              <div className="absolute top-2 right-2">
                <Badge variant={image.isPrivate ? "destructive" : "secondary"}>
                  {image.isPrivate ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Privada
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 mr-1" />
                      Pública
                    </>
                  )}
                </Badge>
              </div>

              {/* Solicitudes pendientes para propietario */}
              {isOwner && image.accessRequests?.some(req => req.status === 'pending') && (
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className="bg-yellow-100">
                    {image.accessRequests.filter(req => req.status === 'pending').length} solicitudes
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estadísticas */}
      {isOwner && images.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Resumen de Galería</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total de fotos:</span>
              <span className="font-medium ml-2">{images.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Fotos públicas:</span>
              <span className="font-medium ml-2">{publicImages.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Fotos privadas:</span>
              <span className="font-medium ml-2">{privateImages.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserGalleryPage;
