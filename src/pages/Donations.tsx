import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Star, Crown, Zap, Gift, Users, Shield } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/Card";
import HeaderNav from "@/components/HeaderNav";

const Donations = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const donationTiers = [
    {
      id: 1,
      name: "Apoyo Bsico",
      amount: 50,
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      benefits: [
        "Badge especial de 'Colaborador'",
        "Acceso anticipado a nuevas funciones",
        "Soporte prioritario",
        "Reconocimiento en la comunidad"
      ]
    },
    {
      id: 2,
      name: "Apoyo Premium",
      amount: 100,
      icon: Star,
      color: "from-purple-500 to-indigo-500",
      benefits: [
        "Todos los beneficios del Apoyo Bsico",
        "100 tokens CMPX de regalo",
        "Perfil destacado por 30 das",
        "Acceso a eventos exclusivos",
        "Chat directo con desarrolladores"
      ]
    },
    {
      id: 3,
      name: "Apoyo VIP",
      amount: 250,
      icon: Crown,
      color: "from-yellow-500 to-orange-500",
      benefits: [
        "Todos los beneficios anteriores",
        "300 tokens CMPX de regalo",
        "Badge VIP permanente",
        "Perfil destacado por 90 das",
        "Participacin en decisiones de desarrollo",
        "Acceso beta a todas las funciones"
      ]
    },
    {
      id: 4,
      name: "Apoyo Fundador",
      amount: 500,
      icon: Zap,
      color: "from-emerald-500 to-teal-500",
      benefits: [
        "Todos los beneficios anteriores",
        "1000 tokens CMPX de regalo",
        "Badge de 'Fundador' exclusivo",
        "Perfil destacado permanente",
        "Mencin en crditos de la app",
        "Sesin personalizada con el equipo",
        "Influencia directa en roadmap"
      ]
    }
  ];

  const customAmounts = [25, 75, 150, 300];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Apoya a ComplicesConecta
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Tu donacin nos ayuda a mantener la plataforma gratuita y desarrollar nuevas funciones 
            para la comunidad swinger ms grande de Mxico.
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-pink-300" />
              <div className="text-2xl font-bold">50,000+</div>
              <div className="text-sm text-white/70">Usuarios activos</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-3 text-red-300" />
              <div className="text-2xl font-bold">25,000+</div>
              <div className="text-sm text-white/70">Conexiones realizadas</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-green-300" />
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-white/70">Seguro y privado</div>
            </CardContent>
          </Card>
        </div>

        {/* Donation Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {donationTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card 
                key={tier.id}
                className={`relative overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                  selectedAmount === tier.amount 
                    ? 'border-white scale-105 shadow-2xl' 
                    : 'border-white/20 hover:border-white/40'
                }`}
                onClick={() => setSelectedAmount(tier.amount)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-90`} />
                <CardHeader className="relative text-white text-center">
                  <Icon className="h-8 w-8 mx-auto mb-2" />
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  <CardDescription className="text-white/80">
                    ${tier.amount} MXN
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative text-white">
                  <ul className="space-y-2 text-sm">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Custom Amount */}
        <Card className="bg-white/10 border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-center">Cantidad Personalizada</CardTitle>
            <CardDescription className="text-white/70 text-center">
              Elige tu propia cantidad de donacin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {customAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className={`${
                    selectedAmount === amount 
                      ? 'bg-white text-purple-600' 
                      : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedAmount(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Cantidad personalizada"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                onChange={(e) => setSelectedAmount(Number(e.target.value))}
              />
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                Seleccionar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="bg-white/10 border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-center">Mtodos de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center text-white">
                <div className="w-12 h-8 bg-white/20 rounded mb-2 mx-auto flex items-center justify-center">
                  <span className="text-xs font-bold">VISA</span>
                </div>
                <span className="text-sm">Tarjeta de Crdito</span>
              </div>
              <div className="text-center text-white">
                <div className="w-12 h-8 bg-white/20 rounded mb-2 mx-auto flex items-center justify-center">
                  <span className="text-xs font-bold">MC</span>
                </div>
                <span className="text-sm">MasterCard</span>
              </div>
              <div className="text-center text-white">
                <div className="w-12 h-8 bg-white/20 rounded mb-2 mx-auto flex items-center justify-center">
                  <span className="text-xs font-bold">PP</span>
                </div>
                <span className="text-sm">PayPal</span>
              </div>
              <div className="text-center text-white">
                <div className="w-12 h-8 bg-white/20 rounded mb-2 mx-auto flex items-center justify-center">
                  <span className="text-xs font-bold">OXXO</span>
                </div>
                <span className="text-sm">OXXO Pay</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-white/90 px-8 py-3 text-lg font-semibold"
            disabled={!selectedAmount}
          >
            {selectedAmount ? `Donar $${selectedAmount} MXN` : 'Selecciona una cantidad'}
          </Button>
          <p className="text-white/60 text-sm mt-4">
            Procesamiento seguro  Cancelacin en cualquier momento  Recibo por email
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Preguntas Frecuentes sobre Donaciones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Para qu se usan las donaciones?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Las donaciones se utilizan para mantener los servidores, desarrollar nuevas funciones, 
                  mejorar la seguridad y brindar soporte a la comunidad.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Las donaciones son recurrentes?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  No, todas las donaciones son nicas. Puedes donar cuando quieras y la cantidad que desees.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Puedo cancelar mi donacin?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Las donaciones son finales, pero los beneficios se aplican inmediatamente a tu cuenta.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Es seguro donar?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  S, utilizamos procesadores de pago seguros y certificados. Tu informacin est protegida.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;
