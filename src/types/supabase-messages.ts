/**
 * Tipos TypeScript para las tablas de mensajes y conversaciones
 * Generados para ComplicesConecta v3.0.0
 */

export interface Database {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          location_latitude: number | null;
          location_longitude: number | null;
          location_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          location_latitude?: number | null;
          location_longitude?: number | null;
          location_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          location_latitude?: number | null;
          location_longitude?: number | null;
          location_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          participant_1_id: string;
          participant_2_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          participant_1_id: string;
          participant_2_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          participant_1_id?: string;
          participant_2_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Tipos específicos para mensajes
export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type MessageUpdate = Database['public']['Tables']['messages']['Update'];

// Tipos específicos para conversaciones
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update'];

// Tipo para mensaje con información del remitente
export interface MessageWithSender extends Message {
  sender: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

// Tipo para conversación con participantes
export interface ConversationWithParticipants extends Conversation {
  participant_1: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  participant_2: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}
