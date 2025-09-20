import React, { useState, useEffect } from 'react';
import { Camera, Upload, Eye, EyeOff, Trash2, Lock, Unlock, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    if (import.meta.env.DEV) {
      console.log('Toast:', options.title, options.description);
    }
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

  const loadImagesFromSupabase = async () => {
    try {
      // Implementación real de carga desde Supabase Storage
      const { data, error } = await supabase.storage
        .from('user-images')
        .list('public', {
          limit: 100,
          offset: 0
        });

      if (error) {
        console.error('Error loading from Supabase:', error);
        setImages([]);
        return;
      }

      const imageList: ImageData[] = data?.map((file: any, index: number) => ({
        id: `supabase-${index}`,
        url: supabase.storage.from('user-images').getPublicUrl(`public/${file.name}`).data.publicUrl,
        isPrivate: false,
        uploadedAt: new Date(file.created_at || Date.now()),
        title: file.name,
        likes: 0,
        accessRequests: []
      })) || [];

      setImages(imageList);
    } catch (error) {
      console.error('Error loading images from Supabase:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

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
        // Modo real: cargar desde Supabase Storage
        await loadImagesFromSupabase();
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
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${viewerUserId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('user-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('user-images')
            .getPublicUrl(filePath);

          const newImage: ImageData = {
            id: Date.now().toString(),
            url: publicUrl,
            isPrivate: false,
            uploadedAt: new Date(),
            title: file.name,
            likes: 0,
            accessRequests: []
          };

          setImages(prev => [newImage, ...prev]);
          setUploading(false);
          toast({
            title: "¡Éxito!",
            description: "Imagen subida correctamente a Supabase Storage",
          });
        } catch (error) {
          console.error('Error uploading to Supabase:', error);
          setUploading(false);
          toast({
            title: "Error",
            description: "Error al subir la imagen. Inténtalo de nuevo.",
            variant: "destructive",
          });
        }
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
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-800 via-pink-700 to-purple-800 bg-clip-text text-transparent">
            {isOwner ? 'Mi Galería de Fotos' : 'Galería de Fotos'}
          </h2>
          {isDemo && (
            <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">
              <Camera className="w-3 h-3 mr-1" />
              Modo Demo
            </Badge>
          )}
        </div>
        
        {isOwner && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              data-testid="image-upload-input"
              aria-label="Subir imagen a la galería"
            />
            <Button
              onClick={() => document.getElementById('image-upload')?.click()}
              disabled={uploading || loading}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              data-testid="upload-image-btn"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Subiendo...' : 'Subir Foto'}
            </Button>
          </div>
        )}
      </div>

      {/* Tabs para público/privado con diseño responsivo */}
      {isOwner && (
        <div className="flex mb-6 sm:mb-8 border-b border-purple-200/50 bg-white/50 backdrop-blur-sm rounded-t-xl p-1">
          <button
            onClick={() => setSelectedTab('publicas')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 font-semibold rounded-lg transition-all duration-200 text-sm sm:text-base ${
              selectedTab === 'publicas'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50'
            }`}
            data-testid="public-gallery-tab"
          >
            Públicas ({publicImages.length})
          </button>
          <button
            onClick={() => setSelectedTab('privadas')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 font-semibold rounded-lg transition-all duration-200 text-sm sm:text-base ml-2 ${
              selectedTab === 'privadas'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50'
            }`}
            data-testid="private-gallery-tab"
          >
            Privadas ({privateImages.length})
          </button>
        </div>
      )}

      {/* Grid de imágenes responsivo */}
      <div 
        className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6"
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
            <p className="text-gray-700 dark:text-gray-200">
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
                      <p className="text-sm text-gray-700 dark:text-gray-200">Imagen Privada</p>
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
