import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/shared/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/Modal';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/useToast';
import {
  Shield, AlertTriangle, Lock, Eye, Ban, UserX, Smartphone,
  RefreshCw, Search, Settings, CheckCircle, XCircle
} from 'lucide-react';

type SecurityAlert = {
  id: string;
  user_id: string;
  user_name: string;
  alert_type: 'suspicious_login' | 'multiple_devices' | 'fraud_attempt' | 'account_compromise';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  description: string;
  created_at: string;
  metadata?: any;
};

type User2FAStatus = {
  user_id: string;
  user_name: string;
  has_2fa: boolean;
  enabled_at?: string;
};

type SecurityMetrics = {
  activeAlerts: number;
  resolvedToday: number;
  users2FA: number;
  totalUsers: number;
  suspiciousLogins: number;
  blockedAttempts: number;
};

export default function SecurityPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [user2FAStatus, setUser2FAStatus] = useState<User2FAStatus[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    activeAlerts: 0,
    resolvedToday: 0,
    users2FA: 0,
    totalUsers: 0,
    suspiciousLogins: 0,
    blockedAttempts: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [alertFilter, setAlertFilter] = useState('all');
  const [_selectedAlert, _setSelectedAlert] = useState<SecurityAlert | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadSecurityAlerts(),
        load2FAStatus(),
        loadSecurityMetrics()
      ]);
    } catch (error) {
      console.error('Error loading security data:', error);
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadSecurityAlerts = async () => {
    try {
      // Mock data - replace with real Supabase query when security_alerts table exists
      const mockAlerts: SecurityAlert[] = [
        {
          id: '1',
          user_id: 'user1',
          user_name: 'Juan Pérez',
          alert_type: 'suspicious_login',
          severity: 'high',
          status: 'open',
          description: 'Inicio de sesión desde ubicación inusual (IP: 192.168.1.1)',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'user2',
          user_name: 'María García',
          alert_type: 'multiple_devices',
          severity: 'medium',
          status: 'investigating',
          description: 'Múltiples dispositivos activos simultáneamente',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      setSecurityAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading security alerts:', error);
    }
  };

  const load2FAStatus = async () => {
    try {
      // Mock data - replace with real query
      const mock2FA: User2FAStatus[] = [
        { user_id: 'user1', user_name: 'Juan Pérez', has_2fa: true, enabled_at: new Date().toISOString() },
        { user_id: 'user2', user_name: 'María García', has_2fa: false }
      ];
      setUser2FAStatus(mock2FA);
    } catch (error) {
      console.error('Error loading 2FA status:', error);
    }
  };

  const loadSecurityMetrics = async () => {
    try {
      const metrics: SecurityMetrics = {
        activeAlerts: securityAlerts.filter(a => a.status === 'open').length,
        resolvedToday: 5,
        users2FA: user2FAStatus.filter(u => u.has_2fa).length,
        totalUsers: 150,
        suspiciousLogins: 3,
        blockedAttempts: 12
      };
      setSecurityMetrics(metrics);
    } catch (error) {
      console.error('Error loading security metrics:', error);
    }
  };

  const generateMockData = () => {
    const mockAlerts: SecurityAlert[] = [
      {
        id: '1',
        user_id: 'user1',
        user_name: 'Usuario Demo',
        alert_type: 'suspicious_login',
        severity: 'high',
        status: 'open',
        description: 'Actividad sospechosa detectada',
        created_at: new Date().toISOString()
      }
    ];
    
    const mock2FA: User2FAStatus[] = [
      { user_id: 'user1', user_name: 'Usuario Demo', has_2fa: false }
    ];

    setSecurityAlerts(mockAlerts);
    setUser2FAStatus(mock2FA);
    setSecurityMetrics({
      activeAlerts: 1,
      resolvedToday: 0,
      users2FA: 0,
      totalUsers: 1,
      suspiciousLogins: 1,
      blockedAttempts: 0
    });
  };

  const handleAlertAction = async (alertId: string, action: 'investigate' | 'resolve' | 'false_positive') => {
    try {
      const updatedAlerts = securityAlerts.map(alert => {
        if (alert.id === alertId) {
          return {
            ...alert,
            status: action === 'investigate' ? 'investigating' as const :
                   action === 'resolve' ? 'resolved' as const : 'false_positive' as const
          };
        }
        return alert;
      });

      setSecurityAlerts(updatedAlerts);

      const actionMessages = {
        investigate: 'Alerta marcada como en investigación',
        resolve: 'Alerta resuelta',
        false_positive: 'Alerta marcada como falso positivo'
      };

      toast({
        title: "Acción completada",
        description: actionMessages[action],
      });
    } catch (error) {
      console.error('Error updating alert:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la alerta",
        variant: "destructive"
      });
    }
  };

  const handle2FAToggle = async (userId: string) => {
    try {
      const updated2FA = user2FAStatus.map(user => {
        if (user.user_id === userId) {
          return {
            ...user,
            has_2fa: !user.has_2fa,
            enabled_at: user.has_2fa ? undefined : new Date().toISOString()
          };
        }
        return user;
      });

      setUser2FAStatus(updated2FA);

      const user = user2FAStatus.find(u => u.user_id === userId);
      toast({
        title: !user?.has_2fa ? "2FA Habilitado" : "2FA Deshabilitado",
        description: `2FA ${!user?.has_2fa ? 'activado' : 'desactivado'} para el usuario`,
      });
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de 2FA",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: SecurityAlert['status']) => {
    const statusConfig = {
      open: { label: 'Abierta', className: 'bg-red-100 text-red-800' },
      investigating: { label: 'Investigando', className: 'bg-yellow-100 text-yellow-800' },
      resolved: { label: 'Resuelta', className: 'bg-green-100 text-green-800' },
      false_positive: { label: 'Falso Positivo', className: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getAlertIcon = (type: SecurityAlert['alert_type']) => {
    switch (type) {
      case 'suspicious_login': return <Eye className="w-4 h-4" />;
      case 'multiple_devices': return <Smartphone className="w-4 h-4" />;
      case 'fraud_attempt': return <Ban className="w-4 h-4" />;
      case 'account_compromise': return <UserX className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredAlerts = securityAlerts.filter(alert => {
    const matchesSearch = alert.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = alertFilter === 'all' || alert.status === alertFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-600" />
            Panel de Seguridad
          </h2>
          <p className="text-gray-600">
            Monitoreo de seguridad, alertas y gestión de 2FA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadSecurityData} disabled={isLoading} className="border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Métricas de seguridad */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{securityMetrics.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {securityMetrics.resolvedToday} resueltas hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios con 2FA</CardTitle>
            <Lock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{securityMetrics.users2FA}</div>
            <p className="text-xs text-muted-foreground">
              {((securityMetrics.users2FA / securityMetrics.totalUsers) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logins Sospechosos</CardTitle>
            <Eye className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{securityMetrics.suspiciousLogins}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intentos Bloqueados</CardTitle>
            <Ban className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{securityMetrics.blockedAttempts}</div>
            <p className="text-xs text-muted-foreground">
              Hoy
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="2fa">2FA</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {/* Filtros de alertas */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar alertas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={alertFilter} onValueChange={setAlertFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las alertas</SelectItem>
                    <SelectItem value="open">Abiertas</SelectItem>
                    <SelectItem value="investigating">Investigando</SelectItem>
                    <SelectItem value="resolved">Resueltas</SelectItem>
                    <SelectItem value="false_positive">Falsos Positivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas de Seguridad ({filteredAlerts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando alertas...</p>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No se encontraron alertas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.alert_type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{alert.user_name}</h4>
                              <Badge className="border border-red-200 text-red-600">
                                {alert.alert_type.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge className={`border ${getSeverityColor(alert.severity)}`}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">{alert.description}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusBadge(alert.status)}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                className="border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 h-8 px-3 text-sm shadow-md"
                                onClick={() => _setSelectedAlert(alert)}
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Gestionar Alerta</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Detalles de la Alerta</h4>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Usuario:</strong> {alert.user_name}</div>
                                    <div><strong>Tipo:</strong> {alert.alert_type}</div>
                                    <div><strong>Severidad:</strong> {alert.severity}</div>
                                    <div><strong>Estado:</strong> {alert.status}</div>
                                    <div><strong>Descripción:</strong> {alert.description}</div>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  {alert.status === 'open' && (
                                    <Button 
                                      className="border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                                      onClick={() => handleAlertAction(alert.id, 'investigate')}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      Investigar
                                    </Button>
                                  )}
                                  
                                  {(alert.status === 'open' || alert.status === 'investigating') && (
                                    <>
                                      <Button 
                                        className="border border-green-300 bg-green-500/20 backdrop-blur-md text-white hover:bg-green-500/30"
                                        onClick={() => handleAlertAction(alert.id, 'resolve')}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Resolver
                                      </Button>
                                      
                                      <Button 
                                        className="border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                                        onClick={() => handleAlertAction(alert.id, 'false_positive')}
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Falso Positivo
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2fa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Estado de Autenticación de Dos Factores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-white/80">Cargando estado 2FA...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {user2FAStatus.map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg bg-white/10 backdrop-blur-md border-white/20">
                      <div>
                        <div className="font-medium text-white">{user.user_name}</div>
                        <div className="text-sm text-white/80">
                          {user.has_2fa ? `2FA habilitado ${user.enabled_at ? 'el ' + new Date(user.enabled_at).toLocaleDateString() : ''}` : '2FA no habilitado'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={user.has_2fa ? 'bg-green-500/20 text-green-300 border-green-300/30' : 'bg-red-500/20 text-red-300 border-red-300/30'}>
                          {user.has_2fa ? 'Habilitado' : 'Deshabilitado'}
                        </Badge>
                        <Button 
                          className="border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                          onClick={() => handle2FAToggle(user.user_id)}
                        >
                          {user.has_2fa ? 'Deshabilitar' : 'Habilitar'} 2FA
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Suspensión automática</div>
                  <div className="text-sm text-gray-600">Suspender automáticamente cuentas con actividad sospechosa</div>
                </div>
                <Switch 
                  onCheckedChange={(checked: boolean) => {
                    toast({
                      title: "Configuración actualizada",
                      description: `Suspensión automática ${checked ? 'habilitada' : 'deshabilitada'}`,
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Notificaciones de seguridad</div>
                  <div className="text-sm text-gray-600">Enviar notificaciones por email para alertas críticas</div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Análisis de comportamiento</div>
                  <div className="text-sm text-gray-600">Detectar patrones anómalos en el comportamiento de usuarios</div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}