import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { MapPin, Navigation, AlertCircle } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

export const LocationSettings = () => {
  const [searchRadius, setSearchRadius] = useState([25]);
  const [autoDetectLocation, setAutoDetectLocation] = useState(false);
  const [showDistance, setShowDistance] = useState(true);
  const [preciseLocation, setPreciseLocation] = useState(true);
  const [locationHistory, setLocationHistory] = useState(false);
  const { location, error, isLoading, getCurrentLocation } = useGeolocation();

  const handleLocationPermission = async () => {
    setAutoDetectLocation(true);
    await getCurrentLocation();
  };

  const handleSave = () => {
    console.log("Settings saved:", {
      searchRadius: searchRadius[0],
      autoDetectLocation,
      showDistance,
      preciseLocation,
      locationHistory,
    });
    // Aquí iría la lógica para guardar en el backend
  };

  return (
    <div className="space-y-6">
      {/* Current Location */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicación Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {location ? (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="h-4 w-4 text-primary" />
                <span className="font-medium">Ubicación detectada</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Latitud: {location.latitude.toFixed(6)}<br />
                Longitud: {location.longitude.toFixed(6)}
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">
                Ubicación no detectada
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permite el acceso a tu ubicación para encontrar personas cerca de ti
              </p>
              <Button 
                variant="love" 
                onClick={handleLocationPermission}
                disabled={isLoading}
                className="gap-2"
              >
                <Navigation className="h-4 w-4" />
                {isLoading ? 'Detectando...' : 'Detectar Ubicación'}
              </Button>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Error de ubicación</span>
              </div>
              <p className="text-sm text-destructive/80 mt-1">
                {error}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-detect">Detección automática</Label>
              <p className="text-sm text-muted-foreground">
                Actualizar ubicación automáticamente
              </p>
            </div>
            <Switch
              id="auto-detect"
              checked={autoDetectLocation}
              onCheckedChange={setAutoDetectLocation}
            />
          </div>
        </CardContent>
      </Card>

      {/* Search Preferences */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Preferencias de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Radio de búsqueda: {searchRadius[0]} km
            </Label>
            <Slider
              value={searchRadius}
              onValueChange={setSearchRadius}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 km</span>
              <span>100 km</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-distance">Mostrar distancia</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar la distancia en los perfiles
              </p>
            </div>
            <Switch
              id="show-distance"
              checked={showDistance}
              onCheckedChange={setShowDistance}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Privacy */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Privacidad de Ubicación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">
                  Tu privacidad es importante
                </h4>
                <p className="text-sm text-muted-foreground">
                  Tu ubicación exacta nunca se comparte. Solo mostramos la distancia 
                  aproximada a otros usuarios para mejorar las conexiones.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="precise-location">Ubicación precisa</Label>
                <p className="text-sm text-muted-foreground">
                  Usar GPS para ubicación más exacta
                </p>
              </div>
              <Switch 
                id="precise-location" 
                checked={preciseLocation}
                onCheckedChange={setPreciseLocation}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="location-history">Historial de ubicaciones</Label>
                <p className="text-sm text-muted-foreground">
                  Recordar ubicaciones visitadas
                </p>
              </div>
              <Switch 
                id="location-history" 
                checked={locationHistory}
                onCheckedChange={setLocationHistory}
              />
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