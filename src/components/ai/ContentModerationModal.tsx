/**
 * Modal interactivo para moderación de contenido con IA
 * Permite revisar y gestionar contenido reportado o automáticamente detectado
 */

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Flag, MessageSquare, Image, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useContentModeration, type ModerationResult, type ContentToModerate } from '@/lib/ai/contentModeration';
import { logger } from '@/lib/logger';

interface ContentModerationModalProps {
  trigger?: React.ReactNode;
  onModerationComplete?: (result: ModerationResult) => void;
}

interface ContentItem {
  id: string;
  type: 'profile' | 'message' | 'image' | 'bio';
  content: string;
  userId: string;
  userName: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationResult?: ModerationResult;
}

export const ContentModerationModal: React.FC<ContentModerationModalProps> = ({
  trigger,
  onModerationComplete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [testContent, setTestContent] = useState('');
  const [testType, setTestType] = useState<'message' | 'profile' | 'bio' | 'image'>('message');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { moderateContent } = useContentModeration();

  // Cargar contenido pendiente de moderación
  useEffect(() => {
    if (isOpen) {
      loadPendingContent();
    }
  }, [isOpen]);

  const loadPendingContent = () => {
    // Simular contenido pendiente de moderación
    const mockContent: ContentItem[] = [
      {
        id: '1',
        type: 'message',
        content: 'Hola, me interesa conocer parejas para intercambio discreto en CDMX',
        userId: 'user1',
        userName: 'Carlos M.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'pending'
      },
      {
        id: '2',
        type: 'profile',
        content: 'Somos pareja liberal buscando experiencias nuevas con respeto y discreción',
        userId: 'user2',
        userName: 'Ana & Luis',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'pending'
      },
      {
        id: '3',
        type: 'message',
        content: 'Tengo fotos explícitas que te van a encantar, mándame tu WhatsApp',
        userId: 'user3',
        userName: 'Usuario Sospechoso',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        status: 'flagged'
      }
    ];

    setContentItems(mockContent);
  };

  const analyzeTestContent = async () => {
    if (!testContent.trim()) return;

    setIsAnalyzing(true);
    
    try {
      const contentToModerate: ContentToModerate = {
        type: testType,
        content: testContent,
        userId: 'test-user'
      };

      const result = await moderateContent(contentToModerate);
      
      const newItem: ContentItem = {
        id: Date.now().toString(),
        type: testType,
        content: testContent,
        userId: 'test-user',
        userName: 'Usuario de Prueba',
        timestamp: new Date(),
        status: result.isApproved ? 'approved' : 'rejected',
        moderationResult: result
      };

      setContentItems(prev => [newItem, ...prev]);
      setSelectedItem(newItem);
      setTestContent('');
      
      onModerationComplete?.(result);
      
    } catch (error) {
      logger.error('❌ Error en moderación de prueba', { error });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const moderateItem = async (item: ContentItem) => {
    if (item.moderationResult) {
      setSelectedItem(item);
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const contentToModerate: ContentToModerate = {
        type: item.type,
        content: item.content,
        userId: item.userId
      };

      const result = await moderateContent(contentToModerate);
      
      const updatedItem: ContentItem = {
        ...item,
        status: result.isApproved ? 'approved' as const : 'rejected' as const,
        moderationResult: result
      };

      setContentItems(prev => 
        prev.map(i => i.id === item.id ? updatedItem : i)
      );
      
      setSelectedItem(updatedItem);
      
    } catch (error) {
      logger.error('❌ Error moderando contenido', { error });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: ContentItem['status']) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'flagged': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: ContentItem['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'flagged': return <Flag className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'profile':
      case 'bio': return <FileText className="h-4 w-4" />;
    }
  };

  const _getSeverityColor = (severity: ModerationResult['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      default: return 'text-blue-700 bg-blue-100 border-blue-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Shield className="h-4 w-4" />
            Moderación de Contenido
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Centro de Moderación con IA
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="queue" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="queue">Cola de Moderación</TabsTrigger>
            <TabsTrigger value="test">Probar Moderación</TabsTrigger>
            <TabsTrigger value="analysis">Análisis Detallado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="queue" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Lista de contenido */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contenido Pendiente</h3>
                
                {contentItems.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No hay contenido pendiente de moderación</p>
                    </CardContent>
                  </Card>
                ) : (
                  contentItems.map((item) => (
                    <Card 
                      key={item.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedItem?.id === item.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => moderateItem(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <span className="font-medium">{item.userName}</span>
                            <Badge variant="outline">{item.type}</Badge>
                          </div>
                          
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            {item.status}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {item.content}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{item.timestamp.toLocaleString()}</span>
                          {item.moderationResult && (
                            <span className="font-medium">
                              Confianza: {item.moderationResult.confidence}%
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Vista previa del contenido seleccionado */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vista Previa</h3>
                
                {selectedItem ? (
                  <ContentPreview item={selectedItem} />
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Selecciona contenido para ver detalles</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Probar Moderación de Contenido</CardTitle>
                <CardDescription>
                  Ingresa contenido para probar los algoritmos de moderación con IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {(['message', 'profile', 'bio', 'image'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={testType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTestType(type)}
                      className="gap-1"
                    >
                      {getTypeIcon(type)}
                      {type}
                    </Button>
                  ))}
                </div>
                
                <Textarea
                  placeholder={`Ingresa contenido de tipo "${testType}" para analizar...`}
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  rows={4}
                />
                
                <Button 
                  onClick={analyzeTestContent}
                  disabled={!testContent.trim() || isAnalyzing}
                  className="w-full gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Analizar Contenido
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-4">
            {selectedItem?.moderationResult ? (
              <ModerationAnalysis result={selectedItem.moderationResult} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay análisis disponible</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Selecciona contenido moderado para ver el análisis detallado de IA.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Componente para vista previa de contenido
const ContentPreview: React.FC<{ item: ContentItem }> = ({ item }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {getTypeIcon(item.type)}
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {item.userName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm whitespace-pre-wrap">{item.content}</p>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {item.timestamp.toLocaleString()}
          </span>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
            {getStatusIcon(item.status)}
            {item.status}
          </div>
        </div>

        {item.moderationResult && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium">Resultado de IA:</span>
              <Badge variant={item.moderationResult.isApproved ? 'default' : 'destructive'}>
                {item.moderationResult.isApproved ? 'Aprobado' : 'Rechazado'}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {item.moderationResult.explanation}
            </div>
            
            {item.moderationResult.flags.length > 0 && (
              <div className="space-y-2">
                <div className="font-medium text-sm">Flags detectados:</div>
                {item.moderationResult.flags.map((flag, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span>{flag.description}</span>
                    <Badge variant="outline">{flag.severity}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para análisis detallado de moderación
const ModerationAnalysis: React.FC<{ result: ModerationResult }> = ({ result }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Análisis de Moderación Detallado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resultado general */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${result.isApproved ? 'text-green-600' : 'text-red-600'}`}>
                {result.isApproved ? '✅' : '❌'}
              </div>
              <div className="text-sm font-medium">
                {result.isApproved ? 'Aprobado' : 'Rechazado'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {result.confidence}%
              </div>
              <div className="text-sm font-medium">Confianza</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${getSeverityColor(result.severity).split(' ')[0]}`}>
                {result.severity.toUpperCase()}
              </div>
              <div className="text-sm font-medium">Severidad</div>
            </div>
          </div>

          {/* Explicación */}
          <div className={`p-4 rounded-lg border ${getSeverityColor(result.severity)}`}>
            <div className="font-medium mb-2">Explicación del Algoritmo:</div>
            <p className="text-sm">{result.explanation}</p>
          </div>

          {/* Flags detallados */}
          {result.flags.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Flags Detectados:</h4>
              <div className="grid gap-3">
                {result.flags.map((flag, index) => (
                  <Card key={index} className="border-l-4 border-l-orange-400">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">
                          {flag.type.replace(/_/g, ' ')}
                        </span>
                        <Badge variant="outline">{flag.severity}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {flag.description}
                      </p>
                      {flag.evidence && flag.evidence.length > 0 && (
                        <div className="text-xs">
                          <span className="font-medium">Evidencia: </span>
                          <span className="text-muted-foreground">
                            {flag.evidence.join(', ')}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Acción sugerida */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Acción Sugerida</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="mb-2">
                {result.suggestedAction.replace(/_/g, ' ')}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Procesado el {result.processedAt.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

// Funciones auxiliares
const getTypeIcon = (type: ContentItem['type']) => {
  switch (type) {
    case 'message': return <MessageSquare className="h-4 w-4" />;
    case 'image': return <Image className="h-4 w-4" />;
    case 'profile':
    case 'bio': return <FileText className="h-4 w-4" />;
  }
};

const getStatusColor = (status: ContentItem['status']) => {
  switch (status) {
    case 'approved': return 'text-green-600 bg-green-100';
    case 'rejected': return 'text-red-600 bg-red-100';
    case 'flagged': return 'text-orange-600 bg-orange-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

const getStatusIcon = (status: ContentItem['status']) => {
  switch (status) {
    case 'approved': return <CheckCircle className="h-4 w-4" />;
    case 'rejected': return <XCircle className="h-4 w-4" />;
    case 'flagged': return <Flag className="h-4 w-4" />;
    default: return <Eye className="h-4 w-4" />;
  }
};

const getSeverityColor = (severity: ModerationResult['severity']) => {
  switch (severity) {
    case 'critical': return 'text-red-700 bg-red-100 border-red-300';
    case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
    case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    default: return 'text-blue-700 bg-blue-100 border-blue-300';
  }
};

export default ContentModerationModal;
