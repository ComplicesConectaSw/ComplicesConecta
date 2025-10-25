// Core application types for ComplicesConecta
// Replaces 'any' usage throughout the codebase

export type UserRole = 'admin' | 'user' | 'demo';


export type Gender = 'male' | 'female' | 'non-binary' | 'other';
export type ProfileType = 'single' | 'couple';
export type Theme = 'elegant' | 'modern' | 'vibrant';

export type InterestedIn = 'men' | 'women' | 'both' | 'non-binary';

// Profile types aligned with Supabase schema
export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  bio: string | null;
  gender: Gender;
  interested_in: InterestedIn;
  is_premium: boolean | null;
  is_verified: boolean | null;
  relationship_type: ProfileType;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  latitude: number | null;
  longitude: number | null;
  share_location: boolean;
}

// Extended profile for UI components (includes non-Supabase fields)
export interface ExtendedProfile extends Profile {
  location?: string;
  profession?: string;
  interests?: string[];
  avatar?: string;
  photos?: string[];
  isOnline?: boolean;
  stats?: {
    matches: number;
    likes: number;
    views: number;
  };
}

export interface CoupleProfile {
  id: string;
  couple_name: string;
  person1_name: string;
  person2_name: string;
  person1_age: number;
  person2_age: number;
  bio: string | null;
  location: string;
  interests: string[];
  avatar: string;
  photos: string[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  compatibility_score: number;
  created_at: string;
  status: 'pending' | 'accepted' | 'declined';
  profile: Profile;
}

export interface Invitation {
  id: string;
  from_user_id: string;
  to_user_id: string;
  type: 'connection' | 'gallery' | 'chat' | 'event';
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  created_at: string;
  expires_at?: string;
}

export interface TokenBalance {
  user_id: string;
  cmpx_balance: number;
  gtk_balance: number;
  last_updated: string;
  monthly_limit: number;
  monthly_used: number;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
  is_read: boolean;
}

export interface VIPEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  max_attendees: number;
  current_attendees: number;
  price_cmpx: number;
  is_premium_only: boolean;
  created_at: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  age: number;
  relationshipType: ProfileType;
}

// Component prop types
export interface ProfileCardProps {
  profile: ExtendedProfile;
  onLike?: (profileId: string) => void;
  onMessage?: (profileId: string) => void;
  showActions?: boolean;
}

export interface GalleryProps {
  userId: string;
  isOwner?: boolean;
  canViewPrivate?: boolean;
  profileName?: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Feature flags
export interface FeatureFlags {
  profileVisibility: boolean;
  premiumFeatures: boolean;
  chatSystem: boolean;
  eventSystem: boolean;
  tokenSystem: boolean;
}

export interface ProfileThemeConfig {
  backgroundClass: string;
  textClass: string;
  accentClass: string;
  borderClass: string;
}

export interface ThemeableProfile {
  gender?: Gender;
  partnerGender?: Gender;
  theme?: Theme;
  accountType?: ProfileType;
}

// Monitoring types
export interface ErrorReport {
  error: Error;
  context: Record<string, unknown>;
  userId?: string;
  timestamp: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: string;
}
