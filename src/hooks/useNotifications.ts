import React from 'react';
import { NotificationContext } from '@/components/animations/NotificationSystem';

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();
  
  return {
    showMatch: (user: { id: string; name: string }) => {
      addNotification({
        type: 'match',
        title: '¡Es un Match! 💕',
        message: `¡Tú y ${user.name} se han gustado mutuamente!`,
        duration: 8000,
        action: {
          label: 'Enviar mensaje',
          onClick: () => (window.location.href = `/chat?user=${user.id || ''}`),
        },
      });
    },
    
    showLike: (user: { id: string; name: string }) => {
      addNotification({
        type: 'like',
        title: '¡Nuevo Like! 💖',
        message: `A ${user.name} le gustas`,
        duration: 4000,
      });
    },
    
    showMessage: (sender: { id: string; name: string }, _message: string) => {
      addNotification({
        type: 'message',
        title: 'Nuevo mensaje 💬',
        message: `${sender.name} te ha enviado un mensaje`,
        duration: 6000,
        action: {
          label: 'Ver mensaje',
          onClick: () => (window.location.href = `/chat?user=${sender.id}`),
        },
      });
    },
    
    showAchievement: (achievement: { description: string }) => {
      addNotification({
        type: 'achievement',
        title: '¡Logro Desbloqueado! 🏆',
        message: achievement.description,
        duration: 6000,
      });
    },
    
    showSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: '¡Éxito!',
        message,
        duration: 3000,
      });
    },
    
    showError: (message: string) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message,
        duration: 5000,
      });
    },
    
    showWarning: (message: string) => {
      addNotification({
        type: 'warning',
        title: 'Atención',
        message,
        duration: 4000,
      });
    },
    
    showInfo: (message: string) => {
      addNotification({
        type: 'info',
        title: 'Información',
        message,
        duration: 4000,
      });
    },
    
    showEmailNotification: (title: string, message: string, actionUrl?: string) => {
      addNotification({
        type: 'email',
        title,
        message,
        duration: 6000,
        action: actionUrl
          ? {
              label: 'Ver detalles',
              onClick: () => (window.location.href = actionUrl),
            }
          : undefined,
      });
    },
    
    showNewRequest: (senderName: string, requestId: string) => {
      addNotification({
        type: 'request',
        title: 'Nueva Solicitud',
        message: `${senderName} te ha enviado una solicitud de conexión`,
        duration: 8000,
        action: {
          label: 'Ver solicitud',
          onClick: () => (window.location.href = `/requests?id=${requestId}`),
        },
      });
    },
    
    showConfirmation: (title: string, message: string) => {
      addNotification({
        type: 'confirmation',
        title,
        message,
        duration: 5000,
      });
    },
    
    showAlert: (title: string, message: string, actionUrl?: string) => {
      addNotification({
        type: 'alert',
        title,
        message,
        duration: 0,
        action: actionUrl
          ? {
              label: 'Resolver',
              onClick: () => (window.location.href = actionUrl),
            }
          : undefined,
      });
    },
  };
};
