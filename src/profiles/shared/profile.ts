// src/entities/profile.ts
export interface Profile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  age?: number;
  gender?: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  is_verified?: boolean;
  is_premium?: boolean;
  account_type?: 'single' | 'couple';
  created_at?: string;
  updated_at?: string;
}
