/**
 * Modal interactivo para mostrar resultados de matching inteligente
 * Integra algoritmos de IA con UI intuitiva para usuarios
 */

import React, { useState, useEffect } from 'react';
import { Heart, Brain, MapPin, Star, Shield, Zap, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSmartMatching, type UserProfile, type MatchScore } from '@/lib/ai/smartMatching';
import { logger } from '@/lib/logger';

interface SmartMatchingModalProps {
  userProfile: UserProfile;
  candidates: UserProfile[];
  trigger?: React.ReactNode;
  onMatchSelect?: (match: MatchScore) => void;
}

export const SmartMatchingModal: React.FC<SmartMatchingModalProps> = ({
  userProfile,
  candidates,
  trigger,
  onMatchSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { findMatches } = useSmartMatching();

  // Ejecutar análisis cuando se abre el modal
  useEffect(() => {
    if (isOpen && candidates.length > 0) {
      analyzeMatches();
    }
  }, [isOpen, candidates]);

  const analyzeMatches = async () => {
    setIsAnalyzing(true);
    
    try {
      const context = {
        timeOfDay: getTimeOfDay(),
        dayOfWeek: getDayOfWeek(),
        season: getCurrentSeason(),
        userMood: 'exploratory' as const
      };

      const result = findMatches(userProfile, candidates, {
        limit: 10,
        context,
        minScore: 40
      });

      setMatches(result.matches);
      
      logger.info('🧠 Análisis de matching completado', {
        totalCandidates: candidates.length,
        matchesFound: result.matches.length,
        averageScore: result.stats.averageScore
      });
      
    } catch (error) {
      logger.error('❌ Error en análisis de matching', { error });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTimeOfDay = (): 'night' | 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const getDayOfWeek = (): 'weekend' | 'weekday' => {
    const day = new Date().getDay();
    return day === 0 || day === 6 ? 'weekend' : 'weekday';
  };

  const getCurrentSeason = (): 'spring' | 'summer' | 'fall' | 'winter' => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Heart className="h-4 w-4" />;
    if (score >= 60) return <Star className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  const handleMatchSelect = (match: MatchScore) => {
    setSelectedMatch(match);
    onMatchSelect?.(match);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Brain className="h-4 w-4" />
            Matching Inteligente
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Matching Inteligente con IA
          </DialogTitle>
        </DialogHeader>

        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-lg font-medium">Analizando compatibilidad...</p>
            <p className="text-sm text-muted-foreground">
              Evaluando {candidates.length} perfiles con algoritmos avanzados
            </p>
          </div>
        ) : (
          <Tabs defaultValue="matches" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="matches">Mejores Matches</TabsTrigger>
              <TabsTrigger value="analysis">Análisis Detallado</TabsTrigger>
            </TabsList>
            
            <TabsContent value="matches" className="space-y-4">
              {matches.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No se encontraron matches</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Intenta ajustar tus preferencias o vuelve más tarde cuando haya más perfiles disponibles.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {matches.map((match) => {
                    const candidate = candidates.find(c => c.id === match.userId);
                    if (!candidate) return null;

                    return (
                      <Card 
                        key={match.userId}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedMatch?.userId === match.userId ? 'ring-2 ring-purple-500' : ''
                        }`}
                        onClick={() => handleMatchSelect(match)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                                {candidate.name.charAt(0).toUpperCase()}
                              </div>
                              
                              <div>
                                <h3 className="font-semibold text-lg">{candidate.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {candidate.location.city}
                                  <span>•</span>
                                  <span>{candidate.age} años</span>
                                  <span>•</span>
                                  <Badge variant="secondary">{candidate.gender}</Badge>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(match.totalScore)}`}>
                                {getScoreIcon(match.totalScore)}
                                {match.totalScore}%
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <Shield className="h-3 w-3" />
                                {match.confidence}% confianza
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                              <div className="text-center">
                                <div className="font-medium">Personalidad</div>
                                <Progress value={match.breakdown.personality} className="h-1 mt-1" />
                                <div className="text-muted-foreground">{match.breakdown.personality}%</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">Intereses</div>
                                <Progress value={match.breakdown.interests} className="h-1 mt-1" />
                                <div className="text-muted-foreground">{match.breakdown.interests}%</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">Ubicación</div>
                                <Progress value={match.breakdown.location} className="h-1 mt-1" />
                                <div className="text-muted-foreground">{match.breakdown.location}%</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">Actividad</div>
                                <Progress value={match.breakdown.activity} className="h-1 mt-1" />
                                <div className="text-muted-foreground">{match.breakdown.activity}%</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">Verificación</div>
                                <Progress value={match.breakdown.verification} className="h-1 mt-1" />
                                <div className="text-muted-foreground">{match.breakdown.verification}%</div>
                              </div>
                            </div>

                            {match.reasons.length > 0 && (
                              <div className="mt-3">
                                <div className="text-sm font-medium text-green-700 mb-1">
                                  ✅ Razones de compatibilidad:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {match.reasons.map((reason, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {reason}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {match.redFlags.length > 0 && (
                              <div className="mt-2">
                                <div className="text-sm font-medium text-orange-700 mb-1">
                                  ⚠️ Consideraciones:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {match.redFlags.map((flag, index) => (
                                    <Badge key={index} variant="destructive" className="text-xs">
                                      {flag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-4">
              {selectedMatch ? (
                <MatchAnalysisDetail 
                  match={selectedMatch} 
                  candidate={candidates.find(c => c.id === selectedMatch.userId)!}
                  userProfile={userProfile}
                />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Selecciona un match</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Haz clic en cualquier perfil de la pestaña "Mejores Matches" para ver el análisis detallado.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Componente para análisis detallado de un match específico
const MatchAnalysisDetail: React.FC<{
  match: MatchScore;
  candidate: UserProfile;
  userProfile: UserProfile;
}> = ({ match, candidate, userProfile }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Análisis Detallado de Compatibilidad
          </CardTitle>
          <CardDescription>
            Análisis profundo de la compatibilidad con {candidate.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score general */}
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {match.totalScore}%
            </div>
            <div className="text-lg text-muted-foreground">
              Compatibilidad General
            </div>
            <Progress value={match.totalScore} className="w-full mt-2" />
          </div>

          {/* Breakdown detallado */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">🧠 Personalidad ({match.breakdown.personality}%)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Apertura: {candidate.personality.openness}%</div>
                  <div>Tu apertura: {userProfile.personality.openness}%</div>
                  <div>Aventura: {candidate.personality.adventurousness}%</div>
                  <div>Tu aventura: {userProfile.personality.adventurousness}%</div>
                  <div>Discreción: {candidate.personality.discretion}%</div>
                  <div>Tu discreción: {userProfile.personality.discretion}%</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">💝 Intereses ({match.breakdown.interests}%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-xs">
                  <div>Intereses en común:</div>
                  <div className="flex flex-wrap gap-1">
                    {candidate.interests
                      .filter(interest => userProfile.interests.includes(interest))
                      .map(interest => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">📍 Ubicación ({match.breakdown.location}%)</CardTitle>
              </CardHeader>
              <CardContent className="text-xs">
                <div>Ciudad: {candidate.location.city}</div>
                <div>Tu ciudad: {userProfile.location.city}</div>
                <div className="text-muted-foreground mt-1">
                  {candidate.location.city === userProfile.location.city ? 
                    'Misma ciudad - Excelente para encuentros' : 
                    'Ciudades diferentes - Considera la distancia'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">⚡ Actividad ({match.breakdown.activity}%)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                <div>Tasa de respuesta: {candidate.activity.responseRate}%</div>
                <div>Perfil completo: {candidate.activity.profileCompleteness}%</div>
                <div>Fotos: {candidate.activity.photosCount}</div>
                <div className="text-muted-foreground">
                  Última actividad: {new Date(candidate.activity.lastActive).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recomendaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">💡 Recomendaciones de IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {match.totalScore >= 80 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-green-800">🎯 Match Excepcional</div>
                  <div className="text-sm text-green-700">
                    Alta compatibilidad detectada. Considera enviar una invitación personalizada mencionando intereses compartidos.
                  </div>
                </div>
              )}
              
              {match.totalScore >= 60 && match.totalScore < 80 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-800">✨ Buen Potencial</div>
                  <div className="text-sm text-blue-700">
                    Compatibilidad sólida. Inicia conversación sobre {candidate.interests.slice(0, 2).join(' y ')}.
                  </div>
                </div>
              )}

              {match.redFlags.length > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="font-medium text-orange-800">⚠️ Consideraciones</div>
                  <div className="text-sm text-orange-700">
                    Ten en cuenta: {match.redFlags.join(', ')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartMatchingModal;

