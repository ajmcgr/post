import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, FileText, Image, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import facebookLogo from "@/assets/facebook.svg";
import xLogo from "@/assets/x.svg";
import linkedinLogo from "@/assets/linkedin.svg";
import instagramLogo from "@/assets/instagram.svg";
import youtubeLogo from "@/assets/youtube.svg";
import threadsLogo from "@/assets/threads.svg";
import tiktokLogo from "@/assets/tiktok.svg";
import { trackEvent } from "@/lib/analytics";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [connectionCount, setConnectionCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    const [connectionsResult, postsResult] = await Promise.all([
      supabase.from("oauth_connections").select("id", { count: "exact", head: true }).eq("user_id", user?.id).eq("is_connected", true),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", user?.id),
    ]);
    setConnectionCount(connectionsResult.count ?? 0);
    setPostCount(postsResult.count ?? 0);
    setLoading(false);
  };

  const hasConnections = connectionCount > 0;
  const hasPosts = postCount > 0;

  const postTypes = [
    {
      title: "Text Post",
      icon: FileText,
      platforms: [facebookLogo, xLogo, linkedinLogo, instagramLogo, threadsLogo],
      route: "/dashboard/composer",
    },
    {
      title: "Image Post",
      icon: Image,
      platforms: [facebookLogo, xLogo, linkedinLogo, instagramLogo, threadsLogo, tiktokLogo],
      route: "/dashboard/image-composer",
    },
    {
      title: "Video Post",
      icon: Video,
      platforms: [facebookLogo, xLogo, linkedinLogo, instagramLogo, threadsLogo, tiktokLogo, youtubeLogo],
      route: "/dashboard/video-composer",
    },
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Create a new post</h1>

      {!loading && (!hasConnections || !hasPosts) && (
        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Publish your first post</p>
                <p className="mt-1 text-sm text-muted-foreground">Complete these two steps to get value from Post.</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">{hasConnections ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4" />} Connect a social platform</div>
                  <div className="flex items-center gap-2">{hasPosts ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4" />} Publish or schedule a post</div>
                </div>
              </div>
              <Button
                onClick={() => {
                  trackEvent(hasConnections ? "onboarding_create_post_clicked" : "onboarding_connect_clicked");
                  navigate(hasConnections ? "/dashboard/composer" : "/dashboard/connections");
                }}
              >
                {hasConnections ? "Create first post" : "Connect an account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {postTypes.map((type) => (
          <Card
            key={type.title}
            className="border-2 border-dashed hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => navigate(type.route)}
          >
            <CardContent className="flex flex-col items-center justify-center py-12 px-6">
              <div className="mb-4 text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors">
                <type.icon className="w-20 h-20 stroke-[1.5]" />
              </div>
              <h3 className="text-xl font-semibold mb-6">{type.title}</h3>
              <div className="flex flex-wrap gap-2 justify-center opacity-40">
                {type.platforms.map((platform, idx) => (
                  <img key={idx} src={platform} alt="" className="w-5 h-5" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
};

export default Home;
