import { useState } from "react";
import { Crown, Zap, Eye, Target, BarChart3, Globe, MessageCircle, Heart, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/shared/ui/Button";
import { Progress } from "@/components/ui/progress";
import { safeGetItem } from '@/utils/safeLocalStorage';

// Check if user is in demo mode
const isDemoMode = () => {
  return safeGetItem<string>('demo_authenticated', { validate: true, defaultValue: 'false' }) === 'true';
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
    requiredPlan: "basic"
  },
  {
    id: "incognito-mode",
    title: "Modo Incógnito",
    description: "Navega de forma privada",
    icon: Lock,
    requiredPlan: "silver"
  },
  {
    id: "analytics",
    title: "Análisis de Perfil",
    description: "Estadísticas detalladas de tu actividad",
    icon: BarChart3,
    requiredPlan: "silver"
  },
  {
    id: "global-mode",
    title: "Modo Global",
    description: "Conecta con personas de todo el mundo",
    icon: Globe,
    requiredPlan: "gold"
  },
  {
    id: "ai-assistant",
    title: "Asistente IA",
    description: "Sugerencias personalizadas",
    icon: MessageCircle,
    requiredPlan: "premium"
  },
  {
    id: "priority-support",
    title: "Soporte Prioritario",
    description: "Atención al cliente 24/7",
    icon: MessageCircle,
    requiredPlan: "premium"
  }
];

const _planHierarchy = ["free", "basic", "silver", "gold", "premium"];

export const PremiumFeatures = () => {
  const [currentPlan] = useState(mockUserSubscription.plan);

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Crown className="h-6 w-6 text-yellow-400" />
          ✨ Características Premium
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {premiumFeatures.map((feature) => {
            const isUnlocked = currentPlan === "premium" || currentPlan === "beta";
            
            return (
              <div 
                key={feature.id}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  isUnlocked 
                    ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30' 
                    : 'bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <feature.icon className={`h-6 w-6 ${isUnlocked ? 'text-green-400' : 'text-gray-400'}`} />
                  <Badge variant={isUnlocked ? "default" : "secondary"} className="text-xs">
                    {isUnlocked ? "Disponible" : "Premium"}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-white/80 mb-3">{feature.description}</p>
                
                {feature.freeLimit !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Uso mensual</span>
                      <span>{isUnlocked ? "Ilimitado" : `${feature.freeLimit} gratis`}</span>
                    </div>
                    {!isUnlocked && (
                      <Progress value={80} className="h-1" />
                    )}
                  </div>
                )}
                
                {!isUnlocked && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-3 border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-xs"
                    disabled
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Requiere Premium
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        
        {currentPlan === "beta" && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              <span className="font-semibold text-white text-sm sm:text-base">Acceso Beta Premium</span>
            </div>
            <p className="text-xs sm:text-sm text-white/80">
              Como usuario Beta, tienes acceso completo a todas las características Premium. 
              ¡Disfruta de la experiencia completa mientras ayudas a mejorar la plataforma!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};