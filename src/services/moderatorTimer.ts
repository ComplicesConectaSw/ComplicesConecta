// Servicio de Timer de Conexión para Moderadores
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface ModeratorSession {
  id: string;
  moderator_id: string;
  session_start: string;
  session_end?: string;
  is_active: boolean;
  total_minutes: number;
  reports_reviewed: number;
  actions_taken: number;
}

/**
 * Iniciar sesión de moderador
 */
export const startModeratorSession = async (moderatorId: string): Promise<ModeratorSession> => {
  try {
    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }

    const { data, error } = await supabase
      .from('moderator_sessions')
      .insert({
        moderator_id: moderatorId,
        session_start: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    logger.info('Sesión de moderador iniciada', { sessionId: data.id });
    return data;
  } catch (error) {
    logger.error('Error iniciando sesión de moderador:', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/**
 * Finalizar sesión de moderador
 */
export const endModeratorSession = async (sessionId: string): Promise<void> => {
  try {
    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }

    const { error } = await supabase
      .from('moderator_sessions')
      .update({
        session_end: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', sessionId);

    if (error) throw error;

    logger.info('Sesión de moderador finalizada', { sessionId });
  } catch (error) {
    logger.error('Error finalizando sesión de moderador:', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/**
 * Obtener sesión activa del moderador
 */
export const getActiveSession = async (moderatorId: string): Promise<ModeratorSession | null> => {
  try {
    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }

    const { data, error } = await supabase
      .from('moderator_sessions')
      .select('*')
      .eq('moderator_id', moderatorId)
      .eq('is_active', true)
      .order('session_start', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    return data || null;
  } catch (error) {
    logger.error('Error obteniendo sesión activa:', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
};

/**
 * Actualizar minutos trabajados en tiempo real
 */
export const updateSessionMinutes = async (
  sessionId: string,
  reportsReviewed: number,
  actionsTaken: number
): Promise<void> => {
  try {
    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from('moderator_sessions')
      .select('session_start')
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData) return;

    const startTime = new Date(sessionData.session_start);
    const now = new Date();
    const minutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);

    const { error } = await supabase
      .from('moderator_sessions')
      .update({
        total_minutes: minutes,
        reports_reviewed: reportsReviewed,
        actions_taken: actionsTaken,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) throw error;
  } catch (error) {
    logger.error('Error actualizando minutos de sesión:', { error: error instanceof Error ? error.message : String(error) });
  }
};

