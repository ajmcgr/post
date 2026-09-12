import { useEffect } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProUpgradePromptProps {
  feature: string;
  description: string;
  source: string;
}

const ProUpgradePrompt = ({ feature, description, source }: ProUpgradePromptProps) => {
  useEffect(() => {
    trackEvent("monetization_surface_viewed", {
      surface: "pro_feature_gate",
      source,
      feature,
      plan: "free",
    });
  }, [feature, source]);

  const handleUpgradeClick = () => {
    trackEvent("monetization_surface_clicked", {
      surface: "pro_feature_gate",
      source,
      feature,
      plan: "pro",
    });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <Card className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-2xl font-bold">{feature} is available on Pro</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
        <p className="mt-4 text-sm font-medium">Start a 14-day Pro trial, then $19/month.</p>
        <Button asChild className="mt-6">
          <Link to={`/dashboard/account/plans?plan=pro&source=${encodeURIComponent(source)}`} onClick={handleUpgradeClick}>
            Start 14-day Pro trial
          </Link>
        </Button>
      </Card>
    </div>
  );
};

export default ProUpgradePrompt;
