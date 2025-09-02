import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Eye, EyeOff, Users, AlertTriangle, Trash2 } from "lucide-react";

export const PrivacySettings = () => {
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
    console.log("Privacy settings saved:", privacy);
    // Lógica para guardar en el backend
  };

  const handleDownloadData = () => {
    console.log("Requesting data download...");
    // Lógica para iniciar la descarga de datos
  };

  const handleDeleteMatches = () => {
    console.warn("Requesting to delete match history...");
    // Lógica para eliminar historial de matches, probablemente con confirmación
  };

  const handleDeleteAccount = () => {
    console.error("Requesting permanent account deletion...");
    // Lógica para eliminar la cuenta, probablemente con confirmación
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
              <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleDownloadData}>
                <Trash2 className="h-4 w-4 mr-2" />
                Descargar mis datos
              </Button>
              
              <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleDeleteMatches}>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar historial de matches
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full justify-start" 
                size="sm"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar cuenta permanentemente
              </Button>
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