import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { contentModerationService, ModerationResult } from '@/services/ContentModerationService';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  RefreshCw,
  Eye,
  Ban,
  Lock,
  FileText,
  Image,
  User,
  Flag
} from 'lucide-react';

interface ModerationQueue {
  id: string;
  type: 'text' | 'image' | 'profile';
  content: string;
  userId: string;
  userName: string;
  submittedAt: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
}

export const AdvancedModerationPanel: React.FC = () => {
  const [moderationQueue, setModerationQueue] = useState<ModerationQueue[]>([]);
  const [selectedItem, setSelectedItem] = useState<ModerationQueue | null>(null);
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModerating, setIsModerating] = useState(false);
  const [moderationStats, setModerationStats] = useState({
    totalPending: 0,
    totalReviewed: 0,
    approvalRate: 0,
    averageResponseTime: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadModerationQueue();
    loadModerationStats();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadModerationQueue();
      loadModerationStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadModerationQueue = async () => {
    try {
      // Simular carga de cola de moderación
      const mockQueue: ModerationQueue[] = [
        {
          id: '1',
          type: 'text',
          content: 'Este es un mensaje que necesita moderación',
          userId: 'user1',
          userName: 'Usuario1',
          submittedAt: new Date().toISOString(),
          priority: 'medium',
          status: 'pending'
        },
        {
          id: '2',
          type: 'profile',
          content: 'Perfil con información sospechosa',
          userId: 'user2',
          userName: 'Usuario2',
          submittedAt: new Date(Date.now() - 3600000).toISOString(),
          priority: 'high',
          status: 'pending'
        },
        {
          id: '3',
          type: 'image',
          content: 'Imagen que requiere revisión',
          userId: 'user3',
          userName: 'Usuario3',
          submittedAt: new Date(Date.now() - 7200000).toISOString(),
          priority: 'critical',
          status: 'pending'
        }
      ];
      
      setModerationQueue(mockQueue);
    } catch (err) {
      setError('Error loading moderation queue');
      console.error('Error loading moderation queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadModerationStats = async () => {
    try {
      // Simular estadísticas de moderación
      setModerationStats({
        totalPending: 15,
        totalReviewed: 150,
        approvalRate: 85.5,
        averageResponseTime: 12.3
      });
    } catch (err) {
      console.error('Error loading moderation stats:', err);
    }
  };

  const handleModerateContent = async (item: ModerationQueue) => {
    setIsModerating(true);
    try {
      let result: ModerationResult;
      
      switch (item.type) {
        case 'text':
          result = await contentModerationService.moderateText(item.content);
          break;
        case 'image':
          result = await contentModerationService.moderateImage(item.content);
          break;
        case 'profile':
          result = await contentModerationService.moderateProfile({ name: item.userName, content: item.content });
          break;
        default:
          throw new Error('Tipo de contenido no soportado');
      }
      
      setModerationResult(result);
      setSelectedItem(item);
      
      toast({
        title: "Moderación completada",
        description: `Contenido ${result.isAppropriate ? 'aprobado' : 'rechazado'}`,
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo moderar el contenido",
        variant: "destructive"
      });
    } finally {
      setIsModerating(false);
    }
  };

  const handleApproveContent = async (itemId: string) => {
    try {
      setModerationQueue(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, status: 'approved' as const }
            : item
        )
      );
      
      toast({
        title: "Contenido aprobado",
        description: "El contenido ha sido aprobado",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo aprobar el contenido",
        variant: "destructive"
      });
    }
  };

  const handleRejectContent = async (itemId: string) => {
    try {
      setModerationQueue(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, status: 'rejected' as const }
            : item
        )
      );
      
      toast({
        title: "Contenido rechazado",
        description: "El contenido ha sido rechazado",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo rechazar el contenido",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'profile': return <User className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando panel de moderación...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="mr-2 h-6 w-6" />
            Panel de Moderación Avanzado
          </h2>
          <p className="text-muted-foreground">
            Moderación automática y manual de contenido con IA
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadModerationQueue}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas de moderación */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{moderationStats.totalPending}</div>
            <p className="text-xs text-muted-foreground">
              Elementos en cola
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revisados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{moderationStats.totalReviewed}</div>
            <p className="text-xs text-muted-foreground">
              Total procesados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Aprobación</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderationStats.approvalRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Contenido aprobado
            </p>
            <Progress value={moderationStats.approvalRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderationStats.averageResponseTime.toFixed(1)}m</div>
            <p className="text-xs text-muted-foreground">
              Tiempo de respuesta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Cola de Moderación</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Flag className="mr-2 h-5 w-5" />
                Cola de Moderación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moderationQueue.length > 0 ? (
                  moderationQueue.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(item.type)}
                          <span className="font-medium">{item.userName}</span>
                          <Badge variant={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                          <Badge variant="outline">
                            {item.type}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(item.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {item.content}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleModerateContent(item)}
                            disabled={isModerating}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Moderar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedItem(item)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </Button>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveContent(item.id)}
                            disabled={item.status === 'approved'}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectContent(item.id)}
                            disabled={item.status === 'rejected'}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No hay contenido pendiente</h3>
                    <p className="text-muted-foreground">La cola de moderación está vacía</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {moderationResult && selectedItem ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Resultado de Moderación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{selectedItem.userName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.type} • {new Date(selectedItem.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(moderationResult.severity)}>
                        {moderationResult.severity}
                      </Badge>
                      <Badge variant={moderationResult.isAppropriate ? 'default' : 'destructive'}>
                        {moderationResult.isAppropriate ? 'Aprobado' : 'Rechazado'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Contenido:</h5>
                    <Textarea
                      value={selectedItem.content}
                      readOnly
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Explicación:</h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {moderationResult.explanation}
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Confianza: {(moderationResult.confidence * 100).toFixed(1)}%</h5>
                    <Progress value={moderationResult.confidence * 100} className="mt-2" />
                  </div>
                  
                  {moderationResult.flags.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Banderas detectadas:</h5>
                      <div className="space-y-2">
                        {moderationResult.flags.map((flag, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <div>
                              <p className="text-sm font-medium">{flag.type}</p>
                              <p className="text-xs text-muted-foreground">{flag.description}</p>
                            </div>
                            <Badge variant="outline">
                              {(flag.confidence * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleApproveContent(selectedItem.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Aprobar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectContent(selectedItem.id)}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No hay resultados de moderación</h3>
                <p className="text-muted-foreground">Selecciona un elemento de la cola para ver los resultados</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                Configuración de Moderación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Umbral de Toxicidad</label>
                    <Select defaultValue="0.7">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar umbral" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">Bajo (0.5)</SelectItem>
                        <SelectItem value="0.7">Medio (0.7)</SelectItem>
                        <SelectItem value="0.8">Alto (0.8)</SelectItem>
                        <SelectItem value="0.9">Muy Alto (0.9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Umbral de Spam</label>
                    <Select defaultValue="0.6">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar umbral" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.4">Bajo (0.4)</SelectItem>
                        <SelectItem value="0.6">Medio (0.6)</SelectItem>
                        <SelectItem value="0.7">Alto (0.7)</SelectItem>
                        <SelectItem value="0.8">Muy Alto (0.8)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>
                    <Lock className="mr-2 h-4 w-4" />
                    Guardar Configuración
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

