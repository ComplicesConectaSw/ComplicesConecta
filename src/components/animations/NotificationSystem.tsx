import React, { createContext } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Heart, MessageCircle, Trophy, AlertCircle, CheckCircle, X, Mail, Bell, UserPlus } from 'lucide-react';

// Notification types - Extended for v3.1
export type NotificationType = 'match' | 'like' | 'message' | 'achievement' | 'success' | 'error' | 'warning' | 'info' | 'email' | 'request' | 'confirmation' | 'alert';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  data?: any;
}

// Notification context
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

// CRÍTICO: Asegurar createContext disponible antes de usar
const safeCreateContext = <T,>(defaultValue: T | undefined): React.Context<T | undefined> => {
  const debugLog = (event: string, data?: any) => {
    if (typeof window !== 'undefined' && (window as any).__LOADING_DEBUG__) {
      (window as any).__LOADING_DEBUG__.log(event, data);
    }
  };
  
  if (typeof window !== 'undefined' && (window as any).React?.createContext) {
    debugLog('SAFE_CREATE_CONTEXT_GLOBAL', { provider: 'NotificationSystem', hasGlobal: true });
    return (window as any).React.createContext(defaultValue);
  }
  
  debugLog('SAFE_CREATE_CONTEXT_FALLBACK', { provider: 'NotificationSystem', hasGlobal: false, hasLocal: !!createContext });
  return createContext<T | undefined>(defaultValue);
};

const NotificationContext = safeCreateContext<NotificationContextType>(undefined);

// Notification provider
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const addNotification = React.useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  }, []);

  const removeNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Individual notification component
const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { removeNotification } = useNotifications();
  
  const getIcon = () => {
    switch (notification.type) {
      case 'match': return <Heart className="w-5 h-5 text-red-400" fill="currentColor" />;
      case 'like': return <Heart className="w-5 h-5 text-pink-400" />;
      case 'message': return <MessageCircle className="w-5 h-5 text-blue-400" />;
      case 'achievement': return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'email': return <Mail className="w-5 h-5 text-blue-500" />;
      case 'request': return <UserPlus className="w-5 h-5 text-purple-500" />;
      case 'confirmation': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'alert': return <Bell className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-blue-400" />;
    }
  };

  const getColors = () => {
    switch (notification.type) {
      case 'match': return 'from-red-500 to-pink-500';
      case 'like': return 'from-pink-500 to-rose-500';
      case 'message': return 'from-blue-500 to-cyan-500';
      case 'achievement': return 'from-yellow-500 to-orange-500';
      case 'success': return 'from-green-500 to-emerald-500';
      case 'error': return 'from-red-500 to-red-600';
      case 'warning': return 'from-yellow-500 to-yellow-600';
      case 'email': return 'from-blue-500 to-indigo-500';
      case 'request': return 'from-purple-500 to-violet-500';
      case 'confirmation': return 'from-green-500 to-teal-500';
      case 'alert': return 'from-red-500 to-orange-500';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const itemVariants: Variants = {
    initial: { opacity: 0, x: 300, scale: 0.8 },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { 
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      x: 300, 
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={`relative overflow-hidden rounded-lg shadow-lg backdrop-blur-sm bg-white/10 border border-white/20 p-4 mb-3 max-w-sm`}
    >
      {/* Animated background gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${getColors()} opacity-20`}
        animate={{ 
          background: [
            `linear-gradient(45deg, ${getColors()})`,
            `linear-gradient(135deg, ${getColors()})`,
            `linear-gradient(225deg, ${getColors()})`,
            `linear-gradient(315deg, ${getColors()})`,
            `linear-gradient(45deg, ${getColors()})`
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      <div className="relative flex items-start gap-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {getIcon()}
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">
            {notification.title}
          </h4>
          <p className="text-xs text-white/80 mt-1">
            {notification.message}
          </p>
          
          {notification.action && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={notification.action.onClick}
              className="mt-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs text-white font-medium transition-colors"
            >
              {notification.action.label}
            </motion.button>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => removeNotification(notification.id)}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

// Notification container
const NotificationContainer: React.FC = () => {
  // CRÍTICO: Los hooks deben llamarse siempre, no condicionalmente
  // Usar useContext directamente y manejar el caso undefined después
  const context = React.useContext(NotificationContext);
  
  // Si no hay provider, retornar null silenciosamente
  if (!context) {
    return null;
  }
  
  const { notifications } = context;

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem notification={notification} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Special effect notifications
export const MatchNotification: React.FC<{ user: { id: string; name: string } }> = ({ user }) => {
  const { addNotification } = useNotifications();
  
  React.useEffect(() => {
    addNotification({
      type: 'match',
      title: '¡Es un Match! 💕',
      message: `¡Tú y ${user.name} se han gustado mutuamente!`,
      duration: 8000,
      action: {
        label: 'Enviar mensaje',
        onClick: () => {
          // Navigate to chat
          window.location.href = `/chat?user=${user.id || ''}`;
        }
      },
      data: user
    });
  }, [user, addNotification]);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.2, 1] }}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
        }}
        className="text-6xl"
      >
        💕
      </motion.div>
    </motion.div>
  );
};

// Achievement notification with confetti
export const AchievementNotification: React.FC<{ achievement: any }> = ({ achievement }) => {
  const { addNotification } = useNotifications();
  
  React.useEffect(() => {
    addNotification({
      type: 'achievement',
      title: '¡Logro Desbloqueado! 🏆',
      message: achievement.description,
      duration: 6000,
      data: achievement
    });
  }, [achievement, addNotification]);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
    >
      <motion.div
        animate={{ 
          boxShadow: [
            '0 0 20px rgba(255, 215, 0, 0.3)',
            '0 0 40px rgba(255, 215, 0, 0.6)',
            '0 0 20px rgba(255, 215, 0, 0.3)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-lg"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          <span>{achievement.title}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Floating hearts for likes
export const FloatingHearts: React.FC<{ count?: number }> = ({ count = 5 }) => {
  const hearts = Array.from({ length: count }, (_, i) => (
    <motion.div
      key={i}
      initial={{ 
        opacity: 0, 
        scale: 0, 
        x: Math.random() * 100 - 50,
        y: 0 
      }}
      animate={{ 
        opacity: [0, 1, 0], 
        scale: [0, 1, 0.8], 
        y: -200,
        x: Math.random() * 200 - 100
      }}
      transition={{ 
        duration: 3, 
        delay: i * 0.2,
        ease: "easeOut"
      }}
      className="absolute text-2xl pointer-events-none"
      style={{ 
        left: '50%', 
        bottom: '50%',
        transform: 'translateX(-50%)'
      }}
    >
      ❤️
    </motion.div>
  ));

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {hearts}
    </div>
  );
};

// Hook for easy notification usage
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
          onClick: () => window.location.href = `/chat?user=${user.id || ''}`
        }
      });
    },
    
    showLike: (user: { id: string; name: string }) => {
      addNotification({
        type: 'like',
        title: '¡Nuevo Like! 💖',
        message: `A ${user.name} le gustas`,
        duration: 4000
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
          onClick: () => window.location.href = `/chat?user=${sender.id}`
        }
      });
    },
    
    showAchievement: (achievement: any) => {
      addNotification({
        type: 'achievement',
        title: '¡Logro Desbloqueado! 🏆',
        message: achievement.description,
        duration: 6000
      });
    },
    
    showSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: '¡Éxito!',
        message,
        duration: 3000
      });
    },
    
    showError: (message: string) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message,
        duration: 5000
      });
    },
    
    showWarning: (message: string) => {
      addNotification({
        type: 'warning',
        title: 'Atención',
        message,
        duration: 4000
      });
    },
    
    showInfo: (message: string) => {
      addNotification({
        type: 'info',
        title: 'Información',
        message,
        duration: 4000
      });
    },

    // New v3.1 notification helpers
    showEmailNotification: (title: string, message: string, actionUrl?: string) => {
      addNotification({
        type: 'email',
        title,
        message,
        duration: 6000,
        action: actionUrl ? {
          label: 'Ver detalles',
          onClick: () => window.location.href = actionUrl
        } : undefined
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
          onClick: () => window.location.href = `/requests?id=${requestId}`
        }
      });
    },

    showConfirmation: (title: string, message: string) => {
      addNotification({
        type: 'confirmation',
        title,
        message,
        duration: 5000
      });
    },

    showAlert: (title: string, message: string, actionUrl?: string) => {
      addNotification({
        type: 'alert',
        title,
        message,
        duration: 0, // Persistent until dismissed
        action: actionUrl ? {
          label: 'Resolver',
          onClick: () => window.location.href = actionUrl
        } : undefined
      });
    }
  };
};
