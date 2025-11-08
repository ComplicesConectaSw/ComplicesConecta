import { useMemo } from "react";
import { Sliders, Heart, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface FilterState {
  ageRange: [number, number];
  distance: [number];
  interests: string[];
  education: string;
  profession: string;
  relationshipType: string[];
  lifestyle: string[];
  bodyType: string;
  height: [number, number];
  smoking: string;
  drinking: string;
  children: string;
  religion: string;
  gender: string;
  experienceLevel: string;
  onlyVerified: boolean;
  onlyPremium: boolean;
  onlyOnline: boolean;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
}

export const AdvancedFilters = ({ filters, onFiltersChange, onReset }: AdvancedFiltersProps) => {
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).reduce((acc, [k, v]) => {
            if (k === 'ageRange' && (v?.[0] !== 18 || v?.[1] !== 65)) return acc + 1;
            if (k === 'distance' && v?.[0] !== 25) return acc + 1;
            if (k === 'height' && (v?.[0] !== 150 || v?.[1] !== 200)) return acc + 1;
      if (k === 'interests' && Array.isArray(v) && v.length > 0) return acc + 1;
      if (k === 'relationshipType' && Array.isArray(v) && v.length > 0) return acc + 1;
      if (k === 'lifestyle' && Array.isArray(v) && v.length > 0) return acc + 1;
      if (typeof v === 'string' && v !== '' && k !== 'bodyType') return acc + 1;
      return acc;
    }, 0);
  }, [filters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onReset();
  };

  const availableInterests = [
    "Fiestas Privadas", "Intercambio de Parejas", "Eventos VIP", "Discreción Total", 
    "Experiencias Nuevas", "Terceras Personas", "Intercambio Suave", "Clubs Exclusivos", 
    "Parejas Verificadas", "Lifestyle Swinger", "Naturaleza", "Viajes",
    "Intercambio Completo", "Clubs Swinger México", "Eventos Exclusivos", "Mentalidad Abierta"
  ];

  const relationshipTypes = [
    "Parejas Swinger", "Encuentros Casuales", "Amistad con Beneficios", "Aventuras", "Experiencias Abiertas"
  ];

  const lifestyleOptions = [
    "Vida Nocturna", "Discreto", "Aventurero", "Experimentador", "Sociable", "Exclusivo"
  ];

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            Filtros Avanzados
          </span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Edad */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
                        Edad: {filters.ageRange?.[0] ?? 18} - {filters.ageRange?.[1] ?? 65} años
          </Label>
          <Slider
            value={filters.ageRange}
            onValueChange={(value) => updateFilter('ageRange', value as [number, number])}
            max={65}
            min={18}
            step={1}
            className="w-full"
          />
        </div>

        {/* Distancia */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
                        Distancia: {filters.distance?.[0] ?? 25} km
          </Label>
          <Slider
            value={filters.distance}
            onValueChange={(value) => updateFilter('distance', value as [number])}
            max={100}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Intereses */}
        <div className="space-y-3">
          <Label>Intereses</Label>
          <div className="grid grid-cols-2 gap-2">
            {availableInterests.map((interest) => (
              <div key={interest} className="flex items-center space-x-2">
                <Checkbox
                  id={interest}
                  checked={(filters.interests || []).includes(interest)}
                  onCheckedChange={(checked) => {
                    const currentInterests = filters.interests || [];
                    const newInterests = checked
                      ? [...currentInterests, interest]
                      : currentInterests.filter(i => i !== interest);
                    updateFilter('interests', newInterests);
                  }}
                />
                <Label htmlFor={interest} className="text-sm cursor-pointer">
                  {interest}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Educación */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Educación
          </Label>
          <Select value={filters.education} onValueChange={(value) => updateFilter('education', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona nivel educativo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="secundaria">Educación Secundaria</SelectItem>
              <SelectItem value="formacion">Formación Profesional</SelectItem>
              <SelectItem value="universitaria">Educación Universitaria</SelectItem>
              <SelectItem value="postgrado">Postgrado/Máster</SelectItem>
              <SelectItem value="doctorado">Doctorado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Profesión */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Área profesional
          </Label>
          <Select value={filters.profession} onValueChange={(value) => updateFilter('profession', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona área profesional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tecnologia">Tecnología</SelectItem>
              <SelectItem value="salud">Salud</SelectItem>
              <SelectItem value="educacion">Educación</SelectItem>
              <SelectItem value="negocios">Negocios</SelectItem>
              <SelectItem value="arte">Arte y Creatividad</SelectItem>
              <SelectItem value="servicio">Servicio al Cliente</SelectItem>
              <SelectItem value="independiente">Trabajador Independiente</SelectItem>
              <SelectItem value="estudiante">Estudiante</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Tipo de relación */}
        <div className="space-y-3">
          <Label>Tipo de relación buscada</Label>
          <div className="space-y-2">
            {relationshipTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={filters.relationshipType.includes(type)}
                  onCheckedChange={(checked) => {
                                        const currentTypes = filters.relationshipType || [];
                    const newTypes = checked
                      ? [...currentTypes, type]
                      : currentTypes.filter(t => t !== type);
                    updateFilter('relationshipType', newTypes);
                  }}
                />
                <Label htmlFor={type} className="text-sm cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Estilo de vida */}
        <div className="space-y-3">
          <Label>Estilo de vida</Label>
          <div className="grid grid-cols-2 gap-2">
            {lifestyleOptions.map((lifestyle) => (
              <div key={lifestyle} className="flex items-center space-x-2">
                <Checkbox
                  id={lifestyle}
                  checked={filters.lifestyle.includes(lifestyle)}
                  onCheckedChange={(checked) => {
                                        const currentLifestyle = filters.lifestyle || [];
                    const newLifestyle = checked
                      ? [...currentLifestyle, lifestyle]
                      : currentLifestyle.filter(l => l !== lifestyle);
                    updateFilter('lifestyle', newLifestyle);
                  }}
                />
                <Label htmlFor={lifestyle} className="text-sm cursor-pointer">
                  {lifestyle}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Altura */}
        <div className="space-y-3">
          <Label>
                        Altura: {filters.height?.[0] ?? 140}cm - {filters.height?.[1] ?? 220}cm
          </Label>
          <Slider
            value={filters.height}
            onValueChange={(value) => updateFilter('height', value as [number, number])}
            max={220}
            min={140}
            step={5}
            className="w-full"
          />
        </div>

        {/* Otros filtros */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fumar</Label>
            <Select value={filters.smoking} onValueChange={(value) => updateFilter('smoking', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Fumar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nunca">Nunca</SelectItem>
                <SelectItem value="ocasional">Ocasionalmente</SelectItem>
                <SelectItem value="regular">Regularmente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Beber</Label>
            <Select value={filters.drinking} onValueChange={(value) => updateFilter('drinking', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Beber" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nunca">Nunca</SelectItem>
                <SelectItem value="ocasional">Ocasionalmente</SelectItem>
                <SelectItem value="social">Socialmente</SelectItem>
                <SelectItem value="regular">Regularmente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="flex-1"
          >
            Limpiar
          </Button>
          <Button 
            variant="default"
            onClick={() => {}}
            className="flex-1"
          >
            Aplicar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};