/**
 * AdvancedCoupleService - Servicio avanzado para funcionalidades de parejas
 * Implementa matching de parejas, gestión de perfiles conjuntos y funcionalidades específicas
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface CoupleProfile {
  id: string;
  partner1_id: string;
  partner2_id: string;
  couple_name: string;
  bio: string;
  interests: string[];
  location: string;
  latitude?: number;
  longitude?: number;
  age_range_min: number;
  age_range_max: number;
  looking_for: string[];
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  relationship_type: 'married' | 'dating' | 'engaged' | 'open_relationship';
  relationship_duration: number; // meses
  is_active: boolean;
  is_verified: boolean;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  // Campos adicionales para funcionalidades avanzadas
  photos: string[];
  videos: string[];
  preferences: CouplePreferences;
  statistics: CoupleStatistics;
  compatibility_factors: CompatibilityFactors;
}

export interface CouplePreferences {
  gender_preferences: string[];
  age_preferences: {
    min: number;
    max: number;
  };
  location_preferences: {
    max_distance: number;
    cities: string[];
  };
  activity_preferences: string[];
  communication_preferences: string[];
  meeting_preferences: string[];
  privacy_level: 'public' | 'private' | 'discrete';
}

export interface CoupleStatistics {
  total_views: number;
  total_likes: number;
  total_matches: number;
  total_messages: number;
  response_rate: number;
  profile_completeness: number;
  last_active: string;
  join_date: string;
  verification_level: number;
}

export interface CompatibilityFactors {
  shared_interests: string[];
  compatibility_score: number;
  personality_match: number;
  lifestyle_match: number;
  location_compatibility: number;
  experience_compatibility: number;
}

export interface CoupleMatch {
  id: string;
  couple1_id: string;
  couple2_id: string;
  match_score: number;
  compatibility_factors: CompatibilityFactors;
  match_reasons: string[];
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface CoupleInteraction {
  id: string;
  couple_id: string;
  target_couple_id: string;
  interaction_type: 'view' | 'like' | 'message' | 'wink' | 'gift';
  created_at: string;
  metadata?: Record<string, any>;
}

export interface CoupleEvent {
  id: string;
  couple_id: string;
  title: string;
  description: string;
  event_type: 'meetup' | 'party' | 'dinner' | 'travel' | 'other';
  location: string;
  date: string;
  max_participants: number;
  participants: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export class AdvancedCoupleService {
  private static instance: AdvancedCoupleService;

  private constructor() {}

  public static getInstance(): AdvancedCoupleService {
    if (!AdvancedCoupleService.instance) {
      AdvancedCoupleService.instance = new AdvancedCoupleService();
    }
    return AdvancedCoupleService.instance;
  }

  /**
   * Crear perfil de pareja
   */
  async createCoupleProfile(data: {
    partner1_id: string;
    partner2_id: string;
    couple_name: string;
    bio: string;
    interests: string[];
    location: string;
    latitude?: number;
    longitude?: number;
    age_range_min: number;
    age_range_max: number;
    looking_for: string[];
    experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    relationship_type: 'married' | 'dating' | 'engaged' | 'open_relationship';
    relationship_duration: number;
  }): Promise<CoupleProfile> {
    try {
      const coupleProfileData = {
        partner1_id: data.partner1_id,
        partner2_id: data.partner2_id,
        couple_name: data.couple_name,
        couple_bio: data.bio,
        couple_interests: data.interests,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        age_range_min: data.age_range_min,
        age_range_max: data.age_range_max,
        looking_for: data.looking_for.join(','),
        experience_level: data.experience_level,
        relationship_type: data.relationship_type,
        relationship_duration: data.relationship_duration,
        preferences: JSON.stringify({
          gender_preferences: [],
          age_preferences: { min: 18, max: 65 },
          location_preferences: { max_distance: 50, cities: [] },
          activity_preferences: [],
          communication_preferences: [],
          meeting_preferences: [],
          privacy_level: 'public'
        }),
        statistics: JSON.stringify({
          total_views: 0,
          total_likes: 0,
          total_matches: 0,
          total_messages: 0,
          response_rate: 0,
          profile_completeness: 0,
          last_active: new Date().toISOString(),
          join_date: new Date().toISOString(),
          verification_level: 0
        }),
        compatibility_factors: JSON.stringify({
          shared_interests: [],
          compatibility_score: 0,
          personality_match: 0,
          lifestyle_match: 0,
          location_compatibility: 0,
          experience_compatibility: 0
        })
      };

      const { data: result, error } = await (supabase as any)
        .from('couple_profiles')
        .insert(coupleProfileData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating couple profile:', { error: error.message });
        throw error;
      }

      // Convertir resultado a formato CoupleProfile
      const coupleProfile: CoupleProfile = {
        id: result.id,
        partner1_id: result.partner1_id,
        partner2_id: result.partner2_id,
        couple_name: result.couple_name,
        bio: result.couple_bio || '',
        interests: result.couple_interests || [],
        location: result.location || '',
        latitude: result.latitude,
        longitude: result.longitude,
        age_range_min: result.age_range_min,
        age_range_max: result.age_range_max,
        looking_for: result.looking_for ? result.looking_for.split(',') : [],
        experience_level: result.experience_level as any,
        relationship_type: result.relationship_type as any,
        relationship_duration: result.relationship_duration,
        is_active: result.is_active,
        is_verified: result.is_verified,
        is_premium: result.is_premium,
        photos: result.couple_images || [],
        videos: [],
        preferences: JSON.parse(result.preferences || '{}'),
        statistics: JSON.parse(result.statistics || '{}'),
        compatibility_factors: JSON.parse(result.compatibility_factors || '{}'),
        created_at: result.created_at,
        updated_at: result.updated_at
      };

      logger.info('Couple profile created', { coupleId: coupleProfile.id });
      return coupleProfile;
    } catch (error) {
      logger.error('Error in createCoupleProfile:', { error: String(error) });
      throw error;
    }
  }

  /**
   * Obtener perfil de pareja por ID
   */
  async getCoupleProfile(coupleId: string): Promise<CoupleProfile | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('couple_profiles')
        .select('*')
        .eq('id', coupleId)
        .single();

      if (error) {
        logger.error('Error getting couple profile:', { error: error.message });
        return null;
      }

      if (!data) return null;

      // Convertir resultado a formato CoupleProfile
      const coupleProfile: CoupleProfile = {
        id: data.id,
        partner1_id: data.partner1_id,
        partner2_id: data.partner2_id,
        couple_name: data.couple_name,
        bio: data.couple_bio || '',
        interests: data.couple_interests || [],
        location: data.location || '',
        latitude: data.latitude,
        longitude: data.longitude,
        age_range_min: data.age_range_min,
        age_range_max: data.age_range_max,
        looking_for: data.looking_for ? data.looking_for.split(',') : [],
        experience_level: data.experience_level as any,
        relationship_type: data.relationship_type as any,
        relationship_duration: data.relationship_duration,
        is_active: data.is_active,
        is_verified: data.is_verified,
        is_premium: data.is_premium,
        photos: data.couple_images || [],
        videos: [],
        preferences: JSON.parse(data.preferences || '{}'),
        statistics: JSON.parse(data.statistics || '{}'),
        compatibility_factors: JSON.parse(data.compatibility_factors || '{}'),
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return coupleProfile;
    } catch (error) {
      logger.error('Error in getCoupleProfile:', { error: String(error) });
      return null;
    }
  }

  /**
   * Obtener perfiles de parejas cercanas
   */
  async getNearbyCouples(
    latitude: number,
    longitude: number,
    maxDistance: number = 50,
    limit: number = 20
  ): Promise<CoupleProfile[]> {
    try {
      const { data, error } = await (supabase as any)
        .rpc('find_couples_by_proximity', {
          lat: latitude,
          lng: longitude,
          max_distance: maxDistance,
          limit_count: limit
        });

      if (error) {
        logger.error('Error getting nearby couples:', { error: error.message });
        return [];
      }

      if (!data) return [];

      // Convertir resultados a formato CoupleProfile
      return data.map((item: any) => ({
        id: item.id,
        partner1_id: item.partner1_id || '',
        partner2_id: item.partner2_id || '',
        couple_name: item.couple_name,
        bio: item.couple_bio || '',
        interests: item.couple_interests || [],
        location: item.location || '',
        latitude: item.latitude,
        longitude: item.longitude,
        age_range_min: item.age_range_min || 18,
        age_range_max: item.age_range_max || 65,
        looking_for: item.looking_for ? item.looking_for.split(',') : [],
        experience_level: item.experience_level || 'beginner',
        relationship_type: item.relationship_type || 'dating',
        relationship_duration: item.relationship_duration || 0,
        is_active: item.is_active || true,
        is_verified: item.is_verified || false,
        is_premium: item.is_premium || false,
        photos: item.couple_images || [],
        videos: [],
        preferences: JSON.parse(item.preferences || '{}'),
        statistics: JSON.parse(item.statistics || '{}'),
        compatibility_factors: JSON.parse(item.compatibility_factors || '{}'),
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString()
      }));
    } catch (error) {
      logger.error('Error in getNearbyCouples:', { error: String(error) });
      return [];
    }
  }

  /**
   * Obtener parejas compatibles
   */
  async getCompatibleCouples(
    coupleId: string,
    limit: number = 20
  ): Promise<CoupleProfile[]> {
    try {
      const { data, error } = await (supabase as any)
        .rpc('find_couples_by_compatibility', {
          couple_id: coupleId,
          limit_count: limit
        });

      if (error) {
        logger.error('Error getting compatible couples:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getCompatibleCouples:', { error: String(error) });
      return [];
    }
  }

  /**
   * Crear match entre parejas
   */
  async createCoupleMatch(
    couple1Id: string,
    couple2Id: string,
    matchScore: number,
    compatibilityFactors: CompatibilityFactors,
    matchReasons: string[]
  ): Promise<CoupleMatch> {
    try {
      const coupleMatch: Omit<CoupleMatch, 'id' | 'created_at'> = {
        couple1_id: couple1Id,
        couple2_id: couple2Id,
        match_score: matchScore,
        compatibility_factors: compatibilityFactors,
        match_reasons: matchReasons,
        status: 'pending'
      };

      const { data, error } = await (supabase as any)
        .from('couple_matches')
        .insert(coupleMatch)
        .select()
        .single();

      if (error) {
        logger.error('Error creating couple match:', { error: error.message });
        throw error;
      }

      logger.info('Couple match created', { matchId: data.id });
      return data;
    } catch (error) {
      logger.error('Error in createCoupleMatch:', { error: String(error) });
      throw error;
    }
  }

  /**
   * Registrar interacción entre parejas
   */
  async recordCoupleInteraction(
    coupleId: string,
    targetCoupleId: string,
    interactionType: 'view' | 'like' | 'message' | 'wink' | 'gift',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const interaction: Omit<CoupleInteraction, 'id' | 'created_at'> = {
        couple_id: coupleId,
        target_couple_id: targetCoupleId,
        interaction_type: interactionType,
        metadata
      };

      const { error } = await (supabase as any)
        .from('couple_interactions')
        .insert(interaction);

      if (error) {
        logger.error('Error recording couple interaction:', { error: error.message });
        throw error;
      }

      logger.info('Couple interaction recorded', { 
        coupleId, 
        targetCoupleId, 
        interactionType 
      });
    } catch (error) {
      logger.error('Error in recordCoupleInteraction:', { error: String(error) });
      throw error;
    }
  }

  /**
   * Crear evento para parejas
   */
  async createCoupleEvent(data: {
    couple_id: string;
    title: string;
    description: string;
    event_type: 'meetup' | 'party' | 'dinner' | 'travel' | 'other';
    location: string;
    date: string;
    max_participants: number;
    is_public: boolean;
  }): Promise<CoupleEvent> {
    try {
      const coupleEvent = {
        ...data,
        participants: [] as string[]
      };

      const { data: result, error } = await (supabase as any)
        .from('couple_events')
        .insert(coupleEvent)
        .select()
        .single();

      if (error) {
        logger.error('Error creating couple event:', { error: error.message });
        throw error;
      }

      logger.info('Couple event created', { eventId: result.id });
      return result;
    } catch (error) {
      logger.error('Error in createCoupleEvent:', { error: String(error) });
      throw error;
    }
  }

  /**
   * Obtener eventos de parejas
   */
  async getCoupleEvents(
    location?: string,
    eventType?: string,
    limit: number = 20
  ): Promise<CoupleEvent[]> {
    try {
      let query = (supabase as any)
        .from('couple_events')
        .select('*')
        .eq('is_public', true)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(limit);

      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error getting couple events:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getCoupleEvents:', { error: String(error) });
      return [];
    }
  }

  /**
   * Unirse a un evento
   */
  async joinCoupleEvent(eventId: string, coupleId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('couple_events')
        .update({
          participants: (supabase as any).raw(`array_append(participants, '${coupleId}')`)
        })
        .eq('id', eventId);

      if (error) {
        logger.error('Error joining couple event:', { error: error.message });
        return false;
      }

      logger.info('Couple joined event', { eventId, coupleId });
      return true;
    } catch (error) {
      logger.error('Error in joinCoupleEvent:', { error: String(error) });
      return false;
    }
  }

  /**
   * Calcular compatibilidad entre parejas
   */
  async calculateCoupleCompatibility(
    couple1Id: string,
    couple2Id: string
  ): Promise<CompatibilityFactors> {
    try {
      const [couple1, couple2] = await Promise.all([
        this.getCoupleProfile(couple1Id),
        this.getCoupleProfile(couple2Id)
      ]);

      if (!couple1 || !couple2) {
        throw new Error('One or both couple profiles not found');
      }

      // Calcular intereses compartidos
      const sharedInterests = couple1.interests.filter(interest =>
        couple2.interests.includes(interest)
      );

      // Calcular compatibilidad de personalidad (simulado)
      const personalityMatch = Math.random() * 0.4 + 0.6; // 60-100%

      // Calcular compatibilidad de estilo de vida
      const lifestyleMatch = Math.random() * 0.3 + 0.7; // 70-100%

      // Calcular compatibilidad de ubicación
      const locationCompatibility = this.calculateLocationCompatibility(
        couple1.latitude, couple1.longitude,
        couple2.latitude, couple2.longitude
      );

      // Calcular compatibilidad de experiencia
      const experienceCompatibility = this.calculateExperienceCompatibility(
        couple1.experience_level,
        couple2.experience_level
      );

      // Calcular score general de compatibilidad
      const compatibilityScore = (
        personalityMatch * 0.3 +
        lifestyleMatch * 0.25 +
        locationCompatibility * 0.2 +
        experienceCompatibility * 0.15 +
        (sharedInterests.length / Math.max(couple1.interests.length, couple2.interests.length)) * 0.1
      );

      return {
        shared_interests: sharedInterests,
        compatibility_score: compatibilityScore,
        personality_match: personalityMatch,
        lifestyle_match: lifestyleMatch,
        location_compatibility: locationCompatibility,
        experience_compatibility: experienceCompatibility
      };
    } catch (error) {
      logger.error('Error calculating couple compatibility:', { error: String(error) });
      throw error;
    }
  }

  /**
   * Métodos auxiliares
   */
  private calculateLocationCompatibility(
    lat1?: number, lng1?: number,
    lat2?: number, lng2?: number
  ): number {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 0.5;

    const distance = this.calculateDistance(lat1, lng1, lat2, lng2);
    const maxDistance = 100; // km
    
    return Math.max(0, 1 - (distance / maxDistance));
  }

  private calculateExperienceCompatibility(
    level1: string, level2: string
  ): number {
    const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const index1 = levels.indexOf(level1);
    const index2 = levels.indexOf(level2);
    
    if (index1 === -1 || index2 === -1) return 0.5;
    
    const diff = Math.abs(index1 - index2);
    return Math.max(0, 1 - (diff / levels.length));
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const advancedCoupleService = AdvancedCoupleService.getInstance();
