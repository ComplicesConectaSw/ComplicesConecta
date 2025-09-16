// Theme system types for ComplicesConecta v2.8.3

export type Gender = 'male' | 'female';
export type ProfileType = 'single' | 'couple';
export type Theme = 'elegant' | 'modern' | 'vibrant';

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
