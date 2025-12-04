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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { package_id } = await req.json();
    if (!package_id) throw new Error("package_id is required");

    // Obtener paquete
    const { data: packageData, error: packageError } = await supabaseClient
      .from('cmpx_shop_packages')
      .select('*')
      .eq('id', package_id)
      .eq('is_active', true)
      .single();

    if (packageError || !packageData) {
      throw new Error("Paquete no encontrado o no disponible");
    }

    // Crear registro de compra pendiente
    const totalCMPX = packageData.cmpx_amount + (packageData.bonus_cmpx || 0);
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('cmpx_purchases')
      .insert({
        user_id: user.id,
        package_id: packageData.id,
        cmpx_amount: packageData.cmpx_amount,
        bonus_cmpx: packageData.bonus_cmpx || 0,
        total_cmpx: totalCMPX,
        price_mxn: packageData.price_mxn,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // Crear checkout de Stripe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" } as any);
    
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const amountInCents = Math.round(packageData.price_mxn * 100);
    const successUrl = `${Deno.env.get("SITE_URL") || "http://localhost:5173"}/shop?success=true&purchase_id=${purchase.id}`;
    const cancelUrl = `${Deno.env.get("SITE_URL") || "http://localhost:5173"}/shop?canceled=true`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `${packageData.name} - ${totalCMPX} CMPX Tokens`,
              description: packageData.description || `${packageData.cmpx_amount} CMPX${packageData.bonus_cmpx > 0 ? ` + ${packageData.bonus_cmpx} bonus` : ''}`,
              metadata: {
                package_id: packageData.id,
                purchase_id: purchase.id,
              },
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        purchase_id: purchase.id,
        package_id: packageData.id,
        user_id: user.id,
        cmpx_amount: packageData.cmpx_amount.toString(),
        bonus_cmpx: (packageData.bonus_cmpx || 0).toString(),
        total_cmpx: totalCMPX.toString(),
        price_mxn: packageData.price_mxn.toString(),
      },
      customer_email: user.email,
    });

    // Actualizar compra con Stripe payment intent
    await supabaseClient
      .from('cmpx_purchases')
      .update({
        stripe_payment_intent_id: session.payment_intent?.toString() || session.id,
        stripe_customer_id: customerId,
        payment_status: 'processing',
      })
      .eq('id', purchase.id);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        session_id: session.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error creating CMPX checkout:', error);
    return new Response(
      JSON.stringify({
        error: errorMessage,
        success: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});