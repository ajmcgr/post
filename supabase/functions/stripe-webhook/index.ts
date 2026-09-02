import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const planForPrice = (priceId: string) => {
  const entries = [
    ["STRIPE_PRO_MONTHLY_PRICE_ID", "pro"],
    ["STRIPE_PRO_YEARLY_PRICE_ID", "pro"],
    ["STRIPE_BUSINESS_MONTHLY_PRICE_ID", "business"],
    ["STRIPE_BUSINESS_YEARLY_PRICE_ID", "business"],
  ];
  return entries.find(([envName]) => Deno.env.get(envName) === priceId)?.[1] ?? null;
};

const subscriptionEventTypes = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

serve(async (req) => {
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey || !webhookSecret) throw new Error("Stripe webhook is not configured");

    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("Missing Stripe signature");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const event = await stripe.webhooks.constructEventAsync(await req.text(), signature, webhookSecret);
    console.log(`[STRIPE-WEBHOOK] Processing ${event.id} (${event.type})`);
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    if (subscriptionEventTypes.has(event.type)) {
      const { data: processedEvent, error: processedEventError } = await admin
        .from("stripe_webhook_events")
        .select("event_id")
        .eq("event_id", event.id)
        .maybeSingle();
      if (processedEventError) {
        throw new Error(`Failed to check webhook idempotency: ${processedEventError.message}`);
      }
      if (processedEvent) {
        console.log(`[STRIPE-WEBHOOK] Ignored duplicate ${event.id}`);
        return new Response(JSON.stringify({ received: true, event_id: event.id, duplicate: true }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const subscription = event.data.object as Stripe.Subscription;
      const customerId = String(subscription.customer);
      const priceId = subscription.items.data[0]?.price.id ?? "";
      let userId = subscription.metadata.user_id;

      if (!userId) {
        const { data, error } = await admin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        if (error) throw new Error(`Failed to resolve subscription owner: ${error.message}`);
        userId = data?.user_id;
      }

      if (!userId) {
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.deleted) userId = customer.metadata.user_id;
      }

      if (!userId) throw new Error(`No Post user found for Stripe customer ${customerId}`);

      const plan = event.type === "customer.subscription.deleted" ? "free" : planForPrice(priceId);
      if (!plan) throw new Error(`Unknown Stripe price ${priceId} for event ${event.id}`);

      const eventCreatedAt = new Date(event.created * 1000).toISOString();
      const { data: applied, error: persistError } = await admin.rpc("apply_stripe_subscription_event", {
        target_user_id: userId,
        target_customer_id: customerId,
        target_subscription_id: subscription.id,
        target_price_id: priceId,
        target_plan: plan,
        target_status: subscription.status,
        target_current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        target_cancel_at_period_end: subscription.cancel_at_period_end,
        target_event_created_at: eventCreatedAt,
      });
      if (persistError) throw new Error(`Failed to persist subscription: ${persistError.message}`);

      const { error: eventRecordError } = await admin.from("stripe_webhook_events").insert({
        event_id: event.id,
        event_type: event.type,
        event_created_at: eventCreatedAt,
        subscription_id: subscription.id,
        user_id: userId,
        processing_result: applied ? "applied" : "stale",
      });
      if (eventRecordError && eventRecordError.code !== "23505") {
        throw new Error(`Failed to record webhook event: ${eventRecordError.message}`);
      }

      console.log(`[STRIPE-WEBHOOK] ${applied ? "Persisted" : "Ignored stale"} ${event.id} for user ${userId}`);
    }

    return new Response(JSON.stringify({ received: true, event_id: event.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed";
    console.error(`[STRIPE-WEBHOOK] ${message}`);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
