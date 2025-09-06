import { supabase } from '../integrations/supabase/client';

export interface ConnectionRequest {
  id: string;
  from_profile: string;
  to_profile: string;
  status: 'pending' | 'accepted' | 'declined' | 'revoked' | null;
  created_at: string | null;
  decided_at?: string | null;
  message?: string | null;
  type: 'profile' | 'gallery' | 'chat' | null;
  sender_profile?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    age: number | null;
    bio?: string | null;
    avatar_url?: string | null;
  };
  receiver_profile?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    age: number | null;
    bio?: string | null;
    avatar_url?: string | null;
  };
}

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

/**
 * Servicio para manejar solicitudes de conexión
 */
export const RequestsService = {
  /**
   * Envía una solicitud de conexión
   */
  async sendRequest(data: SendRequestData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Verificar que no existe una solicitud previa
      const { data: existingRequest } = await supabase
        .from('invitations')
        .select('id')
        .eq('from_profile', user.user.id)
        .eq('to_profile', data.receiver_id)
        .single();

      if (existingRequest) {
        return { success: false, error: 'Ya has enviado una solicitud a este usuario' };
      }

      // Crear nueva solicitud
      const { error } = await supabase
        .from('invitations')
        .insert({
          from_profile: user.user.id,
          to_profile: data.receiver_id,
          message: data.message,
          type: 'profile',
          status: 'pending'
        });

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
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ 
          status: response,
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
  async getReceivedRequests(): Promise<{ data: ConnectionRequest[]; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
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
            bio
          )
        `)
        .eq('to_profile', user.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [] };
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
  async getSentRequests(): Promise<{ data: ConnectionRequest[]; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
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
            bio
          )
        `)
        .eq('from_profile', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [] };
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
  async getRequestsStats(): Promise<{ data: RequestsStats; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { 
          data: { pending_sent: 0, pending_received: 0, accepted: 0, declined: 0 },
          error: 'Usuario no autenticado' 
        };
      }

      // Solicitudes enviadas pendientes
      const { count: pendingSent } = await supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .eq('from_profile', user.user.id)
        .eq('status', 'pending');

      // Solicitudes recibidas pendientes
      const { count: pendingReceived } = await supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .eq('to_profile', user.user.id)
        .eq('status', 'pending');

      // Solicitudes aceptadas
      const { count: accepted } = await supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .or(`from_profile.eq.${user.user.id},to_profile.eq.${user.user.id}`)
        .eq('status', 'accepted');

      // Solicitudes rechazadas
      const { count: declined } = await supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .or(`from_profile.eq.${user.user.id},to_profile.eq.${user.user.id}`)
        .eq('status', 'declined');

      return {
        data: {
          pending_sent: pendingSent || 0,
          pending_received: pendingReceived || 0,
          accepted: accepted || 0,
          declined: declined || 0
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
  async checkConnection(userId: string): Promise<{ 
    connected: boolean; 
    requestStatus?: 'pending' | 'accepted' | 'declined' | 'revoked' | null;
    requestId?: string;
    error?: string;
  }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { connected: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('invitations')
        .select('id, status')
        .or(`and(from_profile.eq.${user.user.id},to_profile.eq.${userId}),and(from_profile.eq.${userId},to_profile.eq.${user.user.id})`)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        return { connected: false, error: error.message };
      }

      if (!data) {
        return { connected: false };
      }

      return {
        connected: data.status === 'accepted',
        requestStatus: data.status,
        requestId: data.id
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
  async deleteRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
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
