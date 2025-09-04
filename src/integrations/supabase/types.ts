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
      apk_downloads: {
        Row: {
          download_date: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          version: string | null
        }
        Insert: {
          download_date?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          version?: string | null
        }
        Update: {
          download_date?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          version?: string | null
        }
        Relationships: []
      }
      app_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_date: string | null
          metric_name: string
          metric_value: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_date?: string | null
          metric_name: string
          metric_value?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_date?: string | null
          metric_name?: string
          metric_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      donaciones: {
        Row: {
          attrs: Json | null
          business_type: string | null
          country: string | null
          created: string | null
          email: string | null
          id: string | null
          type: string | null
        }
        Insert: {
          attrs?: Json | null
          business_type?: string | null
          country?: string | null
          created?: string | null
          email?: string | null
          id?: string | null
          type?: string | null
        }
        Update: {
          attrs?: Json | null
          business_type?: string | null
          country?: string | null
          created?: string | null
          email?: string | null
          id?: string | null
          type?: string | null
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gallery_permissions: {
        Row: {
          created_at: string | null
          grantee_profile: string
          id: string
          owner_profile: string
          scope: Database["public"]["Enums"]["gallery_scope"] | null
          source_invitation: string | null
          status: Database["public"]["Enums"]["permission_status"] | null
        }
        Insert: {
          created_at?: string | null
          grantee_profile: string
          id?: string
          owner_profile: string
          scope?: Database["public"]["Enums"]["gallery_scope"] | null
          source_invitation?: string | null
          status?: Database["public"]["Enums"]["permission_status"] | null
        }
        Update: {
          created_at?: string | null
          grantee_profile?: string
          id?: string
          owner_profile?: string
          scope?: Database["public"]["Enums"]["gallery_scope"] | null
          source_invitation?: string | null
          status?: Database["public"]["Enums"]["permission_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_permissions_grantee_profile_fkey"
            columns: ["grantee_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_permissions_owner_profile_fkey"
            columns: ["owner_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_permissions_source_invitation_fkey"
            columns: ["source_invitation"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string | null
          decided_at: string | null
          from_profile: string
          id: string
          message: string | null
          status: Database["public"]["Enums"]["invitation_status"] | null
          to_profile: string
          type: Database["public"]["Enums"]["invitation_type"] | null
        }
        Insert: {
          created_at?: string | null
          decided_at?: string | null
          from_profile: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["invitation_status"] | null
          to_profile: string
          type?: Database["public"]["Enums"]["invitation_type"] | null
        }
        Update: {
          created_at?: string | null
          decided_at?: string | null
          from_profile?: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["invitation_status"] | null
          to_profile?: string
          type?: Database["public"]["Enums"]["invitation_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_from_profile_fkey"
            columns: ["from_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_to_profile_fkey"
            columns: ["to_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number
          bio: string | null
          created_at: string
          first_name: string
          gender: string
          id: string
          interested_in: string
          is_premium: boolean | null
          is_verified: boolean | null
          last_name: string
          latitude: number | null
          longitude: number | null
          share_location: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age: number
          bio?: string | null
          created_at?: string
          first_name: string
          gender: string
          id?: string
          interested_in: string
          is_premium?: boolean | null
          is_verified?: boolean | null
          last_name: string
          latitude?: number | null
          longitude?: number | null
          share_location?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age?: number
          bio?: string | null
          created_at?: string
          first_name?: string
          gender?: string
          id?: string
          interested_in?: string
          is_premium?: boolean | null
          is_verified?: boolean | null
          last_name?: string
          latitude?: number | null
          longitude?: number | null
          share_location?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invited_id: string
          inviter_id: string
          status: string | null
          timestamp: string | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id: string
          invited_id: string
          inviter_id: string
          status?: string | null
          timestamp?: string | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invited_id?: string
          inviter_id?: string
          status?: string | null
          timestamp?: string | null
          type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_token_balances: {
        Row: {
          cmpx_balance: number | null
          created_at: string | null
          id: string
          last_reset_date: string | null
          monthly_earned: number | null
          referral_code: string
          referred_by: string | null
          total_referrals: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cmpx_balance?: number | null
          created_at?: string | null
          id?: string
          last_reset_date?: string | null
          monthly_earned?: number | null
          referral_code: string
          referred_by?: string | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cmpx_balance?: number | null
          created_at?: string | null
          id?: string
          last_reset_date?: string | null
          monthly_earned?: number | null
          referral_code?: string
          referred_by?: string | null
          total_referrals?: number | null
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
      accept_gallery_invitation: {
        Args: { invitation_id: string }
        Returns: undefined
      }
      delete_current_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_token_system_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      initialize_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_referral_reward: {
        Args: {
          current_monthly_earned: number
          inviter_id: string
          monthly_limit: number
          new_user_id: string
          new_user_referral_code: string
          referral_reward: number
          welcome_bonus: number
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "administrador" | "cliente"
      gallery_scope: "private_gallery" | "album"
      invitation_status: "pending" | "accepted" | "declined" | "revoked"
      invitation_type: "profile" | "gallery" | "chat"
      permission_status: "active" | "revoked"
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
      app_role: ["administrador", "cliente"],
      gallery_scope: ["private_gallery", "album"],
      invitation_status: ["pending", "accepted", "declined", "revoked"],
      invitation_type: ["profile", "gallery", "chat"],
      permission_status: ["active", "revoked"],
    },
  },
} as const
