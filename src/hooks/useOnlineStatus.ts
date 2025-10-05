import { useState, useEffect, useCallback } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Hook para simular estado online/offline de usuarios demo
export const useUserOnlineStatus = (_userId?: string) => {
  const [userOnlineStatus, setUserOnlineStatus] = useState<Record<string, boolean>>({});
  const systemOnline = useOnlineStatus();

  useEffect(() => {
    // Simular estados online/offline aleatorios para usuarios demo
    const interval = setInterval(() => {
      setUserOnlineStatus(prev => {
        const newStatus = { ...prev };
        
        // Simular cambios aleatorios de estado para usuarios demo
        const demoUsers = ['demo-user-1', 'demo-user-2', 'demo-user-3', 'demo-user-4'];
        demoUsers.forEach(user => {
          // 80% probabilidad de estar online si el sistema está online
          newStatus[user] = systemOnline ? Math.random() > 0.2 : false;
        });
        
        return newStatus;
      });
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, [systemOnline]);

  const _updateOnlineStatus = useCallback(async (_userId: string, _isOnline: boolean) => {
    if (!systemOnline) return false;
    return userOnlineStatus[_userId] ?? Math.random() > 0.3; // Por defecto 70% online
  }, [systemOnline, userOnlineStatus]);

  const getUserOnlineStatus = (userId: string): boolean => {
    if (!systemOnline) return false;
    return userOnlineStatus[userId] ?? Math.random() > 0.3; // Por defecto 70% online
  };

  const getLastSeenTime = (userId: string): string => {
    if (getUserOnlineStatus(userId)) return 'Ahora';
    
    const randomMinutes = Math.floor(Math.random() * 120) + 1; // 1-120 minutos
    if (randomMinutes < 60) {
      return `Hace ${randomMinutes} min`;
    } else {
      const hours = Math.floor(randomMinutes / 60);
      return `Hace ${hours}h`;
    }
  };

  return {
    getUserOnlineStatus,
    getLastSeenTime,
    systemOnline
  };
};
