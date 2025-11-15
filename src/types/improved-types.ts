// Definiciones de tipos mejoradas para reducir 'as any'
// Generado automáticamente por el refactor

declare global {
  interface Window {
    // Propiedades comunes de window que se usan en el proyecto
    ethereum?: any;
    solana?: any;
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
    hasWalletProtection?: boolean;
    [key: string]: any;
  }
  
  interface Document {
    // Propiedades específicas que se usan
    fonts?: {
      values(): any[];
      [key: string]: any;
    };
  }
}

// Tipos utilitarios para reducir 'as any'
export type SafeAny = Record<string, unknown>;
export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  success: boolean;
  [key: string]: unknown;
};

export type EventHandler<T = Event> = (event: T) => void;
export type ErrorHandler = (error: Error | unknown) => void;

// Tipos para Supabase
export type SupabaseResponse<T = unknown> = {
  data: T | null;
  error: any | null;
  count?: number;
  status?: number;
  statusText?: string;
};

// Tipos para autenticación
export type AuthUser = {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

export type AuthSession = {
  user: AuthUser;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  [key: string]: unknown;
};

export {};