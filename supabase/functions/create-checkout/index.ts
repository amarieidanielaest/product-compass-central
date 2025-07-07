import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
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

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { plan_id, billing_period = 'monthly', team_id } = await req.json();
    if (!plan_id) throw new Error("Plan ID is required");

    // Get pricing plan details
    const { data: plan, error: planError } = await supabaseClient
      .from('pricing_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) throw new Error("Invalid plan selected");
    logStep("Plan found", { planName: plan.name, price: plan.price_monthly });

    // If team_id provided, verify user has permission to manage billing
    if (team_id) {
      const { data: membership } = await supabaseClient
        .from('team_memberships')
        .select('role')
        .eq('team_id', team_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership || !['owner', 'admin'].includes(membership.role)) {
        throw new Error("Insufficient permissions to manage team billing");
      }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          team_id: team_id || '',
        }
      });
      customerId = customer.id;
    }

    logStep("Customer prepared", { customerId });

    // Determine price and product name
    const price = billing_period === 'yearly' ? plan.price_yearly : plan.price_monthly;
    const productName = `${plan.name} Plan - ${billing_period === 'yearly' ? 'Annual' : 'Monthly'}`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: productName,
              description: plan.description 
            },
            unit_amount: price,
            recurring: { 
              interval: billing_period === 'yearly' ? 'year' : 'month' 
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/billing/canceled`,
      metadata: {
        user_id: user.id,
        plan_id: plan_id,
        team_id: team_id || '',
        billing_period: billing_period,
      }
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});