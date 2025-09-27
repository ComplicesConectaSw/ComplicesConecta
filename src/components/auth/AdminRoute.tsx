import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/imports";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      // Verificar si hay sesión activa
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        logger.error('❌ Error al verificar sesión:', { error: sessionError.message });
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (!session?.user) {
        logger.info('🚫 No hay sesión activa - acceso denegado');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Verificar si el email del usuario es de admin
      const userEmail = session.user.email;
      const adminEmails = ['admin@complicesconecta.com', 'ComplicesConectaSw@outlook.es'];
      
      if (adminEmails.includes(userEmail || '')) {
        logger.info('✅ Acceso de admin verificado:', { email: userEmail });
        setIsAdmin(true);
      } else {
        logger.info('🚫 Usuario no es admin:', { email: userEmail });
        setIsAdmin(false);
      }

    } catch (error: any) {
      logger.error('❌ Error inesperado al verificar admin:', { error: error.message });
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    logger.info('🔄 Redirigiendo a página principal - acceso denegado');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
