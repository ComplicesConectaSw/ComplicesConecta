import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, Heart, Crown, Sparkles, ArrowLeft, Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/shared/ui/Input';
import HeaderNav from '@/components/HeaderNav';

const Marketplace = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Todos', icon: ShoppingBag },
    { id: 'premium', label: 'Premium', icon: Crown },
    { id: 'romantic', label: 'Romntico', icon: Heart },
    { id: 'fun', label: 'Divertido', icon: Sparkles },
    { id: 'luxury', label: 'Lujo', icon: Star }
  ];

  const products = [
    {
      id: 1,
      name: "Paquete Premium Mensual",
      description: "Acceso completo a todas las funciones premium por 30 das. Incluye matches ilimitados, mensajes prioritarios y eventos VIP.",
      price: 299,
      currency: "CMPX",
      category: "premium",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&crop=center",
      rating: 4.9,
      reviews: 1247,
      badge: "Ms Popular",
      features: ["Matches ilimitados", "Mensajes prioritarios", "Eventos VIP", "Perfil destacado"]
    },
    {
      id: 2,
      name: "Super Likes Pack",
      description: "Paquete de 10 Super Likes para destacar tu inters y aumentar tus posibilidades de match.",
      price: 150,
      currency: "CMPX",
      category: "romantic",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&crop=center",
      rating: 4.8,
      reviews: 892,
      badge: "Recomendado",
      features: ["10 Super Likes", "Notificacin especial", "Mayor visibilidad"]
    },
    {
      id: 3,
      name: "Boost de Perfil",
      description: "Haz que tu perfil aparezca en las primeras posiciones durante 24 horas para maximizar tu visibilidad.",
      price: 99,
      currency: "CMPX",
      category: "premium",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center",
      rating: 4.7,
      reviews: 654,
      badge: "Nuevo",
      features: ["24 horas de boost", "10x ms visibilidad", "Posicin destacada"]
    },
    {
      id: 4,
      name: "Regalo Virtual Especial",
      description: "Regalo virtual exclusivo con efectos especiales para sorprender a tus conexiones.",
      price: 75,
      currency: "CMPX",
      category: "romantic",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&crop=center",
      rating: 4.9,
      reviews: 423,
      badge: "Limitado",
      features: ["Efectos especiales", "Mensaje personalizado", "Animacin nica"]
    },
    {
      id: 5,
      name: "Acceso VIP a Eventos",
      description: "Acceso prioritario a eventos VIP exclusivos con descuentos especiales y beneficios nicos.",
      price: 199,
      currency: "CMPX",
      category: "luxury",
      image: "https://images.unsplash.com/photo-1519167758481-83f142bb8cba?w=400&h=300&fit=crop&crop=center",
      rating: 5.0,
      reviews: 156,
      badge: "Exclusivo",
      features: ["Acceso prioritario", "Descuentos especiales", "Beneficios nicos"]
    },
    {
      id: 6,
      name: "Paquete de Tokens CMPX",
      description: "Compra tokens CMPX para usar en todas las funciones premium de la plataforma.",
      price: 500,
      currency: "CMPX",
      category: "premium",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop&crop=center",
      rating: 4.8,
      reviews: 2341,
      badge: "Mejor Valor",
      features: ["500 tokens CMPX", "Uso flexible", "Sin expiracin"]
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getBadgeColor = (badge: any) => {
    switch (badge) {
      case 'Ms Popular': return 'bg-green-500/80';
      case 'Recomendado': return 'bg-blue-500/80';
      case 'Nuevo': return 'bg-purple-500/80';
      case 'Limitado': return 'bg-red-500/80';
      case 'Exclusivo': return 'bg-yellow-500/80';
      case 'Mejor Valor': return 'bg-pink-500/80';
      default: return 'bg-gray-500/80';
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
              <ShoppingBag className="h-12 w-12 text-pink-400 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Marketplace Premium
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Descubre productos y servicios premium diseados para mejorar tu experiencia en ComplicesConecta
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card/80 backdrop-blur-sm border border-primary/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      className={
                        selectedCategory === category.id
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                          : "border-white/30 text-white hover:bg-white/10"
                      }
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-card/80 backdrop-blur-sm border border-primary/10 overflow-hidden hover:scale-105 transition-transform">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={getBadgeColor(product.badge)}>
                      {product.badge}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                      <span className="text-white text-xs font-medium">{product.rating}</span>
                    </div>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">{product.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-white">
                      {product.price} {product.currency}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {product.reviews} reseas
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-white font-medium text-sm">Caractersticas:</h4>
                    <ul className="space-y-1">
                      {product.features.map((feature, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center">
                          <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                    onClick={() => {
                      // Lgica para comprar producto
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Comprar Ahora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Featured Products */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Productos Destacados
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-600/20 backdrop-blur-sm border border-yellow-400/30">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Crown className="h-8 w-8 text-yellow-400 mr-3" />
                    <h3 className="text-xl font-bold text-white">Paquete VIP Completo</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Acceso completo a todas las funciones premium, eventos VIP, y beneficios exclusivos por 3 meses.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-white">799 CMPX</div>
                    <Badge className="bg-green-500/80 text-white">Ahorra 20%</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 backdrop-blur-sm border border-pink-400/30">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Heart className="h-8 w-8 text-pink-400 mr-3" />
                    <h3 className="text-xl font-bold text-white">Pack Romntico</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Super Likes, regalos virtuales, y boost de perfil para maximizar tus conexiones romnticas.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-white">299 CMPX</div>
                    <Badge className="bg-blue-500/80 text-white">Combo Especial</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-16">
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center">
                  Cmo Comprar en el Marketplace?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Selecciona tu Producto</h3>
                    <p className="text-sm text-muted-foreground">
                      Explora nuestra tienda y elige el producto que mejor se adapte a tus necesidades
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Paga con Tokens CMPX</h3>
                    <p className="text-sm text-muted-foreground">
                      Usa tus tokens CMPX para realizar la compra de forma segura e instantnea
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Disfruta tu Compra</h3>
                    <p className="text-sm text-muted-foreground">
                      Recibe tu producto inmediatamente y mejora tu experiencia en la plataforma
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
                  Necesitas ms tokens CMPX?
                </h2>
                <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                  Compra tokens CMPX para acceder a todos los productos premium del marketplace
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
                    Soporte
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

export default Marketplace;
