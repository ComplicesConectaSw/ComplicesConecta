import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, TrendingUp, Users, Heart, Eye, MessageCircle } from "lucide-react";

// Mock analytics data
const mockAnalytics = {
  overview: {
    profileViews: 1247,
    likes: 89,
    matches: 23,
    messages: 156,
    profileScore: 82
  },
  weekly: {
    views: [45, 67, 34, 89, 123, 78, 95],
    likes: [12, 18, 8, 23, 31, 19, 25],
    matches: [2, 4, 1, 6, 8, 3, 5]
  },
  demographics: {
    ageGroups: [
      { range: "18-24", percentage: 25 },
      { range: "25-29", percentage: 40 },
      { range: "30-34", percentage: 25 },
      { range: "35+", percentage: 10 }
    ],
    locations: [
      { city: "Ciudad de México", percentage: 35 },
      { city: "Guadalajara", percentage: 28 },
      { city: "Monterrey", percentage: 15 },
      { city: "Puebla", percentage: 12 },
      { city: "Otros", percentage: 10 }
    ]
  },
  engagement: {
    bestPhotos: [
      { id: 1, likes: 156, position: "Principal" },
      { id: 2, likes: 89, position: "Segunda" },
      { id: 3, likes: 67, position: "Tercera" }
    ],
    responseRate: 78,
    averageResponseTime: "2h 15m",
    bestTimeToSwipe: "20:00 - 22:00"
  }
};

export const ProfileAnalytics = () => {
  const maxWeeklyViews = Math.max(...mockAnalytics.weekly.views);
  const maxPhotoLikes = Math.max(...mockAnalytics.engagement.bestPhotos.map(p => p.likes));

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bueno";
    return "Mejorable";
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Vistas de Perfil</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{mockAnalytics.overview.profileViews}</p>
              </div>
              <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
              <span className="text-xs sm:text-sm text-green-600">+12% esta semana</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Likes Recibidos</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{mockAnalytics.overview.likes}</p>
              </div>
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
              <span className="text-xs sm:text-sm text-green-600">+8% esta semana</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Matches</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{mockAnalytics.overview.matches}</p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
              <span className="text-xs sm:text-sm text-green-600">+15% esta semana</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Mensajes</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{mockAnalytics.overview.messages}</p>
              </div>
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
              <span className="text-xs sm:text-sm text-green-600">+5% esta semana</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Score */}
      <Card className="shadow-soft">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Target className="h-4 w-4 sm:h-5 sm:w-5" />
            Puntuación del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{mockAnalytics.overview.profileScore}/100</p>
              <Badge variant="secondary" className={getScoreColor(mockAnalytics.overview.profileScore)}>
                {getScoreBadge(mockAnalytics.overview.profileScore)}
              </Badge>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-muted-foreground">vs. promedio</p>
              <p className="text-base sm:text-lg font-semibold text-green-600">+18 puntos</p>
            </div>
          </div>
          <Progress value={mockAnalytics.overview.profileScore} className="h-2 sm:h-3" />
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Tu perfil está en el top 15% de la plataforma
          </p>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-2xl p-1 sm:p-2">
          <TabsTrigger value="engagement" className="rounded-xl text-xs sm:text-sm">
            Engagement
          </TabsTrigger>
          <TabsTrigger value="demographics" className="rounded-xl text-xs sm:text-sm">
            Demografía
          </TabsTrigger>
          <TabsTrigger value="photos" className="rounded-xl text-xs sm:text-sm">
            Fotos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Tasa de Respuesta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Respuestas</span>
                      <span className="text-sm font-medium">{mockAnalytics.engagement.responseRate}%</span>
                    </div>
                    <Progress value={mockAnalytics.engagement.responseRate} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Tiempo promedio</p>
                      <p className="font-semibold">{mockAnalytics.engagement.averageResponseTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mejor horario</p>
                      <p className="font-semibold">{mockAnalytics.engagement.bestTimeToSwipe}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Actividad Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, index) => (
                    <div key={day} className="flex items-center space-x-3">
                      <span className="text-sm w-8">{day}</span>
                      <div className="flex-1">
                        <Progress 
                          value={maxWeeklyViews > 0 ? (mockAnalytics.weekly.views[index] / maxWeeklyViews) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {mockAnalytics.weekly.views[index]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Rango de Edad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.demographics.ageGroups.map((group) => (
                    <div key={group.range} className="flex items-center space-x-3">
                      <span className="text-sm w-16">{group.range}</span>
                      <div className="flex-1">
                        <Progress value={group.percentage} className="h-2" />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {group.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Ubicaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.demographics.locations.map((location) => (
                    <div key={location.city} className="flex items-center space-x-3">
                      <span className="text-sm w-20">{location.city}</span>
                      <div className="flex-1">
                        <Progress value={location.percentage} className="h-2" />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {location.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Rendimiento de Fotos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.engagement.bestPhotos.map((photo) => (
                  <div key={photo.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📸</span>
                      </div>
                      <div>
                        <p className="font-medium">Foto {photo.position}</p>
                        <p className="text-sm text-muted-foreground">{photo.likes} likes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Progress value={maxPhotoLikes > 0 ? (photo.likes / maxPhotoLikes) * 100 : 0} className="w-24 h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {maxPhotoLikes > 0 ? Math.round((photo.likes / maxPhotoLikes) * 100) : 0}% engagement
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};