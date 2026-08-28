import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { productPlans, type BillingInterval, type PlanId } from "@/data/plans";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

const Plans = () => {
  const [searchParams] = useSearchParams();
  const initialBilling = searchParams.get("billing") === "yearly" ? "yearly" : "monthly";
  const [billing, setBilling] = useState<BillingInterval>(initialBilling);
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const { plan: currentPlan, status, currentPeriodEnd, cancelAtPeriodEnd, refresh } = useSubscription();

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast.success("Subscription started. Your plan will update in a moment.");
      trackEvent("checkout_completed");
      const timer = window.setTimeout(refresh, 1500);
      return () => window.clearTimeout(timer);
    }
    if (searchParams.get("checkout") === "cancelled") trackEvent("checkout_cancelled");
  }, [refresh, searchParams]);

  const startCheckout = async (plan: PlanId) => {
    setLoadingPlan(plan);
    trackEvent("checkout_started", { plan, billing });
    const { data, error } = await supabase.functions.invoke("create-checkout-session", {
      body: { plan, billing },
    });
    setLoadingPlan(null);
    if (error || !data?.url) {
      toast.error(data?.error || error?.message || "Unable to start checkout");
      return;
    }
    window.location.assign(data.url);
  };

  const openPortal = async () => {
    setLoadingPlan(currentPlan);
    trackEvent("billing_portal_opened", { plan: currentPlan });
    const { data, error } = await supabase.functions.invoke("customer-portal");
    setLoadingPlan(null);
    if (error || !data?.url) {
      toast.error(data?.error || error?.message || "Unable to open billing");
      return;
    }
    window.location.assign(data.url);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Plans & Pricing</h1>
          <p className="text-muted-foreground">
            {currentPlan === "free"
              ? "Start free, then upgrade when you need more accounts or volume."
              : `${currentPlan === "pro" ? "Pro" : "Business"} plan · ${status}${cancelAtPeriodEnd ? " · cancels at period end" : ""}`}
          </p>
          {currentPeriodEnd && currentPlan !== "free" && (
            <p className="mt-1 text-xs text-muted-foreground">Current period ends {new Date(currentPeriodEnd).toLocaleDateString()}</p>
          )}
        </div>
        <div className="inline-flex w-fit items-center gap-1 rounded-full bg-muted p-1">
          {(["monthly", "yearly"] as BillingInterval[]).map((interval) => (
            <button
              key={interval}
              onClick={() => setBilling(interval)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${billing === interval ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              {interval}{interval === "yearly" ? " · save 17%" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {productPlans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const amount = billing === "monthly" ? plan.monthly : plan.yearly;
          const isSelected = searchParams.get("plan") === plan.id;
          return (
            <Card key={plan.id} className={isCurrent || isSelected ? "border-primary" : ""}>
              <CardHeader>
                {isCurrent && <span className="mb-2 w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Your Plan</span>}
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${amount}</span>
                  {plan.id !== "free" && <span className="text-muted-foreground">/{billing === "monthly" ? "month" : "year"}</span>}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button className="w-full" variant="outline" onClick={currentPlan === "free" ? undefined : openPortal} disabled={currentPlan === "free" || loadingPlan !== null}>
                    {loadingPlan === currentPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : currentPlan === "free" ? "Current Plan" : "Manage subscription"}
                  </Button>
                ) : plan.id === "free" ? (
                  <Button className="w-full" variant="outline" onClick={openPortal} disabled={currentPlan === "free" || loadingPlan !== null}>Manage downgrade</Button>
                ) : (
                  <Button className="w-full" onClick={() => startCheckout(plan.id)} disabled={loadingPlan !== null}>
                    {loadingPlan === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Plans;
