// @ts-expect-error - Deno runtime imports from URLs
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-expect-error - Deno runtime imports from URLs
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// @ts-expect-error - Deno runtime imports from URLs
import Stripe from "https://esm.sh/stripe@14.21.0";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Calcular período semanal (lunes a domingo)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = domingo, 1 = lunes
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const periodEnd = new Date(now);
    periodEnd.setHours(0, 0, 0, 0);
    
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 7);

    console.log(`💰 Procesando pagos semanales: ${periodStart.toISOString()} - ${periodEnd.toISOString()}`);

    // Obtener todos los moderadores activos desde tabla moderators
    const { data: moderators, error: modError } = await supabaseClient
      .from('moderators')
      .select('user_id, level, is_active')
      .eq('is_active', true);

    if (modError) throw modError;

    // También incluir admins como superadmin
    const { data: admins, error: adminError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('is_admin', true);

    if (adminError) {
      console.error('Error obteniendo admins:', adminError);
    }

    // Combinar moderadores y admins
    const allModerators = [
      ...(moderators || []).map(m => ({ user_id: m.user_id, level: m.level, is_admin: false })),
      ...(admins || []).map(a => ({ user_id: a.id, level: 'superadmin', is_admin: true }))
    ];

    const payments: Array<{ moderator_id: string; payment_id: string; amount: number; minutes: number }> = [];

    for (const moderator of allModerators) {
      try {
        // Determinar nivel del moderador
        let moderatorLevel = moderator.level || 'junior';
        let revenuePercentage = 3.00;

        if (moderator.is_admin || moderatorLevel === 'superadmin') {
          moderatorLevel = 'superadmin';
          revenuePercentage = 30.00;
        } else {
          // Mapear niveles de moderators a niveles de pago
          switch (moderatorLevel) {
            case 'lead':
              moderatorLevel = 'elite';
              revenuePercentage = 8.00;
              break;
            case 'senior':
              moderatorLevel = 'senior';
              revenuePercentage = 5.00;
              break;
            case 'junior':
            default:
              moderatorLevel = 'junior';
              revenuePercentage = 3.00;
              break;
          }
        }

        // Calcular minutos trabajados en el período
        const { data: sessions, error: sessionsError } = await supabaseClient
          .from('moderator_sessions')
          .select('total_minutes, reports_reviewed, actions_taken')
          .eq('moderator_id', moderator.user_id)
          .gte('session_start', periodStart.toISOString())
          .lt('session_start', periodEnd.toISOString());

        if (sessionsError) {
          console.error(`Error obteniendo sesiones para ${moderator.user_id}:`, sessionsError);
          continue;
        }

        const totalMinutes = sessions?.reduce((sum, s) => sum + (s.total_minutes || 0), 0) || 0;
        const reportsReviewed = sessions?.reduce((sum, s) => sum + (s.reports_reviewed || 0), 0) || 0;
        const actionsTaken = sessions?.reduce((sum, s) => sum + (s.actions_taken || 0), 0) || 0;

        // Calcular revenue total del período
        const { data: investments, error: invError } = await supabaseClient
          .from('investments')
          .select('amount_mxn')
          .gte('created_at', periodStart.toISOString())
          .lt('created_at', periodEnd.toISOString())
          .eq('payment_status', 'succeeded');

        if (invError) {
          console.error('Error obteniendo inversiones:', invError);
          continue;
        }

        const totalRevenue = investments?.reduce((sum, inv) => sum + parseFloat(inv.amount_mxn || '0'), 0) || 0;

        // Calcular pago
        let paymentAmount = totalRevenue * (revenuePercentage / 100.0);

        // Aplicar mínimo de horas trabajadas (20 horas = 1200 minutos)
        if (totalMinutes < 1200) {
          paymentAmount = paymentAmount * (totalMinutes / 1200.0);
        }

        // Calcular quality score (basado en acciones/reportes revisados)
        const qualityScore = reportsReviewed > 0 
          ? Math.min(100, (actionsTaken / reportsReviewed) * 100)
          : 0;

        // Solo crear pago si hay minutos trabajados y monto > 0
        if (totalMinutes > 0 && paymentAmount > 0) {
          const { data: payment, error: paymentError } = await supabaseClient
            .from('moderator_payments')
            .insert({
              moderator_id: moderator.user_id,
              payment_period_start: periodStart.toISOString(),
              payment_period_end: periodEnd.toISOString(),
              revenue_percentage: revenuePercentage,
              total_revenue_mxn: totalRevenue,
              payment_amount_mxn: paymentAmount,
              total_minutes_worked: totalMinutes,
              reports_reviewed: reportsReviewed,
              actions_taken: actionsTaken,
              quality_score: qualityScore,
              moderator_level: moderatorLevel,
              payment_status: 'pending',
            })
            .select()
            .single();

          if (paymentError) {
            console.error(`Error creando pago para ${moderator.user_id}:`, paymentError);
            continue;
          }

          payments.push({
            moderator_id: moderator.user_id,
            payment_id: payment.id,
            amount: paymentAmount,
            minutes: totalMinutes,
          });

          console.log(`✅ Pago creado para moderador ${moderator.user_id}: $${paymentAmount.toFixed(2)} MXN`);
        }
      } catch (error) {
        console.error(`Error procesando moderador ${moderator.user_id}:`, error);
        continue;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        payments_created: payments.length,
        payments,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error procesando pagos:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

