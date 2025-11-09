import React, { useState } from 'react';
import { Card, CardContent } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { EyeOff, Lock, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/lib/logger';

interface PrivateImageRequestProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  profileName: string;
  profileType: 'single' | 'couple';
  onRequestSent?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const PrivateImageRequest: React.FC<PrivateImageRequestProps> = ({
  isOpen: _isOpen,
  onClose: _onClose,
  profileId,
  profileName,
  profileType = 'single',
  onRequestSent,
  onCancel,
  className = ''
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendRequest = async () => {
    if (isLoading) return;

    setIsLoading(true);
    
    try {
      // Simular envío de solicitud (en producción sería una llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log de la solicitud
      logger.info('Solicitud de acceso a imágenes privadas enviada', {
        profileId,
        profileName,
        profileType,
        message: message.trim() || 'Sin mensaje personalizado'
      });

      toast({
        title: "Solicitud enviada",
        description: `Tu solicitud de acceso a las imágenes privadas de ${profileName} ha sido enviada.`,
      });

      onRequestSent?.();
    } catch (error) {
      logger.error('Error enviando solicitud de acceso', { error: error instanceof Error ? error.message : String(error), profileId, profileName });
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`bg-white/10 backdrop-blur-md border-white/20 shadow-glow ${className}`}>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Imágenes Privadas
          </h3>
          <p className="text-sm text-white/80">
            {profileName} tiene imágenes privadas. Envía una solicitud para acceder a ellas.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Mensaje personalizado (opcional)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe un mensaje para acompañar tu solicitud..."
              rows={3}
              className="resize-none bg-white/20 border-white/30 text-white placeholder:text-white/70"
              maxLength={200}
            />
            <p className="text-xs text-white/60 mt-1">
              {message.length}/200 caracteres
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSendRequest}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
            
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-start gap-3">
            <EyeOff className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-white/80">
              <p className="font-medium mb-1">Política de Privacidad</p>
              <p>
                Las imágenes privadas son contenido exclusivo que requiere autorización. 
                El usuario puede aceptar o rechazar tu solicitud. Respeta siempre las decisiones 
                de otros miembros de la comunidad.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivateImageRequest;
