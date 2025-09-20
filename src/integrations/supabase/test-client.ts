import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { logger } from '@/lib/logger';

// Cliente de Supabase específico para tests - sin bloqueos
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

logger.info('🧪 Creando cliente Supabase para tests');

export const testSupabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key', 
  {
    auth: {
      persistSession: false, // No persistir sesión en tests
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'apikey': supabaseAnonKey || 'placeholder-key',
        'Authorization': `Bearer ${supabaseAnonKey || 'placeholder-key'}`,
      },
      // Sin fetch personalizado - usar fetch nativo
    }
  }
);
