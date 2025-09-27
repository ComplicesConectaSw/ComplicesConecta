import React from 'react';
import StoriesContainer from '@/components/stories/StoriesContainer';
import NavigationEnhanced from '@/components/NavigationEnhanced';
import { Header } from '@/components/Header';

const Stories: React.FC = () => {
  // Detectar si el usuario está autenticado para mostrar navegación inferior
  const isAuthenticated = localStorage.getItem('demo_authenticated') === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-secondary/20"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header unificado */}
      <Header />

      {/* Main Content */}
      <div className="relative z-10 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Historias
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Comparte momentos que desaparecen en 24 horas. Conecta con otros usuarios a través de experiencias efímeras y auténticas.
            </p>
          </div>

          <StoriesContainer />
        </div>
      </div>

      {/* Navegación inferior para usuarios autenticados */}
      {isAuthenticated && <NavigationEnhanced />}
    </div>
  );
};

export default Stories;
