import { useState } from "react";
import { Flag, AlertTriangle, UserX, MessageSquareOff, Camera, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Modal";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/useToast";
import { reportService } from "@/services/ReportService";

interface StoryReportDialogProps {
  storyId: string;
  storyAuthor: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onReport: (reason: string) => void;
}

export const StoryReportDialog = ({ storyId, storyAuthor, isOpen, onOpenChange, onReport }: StoryReportDialogProps) => {
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [blockUser, setBlockUser] = useState(false);
  const [hideContent, setHideContent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const reportReasons = [
    {
      id: "inappropriate-content",
      label: "Contenido inapropiado",
      description: "Imágenes o contenido ofensivo",
      icon: <Camera className="h-4 w-4" />
    },
    {
      id: "explicit-content",
      label: "Contenido explícito",
      description: "Desnudez o contenido sexual explícito",
      icon: <Eye className="h-4 w-4" />
    },
    {
      id: "harassment",
      label: "Acoso o intimidación",
      description: "Contenido que acosa o intimida",
      icon: <MessageSquareOff className="h-4 w-4" />
    },
    {
      id: "fake-profile",
      label: "Perfil falso",
      description: "El autor parece ser un perfil falso",
      icon: <UserX className="h-4 w-4" />
    },
    {
      id: "spam",
      label: "Spam o promoción",
      description: "Promoción no deseada o spam",
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      id: "underage",
      label: "Menor de edad",
      description: "El contenido involucra menores de edad",
      icon: <Flag className="h-4 w-4" />
    },
    {
      id: "violence",
      label: "Violencia o contenido perturbador",
      description: "Contenido violento o perturbador",
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      id: "impersonation",
      label: "Suplantación de identidad",
      description: "Se hace pasar por otra persona",
      icon: <UserX className="h-4 w-4" />
    },
    {
      id: "other",
      label: "Otro motivo",
      description: "Otro motivo no listado arriba",
      icon: <Flag className="h-4 w-4" />
    }
  ];

  const handleSubmit = async () => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Por favor selecciona un motivo para el reporte",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Enviar reporte usando el servicio
      const result = await reportService.createReport({
        reportedContentId: storyId,
        contentType: 'story',
        reason: reportType,
        description: description || undefined
      });

      if (result.success) {
        onReport(reportType);

        // Mostrar confirmación
        toast({
          title: "Historia reportada",
          description: `Hemos recibido tu reporte sobre la historia de ${storyAuthor}. La revisaremos en las próximas 24 horas.`
        });

        if (hideContent) {
          toast({
            title: "Contenido ocultado",
            description: "La historia ha sido ocultada de tu feed mientras se revisa."
          });
        }

        if (blockUser) {
          toast({
            title: "Usuario bloqueado",
            description: `${storyAuthor} ha sido bloqueado y no podrás ver su contenido.`
          });
        }

        // Resetear formulario
        setReportType("");
        setDescription("");
        setBlockUser(false);
        setHideContent(true);
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo enviar el reporte. Inténtalo de nuevo.",
          variant: "destructive"
        });
      }

    } catch {
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Reportar Historia
          </DialogTitle>
          <DialogDescription>
            Reporta esta historia de {storyAuthor} si viola las normas de la comunidad.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Motivos del reporte */}
          <div className="space-y-3">
            <Label className="text-base font-medium">¿Por qué reportas esta historia?</Label>
            <RadioGroup value={reportType} onValueChange={setReportType}>
              {reportReasons.map((reason) => (
                <div key={reason.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={reason.id} id={reason.id} className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={reason.id} className="flex items-center gap-2 cursor-pointer">
                      {reason.icon}
                      {reason.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Descripción adicional */}
          {reportType && (
            <div className="space-y-3">
              <Label htmlFor="description">
                Detalles adicionales (opcional)
              </Label>
              <Textarea
                id="description"
                placeholder="Proporciona más detalles sobre el problema..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Incluye cualquier información específica que pueda ayudarnos a investigar.
              </p>
            </div>
          )}

          {/* Opciones adicionales */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="hide-content"
                checked={hideContent}
                onCheckedChange={(checked) => setHideContent(!!checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="hide-content" className="cursor-pointer">
                  Ocultar esta historia de mi feed
                </Label>
                <p className="text-sm text-muted-foreground">
                  No verás más esta historia mientras se revisa el reporte.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="block-user"
                checked={blockUser}
                onCheckedChange={(checked) => setBlockUser(!!checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="block-user" className="cursor-pointer">
                  Bloquear a {storyAuthor}
                </Label>
                <p className="text-sm text-muted-foreground">
                  No podrás ver el contenido de esta persona ni recibir mensajes.
                </p>
              </div>
            </div>
          </div>

          {/* Información importante */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Información importante
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Los reportes falsos pueden resultar en restricciones en tu cuenta. 
                  Solo reporta contenido que viole genuinamente nuestras normas comunitarias.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reportType || isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar Reporte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

