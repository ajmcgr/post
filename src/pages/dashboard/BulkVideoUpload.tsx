import { useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import MediaPreview from "@/components/dashboard/MediaPreview";
import BulkPlatformSelector from "@/components/dashboard/BulkPlatformSelector";
import { Loader2, FileVideo, X, Save } from "lucide-react";
import { toast } from "sonner";

interface VideoItem {
  id: string;
  url: string;
  path: string;
  media_id: string;
  mime: string;
  caption: string;
  name: string;
}

const BulkVideoUpload = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [bulkCaption, setBulkCaption] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("12:00");
  const [perDay, setPerDay] = useState(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");
    const fd = new FormData();
    fd.append("file", file);
    const resp = await fetch(
      `${(supabase as any).supabaseUrl}/functions/v1/upload-media`,
      { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` }, body: fd },
    );
    const j = await resp.json();
    if (!resp.ok) throw new Error(j.error || "Upload failed");
    return j;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const added: VideoItem[] = [];
      for (const f of Array.from(files)) {
        if (!f.type.startsWith("video/")) continue;
        const r = await upload(f);
        added.push({
          id: crypto.randomUUID(),
          url: r.url,
          path: r.path,
          media_id: r.media_id,
          mime: r.mime,
          name: f.name,
          caption: "",
        });
      }
      setVideos((v) => [...v, ...added].slice(0, 100));
      toast.success(`Added ${added.length} videos`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  };

  const remove = (id: string) => setVideos((v) => v.filter((x) => x.id !== id));

  const applyCaption = () => {
    if (!bulkCaption.trim()) return;
    setVideos((v) => v.map((x) => ({ ...x, caption: bulkCaption })));
    toast.success("Caption applied to all videos");
  };

  const persist = async (status: "scheduled" | "draft") => {
    if (!user) return;
    if (videos.length === 0) return toast.error("Upload at least one video");
    if (status === "scheduled" && selectedPlatforms.length === 0) {
      return toast.error("Select at least one connected account");
    }
    setBusy(true);
    try {
      const start = new Date(`${startDate}T${startTime}`);
      const rows = videos.map((v, i) => {
        const dayOffset = Math.floor(i / perDay);
        const slotInDay = i % perDay;
        const when = new Date(start);
        when.setDate(when.getDate() + dayOffset);
        when.setHours(when.getHours() + slotInDay * Math.floor(24 / Math.max(perDay, 1)));
        return {
          user_id: user.id,
          content: v.caption || bulkCaption,
          platforms: selectedPlatforms,
          status,
          scheduled_at: status === "scheduled" ? when.toISOString() : null,
          media: [{ media_id: v.media_id, url: v.url, path: v.path, mime: v.mime, kind: "video" }],
        };
      });
      const { error } = await supabase.from("posts").insert(rows);
      if (error) throw error;
      toast.success(`${status === "scheduled" ? "Scheduled" : "Saved"} ${rows.length} videos`);
      setVideos([]);
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        Bulk Video Scheduling <Badge variant="secondary">Beta</Badge>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <div className="space-y-6">
          <Card
            className="border-dashed border-2 p-12 text-center cursor-pointer hover:border-primary/50"
            onClick={() => input.current?.click()}
          >
            <FileVideo className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium mb-1">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground">
              Up to 100 videos (max 500MB, 3s–5min each)
            </p>
            <input
              ref={input}
              type="file"
              multiple
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </Card>

          {uploading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
            </div>
          )}

          {videos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {videos.map((v) => (
                <Card key={v.id} className="p-2 relative">
                  <MediaPreview media={{ url: v.url, kind: "video" }} variant="card" controls={false} muted />
                  <p className="text-xs truncate mt-1">{v.name}</p>
                  <button
                    onClick={() => remove(v.id)}
                    className="absolute top-1 right-1 bg-background/80 rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-lg font-semibold mb-4">Bulk Schedule Settings</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <Label>Bulk Caption</Label>
                  <span className="text-xs text-muted-foreground">{bulkCaption.length}/2200</span>
                </div>
                <Textarea
                  value={bulkCaption}
                  onChange={(e) => setBulkCaption(e.target.value)}
                  placeholder="Enter a caption to apply to all videos..."
                  maxLength={2200}
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={applyCaption} disabled={!bulkCaption.trim()} className="w-full">
                Apply Caption to All Videos
              </Button>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <BulkPlatformSelector
              selectedPlatforms={selectedPlatforms}
              onChange={setSelectedPlatforms}
            />
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label>Videos per day (1–24)</Label>
              <Input
                type="number"
                min={1}
                max={24}
                value={perDay}
                onChange={(e) => setPerDay(Math.max(1, Math.min(24, Number(e.target.value))))}
              />
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="text-lg font-semibold">Confirm & Schedule All</h3>
            <p className="text-sm text-muted-foreground">
              {videos.length === 0 ? "Upload videos to begin scheduling." : `Ready to schedule ${videos.length} videos.`}
            </p>
            <Button
              onClick={() => persist("scheduled")}
              disabled={videos.length === 0 || busy}
              className="w-full"
            >
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Schedule All {videos.length} Videos
            </Button>
            <Button
              onClick={() => persist("draft")}
              disabled={videos.length === 0 || busy}
              variant="outline"
              className="w-full gap-2"
            >
              <Save className="w-4 h-4" /> Save All {videos.length} as Drafts
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BulkVideoUpload;
