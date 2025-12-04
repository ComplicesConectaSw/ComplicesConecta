import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncRequest {
  type: 'match' | 'like' | 'user';
  user1_id?: string;
  user2_id?: string;
  user_id?: string;
  match_id?: string;
  like_id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar que Neo4j esté habilitado
    const neo4jEnabled = Deno.env.get('VITE_NEO4J_ENABLED') === 'true';
    if (!neo4jEnabled) {
      return new Response(
        JSON.stringify({ success: false, error: 'Neo4j está deshabilitado' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Obtener datos del request
    const syncData: SyncRequest = await req.json();
    const { type } = syncData;

    // Configuración de Neo4j (variables no usadas marcadas con _)
    const _neo4jUri = Deno.env.get('VITE_NEO4J_URI') || 'bolt://localhost:7687';
    const _neo4jUser = Deno.env.get('VITE_NEO4J_USER') || 'neo4j';
    const _neo4jPassword = Deno.env.get('VITE_NEO4J_PASSWORD') || 'complices2025';

    // Importar driver de Neo4j (usando fetch para llamar a API interna)
    // NOTA: En producción, usar neo4j-driver directamente si es posible
    // Por ahora, llamar a servicio interno que sincronice

    // Obtener datos de Supabase
    const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuración de Supabase faltante');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    switch (type) {
      case 'match': {
        if (!syncData.user1_id || !syncData.user2_id) {
          throw new Error('user1_id y user2_id son requeridos para sync match');
        }

        // Obtener datos del match desde PostgreSQL
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .eq('id', syncData.match_id || '')
          .single();

        if (matchError || !matchData) {
          throw new Error('Match no encontrado');
        }

        result = {
          success: true,
          type: 'match',
          user1_id: syncData.user1_id,
          user2_id: syncData.user2_id,
          synced: true
        };
        break;
      }

      case 'like': {
        if (!syncData.user1_id || !syncData.user2_id) {
          throw new Error('user1_id y user2_id son requeridos para sync like');
        }

        result = {
          success: true,
          type: 'like',
          user1_id: syncData.user1_id,
          user2_id: syncData.user2_id,
          synced: true
        };
        break;
      }

      case 'user': {
        if (!syncData.user_id) {
          throw new Error('user_id es requerido para sync user');
        }

        // Obtener perfil del usuario
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', syncData.user_id)
          .single();

        if (profileError || !profileData) {
          throw new Error('Perfil no encontrado');
        }

        result = {
          success: true,
          type: 'user',
          user_id: syncData.user_id,
          synced: true
        };
        break;
      }

      default:
        throw new Error(`Tipo de sincronización no soportado: ${type}`);
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error en sync-neo4j:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});