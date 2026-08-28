import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { PlanId } from "@/data/plans";

export interface SubscriptionState {
  plan: PlanId;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

const FREE_SUBSCRIPTION: SubscriptionState = {
  plan: "free",
  status: "free",
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionState>(FREE_SUBSCRIPTION);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setSubscription(FREE_SUBSCRIPTION);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan,status,current_period_end,cancel_at_period_end")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data && ["active", "trialing", "past_due"].includes(data.status)) {
      setSubscription({
        plan: data.plan as PlanId,
        status: data.status,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: Boolean(data.cancel_at_period_end),
      });
    } else {
      setSubscription(FREE_SUBSCRIPTION);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...subscription, loading, refresh };
};
