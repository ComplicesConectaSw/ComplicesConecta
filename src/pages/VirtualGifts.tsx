import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Heart, Star, Crown, Sparkles, ArrowLeft, Send, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import HeaderNav from '@/components/HeaderNav';

const VirtualGifts = () => {
  const navigate = useNavigate();
  const [_selectedGift, _setSelectedGift] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const giftCategories = [
    { id: 'romantic', label: 'Románticos', icon: Heart },
    { id: 'luxury', label: 'Lujo', icon: Crown },
    { id: 'fun', label: 'Divertidos', icon: Sparkles },
    { id: 'premium', label: 'Premium', icon: Star }
  ];

  const virtualGifts = [
    {
      id: 1,
      name: "Corazón de Cristal",
      description: "Un corazón de cristal brillante que simboliza amor puro y conexión profunda",
      price: 50,
      category: "romantic",
      icon: Heart,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-400/30",
      rarity: "common",
      effect: "Animación de corazones flotantes"
    },
    {
      id: 2,
      name: "Corona Real",
      description: "Una corona dorada que representa elegancia y realeza en la conexión",
      price: 150,
      category: "luxury",
      icon: Crown,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-400/30",
      rarity: "rare",
      effect: "Efecto de partículas doradas"
    },
    {
      id: 3,
      name: "Estrella Brillante",
      description: "Una estrella que brilla con luz propia, iluminando la conexión especial",
      price: 100,
      category: "premium",
      icon: Star,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-400/30",
      rarity: "uncommon",
      effect: "Lluvia de estrellas"
    },
    {
      id: 4,
      name: "Chispas Mágicas",
      description: "Chispas mágicas que crean un ambiente de fantasía y diversión",
      price: 75,
      category: "fun",
      icon: Sparkles,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-400/30",
      rarity: "common",
      effect: "Explosión de chispas coloridas"
    },
    {
      id: 5,
      name: "Rosa de Oro",
      description: "Una rosa dorada eterna que representa amor duradero y pasión",
      price: 200,
      category: "luxury",
      icon: Heart,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-400/30",
      rarity: "legendary",
      effect: "Pétalos de oro cayendo"
    },
    {
      id: 6,
      name: "Diamante Azul",
      description: "Un diamante azul que simboliza pureza y conexión espiritual",
      price: 300,
      category: "premium",
      icon: Star,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      borderColor: "border-cyan-400/30",
      rarity: "legendary",
      effect: "Reflejos de diamante"
    }
  ];

  const recentGifts = [
    {
      id: 1,
      from: "María Elena",
      to: "Carlos & Ana",
      gift: "Corazón de Cristal",
      date: "Hace 2 horas",
      message: "¡Gracias por la conexión increíble!"
    },
    {
      id: 2,
      from: "Sofía",
      to: "Roberto",
      gift: "Estrella Brillante",
      date: "Hace 5 horas",
      message: "Tu luz ilumina mi día"
    },
    {
      id: 3,
      from: "Anabella & Julio",
      to: "Carmen",
      gift: "Corona Real",
      date: "Ayer",
      message: "Eres una reina en nuestros corazones"
    }
  ];

  const filteredGifts = virtualGifts.filter(gift => {
    const matchesSearch = gift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gift.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/80';
      case 'uncommon': return 'bg-green-500/80';
      case 'rare': return 'bg-blue-500/80';
      case 'legendary': return 'bg-purple-500/80';
      default: return 'bg-gray-500/80';
    }
  };

  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'common': return 'Común';
      case 'uncommon': return 'Poco Común';
      case 'rare': return 'Raro';
      case 'legendary': return 'Legendario';
      default: return 'Común';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20"></div>
      
      <div className="relative z-10">
        <HeaderNav />
        
        <main className="container mx-auto px-4 py-8 pt-24">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              onClick={() => navigate('/tokens')}
              className="bg-card/80 backdrop-blur-sm border border-primary/20 hover:bg-primary/10 transition-all duration-300 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Tokens
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Gift className="h-12 w-12 text-pink-400 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Regalos Virtuales
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Expresa tus sentimientos con regalos virtuales únicos y especiales para tus conexiones
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="max-w-md mx-auto">
              <Input
                placeholder="Buscar regalos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card/80 backdrop-blur-sm border border-primary/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {giftCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Gifts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredGifts.map((gift) => {
              const Icon = gift.icon;
              return (
                <Card 
                  key={gift.id} 
                  className={`bg-card/80 backdrop-blur-sm border ${gift.borderColor} hover:scale-105 transition-transform cursor-pointer`}
                  onClick={() => setSelectedGift(gift)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${gift.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`h-8 w-8 ${gift.color}`} />
                    </div>
                    
                    <h3 className="text-white font-semibold mb-2">{gift.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{gift.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={getRarityColor(gift.rarity)}>
                        {getRarityLabel(gift.rarity)}
                      </Badge>
                      <div className="text-white font-bold">
                        {gift.price} CMPX
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-4">
                      Efecto: {gift.effect}
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Lógica para enviar regalo
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Regalo
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Gifts */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Regalos Recientes
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {recentGifts.map((gift) => (
                <Card key={gift.id} className="bg-card/80 backdrop-blur-sm border border-primary/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Gift className="h-5 w-5 text-pink-400" />
                        <span className="text-white font-medium">{gift.gift}</span>
                      </div>
                      <Badge className="bg-gray-600/80 text-white text-xs">
                        {gift.date}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-muted-foreground">
                        <span className="text-white">De:</span> {gift.from}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="text-white">Para:</span> {gift.to}
                      </p>
                    </div>
                    
                    <p className="text-muted-foreground text-sm italic">
                      "{gift.message}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-16">
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center">
                  ¿Cómo Funcionan los Regalos Virtuales?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Selecciona un Regalo</h3>
                    <p className="text-sm text-muted-foreground">
                      Elige entre nuestra colección de regalos virtuales únicos
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Personaliza tu Mensaje</h3>
                    <p className="text-sm text-muted-foreground">
                      Agrega un mensaje personal para hacer el regalo más especial
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Envía y Sorprende</h3>
                    <p className="text-sm text-muted-foreground">
                      El regalo se entrega instantáneamente con efectos especiales
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <Card className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 backdrop-blur-sm border border-pink-400/30">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  ¿Necesitas más tokens CMPX?
                </h2>
                <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                  Compra tokens CMPX para enviar regalos virtuales y expresar tus sentimientos
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/tokens')}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 px-8 py-3"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Comprar Tokens
                  </Button>
                  <Button 
                    onClick={() => navigate('/support')}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-3"
                  >
                    Ayuda
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
};

export default VirtualGifts;
