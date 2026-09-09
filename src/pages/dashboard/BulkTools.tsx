import { Layers, Video, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import facebookIcon from "@/assets/facebook.svg";
import instagramIcon from "@/assets/instagram.svg";
import linkedinIcon from "@/assets/linkedin.svg";
import pinterestIcon from "@/assets/post-icon.png";
import tiktokIcon from "@/assets/tiktok.svg";
import twitterIcon from "@/assets/x.svg";
import threadsIcon from "@/assets/threads.svg";
import youtubeIcon from "@/assets/youtube.svg";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

const BulkTools = () => {
  const { plan, loading } = useSubscription();
  const socialIcons = [
    facebookIcon,
    instagramIcon,
    linkedinIcon,
    pinterestIcon,
    tiktokIcon,
    twitterIcon,
    threadsIcon,
    youtubeIcon,
  ];

  if (loading) return null;

  if (plan === "free") {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="mx-auto max-w-xl p-8 text-center">
          <h1 className="text-3xl font-bold">Bulk publishing is available on Pro</h1>
          <p className="mt-3 text-muted-foreground">Upgrade to create and schedule image or video posts in batches.</p>
          <Button asChild className="mt-6"><Link to="/dashboard/account/plans?plan=pro">View Pro plan</Link></Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bulk post</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        <Link to="/dashboard/bulk/image">
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center gap-3 mb-4 text-muted-foreground">
                <Layers className="w-12 h-12" />
                <ImageIcon className="w-12 h-12" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                Bulk Image Upload
                <Badge variant="secondary" className="text-xs">NEW</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="mb-4">
                Upload folders of images and schedule them as posts.
              </CardDescription>
              <div className="flex justify-center gap-3 flex-wrap">
                {socialIcons.map((icon, index) => (
                  <img key={index} src={icon} alt="" className="w-6 h-6 opacity-40" />
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/bulk/video">
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center gap-3 mb-4 text-muted-foreground">
                <Layers className="w-12 h-12" />
                <Video className="w-12 h-12" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                Bulk Video Upload
                <Badge variant="secondary" className="text-xs">NEW</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="mb-4">
                Upload and schedule multiple videos at once.
              </CardDescription>
              <div className="flex justify-center gap-3 flex-wrap">
                {socialIcons.map((icon, index) => (
                  <img key={index} src={icon} alt="" className="w-6 h-6 opacity-40" />
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default BulkTools;
