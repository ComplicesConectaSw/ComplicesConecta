Connecting to db 5432
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_compatibility_scores: {
        Row: {
          ai_score: number | null
          confidence_score: number | null
          created_at: string | null
          features: Json | null
          final_score: number
          id: string
          legacy_score: number | null
          model_version: string | null
          prediction_method: string | null
          updated_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          ai_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          features?: Json | null
          final_score: number
          id?: string
          legacy_score?: number | null
          model_version?: string | null
          prediction_method?: string | null
          updated_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          ai_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          features?: Json | null
          final_score?: number
          id?: string
          legacy_score?: number | null
          model_version?: string | null
          prediction_method?: string | null
          updated_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_compatibility_scores_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_compatibility_scores_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_model_metrics: {
        Row: {
          accuracy_score: number | null
          avg_prediction_time_ms: number | null
          cache_hit_rate: number | null
          conversation_rate: number | null
          created_at: string | null
          error_rate: number | null
          f1_score: number | null
          id: string
          match_rate: number | null
          model_version: string
          period_end: string
          period_start: string
          precision_score: number | null
          predictions_count: number | null
          recall_score: number | null
          satisfaction_score: number | null
        }
        Insert: {
          accuracy_score?: number | null
          avg_prediction_time_ms?: number | null
          cache_hit_rate?: number | null
          conversation_rate?: number | null
          created_at?: string | null
          error_rate?: number | null
          f1_score?: number | null
          id?: string
          match_rate?: number | null
          model_version: string
          period_end: string
          period_start: string
          precision_score?: number | null
          predictions_count?: number | null
          recall_score?: number | null
          satisfaction_score?: number | null
        }
        Update: {
          accuracy_score?: number | null
          avg_prediction_time_ms?: number | null
          cache_hit_rate?: number | null
          conversation_rate?: number | null
          created_at?: string | null
          error_rate?: number | null
          f1_score?: number | null
          id?: string
          match_rate?: number | null
          model_version?: string
          period_end?: string
          period_start?: string
          precision_score?: number | null
          predictions_count?: number | null
          recall_score?: number | null
          satisfaction_score?: number | null
        }
        Relationships: []
      }
      ai_prediction_logs: {
        Row: {
          cache_hit: boolean | null
          error_message: string | null
          fallback_used: boolean | null
          features: Json
          id: string
          method: string
          model_version: string | null
          prediction_time_ms: number | null
          score: number
          timestamp: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          cache_hit?: boolean | null
          error_message?: string | null
          fallback_used?: boolean | null
          features?: Json
          id?: string
          method: string
          model_version?: string | null
          prediction_time_ms?: number | null
          score: number
          timestamp?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          cache_hit?: boolean | null
          error_message?: string | null
          fallback_used?: boolean | null
          features?: Json
          id?: string
          method?: string
          model_version?: string | null
          prediction_time_ms?: number | null
          score?: number
          timestamp?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_prediction_logs_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prediction_logs_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          page_url: string | null
          referrer: string | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_logs: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          ip_address: unknown
          level: string
          message: string
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          level?: string
          message: string
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          level?: string
          message?: string
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      biometric_sessions: {
        Row: {
          confidence: number | null
          created_at: string | null
          credential_id: string | null
          device_id: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          last_used_at: string | null
          public_key: string | null
          session_id: string
          session_type: string
          success: boolean | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          credential_id?: string | null
          device_id?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          public_key?: string | null
          session_id: string
          session_type: string
          success?: boolean | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          credential_id?: string | null
          device_id?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          public_key?: string | null
          session_id?: string
          session_type?: string
          success?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "biometric_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_ips: {
        Row: {
          blocked_at: string | null
          blocked_by: string | null
          duration: string | null
          expires_at: string | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          reason: string | null
        }
        Insert: {
          blocked_at?: string | null
          blocked_by?: string | null
          duration?: string | null
          expires_at?: string | null
          id?: string
          ip_address: unknown
          is_active?: boolean | null
          reason?: string | null
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string | null
          duration?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          reason?: string | null
        }
        Relationships: []
      }
      cache_statistics: {
        Row: {
          access_time_ms: number | null
          cache_key: string
          cache_type: string
          compression_ratio: number | null
          created_at: string | null
          hit_count: number | null
          id: string
          last_accessed: string | null
          miss_count: number | null
          size_bytes: number | null
          ttl_seconds: number | null
        }
        Insert: {
          access_time_ms?: number | null
          cache_key: string
          cache_type: string
          compression_ratio?: number | null
          created_at?: string | null
          hit_count?: number | null
          id?: string
          last_accessed?: string | null
          miss_count?: number | null
          size_bytes?: number | null
          ttl_seconds?: number | null
        }
        Update: {
          access_time_ms?: number | null
          cache_key?: string
          cache_type?: string
          compression_ratio?: number | null
          created_at?: string | null
          hit_count?: number | null
          id?: string
          last_accessed?: string | null
          miss_count?: number | null
          size_bytes?: number | null
          ttl_seconds?: number | null
        }
        Relationships: []
      }
      career_applications: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          experience_years: number | null
          id: string
          position: string
          resume_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          position: string
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          position?: string
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_members: {
        Row: {
          created_at: string | null
          id: string
          is_admin: boolean | null
          is_muted: boolean | null
          joined_at: string | null
          last_read_at: string | null
          profile_id: string
          room_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          profile_id: string
          room_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          profile_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          location_address: string | null
          location_latitude: number | null
          location_longitude: number | null
          message_type: string | null
          read_at: string | null
          room_id: string | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          message_type?: string | null
          read_at?: string | null
          room_id?: string | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          message_type?: string | null
          read_at?: string | null
          room_id?: string | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_group: boolean | null
          name: string | null
          room_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          room_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          room_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_summaries: {
        Row: {
          chat_id: string
          created_at: string | null
          id: string
          message_count: number
          method: string | null
          model_version: string | null
          sentiment: string | null
          summary: string
          topics: Json | null
          updated_at: string | null
        }
        Insert: {
          chat_id: string
          created_at?: string | null
          id?: string
          message_count?: number
          method?: string | null
          model_version?: string | null
          sentiment?: string | null
          summary: string
          topics?: Json | null
          updated_at?: string | null
        }
        Update: {
          chat_id?: string
          created_at?: string | null
          id?: string
          message_count?: number
          method?: string | null
          model_version?: string | null
          sentiment?: string | null
          summary?: string
          topics?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "story_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_verifications: {
        Row: {
          chat_id: string | null
          confidence: number
          consent_level: string
          consent_score: number | null
          created_at: string
          explanation: string | null
          id: string
          is_paused: boolean | null
          message_count: number | null
          message_id: string | null
          pause_reason: string | null
          reasoning: string | null
          recipient_id: string
          requires_confirmation: boolean
          status: string | null
          suggested_action: string
          updated_at: string
          user_id: string
          user_id1: string | null
          user_id2: string | null
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          chat_id?: string | null
          confidence: number
          consent_level: string
          consent_score?: number | null
          created_at?: string
          explanation?: string | null
          id?: string
          is_paused?: boolean | null
          message_count?: number | null
          message_id?: string | null
          pause_reason?: string | null
          reasoning?: string | null
          recipient_id: string
          requires_confirmation?: boolean
          status?: string | null
          suggested_action: string
          updated_at?: string
          user_id: string
          user_id1?: string | null
          user_id2?: string | null
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          chat_id?: string | null
          confidence?: number
          consent_level?: string
          consent_score?: number | null
          created_at?: string
          explanation?: string | null
          id?: string
          is_paused?: boolean | null
          message_count?: number | null
          message_id?: string | null
          pause_reason?: string | null
          reasoning?: string | null
          recipient_id?: string
          requires_confirmation?: boolean
          status?: string | null
          suggested_action?: string
          updated_at?: string
          user_id?: string
          user_id1?: string | null
          user_id2?: string | null
          verified?: boolean
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_verifications_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_events: {
        Row: {
          couple_id: string
          created_at: string | null
          date: string
          description: string | null
          event_type: string
          id: string
          is_public: boolean | null
          location: string
          max_participants: number | null
          participants: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          couple_id: string
          created_at?: string | null
          date: string
          description?: string | null
          event_type: string
          id?: string
          is_public?: boolean | null
          location: string
          max_participants?: number | null
          participants?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          couple_id?: string
          created_at?: string | null
          date?: string
          description?: string | null
          event_type?: string
          id?: string
          is_public?: boolean | null
          location?: string
          max_participants?: number | null
          participants?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_events_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_interactions: {
        Row: {
          couple_id: string
          created_at: string | null
          id: string
          interaction_type: string
          metadata: Json | null
          target_couple_id: string
        }
        Insert: {
          couple_id: string
          created_at?: string | null
          id?: string
          interaction_type: string
          metadata?: Json | null
          target_couple_id: string
        }
        Update: {
          couple_id?: string
          created_at?: string | null
          id?: string
          interaction_type?: string
          metadata?: Json | null
          target_couple_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_interactions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_interactions_target_couple_id_fkey"
            columns: ["target_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_matches: {
        Row: {
          compatibility_factors: Json | null
          couple1_id: string
          couple2_id: string
          created_at: string | null
          id: string
          match_reasons: string[] | null
          match_score: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          compatibility_factors?: Json | null
          couple1_id: string
          couple2_id: string
          created_at?: string | null
          id?: string
          match_reasons?: string[] | null
          match_score: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          compatibility_factors?: Json | null
          couple1_id?: string
          couple2_id?: string
          created_at?: string | null
          id?: string
          match_reasons?: string[] | null
          match_score?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_matches_couple1_id_fkey"
            columns: ["couple1_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_matches_couple2_id_fkey"
            columns: ["couple2_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_profile_likes: {
        Row: {
          couple_profile_id: string
          id: string
          liked_at: string
          liker_profile_id: string
        }
        Insert: {
          couple_profile_id: string
          id?: string
          liked_at?: string
          liker_profile_id: string
        }
        Update: {
          couple_profile_id?: string
          id?: string
          liked_at?: string
          liker_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_profile_likes_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_profile_reports: {
        Row: {
          couple_profile_id: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          couple_profile_id: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_profile_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          couple_profile_id?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_profile_reports_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_profile_views: {
        Row: {
          couple_profile_id: string
          id: string
          viewed_at: string
          viewer_profile_id: string
        }
        Insert: {
          couple_profile_id: string
          id?: string
          viewed_at?: string
          viewer_profile_id: string
        }
        Update: {
          couple_profile_id?: string
          id?: string
          viewed_at?: string
          viewer_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_profile_views_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_profiles: {
        Row: {
          activities_interested: string[] | null
          age_range_max: number | null
          age_range_min: number | null
          city: string | null
          communication_preference: string | null
          compatibility_factors: Json | null
          country: string | null
          couple_age_range: string | null
          couple_availability: string | null
          couple_bio: string | null
          couple_body_type: string | null
          couple_height_range: string | null
          couple_images: string[] | null
          couple_interests: string[] | null
          couple_lifestyle: string | null
          couple_name: string
          created_at: string | null
          display_name: string | null
          event_types: string[] | null
          experience_level: string | null
          id: string
          interested_in: string | null
          is_active: boolean | null
          is_demo: boolean | null
          is_premium: boolean | null
          is_public: boolean | null
          is_verified: boolean | null
          last_active: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          looking_for: string | null
          max_distance: number | null
          partner1_id: string
          partner2_id: string
          preferences: Json | null
          preferred_theme: string | null
          privacy_settings: Json | null
          profile_completed_at: string | null
          profile_completeness: number | null
          relationship_duration: number | null
          relationship_type: string | null
          state: string | null
          statistics: Json | null
          swinger_experience: string | null
          total_likes: number | null
          total_matches: number | null
          total_views: number | null
          updated_at: string | null
          verification_level: number | null
        }
        Insert: {
          activities_interested?: string[] | null
          age_range_max?: number | null
          age_range_min?: number | null
          city?: string | null
          communication_preference?: string | null
          compatibility_factors?: Json | null
          country?: string | null
          couple_age_range?: string | null
          couple_availability?: string | null
          couple_bio?: string | null
          couple_body_type?: string | null
          couple_height_range?: string | null
          couple_images?: string[] | null
          couple_interests?: string[] | null
          couple_lifestyle?: string | null
          couple_name: string
          created_at?: string | null
          display_name?: string | null
          event_types?: string[] | null
          experience_level?: string | null
          id?: string
          interested_in?: string | null
          is_active?: boolean | null
          is_demo?: boolean | null
          is_premium?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          last_active?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          looking_for?: string | null
          max_distance?: number | null
          partner1_id: string
          partner2_id: string
          preferences?: Json | null
          preferred_theme?: string | null
          privacy_settings?: Json | null
          profile_completed_at?: string | null
          profile_completeness?: number | null
          relationship_duration?: number | null
          relationship_type?: string | null
          state?: string | null
          statistics?: Json | null
          swinger_experience?: string | null
          total_likes?: number | null
          total_matches?: number | null
          total_views?: number | null
          updated_at?: string | null
          verification_level?: number | null
        }
        Update: {
          activities_interested?: string[] | null
          age_range_max?: number | null
          age_range_min?: number | null
          city?: string | null
          communication_preference?: string | null
          compatibility_factors?: Json | null
          country?: string | null
          couple_age_range?: string | null
          couple_availability?: string | null
          couple_bio?: string | null
          couple_body_type?: string | null
          couple_height_range?: string | null
          couple_images?: string[] | null
          couple_interests?: string[] | null
          couple_lifestyle?: string | null
          couple_name?: string
          created_at?: string | null
          display_name?: string | null
          event_types?: string[] | null
          experience_level?: string | null
          id?: string
          interested_in?: string | null
          is_active?: boolean | null
          is_demo?: boolean | null
          is_premium?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          last_active?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          looking_for?: string | null
          max_distance?: number | null
          partner1_id?: string
          partner2_id?: string
          preferences?: Json | null
          preferred_theme?: string | null
          privacy_settings?: Json | null
          profile_completed_at?: string | null
          profile_completeness?: number | null
          relationship_duration?: number | null
          relationship_type?: string | null
          state?: string | null
          statistics?: Json | null
          swinger_experience?: string | null
          total_likes?: number | null
          total_matches?: number | null
          total_views?: number | null
          updated_at?: string | null
          verification_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_profiles_partner1_id_fkey"
            columns: ["partner1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profiles_partner2_id_fkey"
            columns: ["partner2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      error_alerts: {
        Row: {
          category: string
          created_at: string | null
          error_message: string
          error_stack: string | null
          id: string
          metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          timestamp: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          error_message: string
          error_stack?: string | null
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          timestamp?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          error_message?: string
          error_stack?: string | null
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          timestamp?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      gallery_permissions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          gallery_owner_id: string
          granted_by: string
          granted_to: string
          id: string
          permission_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          gallery_owner_id: string
          granted_by: string
          granted_to: string
          id?: string
          permission_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          gallery_owner_id?: string
          granted_by?: string
          granted_to?: string
          id?: string
          permission_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      images: {
        Row: {
          alt_text: string | null
          file_size: number | null
          height: number | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          is_verified: boolean | null
          metadata: Json | null
          mime_type: string | null
          profile_id: string
          sort_order: number | null
          tags: string[] | null
          updated_at: string | null
          uploaded_at: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          profile_id: string
          sort_order?: number | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_at?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          profile_id?: string
          sort_order?: number | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_at?: string | null
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      invitation_statistics: {
        Row: {
          acceptance_rate: number | null
          accepted_invitations: number | null
          created_at: string | null
          declined_invitations: number | null
          expired_invitations: number | null
          id: string
          pending_invitations: number | null
          period_end: string | null
          period_start: string | null
          total_invitations: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          acceptance_rate?: number | null
          accepted_invitations?: number | null
          created_at?: string | null
          declined_invitations?: number | null
          expired_invitations?: number | null
          id?: string
          pending_invitations?: number | null
          period_end?: string | null
          period_start?: string | null
          total_invitations?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          acceptance_rate?: number | null
          accepted_invitations?: number | null
          created_at?: string | null
          declined_invitations?: number | null
          expired_invitations?: number | null
          id?: string
          pending_invitations?: number | null
          period_end?: string | null
          period_start?: string | null
          total_invitations?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      invitation_templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          invitation_type: string | null
          is_active: boolean | null
          name: string
          template_content: string
          template_name: string
          template_type: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          invitation_type?: string | null
          is_active?: boolean | null
          name: string
          template_content: string
          template_name: string
          template_type?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          invitation_type?: string | null
          is_active?: boolean | null
          name?: string
          template_content?: string
          template_name?: string
          template_type?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          decided_at: string | null
          from_profile: string
          id: string
          message: string | null
          status: string | null
          to_profile: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          from_profile: string
          id?: string
          message?: string | null
          status?: string | null
          to_profile: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          from_profile?: string
          id?: string
          message?: string | null
          status?: string | null
          to_profile?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          match_score: number | null
          status: string | null
          updated_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_score?: number | null
          status?: string | null
          updated_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_score?: number | null
          status?: string | null
          updated_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          created_at: string | null
          duration: number | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          file_url: string
          height: number | null
          id: string
          is_public: boolean | null
          is_verified: boolean | null
          metadata: Json | null
          mime_type: string | null
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string
          width: number | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          file_url: string
          height?: number | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id: string
          width?: number | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          height?: number | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_access_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          media_id: string | null
          media_path: string
          reason: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          media_id?: string | null
          media_path: string
          reason?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          media_id?: string | null
          media_path?: string
          reason?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_access_logs_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_access_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          location_address: string | null
          location_latitude: number | null
          location_longitude: number | null
          message_type: string | null
          room_id: string | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          message_type?: string | null
          room_id?: string | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          message_type?: string | null
          room_id?: string | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          action_type: string
          created_at: string | null
          details: Json | null
          id: string
          moderator_id: string
          reason: string | null
          severity: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          moderator_id: string
          reason?: string | null
          severity?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          moderator_id?: string
          reason?: string | null
          severity?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_logs_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "moderators"
            referencedColumns: ["id"]
          },
        ]
      }
      moderator_requests: {
        Row: {
          created_at: string | null
          experience: string | null
          id: string
          motivation: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          experience?: string | null
          id?: string
          motivation: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          experience?: string | null
          id?: string
          motivation?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      moderators: {
        Row: {
          assigned_at: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          level: string
          moderator_id: string | null
          permissions: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          level?: string
          moderator_id?: string | null
          permissions?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          level?: string
          moderator_id?: string | null
          permissions?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_sessions: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          metadata: Json | null
          page_views: number | null
          started_at: string | null
          total_errors: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          page_views?: number | null
          started_at?: string | null
          total_errors?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          page_views?: number | null
          started_at?: string | null
          total_errors?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      nft_galleries: {
        Row: {
          created_at: string
          description: string | null
          gallery_name: string
          id: string
          is_public: boolean
          is_verified: boolean
          metadata: Json | null
          minted_at: string | null
          minted_with_gtk: number | null
          nft_contract_address: string | null
          nft_network: string | null
          nft_token_id: string | null
          profile_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          gallery_name: string
          id?: string
          is_public?: boolean
          is_verified?: boolean
          metadata?: Json | null
          minted_at?: string | null
          minted_with_gtk?: number | null
          nft_contract_address?: string | null
          nft_network?: string | null
          nft_token_id?: string | null
          profile_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          gallery_name?: string
          id?: string
          is_public?: boolean
          is_verified?: boolean
          metadata?: Json | null
          minted_at?: string | null
          minted_with_gtk?: number | null
          nft_contract_address?: string | null
          nft_network?: string | null
          nft_token_id?: string | null
          profile_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_galleries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_gallery_images: {
        Row: {
          created_at: string
          gallery_id: string
          id: string
          image_hash: string | null
          image_url: string
          is_verified: boolean
          metadata: Json | null
          minted_at: string | null
          minted_with_gtk: number | null
          nft_contract_address: string | null
          nft_network: string | null
          nft_token_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          gallery_id: string
          id?: string
          image_hash?: string | null
          image_url: string
          is_verified?: boolean
          metadata?: Json | null
          minted_at?: string | null
          minted_with_gtk?: number | null
          nft_contract_address?: string | null
          nft_network?: string | null
          nft_token_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          gallery_id?: string
          id?: string
          image_hash?: string | null
          image_url?: string
          is_verified?: boolean
          metadata?: Json | null
          minted_at?: string | null
          minted_with_gtk?: number | null
          nft_contract_address?: string | null
          nft_network?: string | null
          nft_token_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_gallery_images_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "nft_galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          data: Json | null
          expires_at: string | null
          group_key: string | null
          id: number
          is_read: boolean | null
          message: string
          priority: string | null
          read: boolean | null
          read_at: string | null
          scheduled_for: string | null
          sender_id: string | null
          sender_name: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          group_key?: string | null
          id?: number
          is_read?: boolean | null
          message: string
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          scheduled_for?: string | null
          sender_id?: string | null
          sender_name?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          group_key?: string | null
          id?: number
          is_read?: boolean | null
          message?: string
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          scheduled_for?: string | null
          sender_id?: string | null
          sender_name?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_name: string
          session_id: string
          timestamp: string | null
          unit: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          session_id: string
          timestamp?: string | null
          unit?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          session_id?: string
          timestamp?: string | null
          unit?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
          value?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          age: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          id: string
          interests: string[] | null
          is_admin: boolean | null
          is_demo: boolean | null
          is_online: boolean | null
          is_premium: boolean | null
          is_public: boolean | null
          is_verified: boolean | null
          last_active: string | null
          last_name: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string | null
          premium_expires_at: string | null
          premium_plan: string | null
          role: string | null
          s2_cell_id: string | null
          s2_level: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_type?: string | null
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          is_admin?: boolean | null
          is_demo?: boolean | null
          is_online?: boolean | null
          is_premium?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          last_active?: string | null
          last_name?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string | null
          premium_expires_at?: string | null
          premium_plan?: string | null
          role?: string | null
          s2_cell_id?: string | null
          s2_level?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_type?: string | null
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          is_admin?: boolean | null
          is_demo?: boolean | null
          is_online?: boolean | null
          is_premium?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          last_active?: string | null
          last_name?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string | null
          premium_expires_at?: string | null
          premium_plan?: string | null
          role?: string | null
          s2_cell_id?: string | null
          s2_level?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          amount: number
          claimed: boolean | null
          claimed_at: string | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          invited_id: string | null
          invited_reward_amount: number | null
          inviter_id: string | null
          inviter_reward_amount: number | null
          metadata: Json | null
          processed_at: string | null
          referral_code: string
          reward_type: string
          status: string | null
          updated_at: string | null
          user_id: string
          verification_method: string | null
          worldid_proof: Json | null
        }
        Insert: {
          amount?: number
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          invited_id?: string | null
          invited_reward_amount?: number | null
          inviter_id?: string | null
          inviter_reward_amount?: number | null
          metadata?: Json | null
          processed_at?: string | null
          referral_code: string
          reward_type: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          verification_method?: string | null
          worldid_proof?: Json | null
        }
        Update: {
          amount?: number
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          invited_id?: string | null
          invited_reward_amount?: number | null
          inviter_id?: string | null
          inviter_reward_amount?: number | null
          metadata?: Json | null
          processed_at?: string | null
          referral_code?: string
          reward_type?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          verification_method?: string | null
          worldid_proof?: Json | null
        }
        Relationships: []
      }
      referral_statistics: {
        Row: {
          active_referrals: number | null
          conversion_rate: number | null
          created_at: string | null
          id: string
          monthly_earned: number | null
          period_end: string | null
          period_start: string | null
          referral_code: string
          total_earned: number | null
          total_referrals: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_referrals?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          monthly_earned?: number | null
          period_end?: string | null
          period_start?: string | null
          referral_code: string
          total_earned?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_referrals?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          monthly_earned?: number | null
          period_end?: string | null
          period_start?: string | null
          referral_code?: string
          total_earned?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_statistics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          token_type: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          token_type: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          token_type?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          content_type: string | null
          created_at: string
          description: string | null
          id: string
          reason: string
          report_type: string
          reported_content_id: string | null
          reported_user_id: string | null
          reporter_user_id: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          status: string
          updated_at: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          report_type: string
          reported_content_id?: string | null
          reported_user_id?: string | null
          reporter_user_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          report_type?: string
          reported_content_id?: string | null
          reported_user_id?: string | null
          reporter_user_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          description: string
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          description: string
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          description?: string
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      staking_records: {
        Row: {
          amount: number
          created_at: string | null
          end_date: string
          id: string
          reward_claimed: boolean | null
          reward_percentage: number | null
          start_date: string
          status: string | null
          token_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          end_date: string
          id?: string
          reward_claimed?: boolean | null
          reward_percentage?: number | null
          start_date?: string
          status?: string | null
          token_type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          end_date?: string
          id?: string
          reward_claimed?: boolean | null
          reward_percentage?: number | null
          start_date?: string
          status?: string | null
          token_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staking_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          content_type: string
          content_url: string | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_public: boolean | null
          location: string | null
          media_url: string | null
          media_urls: string[] | null
          updated_at: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          location?: string | null
          media_url?: string | null
          media_urls?: string[] | null
          updated_at?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          location?: string | null
          media_url?: string | null
          media_urls?: string[] | null
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          story_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          story_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          story_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "story_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_likes: {
        Row: {
          created_at: string | null
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_likes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_shares: {
        Row: {
          created_at: string | null
          id: string
          share_type: string | null
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          share_type?: string | null
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          share_type?: string | null
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_shares_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      summary_feedback: {
        Row: {
          created_at: string | null
          feedback_text: string | null
          id: string
          is_helpful: boolean
          summary_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          is_helpful: boolean
          summary_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          is_helpful?: boolean
          summary_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "summary_feedback_summary_id_fkey"
            columns: ["summary_id"]
            isOneToOne: false
            referencedRelation: "chat_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "summary_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      summary_requests: {
        Row: {
          chat_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          chat_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          chat_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "summary_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swinger_interests: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          is_explicit: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          is_explicit?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          is_explicit?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      token_analytics: {
        Row: {
          active_stakers: number | null
          circulating_cmpx: number | null
          circulating_gtk: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          period_end: string
          period_start: string
          period_type: string
          total_cmpx_supply: number | null
          total_gtk_supply: number | null
          total_staked_cmpx: number | null
          transaction_count: number | null
          transaction_volume_cmpx: number | null
          transaction_volume_gtk: number | null
          updated_at: string | null
        }
        Insert: {
          active_stakers?: number | null
          circulating_cmpx?: number | null
          circulating_gtk?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          period_type: string
          total_cmpx_supply?: number | null
          total_gtk_supply?: number | null
          total_staked_cmpx?: number | null
          transaction_count?: number | null
          transaction_volume_cmpx?: number | null
          transaction_volume_gtk?: number | null
          updated_at?: string | null
        }
        Update: {
          active_stakers?: number | null
          circulating_cmpx?: number | null
          circulating_gtk?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          period_type?: string
          total_cmpx_supply?: number | null
          total_gtk_supply?: number | null
          total_staked_cmpx?: number | null
          transaction_count?: number | null
          transaction_volume_cmpx?: number | null
          transaction_volume_gtk?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          related_user_id: string | null
          token_type: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          related_user_id?: string | null
          token_type?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          related_user_id?: string | null
          token_type?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      two_factor_auth: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          method: string
          secret: string | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          method?: string
          secret?: string | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          method?: string
          secret?: string | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "two_factor_auth_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interests: {
        Row: {
          created_at: string | null
          id: number
          interest_id: number
          privacy_level: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          interest_id: number
          privacy_level?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          interest_id?: number
          privacy_level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "swinger_interests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_referral_balances: {
        Row: {
          cmpx_balance: number | null
          created_at: string | null
          gtk_balance: number | null
          id: string
          monthly_earned: number | null
          referral_code: string
          total_earned: number | null
          total_referrals: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cmpx_balance?: number | null
          created_at?: string | null
          gtk_balance?: number | null
          id?: string
          monthly_earned?: number | null
          referral_code: string
          total_earned?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cmpx_balance?: number | null
          created_at?: string | null
          gtk_balance?: number | null
          id?: string
          monthly_earned?: number | null
          referral_code?: string
          total_earned?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_referral_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_suspensions: {
        Row: {
          created_at: string | null
          duration_days: number | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          moderator_id: string
          reason: string
          starts_at: string | null
          suspension_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_days?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          moderator_id: string
          reason: string
          starts_at?: string | null
          suspension_type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_days?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          moderator_id?: string
          reason?: string
          starts_at?: string | null
          suspension_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_suspensions_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "moderators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_suspensions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_token_balances: {
        Row: {
          cmpx_balance: number | null
          created_at: string | null
          gtk_balance: number | null
          id: string
          last_updated: string | null
          total_earned_cmpx: number | null
          total_earned_gtk: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cmpx_balance?: number | null
          created_at?: string | null
          gtk_balance?: number | null
          id?: string
          last_updated?: string | null
          total_earned_cmpx?: number | null
          total_earned_gtk?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cmpx_balance?: number | null
          created_at?: string | null
          gtk_balance?: number | null
          id?: string
          last_updated?: string | null
          total_earned_cmpx?: number | null
          total_earned_gtk?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      web_vitals_history: {
        Row: {
          cls: number | null
          created_at: string | null
          fcp: number | null
          fid: number | null
          id: string
          lcp: number | null
          metadata: Json | null
          timestamp: string | null
          ttfb: number | null
          url: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          cls?: number | null
          created_at?: string | null
          fcp?: number | null
          fid?: number | null
          id?: string
          lcp?: number | null
          metadata?: Json | null
          timestamp?: string | null
          ttfb?: number | null
          url: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          cls?: number | null
          created_at?: string | null
          fcp?: number | null
          fid?: number | null
          id?: string
          lcp?: number | null
          metadata?: Json | null
          timestamp?: string | null
          ttfb?: number | null
          url?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      worldid_rewards: {
        Row: {
          claimed: boolean | null
          claimed_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          reward_amount: number
          reward_type: string
          transaction_id: string | null
          user_id: string
          verification_id: string
        }
        Insert: {
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reward_amount?: number
          reward_type?: string
          transaction_id?: string | null
          user_id: string
          verification_id: string
        }
        Update: {
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reward_amount?: number
          reward_type?: string
          transaction_id?: string | null
          user_id?: string
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worldid_rewards_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "active_worldid_verifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worldid_rewards_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "worldid_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      worldid_statistics: {
        Row: {
          created_at: string | null
          device_verifications: number | null
          id: string
          metadata: Json | null
          orb_verifications: number | null
          period_end: string
          period_start: string
          total_rewards_distributed: number | null
          total_verifications: number | null
          unique_users: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_verifications?: number | null
          id?: string
          metadata?: Json | null
          orb_verifications?: number | null
          period_end: string
          period_start: string
          total_rewards_distributed?: number | null
          total_verifications?: number | null
          unique_users?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_verifications?: number | null
          id?: string
          metadata?: Json | null
          orb_verifications?: number | null
          period_end?: string
          period_start?: string
          total_rewards_distributed?: number | null
          total_verifications?: number | null
          unique_users?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      worldid_verifications: {
        Row: {
          action_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          merkle_root: string | null
          metadata: Json | null
          nullifier_hash: string
          proof: Json
          signal_hash: string | null
          updated_at: string | null
          user_id: string
          verification_level: string
          verified_at: string | null
        }
        Insert: {
          action_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          merkle_root?: string | null
          metadata?: Json | null
          nullifier_hash: string
          proof: Json
          signal_hash?: string | null
          updated_at?: string | null
          user_id: string
          verification_level?: string
          verified_at?: string | null
        }
        Update: {
          action_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          merkle_root?: string | null
          metadata?: Json | null
          nullifier_hash?: string
          proof?: Json
          signal_hash?: string | null
          updated_at?: string | null
          user_id?: string
          verification_level?: string
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      active_worldid_verifications: {
        Row: {
          action_id: string | null
          claimed: boolean | null
          claimed_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string | null
          is_active: boolean | null
          merkle_root: string | null
          metadata: Json | null
          nullifier_hash: string | null
          proof: Json | null
          reward_amount: number | null
          signal_hash: string | null
          updated_at: string | null
          user_id: string | null
          verification_level: string | null
          verified_at: string | null
        }
        Relationships: []
      }
      geographic_hotspots: {
        Row: {
          active_users: number | null
          avg_age: number | null
          last_activity: string | null
          s2_cell_id: string | null
          s2_level: number | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      performance_metrics_daily: {
        Row: {
          avg_value: number | null
          date: string | null
          max_value: number | null
          median_value: number | null
          metric_name: string | null
          min_value: number | null
          p95_value: number | null
          total_count: number | null
        }
        Relationships: []
      }
      unresolved_errors_summary: {
        Row: {
          category: string | null
          last_error_at: string | null
          severity: string | null
          total_errors: number | null
        }
        Relationships: []
      }
      user_staking_summary: {
        Row: {
          active_stakes: number | null
          avg_reward_percentage: number | null
          completed_stakes: number | null
          total_staked: number | null
          total_stakes: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staking_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      web_vitals_daily: {
        Row: {
          avg_cls: number | null
          avg_fcp: number | null
          avg_fid: number | null
          avg_lcp: number | null
          avg_ttfb: number | null
          date: string | null
          good_cls_count: number | null
          good_fcp_count: number | null
          good_fid_count: number | null
          good_lcp_count: number | null
          good_ttfb_count: number | null
          total_measurements: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      check_summary_rate_limit: {
        Args: { p_max_per_day?: number; p_user_id: string }
        Returns: boolean
      }
      cleanup_old_summaries: { Args: never; Returns: undefined }
      count_users_per_cell: {
        Args: never
        Returns: {
          level: number
          s2_cell_id: string
          user_count: number
        }[]
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      find_couples_by_compatibility: {
        Args: { couple_id: string; limit_count?: number }
        Returns: {
          compatibility_score: number
          couple_bio: string
          couple_interests: string[]
          couple_name: string
          id: string
          shared_interests: string[]
        }[]
      }
      find_couples_by_proximity: {
        Args: {
          lat: number
          limit_count?: number
          lng: number
          max_distance?: number
        }
        Returns: {
          couple_bio: string
          couple_interests: string[]
          couple_name: string
          distance_km: number
          id: string
          latitude: number
          location: string
          longitude: number
        }[]
      }
      generate_referral_code: { Args: { user_id: string }; Returns: string }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_ai_compatibility_score: {
        Args: { p_user1_id: string; p_user2_id: string }
        Returns: number
      }
      get_cached_summary: {
        Args: { p_chat_id: string }
        Returns: {
          created_at: string
          id: string
          message_count: number
          method: string
          sentiment: string
          summary: string
          topics: Json
        }[]
      }
      get_model_stats: {
        Args: { p_model_version: string; p_period_hours?: number }
        Returns: {
          avg_score: number
          cache_hit_rate: number
          error_count: number
          total_predictions: number
        }[]
      }
      get_profiles_in_cells: {
        Args: { cell_ids: string[]; limit_count?: number }
        Returns: {
          account_type: string
          age: number
          id: string
          latitude: number
          longitude: number
          name: string
          s2_cell_id: string
          updated_at: string
        }[]
      }
      get_summary_stats: {
        Args: { p_period_days?: number }
        Returns: {
          avg_message_count: number
          bart_count: number
          fallback_count: number
          gpt4_count: number
          negative_sentiment_pct: number
          neutral_sentiment_pct: number
          positive_sentiment_pct: number
          total_summaries: number
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_askml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geom: unknown }; Returns: number }
        | { Args: { geog: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

