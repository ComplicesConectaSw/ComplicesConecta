import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Shield, CheckCircle, Zap, Crown, Star, Percent } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import HeaderNav from '@/components/HeaderNav';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { Database } from '@/types/supabase-generated';

type InvestmentTierRow = Database['public']['Tables']['investment_tiers']['Row'];
type InvestmentRow = Database['public']['Tables']['investments']['Row'];

interface InvestmentTier extends InvestmentTierRow {
  benefits: string[];
}

const Invest = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [tiers, setTiers] = useState<InvestmentTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [userInvestments, setUserInvestments] = useState<InvestmentRow[]>([]);

  useEffect(() => {
    loadTiers();
    if (isAuthenticated() && user !== null && user !== undefined) {
      loadUserInvestments();
    }

    // Manejar retorno de Stripe
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const investmentId = searchParams.get('investment_id');

    if (success === 'true' && investmentId) {
      toast({
        title: 'Inversión exitosa',
        description: 'Tu inversión ha sido procesada correctamente. Los tokens CMPX se otorgarán en breve.',
      });
      loadUserInvestments();
      // Limpiar URL
      navigate('/invest', { replace: true });
    } else if (canceled === 'true') {
      toast({
        title: 'Pago cancelado',
        description: 'El pago fue cancelado. Puedes intentar nuevamente cuando estés listo.',
        variant: 'destructive',
      });
      navigate('/invest', { replace: true });
    }
  }, [isAuthenticated, user, searchParams, navigate, toast]);

  const loadTiers = async () => {
    if (!supabase) {
      toast({
        title: 'Error',
        description: 'No se pudo conectar a la base de datos',
        variant: 'destructive',
      });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('investment_tiers')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const formattedTiers: InvestmentTier[] = (data || []).map(tier => ({
        ...tier,
        benefits: Array.isArray(tier.benefits) ? (tier.benefits as string[]) : []
      }));

      setTiers(formattedTiers as InvestmentTier[]);
    } catch (error) {
      logger.error('Error cargando tiers:', { error });
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los niveles de inversión',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserInvestments = async () => {
    if (!user || !supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserInvestments(data || []);
    } catch (error) {
      logger.error('Error cargando inversiones:', { error });
    }
  };

  const handleInvest = async (tierKey: string) => {
    if (!supabase) {
      toast({
        title: 'Error',
        description: 'No se pudo conectar a la base de datos',
        variant: 'destructive',
      });
      return;
    }
    if (!isAuthenticated() || !user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para invertir',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    const tier = tiers.find(t => t.tier_key === tierKey);
    if (!tier) return;

    try {
      setProcessing(true);

      // Crear registro de inversión pendiente
      if (!supabase) throw new Error('No se pudo conectar a la base de datos');
      const { data: investment, error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          tier: tierKey,
          amount_mxn: tier.amount_mxn,
          return_percentage: tier.return_percentage,
          return_type: tier.return_type,
          equity_percentage: tier.equity_percentage,
          cmpx_tokens_rewarded: tier.cmpx_tokens_rewarded,
          includes_vip_dinner: tier.includes_vip_dinner,
          includes_equity: tier.includes_equity,
          benefits: tier.benefits,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (investmentError) throw investmentError;

      // Crear checkout de Stripe
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-investment-checkout',
        {
          body: {
            investment_id: investment.id,
            tier_key: tierKey,
            amount_mxn: tier.amount_mxn,
            user_email: user.email,
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
      logger.error('Error procesando inversión:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo procesar la inversión',
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
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

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
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Invierte en ComplicesConecta
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-6">
            Tu inversión = Retorno garantizado del 10% anual + Tokens CMPX + Beneficios exclusivos
          </p>
          <div className="flex items-center justify-center gap-2 text-white/70">
            <Shield className="w-5 h-5" />
            <span>Contrato SAFTE legal • Retorno garantizado • Equity disponible</span>
          </div>
        </div>

        {/* Investment Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.tier_key;
            const annualReturn = tier.amount_mxn * (tier.return_percentage / 100);
            
            return (
              <Card 
                key={tier.tier_key}
                className={`relative overflow-hidden border-2 transition-all duration-300 ${
                  isSelected 
                    ? 'border-white scale-105 shadow-2xl' 
                    : 'border-white/20 hover:border-white/40'
                } ${
                  tier.tier_key === 'vip_50k' ? 'md:col-span-1 md:row-span-1 ring-2 ring-yellow-400' : ''
                }`}
                onClick={() => setSelectedTier(tier.tier_key)}
              >
                {tier.tier_key === 'vip_50k' && (
                  <Badge className="absolute top-4 right-4 bg-yellow-500 text-black font-bold">
                    MÁS POPULAR
                  </Badge>
                )}
                
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  tier.tier_key === 'basic_10k' ? 'from-blue-500 to-cyan-500' :
                  tier.tier_key === 'premium_25k' ? 'from-purple-500 to-pink-500' :
                  'from-yellow-500 to-orange-500'
                } opacity-90`} />
                
                <CardHeader className="relative text-white text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {tier.tier_key === 'basic_10k' && <Star className="h-6 w-6" />}
                    {tier.tier_key === 'premium_25k' && <Crown className="h-6 w-6" />}
                    {tier.tier_key === 'vip_50k' && <Zap className="h-6 w-6" />}
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  </div>
                  <div className="text-4xl font-bold mb-2">
                    {formatCurrency(tier.amount_mxn)}
                  </div>
                  <CardDescription className="text-white/80">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative text-white space-y-4">
                  {/* Return Info */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Retorno Anual:</span>
                      <span className="text-lg font-bold text-green-300">
                        {formatCurrency(annualReturn)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/70">
                      <Percent className="w-3 h-3" />
                      <span>{tier.return_percentage}% garantizado</span>
                    </div>
                  </div>

                  {/* Tokens */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Tokens CMPX:</span>
                      <span className="text-lg font-bold text-purple-300">
                        {formatNumber(tier.cmpx_tokens_rewarded)}
                      </span>
                    </div>
                  </div>

                  {/* Equity */}
                  {tier.includes_equity && tier.equity_percentage && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Equity:</span>
                        <span className="text-lg font-bold text-yellow-300">
                          {(tier.equity_percentage * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  <div className="space-y-2">
                    <div className="text-sm font-semibold mb-2">Beneficios incluidos:</div>
                    <ul className="space-y-2 text-sm">
                      {tier.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                      {tier.includes_vip_dinner && (
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>Cena VIP con fundadores</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full mt-4 ${
                      tier.tier_key === 'vip_50k'
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black font-bold'
                        : 'bg-white text-purple-600 hover:bg-white/90'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInvest(tier.tier_key);
                    }}
                    disabled={processing}
                  >
                    {processing && selectedTier === tier.tier_key ? (
                      'Procesando...'
                    ) : (
                      `Invertir ${formatCurrency(tier.amount_mxn)}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* User Investments */}
        {isAuthenticated() && user !== null && user !== undefined && userInvestments.length > 0 && (
          <Card className="bg-white/10 border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Mis Inversiones</CardTitle>
              <CardDescription className="text-white/70">
                Tus inversiones activas y retornos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userInvestments.map((investment) => (
                  <div key={investment.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">
                        {tiers.find(t => t.tier_key === investment.tier)?.name || investment.tier}
                      </span>
                      <Badge className={
                        investment.status === 'active' ? 'bg-green-500' :
                        investment.status === 'pending' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }>
                        {investment.status === 'active' ? 'Activa' :
                         investment.status === 'pending' ? 'Pendiente' :
                         investment.status}
                      </Badge>
                    </div>
                    <div className="text-white/70 text-sm">
                      Inversión: {formatCurrency(investment.amount_mxn)} • 
                      Retorno anual: {formatCurrency(investment.amount_mxn * (investment.return_percentage / 100))} • 
                      Tokens: {formatNumber(investment.cmpx_tokens_rewarded || 0)} CMPX
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Preguntas Frecuentes sobre Inversiones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">¿Qué es SAFTE?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  SAFTE (Simple Agreement for Future Tokens/Equity) es un contrato legal que garantiza 
                  tu retorno del 10% anual y te otorga tokens CMPX o equity según el nivel de inversión.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">¿Cuándo recibo mi retorno?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Los retornos se pagan anualmente el mismo día de tu inversión. El primer retorno 
                  se paga después de 12 meses completos.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">¿Puedo retirar mi inversión?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Las inversiones tienen un plazo mínimo de 12 meses. Después puedes solicitar 
                  el retiro con 30 días de anticipación.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">¿Es seguro invertir?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Sí, utilizamos Stripe para procesamiento seguro de pagos y contratos SAFTE 
                  legalmente vinculantes. Tu inversión está protegida.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invest;

