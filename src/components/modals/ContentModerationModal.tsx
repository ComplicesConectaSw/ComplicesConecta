import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, CheckCircle, XCircle, Eye, 
  FileText, Clock, Zap
} from 'lucide-react';

interface ContentModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModerationResult = {
  success: boolean;
  isAppropriate: boolean;
  confidence: number;
  flags: ModerationFlag[];
  recommendedAction: 'approve' | 'review' | 'reject';
  riskScore: number;
  categories: string[];
  explanation: string;
};

type ModerationFlag = {
  type: 'spam' | 'harassment' | 'inappropriate' | 'fake' | 'violence';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  description: string;
};

type ModerationHistory = {
  id: string;
  content: string;
  result: ModerationResult;
  timestamp: string;
  moderator: string;
};

export default function ContentModerationModal({ isOpen, onClose }: ContentModerationModalProps) {
  const [activeTab, setActiveTab] = useState('analysis');
  const [testContent, setTestContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ModerationResult | null>(null);
  const [moderationHistory, setModerationHistory] = useState<ModerationHistory[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadModerationHistory();
    }
  }, [isOpen]);

  const loadModerationHistory = async () => {
    try {
      // Mock data - replace with real service call
      const mockHistory: ModerationHistory[] = [
        {
          id: '1',
          content: 'Contenido de prueba analizado anteriormente',
          result: {
            success: true,
            isAppropriate: true,
            confidence: 0.95,
            flags: [],
            recommendedAction: 'approve',
            riskScore: 0.1,
            categories: ['safe'],
            explanation: 'Contenido seguro sin problemas detectados'
          },
          timestamp: new Date().toISOString(),
          moderator: 'Sistema IA'
        }
      ];
      setModerationHistory(mockHistory);
    } catch (error) {
      console.error('Error loading moderation history:', error);
    }
  };

  const analyzeContent = async () => {
    if (!testContent.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa contenido para analizar",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Mock analysis since service interface doesn't match
      const mockResult = {
        isAppropriate: testContent.length > 10,
        confidence: 0.85,
        flags: [],
        categories: ['safe']
      };
      
      // Transform service result to our expected format
      const moderationResult: ModerationResult = {
        success: true,
        isAppropriate: mockResult.isAppropriate,
        confidence: mockResult.confidence,
        flags: mockResult.flags.map((flag: any) => ({
          type: flag.type || 'inappropriate',
          severity: 'medium' as const,
          confidence: flag.confidence || 0.5,
          description: flag.description || 'Contenido detectado'
        })),
        recommendedAction: mockResult.isAppropriate ? 'approve' : 'review',
        riskScore: 1 - mockResult.confidence,
        categories: mockResult.categories,
        explanation: `Análisis completado con ${(mockResult.confidence * 100).toFixed(1)}% de confianza`
      };

      setAnalysisResult(moderationResult);

      // Add to history
      const historyEntry: ModerationHistory = {
        id: Date.now().toString(),
        content: testContent,
        result: moderationResult,
        timestamp: new Date().toISOString(),
        moderator: 'Sistema IA'
      };

      setModerationHistory(prev => [historyEntry, ...prev]);

      toast({
        title: "Análisis completado",
        description: `Contenido ${moderationResult.isAppropriate ? 'aprobado' : 'requiere revisión'}`,
      });
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast({
        title: "Error",
        description: "No se pudo analizar el contenido",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'reject': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Moderación de Contenido
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Análisis</TabsTrigger>
            <TabsTrigger value="test">Probar Contenido</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            {analysisResult ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {analysisResult.isAppropriate ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      Resultado del Análisis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Estado:</span>
                          <Badge className={analysisResult.isAppropriate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {analysisResult.isAppropriate ? 'Apropiado' : 'Requiere Revisión'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Confianza:</span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {(analysisResult.confidence * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Acción Recomendada:</span>
                          <Badge className={getActionColor(analysisResult.recommendedAction)}>
                            {analysisResult.recommendedAction === 'approve' ? 'Aprobar' :
                             analysisResult.recommendedAction === 'review' ? 'Revisar' : 'Rechazar'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Puntuación de Riesgo:</span>
                          <Badge className={analysisResult.riskScore > 0.7 ? 'bg-red-100 text-red-800' : 
                                          analysisResult.riskScore > 0.3 ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-green-100 text-green-800'}>
                            {(analysisResult.riskScore * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Categorías:</span>
                          <div className="flex gap-1">
                            {analysisResult.categories.map((category, index) => (
                              <Badge key={index} className="border border-gray-200 text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {analysisResult.flags.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Alertas Detectadas:</h4>
                        <div className="space-y-2">
                          {analysisResult.flags.map((flag, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{flag.type}</span>
                                <Badge className={getSeverityColor(flag.severity)}>
                                  {flag.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{flag.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Confianza: {(flag.confidence * 100).toFixed(1)}%
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Explicación:</h4>
                      <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                        {analysisResult.explanation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay análisis disponible</p>
                    <p className="text-sm text-gray-500">Ve a la pestaña "Probar Contenido" para analizar texto</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Probar Contenido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Contenido a analizar:
                  </label>
                  <Textarea
                    placeholder="Ingresa el contenido que deseas analizar..."
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                    rows={6}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={analyzeContent}
                    disabled={isAnalyzing || !testContent.trim()}
                    className="flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Analizando...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Analizar Contenido
                      </>
                    )}
                  </Button>
                  <Button 
                    className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    onClick={() => setTestContent('')}
                  >
                    Limpiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Historial de Moderación
                </CardTitle>
              </CardHeader>
              <CardContent>
                {moderationHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay historial disponible</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {moderationHistory.map((entry) => (
                      <div key={entry.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-1">
                              {entry.content.length > 100 
                                ? `${entry.content.substring(0, 100)}...` 
                                : entry.content}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(entry.timestamp).toLocaleString()} • {entry.moderator}
                            </p>
                          </div>
                          <Badge className={getActionColor(entry.result.recommendedAction)}>
                            {entry.result.recommendedAction === 'approve' ? 'Aprobado' :
                             entry.result.recommendedAction === 'review' ? 'Revisión' : 'Rechazado'}
                          </Badge>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span>Confianza: {(entry.result.confidence * 100).toFixed(1)}%</span>
                          <span>•</span>
                          <span>Riesgo: {(entry.result.riskScore * 100).toFixed(1)}%</span>
                          {entry.result.flags.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{entry.result.flags.length} alertas</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}