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
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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

    // Get request body
    const { planId, billingPeriod, isTrial } = await req.json();
    logStep("Request data received", { planId, billingPeriod, isTrial });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No customer found, will create new one in session");
    }

    // Define pricing based on plan and billing period
    const pricingMap: Record<string, Record<string, number>> = {
      basic: { monthly: 999, quarterly: 2499, semiannual: 4499, annual: 7999 },
      silver: { monthly: 1999, quarterly: 5499, semiannual: 9999, annual: 17999 },
      gold: { monthly: 2999, quarterly: 7999, semiannual: 14999, annual: 27999 },
      premium: { monthly: 3999, quarterly: 10999, semiannual: 19999, annual: 39999 }
    };

    let sessionData: Record<string, unknown> = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      success_url: `${req.headers.get("origin")}/premium?success=true`,
      cancel_url: `${req.headers.get("origin")}/premium?canceled=true`,
    };

    if (isTrial) {
      // Create trial subscription (7 days free)
      sessionData = {
        ...sessionData,
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name: "Premium Trial - 7 días gratis" },
            unit_amount: pricingMap.silver.monthly, // Default to silver monthly after trial
            recurring: { interval: "month" },
          },
          quantity: 1,
        }],
        subscription_data: {
          trial_period_days: 7,
        },
      };
      logStep("Creating trial subscription");
    } else {
      // Regular subscription
      const amount = pricingMap[planId]?.[billingPeriod];
      if (!amount) throw new Error("Invalid plan or billing period");

      const intervalMap: Record<string, string> = {
        monthly: "month",
        quarterly: "month",
        semiannual: "month", 
        annual: "year"
      };

      const intervalCountMap: Record<string, number> = {
        monthly: 1,
        quarterly: 3,
        semiannual: 6,
        annual: 1
      };

      sessionData = {
        ...sessionData,
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name: `Plan ${planId.charAt(0).toUpperCase() + planId.slice(1)} - ${billingPeriod}` },
            unit_amount: amount,
            recurring: { 
              interval: intervalMap[billingPeriod],
              interval_count: intervalCountMap[billingPeriod]
            },
          },
          quantity: 1,
        }],
      };
      logStep("Creating regular subscription", { planId, amount, billingPeriod });
    }

    const session = await stripe.checkout.sessions.create(sessionData);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});