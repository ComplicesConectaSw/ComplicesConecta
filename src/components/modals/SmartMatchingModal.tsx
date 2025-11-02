import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Heart, Users, TrendingUp, Zap, RefreshCw, 
  User, MapPin, Calendar, Star
} from 'lucide-react';

interface SmartMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

type MatchResult = {
  userId: string;
  userName: string;
  compatibilityScore: number;
  sharedInterests: string[];
  location: string;
  age: number;
  matchReasons: string[];
  profileImage?: string;
};

type UserTraits = {
  interests: string[];
  personality: string[];
  lifestyle: string[];
  preferences: {
    ageRange: [number, number];
    maxDistance: number;
    relationshipType: string;
  };
};

type MatchingAnalytics = {
  totalMatches: number;
  averageCompatibility: number;
  topInterests: string[];
  matchSuccessRate: number;
};

export default function SmartMatchingModal({ isOpen, onClose, userId }: SmartMatchingModalProps) {
  const [activeTab, setActiveTab] = useState('matches');
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [userTraits, setUserTraits] = useState<UserTraits>({
    interests: [],
    personality: [],
    lifestyle: [],
    preferences: {
      ageRange: [18, 35],
      maxDistance: 50,
      relationshipType: 'serious'
    }
  });
  const [analytics, setAnalytics] = useState<MatchingAnalytics>({
    totalMatches: 0,
    averageCompatibility: 0,
    topInterests: [],
    matchSuccessRate: 0
  });
  const [newInterest, setNewInterest] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      loadMatchingData();
    }
  }, [isOpen, userId]);

  const loadMatchingData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadMatches(),
        loadUserTraits(),
        loadAnalytics()
      ]);
    } catch (error) {
      console.error('Error loading matching data:', error);
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      // Mock data since service methods don't exist yet
      const mockMatches = generateMockMatches();
      setMatches(mockMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
      const fallbackMatches = generateMockMatches();
      setMatches(fallbackMatches);
    }
  };

  const loadUserTraits = async () => {
    try {
      // Mock data since service methods don't exist yet
      const mockTraits = generateMockTraits();
      setUserTraits(mockTraits);
    } catch (error) {
      console.error('Error loading user traits:', error);
      const fallbackTraits = generateMockTraits();
      setUserTraits(fallbackTraits);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Generate analytics based on current data
      const mockAnalytics: MatchingAnalytics = {
        totalMatches: matches.length || 15,
        averageCompatibility: matches.length > 0 
          ? matches.reduce((sum, match) => sum + match.compatibilityScore, 0) / matches.length 
          : 78.5,
        topInterests: ['Música', 'Viajes', 'Deportes', 'Lectura', 'Cocina'],
        matchSuccessRate: 85.2
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const generateMockData = () => {
    generateMockMatches();
    generateMockTraits();
    setAnalytics({
      totalMatches: 15,
      averageCompatibility: 78.5,
      topInterests: ['Música', 'Viajes', 'Deportes', 'Lectura', 'Cocina'],
      matchSuccessRate: 85.2
    });
  };

  const generateMockMatches = (): MatchResult[] => {
    return [
      {
        userId: '1',
        userName: 'Ana García',
        compatibilityScore: 92,
        sharedInterests: ['Música', 'Viajes', 'Fotografía'],
        location: 'Ciudad de México',
        age: 28,
        matchReasons: ['Intereses musicales similares', 'Ambos aman viajar', 'Personalidades compatibles']
      },
      {
        userId: '2',
        userName: 'Carlos López',
        compatibilityScore: 87,
        sharedInterests: ['Deportes', 'Cocina', 'Tecnología'],
        location: 'Guadalajara',
        age: 31,
        matchReasons: ['Pasión por el deporte', 'Interés en tecnología', 'Estilos de vida similares']
      }
    ];
  };

  const generateMockTraits = (): UserTraits => {
    return {
      interests: ['Música', 'Viajes', 'Fotografía', 'Lectura', 'Deportes'],
      personality: ['Extrovertido', 'Creativo', 'Aventurero', 'Empático'],
      lifestyle: ['Activo', 'Social', 'Profesional', 'Saludable'],
      preferences: {
        ageRange: [25, 35],
        maxDistance: 50,
        relationshipType: 'serious'
      }
    };
  };

  const refreshMatches = async () => {
    setIsLoading(true);
    try {
      await loadMatches();
      toast({
        title: "Matches actualizados",
        description: "Se han encontrado nuevas coincidencias",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los matches",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !userTraits.interests.includes(newInterest.trim())) {
      setUserTraits(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
      toast({
        title: "Interés agregado",
        description: `"${newInterest}" ha sido agregado a tus intereses`,
      });
    }
  };

  const removeInterest = (interest: string) => {
    setUserTraits(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 text-white border-purple-500/30 z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white font-bold text-xl drop-shadow-lg">
            <Heart className="w-5 h-5 text-purple-400" />
            Smart Matching IA
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="profile">Perfil IA</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white drop-shadow-lg">Tus Matches ({matches.length})</h3>
              <Button 
                onClick={refreshMatches}
                disabled={isLoading}
                className="border border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm h-8 px-3 text-sm font-medium"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-white font-medium drop-shadow-md">Buscando matches...</p>
              </div>
            ) : matches.length === 0 ? (
              <Card className="bg-white/10 border-white/20">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-white/60 mx-auto mb-4" />
                    <p className="text-white font-medium drop-shadow-md">No hay matches disponibles</p>
                    <p className="text-sm text-white/80 drop-shadow-sm">Actualiza tu perfil para mejorar las coincidencias</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {matches.map((match) => (
                  <Card key={match.userId} className="hover:shadow-md transition-shadow bg-white/10 border-white/20">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-purple-500/50">
                              {match.userName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-white drop-shadow-md">{match.userName}</h4>
                              <div className="flex items-center gap-1 text-sm text-white/90 font-medium drop-shadow-sm">
                                <MapPin className="w-3 h-3" />
                                {match.location}
                                <span>•</span>
                                <Calendar className="w-3 h-3" />
                                {match.age} años
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold drop-shadow-lg ${getCompatibilityColor(match.compatibilityScore).replace('text-', 'text-white ')}`}>
                              {match.compatibilityScore.toFixed(0)}%
                            </div>
                            <div className="text-xs text-white/80 font-medium drop-shadow-sm">Compatibilidad</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-bold mb-1 text-white drop-shadow-md">Intereses compartidos:</div>
                          <div className="flex flex-wrap gap-1">
                            {match.sharedInterests.map((interest: string, index: number) => (
                              <Badge key={index} className="border border-purple-300/50 text-white bg-purple-600/30 text-xs font-medium drop-shadow-sm">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-bold mb-1 text-white drop-shadow-md">Razones del match:</div>
                          <ul className="text-sm text-white/90 font-medium space-y-1 drop-shadow-sm">
                            {match.matchReasons.map((reason, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-purple-500/30">
                            <Heart className="w-4 h-4 mr-2" />
                            Me Gusta
                          </Button>
                          <Button className="border border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                            Ver Perfil
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Tu Perfil IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-bold mb-3 text-white drop-shadow-md">Intereses</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {userTraits.interests.map((interest, index) => (
                      <Badge 
                        key={index} 
                        className="border border-purple-300/50 text-white bg-purple-600/30 cursor-pointer hover:bg-purple-700/40 font-medium drop-shadow-sm"
                        onClick={() => removeInterest(interest)}
                      >
                        {interest} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Agregar nuevo interés..."
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/50"
                    />
                    <Button onClick={addInterest} disabled={!newInterest.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">
                      Agregar
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3 text-white drop-shadow-md">Personalidad</h4>
                  <div className="flex flex-wrap gap-2">
                    {userTraits.personality.map((trait, index) => (
                      <Badge key={index} className="border border-purple-300/50 text-white bg-purple-600/30 font-medium drop-shadow-sm">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3 text-white drop-shadow-md">Estilo de Vida</h4>
                  <div className="flex flex-wrap gap-2">
                    {userTraits.lifestyle.map((style, index) => (
                      <Badge key={index} className="border border-blue-300/50 text-white bg-blue-600/30 font-medium drop-shadow-sm">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3 text-white drop-shadow-md">Preferencias</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 border border-white/20 rounded-lg bg-white/5">
                      <div className="text-sm font-bold text-white drop-shadow-sm">Rango de Edad</div>
                      <div className="text-sm text-white/90 font-medium drop-shadow-sm">
                        {userTraits.preferences.ageRange[0]} - {userTraits.preferences.ageRange[1]} años
                      </div>
                    </div>
                    <div className="p-3 border border-white/20 rounded-lg bg-white/5">
                      <div className="text-sm font-bold text-white drop-shadow-sm">Distancia Máxima</div>
                      <div className="text-sm text-white/90 font-medium drop-shadow-sm">
                        {userTraits.preferences.maxDistance} km
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-300 drop-shadow-lg">{analytics.totalMatches}</div>
                      <div className="text-sm text-white/90 font-medium drop-shadow-sm">Total Matches</div>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-300 drop-shadow-lg">
                        {analytics.averageCompatibility.toFixed(1)}%
                      </div>
                      <div className="text-sm text-white/90 font-medium drop-shadow-sm">Compatibilidad Promedio</div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-300 drop-shadow-lg">
                        {analytics.matchSuccessRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-white/90 font-medium drop-shadow-sm">Tasa de Éxito</div>
                    </div>
                    <Zap className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-300 drop-shadow-lg">
                        {analytics.topInterests.length}
                      </div>
                      <div className="text-sm text-white/90 font-medium drop-shadow-sm">Intereses Top</div>
                    </div>
                    <Star className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white font-bold drop-shadow-lg">Intereses Más Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analytics.topInterests.map((interest, index) => (
                    <Badge key={index} className="border border-purple-300/50 text-white bg-purple-600/30 font-medium drop-shadow-sm">
                      #{index + 1} {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}