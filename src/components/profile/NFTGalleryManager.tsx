/**
 * NFTGalleryManager - Componente para crear y gestionar galerías NFT
 * 
 * Feature: Galerías NFT-Verificadas con GTK
 * - Crear galerías NFT
 * - Mint galerías usando GTK tokens
 * - Gestionar imágenes en galerías
 * 
 * @version 3.5.0
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/Modal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image as ImageIcon, 
  Plus, 
  Coins, 
  CheckCircle, 
  Loader2,
  Eye,
  Globe,
  Lock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/hooks/useToast';
import { nftGalleryService, NFTGallery, NFTGalleryImage } from '@/services/NFTGalleryService';
import { tokenService } from '@/services/TokenService';
import { logger } from '@/lib/logger';

interface NFTGalleryManagerProps {
  userId?: string;
  profileId?: string;
}

export const NFTGalleryManager: React.FC<NFTGalleryManagerProps> = ({ 
  userId: propUserId, 
  profileId 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = propUserId || user?.id || '';

  const [galleries, setGalleries] = useState<NFTGallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<NFTGallery | null>(null);
  const [galleryImages, setGalleryImages] = useState<NFTGalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [balance, setBalance] = useState<{ gtk: number; cmpx: number } | null>(null);
  
  // Form states
  const [galleryName, setGalleryName] = useState('');
  const [galleryDescription, setGalleryDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<'ethereum' | 'polygon'>('polygon');

  useEffect(() => {
    if (userId) {
      loadGalleries();
      loadBalance();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedGallery) {
      loadGalleryImages(selectedGallery.id);
    }
  }, [selectedGallery]);

  const loadGalleries = async () => {
    try {
      setIsLoading(true);
      const userGalleries = await nftGalleryService.getUserGalleries(userId);
      setGalleries(userGalleries);
    } catch (error) {
      logger.error('Error cargando galerías NFT:', { error: String(error) });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las galerías NFT'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadGalleryImages = async (galleryId: string) => {
    try {
      const images = await nftGalleryService.getGalleryImages(galleryId);
      setGalleryImages(images);
    } catch (error) {
      logger.error('Error cargando imágenes de galería:', { error: String(error) });
    }
  };

  const loadBalance = async () => {
    try {
      const tokenBalance = await tokenService.getBalance(userId);
      setBalance(tokenBalance);
    } catch (error) {
      logger.error('Error cargando balance:', { error: String(error) });
    }
  };

  const handleCreateGallery = async () => {
    if (!galleryName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'El nombre de la galería es requerido'
      });
      return;
    }

    try {
      setIsCreating(true);
      const newGallery = await nftGalleryService.createGallery(userId, {
        galleryName: galleryName.trim(),
        description: galleryDescription.trim(),
        isPublic,
        profileId
      });

      setGalleries(prev => [newGallery, ...prev]);
      setShowCreateDialog(false);
      setGalleryName('');
      setGalleryDescription('');
      setIsPublic(false);

      toast({
        title: 'Galería creada',
        description: 'Tu galería NFT ha sido creada exitosamente'
      });
    } catch (error) {
      logger.error('Error creando galería:', { error: String(error) });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear la galería NFT'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleMintGallery = async () => {
    if (!selectedGallery) return;

    const mintCost = nftGalleryService.getMintCost('gallery');
    
    if (!balance || balance.gtk < mintCost) {
      toast({
        variant: 'destructive',
        title: 'Balance insuficiente',
        description: `Necesitas ${mintCost} GTK para mint esta galería. Tienes ${balance?.gtk || 0} GTK.`
      });
      return;
    }

    try {
      setIsMinting(true);
      const mintedGallery = await nftGalleryService.mintGalleryNFT({
        userId,
        galleryId: selectedGallery.id,
        gtkAmount: mintCost,
        network: selectedNetwork,
        metadata: {
          galleryName: selectedGallery.galleryName,
          description: selectedGallery.description
        }
      });

      setGalleries(prev => prev.map(g => g.id === mintedGallery.id ? mintedGallery : g));
      setSelectedGallery(mintedGallery);
      await loadBalance();

      toast({
        title: 'Galería mintada',
        description: `Tu galería NFT ha sido mintada en ${selectedNetwork} exitosamente`
      });
      setShowMintDialog(false);
    } catch (error) {
      logger.error('Error minting galería:', { error: String(error) });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo mint la galería NFT'
      });
    } finally {
      setIsMinting(false);
    }
  };

  // Función para agregar imágenes (para uso futuro)
  // const handleAddImage = async (galleryId: string, imageUrl: string) => {
  //   try {
  //     const newImage = await nftGalleryService.addImageToGallery(galleryId, imageUrl);
  //     setGalleryImages(prev => [...prev, newImage]);
  //     
  //     toast({
  //       title: 'Imagen agregada',
  //       description: 'La imagen ha sido agregada a la galería'
  //     });
  //   } catch (error) {
  //     logger.error('Error agregando imagen:', { error: String(error) });
  //     toast({
  //       variant: 'destructive',
  //       title: 'Error',
  //       description: 'No se pudo agregar la imagen'
  //     });
  //   }
  // };

  const getNetworkBadge = (network: string) => {
    switch (network) {
      case 'ethereum':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500">Ethereum</Badge>;
      case 'polygon':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500">Polygon</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            Galerías NFT
          </h2>
          <p className="text-white/70">
            Crea y gestiona tus galerías NFT verificadas con GTK tokens
          </p>
        </div>

        {/* Balance */}
        {balance && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-white/70">Balance GTK</p>
              <p className="text-xl font-bold text-yellow-400 flex items-center gap-1">
                <Coins className="h-5 w-5" />
                {balance.gtk.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Create Gallery Button */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Crear Galería
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/90 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">Crear Nueva Galería NFT</DialogTitle>
              <DialogDescription className="text-white/70">
                Crea una galería NFT para mostrar tus imágenes. Puedes mintarla más tarde usando GTK tokens.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Nombre de la Galería *</label>
                <Input
                  value={galleryName}
                  onChange={(e) => setGalleryName(e.target.value)}
                  placeholder="Mi Galería NFT"
                  className="bg-black/50 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Descripción</label>
                <Textarea
                  value={galleryDescription}
                  onChange={(e) => setGalleryDescription(e.target.value)}
                  placeholder="Describe tu galería..."
                  className="bg-black/50 border-white/20 text-white"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isPublic" className="text-white text-sm">
                  Hacer galería pública
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateGallery}
                  disabled={isCreating || !galleryName.trim()}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="bg-black/30 border-white/10">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white/50" />
            <p className="text-white/70">Cargando galerías...</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && galleries.length === 0 && (
        <Card className="bg-black/30 border-white/10">
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-white/50" />
            <h3 className="text-xl font-semibold text-white mb-2">No tienes galerías NFT</h3>
            <p className="text-white/70 mb-4">
              Crea tu primera galería NFT para comenzar a mostrar tus imágenes
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-yellow-500 to-orange-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Galería
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Galleries Grid */}
      {!isLoading && galleries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleries.map((gallery) => (
            <Card
              key={gallery.id}
              className="bg-black/30 border-white/10 hover:border-yellow-500/50 transition-colors cursor-pointer"
              onClick={() => setSelectedGallery(gallery)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white flex items-center gap-2">
                      {gallery.isPublic ? (
                        <Globe className="h-4 w-4 text-green-400" />
                      ) : (
                        <Lock className="h-4 w-4 text-purple-400" />
                      )}
                      {gallery.galleryName}
                    </CardTitle>
                    {gallery.description && (
                      <CardDescription className="text-white/70 mt-1">
                        {gallery.description}
                      </CardDescription>
                    )}
                  </div>
                  {gallery.isVerified && (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {getNetworkBadge(gallery.nftNetwork)}
                    {gallery.mintedWithGtk && (
                      <Badge variant="outline" className="text-yellow-400 border-yellow-500">
                        <Coins className="h-3 w-3 mr-1" />
                        {gallery.mintedWithGtk} GTK
                      </Badge>
                    )}
                  </div>
                  
                  {gallery.nftContractAddress && (
                    <div className="text-xs text-white/60">
                      <p>Contract: {gallery.nftContractAddress.substring(0, 10)}...</p>
                      {gallery.nftTokenId && <p>Token: {gallery.nftTokenId}</p>}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGallery(gallery);
                      }}
                      className="flex-1 mr-2"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    {gallery.nftNetwork === 'pending' && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGallery(gallery);
                          setShowMintDialog(true);
                        }}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 flex-1"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Mint
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mint Dialog */}
      <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
        <DialogContent className="bg-black/90 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Mint Galería NFT</DialogTitle>
            <DialogDescription className="text-white/70">
              Mint tu galería como NFT usando GTK tokens. Una vez mintada, será verificada en blockchain.
            </DialogDescription>
          </DialogHeader>
          {selectedGallery && (
            <div className="space-y-4">
              <div>
                <p className="text-white mb-2">Galería: <strong>{selectedGallery.galleryName}</strong></p>
                <p className="text-white/70 text-sm">
                  Costo: <strong className="text-yellow-400">{nftGalleryService.getMintCost('gallery')} GTK</strong>
                </p>
              </div>
              
              <div>
                <label className="text-white text-sm mb-2 block">Red Blockchain</label>
                <Tabs value={selectedNetwork} onValueChange={(v) => setSelectedNetwork(v as 'ethereum' | 'polygon')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
                    <TabsTrigger value="polygon">Polygon</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {balance && balance.gtk < nftGalleryService.getMintCost('gallery') && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                  <p className="text-red-400 text-sm">
                    Balance insuficiente. Necesitas {nftGalleryService.getMintCost('gallery')} GTK, tienes {balance.gtk} GTK.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowMintDialog(false)}
                  disabled={isMinting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleMintGallery}
                  disabled={isMinting || !balance || balance.gtk < nftGalleryService.getMintCost('gallery')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500"
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Mint Galería
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Gallery Detail Modal */}
      {selectedGallery && (
        <Dialog open={!!selectedGallery} onOpenChange={() => setSelectedGallery(null)}>
          <DialogContent className="bg-black/90 border-white/20 max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                {selectedGallery.galleryName}
                {selectedGallery.isVerified && (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                )}
              </DialogTitle>
              <DialogDescription className="text-white/70">
                {selectedGallery.description || 'Sin descripción'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {getNetworkBadge(selectedGallery.nftNetwork)}
                {selectedGallery.isPublic ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500">
                    <Globe className="h-3 w-3 mr-1" />
                    Pública
                  </Badge>
                ) : (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500">
                    <Lock className="h-3 w-3 mr-1" />
                    Privada
                  </Badge>
                )}
              </div>

              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((image) => (
                    <Card key={image.id} className="bg-black/50 border-white/10">
                      <div className="aspect-square">
                        <img
                          src={image.imageUrl}
                          alt={`Imagen ${image.id}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-black/50 border-white/10 p-8 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-white/50" />
                  <p className="text-white/70">No hay imágenes en esta galería</p>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

