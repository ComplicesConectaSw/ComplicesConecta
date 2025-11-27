/**
 * Tipos para Chat Summary Service
 * Tipos específicos para tablas de Supabase relacionadas con resúmenes de chat
 */

import type { Database } from '@/types/supabase-generated';

export type ChatSummaryRow = Database['public']['Tables']['chat_summaries']['Row'];
export type SummaryRequestRow = Database['public']['Tables']['summary_requests']['Row'];
export type MessageRow = Database['public']['Tables']['messages']['Row'];

/**
 * Interfaz para resumen de chat con tipos seguros
 */
export interface ChatSummaryData {
  id: string;
  chat_id: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  message_count: number;
  method: 'gpt4' | 'bart' | 'fallback';
  created_at: string;
}

/**
 * Interfaz para solicitud de resumen con tipos seguros
 */
export interface SummaryRequestData {
  id: string;
  user_id: string;
  chat_id: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

/**
 * Interfaz para mensaje con tipos seguros
 */
export interface MessageData {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

