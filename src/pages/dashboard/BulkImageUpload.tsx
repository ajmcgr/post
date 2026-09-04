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
import { Loader2, FolderUp, Plus, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";

interface BulkPost {
  id: string;
  caption: string;
  images: { url: string; path: string; media_id: string; mime: string }[];
}

const BulkImageUpload = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BulkPost[]>([]);
  const [bulkCaption, setBulkCaption] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("12:00");
  const [perDay, setPerDay] = useState(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const folderInput = useRef<HTMLInputElement>(null);

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

  const handleFolderSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      // Group by parent folder (webkitRelativePath)
      const grouped: Record<string, File[]> = {};
      Array.from(files).forEach((f: any) => {
        if (!f.type.startsWith("image/")) return;
        const rel = f.webkitRelativePath || f.name;
        const parts = rel.split("/");
        const folder = parts.length > 1 ? parts[parts.length - 2] : "root";
        grouped[folder] = grouped[folder] || [];
        grouped[folder].push(f);
      });
      const newPosts: BulkPost[] = [];
      for (const [folder, group] of Object.entries(grouped)) {
        const images = [];
        for (const f of group.slice(0, 10)) {
          const r = await upload(f);
          images.push({ url: r.url, path: r.path, media_id: r.media_id, mime: r.mime });
        }
        newPosts.push({ id: crypto.randomUUID(), caption: "", images });
      }
      setPosts((p) => [...p, ...newPosts].slice(0, 90));
      toast.success(`Added ${newPosts.length} posts`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (folderInput.current) folderInput.current.value = "";
    }
  };

  const addEmptyPost = () =>
    setPosts((p) => [...p, { id: crypto.randomUUID(), caption: "", images: [] }]);

  const removePost = (id: string) => setPosts((p) => p.filter((x) => x.id !== id));

  const updateCaption = (id: string, caption: string) =>
    setPosts((p) => p.map((x) => (x.id === id ? { ...x, caption } : x)));

  const applyCaption = () => {
    if (!bulkCaption.trim()) return;
    setPosts((p) => p.map((x) => ({ ...x, caption: bulkCaption })));
    toast.success("Caption applied to all posts");
  };

  const applySchedule = async () => {
    if (!user) return;
    if (posts.length === 0) return toast.error("Add at least one post");
    if (selectedPlatforms.length === 0) return toast.error("Select at least one connected account");
    setScheduling(true);
    try {
      const start = new Date(`${startDate}T${startTime}`);
      const rows = posts.map((p, i) => {
        const dayOffset = Math.floor(i / perDay);
        const slotInDay = i % perDay;
        const when = new Date(start);
        when.setDate(when.getDate() + dayOffset);
        when.setHours(when.getHours() + slotInDay * Math.floor(24 / Math.max(perDay, 1)));
        return {
          user_id: user.id,
          content: p.caption || bulkCaption,
          platforms: selectedPlatforms,
          status: "scheduled",
          scheduled_at: when.toISOString(),
          media: p.images,
        };
      });
      const { error } = await supabase.from("posts").insert(rows);
      if (error) throw error;
      toast.success(`Scheduled ${rows.length} posts`);
      setPosts([]);
    } catch (e: any) {
      toast.error(e.message || "Failed to schedule");
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        Bulk Image Scheduling <Badge variant="secondary">Beta</Badge>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Posts ({posts.length})</h2>
            <Button onClick={addEmptyPost} className="gap-2">
              <Plus className="w-4 h-4" /> Add Post
            </Button>
          </div>

          <Card
            className="border-dashed border-2 p-12 text-center cursor-pointer hover:border-primary/50"
            onClick={() => folderInput.current?.click()}
          >
            <FolderUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium mb-1">Drag & drop folders here</p>
            <p className="text-sm text-muted-foreground mb-4">Each folder = 1 post (max 90 posts)</p>
            <div className="flex justify-center gap-3">
              <Button type="button" className="gap-2">
                <FolderUp className="w-4 h-4" /> Select Folder
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  addEmptyPost();
                }}
              >
                <Plus className="w-4 h-4" /> Empty Post
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Tip: Select a parent folder with subfolders inside to create multiple posts at once
            </p>
            <input
              ref={folderInput}
              type="file"
              multiple
              // @ts-expect-error - non-standard but supported
              webkitdirectory=""
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFolderSelect(e.target.files)}
            />
          </Card>

          {uploading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
            </div>
          )}

          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Posts you create will appear here
            </p>
          ) : (
            <div className="space-y-3">
              {posts.map((p, i) => (
                <Card key={p.id} className="p-4 flex gap-4">
                  <div className="text-sm text-muted-foreground w-6">{i + 1}</div>
                  <div className="flex gap-2 flex-wrap w-32">
                    {p.images.slice(0, 4).map((img, ix) => (
                      <MediaPreview
                        key={ix}
                        media={{ url: img.url, kind: "image" }}
                        alt=""
                        controls={false}
                        variant="thumb"
                        className="h-14 w-14"
                      />
                    ))}
                    {p.images.length === 0 && (
                      <div className="w-14 h-14 rounded bg-muted flex items-center justify-center">
                        <ImagePlus className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <Textarea
                    value={p.caption}
                    onChange={(e) => updateCaption(p.id, e.target.value)}
                    placeholder="Caption..."
                    className="flex-1 min-h-[60px]"
                  />
                  <button
                    onClick={() => removePost(p.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-lg font-semibold mb-4">Bulk Settings</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <Label>Bulk Caption</Label>
                  <span className="text-xs text-muted-foreground">{bulkCaption.length}/2200</span>
                </div>
                <Textarea
                  value={bulkCaption}
                  onChange={(e) => setBulkCaption(e.target.value)}
                  placeholder="Caption to apply to all posts..."
                  maxLength={2200}
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={applyCaption} disabled={!bulkCaption.trim()} className="w-full">
                Apply Caption to All Posts
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
              <Label>Posts per day (1–24)</Label>
              <Input
                type="number"
                min={1}
                max={24}
                value={perDay}
                onChange={(e) => setPerDay(Math.max(1, Math.min(24, Number(e.target.value))))}
              />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-semibold mb-2">Confirm & Schedule All</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {posts.length === 0 ? "Add posts to begin scheduling." : `Ready to schedule ${posts.length} posts.`}
            </p>
            <Button
              onClick={applySchedule}
              disabled={posts.length === 0 || scheduling}
              className="w-full"
            >
              {scheduling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scheduling…
                </>
              ) : (
                `Schedule All ${posts.length} Posts`
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BulkImageUpload;
