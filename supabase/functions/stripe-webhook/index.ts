import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) throw new Error("No Stripe signature found");

    // In production, you should set STRIPE_WEBHOOK_SECRET
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event;

    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For development, parse without verification (not recommended for production)
      event = JSON.parse(body);
    }

    logStep("Event type", { type: event.type });

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, supabaseClient);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object, supabaseClient);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object, supabaseClient);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, supabaseClient);
        break;
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
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

async function handleCheckoutCompleted(session: any, supabaseClient: any) {
  logStep("Handling checkout completed", { sessionId: session.id });

  const { user_id, plan_id, team_id } = session.metadata || {};
  if (!user_id || !plan_id) return;

  const subscription = await getSubscriptionFromSession(session);
  if (!subscription) return;

  // Update team subscription status
  if (team_id) {
    await supabaseClient
      .from('teams')
      .update({
        pricing_plan_id: plan_id,
        stripe_customer_id: session.customer,
        subscription_status: 'active',
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', team_id);
  }

  logStep("Subscription activated", { userId: user_id, planId: plan_id, teamId: team_id });
}

async function handlePaymentSucceeded(invoice: any, supabaseClient: any) {
  logStep("Handling payment succeeded", { invoiceId: invoice.id });
  
  if (invoice.subscription) {
    // Update subscription end date
    const subscription = await getSubscriptionById(invoice.subscription);
    if (subscription) {
      await updateTeamSubscription(subscription, supabaseClient);
    }
  }
}

async function handleSubscriptionUpdated(subscription: any, supabaseClient: any) {
  logStep("Handling subscription updated", { subscriptionId: subscription.id });
  await updateTeamSubscription(subscription, supabaseClient);
}

async function handleSubscriptionDeleted(subscription: any, supabaseClient: any) {
  logStep("Handling subscription deleted", { subscriptionId: subscription.id });
  
  // Find team by stripe customer ID
  const { data: teams } = await supabaseClient
    .from('teams')
    .select('id')
    .eq('stripe_customer_id', subscription.customer);

  if (teams && teams.length > 0) {
    for (const team of teams) {
      await supabaseClient
        .from('teams')
        .update({
          subscription_status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', team.id);
    }
  }
}

async function getSubscriptionFromSession(session: any) {
  if (session.subscription) {
    return await getSubscriptionById(session.subscription);
  }
  return null;
}

async function getSubscriptionById(subscriptionId: string) {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const stripe = new Stripe(stripeKey!, { apiVersion: "2023-10-16" });
  
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    logStep("Error retrieving subscription", { subscriptionId, error: error.message });
    return null;
  }
}

async function updateTeamSubscription(subscription: any, supabaseClient: any) {
  const status = subscription.status === 'active' ? 'active' : 
                subscription.status === 'past_due' ? 'past_due' : 'inactive';

  // Find team by stripe customer ID
  const { data: teams } = await supabaseClient
    .from('teams')
    .select('id')
    .eq('stripe_customer_id', subscription.customer);

  if (teams && teams.length > 0) {
    for (const team of teams) {
      await supabaseClient
        .from('teams')
        .update({
          subscription_status: status,
          subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', team.id);
    }
  }
}