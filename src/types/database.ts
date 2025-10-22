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
          partner2_id: string | null
          preferences: Json | null
          relationship_type: string
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
          partner2_id?: string | null
          preferences?: Json | null
          relationship_type: string
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
          partner2_id?: string | null
          preferences?: Json | null
          relationship_type?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_compatibility: {
        Args: { user1_uuid: string; user2_uuid: string }
        Returns: number
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

