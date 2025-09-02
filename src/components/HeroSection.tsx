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
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Encuentra tu
            <span className="block bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
              Cómplice Perfecto
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            🚀 En fase Beta - Todas las funciones gratuitas mientras desarrollamos la mejor experiencia para ti
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/auth">
                <Heart className="mr-2 h-5 w-5 group-hover:animate-pulse" fill="currentColor" />
                Comenzar Ahora
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              asChild
            >
              <Link to="/events">
                <Sparkles className="mr-2 h-5 w-5" />
                Ver Eventos
              </Link>
            </Button>
          </div>
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