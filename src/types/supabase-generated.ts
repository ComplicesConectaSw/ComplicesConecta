export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
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
      apk_downloads: {
        Row: {
          created_at: string | null
          download_source: string | null
          id: number
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          download_source?: string | null
          id?: number
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          download_source?: string | null
          id?: number
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
          version?: string | null
        }
        Relationships: []
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
      app_metrics: {
        Row: {
          created_at: string | null
          id: number
          metadata: Json | null
          metric_name: string
          metric_type: string | null
          metric_value: number
          recorded_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          metadata?: Json | null
          metric_name: string
          metric_type?: string | null
          metric_value: number
          recorded_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          metadata?: Json | null
          metric_name?: string
          metric_type?: string | null
          metric_value?: number
          recorded_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_description: string
          action_type: string
          created_at: string
          fraud_score: number | null
          id: string
          ip_address: unknown
          request_data: Json | null
          resource_id: string | null
          resource_type: string | null
          response_data: Json | null
          risk_level: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          created_at?: string
          fraud_score?: number | null
          id?: string
          ip_address?: unknown
          request_data?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          response_data?: Json | null
          risk_level?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          created_at?: string
          fraud_score?: number | null
          id?: string
          ip_address?: unknown
          request_data?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          response_data?: Json | null
          risk_level?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          enabled: boolean | null
          execution_count: number | null
          id: string
          last_executed_at: string | null
          name: string
          priority: number | null
          trigger: string
          updated_at: string | null
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          execution_count?: number | null
          id?: string
          last_executed_at?: string | null
          name: string
          priority?: number | null
          trigger: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          execution_count?: number | null
          id?: string
          last_executed_at?: string | null
          name?: string
          priority?: number | null
          trigger?: string
          updated_at?: string | null
        }
        Relationships: []
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
          blocked_by: string
          duration: string
          expires_at: string | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          reason: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_by: string
          duration: string
          expires_at?: string | null
          id?: string
          ip_address: unknown
          is_active?: boolean | null
          reason: string
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string
          duration?: string
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          reason?: string
        }
        Relationships: []
      }
      career_applications: {
        Row: {
          correo: string
          created_at: string | null
          cv_url: string | null
          domicilio: string | null
          expectativas: string
          experiencia: string
          id: string
          nombre: string
          notes: string | null
          puesto: string
          referencias: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          telefono: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          correo: string
          created_at?: string | null
          cv_url?: string | null
          domicilio?: string | null
          expectativas: string
          experiencia: string
          id?: string
          nombre: string
          notes?: string | null
          puesto: string
          referencias?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          telefono: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          correo?: string
          created_at?: string | null
          cv_url?: string | null
          domicilio?: string | null
          expectativas?: string
          experiencia?: string
          id?: string
          nombre?: string
          notes?: string | null
          puesto?: string
          referencias?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          telefono?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_invitations: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          invited_user: string | null
          room_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          invited_user?: string | null
          room_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          invited_user?: string | null
          room_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_invitations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_members: {
        Row: {
          id: string
          joined_at: string | null
          profile_id: string | null
          role: string | null
          room_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          profile_id?: string | null
          role?: string | null
          room_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          profile_id?: string | null
          role?: string | null
          room_id?: string | null
        }
        Relationships: [
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
          created_at: string | null
          id: string
          message_type: string | null
          room_id: string | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          room_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          room_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
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
          description: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      club_checkins: {
        Row: {
          club_id: string
          created_at: string
          distance_meters: number
          id: string
          is_verified: boolean | null
          latitude: number
          longitude: number
          metadata: Json | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          club_id: string
          created_at?: string
          distance_meters: number
          id?: string
          is_verified?: boolean | null
          latitude: number
          longitude: number
          metadata?: Json | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          club_id?: string
          created_at?: string
          distance_meters?: number
          id?: string
          is_verified?: boolean | null
          latitude?: number
          longitude?: number
          metadata?: Json | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_checkins_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_flyers: {
        Row: {
          ai_processing_status: string | null
          blur_applied: boolean | null
          club_id: string
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string | null
          event_end_date: string | null
          id: string
          image_url: string
          image_url_blurred: string | null
          image_url_watermarked: string | null
          is_active: boolean | null
          is_featured: boolean | null
          metadata: Json | null
          title: string
          updated_at: string
          watermark_applied: boolean | null
        }
        Insert: {
          ai_processing_status?: string | null
          blur_applied?: boolean | null
          club_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string | null
          event_end_date?: string | null
          id?: string
          image_url: string
          image_url_blurred?: string | null
          image_url_watermarked?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          title: string
          updated_at?: string
          watermark_applied?: boolean | null
        }
        Update: {
          ai_processing_status?: string | null
          blur_applied?: boolean | null
          club_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string | null
          event_end_date?: string | null
          id?: string
          image_url?: string
          image_url_blurred?: string | null
          image_url_watermarked?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          title?: string
          updated_at?: string
          watermark_applied?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "club_flyers_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_reviews: {
        Row: {
          checkin_id: string | null
          club_id: string
          created_at: string
          has_verified_checkin: boolean | null
          helpful_count: number | null
          id: string
          images: Json | null
          is_featured: boolean | null
          is_verified: boolean | null
          metadata: Json | null
          rating: number
          review_text: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_id?: string | null
          club_id: string
          created_at?: string
          has_verified_checkin?: boolean | null
          helpful_count?: number | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          metadata?: Json | null
          rating: number
          review_text: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_id?: string | null
          club_id?: string
          created_at?: string
          has_verified_checkin?: boolean | null
          helpful_count?: number | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          metadata?: Json | null
          rating?: number
          review_text?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_reviews_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "club_checkins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_reviews_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_verifications: {
        Row: {
          club_id: string
          created_at: string
          documents: Json | null
          expires_at: string | null
          id: string
          notes: string | null
          status: string
          updated_at: string
          verification_type: string
          verified_at: string | null
          verified_by: string
        }
        Insert: {
          club_id: string
          created_at?: string
          documents?: Json | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          verification_type: string
          verified_at?: string | null
          verified_by: string
        }
        Update: {
          club_id?: string
          created_at?: string
          documents?: Json | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          verification_type?: string
          verified_at?: string | null
          verified_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_verifications_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          address: string
          check_in_count: number | null
          check_in_radius_meters: number | null
          city: string
          country: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          latitude: number
          logo_url: string | null
          longitude: number
          metadata: Json | null
          name: string
          phone: string | null
          rating_average: number | null
          rating_count: number | null
          review_count: number | null
          slug: string
          state: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          address: string
          check_in_count?: number | null
          check_in_radius_meters?: number | null
          city: string
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude: number
          logo_url?: string | null
          longitude: number
          metadata?: Json | null
          name: string
          phone?: string | null
          rating_average?: number | null
          rating_count?: number | null
          review_count?: number | null
          slug: string
          state?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          check_in_count?: number | null
          check_in_radius_meters?: number | null
          city?: string
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number
          logo_url?: string | null
          longitude?: number
          metadata?: Json | null
          name?: string
          phone?: string | null
          rating_average?: number | null
          rating_count?: number | null
          review_count?: number | null
          slug?: string
          state?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: []
      }
      cmpx_purchases: {
        Row: {
          bonus_cmpx: number | null
          cmpx_amount: number
          completed_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          notes: string | null
          package_id: string | null
          payment_method: string | null
          payment_status: string
          price_mxn: number
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          tokens_awarded: boolean | null
          tokens_awarded_at: string | null
          total_cmpx: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bonus_cmpx?: number | null
          cmpx_amount: number
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          package_id?: string | null
          payment_method?: string | null
          payment_status?: string
          price_mxn: number
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          tokens_awarded?: boolean | null
          tokens_awarded_at?: string | null
          total_cmpx: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bonus_cmpx?: number | null
          cmpx_amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          package_id?: string | null
          payment_method?: string | null
          payment_status?: string
          price_mxn?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          tokens_awarded?: boolean | null
          tokens_awarded_at?: string | null
          total_cmpx?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cmpx_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "cmpx_shop_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      cmpx_shop_packages: {
        Row: {
          bonus_cmpx: number | null
          cmpx_amount: number
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price_mxn: number
          price_usd: number | null
          updated_at: string
        }
        Insert: {
          bonus_cmpx?: number | null
          cmpx_amount: number
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price_mxn: number
          price_usd?: number | null
          updated_at?: string
        }
        Update: {
          bonus_cmpx?: number | null
          cmpx_amount?: number
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price_mxn?: number
          price_usd?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          profile_id: string | null
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          profile_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          profile_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compatibility_scores: {
        Row: {
          compatibility_score: number | null
          id: number
          last_calculated: string | null
          shared_interests: number | null
          total_interests: number | null
          user1_id: string | null
          user2_id: string | null
        }
        Insert: {
          compatibility_score?: number | null
          id?: number
          last_calculated?: string | null
          shared_interests?: number | null
          total_interests?: number | null
          user1_id?: string | null
          user2_id?: string | null
        }
        Update: {
          compatibility_score?: number | null
          id?: number
          last_calculated?: string | null
          shared_interests?: number | null
          total_interests?: number | null
          user1_id?: string | null
          user2_id?: string | null
        }
        Relationships: []
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
      content_moderation: {
        Row: {
          ai_confidence: number | null
          content_id: string
          content_type: string
          created_at: string
          id: string
          metadata: Json | null
          moderator_id: string | null
          reason: string | null
          reviewed_at: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          ai_confidence?: number | null
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          moderator_id?: string | null
          reason?: string | null
          reviewed_at?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          ai_confidence?: number | null
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          moderator_id?: string | null
          reason?: string | null
          reviewed_at?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      couple_events: {
        Row: {
          cmpx_reward: number | null
          co2_saved: number | null
          couple_id: string | null
          created_at: string | null
          current_participants: number | null
          date: string
          description: string
          event_type: string
          id: string
          is_public: boolean | null
          is_vip: boolean | null
          location: string
          max_participants: number | null
          participants: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cmpx_reward?: number | null
          co2_saved?: number | null
          couple_id?: string | null
          created_at?: string | null
          current_participants?: number | null
          date: string
          description: string
          event_type: string
          id?: string
          is_public?: boolean | null
          is_vip?: boolean | null
          location: string
          max_participants?: number | null
          participants?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cmpx_reward?: number | null
          co2_saved?: number | null
          couple_id?: string | null
          created_at?: string | null
          current_participants?: number | null
          date?: string
          description?: string
          event_type?: string
          id?: string
          is_public?: boolean | null
          is_vip?: boolean | null
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
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_events_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_events_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_events_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_favorites: {
        Row: {
          couple_id: string | null
          created_at: string | null
          favorite_couple_id: string | null
          id: string
        }
        Insert: {
          couple_id?: string | null
          created_at?: string | null
          favorite_couple_id?: string | null
          id?: string
        }
        Update: {
          couple_id?: string | null
          created_at?: string | null
          favorite_couple_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_favorites_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_favorites_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_favorites_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_favorites_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_favorites_favorite_couple_id_fkey"
            columns: ["favorite_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_favorites_favorite_couple_id_fkey"
            columns: ["favorite_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_favorites_favorite_couple_id_fkey"
            columns: ["favorite_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_favorites_favorite_couple_id_fkey"
            columns: ["favorite_couple_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_gifts: {
        Row: {
          created_at: string | null
          delivery_date: string | null
          gift_description: string | null
          gift_name: string
          gift_type: string
          gift_value: number | null
          id: string
          is_delivered: boolean | null
          receiver_couple_id: string | null
          sender_couple_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_date?: string | null
          gift_description?: string | null
          gift_name: string
          gift_type: string
          gift_value?: number | null
          id?: string
          is_delivered?: boolean | null
          receiver_couple_id?: string | null
          sender_couple_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_date?: string | null
          gift_description?: string | null
          gift_name?: string
          gift_type?: string
          gift_value?: number | null
          id?: string
          is_delivered?: boolean | null
          receiver_couple_id?: string | null
          sender_couple_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_gifts_receiver_couple_id_fkey"
            columns: ["receiver_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_gifts_receiver_couple_id_fkey"
            columns: ["receiver_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_gifts_receiver_couple_id_fkey"
            columns: ["receiver_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_gifts_receiver_couple_id_fkey"
            columns: ["receiver_couple_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_gifts_sender_couple_id_fkey"
            columns: ["sender_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_gifts_sender_couple_id_fkey"
            columns: ["sender_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_gifts_sender_couple_id_fkey"
            columns: ["sender_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_gifts_sender_couple_id_fkey"
            columns: ["sender_couple_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_interactions: {
        Row: {
          couple_id: string | null
          created_at: string | null
          id: string
          interaction_type: string
          metadata: Json | null
          target_couple_id: string | null
        }
        Insert: {
          couple_id?: string | null
          created_at?: string | null
          id?: string
          interaction_type: string
          metadata?: Json | null
          target_couple_id?: string | null
        }
        Update: {
          couple_id?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          metadata?: Json | null
          target_couple_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_interactions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_interactions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_interactions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_interactions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_interactions_target_couple_id_fkey"
            columns: ["target_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_interactions_target_couple_id_fkey"
            columns: ["target_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_interactions_target_couple_id_fkey"
            columns: ["target_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_interactions_target_couple_id_fkey"
            columns: ["target_couple_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_matches: {
        Row: {
          compatibility_factors: Json | null
          couple1_id: string | null
          couple2_id: string | null
          created_at: string | null
          id: string
          match_reasons: string[] | null
          match_score: number | null
          status: string
        }
        Insert: {
          compatibility_factors?: Json | null
          couple1_id?: string | null
          couple2_id?: string | null
          created_at?: string | null
          id?: string
          match_reasons?: string[] | null
          match_score?: number | null
          status: string
        }
        Update: {
          compatibility_factors?: Json | null
          couple1_id?: string | null
          couple2_id?: string | null
          created_at?: string | null
          id?: string
          match_reasons?: string[] | null
          match_score?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_matches_couple1_id_fkey"
            columns: ["couple1_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_matches_couple1_id_fkey"
            columns: ["couple1_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_matches_couple1_id_fkey"
            columns: ["couple1_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_matches_couple1_id_fkey"
            columns: ["couple1_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_matches_couple2_id_fkey"
            columns: ["couple2_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_matches_couple2_id_fkey"
            columns: ["couple2_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_matches_couple2_id_fkey"
            columns: ["couple2_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_matches_couple2_id_fkey"
            columns: ["couple2_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_messages: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          message_type: string
          receiver_couple_id: string | null
          sender_couple_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          message_type: string
          receiver_couple_id?: string | null
          sender_couple_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          message_type?: string
          receiver_couple_id?: string | null
          sender_couple_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_messages_receiver_couple_id_fkey"
            columns: ["receiver_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_messages_receiver_couple_id_fkey"
            columns: ["receiver_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_messages_receiver_couple_id_fkey"
            columns: ["receiver_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_messages_receiver_couple_id_fkey"
            columns: ["receiver_couple_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_messages_sender_couple_id_fkey"
            columns: ["sender_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_messages_sender_couple_id_fkey"
            columns: ["sender_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_messages_sender_couple_id_fkey"
            columns: ["sender_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_messages_sender_couple_id_fkey"
            columns: ["sender_couple_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_profile_likes: {
        Row: {
          couple_profile_id: string
          id: string
          liked_at: string | null
          liker_profile_id: string
        }
        Insert: {
          couple_profile_id: string
          id?: string
          liked_at?: string | null
          liker_profile_id: string
        }
        Update: {
          couple_profile_id?: string
          id?: string
          liked_at?: string | null
          liker_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_profile_likes_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_likes_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_likes_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_likes_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_likes_liker_profile_id_fkey"
            columns: ["liker_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      couple_profile_matches: {
        Row: {
          couple_profile1_id: string
          couple_profile2_id: string
          id: string
          is_active: boolean | null
          last_interaction: string | null
          matched_at: string | null
        }
        Insert: {
          couple_profile1_id: string
          couple_profile2_id: string
          id?: string
          is_active?: boolean | null
          last_interaction?: string | null
          matched_at?: string | null
        }
        Update: {
          couple_profile1_id?: string
          couple_profile2_id?: string
          id?: string
          is_active?: boolean | null
          last_interaction?: string | null
          matched_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_profile_matches_couple_profile1_id_fkey"
            columns: ["couple_profile1_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_matches_couple_profile1_id_fkey"
            columns: ["couple_profile1_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_matches_couple_profile1_id_fkey"
            columns: ["couple_profile1_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_matches_couple_profile1_id_fkey"
            columns: ["couple_profile1_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_matches_couple_profile2_id_fkey"
            columns: ["couple_profile2_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_matches_couple_profile2_id_fkey"
            columns: ["couple_profile2_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_matches_couple_profile2_id_fkey"
            columns: ["couple_profile2_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_matches_couple_profile2_id_fkey"
            columns: ["couple_profile2_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_profile_reports: {
        Row: {
          couple_profile_id: string
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_profile_id: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          couple_profile_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_profile_id: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          couple_profile_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_profile_id?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_profile_reports_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_reports_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_reports_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_reports_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_reports_reporter_profile_id_fkey"
            columns: ["reporter_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "couple_profile_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      couple_profile_views: {
        Row: {
          couple_profile_id: string
          id: string
          viewed_at: string | null
          viewed_date: string | null
          viewer_profile_id: string
        }
        Insert: {
          couple_profile_id: string
          id?: string
          viewed_at?: string | null
          viewed_date?: string | null
          viewer_profile_id: string
        }
        Update: {
          couple_profile_id?: string
          id?: string
          viewed_at?: string | null
          viewed_date?: string | null
          viewer_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_profile_views_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_views_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_views_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_views_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profile_views_viewer_profile_id_fkey"
            columns: ["viewer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      couple_profiles: {
        Row: {
          couple_bio: string | null
          couple_images: string[] | null
          couple_name: string
          created_at: string | null
          id: string
          is_premium: boolean | null
          is_verified: boolean | null
          partner1_id: string
          partner2_id: string
          preferences: Json | null
          relationship_type: Database["public"]["Enums"]["relationship_type"]
          updated_at: string | null
        }
        Insert: {
          couple_bio?: string | null
          couple_images?: string[] | null
          couple_name: string
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          is_verified?: boolean | null
          partner1_id: string
          partner2_id: string
          preferences?: Json | null
          relationship_type: Database["public"]["Enums"]["relationship_type"]
          updated_at?: string | null
        }
        Update: {
          couple_bio?: string | null
          couple_images?: string[] | null
          couple_name?: string
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          is_verified?: boolean | null
          partner1_id?: string
          partner2_id?: string
          preferences?: Json | null
          relationship_type?: Database["public"]["Enums"]["relationship_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_profiles_partner1_id_fkey"
            columns: ["partner1_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profiles_partner2_id_fkey"
            columns: ["partner2_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_reports: {
        Row: {
          created_at: string | null
          id: string
          report_description: string | null
          report_reason: string
          reported_couple_id: string | null
          reporter_couple_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          report_description?: string | null
          report_reason: string
          reported_couple_id?: string | null
          reporter_couple_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status: string
        }
        Update: {
          created_at?: string | null
          id?: string
          report_description?: string | null
          report_reason?: string
          reported_couple_id?: string | null
          reporter_couple_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_reports_reported_couple_id_fkey"
            columns: ["reported_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_reports_reported_couple_id_fkey"
            columns: ["reported_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_reports_reported_couple_id_fkey"
            columns: ["reported_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_reports_reported_couple_id_fkey"
            columns: ["reported_couple_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_reports_reporter_couple_id_fkey"
            columns: ["reporter_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_reports_reporter_couple_id_fkey"
            columns: ["reporter_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_reports_reporter_couple_id_fkey"
            columns: ["reporter_couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_reports_reporter_couple_id_fkey"
            columns: ["reporter_couple_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_statistics: {
        Row: {
          couple_id: string | null
          created_at: string | null
          date: string
          events_created: number | null
          events_joined: number | null
          id: string
          likes: number | null
          matches: number | null
          messages: number | null
          views: number | null
        }
        Insert: {
          couple_id?: string | null
          created_at?: string | null
          date: string
          events_created?: number | null
          events_joined?: number | null
          id?: string
          likes?: number | null
          matches?: number | null
          messages?: number | null
          views?: number | null
        }
        Update: {
          couple_id?: string | null
          created_at?: string | null
          date?: string
          events_created?: number | null
          events_joined?: number | null
          id?: string
          likes?: number | null
          matches?: number | null
          messages?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_statistics_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_statistics_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_statistics_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_statistics_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_verifications: {
        Row: {
          couple_id: string | null
          created_at: string | null
          id: string
          verification_data: Json | null
          verification_status: string
          verification_type: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          couple_id?: string | null
          created_at?: string | null
          id?: string
          verification_data?: Json | null
          verification_status: string
          verification_type: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          couple_id?: string | null
          created_at?: string | null
          id?: string
          verification_data?: Json | null
          verification_status?: string
          verification_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_verifications_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profile_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_verifications_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_verifications_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_verifications_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "popular_couple_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_fingerprints: {
        Row: {
          ban_reason: string | null
          banned_at: string | null
          browser_fingerprint: string | null
          canvas_data: string | null
          canvas_hash: string
          combined_hash: string
          created_at: string
          first_seen_at: string
          id: string
          ip_address: unknown
          is_banned: boolean | null
          language: string | null
          last_seen_at: string
          metadata: Json | null
          platform: string | null
          screen_resolution: string | null
          seen_count: number | null
          timezone: string | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
          worldid_nullifier_hash: string | null
        }
        Insert: {
          ban_reason?: string | null
          banned_at?: string | null
          browser_fingerprint?: string | null
          canvas_data?: string | null
          canvas_hash: string
          combined_hash: string
          created_at?: string
          first_seen_at?: string
          id?: string
          ip_address?: unknown
          is_banned?: boolean | null
          language?: string | null
          last_seen_at?: string
          metadata?: Json | null
          platform?: string | null
          screen_resolution?: string | null
          seen_count?: number | null
          timezone?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          worldid_nullifier_hash?: string | null
        }
        Update: {
          ban_reason?: string | null
          banned_at?: string | null
          browser_fingerprint?: string | null
          canvas_data?: string | null
          canvas_hash?: string
          combined_hash?: string
          created_at?: string
          first_seen_at?: string
          id?: string
          ip_address?: unknown
          is_banned?: boolean | null
          language?: string | null
          last_seen_at?: string
          metadata?: Json | null
          platform?: string | null
          screen_resolution?: string | null
          seen_count?: number | null
          timezone?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          worldid_nullifier_hash?: string | null
        }
        Relationships: []
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
      event_participations: {
        Row: {
          cmpx_rewarded: number
          co2_saved: number
          created_at: string
          event_id: string
          id: string
          participated_at: string
          user_id: string
        }
        Insert: {
          cmpx_rewarded?: number
          co2_saved?: number
          created_at?: string
          event_id: string
          id?: string
          participated_at?: string
          user_id: string
        }
        Update: {
          cmpx_rewarded?: number
          co2_saved?: number
          created_at?: string
          event_id?: string
          id?: string
          participated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "couple_events"
            referencedColumns: ["id"]
          },
        ]
      }
      explicit_preferences: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          name: string
          requires_verification: boolean | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          requires_verification?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          requires_verification?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: number
          is_active: boolean | null
          order_index: number | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          order_index?: number | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          order_index?: number | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          follower_user_id: string
          following_user_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_user_id: string
          following_user_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_user_id?: string
          following_user_id?: string
          id?: string
        }
        Relationships: []
      }
      fraud_analysis: {
        Row: {
          analysis_data: Json | null
          confidence: number
          created_at: string | null
          id: string
          is_fraudulent: boolean
          patterns: string[] | null
          risk_factors: string[] | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          confidence: number
          created_at?: string | null
          id?: string
          is_fraudulent: boolean
          patterns?: string[] | null
          risk_factors?: string[] | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          confidence?: number
          created_at?: string | null
          id?: string
          is_fraudulent?: boolean
          patterns?: string[] | null
          risk_factors?: string[] | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gallery_access_requests: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          requested_from: string | null
          requester_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          requested_from?: string | null
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          requested_from?: string | null
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gallery_commissions: {
        Row: {
          amount_cmpx: number
          commission_amount_cmpx: number
          commission_percentage: number
          created_at: string
          creator_amount_cmpx: number
          creator_id: string
          creator_paid: boolean | null
          creator_paid_at: string | null
          gallery_id: string
          id: string
          metadata: Json | null
          notes: string | null
          platform_received: boolean | null
          platform_received_at: string | null
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount_cmpx: number
          commission_amount_cmpx: number
          commission_percentage?: number
          created_at?: string
          creator_amount_cmpx: number
          creator_id: string
          creator_paid?: boolean | null
          creator_paid_at?: string | null
          gallery_id: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          platform_received?: boolean | null
          platform_received_at?: string | null
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount_cmpx?: number
          commission_amount_cmpx?: number
          commission_percentage?: number
          created_at?: string
          creator_amount_cmpx?: number
          creator_id?: string
          creator_paid?: boolean | null
          creator_paid_at?: string | null
          gallery_id?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          platform_received?: boolean | null
          platform_received_at?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_permissions: {
        Row: {
          created_at: string | null
          granted_by: string | null
          granted_to: string | null
          id: string
          permission_type: string | null
          profile_id: string | null
        }
        Insert: {
          created_at?: string | null
          granted_by?: string | null
          granted_to?: string | null
          id?: string
          permission_type?: string | null
          profile_id?: string | null
        }
        Update: {
          created_at?: string | null
          granted_by?: string | null
          granted_to?: string | null
          id?: string
          permission_type?: string | null
          profile_id?: string | null
        }
        Relationships: []
      }
      image_permissions: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          granted_to: string | null
          id: string
          image_id: string | null
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          granted_to?: string | null
          id?: string
          image_id?: string | null
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          granted_to?: string | null
          id?: string
          image_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_permissions_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          created_at: string | null
          id: string
          is_featured: boolean | null
          is_primary: boolean | null
          is_public: boolean | null
          is_verified: boolean | null
          profile_id: string | null
          sort_order: number | null
          type: string | null
          updated_at: string | null
          uploaded_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_primary?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          profile_id?: string | null
          sort_order?: number | null
          type?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_primary?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          profile_id?: string | null
          sort_order?: number | null
          type?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          url?: string
        }
        Relationships: []
      }
      investment_returns: {
        Row: {
          created_at: string
          due_date: string
          id: string
          investment_id: string
          metadata: Json | null
          notes: string | null
          paid_at: string | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string
          return_amount_mxn: number
          return_percentage: number
          return_period_end: string
          return_period_start: string
          status: string
          stripe_payout_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          investment_id: string
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          return_amount_mxn: number
          return_percentage: number
          return_period_end: string
          return_period_start: string
          status?: string
          stripe_payout_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          investment_id?: string
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          return_amount_mxn?: number
          return_percentage?: number
          return_period_end?: string
          return_period_start?: string
          status?: string
          stripe_payout_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_returns_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_tiers: {
        Row: {
          amount_mxn: number
          benefits: Json | null
          cmpx_tokens_rewarded: number
          created_at: string
          description: string | null
          display_order: number | null
          equity_percentage: number | null
          id: string
          includes_equity: boolean | null
          includes_vip_dinner: boolean | null
          is_active: boolean | null
          name: string
          return_percentage: number
          return_type: string
          tier_key: string
          updated_at: string
        }
        Insert: {
          amount_mxn: number
          benefits?: Json | null
          cmpx_tokens_rewarded?: number
          created_at?: string
          description?: string | null
          display_order?: number | null
          equity_percentage?: number | null
          id?: string
          includes_equity?: boolean | null
          includes_vip_dinner?: boolean | null
          is_active?: boolean | null
          name: string
          return_percentage?: number
          return_type?: string
          tier_key: string
          updated_at?: string
        }
        Update: {
          amount_mxn?: number
          benefits?: Json | null
          cmpx_tokens_rewarded?: number
          created_at?: string
          description?: string | null
          display_order?: number | null
          equity_percentage?: number | null
          id?: string
          includes_equity?: boolean | null
          includes_vip_dinner?: boolean | null
          is_active?: boolean | null
          name?: string
          return_percentage?: number
          return_type?: string
          tier_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          activated_at: string | null
          amount_mxn: number
          amount_usd: number | null
          benefits: Json | null
          cmpx_tokens_rewarded: number | null
          completed_at: string | null
          contract_signed: boolean | null
          contract_signed_at: string | null
          created_at: string
          currency: string | null
          equity_percentage: number | null
          id: string
          includes_equity: boolean | null
          includes_vip_dinner: boolean | null
          metadata: Json | null
          notes: string | null
          payment_method: string | null
          payment_status: string
          return_percentage: number
          return_type: string
          safte_contract_url: string | null
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          amount_mxn: number
          amount_usd?: number | null
          benefits?: Json | null
          cmpx_tokens_rewarded?: number | null
          completed_at?: string | null
          contract_signed?: boolean | null
          contract_signed_at?: string | null
          created_at?: string
          currency?: string | null
          equity_percentage?: number | null
          id?: string
          includes_equity?: boolean | null
          includes_vip_dinner?: boolean | null
          metadata?: Json | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          return_percentage?: number
          return_type?: string
          safte_contract_url?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          tier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          amount_mxn?: number
          amount_usd?: number | null
          benefits?: Json | null
          cmpx_tokens_rewarded?: number | null
          completed_at?: string | null
          contract_signed?: boolean | null
          contract_signed_at?: string | null
          created_at?: string
          currency?: string | null
          equity_percentage?: number | null
          id?: string
          includes_equity?: boolean | null
          includes_vip_dinner?: boolean | null
          metadata?: Json | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          return_percentage?: number
          return_type?: string
          safte_contract_url?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invitation_analytics: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          invitation_id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          invitation_id: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          invitation_id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_analytics_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_responses: {
        Row: {
          counter_invitation_id: string | null
          created_at: string | null
          id: string
          invitation_id: string
          message: string | null
          metadata: Json | null
          response_type: string
        }
        Insert: {
          counter_invitation_id?: string | null
          created_at?: string | null
          id?: string
          invitation_id: string
          message?: string | null
          metadata?: Json | null
          response_type: string
        }
        Update: {
          counter_invitation_id?: string | null
          created_at?: string | null
          id?: string
          invitation_id?: string
          message?: string | null
          metadata?: Json | null
          response_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_responses_counter_invitation_id_fkey"
            columns: ["counter_invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_responses_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: true
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_statistics: {
        Row: {
          acceptance_rate: number | null
          accepted_invitations: number | null
          created_at: string | null
          declined_invitations: number | null
          expired_invitations: number | null
          id: string
          metadata: Json | null
          pending_invitations: number | null
          period_end: string
          period_start: string
          total_invitations: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acceptance_rate?: number | null
          accepted_invitations?: number | null
          created_at?: string | null
          declined_invitations?: number | null
          expired_invitations?: number | null
          id?: string
          metadata?: Json | null
          pending_invitations?: number | null
          period_end: string
          period_start: string
          total_invitations?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acceptance_rate?: number | null
          accepted_invitations?: number | null
          created_at?: string | null
          declined_invitations?: number | null
          expired_invitations?: number | null
          id?: string
          metadata?: Json | null
          pending_invitations?: number | null
          period_end?: string
          period_start?: string
          total_invitations?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_statistics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          invitation_type: string
          is_active: boolean | null
          template_content: string
          template_name: string
          updated_at: string | null
          usage_count: number | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          invitation_type: string
          is_active?: boolean | null
          template_content: string
          template_name: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          invitation_type?: string
          is_active?: boolean | null
          template_content?: string
          template_name?: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string | null
          from_profile: string | null
          id: string
          message: string | null
          status: string | null
          to_profile: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_profile?: string | null
          id?: string
          message?: string | null
          status?: string | null
          to_profile?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_profile?: string | null
          id?: string
          message?: string | null
          status?: string | null
          to_profile?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      match_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string | null
          match_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          match_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          match_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_interactions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          compatibility_score: number | null
          created_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          user1_id: string | null
          user2_id: string | null
        }
        Insert: {
          compatibility_score?: number | null
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user1_id?: string | null
          user2_id?: string | null
        }
        Update: {
          compatibility_score?: number | null
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user1_id?: string | null
          user2_id?: string | null
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
          access_type: string
          accessed_at: string | null
          action: string | null
          created_at: string | null
          id: string
          media_id: string | null
          user_id: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          action?: string | null
          created_at?: string | null
          id?: string
          media_id?: string | null
          user_id?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          action?: string | null
          created_at?: string | null
          id?: string
          media_id?: string | null
          user_id?: string | null
        }
        Relationships: [
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
          created_at: string | null
          id: string
          message_type: string | null
          room_id: string | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          room_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          room_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          action_type: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          moderator_id: string
          new_state: Json | null
          previous_state: Json | null
          severity: string | null
          target_id: string | null
          target_type: string
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          moderator_id: string
          new_state?: Json | null
          previous_state?: Json | null
          severity?: string | null
          target_id?: string | null
          target_type: string
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          moderator_id?: string
          new_state?: Json | null
          previous_state?: Json | null
          severity?: string | null
          target_id?: string | null
          target_type?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      moderator_payments: {
        Row: {
          actions_taken: number | null
          created_at: string
          id: string
          metadata: Json | null
          moderator_id: string
          moderator_level: string
          notes: string | null
          payment_amount_mxn: number
          payment_date: string | null
          payment_method: string | null
          payment_period_end: string
          payment_period_start: string
          payment_status: string
          quality_score: number | null
          reports_reviewed: number | null
          revenue_percentage: number
          stripe_payout_id: string | null
          total_minutes_worked: number | null
          total_revenue_mxn: number
          updated_at: string
        }
        Insert: {
          actions_taken?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          moderator_id: string
          moderator_level: string
          notes?: string | null
          payment_amount_mxn: number
          payment_date?: string | null
          payment_method?: string | null
          payment_period_end: string
          payment_period_start: string
          payment_status?: string
          quality_score?: number | null
          reports_reviewed?: number | null
          revenue_percentage: number
          stripe_payout_id?: string | null
          total_minutes_worked?: number | null
          total_revenue_mxn?: number
          updated_at?: string
        }
        Update: {
          actions_taken?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          moderator_id?: string
          moderator_level?: string
          notes?: string | null
          payment_amount_mxn?: number
          payment_date?: string | null
          payment_method?: string | null
          payment_period_end?: string
          payment_period_start?: string
          payment_status?: string
          quality_score?: number | null
          reports_reviewed?: number | null
          revenue_percentage?: number
          stripe_payout_id?: string | null
          total_minutes_worked?: number | null
          total_revenue_mxn?: number
          updated_at?: string
        }
        Relationships: []
      }
      moderator_requests: {
        Row: {
          acepta_terminos: boolean | null
          correo: string
          created_at: string | null
          disponibilidad_horario: string
          disponibilidad_horas: number
          edad: number
          experiencia_moderacion: string
          id: string
          motivacion: string
          nombre: string
          notes: string | null
          referencias: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          telefono: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          acepta_terminos?: boolean | null
          correo: string
          created_at?: string | null
          disponibilidad_horario: string
          disponibilidad_horas: number
          edad: number
          experiencia_moderacion: string
          id?: string
          motivacion: string
          nombre: string
          notes?: string | null
          referencias?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          telefono: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          acepta_terminos?: boolean | null
          correo?: string
          created_at?: string | null
          disponibilidad_horario?: string
          disponibilidad_horas?: number
          edad?: number
          experiencia_moderacion?: string
          id?: string
          motivacion?: string
          nombre?: string
          notes?: string | null
          referencias?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          telefono?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      moderator_sessions: {
        Row: {
          actions_taken: number | null
          created_at: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          moderator_id: string
          reports_reviewed: number | null
          session_end: string | null
          session_start: string
          total_minutes: number | null
          updated_at: string
        }
        Insert: {
          actions_taken?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          moderator_id: string
          reports_reviewed?: number | null
          session_end?: string | null
          session_start?: string
          total_minutes?: number | null
          updated_at?: string
        }
        Update: {
          actions_taken?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          moderator_id?: string
          reports_reviewed?: number | null
          session_end?: string | null
          session_start?: string
          total_minutes?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      moderators: {
        Row: {
          activated_at: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          level: string | null
          moderator_id: string | null
          notes: string | null
          permissions: Json | null
          role: string | null
          status: string | null
          suspended_at: string | null
          user_id: string | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          moderator_id?: string | null
          notes?: string | null
          permissions?: Json | null
          role?: string | null
          status?: string | null
          suspended_at?: string | null
          user_id?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          moderator_id?: string | null
          notes?: string | null
          permissions?: Json | null
          role?: string | null
          status?: string | null
          suspended_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      nft_verifications: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          minted_with_gtk: number
          network: string
          nft_contract_address: string
          nft_token_id: string
          staking_record_id: string | null
          updated_at: string
          user_id: string
          verified_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          minted_with_gtk: number
          network: string
          nft_contract_address: string
          nft_token_id: string
          staking_record_id?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          minted_with_gtk?: number
          network?: string
          nft_contract_address?: string
          nft_token_id?: string
          staking_record_id?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_verifications_staking_record_id_fkey"
            columns: ["staking_record_id"]
            isOneToOne: false
            referencedRelation: "staking_records"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_history: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          delivered_at: string | null
          delivery_method: string
          error_message: string | null
          id: string
          notification_type: string
          sent_at: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          delivered_at?: string | null
          delivery_method: string
          error_message?: string | null
          id?: string
          notification_type: string
          sent_at?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          delivered_at?: string | null
          delivery_method?: string
          error_message?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          delivery_method: string | null
          enabled: boolean | null
          id: string
          notification_type: string
          settings: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_method?: string | null
          enabled?: boolean | null
          id?: string
          notification_type: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_method?: string | null
          enabled?: boolean | null
          id?: string
          notification_type?: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: number
          is_read: boolean | null
          message: string
          read_at: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: number
          is_read?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: number
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pending_rewards: {
        Row: {
          amount: number
          claimed: boolean
          claimed_at: string | null
          created_at: string
          description: string
          expires_at: string | null
          id: string
          reward_type: string
          token_type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          reward_type: string
          token_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          reward_type?: string
          token_type?: string | null
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
      permanent_bans: {
        Row: {
          appeal_rejected_reason: string | null
          appeal_requested: boolean | null
          appeal_reviewed_at: string | null
          appeal_reviewed_by: string | null
          ban_reason: string
          ban_type: string
          banned_at: string
          banned_by: string | null
          canvas_hash: string | null
          combined_hash: string | null
          created_at: string
          evidence: Json | null
          fingerprint_ids: string[] | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          moderation_log_id: string | null
          notes: string | null
          severity: string
          updated_at: string
          user_id: string | null
          worldid_nullifier_hash: string | null
        }
        Insert: {
          appeal_rejected_reason?: string | null
          appeal_requested?: boolean | null
          appeal_reviewed_at?: string | null
          appeal_reviewed_by?: string | null
          ban_reason: string
          ban_type: string
          banned_at?: string
          banned_by?: string | null
          canvas_hash?: string | null
          combined_hash?: string | null
          created_at?: string
          evidence?: Json | null
          fingerprint_ids?: string[] | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          moderation_log_id?: string | null
          notes?: string | null
          severity: string
          updated_at?: string
          user_id?: string | null
          worldid_nullifier_hash?: string | null
        }
        Update: {
          appeal_rejected_reason?: string | null
          appeal_requested?: boolean | null
          appeal_reviewed_at?: string | null
          appeal_reviewed_by?: string | null
          ban_reason?: string
          ban_type?: string
          banned_at?: string
          banned_by?: string | null
          canvas_hash?: string | null
          combined_hash?: string | null
          created_at?: string
          evidence?: Json | null
          fingerprint_ids?: string[] | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          moderation_log_id?: string | null
          notes?: string | null
          severity?: string
          updated_at?: string
          user_id?: string | null
          worldid_nullifier_hash?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          deleted_at: string | null
          id: string
          likes_count: number
          parent_comment_id: string | null
          post_id: string
          profile_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          likes_count?: number
          parent_comment_id?: string | null
          post_id: string
          profile_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          likes_count?: number
          parent_comment_id?: string | null
          post_id?: string
          profile_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          profile_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          profile_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          profile_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_shares: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          profile_id: string | null
          share_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          profile_id?: string | null
          share_type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          profile_id?: string | null
          share_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_shares_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string | null
          deleted_at: string | null
          id: string
          image_url: string | null
          is_premium: boolean
          is_public: boolean
          likes_count: number
          location: string | null
          post_type: string
          profile_id: string | null
          shares_count: number
          updated_at: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          is_premium?: boolean
          is_public?: boolean
          likes_count?: number
          location?: string | null
          post_type?: string
          profile_id?: string | null
          shares_count?: number
          updated_at?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          is_premium?: boolean
          is_public?: boolean
          likes_count?: number
          location?: string | null
          post_type?: string
          profile_id?: string | null
          shares_count?: number
          updated_at?: string | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      predictive_match_scores: {
        Row: {
          compatibility_score: number
          confidence: number
          created_at: string
          emotional_score: number
          graph_score: number
          id: string
          matched_user_id: string
          reasons: string[] | null
          social_score: number
          total_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          compatibility_score: number
          confidence: number
          created_at?: string
          emotional_score: number
          graph_score: number
          id?: string
          matched_user_id: string
          reasons?: string[] | null
          social_score: number
          total_score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          compatibility_score?: number
          confidence?: number
          created_at?: string
          emotional_score?: number
          graph_score?: number
          id?: string
          matched_user_id?: string
          reasons?: string[] | null
          social_score?: number
          total_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_cache: {
        Row: {
          cache_key: string
          cached_data: Json
          created_at: string
          expires_at: string
          id: string
          profile_id: string
        }
        Insert: {
          cache_key: string
          cached_data: Json
          created_at?: string
          expires_at: string
          id?: string
          profile_id: string
        }
        Update: {
          cache_key?: string
          cached_data?: Json
          created_at?: string
          expires_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_cache_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string | null
          age: number | null
          age_range_max: number | null
          age_range_min: number | null
          avatar_url: string | null
          bio: string | null
          blocked_at: string | null
          blocked_reason: string | null
          created_at: string | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          id: string
          interested_in: string | null
          interests: string[] | null
          is_active: boolean | null
          is_admin: boolean | null
          is_blocked: boolean | null
          is_demo: boolean | null
          is_online: boolean | null
          is_premium: boolean | null
          is_verified: boolean | null
          last_name: string | null
          latitude: number | null
          lifestyle_preferences: Json | null
          location: string | null
          location_preferences: Json | null
          longitude: number | null
          looking_for: string | null
          max_distance: number | null
          name: string
          personality_traits: Json | null
          role: string | null
          s2_cell_id: string | null
          s2_level: number | null
          suspension_end_date: string | null
          swinger_experience: string | null
          updated_at: string | null
          user_id: string
          warnings_count: number | null
        }
        Insert: {
          account_type?: string | null
          age?: number | null
          age_range_max?: number | null
          age_range_min?: number | null
          avatar_url?: string | null
          bio?: string | null
          blocked_at?: string | null
          blocked_reason?: string | null
          created_at?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          interested_in?: string | null
          interests?: string[] | null
          is_active?: boolean | null
          is_admin?: boolean | null
          is_blocked?: boolean | null
          is_demo?: boolean | null
          is_online?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          last_name?: string | null
          latitude?: number | null
          lifestyle_preferences?: Json | null
          location?: string | null
          location_preferences?: Json | null
          longitude?: number | null
          looking_for?: string | null
          max_distance?: number | null
          name: string
          personality_traits?: Json | null
          role?: string | null
          s2_cell_id?: string | null
          s2_level?: number | null
          suspension_end_date?: string | null
          swinger_experience?: string | null
          updated_at?: string | null
          user_id: string
          warnings_count?: number | null
        }
        Update: {
          account_type?: string | null
          age?: number | null
          age_range_max?: number | null
          age_range_min?: number | null
          avatar_url?: string | null
          bio?: string | null
          blocked_at?: string | null
          blocked_reason?: string | null
          created_at?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          interested_in?: string | null
          interests?: string[] | null
          is_active?: boolean | null
          is_admin?: boolean | null
          is_blocked?: boolean | null
          is_demo?: boolean | null
          is_online?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          last_name?: string | null
          latitude?: number | null
          lifestyle_preferences?: Json | null
          location?: string | null
          location_preferences?: Json | null
          longitude?: number | null
          looking_for?: string | null
          max_distance?: number | null
          name?: string
          personality_traits?: Json | null
          role?: string | null
          s2_cell_id?: string | null
          s2_level?: number | null
          suspension_end_date?: string | null
          swinger_experience?: string | null
          updated_at?: string | null
          user_id?: string
          warnings_count?: number | null
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_statistics: {
        Row: {
          conversion_rate: number | null
          created_at: string | null
          id: string
          last_invite_date: string | null
          monthly_earned: number
          period_end: string
          period_start: string
          referral_code: string
          successful_invites: number
          total_earned: number
          total_invites: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          last_invite_date?: string | null
          monthly_earned?: number
          period_end?: string
          period_start?: string
          referral_code: string
          successful_invites?: number
          total_earned?: number
          total_invites?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          last_invite_date?: string | null
          monthly_earned?: number
          period_end?: string
          period_start?: string
          referral_code?: string
          successful_invites?: number
          total_earned?: number
          total_invites?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referral_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          referral_code: string | null
          related_reward_id: string | null
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
          referral_code?: string | null
          related_reward_id?: string | null
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
          referral_code?: string | null
          related_reward_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_transactions_related_reward_id_fkey"
            columns: ["related_reward_id"]
            isOneToOne: false
            referencedRelation: "referral_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      report_ai_classification: {
        Row: {
          ai_category: string | null
          ai_confidence: number
          ai_model_version: string | null
          ai_severity: string
          ai_summary: string | null
          ai_tags: Json | null
          created_at: string
          detected_explicit: number | null
          detected_harassment: number | null
          detected_spam: number | null
          detected_toxicity: number | null
          human_notes: string | null
          human_override: boolean | null
          human_reviewed: boolean | null
          human_severity: string | null
          id: string
          metadata: Json | null
          processing_time_ms: number | null
          report_id: string
          suggested_action: string | null
          suggested_priority: string
          updated_at: string
        }
        Insert: {
          ai_category?: string | null
          ai_confidence: number
          ai_model_version?: string | null
          ai_severity: string
          ai_summary?: string | null
          ai_tags?: Json | null
          created_at?: string
          detected_explicit?: number | null
          detected_harassment?: number | null
          detected_spam?: number | null
          detected_toxicity?: number | null
          human_notes?: string | null
          human_override?: boolean | null
          human_reviewed?: boolean | null
          human_severity?: string | null
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          report_id: string
          suggested_action?: string | null
          suggested_priority: string
          updated_at?: string
        }
        Update: {
          ai_category?: string | null
          ai_confidence?: number
          ai_model_version?: string | null
          ai_severity?: string
          ai_summary?: string | null
          ai_tags?: Json | null
          created_at?: string
          detected_explicit?: number | null
          detected_harassment?: number | null
          detected_spam?: number | null
          detected_toxicity?: number | null
          human_notes?: string | null
          human_override?: boolean | null
          human_reviewed?: boolean | null
          human_severity?: string | null
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          report_id?: string
          suggested_action?: string | null
          suggested_priority?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_ai_classification_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          ai_classified: boolean | null
          assigned_to: string | null
          content_type: string
          created_at: string
          description: string | null
          id: string
          queue_position: number | null
          reason: string
          reported_content_id: string
          reported_user_id: string
          reporter_user_id: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          ai_classified?: boolean | null
          assigned_to?: string | null
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          queue_position?: number | null
          reason: string
          reported_content_id: string
          reported_user_id: string
          reporter_user_id: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          ai_classified?: boolean | null
          assigned_to?: string | null
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          queue_position?: number | null
          reason?: string
          reported_content_id?: string
          reported_user_id?: string
          reporter_user_id?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          permissions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          permissions?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          permissions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      security: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown
          location: Json | null
          resolved: boolean | null
          risk_level: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          location?: Json | null
          resolved?: boolean | null
          risk_level?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          location?: Json | null
          resolved?: boolean | null
          risk_level?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status: string
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource: string
          risk_score: number | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource: string
          risk_score?: number | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource?: string
          risk_score?: number | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_configurations: {
        Row: {
          config_key: string
          config_value: Json
          description: string | null
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
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
        Relationships: []
      }
      security_flags: {
        Row: {
          confidence: number
          created_at: string | null
          description: string
          flag_type: string
          id: string
          is_resolved: boolean | null
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_id: string
        }
        Insert: {
          confidence: number
          created_at?: string | null
          description: string
          flag_type: string
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string | null
          description?: string
          flag_type?: string
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown
          last_activity: string
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: unknown
          last_activity?: string
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          last_activity?: string
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      staking_records: {
        Row: {
          amount: number
          apy: number
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          last_claimed_at: string | null
          rewards_earned: number | null
          start_date: string
          status: string
          token_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          apy?: number
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          last_claimed_at?: string | null
          rewards_earned?: number | null
          start_date?: string
          status?: string
          token_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          apy?: number
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          last_claimed_at?: string | null
          rewards_earned?: number | null
          start_date?: string
          status?: string
          token_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          comments_count: number | null
          content_type: string
          created_at: string | null
          description: string | null
          hashtags: string[] | null
          id: string
          is_public: boolean | null
          likes_count: number | null
          media_url: string | null
          media_urls: string[] | null
          post_type: string | null
          shares_count: number | null
          updated_at: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          comments_count?: number | null
          content_type: string
          created_at?: string | null
          description?: string | null
          hashtags?: string[] | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          media_url?: string | null
          media_urls?: string[] | null
          post_type?: string | null
          shares_count?: number | null
          updated_at?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          comments_count?: number | null
          content_type?: string
          created_at?: string | null
          description?: string | null
          hashtags?: string[] | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          media_url?: string | null
          media_urls?: string[] | null
          post_type?: string | null
          shares_count?: number | null
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      story_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          likes_count: number | null
          metadata: Json | null
          parent_comment_id: string | null
          story_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          likes_count?: number | null
          metadata?: Json | null
          parent_comment_id?: string | null
          story_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          likes_count?: number | null
          metadata?: Json | null
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
            foreignKeyName: "story_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "story_engagement_metrics"
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
            foreignKeyName: "story_likes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "story_engagement_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      story_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_user_id: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          story_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_user_id: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          story_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_user_id?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          story_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_reports_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_reports_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "story_engagement_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      story_shares: {
        Row: {
          created_at: string | null
          id: string
          platform: string | null
          share_type: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string | null
          share_type: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string | null
          share_type?: string
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
            foreignKeyName: "story_shares_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "story_engagement_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_data: Json
          event_type: string
          id: string
          processed: boolean | null
          processed_at: string | null
          stripe_event_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_data: Json
          event_type: string
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          stripe_event_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          stripe_event_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: number
          is_trialing: boolean | null
          stripe_customer_id: string | null
          subscribed: boolean | null
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          is_trialing?: boolean | null
          stripe_customer_id?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          is_trialing?: boolean | null
          stripe_customer_id?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      system_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string | null
          metric_type: string
          metric_unit: string
          metric_value: number
          recorded_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string | null
          metric_type: string
          metric_unit?: string
          metric_value: number
          recorded_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string | null
          metric_type?: string
          metric_unit?: string
          metric_value?: number
          recorded_at?: string
        }
        Relationships: []
      }
      threat_detections: {
        Row: {
          affected_users: string[] | null
          confidence: number | null
          description: string
          detected_at: string | null
          id: string
          mitigation_actions: string[] | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          threat_id: string
          threat_type: string
        }
        Insert: {
          affected_users?: string[] | null
          confidence?: number | null
          description: string
          detected_at?: string | null
          id?: string
          mitigation_actions?: string[] | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status: string
          threat_id: string
          threat_type: string
        }
        Update: {
          affected_users?: string[] | null
          confidence?: number | null
          description?: string
          detected_at?: string | null
          id?: string
          mitigation_actions?: string[] | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          threat_id?: string
          threat_type?: string
        }
        Relationships: []
      }
      token_analytics: {
        Row: {
          active_stakers: number
          circulating_cmpx: number
          circulating_gtk: number
          created_at: string
          id: string
          metadata: Json | null
          period_end: string
          period_start: string
          period_type: string
          total_cmpx_supply: number
          total_gtk_supply: number
          total_staked_cmpx: number
          transaction_count: number
          transaction_volume_cmpx: number
          transaction_volume_gtk: number
        }
        Insert: {
          active_stakers?: number
          circulating_cmpx?: number
          circulating_gtk?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          period_type: string
          total_cmpx_supply?: number
          total_gtk_supply?: number
          total_staked_cmpx?: number
          transaction_count?: number
          transaction_volume_cmpx?: number
          transaction_volume_gtk?: number
        }
        Update: {
          active_stakers?: number
          circulating_cmpx?: number
          circulating_gtk?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          period_type?: string
          total_cmpx_supply?: number
          total_gtk_supply?: number
          total_staked_cmpx?: number
          transaction_count?: number
          transaction_volume_cmpx?: number
          transaction_volume_gtk?: number
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          status: string | null
          token_type: string
          transaction_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          token_type: string
          transaction_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          token_type?: string
          transaction_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tokens: {
        Row: {
          base_value: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          token_code: string
          token_name: string
          updated_at: string
        }
        Insert: {
          base_value?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          token_code: string
          token_name: string
          updated_at?: string
        }
        Update: {
          base_value?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          token_code?: string
          token_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
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
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          related_user_id?: string | null
          token_type: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          related_user_id?: string | null
          token_type?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      two_factor_auth: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          email: string | null
          id: string
          is_enabled: boolean | null
          method: string
          phone_number: string | null
          secret: string | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_enabled?: boolean | null
          method: string
          phone_number?: string | null
          secret?: string | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_enabled?: boolean | null
          method?: string
          phone_number?: string | null
          secret?: string | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      user_2fa_settings: {
        Row: {
          backup_codes: string[] | null
          backup_codes_used: number
          created_at: string
          id: string
          last_used_at: string | null
          recovery_email: string | null
          recovery_phone: string | null
          totp_enabled: boolean
          totp_secret: string | null
          totp_verified_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          backup_codes_used?: number
          created_at?: string
          id?: string
          last_used_at?: string | null
          recovery_email?: string | null
          recovery_phone?: string | null
          totp_enabled?: boolean
          totp_secret?: string | null
          totp_verified_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          backup_codes_used?: number
          created_at?: string
          id?: string
          last_used_at?: string | null
          recovery_email?: string | null
          recovery_phone?: string | null
          totp_enabled?: boolean
          totp_secret?: string | null
          totp_verified_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_device_tokens: {
        Row: {
          created_at: string
          device_info: Json | null
          device_token: string
          device_type: string | null
          id: string
          is_active: boolean
          last_used_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          device_token: string
          device_type?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          device_token?: string
          device_type?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_explicit_preferences: {
        Row: {
          created_at: string | null
          id: number
          is_verified: boolean | null
          preference_id: number | null
          privacy_level: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_verified?: boolean | null
          preference_id?: number | null
          privacy_level?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_verified?: boolean | null
          preference_id?: number | null
          privacy_level?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_explicit_preferences_preference_id_fkey"
            columns: ["preference_id"]
            isOneToOne: false
            referencedRelation: "explicit_preferences"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interests: {
        Row: {
          created_at: string | null
          id: number
          interest_id: number | null
          privacy_level: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          interest_id?: number | null
          privacy_level?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          interest_id?: number | null
          privacy_level?: string | null
          user_id?: string | null
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
      user_likes: {
        Row: {
          created_at: string | null
          id: string
          liked: boolean
          liked_user_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          liked: boolean
          liked_user_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          liked?: boolean
          liked_user_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          created_at: string
          delivery_method: string | null
          enabled: boolean
          id: string
          notification_type: string
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_method?: string | null
          enabled?: boolean
          id?: string
          notification_type: string
          settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_method?: string | null
          enabled?: boolean
          id?: string
          notification_type?: string
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_referral_balances: {
        Row: {
          cmpx_balance: number
          created_at: string | null
          id: string
          last_reset_date: string
          monthly_earned: number
          referral_code: string
          referred_by: string | null
          total_earned: number
          total_referrals: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cmpx_balance?: number
          created_at?: string | null
          id?: string
          last_reset_date?: string
          monthly_earned?: number
          referral_code: string
          referred_by?: string | null
          total_earned?: number
          total_referrals?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cmpx_balance?: number
          created_at?: string | null
          id?: string
          last_reset_date?: string
          monthly_earned?: number
          referral_code?: string
          referred_by?: string | null
          total_earned?: number
          total_referrals?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity: string | null
          location: Json | null
          session_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string | null
          location?: Json | null
          session_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string | null
          location?: Json | null
          session_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_staking: {
        Row: {
          amount: number
          created_at: string
          end_date: string
          id: string
          reward_claimed: boolean
          reward_percentage: number
          start_date: string
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          end_date: string
          id?: string
          reward_claimed?: boolean
          reward_percentage?: number
          start_date?: string
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_date?: string
          id?: string
          reward_claimed?: boolean
          reward_percentage?: number
          start_date?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
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
          cmpx_balance: number
          created_at: string | null
          gtk_balance: number
          id: string
          last_reset_date: string | null
          monthly_earned: number | null
          monthly_limit: number | null
          referral_code: string | null
          referred_by: string | null
          total_referrals: number | null
          updated_at: string | null
          user_id: string
          world_id_verified: boolean | null
        }
        Insert: {
          cmpx_balance?: number
          created_at?: string | null
          gtk_balance?: number
          id?: string
          last_reset_date?: string | null
          monthly_earned?: number | null
          monthly_limit?: number | null
          referral_code?: string | null
          referred_by?: string | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id: string
          world_id_verified?: boolean | null
        }
        Update: {
          cmpx_balance?: number
          created_at?: string | null
          gtk_balance?: number
          id?: string
          last_reset_date?: string | null
          monthly_earned?: number | null
          monthly_limit?: number | null
          referral_code?: string | null
          referred_by?: string | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id?: string
          world_id_verified?: boolean | null
        }
        Relationships: []
      }
      user_tokens: {
        Row: {
          cmpx_balance: number
          cmpx_staked: number
          created_at: string
          gtk_balance: number
          id: string
          last_reset_date: string
          monthly_earned: number
          monthly_limit: number
          referral_code: string
          referred_by: string | null
          total_referrals: number
          updated_at: string
          user_id: string
          world_id_claimed: boolean
          world_id_verified: boolean
        }
        Insert: {
          cmpx_balance?: number
          cmpx_staked?: number
          created_at?: string
          gtk_balance?: number
          id?: string
          last_reset_date?: string
          monthly_earned?: number
          monthly_limit?: number
          referral_code: string
          referred_by?: string | null
          total_referrals?: number
          updated_at?: string
          user_id: string
          world_id_claimed?: boolean
          world_id_verified?: boolean
        }
        Update: {
          cmpx_balance?: number
          cmpx_staked?: number
          created_at?: string
          gtk_balance?: number
          id?: string
          last_reset_date?: string
          monthly_earned?: number
          monthly_limit?: number
          referral_code?: string
          referred_by?: string | null
          total_referrals?: number
          updated_at?: string
          user_id?: string
          world_id_claimed?: boolean
          world_id_verified?: boolean
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
      active_security_flags: {
        Row: {
          confidence: number | null
          created_at: string | null
          description: string | null
          first_name: string | null
          flag_type: string | null
          id: string | null
          last_name: string | null
          severity: string | null
          user_id: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          description?: string | null
          first_name?: never
          flag_type?: string | null
          id?: string | null
          last_name?: never
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          description?: string | null
          first_name?: never
          flag_type?: string | null
          id?: string | null
          last_name?: never
          severity?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      couple_profile_stats: {
        Row: {
          couple_name: string | null
          created_at: string | null
          id: string | null
          is_premium: boolean | null
          is_verified: boolean | null
          partner1_age: string | null
          partner1_first_name: string | null
          partner1_last_name: string | null
          partner2_age: string | null
          partner2_first_name: string | null
          partner2_last_name: string | null
          relationship_type:
            | Database["public"]["Enums"]["relationship_type"]
            | null
          total_likes: number | null
          total_matches: number | null
          total_views: number | null
        }
        Relationships: []
      }
      couple_profiles_with_partners: {
        Row: {
          couple_bio: string | null
          couple_images: string[] | null
          couple_name: string | null
          created_at: string | null
          id: string | null
          is_premium: boolean | null
          is_verified: boolean | null
          partner1_age: number | null
          partner1_bio: string | null
          partner1_gender: string | null
          partner1_id: string | null
          partner1_name: string | null
          partner2_age: number | null
          partner2_bio: string | null
          partner2_gender: string | null
          partner2_id: string | null
          partner2_name: string | null
          relationship_type:
            | Database["public"]["Enums"]["relationship_type"]
            | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_profiles_partner1_id_fkey"
            columns: ["partner1_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_profiles_partner2_id_fkey"
            columns: ["partner2_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      current_token_metrics: {
        Row: {
          active_users: number | null
          active_users_24h: number | null
          total_cmpx_balance: number | null
          total_gtk_balance: number | null
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
      popular_couple_profiles: {
        Row: {
          couple_name: string | null
          engagement_score: number | null
          id: string | null
          likes_count: number | null
          matches_count: number | null
          relationship_type:
            | Database["public"]["Enums"]["relationship_type"]
            | null
          views_count: number | null
        }
        Relationships: []
      }
      popular_hashtags: {
        Row: {
          hashtag: string | null
          story_count: number | null
          total_comments: number | null
          total_likes: number | null
          total_shares: number | null
        }
        Relationships: []
      }
      recent_transactions: {
        Row: {
          amount: number | null
          balance_after: number | null
          balance_before: number | null
          created_at: string | null
          description: string | null
          token_type: string | null
          transaction_type: string | null
          user_id: string | null
        }
        Relationships: []
      }
      security_metrics: {
        Row: {
          affected_users: number | null
          avg_risk_score: number | null
          events_24h: number | null
          high_risk_events: number | null
          total_audit_logs: number | null
        }
        Relationships: []
      }
      staking_metrics: {
        Row: {
          active_positions: number | null
          completed_positions: number | null
          total_staked_amount: number | null
          total_staking_positions: number | null
        }
        Relationships: []
      }
      story_engagement_metrics: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string | null
          engagement_rate: number | null
          first_name: string | null
          gender: string | null
          id: string | null
          last_name: string | null
          likes_count: number | null
          post_type: string | null
          shares_count: number | null
          total_engagement: number | null
          views_count: number | null
        }
        Relationships: []
      }
      two_factor_stats: {
        Row: {
          active_2fa_users: number | null
          app_based_2fa: number | null
          email_based_2fa: number | null
          sms_based_2fa: number | null
          total_2fa_setups: number | null
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
        Relationships: []
      }
      user_story_stats: {
        Row: {
          avg_likes_per_story: number | null
          first_name: string | null
          last_name: string | null
          last_story_date: string | null
          total_comments_received: number | null
          total_likes_received: number | null
          total_shares_received: number | null
          total_stories: number | null
          user_id: string | null
        }
        Relationships: []
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
      calculate_compatibility: {
        Args: { user1_uuid: string; user2_uuid: string }
        Returns: number
      }
      calculate_gallery_commission:
        | {
            Args: { p_amount_cmpx: number; p_commission_percentage?: number }
            Returns: {
              commission_amount: number
              creator_amount: number
            }[]
          }
        | {
            Args: { p_amount_cmpx: number; p_commission_percentage?: number }
            Returns: {
              commission_amount: number
              creator_amount: number
            }[]
          }
      calculate_moderator_payment: {
        Args: {
          p_moderator_id: string
          p_period_end: string
          p_period_start: string
        }
        Returns: number
      }
      check_fingerprint_banned: {
        Args: {
          p_canvas_hash?: string
          p_combined_hash?: string
          p_worldid_nullifier_hash?: string
        }
        Returns: boolean
      }
      check_summary_rate_limit: {
        Args: { p_max_per_day?: number; p_user_id: string }
        Returns: boolean
      }
      claim_world_id_reward: { Args: { user_id_param: string }; Returns: Json }
      clean_expired_cache: { Args: never; Returns: undefined }
      cleanup_old_couple_data: { Args: never; Returns: undefined }
      cleanup_old_summaries: { Args: never; Returns: undefined }
      complete_staking: { Args: { staking_id_param: string }; Returns: Json }
      count_users_per_cell: {
        Args: never
        Returns: {
          level: number
          s2_cell_id: string
          user_count: number
        }[]
      }
      create_annual_returns: {
        Args: { investment_uuid: string }
        Returns: undefined
      }
      create_notification: {
        Args: {
          body: string
          data?: Json
          notification_type: string
          title: string
          user_id: string
        }
        Returns: Json
      }
      create_permanent_ban: {
        Args: {
          p_ban_reason: string
          p_banned_by: string
          p_canvas_hash: string
          p_combined_hash: string
          p_evidence?: Json
          p_severity?: string
          p_user_id: string
          p_worldid_nullifier_hash?: string
        }
        Returns: string
      }
      create_post:
        | {
            Args: {
              p_content: string
              p_post_type?: string
              p_profile_id: string
              p_user_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_content: string
              p_image_url?: string
              p_location?: string
              p_post_type?: string
              p_profile_id: string
              p_user_id: string
              p_video_url?: string
            }
            Returns: {
              comments_count: number
              content: string
              created_at: string
              id: string
              image_url: string
              is_verified: boolean
              likes_count: number
              location: string
              post_type: string
              profile_avatar: string
              profile_id: string
              profile_name: string
              shares_count: number
              updated_at: string
              user_id: string
              video_url: string
            }[]
          }
      date_trunc_day: { Args: { ts: string }; Returns: string }
      earth: { Args: never; Returns: number }
      generate_couple_report: {
        Args: { couple_id_param: string }
        Returns: Json
      }
      generate_referral_code:
        | { Args: never; Returns: string }
        | { Args: { user_uuid: string }; Returns: string }
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
      get_couple_profile_by_user_id: {
        Args: { user_uuid: string }
        Returns: {
          couple_bio: string
          couple_images: string[]
          couple_name: string
          created_at: string
          id: string
          is_premium: boolean
          is_verified: boolean
          partner1_age: number
          partner1_bio: string
          partner1_first_name: string
          partner1_gender: string
          partner1_id: string
          partner1_last_name: string
          partner2_age: number
          partner2_bio: string
          partner2_first_name: string
          partner2_gender: string
          partner2_id: string
          partner2_last_name: string
          relationship_type: Database["public"]["Enums"]["relationship_type"]
          updated_at: string
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
      get_post_comments: {
        Args: { page_limit?: number; page_offset?: number; post_uuid: string }
        Returns: {
          content: string
          created_at: string
          id: string
          likes_count: number
          parent_comment_id: string
          profile_avatar: string
          profile_id: string
          profile_name: string
          user_id: string
          user_liked: boolean
        }[]
      }
      get_potential_matches: {
        Args: { limit_param?: number; user_id_param: string }
        Returns: Json
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
      get_user_feed: {
        Args: {
          limit_param?: number
          offset_param?: number
          user_id_param: string
        }
        Returns: Json
      }
      get_user_matches: { Args: { user_id_param: string }; Returns: Json }
      log_security_event: {
        Args: {
          p_details?: Json
          p_event_type: string
          p_risk_level?: string
          p_user_id: string
        }
        Returns: string
      }
      process_referral_reward: {
        Args: { new_user_id: string; referral_code_param: string }
        Returns: Json
      }
      record_gallery_commission: {
        Args: {
          p_amount_cmpx: number
          p_commission_percentage?: number
          p_creator_id: string
          p_gallery_id: string
          p_transaction_type: string
        }
        Returns: string
      }
      record_gallery_commission_internal: {
        Args: {
          p_amount_cmpx: number
          p_commission_percentage?: number
          p_creator_id: string
          p_gallery_id: string
          p_transaction_type: string
        }
        Returns: string
      }
      remove_post_like: {
        Args: { p_post_id: string; p_user_id: string }
        Returns: undefined
      }
      reset_monthly_limits: { Args: never; Returns: undefined }
      start_staking: {
        Args: {
          amount_param: number
          duration_days?: number
          user_id_param: string
        }
        Returns: Json
      }
      toggle_post_like: {
        Args: { p_post_id: string; p_user_id: string }
        Returns: boolean
      }
      verify_checkin_distance: {
        Args: { p_club_id: string; p_latitude: number; p_longitude: number }
        Returns: boolean
      }
    }
    Enums: {
      relationship_type: "man-woman" | "man-man" | "woman-woman"
    }
    CompositeTypes: {
      [_ in never]: never
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
  public: {
    Enums: {
      relationship_type: ["man-woman", "man-man", "woman-woman"],
    },
  },
} as const
