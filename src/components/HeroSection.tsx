import { Heart, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-hero-gradient" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <Heart className="absolute top-20 left-10 w-8 h-8 text-white/20 animate-float" fill="currentColor" />
        <Sparkles className="absolute top-32 right-16 w-6 h-6 text-white/30 animate-float" style={{ animationDelay: '1s' }} />
        <Heart className="absolute bottom-32 left-20 w-6 h-6 text-white/25 animate-float" style={{ animationDelay: '2s' }} fill="currentColor" />
        <Users className="absolute bottom-20 right-10 w-8 h-8 text-white/20 animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-slide-up">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in relative z-10">
            <span className="bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
              Plataforma Social Premium
            </span>
            <br />
            <span className="bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent animate-pulse drop-shadow-2xl">
              para Adultos +18
            </span>
          </h1>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Encuentra tu
            <span className="block bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
              Cómplice Perfecto
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto leading-relaxed font-light">
            <span className="inline-flex items-center gap-2 mb-4">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-black px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">
                🚀 Versión Beta Exclusiva
              </span>
            </span>
            <br />
            <span className="text-2xl md:text-3xl font-medium bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
              Conecta con personas afines de manera segura y discreta
            </span>
            <br />
            <span className="text-lg md:text-xl text-white mt-2 block">
              Sistema de verificación KYC, chat encriptado y eventos exclusivos para la comunidad lifestyle
            </span>
          </p>
        </div>

        {/* Beta Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/20">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">BETA</div>
            <div className="text-white/80">Versión de Prueba</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">100%</div>
            <div className="text-white/80">Funciones Gratis</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">∞</div>
            <div className="text-white/80">Posibilidades</div>
          </div>
        </div>
      </div>
    </section>
  );
};