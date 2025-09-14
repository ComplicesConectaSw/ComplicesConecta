import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  Users, 
  Calendar,
  Settings,
  Smartphone,
  Mail,
  Volume2,
  Vibrate
} from "lucide-react";
import { logger } from '@/lib/logger';

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: "match",
    title: "¡Nuevo Match!",
    message: "Tienes un nuevo match con Ana M.",
    time: "Hace 5 min",
    read: false,
    avatar: "A"
  },
  {
    id: 2,
    type: "message",
    title: "Nuevo mensaje",
    message: "Carlos R. te ha enviado un mensaje",
    time: "Hace 15 min",
    read: false,
    avatar: "C"
  },
  {
    id: 3,
    type: "like",
    title: "Alguien te dio like",
    message: "Tienes 3 nuevos likes",
    time: "Hace 1 hora",
    read: true,
    avatar: "?"
  },
  {
    id: 4,
    type: "event",
    title: "Evento cerca",
    message: "Speed Dating en tu zona - Mañana 20:00",
    time: "Hace 2 horas",
    read: true,
    avatar: "📅"
  },
  {
    id: 5,
    type: "premium",
    title: "Función Premium",
    message: "¡Usa tu boost gratuito antes de que expire!",
    time: "Hace 3 horas",
    read: true,
    avatar: "👑"
  }
];

const notificationSettings = [
  {
    category: "Matches",
    icon: Heart,
    color: "text-red-500",
    settings: [
      { id: "new_matches", label: "Nuevos matches", enabled: true },
      { id: "mutual_likes", label: "Likes mutuos", enabled: true },
      { id: "super_likes", label: "Super likes recibidos", enabled: true }
    ]
  },
  {
    category: "Mensajes",
    icon: MessageCircle,
    color: "text-blue-500",
    settings: [
      { id: "new_messages", label: "Nuevos mensajes", enabled: true },
      { id: "message_reactions", label: "Reacciones a mensajes", enabled: false },
      { id: "read_receipts", label: "Confirmaciones de lectura", enabled: true }
    ]
  },
  {
    category: "Social",
    icon: Users,
    color: "text-green-500",
    settings: [
      { id: "profile_views", label: "Vistas de perfil", enabled: false },
      { id: "friend_joins", label: "Amigos se unen", enabled: true },
      { id: "recommendations", label: "Recomendaciones", enabled: true }
    ]
  },
  {
    category: "Eventos",
    icon: Calendar,
    color: "text-purple-500",
    settings: [
      { id: "nearby_events", label: "Eventos cercanos", enabled: true },
      { id: "event_reminders", label: "Recordatorios de eventos", enabled: true },
      { id: "event_updates", label: "Actualizaciones de eventos", enabled: false }
    ]
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "match": return <Heart className="h-4 w-4 text-red-500" />;
    case "message": return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "like": return <Heart className="h-4 w-4 text-pink-500" />;
    case "event": return <Calendar className="h-4 w-4 text-purple-500" />;
    case "premium": return <span className="text-yellow-500">👑</span>;
    default: return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

export const NotificationCenter = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [settings, setSettings] = useState(notificationSettings);
  
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const toggleSetting = (categoryIndex: number, settingIndex: number) => {
    setSettings(prev => prev.map((category, cIndex) => 
      cIndex === categoryIndex 
        ? {
            ...category,
            settings: category.settings.map((setting, sIndex) =>
              sIndex === settingIndex 
                ? { ...setting, enabled: !setting.enabled }
                : setting
            )
          }
        : category
    ));
  };

  const markAllAsRead = () => {
    // In a real app, this would update the notifications
    logger.info("Marking all as read");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notificaciones</h2>
          <p className="text-muted-foreground">
            Tienes {unreadCount} notificaciones sin leer
          </p>
        </div>
        <Button variant="outline" onClick={markAllAsRead}>
          Marcar todas como leídas
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-2xl p-2">
          <TabsTrigger value="notifications" className="rounded-xl">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {mockNotifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`shadow-soft transition-all duration-300 cursor-pointer hover:shadow-glow ${
                !notification.read ? "border-primary/30 bg-primary/5" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      {notification.avatar?.length === 1 ? (
                        <span className="font-medium">{notification.avatar}</span>
                      ) : (
                        <span>{notification.avatar}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getNotificationIcon(notification.type)}
                        <h4 className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Delivery Settings */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Métodos de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Notificaciones Push</p>
                    <p className="text-sm text-muted-foreground">Recibir en el dispositivo</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">Resumen diario por correo</p>
                  </div>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Sonido</p>
                    <p className="text-sm text-muted-foreground">Reproducir sonido de notificación</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Vibrate className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Vibración</p>
                    <p className="text-sm text-muted-foreground">Vibrar en notificaciones</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Notification Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tipos de Notificación</h3>
            {settings.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <Card key={category.category} className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Icon className={`h-5 w-5 ${category.color}`} />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {category.settings.map((setting, settingIndex) => (
                      <div key={setting.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{setting.label}</p>
                        </div>
                        <Switch
                          checked={setting.enabled}
                          onCheckedChange={() => toggleSetting(categoryIndex, settingIndex)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quiet Hours */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Horas Silenciosas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Activar modo silencioso</p>
                  <p className="text-sm text-muted-foreground">No recibir notificaciones durante ciertas horas</p>
                </div>
                <Switch />
              </div>
              <div className="grid grid-cols-2 gap-4 opacity-50">
                <div>
                  <label className="text-sm font-medium">Desde</label>
                  <p className="text-sm text-muted-foreground">22:00</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Hasta</label>
                  <p className="text-sm text-muted-foreground">08:00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};