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
      apk_downloads: {
        Row: {
          created_at: string | null
          download_count: number | null
          download_url: string | null
          file_size: number | null
          id: string
          is_active: boolean | null
          release_date: string | null
          updated_at: string | null
          version: string
        }
        Insert: {
          created_at?: string | null
          download_count?: number | null
          download_url?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          release_date?: string | null
          updated_at?: string | null
          version: string
        }
        Update: {
          created_at?: string | null
          download_count?: number | null
          download_url?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          release_date?: string | null
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      app_metrics: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          metric_name: string
          metric_type: string | null
          metric_value: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          metric_name: string
          metric_type?: string | null
          metric_value?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          metric_name?: string
          metric_type?: string | null
          metric_value?: number | null
          updated_at?: string | null
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
          is_deleted: boolean | null
          is_edited: boolean | null
          message_type: string | null
          metadata: Json | null
          reply_to: string | null
          room_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          reply_to?: string | null
          room_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          reply_to?: string | null
          room_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          id: string
          is_active: boolean | null
          joined_at: string | null
          last_read_at: string | null
          left_at: string | null
          role: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          left_at?: string | null
          role?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          left_at?: string | null
          role?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: []
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
      chat_typing: {
        Row: {
          expires_at: string | null
          id: string
          room_id: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          room_id: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          room_id?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      couple_photos: {
        Row: {
          created_at: string
          id: string
          is_main: boolean | null
          partner_type: string
          photo_url: string
          profile_id: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_main?: boolean | null
          partner_type: string
          photo_url: string
          profile_id: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_main?: boolean | null
          partner_type?: string
          photo_url?: string
          profile_id?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_photos_profile_id_fkey"
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
      faq_items: {
        Row: {
          answer: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question?: string
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
      interest_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      interests: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_popular: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_popular?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_popular?: boolean | null
          name?: string
          updated_at?: string
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
      notification_logs: {
        Row: {
          body: string
          data: Json | null
          delivery_status: string | null
          error_message: string | null
          id: string
          notification_type: string
          sent_at: string
          subscription_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          data?: Json | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          notification_type: string
          sent_at?: string
          subscription_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          data?: Json | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          sent_at?: string
          subscription_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "push_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          id: string
          invitations_enabled: boolean | null
          likes_enabled: boolean | null
          marketing_enabled: boolean | null
          matches_enabled: boolean | null
          messages_enabled: boolean | null
          profile_views_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitations_enabled?: boolean | null
          likes_enabled?: boolean | null
          marketing_enabled?: boolean | null
          matches_enabled?: boolean | null
          messages_enabled?: boolean | null
          profile_views_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invitations_enabled?: boolean | null
          likes_enabled?: boolean | null
          marketing_enabled?: boolean | null
          matches_enabled?: boolean | null
          messages_enabled?: boolean | null
          profile_views_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_images: {
        Row: {
          file_size: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          is_public: boolean | null
          mime_type: string | null
          upload_date: string | null
          user_id: string
        }
        Insert: {
          file_size?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          is_public?: boolean | null
          mime_type?: string | null
          upload_date?: string | null
          user_id: string
        }
        Update: {
          file_size?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          is_public?: boolean | null
          mime_type?: string | null
          upload_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          age: number | null
          age_range_max: number | null
          age_range_min: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          experience_level: string | null
          first_name: string | null
          gender: string | null
          id: string
          interested_in: string[] | null
          interests: string[] | null
          is_active: boolean | null
          is_demo: boolean | null
          is_online: boolean
          is_premium: boolean | null
          is_public: boolean | null
          is_verified: boolean | null
          last_active: string | null
          last_name: string | null
          latitude: number | null
          longitude: number | null
          looking_for: string[] | null
          max_distance: number | null
          partner_age: number | null
          partner_first_name: string | null
          payment_failed: boolean | null
          premium_expires_at: string | null
          premium_plan: string | null
          profile_type: string | null
          role: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          swinger_experience: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_type?: string | null
          age?: number | null
          age_range_max?: number | null
          age_range_min?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          experience_level?: string | null
          first_name?: string | null
          gender?: string | null
          id: string
          interested_in?: string[] | null
          interests?: string[] | null
          is_active?: boolean | null
          is_demo?: boolean | null
          is_online?: boolean
          is_premium?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          last_active?: string | null
          last_name?: string | null
          latitude?: number | null
          longitude?: number | null
          looking_for?: string[] | null
          max_distance?: number | null
          partner_age?: number | null
          partner_first_name?: string | null
          payment_failed?: boolean | null
          premium_expires_at?: string | null
          premium_plan?: string | null
          profile_type?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          swinger_experience?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_type?: string | null
          age?: number | null
          age_range_max?: number | null
          age_range_min?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          experience_level?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          interested_in?: string[] | null
          interests?: string[] | null
          is_active?: boolean | null
          is_demo?: boolean | null
          is_online?: boolean
          is_premium?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          last_active?: string | null
          last_name?: string | null
          latitude?: number | null
          longitude?: number | null
          looking_for?: string[] | null
          max_distance?: number | null
          partner_age?: number | null
          partner_first_name?: string | null
          payment_failed?: boolean | null
          premium_expires_at?: string | null
          premium_plan?: string | null
          profile_type?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          swinger_experience?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean | null
          p256dh_key: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean | null
          p256dh_key: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean | null
          p256dh_key?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string
          is_active: boolean | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
          tokens_included: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          tokens_included?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          tokens_included?: number | null
        }
        Relationships: []
      }
      token_packages: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price_mxn: number | null
          price_usd: number | null
          token_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price_mxn?: number | null
          price_usd?: number | null
          token_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price_mxn?: number | null
          price_usd?: number | null
          token_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          balance_before: number | null
          created_at: string | null
          id: string
          reason: string | null
          reference_id: string | null
          token_type: string
          transaction_type: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string | null
          id?: string
          reason?: string | null
          reference_id?: string | null
          token_type: string
          transaction_type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string | null
          id?: string
          reason?: string | null
          reference_id?: string | null
          token_type?: string
          transaction_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tokens: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          token_type: string
          transaction_type: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          token_type: string
          transaction_type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          token_type?: string
          transaction_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interests: {
        Row: {
          created_at: string
          id: string
          interest_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interest_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interest_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
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
      user_token_balances: {
        Row: {
          cmpx_balance: number | null
          created_at: string | null
          gtk_balance: number | null
          id: string
          last_claim_date: string | null
          total_earned: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cmpx_balance?: number | null
          created_at?: string | null
          gtk_balance?: number | null
          id?: string
          last_claim_date?: string | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cmpx_balance?: number | null
          created_at?: string | null
          gtk_balance?: number | null
          id?: string
          last_claim_date?: string | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
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
          partner1_first_name: string | null
          partner1_gender: string | null
          partner1_id: string | null
          partner1_last_name: string | null
          partner2_age: number | null
          partner2_bio: string | null
          partner2_first_name: string | null
          partner2_gender: string | null
          partner2_id: string | null
          partner2_last_name: string | null
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
    }
    Functions: {
      accept_gallery_invitation: {
        Args: { invitation_id: string }
        Returns: undefined
      }
      are_connected: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      calculate_compatibility_score: {
        Args: { p_user1_uuid: string; p_user2_uuid: string }
        Returns: number
      }
      cleanup_expired_typing: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_matches: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_match_if_mutual: {
        Args: { p_user1_uuid: string; p_user2_uuid: string }
        Returns: string
      }
      create_private_chat_room: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
      delete_current_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_mutual_match: {
        Args: { p_user1_uuid: string; p_user2_uuid: string }
        Returns: boolean
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
      get_notification_preferences: {
        Args: { target_user_id: string }
        Returns: {
          invitations_enabled: boolean
          likes_enabled: boolean
          marketing_enabled: boolean
          matches_enabled: boolean
          messages_enabled: boolean
          profile_views_enabled: boolean
          quiet_hours_end: string
          quiet_hours_start: string
          timezone: string
        }[]
      }
      get_potential_matches: {
        Args:
          | {
              limit_count?: number
              max_age?: number
              max_distance?: number
              min_age?: number
              user_id: string
            }
          | { p_limit?: number; p_max_distance?: number; p_user_id: string }
        Returns: {
          age: number
          avatar_url: string
          display_name: string
          distance_km: number
          first_name: string
          interests: string[]
          is_online: boolean
          last_active: string
          last_name: string
          profile_id: string
        }[]
      }
      get_token_balance: {
        Args: { token_type: string; user_id: string }
        Returns: number
      }
      get_user_chat_rooms: {
        Args: { user_id: string }
        Returns: {
          last_message_at: string
          participant_count: number
          room_id: string
          room_name: string
          room_type: string
          unread_count: number
        }[]
      }
      get_user_matches: {
        Args:
          | { p_limit?: number; p_offset?: number; p_user_id: string }
          | { user_id: string }
        Returns: {
          compatibility_score: number
          last_interaction: string
          match_id: string
          match_reasons: string[]
          other_user_avatar: string
          other_user_id: string
          other_user_name: string
          shared_interests: string[]
          unread_messages: number
        }[]
      }
      get_user_profile_complete: {
        Args: { p_user_uuid: string }
        Returns: {
          age: number
          avatar_url: string
          bio: string
          created_at: string
          email: string
          first_name: string
          id: string
          interests: string[]
          is_active: boolean
          is_demo: boolean
          last_name: string
          looking_for: string[]
          profile_type: string
          role: string
          swinger_experience: string
          updated_at: string
        }[]
      }
      get_user_push_subscriptions: {
        Args: { target_user_id: string }
        Returns: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh_key: string
        }[]
      }
      has_role: {
        Args:
          | { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
          | { p_role_name: string; p_user_uuid: string }
        Returns: boolean
      }
      initialize_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_notification_delivery: {
        Args: {
          delivery_status?: string
          error_message?: string
          notification_body: string
          notification_data?: Json
          notification_title: string
          notification_type: string
          target_subscription_id: string
          target_user_id: string
        }
        Returns: string
      }
      process_like_action: {
        Args: { p_is_like: boolean; p_liked_id: string; p_liker_id: string }
        Returns: Json
      }
      search_compatible_profiles: {
        Args: { p_limit_count?: number; p_user_uuid: string }
        Returns: {
          age: number
          avatar_url: string
          common_interests: string[]
          compatibility_score: number
          first_name: string
          last_name: string
          profile_id: string
        }[]
      }
      update_user_activity: {
        Args: { is_online?: boolean; user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "administrador" | "cliente"
      gallery_scope: "private_gallery" | "album"
      invitation_status: "pending" | "accepted" | "declined" | "revoked"
      invitation_type: "profile" | "gallery" | "chat"
      permission_status: "active" | "revoked"
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
      app_role: ["administrador", "cliente"],
      gallery_scope: ["private_gallery", "album"],
      invitation_status: ["pending", "accepted", "declined", "revoked"],
      invitation_type: ["profile", "gallery", "chat"],
      permission_status: ["active", "revoked"],
      relationship_type: ["man-woman", "man-man", "woman-woman"],
    },
  },
} as const
