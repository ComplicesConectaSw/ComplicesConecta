export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          display_name: string | null
          age: number | null
          bio: string | null
          email: string | null
          profile_type: string | null
          is_demo: boolean | null
          is_verified: boolean | null
          is_premium: boolean | null
          role: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          age?: number | null
          bio?: string | null
          email?: string | null
          profile_type?: string | null
          is_demo?: boolean | null
          is_verified?: boolean | null
          is_premium?: boolean | null
          role?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          age?: number | null
          bio?: string | null
          email?: string | null
          profile_type?: string | null
          is_demo?: boolean | null
          is_verified?: boolean | null
          is_premium?: boolean | null
          role?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_rooms: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string | null
          is_public: boolean | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by?: string | null
          is_public?: boolean | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string | null
          is_public?: boolean | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_members: {
        Row: {
          id: string
          room_id: string | null
          profile_id: string | null
          role: string | null
          joined_at: string | null
          is_muted: boolean | null
        }
        Insert: {
          id?: string
          room_id?: string | null
          profile_id?: string | null
          role?: string | null
          joined_at?: string | null
          is_muted?: boolean | null
        }
        Update: {
          id?: string
          room_id?: string | null
          profile_id?: string | null
          role?: string | null
          joined_at?: string | null
          is_muted?: boolean | null
        }
      }
      couple_photos: {
        Row: {
          id: string
          couple_id: string | null
          image_url: string | null
          title: string | null
          description: string | null
          is_public: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          couple_id?: string | null
          image_url?: string | null
          title?: string | null
          description?: string | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          couple_id?: string | null
          image_url?: string | null
          title?: string | null
          description?: string | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_invitations: {
        Row: {
          id: string
          room_id: string | null
          from_profile: string | null
          to_profile: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          room_id?: string | null
          from_profile?: string | null
          to_profile?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          room_id?: string | null
          from_profile?: string | null
          to_profile?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      invitations: {
        Row: {
          id: string
          from_profile: string
          to_profile: string
          type: string
          status: string
          created_at: string | null
          decided_at: string | null
          matched_user?: {
            id: string
            first_name: string | null
            last_name: string | null
            age: number | null
            bio: string | null
            is_premium: boolean | null
            is_verified: boolean | null
          }
        }
        Insert: {
          id?: string
          from_profile: string
          to_profile: string
          type: string
          status?: string
          created_at?: string | null
          decided_at?: string | null
        }
        Update: {
          id?: string
          from_profile?: string
          to_profile?: string
          type?: string
          status?: string
          created_at?: string | null
          decided_at?: string | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          content: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          location_latitude: number | null
          location_longitude: number | null
          location_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          location_latitude?: number | null
          location_longitude?: number | null
          location_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          location_latitude?: number | null
          location_longitude?: number | null
          location_address?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never