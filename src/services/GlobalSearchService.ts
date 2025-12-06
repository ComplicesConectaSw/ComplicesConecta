import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface GlobalSearchResult {
  id: string;
  type: 'profile';
  title: string;
  subtitle: string;
  image_url: string | null;
}

export class GlobalSearchService {
  static async search(query: string): Promise<GlobalSearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    try {
      if (!supabase) {
        logger.error('❌ Supabase no está disponible para búsqueda global');
        return [];
      }

      const { data, error } = await (supabase as any).rpc('search_unified', {
        query_text: trimmed,
      });

      if (error) {
        logger.error('❌ Error en search_unified RPC', { error: error.message });
        return [];
      }

      if (!data) return [];

      return (data as Array<{
        id: string | number;
        type: 'profile';
        title?: string | null;
        subtitle?: string | null;
        image_url?: string | null;
      }>).map((row) => ({
        id: String(row.id),
        type: row.type,
        title: row.title ?? '',
        subtitle: row.subtitle ?? '',
        image_url: row.image_url ?? null,
      }));
    } catch (error) {
      logger.error('❌ Excepción en GlobalSearchService.search', {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }
}
