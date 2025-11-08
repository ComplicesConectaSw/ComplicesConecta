import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/shared/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Eye, EyeOff, Users, AlertTriangle, Trash2 } from "lucide-react";
import { logger } from '@/lib/logger';
import { dataPrivacyService } from '@/services/DataPrivacyService';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const PrivacySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingMatches, setIsDeletingMatches] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [privacy, setPrivacy] = useState({
    profile_visibility: "everyone",
    show_online_status: true,
    show_distance: true,
    show_age: true,
    auto_approve_matches: true,
    block_screenshots: false,
    incognito_mode: false
  });

  const handlePrivacyChange = (key: string, value: boolean | string) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    logger.info("Privacy settings saved:", privacy);
    // TODO: Implementar guardado en backend
    toast({
      title: "Configuración guardada",
      description: "Tus preferencias de privacidad han sido guardadas"
    });
  };

  const handleDownloadData = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para descargar tus datos",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsExporting(true);
      logger.info("Requesting data download...");

      const exportData = await dataPrivacyService.exportUserData(user.id);
      
      if (exportData) {
        dataPrivacyService.downloadExport(exportData);
        toast({
          title: "✅ Datos descargados",
          description: "Tus datos han sido exportados exitosamente"
        });
      } else {
        throw new Error("No se pudieron exportar los datos");
      }
    } catch (error) {
      logger.error("Error descargando datos:", { error: error instanceof Error ? error.message : String(error) });
      toast({
        title: "Error",
        description: "No se pudieron descargar tus datos. Por favor intenta más tarde.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteMatches = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes estar autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsDeletingMatches(true);
      logger.warn("Requesting to delete match history...");

      const result = await dataPrivacyService.deleteMatchHistory(user.id);

      if (result.success) {
        toast({
          title: "✅ Historial eliminado",
          description: `Se eliminaron ${result.deletedCount} matches de tu historial`
        });
      } else {
        throw new Error(result.error || "Error desconocido");
      }
    } catch (error) {
      logger.error("Error eliminando historial de matches:", { error: error instanceof Error ? error.message : String(error) });
      toast({
        title: "Error",
        description: "No se pudo eliminar el historial de matches",
        variant: "destructive"
      });
    } finally {
      setIsDeletingMatches(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes estar autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsDeletingAccount(true);
      logger.error("Requesting permanent account deletion...");

      const result = await dataPrivacyService.deleteUserAccount(user.id);

      if (result.success) {
        toast({
          title: "✅ Cuenta eliminada",
          description: "Tu cuenta ha sido eliminada permanentemente. Serás redirigido...",
          variant: "default"
        });
        
        // Redirigir a logout o página principal después de un delay
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        throw new Error(result.errors?.join(', ') || "Error desconocido");
      }
    } catch (error) {
      logger.error("Error eliminando cuenta:", { error: error instanceof Error ? error.message : String(error) });
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuenta completamente. Algunos datos pueden no haberse eliminado.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visibilidad del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>¿Quién puede ver tu perfil?</Label>
            <Select 
              value={privacy.profile_visibility} 
              onValueChange={(value) => handlePrivacyChange('profile_visibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Todos los usuarios</SelectItem>
                <SelectItem value="matches">Solo mis matches</SelectItem>
                <SelectItem value="premium">Solo usuarios premium</SelectItem>
                <SelectItem value="verified">Solo usuarios verificados</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Controla quién puede encontrar y ver tu perfil completo
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-online">Mostrar estado en línea</Label>
              <p className="text-sm text-muted-foreground">
                Otros usuarios pueden ver si estás activo
              </p>
            </div>
            <Switch
              id="show-online"
              checked={privacy.show_online_status}
              onCheckedChange={(value) => handlePrivacyChange('show_online_status', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-distance">Mostrar distancia</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar tu distancia aproximada a otros usuarios
              </p>
            </div>
            <Switch
              id="show-distance"
              checked={privacy.show_distance}
              onCheckedChange={(value) => handlePrivacyChange('show_distance', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-age">Mostrar edad</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar tu edad en el perfil
              </p>
            </div>
            <Switch
              id="show-age"
              checked={privacy.show_age}
              onCheckedChange={(value) => handlePrivacyChange('show_age', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Privacy */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacidad Avanzada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-approve">Aprobar matches automáticamente</Label>
              <p className="text-sm text-muted-foreground">
                Crear matches automáticamente cuando alguien te gusta
              </p>
            </div>
            <Switch
              id="auto-approve"
              checked={privacy.auto_approve_matches}
              onCheckedChange={(value) => handlePrivacyChange('auto_approve_matches', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="block-screenshots">Bloquear capturas de pantalla</Label>
              <p className="text-sm text-muted-foreground">
                Intentar prevenir capturas de pantalla de tu perfil
              </p>
            </div>
            <Switch
              id="block-screenshots"
              checked={privacy.block_screenshots}
              onCheckedChange={(value) => handlePrivacyChange('block_screenshots', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <EyeOff className="h-4 w-4 text-primary" />
              <div>
                <Label htmlFor="incognito">Modo incógnito</Label>
                <p className="text-sm text-muted-foreground">
                  Navegar sin dejar rastro de visualizaciones
                </p>
              </div>
            </div>
            <Switch
              id="incognito"
              checked={privacy.incognito_mode}
              onCheckedChange={(value) => handlePrivacyChange('incognito_mode', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios Bloqueados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              No tienes usuarios bloqueados
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="shadow-soft border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Gestión de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/5 rounded-lg p-4">
            <h4 className="font-medium text-destructive mb-2">Zona Peligrosa</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Estas acciones son permanentes y no se pueden deshacer.
            </p>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="sm" 
                onClick={handleDownloadData}
                disabled={isExporting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isExporting ? "Exportando..." : "Descargar mis datos"}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    disabled={isDeletingMatches}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeletingMatches ? "Eliminando..." : "Eliminar historial de matches"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar historial de matches?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará permanentemente tu historial de matches. 
                      Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteMatches}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start" 
                    size="sm"
                    disabled={isDeletingAccount}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeletingAccount ? "Eliminando..." : "Eliminar cuenta permanentemente"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>⚠️ ¿Eliminar cuenta permanentemente?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará TODOS tus datos de forma permanente:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Tu perfil y datos personales</li>
                        <li>Tus imágenes y galería</li>
                        <li>Tu historial de matches</li>
                        <li>Tus mensajes (anonimizados)</li>
                        <li>Tus posts y stories</li>
                        <li>Todas tus preferencias</li>
                      </ul>
                      <strong className="block mt-3 text-destructive">
                        Esta acción NO se puede deshacer.
                      </strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Sí, eliminar mi cuenta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="love" size="lg" onClick={handleSave}>
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
};