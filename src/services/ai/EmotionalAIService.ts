/**
 * EmotionalAIService - Análisis Emocional con GPT-4
 * 
 * Analiza chats para determinar química emocional
 * Usa GPT-4 para análisis de sentimientos y valores
 * 
 * @version 3.5.0
 */

import OpenAI from 'openai';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface EmotionalAnalysis {
  score: number; // 0-100
  reasons: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  chemistry: number; // 0-1
  valuesAlignment: number; // 0-1
}

class EmotionalAIService {
  private static instance: EmotionalAIService;
  private openai: OpenAI | null = null;

  constructor() {
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiKey) {
      this.openai = new OpenAI({
        apiKey: openaiKey,
        dangerouslyAllowBrowser: true
      });
      logger.info('✅ OpenAI inicializado para Emotional AI');
    } else {
      logger.warn('⚠️ OpenAI API key no configurada, usando fallback');
    }
  }

  static getInstance(): EmotionalAIService {
    if (!EmotionalAIService.instance) {
      EmotionalAIService.instance = new EmotionalAIService();
    }
    return EmotionalAIService.instance;
  }

  /**
   * Analiza emociones de chats entre dos usuarios
   */
  async analyzeChatEmotions(userId1: string, userId2: string): Promise<EmotionalAnalysis> {
    try {
      // 1. Obtener mensajes entre los dos usuarios
      const messages = await this.getChatMessages(userId1, userId2);

      if (messages.length < 3) {
        return {
          score: 50,
          reasons: ['Insuficientes mensajes para análisis emocional'],
          sentiment: 'neutral',
          chemistry: 0.5,
          valuesAlignment: 0.5
        };
      }

      // 2. Usar GPT-4 para análisis si está disponible
      if (this.openai) {
        return await this.analyzeWithGPT4(messages, userId1, userId2);
      }

      // 3. Fallback: análisis básico con patrones
      return this.analyzeWithPatterns(messages);
    } catch (error) {
      logger.error('Error analizando emociones', { error });
      return {
        score: 50,
        reasons: ['Error en análisis emocional'],
        sentiment: 'neutral',
        chemistry: 0.5,
        valuesAlignment: 0.5
      };
    }
  }

  /**
   * Análisis con GPT-4
   */
  private async analyzeWithGPT4(
    messages: Array<{ content: string; sender_id: string; created_at: string }>,
    userId1: string,
    _userId2: string
  ): Promise<EmotionalAnalysis> {
    if (!this.openai) {
      throw new Error('OpenAI no está disponible');
    }

    const messagesText = messages
      .map(m => `Usuario ${m.sender_id === userId1 ? '1' : '2'}: ${m.content}`)
      .join('\n');

    const prompt = `Analiza la química emocional y alineación de valores entre dos usuarios adultos (+18) basándote en su conversación.

Chat:
${messagesText}

Responde SOLO con un JSON válido:
{
  "score": 0-100,
  "sentiment": "positive" | "neutral" | "negative",
  "chemistry": 0.0-1.0,
  "valuesAlignment": 0.0-1.0,
  "reasons": ["razón1", "razón2", ...]
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('Respuesta vacía de OpenAI');
      }

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se encontró JSON en la respuesta');
      }

      const parsed = JSON.parse(jsonMatch[0]) as EmotionalAnalysis;
      return parsed;
    } catch (error) {
      logger.error('Error en análisis GPT-4', { error });
      return this.analyzeWithPatterns(messages);
    }
  }

  /**
   * Análisis básico con patrones (fallback)
   */
  private analyzeWithPatterns(
    messages: Array<{ content: string; sender_id: string }>
  ): EmotionalAnalysis {
    const text = messages.map(m => m.content.toLowerCase()).join(' ');

    // Patrones positivos
    const positivePatterns = [
      /\b(me gusta|me encanta|genial|perfecto|excelente|fantástico)\b/i,
      /\b(gracias|de nada|por favor|disculpa)\b/i,
      /\b(quiero|deseo|me interesa)\b/i
    ];

    // Patrones negativos
    const negativePatterns = [
      /\b(no me gusta|odio|detesto|horrible|terrible)\b/i,
      /\b(no quiero|rechazo|no estoy de acuerdo)\b/i
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    positivePatterns.forEach(pattern => {
      if (pattern.test(text)) positiveCount++;
    });

    negativePatterns.forEach(pattern => {
      if (pattern.test(text)) negativeCount++;
    });

    const totalSignals = positiveCount + negativeCount;
    const score = totalSignals > 0
      ? Math.round((positiveCount / totalSignals) * 100)
      : 50;

    return {
      score,
      reasons: [
        `${positiveCount} señales positivas`,
        `${negativeCount} señales negativas`
      ],
      sentiment: score >= 70 ? 'positive' : score <= 30 ? 'negative' : 'neutral',
      chemistry: Math.min(1, positiveCount / 10),
      valuesAlignment: Math.min(1, (positiveCount - negativeCount) / 10)
    };
  }

  /**
   * Obtiene mensajes de chat entre dos usuarios
   */
  private async getChatMessages(
    userId1: string,
    userId2: string
  ): Promise<Array<{ content: string; sender_id: string; created_at: string }>> {
    if (!supabase) {
      return [];
    }

    // Obtener room_id donde ambos usuarios han enviado mensajes
    // Buscar sala donde userId1 es user1_id o user2_id, Y donde userId2 es user1_id o user2_id
    const { data: rooms } = await supabase
      .from('chat_rooms')
      .select('id')
      .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`)
      .limit(1);

    if (!rooms || rooms.length === 0) {
      return [];
    }

    const roomId = rooms[0].id;

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('content, sender_id, created_at')
      .eq('room_id', roomId)
      .in('sender_id', [userId1, userId2])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !messages) {
      return [];
    }

    return messages.reverse();
  }
}

export const emotionalAIService = EmotionalAIService.getInstance();
export default emotionalAIService;

