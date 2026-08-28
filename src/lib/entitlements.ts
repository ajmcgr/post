import { getPlan, type PlanId } from "@/data/plans";
import { supabase } from "@/lib/supabase";

export const canSchedulePost = async (userId: string, planId: PlanId) => {
  const limit = getPlan(planId).scheduledPostLimit;
  if (limit === null) return true;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("scheduled_at", "is", null)
    .gte("created_at", startOfMonth.toISOString());

  if (error) throw error;
  return (count ?? 0) < limit;
};
