// SERVICIO TEMPORAL DE CHAT
// Este archivo será reemplazado cuando se ejecuten las migraciones de BD

export interface ChatRoom {
  id: string;
  name: string;
  type: 'public' | 'private';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMember {
  id: string;
  room_id: string;
  profile_id: string;
  joined_at: string;
  role: 'admin' | 'member';
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
  sender_profile?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export interface ChatInvitation {
  id: string;
  room_id: string;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  decided_at?: string;
}

class ChatService {
  private subscriptions: Map<string, any> = new Map();

  /**
   * VERSIÓN TEMPORAL - Retorna error hasta que se ejecuten migraciones
   */
  async getPublicRoom(): Promise<{ success: boolean; room?: ChatRoom; error?: string }> {
    return {
      success: false,
      error: 'Sistema de chat no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)'
    };
  }

  async createPrivateRoom(
    name: string,
    memberIds: string[]
  ): Promise<{ success: boolean; room?: ChatRoom; error?: string }> {
    return {
      success: false,
      error: 'Sistema de chat no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)'
    };
  }

  async getUserRooms(): Promise<{ success: boolean; rooms?: ChatRoom[]; error?: string }> {
    return {
      success: false,
      error: 'Sistema de chat no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)'
    };
  }

  async sendMessage(
    roomId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text'
  ): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
    return {
      success: false,
      error: 'Sistema de chat no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)'
    };
  }

  async getRoomMessages(
    roomId: string,
    limit: number = 50
  ): Promise<{ success: boolean; messages?: ChatMessage[]; error?: string }> {
    return {
      success: false,
      error: 'Sistema de chat no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)'
    };
  }

  subscribeToRoom(roomId: string, callback: (message: ChatMessage) => void): () => void {
    console.warn('Sistema de chat no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)');
    return () => {};
  }

  unsubscribeFromRoom(roomId: string): void {
    console.warn('Sistema de chat no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)');
  }

  async canAccessRoom(roomId: string): Promise<boolean> {
    return false;
  }

  async inviteToRoom(
    roomId: string,
    inviteeId: string
  ): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Sistema de chat no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)'
    };
  }

  async respondToInvitation(
    invitationId: string,
    accept: boolean
  ): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Sistema de chat no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)'
    };
  }

  async getPendingInvitations(): Promise<{
    success: boolean;
    invitations?: ChatInvitation[];
    error?: string;
  }> {
    return {
      success: false,
      error: 'Sistema de chat no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)'
    };
  }
}

export const chatService = new ChatService();
