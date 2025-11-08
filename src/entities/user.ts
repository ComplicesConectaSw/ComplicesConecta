// src/entities/user.ts
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  is_verified?: boolean;
  is_premium?: boolean;
  created_at?: string;
  updated_at?: string;
}
