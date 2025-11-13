// ComplicesConecta v3.7.0 - Helpers para Supabase Types
// Fecha: 13 Nov 2025 | Autor: Ing. Juan Carlos Méndez Nataren
// Descripción: Helpers para casting seguro de tipos Supabase

/**
 * Helper para casting seguro de resultados de Supabase
 * Evita errores de tipos cuando las tablas no están en el schema generado
 */
export function safeSupabaseCast<T>(data: any): T {
  return data as T;
}

/**
 * Helper para verificar si un objeto tiene una propiedad
 */
export function hasProperty<T extends object, K extends string>(
  obj: T,
  prop: K
): obj is T & Record<K, any> {
  return prop in obj;
}

/**
 * Helper para obtener una propiedad de forma segura
 */
export function safeGetProperty<T>(obj: any, prop: string, defaultValue: T): T {
  return obj && typeof obj === 'object' && prop in obj ? obj[prop] : defaultValue;
}

/**
 * Helper para casting de tablas blockchain específicas
 */
export const BlockchainCasts = {
  coupleNFTRequest: (data: any) => safeSupabaseCast<{
    id: string;
    token_id: number;
    partner1_address: string;
    partner2_address: string;
    initiator_address: string;
    metadata_uri: string;
    consent1_timestamp?: string;
    consent2_timestamp?: string;
    status: 'pending' | 'approved' | 'minted' | 'cancelled' | 'expired';
    created_at: string;
    expires_at: string;
  }>(data),

  userNFT: (data: any) => safeSupabaseCast<{
    id: string;
    token_id: number;
    owner_address: string;
    metadata_uri: string;
    rarity: string;
    is_couple: boolean;
    partner_address?: string;
    created_at: string;
  }>(data),

  dailyTokenClaim: (data: any) => safeSupabaseCast<{
    id: string;
    user_id: string;
    wallet_address: string;
    amount_claimed: number;
    claim_date: string;
    transaction_hash?: string;
    network: string;
    token_type: string;
    created_at: string;
  }>(data),

  testnetTokenClaim: (data: any) => safeSupabaseCast<{
    id: string;
    user_id: string;
    wallet_address: string;
    amount_claimed: number;
    claimed_at: string;
    transaction_hash?: string;
    network: string;
    token_type: string;
    claim_type: string;
  }>(data)
};

/**
 * Helper para manejar errores de Supabase de forma consistente
 */
export function handleSupabaseError(error: any, context: string): never {
  const errorMessage = error?.message || 'Error desconocido de Supabase';
  throw new Error(`${context}: ${errorMessage}`);
}

/**
 * Helper para verificar si supabase client está disponible
 */
export function ensureSupabaseClient(client: any, context: string): void {
  if (!client) {
    throw new Error(`${context}: Supabase client no disponible`);
  }
}
