/**
 * Botón de Cerrar Sesión Unificado
 * Componente para cerrar sesión con Supabase Auth
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { LogOut, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'lg';
  showText?: boolean;
  className?: string;
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'sm', 
  showText = true,
  className = ''
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      // Limpiar localStorage/sessionStorage
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('demo_authenticated');
      localStorage.removeItem('demo_user');
      localStorage.removeItem('userType');
      sessionStorage.clear();
      
      // Redirigir a página de autenticación
      navigate('/auth', { replace: true });
      
    } catch (error) {
      console.error('Error inesperado al cerrar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant={variant}
        size={size}
        onClick={handleLogout}
        disabled={isLoading}
        className={`
          text-white hover:bg-red-500/20 hover:text-red-200 
          transition-all duration-300 flex items-center gap-2
          ${className}
        `}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        {showText && (
          <span className="hidden sm:inline">
            {isLoading ? 'Cerrando...' : 'Cerrar Sesión'}
          </span>
        )}
      </Button>
    </motion.div>
  );
}

export default LogoutButton;
