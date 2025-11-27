/**
 * Tipos TypeScript para correcciones de Supabase
 * Alineación con base de datos remota v3.6.3
 * 
 * @version 3.6.3
 * @date 2025-11-15
 */

import type { Database } from './supabase-generated';

// Extensiones de tipos para tablas corregidas
export interface DailyTokenClaimsRow {
  id: string;
  user_id: string;
  wallet_address: string | null;
  tokens_claimed: number;
  claim_date: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEventsRow {
  id: string;
  user_id: string | null;
  event_name: string;
  event_type: 'user_behavior' | 'system' | 'error' | 'performance';
  properties: Record<string, unknown>;
  session_id: string | null;
  timestamp: string;
  created_at: string;
}

export interface StoryLikesRow {
  id: string;
  story_id: string;
  user_id: string;
  created_at: string;
}

export interface StoryCommentsRow {
  id: string;
  story_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StorySharesRow {
  id: string;
  story_id: string;
  user_id: string;
  shared_to: string | null;
  created_at: string;
}

export interface CoupleNftRequestsRow {
  id: string;
  couple_id: string;
  request_type: string;
  status: string;
  metadata: Record<string, unknown> | null;
  blockchain_status: 'pending' | 'minting' | 'minted' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface InvitationTemplateRowFixed {
  id: string;
  template_name: string;
  name: string | null;
  template_content: string;
  content: string | null;
  invitation_type: string;
  type: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  usage_count: number | null;
  variables: Record<string, unknown>;
}

export interface GalleryPermissionRowFixed {
  id: string;
  profile_id: string | null;
  gallery_owner_id: string | null;
  granted_by: string | null;
  granted_to: string | null;
  permission_type: string | null;
  created_at: string | null;
}

// Tipos para servicios corregidos
export interface AnalyticsEventInsert {
  user_id?: string;
  event_name: string;
  event_type?: 'user_behavior' | 'system' | 'error' | 'performance';
  properties?: Record<string, unknown>;
  session_id?: string;
}

export interface StoryInteractionCounts {
  likes: number;
  comments: number;
  shares: number;
}

// Extensión de Database con tipos corregidos
export interface DatabaseFixed extends Database {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      analytics_events: {
        Row: AnalyticsEventsRow;
        Insert: AnalyticsEventInsert & {
          id?: string;
          timestamp?: string;
          created_at?: string;
        };
        Update: Partial<AnalyticsEventInsert>;
      };
      daily_token_claims: {
        Row: DailyTokenClaimsRow;
        Insert: Omit<DailyTokenClaimsRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DailyTokenClaimsRow, 'id'>>;
      };
      story_likes: {
        Row: StoryLikesRow;
        Insert: Omit<StoryLikesRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<StoryLikesRow, 'id'>>;
      };
      story_comments: {
        Row: StoryCommentsRow;
        Insert: Omit<StoryCommentsRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<StoryCommentsRow, 'id'>>;
      };
      story_shares: {
        Row: StorySharesRow;
        Insert: Omit<StorySharesRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<StorySharesRow, 'id'>>;
      };
      couple_nft_requests: {
        Row: CoupleNftRequestsRow;
        Insert: Omit<CoupleNftRequestsRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CoupleNftRequestsRow, 'id'>>;
      };
    };
  };
}

// Helper types para type safety
export type SafeSupabaseClient = {
  from<T extends keyof DatabaseFixed['public']['Tables']>(
    table: T
  ): {
    select: (columns?: string) => Promise<{
      data: DatabaseFixed['public']['Tables'][T]['Row'][] | null;
      error: any;
    }>;
    insert: (
      values: DatabaseFixed['public']['Tables'][T]['Insert'] | DatabaseFixed['public']['Tables'][T]['Insert'][]
    ) => Promise<{
      data: DatabaseFixed['public']['Tables'][T]['Row'][] | null;
      error: any;
    }>;
    update: (
      values: DatabaseFixed['public']['Tables'][T]['Update']
    ) => Promise<{
      data: DatabaseFixed['public']['Tables'][T]['Row'][] | null;
      error: any;
    }>;
  };
};

// Utilidades para validación de tipos
export const validateAnalyticsEvent = (event: any): event is AnalyticsEventInsert => {
  return (
    typeof event === 'object' &&
    typeof event.event_name === 'string' &&
    (event.event_type === undefined || 
     ['user_behavior', 'system', 'error', 'performance'].includes(event.event_type))
  );
};

export const validateStoryInteraction = (interaction: any): interaction is { story_id: string; user_id: string } => {
  return (
    typeof interaction === 'object' &&
    typeof interaction.story_id === 'string' &&
    typeof interaction.user_id === 'string'
  );
};

// Constantes para type safety
export const ANALYTICS_EVENT_TYPES = [
  'user_behavior',
  'system', 
  'error',
  'performance'
] as const;

export const BLOCKCHAIN_STATUSES = [
  'pending',
  'minting', 
  'minted',
  'failed'
] as const;

export const STORY_SHARE_TARGETS = [
  'feed',
  'direct',
  'external'
] as const;

export type AnalyticsEventType = typeof ANALYTICS_EVENT_TYPES[number];
export type BlockchainStatus = typeof BLOCKCHAIN_STATUSES[number];
export type StoryShareTarget = typeof STORY_SHARE_TARGETS[number];
