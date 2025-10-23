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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
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
              <h3 className="text-lg font-semibold">Tus Matches ({matches.length})</h3>
              <Button 
                onClick={refreshMatches}
                disabled={isLoading}
                className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-8 px-3 text-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Buscando matches...</p>
              </div>
            ) : matches.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay matches disponibles</p>
                    <p className="text-sm text-gray-500">Actualiza tu perfil para mejorar las coincidencias</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {matches.map((match) => (
                  <Card key={match.userId} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {match.userName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold">{match.userName}</h4>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin className="w-3 h-3" />
                                {match.location}
                                <span>•</span>
                                <Calendar className="w-3 h-3" />
                                {match.age} años
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getCompatibilityColor(match.compatibilityScore)}`}>
                              {match.compatibilityScore.toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500">Compatibilidad</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-1">Intereses compartidos:</div>
                          <div className="flex flex-wrap gap-1">
                            {match.sharedInterests.map((interest: string, index: number) => (
                              <Badge key={index} className="border border-pink-200 text-pink-700 bg-pink-50 text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-1">Razones del match:</div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {match.matchReasons.map((reason, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button className="flex-1 bg-pink-600 hover:bg-pink-700 text-white">
                            <Heart className="w-4 h-4 mr-2" />
                            Me Gusta
                          </Button>
                          <Button className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
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
                  <h4 className="font-medium mb-3">Intereses</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {userTraits.interests.map((interest, index) => (
                      <Badge 
                        key={index} 
                        className="border border-blue-200 text-blue-700 bg-blue-50 cursor-pointer hover:bg-blue-100"
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
                      className="flex-1"
                    />
                    <Button onClick={addInterest} disabled={!newInterest.trim()}>
                      Agregar
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Personalidad</h4>
                  <div className="flex flex-wrap gap-2">
                    {userTraits.personality.map((trait, index) => (
                      <Badge key={index} className="border border-purple-200 text-purple-700 bg-purple-50">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Estilo de Vida</h4>
                  <div className="flex flex-wrap gap-2">
                    {userTraits.lifestyle.map((style, index) => (
                      <Badge key={index} className="border border-green-200 text-green-700 bg-green-50">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Preferencias</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm font-medium">Rango de Edad</div>
                      <div className="text-sm text-gray-600">
                        {userTraits.preferences.ageRange[0]} - {userTraits.preferences.ageRange[1]} años
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm font-medium">Distancia Máxima</div>
                      <div className="text-sm text-gray-600">
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
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{analytics.totalMatches}</div>
                      <div className="text-sm text-gray-600">Total Matches</div>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.averageCompatibility.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Compatibilidad Promedio</div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {analytics.matchSuccessRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Tasa de Éxito</div>
                    </div>
                    <Zap className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-pink-600">
                        {analytics.topInterests.length}
                      </div>
                      <div className="text-sm text-gray-600">Intereses Top</div>
                    </div>
                    <Star className="w-8 h-8 text-pink-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Intereses Más Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analytics.topInterests.map((interest, index) => (
                    <Badge key={index} className="border border-gray-200 bg-gray-50 text-gray-700">
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