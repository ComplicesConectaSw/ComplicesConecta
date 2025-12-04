// @ts-expect-error - Deno runtime imports from URLs
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-expect-error - Deno runtime imports from URLs
import Stripe from "https://esm.sh/stripe@14.21.0";
// @ts-expect-error - Deno runtime imports from URLs
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-INVESTMENT-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Create a Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get request body - user_email eliminado porque no se usa
    const { investment_id, tier_key, amount_mxn } = await req.json();
    logStep("Request data received", { investment_id, tier_key, amount_mxn });

    if (!investment_id || !tier_key || !amount_mxn) {
      throw new Error("Missing required fields: investment_id, tier_key, amount_mxn");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" } as any);
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }

    // Get tier details
    const { data: tier, error: tierError } = await supabaseClient
      .from('investment_tiers')
      .select('*')
      .eq('tier_key', tier_key)
      .single();

    if (tierError || !tier) {
      throw new Error(`Tier not found: ${tier_key}`);
    }

    // Create Stripe Checkout Session
    const origin = req.headers.get("origin") || "https://complicesconectasw.vercel.app";
    const successUrl = `${origin}/invest?success=true&investment_id=${investment_id}`;
    const cancelUrl = `${origin}/invest?canceled=true`;

    // Convert MXN to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount_mxn * 100);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `Inversión ${tier.name} - ComplicesConecta`,
              description: tier.description,
              metadata: {
                tier_key: tier_key,
                investment_id: investment_id,
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
        investment_id: investment_id,
        tier_key: tier_key,
        user_id: user.id,
        amount_mxn: amount_mxn.toString(),
        return_percentage: tier.return_percentage.toString(),
        cmpx_tokens_rewarded: tier.cmpx_tokens_rewarded.toString(),
      },
      customer_email: user.email,
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Update investment with Stripe payment intent
    const { error: updateError } = await supabaseClient
      .from('investments')
      .update({
        stripe_payment_intent_id: session.payment_intent?.toString() || session.id,
        stripe_customer_id: customerId,
        payment_status: 'processing',
      })
      .eq('id', investment_id);

    if (updateError) {
      logStep("Warning: Could not update investment", { error: updateError.message });
    }

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
    const err = error as Error;
    logStep("Error", { error: err.message, stack: err.stack });
    return new Response(
      JSON.stringify({ 
        error: err.message,
        details: err.stack,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});