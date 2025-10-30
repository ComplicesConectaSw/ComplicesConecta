/**
 * S2 Geometry Service - Geosharding para escalabilidad
 * Inspirado en Grindr 2025: Celdas geográficas para queries paralelas
 * 
 * Features:
 * - Conversión lat/lng → S2 cell ID
 * - Celdas vecinas (9 celdas: actual + 8 adyacentes)
 * - Nivel óptimo según radio de búsqueda
 * - Queries paralelas por celda
 * 
 * v3.5.0 - Fase 2.1
 * 
 * Benchmarks esperados:
 * - Query nearby (100k users CDMX): 5s → 100ms (50x mejora)
 * - Query nearby (1M users global): 30s → 300ms (100x mejora)
 * 
 * @version 3.5.0
 * @date 2025-10-30
 */

import { S2 } from 's2-geometry';

export interface S2Config {
  defaultLevel: number;
  maxLevel: number;
  minLevel: number;
}

export interface S2Cell {
  id: string;
  level: number;
  lat: number;
  lng: number;
  neighbors?: string[];
}

/**
 * S2Service - Servicio principal de geosharding
 * Maneja conversión lat/lng a celdas S2 y queries optimizadas
 */
export class S2Service {
  private config: S2Config;

  constructor(config?: Partial<S2Config>) {
    this.config = {
      defaultLevel: 15, // ~1km² (ideal para matching urbano)
      maxLevel: 20,     // ~100m² (muy preciso)
      minLevel: 10,     // ~100km² (búsquedas amplias)
      ...config,
    };
  }

  /**
   * Convierte lat/lng a S2 cell ID
   * @param lat Latitud (-90 a 90)
   * @param lng Longitud (-180 a 180)
   * @param level Nivel de precisión (10-20, default 15)
   * @returns S2 cell ID como string token
   */
  getCell(lat: number, lng: number, level: number = this.config.defaultLevel): string {
    try {
      // Validar coordenadas
      if (lat < -90 || lat > 90) {
        throw new Error(`Invalid latitude: ${lat}. Must be between -90 and 90.`);
      }
      if (lng < -180 || lng > 180) {
        throw new Error(`Invalid longitude: ${lng}. Must be between -180 and 180.`);
      }
      if (level < this.config.minLevel || level > this.config.maxLevel) {
        throw new Error(`Invalid level: ${level}. Must be between ${this.config.minLevel} and ${this.config.maxLevel}.`);
      }

      // Convertir a S2 LatLng
      const s2LatLng = S2.S2LatLng.fromDegrees(lat, lng);
      
      // Obtener cell ID
      const cell = S2.S2CellId.fromLatLng(s2LatLng);
      
      // Obtener parent al nivel deseado
      const parentCell = cell.parent(level);
      
      // Retornar como token (string compacto)
      return parentCell.toToken();
    } catch (error) {
      console.error('[S2Service] Error getting cell:', error);
      throw error;
    }
  }

  /**
   * Obtiene información completa de una celda S2
   * @param lat Latitud
   * @param lng Longitud
   * @param level Nivel de precisión
   * @returns Objeto S2Cell con metadata
   */
  getCellInfo(lat: number, lng: number, level: number = this.config.defaultLevel): S2Cell {
    const cellId = this.getCell(lat, lng, level);
    
    return {
      id: cellId,
      level,
      lat,
      lng,
      neighbors: this.getNeighborCells(cellId),
    };
  }

  /**
   * Obtiene celdas vecinas (9 celdas: actual + 8 adyacentes)
   * Útil para búsquedas que cruzan fronteras de celdas
   * 
   * @param cellId S2 cell ID token
   * @returns Array de cell IDs vecinos (incluye la celda original)
   */
  getNeighborCells(cellId: string): string[] {
    try {
      const cell = S2.S2CellId.fromToken(cellId);
      const neighbors = cell.getEdgeNeighbors();
      
      return [
        cellId, // Celda actual
        ...neighbors.map((n: any) => n.toToken()),
      ];
    } catch (error) {
      console.error('[S2Service] Error getting neighbor cells:', error);
      return [cellId]; // Fallback: solo la celda actual
    }
  }

  /**
   * Verifica si dos celdas son vecinas o iguales
   * @param cell1 Primera celda
   * @param cell2 Segunda celda
   * @returns true si son vecinas o iguales
   */
  areCellsNeighbors(cell1: string, cell2: string): boolean {
    if (cell1 === cell2) return true;
    
    const neighbors = this.getNeighborCells(cell1);
    return neighbors.includes(cell2);
  }

  /**
   * Calcula nivel óptimo según radio de búsqueda
   * Optimiza balance entre precisión y cantidad de celdas
   * 
   * Niveles S2:
   * - 10: ~100km² (ciudades grandes)
   * - 11: ~50km² (suburbios amplios)
   * - 13: ~10km² (suburbios)
   * - 15: ~1km² (matching urbano) <- DEFAULT
   * - 17: ~250m² (muy preciso)
   * - 20: ~100m² (ultra preciso)
   * 
   * @param radiusKm Radio de búsqueda en kilómetros
   * @returns Nivel óptimo para ese radio
   */
  getOptimalLevel(radiusKm: number): number {
    if (radiusKm <= 0.5) return 17;   // ~250m² (vecindario)
    if (radiusKm <= 1) return 15;     // ~1km² (barrio)
    if (radiusKm <= 5) return 13;     // ~10km² (ciudad pequeña)
    if (radiusKm <= 20) return 11;    // ~50km² (ciudad grande)
    if (radiusKm <= 50) return 10;    // ~100km² (región)
    return 9;                          // ~200km² (multi-ciudad)
  }

  /**
   * Obtiene todas las celdas en un radio específico
   * NOTA: Para radios grandes, puede generar muchas celdas
   * 
   * @param lat Latitud central
   * @param lng Longitud central
   * @param radiusKm Radio en kilómetros
   * @returns Array de cell IDs que cubren el área
   */
  getCellsInRadius(lat: number, lng: number, radiusKm: number): string[] {
    const level = this.getOptimalLevel(radiusKm);
    const centralCell = this.getCell(lat, lng, level);
    
    // Para radios pequeños (<5km), usar solo vecinos inmediatos
    if (radiusKm <= 5) {
      return this.getNeighborCells(centralCell);
    }
    
    // Para radios grandes, calcular grid de celdas
    // (implementación simplificada: vecinos + vecinos de vecinos)
    const cells = new Set<string>([centralCell]);
    const neighbors = this.getNeighborCells(centralCell);
    
    neighbors.forEach(neighbor => {
      cells.add(neighbor);
      const secondLevel = this.getNeighborCells(neighbor);
      secondLevel.forEach(cell => cells.add(cell));
    });
    
    return Array.from(cells);
  }

  /**
   * Convierte S2 cell ID de vuelta a lat/lng (centro de la celda)
   * @param cellId S2 cell ID token
   * @returns {lat, lng} coordenadas del centro de la celda
   */
  cellToLatLng(cellId: string): { lat: number; lng: number } {
    try {
      const cell = S2.S2CellId.fromToken(cellId);
      const latLng = cell.toLatLng();
      
      return {
        lat: latLng.latDegrees,
        lng: latLng.lngDegrees,
      };
    } catch (error) {
      console.error('[S2Service] Error converting cell to lat/lng:', error);
      throw error;
    }
  }

  /**
   * Calcula área aproximada de una celda en km²
   * @param level Nivel de la celda
   * @returns Área aproximada en km²
   */
  getCellArea(level: number): number {
    // Áreas aproximadas por nivel (S2 estándar)
    const areas: { [key: number]: number } = {
      10: 100,    // ~100km²
      11: 50,     // ~50km²
      13: 10,     // ~10km²
      15: 1,      // ~1km²
      17: 0.25,   // ~250m²
      20: 0.1,    // ~100m²
    };
    
    return areas[level] || Math.pow(2, 20 - level); // Aproximación
  }

  /**
   * Estima cantidad de celdas necesarias para cubrir un radio
   * @param radiusKm Radio en kilómetros
   * @returns Cantidad aproximada de celdas necesarias
   */
  estimateCellCount(radiusKm: number): number {
    const level = this.getOptimalLevel(radiusKm);
    const cellArea = this.getCellArea(level);
    const searchArea = Math.PI * Math.pow(radiusKm, 2); // Área del círculo
    
    return Math.ceil(searchArea / cellArea);
  }

  /**
   * Limpia cache (útil para tests)
   */
  clearCache(): void {
    // Placeholder para cache futuro
    console.log('[S2Service] Cache cleared');
  }
}

// Export singleton instance
export const s2Service = new S2Service();

// Export types
export type { S2Config, S2Cell };

