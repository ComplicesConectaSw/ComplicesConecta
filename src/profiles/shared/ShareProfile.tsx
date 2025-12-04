import { useState, useEffect } from "react";
import { Share2, Copy, Facebook, Instagram, MessageCircle, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";

interface ShareProfileProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  profileName: string;
}

export const ShareProfile = ({ isOpen, onClose, profileId, profileName }: ShareProfileProps) => {
  const { toast } = useToast();
  const [profileUrl] = useState(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/profile/${profileId}`;
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Enlace copiado",
        description: "El enlace del perfil se ha copiado al portapapeles"
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive"
      });
    }
  };

  const handleShare = (platform: string) => {
    const text = `¡Mira el perfil de ${profileName} en ComplicesConecta!`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + profileUrl)}`);
        break;
      case 'instagram':
        // Instagram no permite compartir enlaces directamente, copiamos el link
        handleCopyLink();
        toast({
          title: "Listo para Instagram",
          description: "Enlace copiado. Pégalo en tu historia de Instagram"
        });
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: `Perfil de ${profileName}`,
            text: text,
            url: profileUrl,
          });
        }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir perfil de {profileName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* URL del perfil */}
          <div className="space-y-2">
            <Label htmlFor="profile-url">Enlace del perfil</Label>
            <div className="flex gap-2">
              <Input
                id="profile-url"
                value={profileUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Opciones de compartir */}
          <div className="space-y-3">
            <Label>Compartir en:</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleShare('whatsapp')}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleShare('instagram')}
                className="flex items-center gap-2"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleShare('native')}
                className="flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                Más opciones
              </Button>
            </div>
          </div>

          {/* Código QR */}
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <QrCode className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Código QR disponible próximamente
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
