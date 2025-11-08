// src/entities/club.ts
export interface Club {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  latitude: number;
  longitude: number;
  logo_url?: string;
  cover_image_url?: string;
  is_featured: boolean;
  is_active: boolean;
  rating_average: number;
  rating_count: number;
  check_in_count: number;
  check_in_radius_meters?: number;
  verified_at?: string;
  created_at?: string;
  updated_at?: string;
}
