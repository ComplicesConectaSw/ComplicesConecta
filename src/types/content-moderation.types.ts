/**
 * Tipos para ContentModerationService - ComplicesConecta v3.5.0
 * Reemplaza any con tipos específicos para moderación de contenido
 */

/**
 * Datos de perfil para moderación
 */
export interface ProfileData {
  id?: string;
  name?: string;
  email?: string;
  bio?: string;
  age?: number;
  location?: string;
  photos?: string[];
  interests?: string[];
  preferences?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown; // Para propiedades adicionales desconocidas
}

/**
 * Análisis de texto para moderación
 */
export interface TextAnalysis {
  detected_issues: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  toxicity?: number;
  spam_probability?: number;
  [key: string]: unknown;
}

/**
 * Reglas de contexto para moderación
 */
export interface ContextRules {
  maxLength: number;
  allowLinks: boolean;
  allowEmojis: boolean;
  requirePersonalContent: boolean;
}

/**
 * Metadatos de mensaje para moderación
 */
export interface MessageMetadata {
  recipientId?: string;
  senderId?: string;
  messageType?: 'private' | 'public' | 'group';
  [key: string]: unknown;
}

