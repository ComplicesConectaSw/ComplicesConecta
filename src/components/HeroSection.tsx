import { Heart, Sparkles, Users } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient - Corregido para coincidir con imagen */}
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 via-pink-500 to-purple-800" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Hearts */}
        <Heart className="absolute top-20 left-10 w-8 h-8 text-white/20 animate-float" fill="currentColor" />
        <Heart className="absolute top-32 right-16 w-6 h-6 text-white/30 animate-float" style={{ animationDelay: '1s' }} fill="currentColor" />
        <Heart className="absolute bottom-32 left-20 w-6 h-6 text-white/25 animate-float" style={{ animationDelay: '2s' }} fill="currentColor" />
        
        {/* Sparkles */}
        <Sparkles className="absolute top-40 right-20 w-4 h-4 text-white/40 animate-bounce-gentle" style={{ animationDelay: '0.5s' }} />
        <Sparkles className="absolute bottom-40 left-16 w-5 h-5 text-white/30 animate-bounce-gentle" style={{ animationDelay: '1.5s' }} />
        
        {/* Users Icon */}
        <Users className="absolute bottom-20 right-10 w-8 h-8 text-white/20 animate-float" style={{ animationDelay: '0.5s' }} />
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <div className="animate-slide-up">
          {/* Logo ComplicesConecta - Nuevo */}
          <div className="mb-8 flex justify-center">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <Heart 
                  className="text-pink-400 transition-all duration-300 h-12 w-12 sm:h-16 sm:w-16 animate-pulse group-hover:text-pink-300" 
                  fill="currentColor"
                  style={{ animationDuration: '2s' }}
                />
                <div className="absolute inset-0 animate-float">
                  <Heart className="text-pink-300 opacity-70 transition-all duration-300 h-12 w-12 sm:h-16 sm:w-16 animate-ping" fill="currentColor" />
                </div>
                <div className="absolute inset-0 animate-pulse">
                  <Heart className="text-pink-400 opacity-30 transition-all duration-300 h-12 w-12 sm:h-16 sm:w-16" fill="currentColor" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
                ComplicesConecta
              </h1>
            </div>
          </div>
          
          {/* Main Headline - Corregido para coincidir con imagen */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-white mb-6 leading-tight tracking-tight">
              <span className="block text-white drop-shadow-2xl">
                Plataforma Social
              </span>
              <span className="block text-amber-600 drop-shadow-2xl">
                Exclusiva
              </span>
              <span className="block text-white text-3xl sm:text-4xl md:text-5xl font-medium mt-2 drop-shadow-xl">
                para Adultos +18
              </span>
            </h1>
          </div>
          
          {/* Subtitle - Corregido para coincidir con imagen */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-8 leading-relaxed drop-shadow-lg">
            Encuentra tu
            <span className="block text-amber-600 font-bold drop-shadow-xl">
              Conexión Perfecta
            </span>
          </h2>
          
          {/* Description */}
          <div className="max-w-4xl mx-auto mb-12">
            {/* Beta Badge - Corregido para coincidir con imagen */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 text-black px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-soft flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Versión Beta Exclusiva
              </span>
            </div>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white leading-relaxed font-medium mb-4 drop-shadow-lg">
              Conecta con personas afines de manera segura y discreta
            </p>
            
            <p className="text-base sm:text-lg md:text-xl text-white leading-relaxed font-light drop-shadow-md">
              Sistema de verificación KYC, chat encriptado y eventos exclusivos para la comunidad lifestyle
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-16 pt-8 border-t border-white/20">
          <div className="text-center group">
            <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
              BETA
            </div>
            <div className="text-white font-semibold drop-shadow-lg">Versión de Prueba</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
              100%
            </div>
            <div className="text-white font-semibold drop-shadow-lg">Funciones Gratis</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
              ∞
            </div>
            <div className="text-white font-semibold drop-shadow-lg">Posibilidades</div>
          </div>
        </div>
      </div>
    </section>
  );
};