import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useChatSummary } from '@/features/chat/useChatSummary';
import { SummaryModal } from './SummaryModal';

interface SummaryButtonProps {
  chatId: string;
  className?: string;
}

/**
 * SummaryButton Component
 * 
 * Botón para generar resúmenes automáticos de conversaciones usando AI (GPT-4/BART)
 * 
 * Features:
 * - Genera resúmenes con un clic
 * - Muestra loading state durante generación
 * - Abre modal con el resumen generado
 * - Rate limiting: 10 resúmenes/día
 * - Cache de 24 horas
 * 
 * @example
 * ```tsx
 * <SummaryButton chatId="123" />
 * ```
 */
export function SummaryButton({ chatId, className }: SummaryButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { summary, isLoading, error, usageStats, generateSummary, clearError } = useChatSummary();

  const handleClick = async () => {
    // Check rate limit
    if (usageStats && usageStats.usedToday >= usageStats.limit) {
      alert(`Has alcanzado el límite de ${usageStats.limit} resúmenes por día. Intenta mañana.`);
      return;
    }

    // Generate summary
    await generateSummary(chatId);
    
    // Open modal if successful
    if (summary) {
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    clearError();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className={className}
        title="Generar resumen de conversación con IA"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Resumen IA
          </>
        )}
      </Button>

      {summary && (
        <SummaryModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          summary={summary}
          error={error ? error.message : null}
        />
      )}

      {/* Error toast */}
      {error && !isModalOpen && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">{String(error)}</p>
          <button
            onClick={clearError}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Cerrar
          </button>
        </div>
      )}
    </>
  );
}

