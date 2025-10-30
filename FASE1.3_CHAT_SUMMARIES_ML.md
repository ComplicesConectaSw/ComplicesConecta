# 💬 FASE 1.3: CHAT SUMMARIES ML - ComplicesConecta v3.5.0

**Fecha Inicio:** 30 de Octubre, 2025 - 18:30 hrs  
**Duración Estimada:** 2 días  
**Estado:** 🚀 Iniciando

---

## 🎯 OBJETIVO

Implementar resúmenes automáticos de conversaciones usando ML (GPT-4 API o BART fine-tuned), con rate limiting, cache Redis, y UI integrada en `ChatHeader`.

**Inspirado en:** Facebook Messenger 2025 (AI summaries), WhatsApp Business (chat analytics)

---

## 📋 TAREAS (6 subtareas)

### 1. Crear ChatSummaryService (3 horas)
**Archivo:** `src/services/ai/ChatSummaryService.ts`

**Features:**
- Integración GPT-4 API (OpenAI)
- Fallback a BART fine-tuned (HuggingFace)
- Rate limiting (max 10 resúmenes/día por usuario)
- Cache de resúmenes (TTL 24h)
- Análisis de sentimiento
- Extracción de temas clave

### 2. Migración SQL (1 hora)
**Archivo:** `supabase/migrations/20251030_create_chat_summaries.sql`

**Tablas:**
- `chat_summaries`: Resúmenes generados
- `summary_requests`: Rate limiting
- `summary_feedback`: Feedback de usuarios (útil/no útil)

### 3. UI Components (2 horas)
**Archivos:**
- `src/components/chat/SummaryButton.tsx`
- `src/components/chat/SummaryModal.tsx`
- `src/components/chat/SummaryCard.tsx`

**Features:**
- Botón en `ChatHeader`
- Modal con resumen
- Loading states
- Error handling
- Feedback buttons

### 4. React Hook (1 hora)
**Archivo:** `src/hooks/ai/useChatSummary.ts`

**Features:**
- Estado: `isLoading`, `summary`, `error`
- Función: `generateSummary(chatId)`
- Rate limit check
- Cache check

### 5. Tests (2 horas)
**Archivo:** `src/tests/unit/ChatSummaryService.test.ts`

**Coverage:** >98%
- Test de generación
- Test de rate limiting
- Test de cache
- Test de fallback

### 6. Documentación (1 hora)
- Guía de uso
- Configuración API keys
- Troubleshooting

---

## 🚀 IMPLEMENTACIÓN

### Paso 1: Instalar Dependencias

```bash
npm install --save openai @huggingface/inference
```

### Paso 2: Crear ChatSummaryService.ts

**Ubicación:** `src/services/ai/ChatSummaryService.ts`

```typescript
import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';
import { supabase } from '@/lib/supabase';

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
      provider: import.meta.env.VITE_AI_SUMMARY_PROVIDER || 'auto',
      maxMessagesPerSummary: 100,
      rateLimitPerDay: 10,
    };

    // Inicializar OpenAI si hay API key
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey, dangerouslyAllowBrowser: true });
    }

    // Inicializar HuggingFace si hay API key
    const hfKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (hfKey) {
      this.hf = new HfInference(hfKey);
    }
  }

  /**
   * Genera resumen de conversación
   */
  async generateSummary(
    chatId: string,
    userId: string
  ): Promise<ChatSummary> {
    // 1. Verificar rate limit
    await this.checkRateLimit(userId);

    // 2. Verificar cache
    const cached = await this.getCachedSummary(chatId);
    if (cached) {
      console.log('[ChatSummary] Cache hit');
      return cached;
    }

    // 3. Obtener mensajes del chat
    const messages = await this.fetchMessages(chatId);
    
    if (messages.length === 0) {
      throw new Error('No messages found in chat');
    }

    // 4. Generar resumen usando ML
    let summary: string;
    let method: 'gpt4' | 'bart' | 'fallback';

    try {
      if (this.config.provider === 'openai' || this.config.provider === 'auto') {
        summary = await this.generateWithGPT4(messages);
        method = 'gpt4';
      } else if (this.config.provider === 'huggingface') {
        summary = await this.generateWithBART(messages);
        method = 'bart';
      } else {
        summary = this.generateFallback(messages);
        method = 'fallback';
      }
    } catch (error) {
      console.warn('[ChatSummary] ML generation failed, using fallback:', error);
      summary = this.generateFallback(messages);
      method = 'fallback';
    }

    // 5. Analizar sentimiento
    const sentiment = await this.analyzeSentiment(messages);

    // 6. Extraer temas
    const topics = await this.extractTopics(messages);

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

    // 8. Guardar en DB
    await this.saveSummary(chatSummary);

    // 9. Registrar request (rate limiting)
    await this.logSummaryRequest(userId, chatId);

    return chatSummary;
  }

  /**
   * Genera resumen con GPT-4
   */
  private async generateWithGPT4(messages: any[]): Promise<string> {
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
   */
  private async generateWithBART(messages: any[]): Promise<string> {
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
   */
  private generateFallback(messages: any[]): string {
    const messageCount = messages.length;
    const uniqueSenders = new Set(messages.map(m => m.sender)).size;
    
    return `Conversación con ${messageCount} mensajes entre ${uniqueSenders} personas. 
    Los temas principales incluyen: intercambio de información personal e intereses compartidos.`;
  }

  /**
   * Analiza sentimiento
   */
  private async analyzeSentiment(messages: any[]): Promise<'positive' | 'neutral' | 'negative'> {
    // TODO: Usar API de análisis de sentimiento o modelo local
    // Por ahora, simple heurística
    const text = messages.map(m => m.content).join(' ').toLowerCase();
    
    const positiveWords = ['genial', 'excelente', 'me encanta', 'perfecto', 'feliz'];
    const negativeWords = ['mal', 'terrible', 'odio', 'no me gusta', 'triste'];
    
    const positiveCount = positiveWords.filter(w => text.includes(w)).length;
    const negativeCount = negativeWords.filter(w => text.includes(w)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Extrae temas clave
   */
  private async extractTopics(messages: any[]): Promise<string[]> {
    // TODO: Usar NLP para extracción de temas
    // Por ahora, palabras frecuentes
    const text = messages.map(m => m.content).join(' ').toLowerCase();
    const words = text.split(/\s+/);
    const stopWords = new Set(['el', 'la', 'de', 'que', 'y', 'a', 'en']);
    
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    });
    
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Verifica rate limit
   */
  private async checkRateLimit(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    const { count } = await supabase
      .from('summary_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00Z`);
    
    if ((count || 0) >= this.config.rateLimitPerDay) {
      throw new Error('Rate limit exceeded. Try again tomorrow.');
    }
  }

  /**
   * Obtiene resumen del cache
   */
  private async getCachedSummary(chatId: string): Promise<ChatSummary | null> {
    const { data } = await supabase
      .from('chat_summaries')
      .select('*')
      .eq('chat_id', chatId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();
    
    if (!data) return null;
    
    return {
      id: data.id,
      chatId: data.chat_id,
      summary: data.summary,
      sentiment: data.sentiment,
      topics: data.topics,
      messageCount: data.message_count,
      method: data.method,
      createdAt: new Date(data.created_at),
    };
  }

  /**
   * Obtiene mensajes del chat
   */
  private async fetchMessages(chatId: string): Promise<any[]> {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles(name)')
      .eq('conversation_id', chatId)
      .order('created_at', { ascending: true })
      .limit(this.config.maxMessagesPerSummary);
    
    return data || [];
  }

  /**
   * Guarda resumen en DB
   */
  private async saveSummary(summary: ChatSummary): Promise<void> {
    await supabase.from('chat_summaries').insert({
      id: summary.id,
      chat_id: summary.chatId,
      summary: summary.summary,
      sentiment: summary.sentiment,
      topics: summary.topics,
      message_count: summary.messageCount,
      method: summary.method,
    });
  }

  /**
   * Registra request para rate limiting
   */
  private async logSummaryRequest(userId: string, chatId: string): Promise<void> {
    await supabase.from('summary_requests').insert({
      user_id: userId,
      chat_id: chatId,
    });
  }
}

// Singleton
export const chatSummaryService = new ChatSummaryService();
```

---

## 📊 MÉTRICAS OBJETIVO

- **Generación:** <3s (GPT-4), <5s (BART)
- **Rate limit:** 10 resúmenes/día
- **Cache TTL:** 24h
- **Accuracy:** >85% (feedback usuarios)
- **Costo:** <$0.01 por resumen (GPT-4)

---

## ✅ CHECKLIST

- [ ] Instalar openai + @huggingface/inference
- [ ] Crear ChatSummaryService.ts
- [ ] Crear migración SQL
- [ ] Crear SummaryButton.tsx
- [ ] Crear SummaryModal.tsx
- [ ] Crear useChatSummary.ts hook
- [ ] Tests unitarios (>98% coverage)
- [ ] Configurar API keys (.env)
- [ ] Integrar en ChatHeader
- [ ] Documentación
- [ ] Commit y push

---

## 🔐 CONFIGURACIÓN

### Variables de Entorno (.env)

```env
# Chat Summaries ML
VITE_AI_CHAT_SUMMARIES_ENABLED=false
VITE_AI_SUMMARY_PROVIDER=auto  # openai | huggingface | auto
VITE_OPENAI_API_KEY=sk-...
VITE_HUGGINGFACE_API_KEY=hf_...
```

---

## 🎯 PRÓXIMO (Después de 1.3)

**Fase 2.1: Google S2 Geosharding** (3 días)
- Implementar celdas S2
- Queries paralelas por región
- Índices espaciales

---

**Tiempo Estimado:** 2 días (16 horas)  
**Progreso Global:** 20% → 28% (+8%)

---

*Fase 1.3 - Chat Summaries ML - ComplicesConecta v3.5.0*

