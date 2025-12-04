import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin, Music, Utensils } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface EventSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  meta: string;
}

const demoEvents: EventSlide[] = [
  {
    id: "masks",
    title: "Noches de Máscaras",
    subtitle: "Fiesta privada en CDMX",
    description: "Encuentros discretos con dress code elegante, máscaras venecianas y música deep house.",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&auto=format&fit=crop&q=80",
    meta: "Solo parejas y singles verificados",
  },
  {
    id: "tulum",
    title: "Escapada Tulum",
    subtitle: "Weekend lifestyle frente al mar",
    description: "Experiencia all‑inclusive en villa privada con pool parties, cenas temáticas y afters selectos.",
    imageUrl: "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=1000&auto=format&fit=crop&q=80",
    meta: "Cupo limitado · Dress code blanco",
  },
  {
    id: "dinner",
    title: "Cena Sensorial",
    subtitle: "Restaurante clandestino",
    description: "Maridaje a ciegas con dinámicas guiadas para parejas afines, música en vivo y códigos privados.",
    imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1000&auto=format&fit=crop&q=80",
    meta: "Reservación previa · Confidencialidad total",
  },
];

interface EventsCarouselProps {
  className?: string;
}

export const EventsCarousel: React.FC<EventsCarouselProps> = ({ className }) => {
  const [index, setIndex] = React.useState(0);

  const next = () => setIndex((prev) => (prev + 1) % demoEvents.length);
  const prev = () => setIndex((prev) => (prev - 1 + demoEvents.length) % demoEvents.length);

  const current = demoEvents[index];

  return (
    <div className={cn("relative w-full max-w-3xl mx-auto", className)}>
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black/70 backdrop-blur-xl shadow-2xl">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative h-64 md:h-full">
            <AnimatePresence mode="wait">
              <motion.img
                key={current.id}
                src={current.imageUrl}
                alt={current.title}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-zinc-200">
              <MapPin className="w-4 h-4" />
              <span>{current.subtitle}</span>
            </div>
          </div>

          <div className="p-5 md:p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-purple-300 mb-2">Eventos Lifestyle</p>
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                {current.title}
              </h3>
              <p className="text-sm text-zinc-300 mb-4">
                {current.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <span className="inline-flex items-center gap-1">
                  <Music className="w-4 h-4" />
                  Música seleccionada
                </span>
                <span className="inline-flex items-center gap-1">
                  <Utensils className="w-4 h-4" />
                  Experiencias gourmet
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
              <span>{current.meta}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prev}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-100"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-2">
        {demoEvents.map((event, i) => (
          <button
            key={event.id}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 w-6 rounded-full transition-all",
              i === index ? "bg-purple-400 w-8" : "bg-zinc-600 hover:bg-zinc-400",
            )}
          />
        ))}
      </div>
    </div>
  );
};
