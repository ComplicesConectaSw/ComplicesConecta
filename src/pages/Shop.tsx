import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Coins, Gift, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import HeaderNav from '@/components/HeaderNav';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface CMPXPackage {
  id: string;
  name: string;
  cmpx_amount: number;
  bonus_cmpx: number;
  price_mxn: number;
  is_popular: boolean;
  description?: string;
}

const Shop = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [packages, setPackages] = useState<CMPXPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userPurchases, setUserPurchases] = useState<any[]>([]);

  useEffect(() => {
    loadPackages();
    if (isAuthenticated() && user) {
      loadUserPurchases();
    }

    // Manejar retorno de Stripe
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const purchaseId = searchParams.get('purchase_id');

    if (success === 'true' && purchaseId) {
      toast({
        title: 'Compra exitosa',
        description: 'Los tokens CMPX se han agregado a tu cuenta',
      });
      loadUserPurchases();
      navigate('/shop', { replace: true });
    } else if (canceled === 'true') {
      toast({
        title: 'Compra cancelada',
        description: 'La compra fue cancelada. Puedes intentar nuevamente cuando estés listo.',
        variant: 'destructive',
      });
      navigate('/shop', { replace: true });
    }
  }, [isAuthenticated, user, searchParams, navigate, toast]);

  const loadPackages = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase no está disponible');
      }
      
      const { data, error } = await supabase
        .from('cmpx_shop_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      const mappedPackages = (data || []).map(pkg => ({
        ...pkg,
        bonus_cmpx: pkg.bonus_cmpx || 0,
        description: pkg.description || '',
        display_order: pkg.display_order || 0,
        is_active: pkg.is_active !== false,
        is_popular: pkg.is_popular || false,
        price_usd: pkg.price_usd || 0
      }));
      setPackages(mappedPackages);
    } catch (error) {
      logger.error('Error cargando paquetes:', { error: error instanceof Error ? error.message : String(error) });
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los paquetes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserPurchases = async () => {
    if (!user || !supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('cmpx_purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setUserPurchases(data || []);
    } catch (error) {
      logger.error('Error cargando compras:', { error: error instanceof Error ? error.message : String(error) });
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!isAuthenticated() || !user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para comprar tokens',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!supabase) {
      toast({
        title: 'Error',
        description: 'Servicio no disponible',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-cmpx-checkout',
        {
          body: {
            package_id: packageId,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (checkoutError) throw checkoutError;

      // Redirigir a Stripe Checkout
      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error('No se recibió URL de checkout');
      }
    } catch (error: any) {
      logger.error('Error procesando compra:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo procesar la compra',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-MX').format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 flex items-center justify-center">
        <div className="text-white text-xl">Cargando shop...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Shop CMPX Tokens
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-6">
            Compra tokens CMPX para desbloquear funciones premium y apoyar a creadores
          </p>
          <div className="flex items-center justify-center gap-2 text-white/70">
            <Coins className="w-5 h-5" />
            <span>1000 CMPX = 300 MXN • Comisión galerías: 10% (creador gana 90%)</span>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {packages.map((pkg) => {
            const totalCMPX = pkg.cmpx_amount + pkg.bonus_cmpx;
            const pricePerToken = pkg.price_mxn / totalCMPX;
            
            return (
              <Card 
                key={pkg.id}
                className={`relative overflow-hidden border-2 transition-all duration-300 ${
                  pkg.is_popular 
                    ? 'border-yellow-400 scale-105 shadow-2xl ring-2 ring-yellow-400' 
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                {pkg.is_popular && (
                  <Badge className="absolute top-4 right-4 bg-yellow-500 text-black font-bold">
                    POPULAR
                  </Badge>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/90 to-blue-500/90" />
                
                <CardHeader className="relative text-white text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="h-6 w-6" />
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  </div>
                  <div className="text-4xl font-bold mb-2">
                    {formatNumber(totalCMPX)} CMPX
                  </div>
                  {pkg.bonus_cmpx > 0 && (
                    <Badge className="bg-green-500/80 text-white mb-2">
                      <Gift className="w-3 h-3 mr-1" />
                      +{formatNumber(pkg.bonus_cmpx)} bonus
                    </Badge>
                  )}
                  <CardDescription className="text-white/80">
                    {pkg.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative text-white space-y-4">
                  {/* Price Info */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Precio:</span>
                      <span className="text-2xl font-bold text-green-300">
                        {formatCurrency(pkg.price_mxn)}
                      </span>
                    </div>
                    <div className="text-xs text-white/70">
                      {formatCurrency(pricePerToken)} por token
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="bg-white/5 rounded-lg p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Tokens base:</span>
                      <span className="font-semibold">{formatNumber(pkg.cmpx_amount)}</span>
                    </div>
                    {pkg.bonus_cmpx > 0 && (
                      <div className="flex justify-between text-green-300">
                        <span>Bonus:</span>
                        <span className="font-semibold">+{formatNumber(pkg.bonus_cmpx)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-white/20 pt-1 mt-1">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg">{formatNumber(totalCMPX)} CMPX</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full mt-4 ${
                      pkg.is_popular
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black font-bold'
                        : 'bg-white text-purple-600 hover:bg-white/90'
                    }`}
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={processing}
                  >
                    {processing ? (
                      'Procesando...'
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Comprar {formatCurrency(pkg.price_mxn)}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* User Purchases */}
        {isAuthenticated() && userPurchases.length > 0 && (
          <Card className="bg-white/10 border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Mis Compras</CardTitle>
              <CardDescription className="text-white/70">
                Historial de tus compras de tokens CMPX
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPurchases.map((purchase) => (
                  <div key={purchase.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">
                        {formatNumber(purchase.total_cmpx)} CMPX
                      </span>
                      <Badge className={
                        purchase.status === 'completed' ? 'bg-green-500' :
                        purchase.status === 'pending' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }>
                        {purchase.status === 'completed' ? 'Completada' :
                         purchase.status === 'pending' ? 'Pendiente' :
                         purchase.status}
                      </Badge>
                    </div>
                    <div className="text-white/70 text-sm">
                      {formatCurrency(purchase.price_mxn)} • 
                      {purchase.bonus_cmpx > 0 && ` +${formatNumber(purchase.bonus_cmpx)} bonus •`}
                      {' '}{new Date(purchase.created_at).toLocaleDateString('es-MX')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            ¿Cómo funcionan los tokens CMPX?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-400" />
                  Compra Directa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Compra tokens CMPX directamente desde el shop. Los tokens se agregan instantáneamente 
                  a tu cuenta después del pago.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Comisión Galerías
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Cuando alguien interactúa con tu galería, recibes el 90% de los tokens CMPX. 
                  La plataforma retiene solo el 10% como comisión.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Usos de CMPX
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Usa tokens CMPX para funciones premium, super likes, ver perfiles completos, 
                  y más funciones exclusivas de la plataforma.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;

