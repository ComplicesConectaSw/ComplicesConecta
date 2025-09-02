import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Heart, ArrowLeft, Search, Sparkles, Zap, Star } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [sparklePositions, setSparklePositions] = useState<Array<{x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);
    
    // Generate random sparkle positions
    const sparkles = Array.from({ length: 12 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }));
    setSparklePositions(sparkles);
  }, [location.pathname]);

  return (
    <main className="min-h-dvh grid place-items-center bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Floating Hearts */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <Heart 
              key={`heart-${i}`}
              className={`absolute text-pink-400/10 animate-float-slow`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 2}s`,
                fontSize: `${Math.random() * 25 + 20}px`
              }}
              fill="currentColor"
            />
          ))}
        </div>
        
        {/* Animated Sparkles */}
        <div className="absolute inset-0 overflow-hidden">
          {sparklePositions.map((sparkle, i) => (
            <Sparkles
              key={`sparkle-${i}`}
              className="absolute text-yellow-300/20 animate-twinkle"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                animationDelay: `${sparkle.delay}s`,
                fontSize: '16px'
              }}
            />
          ))}
        </div>
        
        {/* Lightning Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <Zap
              key={`zap-${i}`}
              className="absolute text-purple-400/15 animate-pulse-glow"
              style={{
                left: `${20 + i * 25}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${i * 1.5}s`,
                fontSize: '24px'
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center space-y-8 p-8 max-w-2xl mx-auto">
        {/* Logo */}
        <div className="animate-fade-in">
          <img 
            src="/compliceslogo.png" 
            alt="ComplicesConecta" 
            className="mx-auto h-16 opacity-90 mb-8"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* 404 Number with Animation */}
        <div className={`transition-all duration-1000 ${isVisible ? 'animate-bounce-in' : 'opacity-0 scale-50'}`}>
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-bold text-white/20 mb-4 select-none relative z-10">
              404
            </h1>
            {/* Glowing effect behind 404 */}
            <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-pink-500/30 blur-lg animate-pulse-slow">
              404
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className={`bg-black/40 backdrop-blur-sm border-white/10 p-8 transition-all duration-1000 ${isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-10'}`}>
          <div className="space-y-6">
            <div className="animate-fade-in-delay">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Página no encontrada
              </h2>
              <p className="text-white/80 text-lg leading-relaxed max-w-prose mx-auto">
                Parece que este enlace se fue a una fiesta privada. No te preocupes, 
                te ayudamos a regresar al lugar correcto donde la diversión nunca se detiene.
              </p>
            </div>

            {/* Action Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-700 ${isVisible ? 'animate-fade-in-delay-2' : 'opacity-0 translate-y-5'}`}>
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:rotate-1 group"
              >
                <Link to="/">
                  <Home className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                  Volver al Inicio
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 rounded-2xl px-8 py-6 text-lg backdrop-blur-sm hover:border-pink-400/50 transition-all duration-300 transform hover:scale-105 hover:-rotate-1 group"
              >
                <Link to="/discover">
                  <Search className="mr-2 h-5 w-5 group-hover:animate-spin" />
                  Explorar Perfiles
                </Link>
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-white/60 text-sm animate-fade-in-delay-3">
              <p>¿Necesitas ayuda? Visita nuestro <Link to="/faq" className="text-pink-400 hover:text-pink-300 underline">Centro de Ayuda</Link></p>
            </div>
          </div>
        </Card>

        {/* Decorative Elements */}
        <div className={`flex justify-center space-x-4 transition-all duration-1000 delay-1000 ${isVisible ? 'animate-fade-in-delay-4' : 'opacity-0'}`}>
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="relative"
            >
              <Star 
                className="w-4 h-4 text-yellow-400/60 animate-twinkle"
                style={{ animationDelay: `${i * 0.3}s` }}
                fill="currentColor"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3) translateY(-100px); }
          50% { opacity: 1; transform: scale(1.1) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 1.2s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 1s ease-out 0.3s both;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.6s both;
        }
        
        .animate-fade-in-delay-2 {
          animation: fade-in 1s ease-out 0.9s both;
        }
        
        .animate-fade-in-delay-3 {
          animation: fade-in 1s ease-out 1.2s both;
        }
        
        .animate-fade-in-delay-4 {
          animation: fade-in 1s ease-out 1.5s both;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
};

export default NotFound;
