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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 text-white border-purple-500/30 z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white font-bold text-xl drop-shadow-lg">
            <Shield className="w-5 h-5 text-blue-400" />
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
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white font-bold drop-shadow-lg">
                      {analysisResult.isAppropriate ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      Resultado del Análisis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-white drop-shadow-sm">Estado:</span>
                          <Badge className={analysisResult.isAppropriate ? 'bg-green-600/30 text-green-300 border-green-400/50' : 'bg-red-600/30 text-red-300 border-red-400/50'}>
                            {analysisResult.isAppropriate ? 'Apropiado' : 'Requiere Revisión'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-white drop-shadow-sm">Confianza:</span>
                          <Badge className="bg-blue-600/30 text-blue-300 border-blue-400/50">
                            {(analysisResult.confidence * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-white drop-shadow-sm">Acción Recomendada:</span>
                          <Badge className={`${getActionColor(analysisResult.recommendedAction).replace('bg-', 'bg-').replace('text-', 'text-white/90 ')} border-white/30`}>
                            {analysisResult.recommendedAction === 'approve' ? 'Aprobar' :
                             analysisResult.recommendedAction === 'review' ? 'Revisar' : 'Rechazar'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-white drop-shadow-sm">Puntuación de Riesgo:</span>
                          <Badge className={analysisResult.riskScore > 0.7 ? 'bg-red-600/30 text-red-300 border-red-400/50' : 
                                          analysisResult.riskScore > 0.3 ? 'bg-yellow-600/30 text-yellow-300 border-yellow-400/50' : 
                                          'bg-green-600/30 text-green-300 border-green-400/50'}>
                            {(analysisResult.riskScore * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-white drop-shadow-sm">Categorías:</span>
                          <div className="flex gap-1">
                            {analysisResult.categories.map((category, index) => (
                              <Badge key={index} className="border border-white/30 text-white bg-white/10 text-xs font-medium">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {analysisResult.flags.length > 0 && (
                      <div>
                        <h4 className="font-bold mb-2 text-white drop-shadow-md">Alertas Detectadas:</h4>
                        <div className="space-y-2">
                          {analysisResult.flags.map((flag, index) => (
                            <div key={index} className="p-3 border border-white/20 rounded-lg bg-white/10">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-white drop-shadow-sm">{flag.type}</span>
                                <Badge className={`${getSeverityColor(flag.severity).replace('bg-', 'bg-').replace('text-', 'text-white/90 ')} border-white/30`}>
                                  {flag.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-white/90 font-medium drop-shadow-sm">{flag.description}</p>
                              <p className="text-xs text-white/80 mt-1 drop-shadow-sm">
                                Confianza: {(flag.confidence * 100).toFixed(1)}%
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold mb-2 text-white drop-shadow-md">Explicación:</h4>
                      <p className="text-sm text-white/90 font-medium p-3 bg-white/10 rounded-lg border border-white/20 drop-shadow-sm">
                        {analysisResult.explanation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-white/10 border-white/20">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 text-white/60 mx-auto mb-4" />
                    <p className="text-white font-medium drop-shadow-md">No hay análisis disponible</p>
                    <p className="text-sm text-white/80 drop-shadow-sm">Ve a la pestaña "Probar Contenido" para analizar texto</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white font-bold drop-shadow-lg">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Probar Contenido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-bold mb-2 block text-white drop-shadow-md">
                    Contenido a analizar:
                  </label>
                  <Textarea
                    placeholder="Ingresa el contenido que deseas analizar..."
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                    rows={6}
                    className="w-full bg-white/10 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={analyzeContent}
                    disabled={isAnalyzing || !testContent.trim()}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
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
                    className="border border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                    onClick={() => setTestContent('')}
                  >
                    Limpiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white font-bold drop-shadow-lg">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Historial de Moderación
                </CardTitle>
              </CardHeader>
              <CardContent>
                {moderationHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-white/60 mx-auto mb-4" />
                    <p className="text-white font-medium drop-shadow-md">No hay historial disponible</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {moderationHistory.map((entry) => (
                      <div key={entry.id} className="p-4 border border-white/20 rounded-lg bg-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-bold mb-1 text-white drop-shadow-sm">
                              {entry.content.length > 100 
                                ? `${entry.content.substring(0, 100)}...` 
                                : entry.content}
                            </p>
                            <p className="text-xs text-white/80 font-medium drop-shadow-sm">
                              {new Date(entry.timestamp).toLocaleString()} • {entry.moderator}
                            </p>
                          </div>
                          <Badge className={`${getActionColor(entry.result.recommendedAction).replace('bg-', 'bg-').replace('text-', 'text-white/90 ')} border-white/30`}>
                            {entry.result.recommendedAction === 'approve' ? 'Aprobado' :
                             entry.result.recommendedAction === 'review' ? 'Revisión' : 'Rechazado'}
                          </Badge>
                        </div>
                        <div className="flex gap-2 text-xs text-white/90 font-medium drop-shadow-sm">
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