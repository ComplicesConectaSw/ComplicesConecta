import { useState } from "react";
import { Search, MapPin, Calendar, Heart, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterState {
  location: string;
  ageRange: [number, number];
  interests: string[];
  onlineOnly: boolean;
  searchQuery: string;
}

interface ProfileFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export const ProfileFilters = ({ onFilterChange }: ProfileFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    location: "all",
    ageRange: [18, 50] as [number, number],
    interests: [] as string[],
    onlineOnly: false,
    searchQuery: ""
  });

  const locations = ["Todas", "Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "Cancún"];
  const interestOptions = [
    "Lifestyle Swinger", "Intercambio de Parejas", "Eventos Lifestyle", "Mentalidad Abierta",
    "Fiestas Temáticas", "Clubs Privados", "Experiencias Nuevas", "Ambiente Sensual",
    "Arte Erótico", "Fotografía Erótica", "Conexiones Auténticas", "Diversión Adulta"
  ];

  const handleFilterUpdate = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const toggleInterest = (interest: string) => {
    const newInterests = filters.interests.includes(interest)
      ? filters.interests.filter(i => i !== interest)
      : [...filters.interests, interest];
    handleFilterUpdate({ interests: newInterests });
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      location: "all",
      ageRange: [18, 50] as [number, number],
      interests: [],
      onlineOnly: false,
      searchQuery: ""
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <Card className="mb-8 shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros de Búsqueda
          </CardTitle>
          <Button 
            variant="ghost" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-primary"
          >
            {isExpanded ? "Contraer" : "Expandir"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre o profesión..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterUpdate({ searchQuery: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Quick Filters Row */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="online-only"
              checked={filters.onlineOnly}
              onCheckedChange={(checked) => handleFilterUpdate({ onlineOnly: checked })}
            />
            <Label htmlFor="online-only" className="text-sm font-medium">
              Solo en línea
            </Label>
          </div>
          
          <Select value={filters.location} onValueChange={(value) => handleFilterUpdate({ location: value })}>
            <SelectTrigger className="w-40">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {locations.slice(1).map((location) => (
                <SelectItem key={location} value={location.toLowerCase()}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 border-t pt-6">
            {/* Age Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Rango de Edad: {filters.ageRange[0]} - {filters.ageRange[1]} años
              </Label>
              <Slider
                value={filters.ageRange}
                onValueChange={(value) => handleFilterUpdate({ ageRange: value as [number, number] })}
                max={60}
                min={18}
                step={1}
                className="w-full"
              />
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Intereses
              </Label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <Badge
                    key={interest}
                    variant={filters.interests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={clearFilters} size="sm">
                Limpiar Filtros
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
