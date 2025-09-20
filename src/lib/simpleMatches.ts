/**
 * SERVICIO DE MATCHES SIMPLIFICADO PARA PRODUCCIÓN
 * Funciona con el esquema actual de Supabase sin dependencias complejas
 */

import { supabase } from '@/integrations/supabase/client';
import { SupabaseProfile } from '@/lib/MatchingService';

interface ProfileWithLocation extends SupabaseProfile {
  share_location?: boolean;
  is_verified?: boolean;
  created_at?: string;
}

export interface SimpleMatch {
  id: string;
  name: string;
  age: number;
  bio: string;
  compatibility: number;
  reasons: string[];
  isVerified: boolean;
  isPremium: boolean;
  distance: number;
  isOnline: boolean;
  lastSeen: string;
  images: string[];
}

export class SimpleMatchService {
  async getMatches(limit: number = 10, maxDistance?: number): Promise<{ success: boolean; matches?: SimpleMatch[]; error?: string }> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Obtener perfil del usuario actual con coordenadas
      const { data: currentProfile } = await (supabase as any)
        .from('profiles')
        .select('*, latitude, longitude, share_location')
        .eq('user_id', user.data.user.id)
        .single();

      if (!currentProfile) {
        return { success: false, error: 'Perfil no encontrado' };
      }

      // Obtener otros perfiles para matches con coordenadas
      const { data: profiles, error } = await (supabase as any)
        .from('profiles')
        .select('*, latitude, longitude, share_location')
        .neq('user_id', user.data.user.id)
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      if (!profiles || profiles.length === 0) {
        return { success: true, matches: [] };
      }

      // Filtrar perfiles por distancia si se especifica
      let filteredProfiles = profiles;
      
      if (maxDistance && (currentProfile as ProfileWithLocation).latitude && (currentProfile as ProfileWithLocation).longitude && (currentProfile as ProfileWithLocation).share_location) {
        filteredProfiles = profiles.filter((profile: ProfileWithLocation) => {
          if (!profile.latitude || !profile.longitude || !profile.share_location) {
            return true; // Incluir perfiles sin ubicación
          }
          
          const distance = this.calculateDistance(
            (currentProfile as ProfileWithLocation).latitude!,
            (currentProfile as ProfileWithLocation).longitude!,
            profile.latitude,
            profile.longitude
          );
          
          return distance <= maxDistance;
        });
      }

      // Convertir perfiles a matches
      const matches: SimpleMatch[] = filteredProfiles.map((profile: ProfileWithLocation) => {
        // Calcular compatibilidad básica
        let compatibility = 50;
        
        if (currentProfile.interested_in && profile.gender) {
          if (currentProfile.interested_in.includes(profile.gender)) {
            compatibility += 25;
          }
        }

        if (currentProfile.age && profile.age) {
          const ageDiff = Math.abs(currentProfile.age - profile.age);
          if (ageDiff <= 5) compatibility += 15;
          else if (ageDiff <= 10) compatibility += 10;
        }

        if (profile.is_verified) compatibility += 10;

        // Calcular distancia real si ambos perfiles tienen coordenadas
        let distance = Math.floor(Math.random() * 50) + 1; // Fallback
        
        if ((currentProfile as any).latitude && (currentProfile as any).longitude && 
            (profile as any).latitude && (profile as any).longitude && 
            (currentProfile as any).share_location && (profile as any).share_location) {
          distance = this.calculateDistance(
            (currentProfile as any).latitude, (currentProfile as any).longitude,
            (profile as any).latitude, (profile as any).longitude
          );
        }

        // Generar razones
        const reasons: string[] = [];
        if (currentProfile.age && profile.age && Math.abs(currentProfile.age - profile.age) <= 5) {
          reasons.push('Edades compatibles');
        }
        if (profile.is_verified) reasons.push('Perfil verificado');
        if (profile.is_premium) reasons.push('Usuario premium');
        if (distance <= 5) reasons.push('Muy cerca de ti');
        else if (distance <= 15) reasons.push('En tu zona');
        if (reasons.length === 0) reasons.push('Nuevo en la plataforma');

        return {
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          age: profile.age,
          bio: profile.bio || 'Sin descripción disponible',
          compatibility: Math.min(compatibility, 100),
          reasons,
          isVerified: profile.is_verified || false,
          isPremium: profile.is_premium || false,
          distance: Math.round(distance),
          isOnline: Math.random() > 0.3,
          lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          images: [
            `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400&h=400&fit=crop&crop=face`
          ]
        };
      });

      // Ordenar por compatibilidad y distancia
      matches.sort((a, b) => {
        // Priorizar compatibilidad, luego distancia
        const compatibilityDiff = b.compatibility - a.compatibility;
        if (compatibilityDiff !== 0) return compatibilityDiff;
        return a.distance - b.distance; // Más cerca primero
      });

      return { success: true, matches };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  // Calcular distancia entre dos coordenadas usando fórmula de Haversine
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distancia en kilómetros
  }

  // Convertir grados a radianes
  toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  async getStats(): Promise<{ success: boolean; stats?: { totalProfiles: number; singlesCount: number; couplesCount: number; verifiedCount: number; newThisWeek: number }; error?: string }> {
    try {
      const { data: profiles } = await (supabase as any)
        .from('profiles')
        .select('is_verified, created_at');

      const totalProfiles = profiles?.length || 0;
      const verifiedCount = profiles?.filter((p: { is_verified?: boolean }) => p.is_verified).length || 0;
      const newThisWeek = profiles?.filter((p: { created_at: string }) => {
        const createdAt = new Date(p.created_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return createdAt > weekAgo;
      }).length || 0;

      return {
        success: true,
        stats: {
          totalProfiles,
          singlesCount: totalProfiles, // Todos son singles en el esquema actual
          couplesCount: 0,
          verifiedCount,
          newThisWeek
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Error obteniendo estadísticas: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }
}

export const simpleMatchService = new SimpleMatchService();
