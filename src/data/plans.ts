export type PlanId = "free" | "pro" | "business";
export type BillingInterval = "monthly" | "yearly";

export interface ProductPlan {
  id: PlanId;
  name: string;
  monthly: number;
  yearly: number;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  socialAccountLimit: number | null;
  scheduledPostLimit: number | null;
}

export const productPlans: ProductPlan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    description: "Everything you need to publish your first campaigns.",
    features: [
      "Connect up to 2 social platforms",
      "10 scheduled posts per month",
      "Single post composer",
      "Calendar view",
      "Drafts library",
      "1 user",
    ],
    cta: "Get Started",
    highlighted: false,
    socialAccountLimit: 2,
    scheduledPostLimit: 10,
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 19,
    yearly: 190,
    description: "For creators publishing consistently across every platform.",
    features: [
      "Connect all 7 supported platforms",
      "Unlimited scheduled posts",
      "Single and bulk image/video publishing",
      "Calendar, queue and posting time slots",
      "Draft, scheduled and published post views",
      "Automatic retry for failed posts",
      "Uploads up to 1GB",
      "Failure email notifications",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    socialAccountLimit: 7,
    scheduledPostLimit: null,
  },
  {
    id: "business",
    name: "Business",
    monthly: 49,
    yearly: 490,
    description: "For teams and agencies managing multiple brands.",
    features: [
      "Everything in Pro",
      "Unlimited connected social accounts",
      "Team workspaces with role-based access",
      "Unlimited team invitations",
      "Multi-brand workspace switching",
      "10GB media storage",
      "Dedicated onboarding and support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
    socialAccountLimit: null,
    scheduledPostLimit: null,
  },
];

export const getPlan = (planId: PlanId) =>
  productPlans.find((plan) => plan.id === planId) ?? productPlans[0];
