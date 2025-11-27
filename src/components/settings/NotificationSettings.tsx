import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/shared/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, MessageCircle, Heart, Calendar, Zap } from "lucide-react";
import { logger } from '@/lib/logger';

export const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    events: true,
    marketing: false,
    push: true,
    email: true,
    quiet_hours: false
  });

  const [quietHours, setQuietHours] = useState({
    start: "22:00",
    end: "08:00"
  });

  const [summaryFrequency, setSummaryFrequency] = useState("daily");
  const navigate = useNavigate();

    const handleSave = () => {
    logger.info("Notification settings saved:", {
      ...notifications,
      quietHours,
      summaryFrequency,
    });
    // Lógica para guardar en el backend
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones Push
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications">Activar notificaciones push</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones en tiempo real
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={notifications.push}
              onCheckedChange={(value) => handleNotificationChange('push', value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="h-4 w-4 text-primary" />
                <div>
                  <Label htmlFor="match-notifications">Nuevos matches</Label>
                  <p className="text-sm text-muted-foreground">
                    Cuando alguien hace match contigo
                  </p>
                </div>
              </div>
              <Switch
                id="match-notifications"
                checked={notifications.matches}
                onCheckedChange={(value) => handleNotificationChange('matches', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-primary" />
                <div>
                  <Label htmlFor="message-notifications">Mensajes</Label>
                  <p className="text-sm text-muted-foreground">
                    Nuevos mensajes en el chat
                  </p>
                </div>
              </div>
              <Switch
                id="message-notifications"
                checked={notifications.messages}
                onCheckedChange={(value) => handleNotificationChange('messages', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-primary" />
                <div>
                  <Label htmlFor="event-notifications">Eventos</Label>
                  <p className="text-sm text-muted-foreground">
                    Recordatorios de eventos y actividades
                  </p>
                </div>
              </div>
              <Switch
                id="event-notifications"
                checked={notifications.events}
                onCheckedChange={(value) => handleNotificationChange('events', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Notificaciones por Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Activar emails</Label>
              <p className="text-sm text-muted-foreground">
                Recibe resúmenes por email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={notifications.email}
              onCheckedChange={(value) => handleNotificationChange('email', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketing-emails">Emails promocionales</Label>
              <p className="text-sm text-muted-foreground">
                Ofertas especiales y actualizaciones
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={notifications.marketing}
              onCheckedChange={(value) => handleNotificationChange('marketing', value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Frecuencia de resúmenes</Label>
            <Select value={summaryFrequency} onValueChange={setSummaryFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Inmediato</SelectItem>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="never">Nunca</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Horario Silencioso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="quiet-hours">Activar horario silencioso</Label>
              <p className="text-sm text-muted-foreground">
                No recibir notificaciones durante ciertas horas
              </p>
            </div>
            <Switch
              id="quiet-hours"
              checked={notifications.quiet_hours}
              onCheckedChange={(value) => handleNotificationChange('quiet_hours', value)}
            />
          </div>

          {notifications.quiet_hours && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label>Desde</Label>
                <Select value={quietHours.start} onValueChange={(value) => setQuietHours(prev => ({ ...prev, start: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hasta</Label>
                <Select value={quietHours.end} onValueChange={(value) => setQuietHours(prev => ({ ...prev, end: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium Notifications */}
      <Card className="shadow-soft bg-hero-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="h-5 w-5" />
            Notificaciones Premium
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/90">
            Obtén notificaciones avanzadas con la membresía Premium:
          </p>
          <ul className="space-y-2 text-sm text-white/80">
            <li>• Notificaciones cuando alguien ve tu perfil</li>
            <li>• Alertas de super likes recibidos</li>
            <li>• Recordatorios de conversaciones inactivas</li>
            <li>• Análisis de actividad personalizado</li>
          </ul>
          <Button variant="default" size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => navigate('/premium')}>
            Upgrade a Premium
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="love" size="lg" onClick={handleSave}>
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
};