import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/shared/ui/Button';
import { ThumbsUp, ThumbsDown, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import type { ChatSummary } from '@/features/chat/ChatSummaryService';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: ChatSummary | null;
  error?: string | null;
}

/**
 * SummaryModal Component
 * 
 * Modal que muestra el resumen de conversación generado por IA
 * 
 * Features:
 * - Muestra resumen con sentimiento y temas
 * - Permite copiar al portapapeles
 * - Feedback (útil/no útil) para A/B testing
 * - Badges para sentimiento y método de generación
 * - Estadísticas (cantidad de mensajes)
 * 
 * @example
 * ```tsx
 * <SummaryModal
 *   isOpen={true}
 *   onClose={() => {}}
 *   summary={summaryData}
 * />
 * ```
 */
export function SummaryModal({ isOpen, onClose, summary, error }: SummaryModalProps) {
  const [copied, setCopied] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  if (!summary && !error) return null;

  const handleCopy = async () => {
    if (!summary) return;
    
    await navigator.clipboard.writeText(summary.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = async (isHelpful: boolean) => {
    if (!summary) return;

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      if (!supabase) {
        console.error('Supabase no está disponible');
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (supabase && user) {
        await supabase
          .from('summary_feedback')
          .insert({
            summary_id: summary.id,
            user_id: user.id,
            is_helpful: isHelpful,
            feedback_text: isHelpful ? 'Resumen útil' : 'Resumen no útil',
            created_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error instanceof Error ? error.message : String(error));
    }
    
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      onClose();
    }, 1500);
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500';
      case 'negative':
        return 'bg-red-500';
      case 'neutral':
      default:
        return 'bg-gray-500';
    }
  };

  const getMethodLabel = (method?: string) => {
    switch (method) {
      case 'gpt4':
        return 'GPT-4';
      case 'bart':
        return 'BART';
      case 'fallback':
        return 'Básico';
      default:
        return 'IA';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Resumen de Conversación</span>
            {summary && (
              <Badge variant="outline" className="ml-2">
                {getMethodLabel(summary.method)}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {error
              ? 'Ocurrió un error al generar el resumen'
              : 'Resumen generado automáticamente con Inteligencia Artificial'}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            {/* Resumen principal */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-sm leading-relaxed">{summary.summary}</p>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-2">
              {summary.sentiment && (
                <Badge className={getSentimentColor(summary.sentiment)}>
                  {summary.sentiment === 'positive' && '😊 Positivo'}
                  {summary.sentiment === 'negative' && '😞 Negativo'}
                  {summary.sentiment === 'neutral' && '😐 Neutral'}
                </Badge>
              )}
              
              {summary.messageCount && (
                <Badge variant="secondary">
                  {summary.messageCount} mensajes
                </Badge>
              )}
            </div>

            {/* Temas */}
            {summary.topics && summary.topics.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Temas principales:</h4>
                <div className="flex flex-wrap gap-2">
                  {summary.topics.map((topic, index) => (
                    <Badge key={index} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              {!feedbackSent ? (
                <>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(true)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Útil
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(false)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      No útil
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  ¡Gracias por tu feedback!
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

