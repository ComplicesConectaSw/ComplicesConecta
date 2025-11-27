import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/shared/ui/Button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Heart, 
  MessageCircle, 
  Zap, 
  Calendar,
  Target,
  Award,
  Crown,
  Flame
} from "lucide-react";

// Mock gamification data
const mockAchievements = [
  {
    id: 1,
    title: "Primer Match",
    description: "Conseguir tu primer match",
    icon: Heart,
    unlocked: true,
    rarity: "common",
    points: 50
  },
  {
    id: 2,
    title: "Conversador",
    description: "Enviar 100 mensajes",
    icon: MessageCircle,
    unlocked: true,
    rarity: "common",
    points: 100
  },
  {
    id: 3,
    title: "Popular",
    description: "Recibir 50 likes",
    icon: Star,
    unlocked: false,
    progress: 35,
    target: 50,
    rarity: "rare",
    points: 200
  },
  {
    id: 4,
    title: "Racha de Fuego",
    description: "7 días consecutivos activo",
    icon: Flame,
    unlocked: true,
    rarity: "epic",
    points: 300
  },
  {
    id: 5,
    title: "Rey/Reina del Swipe",
    description: "Hacer 1000 swipes",
    icon: Crown,
    unlocked: false,
    progress: 650,
    target: 1000,
    rarity: "legendary",
    points: 500
  }
];

const mockStats = {
  level: 12,
  experience: 2450,
  nextLevelExp: 3000,
  totalPoints: 8750,
  streak: 5,
  longestStreak: 12
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common": return "text-gray-600 bg-gray-100";
    case "rare": return "text-blue-600 bg-blue-100";
    case "epic": return "text-purple-600 bg-purple-100";
    case "legendary": return "text-yellow-600 bg-yellow-100";
    default: return "text-gray-600 bg-gray-100";
  }
};

export const Gamification = () => {
  const [_selectedTab, _setSelectedTab] = useState('achievements');
  
  const experiencePercentage = (mockStats.experience / mockStats.nextLevelExp) * 100;

  return (
    <div className="space-y-6">
      {/* Level and Progress */}
      <Card className="shadow-soft bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-6 w-6 text-purple-400" />
                Nivel {mockStats.level}
              </CardTitle>
              <p className="text-sm text-white/80">
                {mockStats.experience} / {mockStats.nextLevelExp} XP
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">Puntos totales</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">{mockStats.totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white">
                <span>Progreso al Nivel {mockStats.level + 1}</span>
                <span>{Math.round(experiencePercentage)}%</span>
              </div>
              <Progress value={experiencePercentage} className="h-3 bg-white/20" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Flame className="h-6 w-6 text-orange-400 mx-auto mb-1" />
                <p className="text-sm text-white/80">Racha actual</p>
                <p className="text-lg font-semibold text-white">{mockStats.streak} días</p>
              </div>
              <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Target className="h-6 w-6 text-green-400 mx-auto mb-1" />
                <p className="text-sm text-white/80">Mejor racha</p>
                <p className="text-lg font-semibold text-white">{mockStats.longestStreak} días</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
          <Award className="h-5 w-5 text-purple-400" />
          Logros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockAchievements.map((achievement) => {
            const Icon = achievement.icon;
            const isUnlocked = achievement.unlocked;
            
            return (
              <Card
                key={achievement.id}
                className={`shadow-soft transition-all duration-300 bg-white/10 backdrop-blur-md border ${
                  isUnlocked 
                    ? "border-purple-400/30" 
                    : "opacity-70 border-dashed border-white/20"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        isUnlocked ? getRarityColor(achievement.rarity) : "bg-muted"
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          isUnlocked ? "" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <h4 className={`font-medium ${
                          isUnlocked ? "text-white" : "text-white/60"
                        }`}>
                          {achievement.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRarityColor(achievement.rarity)}`}
                        >
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                    {isUnlocked && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">
                          +{achievement.points}
                        </p>
                        <p className="text-xs text-muted-foreground">puntos</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-white/80 mb-3">
                    {achievement.description}
                  </p>
                  
                  {!isUnlocked && achievement.progress !== undefined && achievement.target && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-white/80">
                        <span>Progreso</span>
                        <span>{achievement.progress} / {achievement.target}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.target) * 100} 
                        className="h-2 bg-white/20" 
                      />
                    </div>
                  )}
                  
                  {isUnlocked && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      ✓ Desbloqueado
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Daily Challenges */}
      <Card className="shadow-soft bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-purple-400" />
            Desafíos Diarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5 text-red-400" />
                <div>
                  <p className="font-medium text-white">5 Likes Diarios</p>
                  <p className="text-sm text-white/80">Da like a 5 perfiles</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">3/5</p>
                <Badge variant="outline" className="text-xs border-purple-400/50 text-purple-300">+50 XP</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="font-medium text-white">Iniciar Conversación</p>
                  <p className="text-sm text-white/80">Envía un mensaje a un nuevo match</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
                  ✓ Completado
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="font-medium text-white">Actualizar Perfil</p>
                  <p className="text-sm text-white/80">Actualiza tu biografía o fotos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">0/1</p>
                <Badge variant="outline" className="text-xs border-purple-400/50 text-purple-300">+100 XP</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Preview */}
      <Card className="shadow-soft bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5 text-purple-400" />
            Tabla de Posiciones Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { rank: 1, name: "Ana M.", points: 1250, avatar: "A" },
              { rank: 2, name: "Carlos R.", points: 1180, avatar: "C" },
              { rank: 3, name: "María G.", points: 1050, avatar: "M", isCurrentUser: true },
              { rank: 4, name: "Diego L.", points: 980, avatar: "D" },
              { rank: 5, name: "Sofia K.", points: 920, avatar: "S" },
            ].map((user) => (
              <div 
                key={user.rank} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  user.isCurrentUser ? "bg-purple-500/20 border-purple-400/30" : "bg-white/10 backdrop-blur-sm border-white/20"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    user.rank === 1 ? "bg-yellow-400/30 text-yellow-200 border border-yellow-400/50" :
                    user.rank === 2 ? "bg-gray-400/30 text-gray-200 border border-gray-400/50" :
                    user.rank === 3 ? "bg-orange-400/30 text-orange-200 border border-orange-400/50" :
                    "bg-white/20 text-white border border-white/30"
                  }`}>
                    {user.rank}
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {user.avatar}
                  </div>
                  <div>
                    <p className={`font-medium ${user.isCurrentUser ? "text-purple-300" : "text-white"}`}>
                      {user.name} {user.isCurrentUser && "(Tú)"}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-white">{user.points.toLocaleString()} pts</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 border-purple-400/50 text-purple-300 hover:bg-purple-500/20 hover:text-white">
            Ver Tabla Completa
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};