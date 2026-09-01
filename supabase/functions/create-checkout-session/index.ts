import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const priceEnv: Record<string, string> = {
  "pro:monthly": "STRIPE_PRO_MONTHLY_PRICE_ID",
  "pro:yearly": "STRIPE_PRO_YEARLY_PRICE_ID",
  "business:monthly": "STRIPE_BUSINESS_MONTHLY_PRICE_ID",
  "business:yearly": "STRIPE_BUSINESS_YEARLY_PRICE_ID",
};

const allowedOrigins = new Set([
  "https://trypost.ai",
  "https://www.trypost.ai",
  "http://localhost:3000",
  "http://localhost:5173",
]);

const getSafeOrigin = (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  return allowedOrigins.has(origin) ? origin : "https://trypost.ai";
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authentication required");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (userError || !user?.email) throw new Error("Authentication required");

    const { plan, billing } = await req.json();
    const envName = priceEnv[`${plan}:${billing}`];
    const priceId = envName ? Deno.env.get(envName) : null;
    if (!priceId) throw new Error("This plan is not configured for checkout");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const { data: existing } = await admin
      .from("subscriptions")
      .select("stripe_customer_id,stripe_subscription_id,status")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = existing?.stripe_customer_id ?? null;
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      const customer = customers.data[0] ?? await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      await admin.from("subscriptions").upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        plan: "free",
        status: "free",
        updated_at: new Date().toISOString(),
      });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 10,
    });
    const existingSubscription = subscriptions.data.find((subscription) =>
      ["active", "trialing", "past_due", "incomplete", "unpaid", "paused"].includes(subscription.status)
    );

    const origin = getSafeOrigin(req);
    if (existingSubscription || (existing?.stripe_subscription_id && existing.status !== "canceled")) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/dashboard/account/plans`,
      });
      return new Response(JSON.stringify({ url: portalSession.url, portal: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 14,
        metadata: { user_id: user.id, plan },
      },
      metadata: { user_id: user.id, plan },
      success_url: `${origin}/dashboard/account/plans?checkout=success`,
      cancel_url: `${origin}/dashboard/account/plans?checkout=cancelled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
