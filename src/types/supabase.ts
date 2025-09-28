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
      audit_logs: {
        Row: {
          action_description: string
          action_type: string
          created_at: string
          fraud_score: number | null
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          id: string
          name: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          type?: string | null
          updated_at?: string | null
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
          is_primary: boolean | null
          profile_id: string | null
          type: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          profile_id?: string | null
          type?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          profile_id?: string | null
          type?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
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
      media_access_logs: {
        Row: {
          access_type: string
          accessed_at: string | null
          created_at: string | null
          id: string
          media_id: string | null
          user_id: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          created_at?: string | null
          id?: string
          media_id?: string | null
          user_id?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
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
          target_id?: string | null
          target_type?: string
          target_user_id?: string | null
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
      moderators: {
        Row: {
          activated_at: string | null
          created_at: string | null
          created_by: string | null
          id: string
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
          notes?: string | null
          permissions?: Json | null
          role?: string | null
          status?: string | null
          suspended_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          gender: string | null
          id: string
          interested_in: string | null
          interests: string[] | null
          is_active: boolean | null
          is_blocked: boolean | null
          is_demo: boolean | null
          is_premium: boolean | null
          is_verified: boolean | null
          lifestyle_preferences: Json | null
          location: string | null
          location_preferences: Json | null
          looking_for: string | null
          max_distance: number | null
          name: string
          personality_traits: Json | null
          role: string | null
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
          gender?: string | null
          id?: string
          interested_in?: string | null
          interests?: string[] | null
          is_active?: boolean | null
          is_blocked?: boolean | null
          is_demo?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          lifestyle_preferences?: Json | null
          location?: string | null
          location_preferences?: Json | null
          looking_for?: string | null
          max_distance?: number | null
          name: string
          personality_traits?: Json | null
          role?: string | null
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
          gender?: string | null
          id?: string
          interested_in?: string | null
          interests?: string[] | null
          is_active?: boolean | null
          is_blocked?: boolean | null
          is_demo?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          lifestyle_preferences?: Json | null
          location?: string | null
          location_preferences?: Json | null
          looking_for?: string | null
          max_distance?: number | null
          name?: string
          personality_traits?: Json | null
          role?: string | null
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
          referral_code: string
          reward_type: string
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
          referral_code: string
          reward_type: string
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
          referral_code?: string
          reward_type?: string
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
      reports: {
        Row: {
          content_type: string
          created_at: string
          description: string | null
          id: string
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
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
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
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
          location?: Json | null
          resolved?: boolean | null
          risk_level?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
          last_activity?: string
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
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
    }
    Views: {
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
    }
    Functions: {
      calculate_compatibility: {
        Args: { user1_uuid: string; user2_uuid: string }
        Returns: number
      }
      claim_world_id_reward: {
        Args: { user_id_param: string }
        Returns: Json
      }
      clean_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_staking: {
        Args: { staking_id_param: string }
        Returns: Json
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
      create_post: {
        Args:
          | {
              p_content: string
              p_image_url?: string
              p_location?: string
              p_post_type?: string
              p_profile_id: string
              p_user_id: string
              p_video_url?: string
            }
          | {
              p_content: string
              p_post_type?: string
              p_profile_id: string
              p_user_id: string
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
      generate_referral_code: {
        Args: { user_uuid: string }
        Returns: string
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
      get_user_feed: {
        Args: {
          limit_param?: number
          offset_param?: number
          user_id_param: string
        }
        Returns: Json
      }
      get_user_matches: {
        Args: { user_id_param: string }
        Returns: Json
      }
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
      remove_post_like: {
        Args: { p_post_id: string; p_user_id: string }
        Returns: undefined
      }
      reset_monthly_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      relationship_type: ["man-woman", "man-man", "woman-woman"],
    },
  },
} as const
