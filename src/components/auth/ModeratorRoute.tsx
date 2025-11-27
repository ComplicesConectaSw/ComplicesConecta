import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ModeratorRouteProps {
  children: React.ReactNode;
}

const ModeratorRoute = ({ children }: ModeratorRouteProps) => {
  const [isModerator, setIsModerator] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkModeratorAccess();
  }, []);

  const checkModeratorAccess = async () => {
    try {
      if (!supabase) {
        console.error('Supabase no está disponible');
        setIsModerator(false);
        setLoading(false);
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsModerator(false);
        setLoading(false);
        return;
      }

      // Verificar si es admin (los admins tienen acceso completo)
      const adminEmails = [
        'admin@complicesconecta.com',
        'moderador@complicesconecta.com',
        'support@complicesconecta.com'
      ];

      if (adminEmails.includes(session.user.email || '')) {
        setIsModerator(true);
        setLoading(false);
        return;
      }

      // Verificar si es moderador activo
      if (!supabase) {
        setIsModerator(false);
        setLoading(false);
        return;
      }
      
      const { data: moderator, error } = await (supabase as any)
        .from('moderators')
        .select('*')
        .eq('email', session.user.email)
        .eq('status', 'active')
        .single();

      if (error || !moderator) {
        setIsModerator(false);
      } else {
        setIsModerator(true);
      }
    } catch (error) {
      console.error('Error checking moderator access:', error);
      setIsModerator(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (isModerator === false) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ModeratorRoute;
