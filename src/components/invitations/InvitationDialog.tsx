import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserPlus, MessageCircle, Image, User } from 'lucide-react';
import { invitationService } from '@/lib/invitations';
import { useToast } from "@/hooks/useToast";
import { safeGetItem } from '@/utils/safeLocalStorage';

interface InvitationDialogProps {
  targetProfileId: string;
  targetProfileName: string;
  children: React.ReactNode;
}

export function InvitationDialog({ targetProfileId, targetProfileName, children }: InvitationDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'profile' | 'gallery' | 'chat'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: "Mensaje requerido",
        description: "Por favor escribe un mensaje para la invitación.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const demoUser = safeGetItem<unknown>('demo_user', { validate: false, defaultValue: null });
      const currentUser = typeof demoUser === 'string' ? JSON.parse(demoUser) : (demoUser as { id?: string } | null);
      
      await invitationService.sendInvitation(
        (currentUser && typeof currentUser === 'object' && 'id' in currentUser) ? currentUser.id || '1' : '1',
        targetProfileId,
        type,
        message.trim()
      );

      toast({
        title: "Invitación enviada",
        description: `Tu invitación a ${targetProfileName} ha sido enviada exitosamente.`,
      });

      setMessage('');
      setType('profile');
      setOpen(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la invitación. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (invType: string) => {
    switch (invType) {
      case 'profile': return <User className="h-4 w-4" />;
      case 'gallery': return <Image className="h-4 w-4" />;
      case 'chat': return <MessageCircle className="h-4 w-4" />;
      default: return <UserPlus className="h-4 w-4" />;
    }
  };

  const getTypeDescription = (invType: string) => {
    switch (invType) {
      case 'profile': return 'Solicitar conexión general con el perfil';
      case 'gallery': return 'Solicitar acceso a la galería privada';
      case 'chat': return 'Solicitar permiso para chat privado';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Enviar Invitación a {targetProfileName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de invitación</Label>
            <Select value={type} onValueChange={(value: 'profile' | 'gallery' | 'chat') => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profile">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Conexión de Perfil</span>
                  </div>
                </SelectItem>
                <SelectItem value="gallery">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    <span>Acceso a Galería</span>
                  </div>
                </SelectItem>
                <SelectItem value="chat">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat Privado</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {getTypeDescription(type)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              placeholder="Escribe un mensaje personalizado..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              className="flex-1"
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? (
                "Enviando..."
              ) : (
                <>
                  {getTypeIcon(type)}
                  <span className="ml-2">Enviar</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
