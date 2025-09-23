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
          location: string | null
          looking_for: string | null
          max_distance: number | null
          name: string
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
          location?: string | null
          looking_for?: string | null
          max_distance?: number | null
          name: string
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
          location?: string | null
          looking_for?: string | null
          max_distance?: number | null
          name?: string
          suspension_end_date?: string | null
          swinger_experience?: string | null
          updated_at?: string | null
          user_id?: string
          warnings_count?: number | null
        }
        Relationships: []
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
      system_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_unit: string
          metric_value: number
          recorded_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_unit?: string
          metric_value: number
          recorded_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
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
          last_earned_at: string | null
          last_reset_date: string
          last_spent_at: string | null
          monthly_earned: number
          monthly_limit: number
          quantity: number | null
          token_id: string
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
          last_earned_at?: string | null
          last_reset_date?: string
          last_spent_at?: string | null
          monthly_earned?: number
          monthly_limit?: number
          quantity?: number | null
          token_id: string
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
          last_earned_at?: string | null
          last_reset_date?: string
          last_spent_at?: string | null
          monthly_earned?: number
          monthly_limit?: number
          quantity?: number | null
          token_id?: string
          total_referrals?: number
          updated_at?: string
          user_id?: string
          world_id_claimed?: boolean
          world_id_verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_tokens_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      user_token_balances: {
        Row: {
          cmpx_balance: number | null
          cmpx_staked: number | null
          gtk_balance: number | null
          last_reset_date: string | null
          monthly_earned: number | null
          monthly_limit: number | null
          monthly_remaining: number | null
          total_referrals: number | null
          user_id: string | null
          world_id_claimed: boolean | null
          world_id_verified: boolean | null
        }
        Insert: {
          cmpx_balance?: number | null
          cmpx_staked?: number | null
          gtk_balance?: number | null
          last_reset_date?: string | null
          monthly_earned?: number | null
          monthly_limit?: number | null
          monthly_remaining?: never
          total_referrals?: number | null
          user_id?: string | null
          world_id_claimed?: boolean | null
          world_id_verified?: boolean | null
        }
        Update: {
          cmpx_balance?: number | null
          cmpx_staked?: number | null
          gtk_balance?: number | null
          last_reset_date?: string | null
          monthly_earned?: number | null
          monthly_limit?: number | null
          monthly_remaining?: never
          total_referrals?: number | null
          user_id?: string | null
          world_id_claimed?: boolean | null
          world_id_verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      claim_world_id_reward: {
        Args: { user_id_param: string }
        Returns: Json
      }
      complete_staking: {
        Args: { staking_id_param: string }
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
        Returns: Json
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
      get_user_feed: {
        Args: {
          limit_param?: number
          offset_param?: number
          user_id_param: string
        }
        Returns: Json
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
  public: {
    Enums: {
      relationship_type: ["man-woman", "man-man", "woman-woman"],
    },
  },
} as const
