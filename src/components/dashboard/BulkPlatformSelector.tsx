import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { listSocialConnections } from "@/lib/socialConnections";

const platformLabels: Record<string, string> = {
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  threads: "Threads",
  tiktok: "TikTok",
};

interface BulkPlatformSelectorProps {
  selectedPlatforms: string[];
  onChange: (platforms: string[]) => void;
}

const BulkPlatformSelector = ({ selectedPlatforms, onChange }: BulkPlatformSelectorProps) => {
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadConnections = async () => {
      try {
        const connections = await listSocialConnections();
        if (active) {
          setConnectedPlatforms(connections.filter((connection) => connection.is_connected).map((connection) => connection.platform));
        }
      } catch (error) {
        console.error("Failed to load connected platforms:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadConnections();
    return () => {
      active = false;
    };
  }, []);

  const togglePlatform = (platform: string) => {
    onChange(
      selectedPlatforms.includes(platform)
        ? selectedPlatforms.filter((item) => item !== platform)
        : [...selectedPlatforms, platform],
    );
  };

  return (
    <div className="space-y-2">
      <Label>Post to</Label>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading connected accounts…
        </div>
      ) : connectedPlatforms.length === 0 ? (
        <p className="text-sm text-muted-foreground">Connect a social account before scheduling.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {connectedPlatforms.map((platform) => {
            const selected = selectedPlatforms.includes(platform);
            return (
              <Button
                key={platform}
                type="button"
                variant={selected ? "default" : "outline"}
                size="sm"
                onClick={() => togglePlatform(platform)}
              >
                {platformLabels[platform] ?? platform}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BulkPlatformSelector;
