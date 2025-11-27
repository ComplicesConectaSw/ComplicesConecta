import { useState, useEffect } from "react";
import { Database } from '@/types/supabase-generated';

interface _UserPreferences {
  interests: string[];
  // Define other preferences fields here if they exist
}
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

interface SearchFilters {
  ageRange: [number, number];
  maxDistance: number;
  gender: string;
  interests: string[];
  location: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  hasPhoto: boolean;
  isOnline: boolean;
}

type ProfileWithDistance = Database['public']['Tables']['profiles']['Row'] & {
  distance: number | null;
  compatibilityScore: number;
};

interface PreferenceSearchProps {
  onResultsChange: (results: ProfileWithDistance[]) => void;
  currentUserId: string;
}

const availableInterests = [
  "Deportes", "Música", "Viajes", "Cocina", "Arte", "Tecnología",
  "Libros", "Cine", "Naturaleza", "Fitness", "Fotografía", "Baile"
];

export const PreferenceSearch = ({ onResultsChange, currentUserId }: PreferenceSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    ageRange: [18, 50],
    maxDistance: 50,
    gender: "all",
    interests: [],
    location: {},
    hasPhoto: false,
    isOnline: false
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const [resultsCount, setResultsCount] = useState(0);
  const { location, getCurrentLocation, calculateDistance, isLoading: locationLoading } = useGeolocation();

  useEffect(() => {
    if (location) {
      setFilters(prev => ({
        ...prev,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: "Mi ubicación actual"
        }
      }));
    }
  }, [location]);

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleInterest = (interest: string) => {
    setFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const searchProfiles = async () => {
    setIsSearching(true);
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        setIsSearching(false);
        return;
      }

      const supabaseClient = supabase;

      let query = supabaseClient
        .from('profiles')
        .select(`
          *,
          user_preferences(*)
        `)
        .neq('id', currentUserId)
        .gte('age', filters.ageRange[0])
        .lte('age', filters.ageRange[1]);

      if (filters.gender !== "all") {
        query = query.eq('gender', filters.gender);
      }

      if (filters.hasPhoto) {
        query = query.not('avatar_url', 'is', null);
      }

      if (filters.isOnline) {
        query = query.eq('is_online', true);
      }

      const { data: profiles, error } = await query;

      if (error) throw error;

      let filteredResults = profiles || [];

      // Filter by distance if location is available
      if (filters.location.latitude && filters.location.longitude) {
        filteredResults = filteredResults.filter((profile: any) => {
          if (!(profile as any).latitude || !(profile as any).longitude) return false;
          
          const distance = calculateDistance(
            filters.location.latitude!,
            filters.location.longitude!,
            (profile as any).latitude,
            (profile as any).longitude
          );
          
          return distance <= filters.maxDistance;
        });
      }

      // Filter by interests
      if (filters.interests.length > 0) {
        filteredResults = filteredResults.filter((_profile: any) => {
          // Mock preferences since user_preferences doesn't exist in current schema
          const mockPreferences = {
            interests: ['Lifestyle Swinger', 'Intercambio de Parejas', 'Eventos Lifestyle', 'Mentalidad Abierta'],
            ageRange: { min: 25, max: 35 },
            location: 'Madrid' // Mock location since field doesn't exist
          };
          
          if (!mockPreferences.interests || !Array.isArray(mockPreferences.interests)) return false;

          return Array.isArray(mockPreferences.interests) && filters.interests.some((interest: string) => mockPreferences.interests.includes(interest));
        });
      }

      // Add distance and compatibility score
      const enrichedResults = filteredResults.map((profile: any) => {
        let distance = null;
        if (filters.location.latitude && filters.location.longitude && (profile as any).latitude && (profile as any).longitude) {
          distance = calculateDistance(
            filters.location.latitude,
            filters.location.longitude,
            (profile as any).latitude,
            (profile as any).longitude
          );
        }

        // Calculate compatibility score based on shared interests (Mock)
        let compatibilityScore = 60; // Base score
        const mockPrefs = {
          interests: ['Lifestyle Swinger', 'Intercambio de Parejas', 'Eventos Lifestyle', 'Mentalidad Abierta']
        };
        
        if (filters.interests.length > 0) {
          const sharedInterests = filters.interests.filter((interest: string) => mockPrefs.interests.includes(interest));
          if (filters.interests.length > 0 || mockPrefs.interests.length > 0) {
            compatibilityScore += (sharedInterests.length / Math.max(filters.interests.length, mockPrefs.interests.length)) * 40;
          }
        }

        return {
          ...profile,
          distance,
          compatibilityScore: Math.round(compatibilityScore)
        };
      });

      // Sort by compatibility score and distance
      enrichedResults.sort((a: ProfileWithDistance, b: ProfileWithDistance) => {
        if (a.compatibilityScore !== b.compatibilityScore) {
          return b.compatibilityScore - a.compatibilityScore;
        }
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        return 0;
      });

      setResultsCount(enrichedResults.length);
      onResultsChange(enrichedResults);
    } catch (error) {
      logger.error('Error searching profiles:', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      ageRange: [18, 50],
      maxDistance: 50,
      gender: "all",
      interests: [],
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        address: "Mi ubicación actual"
      } : {},
      hasPhoto: false,
      isOnline: false
    });
    setResultsCount(0);
    onResultsChange([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Búsqueda por Preferencias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Age Range */}
        <div className="space-y-2">
          <Label>Rango de edad: {filters.ageRange[0]} - {filters.ageRange[1]} años</Label>
          <Slider
            value={filters.ageRange}
            onValueChange={(value) => updateFilter('ageRange', value as [number, number])}
            min={18}
            max={80}
            step={1}
            className="w-full"
          />
        </div>

        {/* Distance */}
        <div className="space-y-2">
          <Label>Distancia máxima: {filters.maxDistance} km</Label>
          <Slider
            value={[filters.maxDistance]}
            onValueChange={(value) => updateFilter('maxDistance', value[0])}
            min={1}
            max={200}
            step={1}
            className="w-full"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label>Ubicación de búsqueda</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              {locationLoading ? "Obteniendo..." : "Mi ubicación"}
            </Button>
            {filters.location.address && (
              <Badge variant="secondary">{filters.location.address}</Badge>
            )}
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label>Género</Label>
          <Select value={filters.gender} onValueChange={(value) => updateFilter('gender', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="male">Hombres</SelectItem>
              <SelectItem value="female">Mujeres</SelectItem>
              <SelectItem value="non-binary">No binario</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <Label>Intereses ({filters.interests.length} seleccionados)</Label>
          <div className="grid grid-cols-2 gap-2">
            {availableInterests.map((interest) => (
              <div key={interest} className="flex items-center space-x-2">
                <Checkbox
                  id={interest}
                  checked={filters.interests.includes(interest)}
                  onCheckedChange={() => toggleInterest(interest)}
                />
                <Label htmlFor={interest} className="text-sm">{interest}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Filters */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasPhoto"
              checked={filters.hasPhoto}
              onCheckedChange={(checked) => updateFilter('hasPhoto', !!checked)}
            />
            <Label htmlFor="hasPhoto">Solo perfiles con foto</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOnline"
              checked={filters.isOnline}
              onCheckedChange={(checked) => updateFilter('isOnline', !!checked)}
            />
            <Label htmlFor="isOnline">Solo usuarios en línea</Label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={searchProfiles} disabled={isSearching} className="flex-1">
            {isSearching ? "Buscando..." : `Buscar ${resultsCount > 0 ? `(${resultsCount})` : ""}`}
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar
          </Button>
        </div>

        {/* Results Count */}
        {resultsCount > 0 && (
          <div className="text-center">
            <Badge variant="secondary">
              {resultsCount} perfil{resultsCount !== 1 ? 'es' : ''} encontrado{resultsCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};