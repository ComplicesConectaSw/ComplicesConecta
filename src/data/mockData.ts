import type { Database } from '@/types/supabase-generated';

// Helper para construir URLs de assets locales usando Vite
const buildAssetUrl = (relativePath: string): string =>
  new URL(`../assets/${relativePath}`, import.meta.url).href;

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface MockProfile extends ProfileRow {
  stats: {
    totalViews: number;
    totalLikes: number;
    totalMatches: number;
    profileCompleteness: number;
  };
  interestsList: string[];
  nftImages: string[];
}

const nftImage1 = buildAssetUrl('Ntf/imagen1.jpg');
const nftImage2 = buildAssetUrl('Ntf/imagen2.jpg');
const nftImage3 = buildAssetUrl('Ntf/imagen3.jpg');

export const MOCK_PROFILE_SINGLE: MockProfile = {
  id: 'demo-single-1',
  user_id: 'demo-single-1',
  name: 'Sofía Demo',
  first_name: 'Sofía',
  last_name: 'Demo',
  full_name: 'Sofía Demo',
  age: 28,
  bio: 'Explorando conexiones auténticas en el lifestyle swinger. Disfruto de experiencias discretas, respeto mutuo y encuentros sofisticados.',
  avatar_url: buildAssetUrl('img/demo-single-avatar.jpg'),
  location: 'Ciudad de México, México',
  gender: 'female',
  interests: [
    'Lifestyle Swinger',
    'Experiencias Nuevas',
    'Conexiones Auténticas',
    'Ambiente Elegante',
    'Experiencias Sensuales',
    'Fiestas Temáticas',
  ],
  is_admin: false,
  is_premium: true,
  is_verified: true,
  role: 'user',
  is_active: true,
  is_blocked: false,
  is_demo: true,
  is_online: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  account_type: 'single',
  age_range_max: null,
  age_range_min: null,
  blocked_at: null,
  blocked_reason: null,
  interested_in: null,
  lifestyle_preferences: null,
  location_preferences: null,
  latitude: null,
  longitude: null,
  looking_for: null,
  max_distance: null,
  personality_traits: null,
  s2_cell_id: null,
  s2_level: null,
  suspension_end_date: null,
  swinger_experience: null,
  warnings_count: null,
  stats: {
    totalViews: 1240,
    totalLikes: 320,
    totalMatches: 48,
    profileCompleteness: 92,
  },
  interestsList: [
    'Principiantes Curiosos',
    'Mentalidad Abierta',
    'Soft Swap',
    'Intercambio Suave',
    'Eventos Lifestyle',
    'Clubs Privados',
  ],
  nftImages: [nftImage1, nftImage2, nftImage3],
};

export const MOCK_PROFILE_COUPLE: MockProfile = {
  id: 'demo-couple-1',
  user_id: 'demo-couple-1',
  name: 'Ana & Luis Demo',
  first_name: 'Ana & Luis',
  last_name: 'Demo',
  full_name: 'Ana & Luis Demo',
  age: 32,
  bio: 'Pareja abierta de CDMX explorando el lifestyle con reglas claras, respeto y mucha complicidad.',
  avatar_url: buildAssetUrl('img/demo-couple-avatar.jpg'),
  location: 'Ciudad de México, México',
  gender: 'couple',
  interests: [
    'Lifestyle Swinger',
    'Intercambio de Parejas',
    'Parejas Experimentadas',
    'Fiestas Temáticas',
    'Clubs Privados',
    'Eventos Exclusivos',
  ],
  is_admin: false,
  is_premium: true,
  is_verified: true,
  role: 'user',
  is_active: true,
  is_blocked: false,
  is_demo: true,
  is_online: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  account_type: 'couple',
  age_range_max: null,
  age_range_min: null,
  blocked_at: null,
  blocked_reason: null,
  interested_in: null,
  lifestyle_preferences: null,
  location_preferences: null,
  latitude: null,
  longitude: null,
  looking_for: null,
  max_distance: null,
  personality_traits: null,
  s2_cell_id: null,
  s2_level: null,
  suspension_end_date: null,
  swinger_experience: null,
  warnings_count: null,
  stats: {
    totalViews: 1890,
    totalLikes: 540,
    totalMatches: 73,
    profileCompleteness: 95,
  },
  interestsList: [
    'Intercambio Completo',
    'Full Swap',
    'Clubs Swinger México',
    'Aventuras Compartidas',
    'Reuniones Sociales',
    'Viajes en Pareja',
  ],
  nftImages: [nftImage1, nftImage2, nftImage3],
};
