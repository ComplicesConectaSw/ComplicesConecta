import { useState } from "react";
import { Crown, Zap, Eye, Target, BarChart3, Globe, MessageCircle, Heart, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Check if user is in demo mode
const isDemoMode = () => {
  return localStorage.getItem('demo_authenticated') === 'true';
};

// Beta user data - all features available
const mockUserSubscription = {
  plan: isDemoMode() ? "premium" : "beta", // Premium features for demo users
  trialDaysLeft: 0,
  isActive: true
};

const premiumFeatures = [
  {
    id: "super-likes",
    title: "Super Likes",
    description: "Destaca entre la multitud",
    icon: Heart,
    requiredPlan: "basic",
    freeLimit: 1,
    basicLimit: 10,
    silverLimit: null, // unlimited
    goldLimit: null,
    premiumLimit: null
  },
  {
    id: "who-liked-you",
    title: "Ver Quién te Gustó",
    description: "Descubre tus admiradores",
    icon: Eye,
    requiredPlan: "basic"
  },
  {
    id: "boosts",
    title: "Boost de Perfil",
    description: "Aparece en los primeros lugares",
    icon: Zap,
    requiredPlan: "basic",
    freeLimit: 0,
    basicLimit: 1,
    silverLimit: 5,
    goldLimit: null,
    premiumLimit: null
  },
  {
    id: "advanced-filters",
    title: "Filtros Avanzados",
    description: "Encuentra exactamente lo que buscas",
    icon: Target,
    requiredPlan: "silver"
  },
  {
    id: "incognito-mode",
    title: "Modo Incógnito",
    description: "Navega de forma privada",
    icon: Lock,
    requiredPlan: "silver"
  },
  {
    id: "travel-mode",
    title: "Modo Viaje",
    description: "Conecta en cualquier ciudad",
    icon: Globe,
    requiredPlan: "gold"
  },
  {
    id: "profile-analytics",
    title: "Analytics de Perfil",
    description: "Estadísticas detalladas de tu perfil",
    icon: BarChart3,
    requiredPlan: "gold"
  },
  {
    id: "ai-assistant",
    title: "Asistente IA",
    description: "Sugerencias personalizadas",
    icon: MessageCircle,
    requiredPlan: "premium"
  }
];

const planHierarchy = ["free", "basic", "silver", "gold", "premium"];

export const PremiumFeatures = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  
  const userPlan = mockUserSubscription.plan;
  const userPlanIndex = planHierarchy.indexOf(userPlan);
  
  const hasAccess = (requiredPlan: string) => {
    const requiredIndex = planHierarchy.indexOf(requiredPlan);
    return userPlanIndex >= requiredIndex;
  };

  const getUsageInfo = (feature: typeof premiumFeatures[0]) => {
    if (!feature.freeLimit) return null;
    
    const limit = feature[`${userPlan}Limit` as keyof typeof feature] || 0;
    
    // Mock usage data
    const used = Math.floor(Math.random() * (limit as number || 10));
    
    return {
      used,
      limit,
      percentage: limit ? (used / (limit as number)) * 100 : 0
    };
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="capitalize">Plan {userPlan}</CardTitle>
                {mockUserSubscription.plan === "trial" && (
                  <p className="text-sm text-muted-foreground">
                    {mockUserSubscription.trialDaysLeft} días restantes de prueba
                  </p>
                )}
              </div>
            </div>
            <Badge variant={userPlan === "free" ? "secondary" : "default"}>
              {userPlan === "free" ? "Gratuito" : "Premium"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Premium Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {premiumFeatures.map((feature) => {
          const Icon = feature.icon;
          const accessible = hasAccess(feature.requiredPlan);
          const usageInfo = getUsageInfo(feature);
          
          return (
            <Card
              key={feature.id}
              className={`shadow-soft transition-all duration-300 cursor-pointer ${
                accessible 
                  ? "hover:shadow-glow border-green-200 bg-green-50/30" 
                  : "opacity-60 border-amber-200 bg-amber-50/30"
              } ${activeFeature === feature.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${accessible ? "bg-green-100" : "bg-amber-100"}`}>
                      <Icon className={`h-5 w-5 ${accessible ? "text-green-600" : "text-amber-600"}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Requiere: {feature.requiredPlan}
                      </p>
                    </div>
                  </div>
                  {accessible ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      Bloqueado
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>

                {usageInfo && accessible && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Uso actual</span>
                      <span>
                        {usageInfo.used}/{usageInfo.limit ? String(usageInfo.limit) : "∞"}
                      </span>
                    </div>
                    {usageInfo.limit && (
                      <Progress value={usageInfo.percentage} className="h-2" />
                    )}
                  </div>
                )}

                {!accessible && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to pricing
                    }}
                  >
                    Desbloquear
                  </Button>
                )}
              </CardContent>

              {/* Expanded Details */}
              {activeFeature === feature.id && (
                <CardContent className="pt-0 border-t">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Límites por plan:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <div>Gratuito: {feature.freeLimit || "No disponible"}</div>
                        <div>Básico: {feature.basicLimit || "Ilimitado"}</div>
                      </div>
                      <div className="space-y-1">
                        <div>Silver: {feature.silverLimit || "Ilimitado"}</div>
                        <div>Gold+: Ilimitado</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Upgrade Prompt */}
      {userPlan === "free" || userPlan === "basic" && (
        <Card className="shadow-soft bg-hero-gradient text-white">
          <CardContent className="p-6 text-center">
            <Crown className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">
              Desbloquea Todo tu Potencial
            </h3>
            <p className="text-white/90 mb-4">
              Upgrade a un plan superior y accede a todas las funciones premium
            </p>
            <Button 
              variant="hero" 
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              Ver Planes Premium
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};