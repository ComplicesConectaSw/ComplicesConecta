import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Mail, UserPlus, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/lib/logger';

interface NotificationItem {
  id: string;
  type: 'email' | 'request' | 'alert' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
  sender_id?: string;
  sender_name?: string;
}

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load demo notifications for demo users
  const loadDemoNotifications = () => {
    const demoNotifications: NotificationItem[] = [
      {
        id: 'demo-1',
        type: 'request',
        title: 'Nueva solicitud de conexión',
        message: 'Anabella & Julio quieren conectar contigo',
        read: false,
        created_at: new Date().toISOString(),
        sender_name: 'Anabella & Julio'
      },
      {
        id: 'demo-2',
        type: 'email',
        title: 'Nuevo mensaje',
        message: 'Tienes un mensaje nuevo de Carmen & Roberto',
        read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        sender_name: 'Carmen & Roberto'
      }
    ];
    setNotifications(demoNotifications);
    setUnreadCount(demoNotifications.filter(n => !n.read).length);
  };

  // Load notifications on mount and when user changes
  useEffect(() => {
    if (user && !(user as any).is_demo) {
      loadNotifications();
      // Set up real-time subscription
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return;
      }
      
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          () => {
            loadNotifications();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else if ((user as any)?.is_demo) {
      // Cargar notificaciones demo
      loadDemoNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    // Skip loading for demo users to prevent errors
    if ((user as any)?.is_demo) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    setLoading(true);
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedNotifications: NotificationItem[] = data?.map((item: any) => ({
        id: item.id,
        type: item.type || 'system',
        title: item.title || 'Notificación',
        message: item.message || '',
        read: item.read || false,
        created_at: item.created_at,
        action_url: item.action_url,
        sender_id: item.sender_id,
        sender_name: item.sender_name
      })) || [];

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.read).length);
    } catch (error) {
      logger.error('Error loading notifications:', error as any);
      // Only show toast for non-demo users
      if (!(user as any)?.is_demo) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las notificaciones",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true } as any)
        .eq('id', parseInt(notificationId, 10));

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      logger.error('Error marking notification as read:', error as any);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true } as any)
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      toast({
        title: "Éxito",
        description: "Todas las notificaciones marcadas como leídas"
      });
    } catch (error) {
      logger.error('Error marking all notifications as read:', error as any);
      toast({
        title: "Error",
        description: "No se pudieron marcar las notificaciones como leídas",
        variant: "destructive"
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', parseInt(notificationId, 10));

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.read ? prev - 1 : prev;
      });
    } catch (error) {
      logger.error('Error deleting notification:', error as any);
      toast({
        title: "Error",
        description: "No se pudo eliminar la notificación",
        variant: "destructive"
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'request': return <UserPlus className="w-4 h-4 text-purple-500" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const groupedNotifications = {
    unread: notifications.filter(n => !n.read),
    read: notifications.filter(n => n.read)
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 z-50 w-96 max-w-[90vw]"
            >
              <Card className="shadow-xl border-0 bg-gradient-to-r from-pink-500/95 to-purple-600/95 dark:bg-gray-900/95 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Notificaciones</CardTitle>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs"
                        >
                          Marcar todas
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <Tabs defaultValue="unread" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mx-4 mb-4">
                      <TabsTrigger value="unread" className="text-xs">
                        No leídas ({groupedNotifications.unread.length})
                      </TabsTrigger>
                      <TabsTrigger value="all" className="text-xs">
                        Todas ({notifications.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="unread" className="mt-0">
                      <ScrollArea className="h-96">
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          </div>
                        ) : groupedNotifications.unread.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No hay notificaciones nuevas</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {groupedNotifications.unread.map((notification) => (
                              <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={markAsRead}
                                onDelete={deleteNotification}
                                formatTimeAgo={formatTimeAgo}
                                getNotificationIcon={getNotificationIcon}
                              />
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="all" className="mt-0">
                      <ScrollArea className="h-96">
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No hay notificaciones</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {notifications.map((notification) => (
                              <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={markAsRead}
                                onDelete={deleteNotification}
                                formatTimeAgo={formatTimeAgo}
                                getNotificationIcon={getNotificationIcon}
                              />
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Individual notification item component
interface NotificationItemProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  formatTimeAgo: (date: string) => string;
  getNotificationIcon: (type: string) => React.ReactNode;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  formatTimeAgo,
  getNotificationIcon
}) => {
  const handleAction = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <div 
      className={`p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
      }`}
      onClick={handleAction}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                {notification.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {notification.message}
              </p>
              {notification.sender_name && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  De: {notification.sender_name}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs text-gray-400">
                {formatTimeAgo(notification.created_at)}
              </span>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-1"></div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="p-1 h-6 w-6"
            >
              <Check className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;

