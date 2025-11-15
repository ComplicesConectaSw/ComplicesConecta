/**
 * Demo - Página de selección de modo demo
 * Fecha: 15 Noviembre 2025
 * Propósito: Proporcionar acceso rápido al modo demo de ComplicesConecta
 * Permite a los usuarios explorar la aplicación sin crear una cuenta
 */

import React from 'react';
import { DecorativeHearts } from '@/components/DecorativeHearts';
import DemoSelector from '@/components/auth/DemoSelector';

const Demo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Corazones decorativos flotantes */}
      <DecorativeHearts count={8} />
      
      {/* Background con efecto de difuminado */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-purple-800/20 to-blue-900/20"></div>
      
      {/* Contenido principal */}
      <div className="relative z-10 w-full max-w-5xl">
        {/* Logo y título superior */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            ComplicesConecta
          </h1>
          <p className="text-xl text-white/90 font-medium drop-shadow-md">
            Explora nuestra plataforma en modo demo
          </p>
        </div>

        {/* Componente selector de demo */}
        <DemoSelector />

        {/* Footer informativo */}
        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm">
            ¿Listo para la experiencia completa?{' '}
            <a 
              href="/auth" 
              className="text-purple-300 hover:text-purple-200 underline font-semibold"
            >
              Crea tu cuenta aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Demo;
