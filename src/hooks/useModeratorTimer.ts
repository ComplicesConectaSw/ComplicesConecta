// Hook para timer de conexión automático
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import {
  startModeratorSession,
  endModeratorSession,
  getActiveSession,
  updateSessionMinutes,
  ModeratorSession,
} from '@/services/moderatorTimer';

export const useModeratorTimer = () => {
  const { user } = useAuth();
  const [session, setSession] = useState<ModeratorSession | null>(null);
  const [minutesWorked, setMinutesWorked] = useState(0);
  const [reportsReviewed, setReportsReviewed] = useState(0);
  const [actionsTaken, setActionsTaken] = useState(0);

  useEffect(() => {
    if (!user) return;

    let interval: NodeJS.Timeout;
    let currentSession: ModeratorSession | null = null;

    const initSession = async () => {
      // Buscar sesión activa o crear nueva
      let activeSession = await getActiveSession(user.id);
      
      if (!activeSession) {
        activeSession = await startModeratorSession(user.id);
      }

      currentSession = activeSession;
      setSession(activeSession);
      setReportsReviewed(activeSession.reports_reviewed);
      setActionsTaken(activeSession.actions_taken);

      // Actualizar cada minuto
      interval = setInterval(async () => {
        if (currentSession) {
          const startTime = new Date(currentSession.session_start);
          const now = new Date();
          const minutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);
          setMinutesWorked(minutes);

          // Actualizar en BD cada 5 minutos
          if (minutes % 5 === 0) {
            await updateSessionMinutes(
              currentSession.id,
              reportsReviewed,
              actionsTaken
            );
          }
        }
      }, 60000); // Cada minuto
    };

    initSession();

    // Limpiar al desmontar
    return () => {
      if (interval) clearInterval(interval);
      if (currentSession) {
        endModeratorSession(currentSession.id).catch(console.error);
      }
    };
  }, [user]);

  const incrementReportsReviewed = () => {
    setReportsReviewed(prev => prev + 1);
  };

  const incrementActionsTaken = () => {
    setActionsTaken(prev => prev + 1);
  };

  return {
    session,
    minutesWorked,
    reportsReviewed,
    actionsTaken,
    incrementReportsReviewed,
    incrementActionsTaken,
  };
};

