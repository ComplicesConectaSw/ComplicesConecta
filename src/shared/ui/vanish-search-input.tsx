import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import { GlobalSearchService, type GlobalSearchResult } from "@/services/GlobalSearchService";

interface VanishSearchInputProps {
  placeholders: string[];
  onSubmit?: (value: string) => void;
  className?: string;
}

export const VanishSearchInput: React.FC<VanishSearchInputProps> = ({
  placeholders,
  onSubmit,
  className,
}) => {
  const [value, setValue] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const [displayText, setDisplayText] = React.useState(placeholders[0] ?? "");
  const [loading, setLoading] = React.useState(false);
  const [_results, setResults] = React.useState<GlobalSearchResult[]>([]);

  // Rotar placeholders cuando el input está vacío
  React.useEffect(() => {
    if (!placeholders.length) return;
    if (value.trim().length > 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % placeholders.length;
        setDisplayText(placeholders[next]);
        return next;
      });
    }, 2600);

    return () => clearInterval(interval);
  }, [placeholders, value]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const data = await GlobalSearchService.search(trimmed);
      setResults(data);
      // Datos reales de Supabase disponibles para integrar con UI de resultados
      console.log('Resultados búsqueda:', data);
    } finally {
      setLoading(false);
    }

    if (onSubmit) {
      onSubmit(trimmed);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative w-full max-w-xl mx-auto group",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex items-center gap-2 rounded-full px-4 py-2.5 sm:py-3 text-sm sm:text-base",
          "bg-neutral-900/50 backdrop-blur-md border border-white/10",
          value ? "bg-purple-900/20" : "",
        )}
      >
        {/* Placeholder animado */}
        <div className="pointer-events-none absolute left-4 inset-y-0 flex items-center text-xs sm:text-sm text-zinc-500">
          <AnimatePresence mode="wait">
            {!value && (
              <motion.span
                key={displayText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="inline-flex items-center gap-1"
              >
                {displayText}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="relative z-10 w-full bg-transparent border-none outline-none text-white placeholder-transparent text-sm sm:text-base"
          aria-label="Buscar experiencias y usuarios"
        />

        <button
          type="submit"
          className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-500 transition-colors flex-shrink-0 disabled:opacity-60"
          disabled={loading}
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-4 h-4"
          >
            <motion.path
              d="M5 12h14M13 5l7 7-7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.6 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          </motion.svg>
        </button>
      </div>
    </form>
  );
};
