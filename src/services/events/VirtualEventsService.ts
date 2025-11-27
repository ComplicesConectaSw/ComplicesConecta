/**
 * VirtualEventsService - Eventos Virtuales Sostenibles con CMPX Rewards
 * 
 * Extiende couple_events
 * Tracking CO2 ahorrado (via virtual)
 * 50 CMPX reward por participar
 * VIP access solo con GTK o Premium
 * 
 * @version 3.5.0
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { tokenService } from '@/services/TokenService';
import { sustainabilityService } from './SustainabilityService';

export interface VirtualEvent {
  id: string;
  coupleId: string;
  title: string;
  description: string;
  eventType: 'virtual' | 'hybrid';
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  isVIP: boolean;
  cmpxReward: number; // 50 CMPX por defecto
  co2Saved: number; // kg CO2 ahorrado
  createdAt: Date;
  updatedAt: Date;
}

export interface EventParticipation {
  id: string;
  eventId: string;
  userId: string;
  participatedAt: Date;
  cmpxRewarded: number;
  co2Saved: number;
}

class VirtualEventsService {
  private static instance: VirtualEventsService;

  static getInstance(): VirtualEventsService {
    if (!VirtualEventsService.instance) {
      VirtualEventsService.instance = new VirtualEventsService();
    }
    return VirtualEventsService.instance;
  }

  /**
   * Crea evento virtual sostenible
   */
  async createVirtualEvent(
    coupleId: string,
    data: {
      title: string;
      description: string;
      startDate: Date;
      endDate: Date;
      maxParticipants?: number;
      isVIP?: boolean;
    }
  ): Promise<VirtualEvent | null> {
    try {
      logger.info('🌱 Creando evento virtual sostenible', { coupleId });

      if (!supabase) {
        throw new Error('Supabase no está disponible');
      }

      // Calcular CO2 ahorrado (estimado: 0.5 kg CO2 por participante por evento virtual)
      const _estimatedCO2 = (data.maxParticipants || 50) * 0.5;

      const { data: event, error } = await supabase
        .from('couple_events')
        .insert({
          couple_id: coupleId,
          title: data.title,
          description: data.description,
          event_type: 'virtual',
          date: data.startDate.toISOString(),
          max_participants: data.maxParticipants || 50,
          is_public: !data.isVIP,
          location: 'virtual',
          // Usar metadata JSONB para campos adicionales (is_vip, cmpx_reward, co2_saved)
          // Estos campos se agregarán con la migración SQL
        } as any)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('✅ Evento virtual creado', { eventId: event.id });

      return this.mapToVirtualEvent(event as any);
    } catch (error) {
      logger.error('Error creando evento virtual', {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Participa en evento virtual y recibe 50 CMPX
   */
  async participateInEvent(
    eventId: string,
    userId: string
  ): Promise<EventParticipation | null> {
    try {
      logger.info('🎉 Participando en evento virtual', {
        eventId,
        userId: userId.substring(0, 8) + '***'
      });

      if (!supabase) {
        throw new Error('Supabase no está disponible');
      }

      // 1. Verificar que el evento existe y es virtual
      const { data: event, error: eventError } = await supabase
        .from('couple_events')
        .select('*')
        .eq('id', eventId)
        .eq('event_type', 'virtual')
        .single();

      if (eventError || !event) {
        throw new Error('Evento no encontrado o no es virtual');
      }

      // 2. Verificar si ya participó
      const { data: existingParticipation } = await supabase
        .from('event_participations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (existingParticipation) {
        throw new Error('Ya participaste en este evento');
      }

      // 3. Verificar acceso VIP si es necesario (usar metadata después de migración)
      const eventMetadata = (event as any).metadata || {};
      if (eventMetadata.is_vip) {
        const hasVIPAccess = await this.hasVIPAccess(userId);
        if (!hasVIPAccess) {
          throw new Error('Este evento requiere acceso VIP (GTK o Premium)');
        }
      }

      // 4. Registrar participación
      const co2Saved = await sustainabilityService.calculateCO2Saved('virtual_event');
      const cmpxReward = eventMetadata.cmpx_reward || 50;

      const { data: participation, error: participationError } = await supabase
        .from('event_participations')
        .insert({
          event_id: eventId,
          user_id: userId,
          participated_at: new Date().toISOString(),
          cmpx_rewarded: cmpxReward,
          co2_saved: co2Saved
        })
        .select()
        .single();

      if (participationError) {
        throw participationError;
      }

      // 5. Recompensar 50 CMPX
      await tokenService.addTokens(userId, 'cmpx', cmpxReward, 'reward', 'Participación en evento virtual');

      // 6. Actualizar contador de participantes (usar metadata después de migración)
      const currentParticipants = eventMetadata.current_participants || 0;
      await supabase
        .from('couple_events')
        .update({
          // Actualizar metadata con contador (temporal hasta migración)
          description: `${event.description} [Participantes: ${currentParticipants + 1}]`
        } as any)
        .eq('id', eventId);

      logger.info('✅ Participación registrada y CMPX recompensado', {
        eventId,
        cmpxReward
      });

      const participationData = participation as any;
      return {
        id: participationData.id,
        eventId: participationData.event_id,
        userId: participationData.user_id,
        participatedAt: new Date(participationData.participated_at),
        cmpxRewarded: participationData.cmpx_rewarded,
        co2Saved: participationData.co2_saved
      };
    } catch (error) {
      logger.error('Error participando en evento', {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Verifica acceso VIP (GTK o Premium)
   */
  private async hasVIPAccess(userId: string): Promise<boolean> {
    // Verificar si tiene GTK en staking
    const balance = await tokenService.getBalance(userId);
    if (balance && balance.gtk >= 100) {
      return true;
    }

    // Verificar si tiene Premium
    if (!supabase) {
      return false;
    }

      // Verificar Premium (usar tabla correcta si existe)
      // Por ahora, retornar false si no hay GTK
      return false;
  }

  /**
   * Obtiene eventos virtuales disponibles
   */
  async getVirtualEvents(limit: number = 20): Promise<VirtualEvent[]> {
    try {
      if (!supabase) {
        return [];
      }

      const { data: events, error } = await supabase
        .from('couple_events')
        .select('*')
        .eq('event_type', 'virtual')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error || !events) {
        return [];
      }

      return events.map(e => this.mapToVirtualEvent(e as any));
    } catch (error) {
      logger.error('Error obteniendo eventos virtuales', { error });
      return [];
    }
  }

  /**
   * Mapea evento de BD a VirtualEvent
   */
  private mapToVirtualEvent(event: {
    id: string;
    couple_id: string | null;
    title: string;
    description: string;
    event_type: string;
    date: string;
    max_participants: number | null;
    created_at: string | null;
    updated_at: string | null;
    [key: string]: unknown;
  }): VirtualEvent {
    const metadata = (event.metadata as Record<string, unknown>) || {};
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // +2 horas por defecto

    return {
      id: event.id,
      coupleId: event.couple_id || '',
      title: event.title,
      description: event.description,
      eventType: event.event_type as 'virtual' | 'hybrid',
      startDate,
      endDate,
      maxParticipants: event.max_participants || 50,
      currentParticipants: (metadata.current_participants as number) || 0,
      isVIP: (metadata.is_vip as boolean) || false,
      cmpxReward: (metadata.cmpx_reward as number) || 50,
      co2Saved: (metadata.co2_saved as number) || 0,
      createdAt: new Date(event.created_at || new Date().toISOString()),
      updatedAt: new Date(event.updated_at || new Date().toISOString())
    };
  }
}

export const virtualEventsService = VirtualEventsService.getInstance();
export default virtualEventsService;

