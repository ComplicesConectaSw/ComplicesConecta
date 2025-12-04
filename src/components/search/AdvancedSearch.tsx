/**
 * =====================================================
 * ADVANCED SEARCH COMPONENT
 * =====================================================
 * Búsqueda avanzada con múltiples filtros
 * Features: Filtros, rangos, tags, ordenamiento
 * Fecha: 19 Nov 2025
 * Versión: v3.6.5
 * =====================================================
 */

import React, { useState } from 'react';
import { Search, Filter, X, MapPin, Calendar, Heart, Star, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/Card';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  query: string;
  ageRange: [number, number];
  distance: number; // km
  gender: ('male' | 'female' | 'other' | 'couple')[];
  relationshipStatus: string[];
  interests: string[];
  verified: boolean;
  online: boolean;
  hasPhotos: boolean;
  sortBy: 'relevance' | 'distance' | 'newest' | 'popular';
}

const INTERESTS_OPTIONS = [
  '🎵 Música', '🎬 Cine', '📚 Lectura', '🏃 Deporte', '🍳 Cocina',
  '✈️ Viajes', '🎨 Arte', '🎮 Gaming', '🧘 Yoga', '🍷 Vino',
  '🏖️ Playa', '⛰️ Montaña', '💃 Baile', '🎭 Teatro', '📸 Fotografía',
  '🎸 Rock', '🎹 Jazz', '🎪 Circo', '🏋️ Gym', '🧗 Escalada'
];

const RELATIONSHIP_OPTIONS = [
  'Soltero/a',
  'En una relación',
  'Casado/a',
  'Relación abierta',
  'Poliamoroso/a',
  'Divorciado/a',
  'Viudo/a'
];

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  initialFilters
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {
    query: '',
    ageRange: [18, 65],
    distance: 50,
    gender: [],
    relationshipStatus: [],
    interests: [],
    verified: false,
    online: false,
    hasPhotos: false,
    sortBy: 'relevance'
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const toggleGender = (gender: SearchFilters['gender'][0]) => {
    const current = filters.gender;
    if (current.includes(gender)) {
      setFilters({ ...filters, gender: current.filter(g => g !== gender) });
    } else {
      setFilters({ ...filters, gender: [...current, gender] });
    }
  };

  const toggleRelationshipStatus = (status: string) => {
    const current = filters.relationshipStatus;
    if (current.includes(status)) {
      setFilters({ ...filters, relationshipStatus: current.filter(s => s !== status) });
    } else {
      setFilters({ ...filters, relationshipStatus: [...current, status] });
    }
  };

  const toggleInterest = (interest: string) => {
    const current = filters.interests;
    if (current.includes(interest)) {
      setFilters({ ...filters, interests: current.filter(i => i !== interest) });
    } else {
      setFilters({ ...filters, interests: [...current, interest] });
    }
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      ageRange: [18, 65],
      distance: 50,
      gender: [],
      relationshipStatus: [],
      interests: [],
      verified: false,
      online: false,
      hasPhotos: false,
      sortBy: 'relevance'
    });
  };

  const activeFiltersCount = 
    filters.gender.length +
    filters.relationshipStatus.length +
    filters.interests.length +
    (filters.verified ? 1 : 0) +
    (filters.online ? 1 : 0) +
    (filters.hasPhotos ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                placeholder="Buscar por nombre, intereses..."
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            <Button onClick={handleSearch} className="bg-purple-500 hover:bg-purple-600">
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold">Filtros Avanzados</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Limpiar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Age Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Edad: {filters.ageRange[0]} - {filters.ageRange[1]} años
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="range"
                      min="18"
                      max="99"
                      value={filters.ageRange[0]}
                      onChange={(e) => setFilters({
                        ...filters,
                        ageRange: [parseInt(e.target.value), filters.ageRange[1]]
                      })}
                      className="flex-1"
                      aria-label="Edad mínima"
                    />
                    <input
                      type="range"
                      min="18"
                      max="99"
                      aria-label="Edad máxima"
                      value={filters.ageRange[1]}
                      onChange={(e) => setFilters({
                        ...filters,
                        ageRange: [filters.ageRange[0], parseInt(e.target.value)]
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Distance */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Distancia máxima: {filters.distance} km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="500"
                    value={filters.distance}
                    onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
                    className="w-full"
                    aria-label="Distancia máxima en kilómetros"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 km</span>
                    <span>500 km</span>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium mb-2">Género</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'male', label: '👨 Hombre' },
                      { value: 'female', label: '👩 Mujer' },
                      { value: 'other', label: '🌈 Otro' },
                      { value: 'couple', label: '💑 Pareja' }
                    ].map(({ value, label }) => (
                      <Badge
                        key={value}
                        variant={filters.gender.includes(value as any) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleGender(value as any)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Relationship Status */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Heart className="h-4 w-4 inline mr-1" />
                    Estado de Relación
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {RELATIONSHIP_OPTIONS.map((status) => (
                      <Badge
                        key={status}
                        variant={filters.relationshipStatus.includes(status) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleRelationshipStatus(status)}
                      >
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Star className="h-4 w-4 inline mr-1" />
                    Intereses ({filters.interests.length} seleccionados)
                  </label>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS_OPTIONS.map((interest) => (
                        <Badge
                          key={interest}
                          variant={filters.interests.includes(interest) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleInterest(interest)}
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <label className="block text-sm font-medium mb-2">Filtros Rápidos</label>
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <input
                        type="checkbox"
                        checked={filters.verified}
                        onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                        className="cursor-pointer"
                      />
                      <span className="text-sm">✅ Verificados</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <input
                        type="checkbox"
                        checked={filters.online}
                        onChange={(e) => setFilters({ ...filters, online: e.target.checked })}
                        className="cursor-pointer"
                      />
                      <span className="text-sm">🟢 En línea</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <input
                        type="checkbox"
                        checked={filters.hasPhotos}
                        onChange={(e) => setFilters({ ...filters, hasPhotos: e.target.checked })}
                        className="cursor-pointer"
                      />
                      <span className="text-sm">📸 Con fotos</span>
                    </label>
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium mb-2">Ordenar por</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    aria-label="Ordenar resultados por"
                  >
                    <option value="relevance">Más relevantes</option>
                    <option value="distance">Más cercanos</option>
                    <option value="newest">Más recientes</option>
                    <option value="popular">Más populares</option>
                  </select>
                </div>

                {/* Apply Button */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleSearch} className="flex-1 bg-purple-500 hover:bg-purple-600">
                    Aplicar Filtros
                  </Button>
                  <Button variant="outline" onClick={resetFilters}>
                    Resetear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filtros activos:</span>
          
          {filters.gender.map((g) => (
            <Badge key={g} variant="secondary" className="cursor-pointer" onClick={() => toggleGender(g)}>
              {g} <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}

          {filters.relationshipStatus.map((s) => (
            <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => toggleRelationshipStatus(s)}>
              {s} <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}

          {filters.interests.slice(0, 3).map((i) => (
            <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => toggleInterest(i)}>
              {i} <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}

          {filters.interests.length > 3 && (
            <Badge variant="outline">
              +{filters.interests.length - 3} más
            </Badge>
          )}

          {filters.verified && (
            <Badge variant="secondary">✅ Verificados</Badge>
          )}

          {filters.online && (
            <Badge variant="secondary">🟢 En línea</Badge>
          )}

          {filters.hasPhotos && (
            <Badge variant="secondary">📸 Con fotos</Badge>
          )}

          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Limpiar todo
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;

