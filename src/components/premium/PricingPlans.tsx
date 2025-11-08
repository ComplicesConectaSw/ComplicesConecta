import React, { useState } from "react";
import { Check, Crown, Zap, Star, Gift } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { logger } from '@/lib/logger';

const plans = [
  {
    id: "basic",
    name: "Básico",
    icon: Crown,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    features: [
      "10 super likes por día",
      "Ver quién te dio like",
      "Rewind ilimitado",
      "Boost mensual gratuito",
      "Filtros básicos"
    ]
  },
  {
    id: "silver",
    name: "Silver",
    icon: Star,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    popular: true,
    features: [
      "Todo de Básico",
      "Super likes ilimitados",
      "5 boosts por mes",
      "Filtros avanzados",
      "Modo incógnito",
      "Ver lecturas de mensajes"
    ]
  },
  {
    id: "gold",
    name: "Gold",
    icon: Gift,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    features: [
      "Todo de Silver",
      "Boosts ilimitados",
      "Priority likes",
      "Analytics de perfil",
      "Viajes ilimitados",
      "Selección de súper match"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    icon: Zap,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    features: [
      "Todo de Gold",
      "Asistente IA personal",
      "Sugerencias de conversación",
      "Analytics completos",
      "Concierge personal",
      "Acceso VIP a eventos"
    ]
  }
];

// Billing periods hidden during beta

export const PricingPlans = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("annually");

  const handleSubscribe = (planId: string) => {
    // Durante la Beta, redirigir a página de apoyo/donación
    logger.info(`Subscribing to plan: ${planId}, period: ${billingPeriod}`);
    // Lógica de redirección o checkout aquí
  };

  return (
    <div className="space-y-8">
      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <Label htmlFor="billing-toggle" className={billingPeriod === 'monthly' ? 'text-primary' : 'text-muted-foreground'}>
          Mensual
        </Label>
        <Switch
          id="billing-toggle"
          checked={billingPeriod === 'annually'}
          onCheckedChange={(checked) => setBillingPeriod(checked ? 'annually' : 'monthly')}
        />
        <Label htmlFor="billing-toggle" className={billingPeriod === 'annually' ? 'text-primary' : 'text-muted-foreground'}>
          Anual (Ahorra 20%)
        </Label>
      </div>

      {/* Beta Notice */}
      <div className="bg-hero-gradient rounded-2xl p-6 text-center text-white">
        <div className="flex items-center justify-center mb-4">
          <Gift className="h-8 w-8 mr-2" />
          <h2 className="text-2xl font-bold">Fase Beta - Acceso Gratuito</h2>
        </div>
        <p className="text-white/90 mb-4">
          Durante la Beta, todas las funciones están disponibles gratuitamente. 
          Apóyanos para acelerar el desarrollo y recibir recompensas especiales.
        </p>
        <Button 
          variant="default" 
          size="lg" 
          className="bg-white text-primary hover:bg-white/90"
          onClick={() => handleSubscribe("support")}
        >
          <Gift className="h-4 w-4 mr-2" />
          Apoyar el Proyecto
        </Button>
      </div>

      {/* Premium Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          
          return (
            <Card
              key={plan.id}
              className={`relative shadow-soft hover:shadow-glow transition-all duration-300 ${
                plan.popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Más Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${plan.bgColor} mb-4`}>
                  <Icon className={`h-6 w-6 ${plan.color}`} />
                </div>
                <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">
                    GRATIS
                  </div>
                  <div className="text-sm text-muted-foreground">
                    durante la Beta
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                  onClick={() => handleSubscribe(plan.id)}
                >
                  Seleccionar Plan
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Support CTA */}
      <div className="text-center space-y-4">
        <div className="bg-muted/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            ¿Te gusta lo que estamos construyendo?
          </h3>
          <p className="text-muted-foreground mb-4">
            Tu apoyo nos ayuda a acelerar el desarrollo y lanzar nuevas funciones más rápido.
            Los contribuyentes recibirán beneficios especiales al finalizar la Beta.
          </p>
          <Button 
            variant="love" 
            size="lg"
            onClick={() => handleSubscribe("donate")}
          >
            <Gift className="h-4 w-4 mr-2" />
            Apoyar ComplicesConecta
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>🎁 Los beta testers que nos apoyen recibirán subscripciones gratuitas</p>
          <p>🚀 Acceso prioritario a nuevas funciones • ⭐ Beneficios exclusivos</p>
        </div>
      </div>
    </div>
  );
};