/**
 * Chat Summary Service - Resúmenes automáticos de conversaciones con ML
 * v3.5.0 - Fase 1.3
 * 
 * Features:
 * - Integración GPT-4 API (OpenAI)
 * - Fallback a BART (HuggingFace)
 * - Rate limiting (10 resúmenes/día)
 * - Cache 24h
 * - Análisis de sentimiento
 * - Extracción de temas
 * 
 * Inspirado en: Facebook Messenger 2025, WhatsApp Business
 * 
 * @version 3.5.0
 * @date 2025-10-30
 */

import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { ChatSummaryRow } from '@/types/chat-summary.types';

export interface ChatSummary {
  id: string;
  chatId: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  messageCount: number;
  method: 'gpt4' | 'bart' | 'fallback';
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  created_at: string;
}

export class ChatSummaryService {
  private openai: OpenAI | null = null;
  private hf: HfInference | null = null;
  private config: {
    enabled: boolean;
    provider: 'openai' | 'huggingface' | 'auto';
    maxMessagesPerSummary: number;
    rateLimitPerDay: number;
  };

  constructor() {
    this.config = {
      enabled: import.meta.env.VITE_AI_CHAT_SUMMARIES_ENABLED === 'true',
      provider: (import.meta.env.VITE_AI_SUMMARY_PROVIDER || 'auto') as 'openai' | 'huggingface' | 'auto',
      maxMessagesPerSummary: 100,
      rateLimitPerDay: 10,
    };

    // Inicializar OpenAI si hay API key
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiKey) {
      this.openai = new OpenAI({ 
        apiKey: openaiKey, 
        dangerouslyAllowBrowser: true // Solo para desarrollo
      });
      logger.info('OpenAI initialized');
    }

    // Inicializar HuggingFace si hay API key
    const hfKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (hfKey) {
      this.hf = new HfInference(hfKey);
      logger.info('HuggingFace initialized');
    }
  }

  /**
   * Verifica si el servicio está habilitado
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Genera resumen de conversación
   * @param chatId ID de la conversación
   * @param userId ID del usuario solicitante
   * @returns Resumen generado
   */
  async generateSummary(
    chatId: string,
    userId: string
  ): Promise<ChatSummary> {
    logger.info('Generating summary for chat', { chatId });

    // 1. Verificar rate limit
    await this.checkRateLimit(userId);

    // 2. Verificar cache
    const cached = await this.getCachedSummary(chatId);
    if (cached) {
      logger.info('Cache hit, returning cached summary', { chatId });
      return cached;
    }

    // 3. Obtener mensajes del chat
    const messages = await this.fetchMessages(chatId);
    
    if (messages.length === 0) {
      throw new Error('No messages found in chat');
    }

    logger.info(`Processing ${messages.length} messages`, { chatId, messageCount: messages.length });

    // 4. Generar resumen usando ML
    let summary: string;
    let method: 'gpt4' | 'bart' | 'fallback';

    try {
      if (this.config.provider === 'openai' || (this.config.provider === 'auto' && this.openai)) {
        logger.debug('Using GPT-4');
        summary = await this.generateWithGPT4(messages);
        method = 'gpt4';
      } else if (this.config.provider === 'huggingface' && this.hf) {
        logger.debug('Using BART (HuggingFace)');
        summary = await this.generateWithBART(messages);
        method = 'bart';
      } else {
        logger.debug('Using fallback method');
        summary = this.generateFallback(messages);
        method = 'fallback';
      }
    } catch (error) {
      logger.warn('ML generation failed, using fallback', { error });
      summary = this.generateFallback(messages);
      method = 'fallback';
    }

    // 5. Analizar sentimiento
    const sentiment = this.analyzeSentiment(messages);

    // 6. Extraer temas
    const topics = this.extractTopics(messages);

    // 7. Crear registro
    const chatSummary: ChatSummary = {
      id: crypto.randomUUID(),
      chatId,
      summary,
      sentiment,
      topics,
      messageCount: messages.length,
      method,
      createdAt: new Date(),
    };

    logger.info('Summary generated', {
      method,
      sentiment,
      topics,
      messageCount: messages.length,
    });

    // 8. Guardar en DB
    await this.saveSummary(chatSummary);

    // 9. Registrar request (rate limiting)
    await this.logSummaryRequest(userId, chatId);

    return chatSummary;
  }

  /**
   * Genera resumen con GPT-4
   * @private
   */
  private async generateWithGPT4(messages: ChatMessage[]): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    const messagesText = messages
      .map(m => `${m.sender}: ${m.content}`)
      .join('\n');

    const prompt = `Genera un resumen breve (máximo 3 oraciones) de la siguiente conversación en español. 
Enfócate en los temas principales y el tono general:

${messagesText}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.5,
    });

    return completion.choices[0].message.content || 'No se pudo generar resumen';
  }

  /**
   * Genera resumen con BART (HuggingFace)
   * @private
   */
  private async generateWithBART(messages: ChatMessage[]): Promise<string> {
    if (!this.hf) {
      throw new Error('HuggingFace not configured');
    }

    const messagesText = messages
      .map(m => `${m.sender}: ${m.content}`)
      .join(' ');

    const result = await this.hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: messagesText,
      parameters: {
        max_length: 150,
        min_length: 30,
      },
    });

    return result.summary_text;
  }

  /**
   * Resumen fallback (sin ML)
   * Genera resumen básico cuando no hay API ML disponible
   * @private
   */
  private generateFallback(messages: ChatMessage[]): string {
    const messageCount = messages.length;
    const uniqueSenders = new Set(messages.map(m => m.sender)).size;
    
    // Intentar extraer tema principal de primeros mensajes
    const firstMessages = messages.slice(0, 5).map(m => m.content).join(' ');
    const mainTopic = firstMessages.substring(0, 50);
    
    return `Conversación con ${messageCount} mensajes entre ${uniqueSenders} personas. Tema inicial: "${mainTopic}...". Los participantes intercambiaron información personal e intereses compartidos.`;
  }

  /**
   * Analiza sentimiento de la conversación
   * @private
   */
  private analyzeSentiment(messages: ChatMessage[]): 'positive' | 'neutral' | 'negative' {
    const text = messages.map(m => m.content).join(' ').toLowerCase();
    
    // Palabras clave en español
    const positiveWords = [
      'genial', 'excelente', 'me encanta', 'perfecto', 'feliz', 'increíble',
      'maravilloso', 'fantástico', 'bueno', 'bien', 'amor', 'gracias',
      '❤️', '😊', '😍', '🥰', '👍', '✨'
    ];
    
    const negativeWords = [
      'mal', 'terrible', 'odio', 'no me gusta', 'triste', 'horrible',
      'pésimo', 'molesto', 'enfadado', 'decepcionado', 'aburrido',
      '😡', '😠', '😢', '😞', '👎'
    ];
    
    const positiveCount = positiveWords.filter(w => text.includes(w)).length;
    const negativeCount = negativeWords.filter(w => text.includes(w)).length;
    
    if (positiveCount > negativeCount + 1) return 'positive';
    if (negativeCount > positiveCount + 1) return 'negative';
    return 'neutral';
  }

  /**
   * Extrae temas clave de la conversación
   * @private
   */
  private extractTopics(messages: ChatMessage[]): string[] {
    const text = messages.map(m => m.content).join(' ').toLowerCase();
    const words = text.split(/\s+/);
    
    // Stop words en español
    const stopWords = new Set([
      'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no',
      'haber', 'por', 'con', 'su', 'para', 'como', 'estar', 'tener',
      'le', 'lo', 'todo', 'pero', 'más', 'hacer', 'o', 'poder', 'decir',
      'este', 'ir', 'otro', 'ese', 'la', 'si', 'me', 'ya', 'ver', 'porque',
      'dar', 'cuando', 'él', 'muy', 'sin', 'vez', 'mucho', 'saber', 'qué',
      'sobre', 'mi', 'alguno', 'mismo', 'yo', 'también', 'hasta', 'año',
      'dos', 'querer', 'entre', 'así', 'primero', 'desde', 'grande', 'eso',
      'ni', 'nos', 'llegar', 'pasar', 'tiempo', 'ella', 'sí', 'día', 'uno',
      'bien', 'poco', 'deber', 'entonces', 'poner', 'cosa', 'tanto', 'hombre',
      'parecer', 'nuestro', 'tan', 'donde', 'ahora', 'parte', 'después', 'vida',
    ]);
    
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      const cleanWord = word.replace(/[^\wáéíóúñü]/gi, '');
      if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
        wordCount.set(cleanWord, (wordCount.get(cleanWord) || 0) + 1);
      }
    });
    
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Verifica rate limit del usuario
   * @private
   */
  private async checkRateLimit(userId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const { count } = await supabase
      .from('summary_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00Z`);
    
    if ((count || 0) >= this.config.rateLimitPerDay) {
      throw new Error(`Rate limit exceeded. Maximum ${this.config.rateLimitPerDay} summaries per day. Try again tomorrow.`);
    }
  }

  /**
   * Obtiene resumen del cache (24h TTL)
   * @private
   */
  private async getCachedSummary(chatId: string): Promise<ChatSummary | null> {
    if (!supabase) {
      return null;
    }
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('chat_summaries')
      .select('*')
      .eq('chat_id', chatId)
      .gte('created_at', oneDayAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) return null;
    
    const summaryRow = data as ChatSummaryRow;
    
    return {
      id: summaryRow.id,
      chatId: summaryRow.chat_id,
      summary: summaryRow.summary,
      sentiment: (summaryRow.sentiment || 'neutral') as 'positive' | 'neutral' | 'negative',
      topics: (summaryRow.topics as string[]) || [],
      messageCount: summaryRow.message_count || 0,
      method: (summaryRow.method || 'fallback') as 'gpt4' | 'bart' | 'fallback',
      createdAt: new Date(summaryRow.created_at || new Date().toISOString()),
    };
  }

  /**
   * Obtiene mensajes del chat
   * @private
   */
  private async fetchMessages(chatId: string): Promise<ChatMessage[]> {
    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }
    
    const { data, error } = await supabase
      .from('messages')
      .select('id, content, sender_id, created_at, sender:profiles(name)')
      .eq('conversation_id', chatId)
      .order('created_at', { ascending: true })
      .limit(this.config.maxMessagesPerSummary);
    
    if (error) {
      logger.error('Error fetching messages', { error, chatId });
      throw error;
    }

    return (data || []).map(msg => {
      // Tipar correctamente el resultado de Supabase con relación sender:profiles(name)
      const sender = msg.sender as { name?: string } | null | undefined;
      return {
        id: msg.id,
        sender: sender?.name || 'Usuario',
        content: msg.content,
        created_at: msg.created_at || '',
      };
    });
  }

  /**
   * Guarda resumen en DB
   * @private
   */
  private async saveSummary(summary: ChatSummary): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }
    
    const { error } = await supabase.from('chat_summaries').insert({
      id: summary.id,
      chat_id: summary.chatId,
      summary: summary.summary,
      sentiment: summary.sentiment,
      topics: summary.topics,
      message_count: summary.messageCount,
      method: summary.method,
    });

    if (error) {
      logger.error('Error saving summary', { error, summaryId: summary.id });
      throw error;
    }
  }

  /**
   * Registra request para rate limiting
   * @private
   */
  private async logSummaryRequest(userId: string, chatId: string): Promise<void> {
    if (!supabase) {
      logger.warn('Supabase no está disponible, no se puede registrar request', { userId, chatId });
      return;
    }
    
    const { error } = await supabase.from('summary_requests').insert({
      user_id: userId,
      chat_id: chatId,
    });

    if (error) {
      logger.warn('Error logging request', { error, userId, chatId });
    }
  }

  /**
   * Obtiene estadísticas de uso
   */
  async getUsageStats(userId: string): Promise<{
    usedToday: number;
    limit: number;
    remaining: number;
  }> {
    if (!supabase) {
      return {
        usedToday: 0,
        limit: this.config.rateLimitPerDay,
        remaining: this.config.rateLimitPerDay
      };
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const { count } = await supabase
      .from('summary_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00Z`);
    
    const usedToday = count || 0;
    
    return {
      usedToday,
      limit: this.config.rateLimitPerDay,
      remaining: Math.max(0, this.config.rateLimitPerDay - usedToday),
    };
  }
}

// Singleton instance
export const chatSummaryService = new ChatSummaryService();

