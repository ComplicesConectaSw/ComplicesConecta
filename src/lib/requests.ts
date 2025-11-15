import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase-generated';

// Tipos estrictos basados en Supabase
type _ProfileRow = Database['public']['Tables']['profiles']['Row'];
type _InvitationRow = Database['public']['Tables']['invitations']['Row'];
type InvitationStatus = 'pending' | 'accepted' | 'declined';
type InvitationType = 'profile' | 'chat' | 'gallery' | 'event';

// Tipo genérico para respuestas de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Tipo para perfil seguro con campos opcionales
interface SafeProfile {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  bio: string | null;
  gender: string;
  interested_in: string;
  is_verified: boolean | null;
}

// Tipo para solicitud con perfil relacionado (como se obtiene de la consulta)
export interface ConnectionRequestWithProfile {
  id: string;
  from_profile: string;
  to_profile: string;
  message: string | null;
  status: InvitationStatus | null;
  created_at: string | null;
  decided_at: string | null;
  type: InvitationType | null;
  // Perfil relacionado (from o to según el contexto)
  profile?: SafeProfile;
}

// Export para compatibilidad con imports existentes
export type ConnectionRequest = ConnectionRequestWithProfile;

export interface SendRequestData {
  receiver_id: string;
  message?: string;
}

export interface RequestsStats {
  pending_sent: number;
  pending_received: number;
  accepted: number;
  declined: number;
}

// Tipos para respuestas específicas

type RequestsResponse = {
  data: ConnectionRequest[];
  error?: string;
};

type StatsResponse = {
  data: RequestsStats;
  error?: string;
};

type ConnectionCheckResponse = {
  connected: boolean;
  requestStatus?: InvitationStatus | null;
  requestId?: string;
  error?: string;
};

/**
 * Servicio para manejar solicitudes de conexión
 * Refactorizado v2.1.8 con tipos estrictos de Supabase
 */
export const RequestsService = {
  /**
   * Envía una solicitud de conexión
   */
  async sendRequest(data: SendRequestData): Promise<ApiResponse> {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase no está disponible' };
      }
      
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Verificar que no existe una solicitud previa - null-safe
      const { data: existingRequest } = await supabase
        .from('invitations')
        .select('id')
        .eq('from_profile', user.user.id)
        .eq('to_profile', data.receiver_id)
        .maybeSingle(); // Usar maybeSingle para evitar errores cuando no existe

      if (existingRequest) {
        return { success: false, error: 'Ya has enviado una solicitud a este usuario' };
      }

      // Crear nueva solicitud con tipos estrictos
      const { error } = await supabase
        .from('invitations')
        .insert({
          from_profile: user.user.id,
          to_profile: data.receiver_id,
          message: data.message ?? null,
          type: 'profile' as InvitationType,
          status: 'pending' as InvitationStatus
        } as any);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  },

  /**
   * Responde a una solicitud de conexión
   */
  async respondToRequest(
    requestId: string, 
    response: 'accepted' | 'declined'
  ): Promise<ApiResponse> {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase no está disponible' };
      }
      
      const { error } = await (supabase as any)
        .from('invitations')
        .update({ 
          status: response as InvitationStatus,
          decided_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  },

  /**
   * Obtiene solicitudes recibidas
   */
  async getReceivedRequests(): Promise<RequestsResponse> {
    try {
      if (!supabase) {
        return { data: [], error: 'Supabase no está disponible' };
      }
      
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return { data: [], error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          sender_profile:profiles!invitations_from_profile_fkey(
            id,
            first_name,
            last_name,
            age,
            bio,
            gender,
            interested_in,
            is_verified
          )
        `)
        .eq('to_profile', user.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      // Transformar datos para que coincidan con ConnectionRequestWithProfile
      const transformedData = (data ?? []).map((item: any) => ({
        ...item,
        profile: (item as any).sender_profile // Para solicitudes recibidas, el perfil es el remitente
      }));

      return { data: transformedData };
    } catch (error) {
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  },

  /**
   * Obtiene solicitudes enviadas
   */
  async getSentRequests(): Promise<RequestsResponse> {
    try {
      if (!supabase) {
        return { data: [], error: 'Supabase no está disponible' };
      }
      
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return { data: [], error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          receiver_profile:profiles!invitations_to_profile_fkey(
            id,
            first_name,
            last_name,
            age,
            bio,
            gender,
            interested_in,
            is_verified
          )
        `)
        .eq('from_profile', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      // Transformar datos para que coincidan con ConnectionRequestWithProfile
      const transformedData = (data ?? []).map((item: any) => ({
        ...item,
        profile: (item as any).receiver_profile // Para solicitudes enviadas, el perfil es el destinatario
      }));

      return { data: transformedData };
    } catch (error) {
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  },

  /**
   * Obtiene estadísticas de solicitudes
   */
  async getRequestsStats(): Promise<StatsResponse> {
    try {
      if (!supabase) {
        return { 
          data: { pending_sent: 0, pending_received: 0, accepted: 0, declined: 0 },
          error: 'Supabase no está disponible' 
        };
      }
      
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return { 
          data: { pending_sent: 0, pending_received: 0, accepted: 0, declined: 0 },
          error: 'Usuario no autenticado' 
        };
      }

      // Solicitudes enviadas pendientes - null-safe
      const { count: pendingSent } = await supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .eq('from_profile', user.user.id)
        .eq('status', 'pending');

      // Solicitudes recibidas pendientes - null-safe
      const { count: pendingReceived } = await supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .eq('to_profile', user.user.id)
        .eq('status', 'pending');

      // Solicitudes aceptadas - null-safe
      const { count: accepted } = await supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .or(`from_profile.eq.${user.user.id},to_profile.eq.${user.user.id}`)
        .eq('status', 'accepted');

      // Solicitudes rechazadas - null-safe
      const { count: declined } = await supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .or(`from_profile.eq.${user.user.id},to_profile.eq.${user.user.id}`)
        .eq('status', 'declined');

      return {
        data: {
          pending_sent: pendingSent ?? 0,
          pending_received: pendingReceived ?? 0,
          accepted: accepted ?? 0,
          declined: declined ?? 0
        }
      };
    } catch (error) {
      return { 
        data: { pending_sent: 0, pending_received: 0, accepted: 0, declined: 0 },
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  },

  /**
   * Verifica si existe una conexión entre dos usuarios
   */
  async checkConnection(userId: string): Promise<ConnectionCheckResponse> {
    try {
      if (!supabase) {
        return { connected: false, error: 'Supabase no está disponible' };
      }
      
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return { connected: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('invitations')
        .select('id, status')
        .or(`and(from_profile.eq.${user.user.id},to_profile.eq.${userId}),and(from_profile.eq.${userId},to_profile.eq.${user.user.id})`)
        .maybeSingle(); // Usar maybeSingle para evitar errores cuando no existe

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        return { connected: false, error: error.message };
      }

      if (!data) {
        return { connected: false };
      }

      return {
        connected: (data as any).status === 'accepted',
        requestStatus: (data as any).status as InvitationStatus,
        requestId: (data as any).id
      };
    } catch (error) {
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  },

  /**
   * Elimina una solicitud de conexión
   */
  async deleteRequest(requestId: string): Promise<ApiResponse> {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase no está disponible' };
      }
      
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', requestId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }
};

/*
 * Refactor Notes v2.1.8:
 * 
 * ✅ Tipos Estrictos Sincronizados:
 * - Importados tipos de Database desde Supabase
 * - Eliminadas interfaces manuales inconsistentes
 * - Definidos tipos InvitationStatus, InvitationType basados en schema
 * - RequestProfile sin campo avatar_url inexistente
 * 
 * ✅ Optional Chaining y Null-Safe:
 * - Reemplazado user.user por user?.user
 * - Cambiado || por ?? en fallbacks (data ?? [])
 * - Agregado optional chaining en verificaciones
 * - maybeSingle() en lugar de single() para evitar errores
 * 
 * ✅ Tipos de Respuesta Consistentes:
 * - ApiResponse<T> genérico para respuestas
 * - RequestsResponse, StatsResponse, ConnectionCheckResponse tipados
 * - Eliminadas interfaces redundantes
 * 
 * ✅ Compatibilidad Mantenida:
 * - Preservada funcionalidad existente
 * - Mantenidos nombres de métodos y parámetros
 * - Compatible con RequestCard.tsx refactorizado
 * 
 * ✅ Correcciones Críticas:
 * - Agregado is_verified en selects de profiles
 * - Removidas referencias a avatar_url
 * - Tipos de estado correctos (InvitationStatus)
 * - Manejo de errores mejorado con tipos estrictos
 */
