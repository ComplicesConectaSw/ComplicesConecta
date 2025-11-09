/**
 * ConsentVerificationService - Verificador IA de Consentimiento en Chats
 * 
 * Sistema real-time de verificación de consentimiento usando NLP con OpenAI.
 * Pausa automática si consenso <80% (Ley Olimpia MX).
 * 
 * Features:
 * - Real-time monitoring de chat_messages
 * - NLP Analysis con OpenAI GPT-4
 * - Consenso scoring basado en historial
 * - Auto-pause si consenso <80%
 * 
 * @version 3.5.0
 * @date 2025-11-06
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import OpenAI from 'openai';

export interface ConsentScore {
  score: number; // 0-100
  confidence: number; // 0-1
  status: 'consent' | 'uncertain' | 'non_consent' | 'insufficient_data';
  reasoning: string;
  lastUpdated: Date;
}

export interface ConsentVerification {
  id: string;
  chatId: string;
  userId1: string;
  userId2: string;
  currentScore: ConsentScore;
  messageCount: number;
  isPaused: boolean;
  pauseReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CONSENT_THRESHOLD = 80; // Pausa si <80%
const MIN_MESSAGES_FOR_ANALYSIS = 3; // Mínimo de mensajes para análisis

class ConsentVerificationService {
  private static instance: ConsentVerificationService;
  private openai: OpenAI | null = null;
  private activeVerifications: Map<string, ConsentVerification> = new Map();
  private messageSubscriptions: Map<string, () => void> = new Map();

  private constructor() {
    // Inicializar OpenAI si hay API key
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiKey) {
      this.openai = new OpenAI({
        apiKey: openaiKey,
        dangerouslyAllowBrowser: true
      });
      logger.info('✅ OpenAI inicializado para Consent Verification');
    } else {
      logger.warn('⚠️ OpenAI API key no configurada, usando fallback');
    }
  }

  static getInstance(): ConsentVerificationService {
    if (!ConsentVerificationService.instance) {
      ConsentVerificationService.instance = new ConsentVerificationService();
    }
    return ConsentVerificationService.instance;
  }

  /**
   * Inicia monitoreo real-time de consentimiento en un chat
   */
  async startMonitoring(chatId: string, userId1: string, userId2: string): Promise<void> {
    try {
      logger.info('🔍 Iniciando monitoreo de consentimiento', {
        chatId,
        userId1: userId1.substring(0, 8) + '***',
        userId2: userId2.substring(0, 8) + '***'
      });

      // Verificar si ya existe verificación
      const existing = await this.getVerification(chatId);
      if (existing) {
        logger.debug('Verificación existente encontrada', { chatId });
        return;
      }

      // Crear verificación inicial
      const verification: ConsentVerification = {
        id: crypto.randomUUID(),
        chatId,
        userId1,
        userId2,
        currentScore: {
          score: 50, // Neutral inicial
          confidence: 0.5,
          status: 'insufficient_data',
          reasoning: 'Análisis inicial - esperando mensajes',
          lastUpdated: new Date()
        },
        messageCount: 0,
        isPaused: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.activeVerifications.set(chatId, verification);

      // Suscribirse a mensajes en tiempo real
      await this.subscribeToMessages(chatId, userId1, userId2);

      // Guardar en BD
      await this.saveVerification(verification);

      logger.info('✅ Monitoreo iniciado exitosamente', { chatId });
    } catch (error) {
      logger.error('❌ Error iniciando monitoreo', {
        error: error instanceof Error ? error.message : String(error),
        chatId
      });
      throw error;
    }
  }

  /**
   * Detiene monitoreo de un chat
   */
  async stopMonitoring(chatId: string): Promise<void> {
    try {
      // Desuscribirse de mensajes
      const unsubscribe = this.messageSubscriptions.get(chatId);
      if (unsubscribe) {
        unsubscribe();
        this.messageSubscriptions.delete(chatId);
      }

      // Remover de memoria
      this.activeVerifications.delete(chatId);

      logger.info('🛑 Monitoreo detenido', { chatId });
    } catch (error) {
      logger.error('Error deteniendo monitoreo', { error, chatId });
    }
  }

  /**
   * Obtiene verificación actual de un chat
   */
  async getVerification(chatId: string): Promise<ConsentVerification | null> {
    // Primero buscar en memoria
    const cached = this.activeVerifications.get(chatId);
    if (cached) {
      return cached;
    }

    // Si no está en memoria, buscar en BD
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('consent_verifications')
        .select('*')
        .eq('chat_id', chatId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      const verification: ConsentVerification = {
        id: data.id,
        chatId: data.chat_id || '',
        userId1: data.user_id1 || '',
        userId2: data.user_id2 || '',
        currentScore: {
          score: data.consent_score || 50,
          confidence: data.confidence || 0.5,
          status: (data.status as ConsentScore['status']) || 'insufficient_data',
          reasoning: data.reasoning || '',
          lastUpdated: new Date(data.updated_at || new Date().toISOString())
        },
        messageCount: data.message_count || 0,
        isPaused: data.is_paused || false,
        pauseReason: data.pause_reason || undefined,
        createdAt: new Date(data.created_at || new Date().toISOString()),
        updatedAt: new Date(data.updated_at || new Date().toISOString())
      };

      // Cachear en memoria
      this.activeVerifications.set(chatId, verification);

      return verification;
    } catch (error) {
      logger.error('Error obteniendo verificación', { error, chatId });
      return null;
    }
  }

  /**
   * Analiza mensaje nuevo y actualiza score de consentimiento
   */
  private async analyzeMessage(
    message: string,
    senderId: string,
    chatId: string,
    userId1: string,
    userId2: string
  ): Promise<ConsentScore> {
    try {
      // Obtener historial reciente de mensajes
      const recentMessages = await this.getRecentMessages(chatId, 10);

      if (recentMessages.length < MIN_MESSAGES_FOR_ANALYSIS) {
        return {
          score: 50,
          confidence: 0.3,
          status: 'insufficient_data',
          reasoning: `Necesarios al menos ${MIN_MESSAGES_FOR_ANALYSIS} mensajes para análisis`,
          lastUpdated: new Date()
        };
      }

      // Usar OpenAI para análisis NLP si está disponible
      if (this.openai) {
        return await this.analyzeWithOpenAI(recentMessages, senderId, userId1, userId2);
      }

      // Fallback: análisis básico con patrones
      return this.analyzeWithPatterns(recentMessages, senderId);
    } catch (error) {
      logger.error('Error analizando mensaje', {
        error: error instanceof Error ? error.message : String(error),
        chatId
      });
      return {
        score: 50,
        confidence: 0.3,
        status: 'uncertain',
        reasoning: 'Error en análisis - usando fallback',
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Análisis con OpenAI GPT-4
   */
  private async analyzeWithOpenAI(
    messages: Array<{ content: string; sender_id: string; created_at: string }>,
    senderId: string,
    userId1: string,
    _userId2: string
  ): Promise<ConsentScore> {
    if (!this.openai) {
      throw new Error('OpenAI no está disponible');
    }

    const messagesText = messages
      .map(m => `Usuario ${m.sender_id === userId1 ? '1' : '2'}: ${m.content}`)
      .join('\n');

    const prompt = `Analiza el siguiente chat entre dos usuarios adultos (+18) y determina el nivel de consentimiento mutuo.

Contexto: Esta es una aplicación de conexión social para adultos. Analiza:
1. Consentimiento explícito o implícito
2. Negación o rechazo
3. Ambiguidad o incertidumbre
4. Patrones de comunicación respetuosa

Chat:
${messagesText}

Responde SOLO con un JSON válido en este formato exacto:
{
  "score": 0-100,
  "confidence": 0.0-1.0,
  "status": "consent" | "uncertain" | "non_consent" | "insufficient_data",
  "reasoning": "explicación breve en español"
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('Respuesta vacía de OpenAI');
      }

      // Parsear JSON de la respuesta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se encontró JSON en la respuesta');
      }

      const parsed = JSON.parse(jsonMatch[0]) as ConsentScore;
      
      return {
        ...parsed,
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error en análisis OpenAI', { error });
      // Fallback a análisis con patrones
      return this.analyzeWithPatterns(messages, senderId);
    }
  }

  /**
   * Análisis básico con patrones (fallback)
   */
  private analyzeWithPatterns(
    messages: Array<{ content: string; sender_id: string }>,
    _senderId: string
  ): ConsentScore {
    const text = messages.map(m => m.content.toLowerCase()).join(' ');

    // Patrones de consentimiento explícito
    const consentPatterns = [
      /\b(sí|si|yes|ok|okay|de acuerdo|acepto|consiento|me parece bien|estoy de acuerdo)\b/i,
      /\b(me gusta|me encanta|quiero|deseo|me interesa)\b/i,
      /\b(perfecto|genial|excelente|fantástico)\b/i
    ];

    // Patrones de negación
    const nonConsentPatterns = [
      /\b(no|nunca|jamás|no quiero|no me gusta|no estoy de acuerdo|rechazo|no acepto)\b/i,
      /\b(para|detente|stop|basta|no más)\b/i,
      /\b(incomodo|incómodo|molesto|molesta)\b/i
    ];

    let consentCount = 0;
    let nonConsentCount = 0;

    consentPatterns.forEach(pattern => {
      if (pattern.test(text)) consentCount++;
    });

    nonConsentPatterns.forEach(pattern => {
      if (pattern.test(text)) nonConsentCount++;
    });

    // Calcular score
    const totalSignals = consentCount + nonConsentCount;
    let score = 50; // Neutral

    if (totalSignals > 0) {
      score = Math.round((consentCount / totalSignals) * 100);
    }

    let status: ConsentScore['status'] = 'uncertain';
    if (score >= 80) status = 'consent';
    else if (score <= 30) status = 'non_consent';
    else if (totalSignals === 0) status = 'insufficient_data';

    return {
      score,
      confidence: totalSignals > 0 ? Math.min(0.8, totalSignals / 10) : 0.3,
      status,
      reasoning: `Análisis con patrones: ${consentCount} señales de consentimiento, ${nonConsentCount} de negación`,
      lastUpdated: new Date()
    };
  }

  /**
   * Suscribe a mensajes en tiempo real
   */
  private async subscribeToMessages(
    chatId: string,
    userId1: string,
    userId2: string
  ): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }

    // Obtener room_id del chat
    const { data: chatRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('id', chatId)
      .single();

    if (!chatRoom) {
      logger.warn('Chat room no encontrado', { chatId });
      return;
    }

    const channel = supabase
      .channel(`consent-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${chatId}`
        },
        async (payload) => {
          const newMessage = payload.new as {
            id: string;
            content: string;
            sender_id: string;
            room_id: string;
            created_at: string;
          };

          logger.debug('Nuevo mensaje detectado', {
            chatId,
            senderId: newMessage.sender_id.substring(0, 8) + '***'
          });

          // Analizar mensaje
          const consentScore = await this.analyzeMessage(
            newMessage.content,
            newMessage.sender_id,
            chatId,
            userId1,
            userId2
          );

          // Actualizar verificación
          await this.updateVerification(chatId, consentScore);
        }
      )
      .subscribe();

    // Guardar función de desuscripción
    this.messageSubscriptions.set(chatId, () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    });
  }

  /**
   * Obtiene mensajes recientes del chat
   */
  private async getRecentMessages(
    chatId: string,
    limit: number = 10
  ): Promise<Array<{ content: string; sender_id: string; created_at: string }>> {
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('content, sender_id, created_at')
      .eq('room_id', chatId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.reverse(); // Ordenar cronológicamente
  }

  /**
   * Actualiza verificación con nuevo score
   */
  private async updateVerification(
    chatId: string,
    newScore: ConsentScore
  ): Promise<void> {
    const verification = this.activeVerifications.get(chatId);
    if (!verification) {
      return;
    }

    // Actualizar score
    verification.currentScore = newScore;
    verification.messageCount++;
    verification.updatedAt = new Date();

    // Verificar si debe pausarse
    if (newScore.score < CONSENT_THRESHOLD && newScore.status !== 'insufficient_data') {
      verification.isPaused = true;
      verification.pauseReason = `Consenso bajo (${newScore.score}%) - Pausa automática por seguridad`;
      logger.warn('⚠️ Chat pausado por bajo consenso', {
        chatId,
        score: newScore.score,
        reasoning: newScore.reasoning
      });
    } else if (newScore.score >= CONSENT_THRESHOLD) {
      verification.isPaused = false;
      verification.pauseReason = undefined;
    }

    // Guardar en BD
    await this.saveVerification(verification);
  }

  /**
   * Guarda verificación en BD
   */
  private async saveVerification(verification: ConsentVerification): Promise<void> {
    if (!supabase) {
      return;
    }

    try {
      const { error } = await supabase
        .from('consent_verifications')
        .upsert({
          id: verification.id,
          chat_id: verification.chatId,
          user_id1: verification.userId1,
          user_id2: verification.userId2,
          consent_score: verification.currentScore.score,
          confidence: verification.currentScore.confidence,
          status: verification.currentScore.status,
          reasoning: verification.currentScore.reasoning,
          message_count: verification.messageCount,
          is_paused: verification.isPaused,
          pause_reason: verification.pauseReason,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'chat_id'
        });

      if (error) {
        logger.error('Error guardando verificación', { error, chatId: verification.chatId });
      }
    } catch (error) {
      logger.error('Error en saveVerification', { error });
    }
  }

  /**
   * Verifica si un chat está pausado
   */
  async isChatPaused(chatId: string): Promise<boolean> {
    const verification = await this.getVerification(chatId);
    return verification?.isPaused || false;
  }

  /**
   * Reanuda un chat pausado (requiere acción manual del usuario)
   */
  async resumeChat(chatId: string, userId: string): Promise<boolean> {
    const verification = await this.getVerification(chatId);
    if (!verification) {
      return false;
    }

    // Verificar que el usuario tiene permiso
    if (verification.userId1 !== userId && verification.userId2 !== userId) {
      return false;
    }

    // Reanudar solo si el score actual es >= threshold
    if (verification.currentScore.score >= CONSENT_THRESHOLD) {
      verification.isPaused = false;
      verification.pauseReason = undefined;
      await this.saveVerification(verification);
      return true;
    }

    return false;
  }
}

export const consentVerificationService = ConsentVerificationService.getInstance();
export default consentVerificationService;

