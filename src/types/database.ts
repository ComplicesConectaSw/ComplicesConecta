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
      audit_logs: {
        Row: {
          action_description: string | null
          action_type: string
          created_at: string | null
          fraud_score: number | null
          id: string
          ip_address: unknown | null
          request_data: Json | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_description?: string | null
          action_type: string
          created_at?: string | null
          fraud_score?: number | null
          id?: string
          ip_address?: unknown | null
          request_data?: Json | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_description?: string | null
          action_type?: string
          created_at?: string | null
          fraud_score?: number | null
          id?: string
          ip_address?: unknown | null
          request_data?: Json | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_invitations: {
        Row: {
          created_at: string | null
          from_profile: string
          id: string
          message: string | null
          room_id: string
          status: string | null
          to_profile: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_profile: string
          id?: string
          message?: string | null
          room_id: string
          status?: string | null
          to_profile: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_profile?: string
          id?: string
          message?: string | null
          room_id?: string
          status?: string | null
          to_profile?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_invitations_from_profile_fkey"
            columns: ["from_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_invitations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_invitations_to_profile_fkey"
            columns: ["to_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_members: {
        Row: {
          id: string
          is_muted: boolean | null
          joined_at: string | null
          last_read_at: string | null
          profile_id: string
          role: string | null
          room_id: string
        }
        Insert: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          profile_id: string
          role?: string | null
          room_id: string
        }
        Update: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          profile_id?: string
          role?: string | null
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
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          location_address: string | null
          location_latitude: number | null
          location_longitude: number | null
          message_type: string | null
          read_at: string | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          message_type?: string | null
          read_at?: string | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          max_members: number | null
          name: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_members?: number | null
          name: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_members?: number | null
          name?: string
          type?: string | null
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
          status: string
          updated_at: string | null
        }
        Insert: {
          couple_profile_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_profile_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          couple_profile_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_profile_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
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
        ]
      }
      couple_profile_views: {
        Row: {
          couple_profile_id: string
          id: string
          viewed_at: string | null
          viewer_profile_id: string
        }
        Insert: {
          couple_profile_id: string
          id?: string
          viewed_at?: string | null
          viewer_profile_id: string
        }
        Update: {
          couple_profile_id?: string
          id?: string
          viewed_at?: string | null
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
          {
            foreignKeyName: "couple_profile_views_couple_profile_id_fkey"
            columns: ["couple_profile_id"]
            isOneToOne: false
            referencedRelation: "couple_profiles_with_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_profiles: {
        Row: {
          couple_bio: string | null
          couple_images: string[] | null
          couple_interests: string[] | null
          couple_name: string
          created_at: string | null
          experience_level: string | null
          id: string
          interested_in: string | null
          is_demo: boolean | null
          is_premium: boolean | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          looking_for: string | null
          partner1_id: string
          partner2_id: string | null
          preferences: Json | null
          relationship_type: string
          swinger_experience: string | null
          total_views: number | null
          updated_at: string | null
        }
        Insert: {
          couple_bio?: string | null
          couple_images?: string[] | null
          couple_interests?: string[] | null
          couple_name: string
          created_at?: string | null
          experience_level?: string | null
          id?: string
          interested_in?: string | null
          is_demo?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          looking_for?: string | null
          partner1_id: string
          partner2_id?: string | null
          preferences?: Json | null
          relationship_type: string
          swinger_experience?: string | null
          total_views?: number | null
          updated_at?: string | null
        }
        Update: {
          couple_bio?: string | null
          couple_images?: string[] | null
          couple_interests?: string[] | null
          couple_name?: string
          created_at?: string | null
          experience_level?: string | null
          id?: string
          interested_in?: string | null
          is_demo?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          looking_for?: string | null
          partner1_id?: string
          partner2_id?: string | null
          preferences?: Json | null
          relationship_type?: string
          swinger_experience?: string | null
          total_views?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
      gallery_permissions: {
        Row: {
          created_at: string | null
          gallery_owner_id: string
          granted_by: string
          granted_to: string
          id: string
          permission_type: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          gallery_owner_id: string
          granted_by: string
          granted_to: string
          id?: string
          permission_type: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          gallery_owner_id?: string
          granted_by?: string
          granted_to?: string
          id?: string
          permission_type?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invitation_statistics: {
        Row: {
          acceptance_rate: number
          accepted_invitations: number
          created_at: string | null
          declined_invitations: number
          expired_invitations: number
          id: string
          pending_invitations: number
          total_invitations: number
          updated_at: string | null
        }
        Insert: {
          acceptance_rate?: number
          accepted_invitations?: number
          created_at?: string | null
          declined_invitations?: number
          expired_invitations?: number
          id?: string
          pending_invitations?: number
          total_invitations?: number
          updated_at?: string | null
        }
        Update: {
          acceptance_rate?: number
          accepted_invitations?: number
          created_at?: string | null
          declined_invitations?: number
          expired_invitations?: number
          id?: string
          pending_invitations?: number
          total_invitations?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      invitation_templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean
          template_content: string
          template_name: string
          template_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          template_content: string
          template_name: string
          template_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          template_content?: string
          template_name?: string
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          invitation_type: string | null
          invited_user_id: string
          inviter_id: string
          metadata: Json | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_type?: string | null
          invited_user_id: string
          inviter_id: string
          metadata?: Json | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_type?: string | null
          invited_user_id?: string
          inviter_id?: string
          metadata?: Json | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          compatibility_score: number | null
          created_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          compatibility_score?: number | null
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          compatibility_score?: number | null
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          caption: string | null
          comments_count: number | null
          created_at: string | null
          file_size: number | null
          file_type: string | null
          id: string
          is_profile_photo: boolean | null
          is_public: boolean | null
          likes_count: number | null
          mime_type: string | null
          owner_id: string
          storage_path: string
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_profile_photo?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          mime_type?: string | null
          owner_id: string
          storage_path: string
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_profile_photo?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          mime_type?: string | null
          owner_id?: string
          storage_path?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      media_access_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          media_path: string
          reason: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          media_path: string
          reason?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          media_path?: string
          reason?: string | null
          user_agent?: string | null
          user_id?: string
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
          is_deleted: boolean | null
          is_read: boolean | null
          message_type: string | null
          receiver_id: string | null
          room_id: string | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_read?: boolean | null
          message_type?: string | null
          receiver_id?: string | null
          room_id?: string | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_read?: boolean | null
          message_type?: string | null
          receiver_id?: string | null
          room_id?: string | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
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
          is_online: boolean | null
          is_premium: boolean | null
          is_verified: boolean | null
          last_name: string | null
          last_seen: string | null
          location: string | null
          role: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id: string
          interests?: string[] | null
          is_admin?: boolean | null
          is_online?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          last_name?: string | null
          last_seen?: string | null
          location?: string | null
          role?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
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
          is_online?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          last_name?: string | null
          last_seen?: string | null
          location?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      referral_leaderboard: {
        Row: {
          created_at: string | null
          id: string
          monthly_earned: number
          rank: number
          referral_code: string
          total_earned: number
          total_referrals: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          monthly_earned?: number
          rank?: number
          referral_code: string
          total_earned?: number
          total_referrals?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          monthly_earned?: number
          rank?: number
          referral_code?: string
          total_earned?: number
          total_referrals?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          amount: number
          confirmed_at: string | null
          created_at: string | null
          id: string
          referee_id: string
          referrer_id: string
          reward_type: string
          status: string
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          referee_id: string
          referrer_id: string
          reward_type: string
          status?: string
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          referee_id?: string
          referrer_id?: string
          reward_type?: string
          status?: string
        }
        Relationships: []
      }
      referral_statistics: {
        Row: {
          active_referrals: number
          conversion_rate: number
          created_at: string | null
          id: string
          monthly_earned: number
          referral_code: string
          total_earned: number
          total_referrals: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_referrals?: number
          conversion_rate?: number
          created_at?: string | null
          id?: string
          monthly_earned?: number
          referral_code: string
          total_earned?: number
          total_referrals?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_referrals?: number
          conversion_rate?: number
          created_at?: string | null
          id?: string
          monthly_earned?: number
          referral_code?: string
          total_earned?: number
          total_referrals?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          content_type: string | null
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reported_content_id: string | null
          reported_user_id: string | null
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reported_content_id?: string | null
          reported_user_id?: string | null
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reported_content_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      staking_records: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          is_active: boolean
          staking_duration: number
          token_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          is_active?: boolean
          staking_duration: number
          token_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          is_active?: boolean
          staking_duration?: number
          token_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          content_type: string
          content_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          location: string | null
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
          id?: string
          is_public?: boolean | null
          location?: string | null
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
          id?: string
          is_public?: boolean | null
          location?: string | null
          media_urls?: string[] | null
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      story_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          story_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          story_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
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
        ]
      }
      story_shares: {
        Row: {
          created_at: string | null
          id: string
          share_type: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          share_type?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
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
          id: string
          metric_name: string
          metric_type: string | null
          metric_unit: string | null
          metric_value: number
          tags: Json | null
          timestamp: string | null
        }
        Insert: {
          id?: string
          metric_name: string
          metric_type?: string | null
          metric_unit?: string | null
          metric_value: number
          tags?: Json | null
          timestamp?: string | null
        }
        Update: {
          id?: string
          metric_name?: string
          metric_type?: string | null
          metric_unit?: string | null
          metric_value?: number
          tags?: Json | null
          timestamp?: string | null
        }
        Relationships: []
      }
      token_analytics: {
        Row: {
          active_stakers: number
          circulating_cmpx: number
          circulating_gtk: number
          created_at: string | null
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
          updated_at: string | null
        }
        Insert: {
          active_stakers?: number
          circulating_cmpx?: number
          circulating_gtk?: number
          created_at?: string | null
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
          updated_at?: string | null
        }
        Update: {
          active_stakers?: number
          circulating_cmpx?: number
          circulating_gtk?: number
          created_at?: string | null
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
          updated_at?: string | null
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          token_type: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          token_type: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          token_type?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          is_revoked: boolean
          metadata: Json | null
          token_hash: string
          token_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          is_revoked?: boolean
          metadata?: Json | null
          token_hash: string
          token_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          is_revoked?: boolean
          metadata?: Json | null
          token_hash?: string
          token_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string
          description: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          status: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          status?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          status?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      two_factor_auth: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          is_enabled: boolean
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
          is_enabled?: boolean
          method: string
          secret?: string | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          method?: string
          secret?: string | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
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
      user_referral_balances: {
        Row: {
          cmpx_balance: number
          created_at: string | null
          gtk_balance: number
          id: string
          monthly_earned: number
          referral_code: string
          total_earned: number
          total_referrals: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cmpx_balance?: number
          created_at?: string | null
          gtk_balance?: number
          id?: string
          monthly_earned?: number
          referral_code: string
          total_earned?: number
          total_referrals?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cmpx_balance?: number
          created_at?: string | null
          gtk_balance?: number
          id?: string
          monthly_earned?: number
          referral_code?: string
          total_earned?: number
          total_referrals?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string | null
          id: string
          report_details: Json | null
          report_reason: string
          report_type: string
          reported_user_id: string
          reporter_id: string
          resolution: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          report_details?: Json | null
          report_reason: string
          report_type: string
          reported_user_id: string
          reporter_id: string
          resolution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          report_details?: Json | null
          report_reason?: string
          report_type?: string
          reported_user_id?: string
          reporter_id?: string
          resolution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
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
      user_token_balances: {
        Row: {
          cmpx_balance: number
          created_at: string | null
          gtk_balance: number
          id: string
          locked_cmpx: number
          locked_gtk: number
          total_earned_cmpx: number
          total_earned_gtk: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cmpx_balance?: number
          created_at?: string | null
          gtk_balance?: number
          id?: string
          locked_cmpx?: number
          locked_gtk?: number
          total_earned_cmpx?: number
          total_earned_gtk?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cmpx_balance?: number
          created_at?: string | null
          gtk_balance?: number
          id?: string
          locked_cmpx?: number
          locked_gtk?: number
          total_earned_cmpx?: number
          total_earned_gtk?: number
          updated_at?: string | null
          user_id?: string
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
          partner1_first_name: string | null
          partner1_gender: string | null
          partner1_id: string | null
          partner1_last_name: string | null
          partner2_age: number | null
          partner2_first_name: string | null
          partner2_gender: string | null
          partner2_id: string | null
          partner2_last_name: string | null
          preferences: Json | null
          relationship_type: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_compatibility: {
        Args: { user1_uuid: string; user2_uuid: string }
        Returns: number
      }
      get_user_activity_stats: {
        Args: { days?: number }
        Returns: {
          activity_types: Json
          date: string
          total_activities: number
          unique_users: number
        }[]
      }
      get_user_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_users: number
          new_users_today: number
          new_users_week: number
          premium_users: number
          total_users: number
          verified_users: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

