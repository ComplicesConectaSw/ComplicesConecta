import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth' 
}) => {
  const { loading, isAuthenticated, isDemo } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Esperar a que termine la carga inicial y verificar autenticación
    if (!loading) {
      const authResult = isAuthenticated();
      setAuthenticated(authResult);
      setIsReady(true);
      
      logger.info('🔐 ProtectedRoute: Verificación de autenticación', {
        isAuthenticated: authResult,
        isDemo: isDemo(),
        path: location.pathname
      });
    }
  }, [loading, isAuthenticated, isDemo, location.pathname]);

  // Mostrar loading mientras se verifica la autenticación
  if (!isReady || loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si requiere autenticación pero no está autenticado
  if (requireAuth && !authenticated) {
    logger.info(`🚫 ProtectedRoute: Acceso denegado a ${location.pathname}, redirigiendo a ${redirectTo}`);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Si no requiere autenticación pero está autenticado (ej: página de login)
  if (!requireAuth && authenticated) {
    logger.info(`✅ ProtectedRoute: Usuario autenticado accediendo a ${location.pathname}, redirigiendo a dashboard`);
    return <Navigate to="/dashboard" replace />;
  }

  logger.info(`✅ ProtectedRoute: Acceso permitido a ${location.pathname}`);
  return <>{children}</>;
};

export default ProtectedRoute;
