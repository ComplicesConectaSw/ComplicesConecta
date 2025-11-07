// Servicio de IA Pre-clasificación de Reportes
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface AIClassificationResult {
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  tags: string[];
  summary: string;
  detected_toxicity: number;
  detected_spam: number;
  detected_explicit: number;
  detected_harassment: number;
  suggested_priority: 'low' | 'medium' | 'high' | 'critical';
  suggested_action?: string;
}

export interface ReportWithClassification {
  id: string;
  reporter_user_id: string;
  reported_user_id: string;
  content_type: string;
  reason: string;
  description?: string;
  status: string;
  severity?: string;
  created_at: string;
  ai_classified: boolean;
  queue_position?: number;
  assigned_to?: string;
  ai_classification?: AIClassificationResult;
}

/**
 * Clasificar reporte usando IA
 */
export const classifyReportWithAI = async (
  reportId: string,
  reportData: {
    reason: string;
    description?: string;
    content_type: string;
  }
): Promise<AIClassificationResult> => {
  try {
    // Análisis básico de texto (en producción, usar modelo ML real)
    const text = `${reportData.reason} ${reportData.description || ''}`.toLowerCase();
    
    // Detectar toxicidad
    const toxicWords = ['odio', 'basura', 'mierda', 'estúpido', 'idiota', 'puto', 'joder'];
    const detected_toxicity = toxicWords.reduce((score, word) => {
      return score + (text.includes(word) ? 20 : 0);
    }, 0);

    // Detectar spam
    const spamPatterns = ['comprar', 'oferta', 'descuento', 'gratis', 'click aquí'];
    const detected_spam = spamPatterns.reduce((score, pattern) => {
      return score + (text.includes(pattern) ? 15 : 0);
    }, 0);

    // Detectar contenido explícito
    const explicitWords = ['sexo', 'nude', 'desnudo', 'xxx', 'porno'];
    const detected_explicit = explicitWords.reduce((score, word) => {
      return score + (text.includes(word) ? 25 : 0);
    }, 0);

    // Detectar acoso
    const harassmentWords = ['matar', 'violar', 'amenaza', 'muerte', 'suicidio'];
    const detected_harassment = harassmentWords.reduce((score, word) => {
      return score + (text.includes(word) ? 30 : 0);
    }, 0);

    // Calcular severidad
    const maxScore = Math.max(detected_toxicity, detected_spam, detected_explicit, detected_harassment);
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let suggested_priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (maxScore >= 80) {
      severity = 'critical';
      suggested_priority = 'critical';
    } else if (maxScore >= 60) {
      severity = 'high';
      suggested_priority = 'high';
    } else if (maxScore >= 40) {
      severity = 'medium';
      suggested_priority = 'medium';
    }

    // Generar tags
    const tags: string[] = [];
    if (detected_toxicity > 40) tags.push('toxicidad');
    if (detected_spam > 40) tags.push('spam');
    if (detected_explicit > 40) tags.push('explícito');
    if (detected_harassment > 40) tags.push('acoso');

    // Sugerir acción
    let suggested_action: string | undefined;
    if (severity === 'critical') {
      suggested_action = 'ban_immediate';
    } else if (severity === 'high') {
      suggested_action = 'suspend_7days';
    } else if (severity === 'medium') {
      suggested_action = 'warn';
    }

    const result: AIClassificationResult = {
      confidence: Math.min(100, maxScore + 20),
      severity,
      category: reportData.content_type,
      tags,
      summary: `Reporte clasificado como ${severity}. Detecciones: toxicidad ${detected_toxicity}%, spam ${detected_spam}%, explícito ${detected_explicit}%, acoso ${detected_harassment}%`,
      detected_toxicity: Math.min(100, detected_toxicity),
      detected_spam: Math.min(100, detected_spam),
      detected_explicit: Math.min(100, detected_explicit),
      detected_harassment: Math.min(100, detected_harassment),
      suggested_priority,
      suggested_action,
    };

    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }

    // Guardar clasificación en BD
    await supabase
      .from('report_ai_classification')
      .insert({
        report_id: reportId,
        ai_confidence: result.confidence,
        ai_severity: result.severity,
        ai_category: result.category,
        ai_tags: result.tags,
        ai_summary: result.summary,
        detected_toxicity: result.detected_toxicity,
        detected_spam: result.detected_spam,
        detected_explicit: result.detected_explicit,
        detected_harassment: result.detected_harassment,
        suggested_priority: result.suggested_priority,
        suggested_action: result.suggested_action,
        ai_model_version: 'v1.0',
      });

    // Actualizar reporte
    await supabase
      .from('reports')
      .update({
        ai_classified: true,
        severity: result.severity,
        queue_position: result.suggested_priority === 'critical' ? 1 : undefined,
      })
      .eq('id', reportId);

    return result;
  } catch (error) {
    logger.error('Error clasificando reporte con IA:', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/**
 * Obtener cola de reportes con clasificación IA
 */
export const getReportsQueue = async (): Promise<ReportWithClassification[]> => {
  try {
    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }

    const { data: reports, error } = await supabase
      .from('reports')
      .select(`
        *,
        ai_classification:report_ai_classification(*)
      `)
      .in('status', ['pending', 'reviewing'])
      .order('queue_position', { ascending: true, nullsLast: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return (reports || []).map((report: ReportWithClassification & { ai_classification?: AIClassificationResult[] }) => ({
      ...report,
      ai_classified: report.ai_classified || false,
      ai_classification: report.ai_classification?.[0] || null,
    }));
  } catch (error) {
    logger.error('Error obteniendo cola de reportes:', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/**
 * Asignar reporte a moderador
 */
export const assignReportToModerator = async (
  reportId: string,
  moderatorId: string
): Promise<void> => {
  try {
    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }

    const { error } = await supabase
      .from('reports')
      .update({
        assigned_to: moderatorId,
        status: 'reviewing',
      })
      .eq('id', reportId);

    if (error) throw error;
  } catch (error) {
    logger.error('Error asignando reporte:', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

