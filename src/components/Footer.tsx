import { Heart, Facebook, Instagram, Twitter, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 text-white border-t border-purple-500/30">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-primary" fill="currentColor" />
              <h3 className="text-2xl font-bold bg-love-gradient bg-clip-text text-transparent stable-element">
                ComplicesConecta
              </h3>
            </div>
            <p className="text-background/80 mb-4 leading-relaxed">
              La plataforma líder para encontrar conexiones auténticas y experiencias únicas con personas que comparten tus intereses.
            </p>
            <div className="flex space-x-3">
              <Button 
                {...({variant: "ghost"} as any)} 
                size="icon" 
                className="text-background hover:text-primary"
                onClick={() => window.open('https://facebook.com/complicesconecta', '_blank')}
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button 
                {...({variant: "ghost"} as any)} 
                size="icon" 
                className="text-background hover:text-primary"
                onClick={() => window.open('https://instagram.com/complicesconecta', '_blank')}
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button 
                {...({variant: "ghost"} as any)} 
                size="icon" 
                className="text-background hover:text-primary"
                onClick={() => window.open('https://twitter.com/complicesconecta', '_blank')}
              >
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary">Empresa</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-background/80 hover:text-primary transition-colors">
                  Quiénes Somos
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-background/80 hover:text-primary transition-colors">
                  Carreras
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-background/80 hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/donations" className="text-background/80 hover:text-primary transition-colors">
                  Donaciones
                </Link>
              </li>
              <li>
                <Link to="/moderator-request" className="text-background/80 hover:text-primary transition-colors">
                  Ser Moderador
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary">Soporte</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/support" className="text-background/80 hover:text-primary transition-colors">
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-background/80 hover:text-primary transition-colors">
                  Seguridad
                </Link>
              </li>
              <li>
                <Link to="/guidelines" className="text-background/80 hover:text-primary transition-colors">
                  Directrices
                </Link>
              </li>
              <li>
                <Link to="/project-info" className="text-background/80 hover:text-primary transition-colors">
                  Información del Proyecto
                </Link>
              </li>
              <li>
                <Link to="/tokens-privacy" className="text-background/80 hover:text-primary transition-colors">
                  Privacidad de Tokens
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-background/80 hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:complicesconectasw@outlook.es" className="text-background/80 hover:text-primary transition-colors">
                  complicesconectasw@outlook.es
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-4 w-4 text-primary" />
                <button 
                  onClick={() => window.open('https://wa.me/5617184109', '_blank')}
                  className="text-background/80 hover:text-primary transition-all duration-300 hover:scale-105 transform flex items-center space-x-2 group"
                >
                  <span className="group-hover:animate-pulse">Soporte WhatsApp</span>
                </button>
              </div>
            </div>
            
            {/* Newsletter */}
            <div className="mt-6">
              <h5 className="font-medium mb-2 text-background">Newsletter</h5>
              <div className="flex space-x-2">
                <input 
                  type="email" 
                  placeholder="Tu email"
                  className="flex-1 px-3 py-2 bg-background/10 border border-background/20 rounded-md text-background placeholder-background/60 focus:outline-none focus:border-primary"
                />
                <Button 
                  {...({variant: "love"} as any)} 
                  size="sm"
                  onClick={() => {
                    const email = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value;
                    if (email) {
                      alert('¡Gracias por suscribirte! Te mantendremos informado.');
                    } else {
                      alert('Por favor ingresa tu email.');
                    }
                  }}
                >
                  Suscribirse
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-background/60 text-sm">
              2025 ComplicesConecta v3.4.0 - Sistema CMPX/GTK + World ID Integration. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-white/80 hover:text-primary transition-colors">
                Privacidad
              </Link>
              <Link to="/terms" className="text-white/80 hover:text-primary transition-colors">
                Términos
              </Link>
              <Link to="/support" className="text-white/80 hover:text-primary transition-colors">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};