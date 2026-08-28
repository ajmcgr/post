import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import MediaPreview from '@/components/dashboard/MediaPreview';
import { getFileMediaDimensions } from '@/lib/media';
import { Loader2, Search, ChevronDown, Send, Save, Info, ImagePlus, X, Check, Calendar as CalIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
import twitterIcon from '@/assets/x.svg';
import linkedinIcon from '@/assets/linkedin.svg';
import instagramIcon from '@/assets/instagram.svg';
import facebookIcon from '@/assets/facebook.svg';
import youtubeIcon from '@/assets/youtube.svg';
import threadsIcon from '@/assets/threads.svg';
import tiktokIcon from '@/assets/tiktok.svg';
import { trackEvent } from '@/lib/analytics';
import { useSubscription } from '@/hooks/useSubscription';
import { canSchedulePost } from '@/lib/entitlements';

const platformIcons: Record<string, string> = {
  twitter: twitterIcon,
  linkedin: linkedinIcon,
  instagram: instagramIcon,
  facebook: facebookIcon,
  youtube: youtubeIcon,
  threads: threadsIcon,
  tiktok: tiktokIcon,
};

const platformNames: Record<string, string> = {
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  threads: 'Threads',
  tiktok: 'TikTok',
};

interface MediaRef {
  media_id: string;
  path: string;
  url: string;
  mime: string;
  kind: 'image' | 'video';
  width?: number;
  height?: number;
}

interface OAuthConnection {
  id: string;
  platform: string;
  platform_username: string | null;
  is_connected: boolean;
}

type Slot = { time: string; days: boolean[] };

const Composer = () => {
  const { user, loading: authLoading } = useAuth();
  const { plan } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState(location.state?.content || '');
  const [connections, setConnections] = useState<OAuthConnection[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [schedulePost, setSchedulePost] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'pick' | 'queue'>('pick');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('12:00');
  const [queueSlots, setQueueSlots] = useState<Slot[]>([]);
  const [remember, setRemember] = useState(false);
  const [media, setMedia] = useState<MediaRef[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search & filter
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: conns }, { data: queue }] = await Promise.all([
        supabase.from('oauth_connections').select('*').eq('user_id', user.id).eq('is_connected', true),
        supabase.from('queue_settings').select('slots').eq('user_id', user.id).maybeSingle(),
      ]);
      if (conns) setConnections(conns);
      if (queue?.slots) setQueueSlots(queue.slots as Slot[]);
      setLoading(false);
    })();
  }, [user]);

  const visibleConnections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return connections.filter((c) => {
      if (platformFilter.length && !platformFilter.includes(c.platform)) return false;
      if (!q) return true;
      return (
        c.platform.includes(q) || (c.platform_username?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [connections, searchQuery, platformFilter]);

  const togglePlatform = (platform: string) =>
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform],
    );

  const togglePlatformFilter = (p: string) =>
    setPlatformFilter((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const uploaded: MediaRef[] = [];
      for (const file of Array.from(files)) {
        const dimensions = await getFileMediaDimensions(file);
        const fd = new FormData();
        fd.append('file', file);
        const resp = await fetch(
          `${(supabase as any).supabaseUrl}/functions/v1/upload-media`,
          { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` }, body: fd },
        );
        const j = await resp.json();
        if (!resp.ok) throw new Error(j.error || 'Upload failed');
        uploaded.push({ ...j, ...(dimensions ?? {}) });
      }
      setMedia((m) => [...m, ...uploaded]);
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeMedia = (id: string) => setMedia((m) => m.filter((x) => x.media_id !== id));

  const nextQueueSlot = (): Date | null => {
    if (!queueSlots.length) return null;
    const now = new Date();
    for (let d = 0; d < 14; d++) {
      const day = new Date(now);
      day.setDate(now.getDate() + d);
      const dayIdx = (day.getDay() + 6) % 7; // Mon=0
      for (const slot of [...queueSlots].sort((a, b) => a.time.localeCompare(b.time))) {
        if (!slot.days[dayIdx]) continue;
        const [h, m] = slot.time.split(':').map(Number);
        const candidate = new Date(day);
        candidate.setHours(h, m, 0, 0);
        if (candidate > now) return candidate;
      }
    }
    return null;
  };

  const handlePublish = async () => {
    if (!content.trim() && media.length === 0) return toast.error('Add some content or media');
    if (selectedPlatforms.length === 0) return toast.error('Please select at least one platform');

    setPublishing(true);
    try {
      if (schedulePost) {
        if (!(await canSchedulePost(user!.id, plan))) {
          trackEvent('upgrade_prompt_viewed', { source: 'schedule_limit', plan });
          toast.error('You have reached the Free plan limit of 10 scheduled posts this month.');
          setPublishing(false);
          navigate('/dashboard/account/plans?plan=pro');
          return;
        }
        let scheduledAt: Date | null = null;
        if (scheduleMode === 'pick') {
          if (!scheduleDate) {
            toast.error('Pick a date');
            setPublishing(false);
            return;
          }
          scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
        } else {
          scheduledAt = nextQueueSlot();
          if (!scheduledAt) {
            toast.error('No available queue slot — configure your queue first.');
            setPublishing(false);
            return;
          }
        }
        const { error } = await supabase.from('posts').insert({
          user_id: user!.id,
          content,
          platforms: selectedPlatforms,
          status: 'scheduled',
          scheduled_at: scheduledAt.toISOString(),
          media: media.map(({ media_id, path, url, mime, kind, width, height }) => ({ media_id, path, url, mime, kind, width, height })),
        });
        if (error) throw error;
        trackEvent('post_scheduled', { composer: 'text', platform_count: selectedPlatforms.length, queue: scheduleMode === 'queue' });
        toast.success(`Scheduled for ${scheduledAt.toLocaleString()}`);
        navigate('/dashboard/scheduled');
        return;
      }

      const { data, error } = await supabase.functions.invoke('publish-post', {
        body: {
          content,
          platforms: selectedPlatforms,
          media: media.map(({ media_id, path, url, mime, kind, width, height }) => ({ media_id, path, url, mime, kind, width, height })),
        },
      });
      if (error) throw error;
      const results = data.results;
      const successful = results.filter((r: any) => r.success).length;
      const failed = results.filter((r: any) => !r.success).length;
      if (failed === 0) {
        trackEvent('post_published', { composer: 'text', platform_count: successful });
        navigate('/dashboard/publishing', {
          state: { postData: { content, platforms: selectedPlatforms }, successful, total: results.length },
        });
      } else if (successful > 0) {
        trackEvent('post_partially_published', { composer: 'text', successful, failed });
        toast.warning(`Published to ${successful}, ${failed} failed.`);
        setTimeout(() => navigate('/dashboard/posts'), 2000);
      } else {
        trackEvent('post_publish_failed', { composer: 'text', platform_count: selectedPlatforms.length });
        toast.error('Failed to publish to any platform.');
        setPublishing(false);
      }
    } catch (error: any) {
      trackEvent('post_submit_error', { composer: 'text' });
      console.error('Publishing error:', error);
      toast.error(error.message || 'Failed to publish.');
      setPublishing(false);
    }
  };

  const saveDraft = async () => {
    if (!user) return;
    if (!content.trim() && media.length === 0) return;
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content,
      platforms: selectedPlatforms,
      status: 'draft',
      media: media.map(({ media_id, path, url, mime, kind, width, height }) => ({ media_id, path, url, mime, kind, width, height })),
    });
    if (error) toast.error(error.message);
    else {
      trackEvent('draft_saved', { composer: 'text', platform_count: selectedPlatforms.length });
      toast.success('Saved to drafts');
      navigate('/dashboard/drafts');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Create text post</h1>

      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="text-muted-foreground gap-2">
                  <Search className="w-4 h-4" />
                  Search & Filter
                  {(searchQuery || platformFilter.length > 0) && (
                    <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {(searchQuery ? 1 : 0) + platformFilter.length}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 space-y-4">
                <div>
                  <Label className="text-xs">Search accounts</Label>
                  <Input
                    placeholder="Name or @username"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Filter by platform</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {connections.map((c) => (
                      <label key={c.platform} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={platformFilter.includes(c.platform)}
                          onCheckedChange={() => togglePlatformFilter(c.platform)}
                        />
                        <img src={platformIcons[c.platform]} className="w-4 h-4" alt="" />
                        <span>{platformNames[c.platform] || c.platform}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {(searchQuery || platformFilter.length > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSearchQuery('');
                      setPlatformFilter([]);
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={(c) => setRemember(c as boolean)} />
              <Label htmlFor="remember" className="text-sm cursor-pointer">Remember</Label>
            </div>
          </div>

          {connections.length === 0 && (
            <Card className="bg-muted/30 border-0">
              <div className="p-8 text-center space-y-4">
                <h3 className="text-xl font-semibold">No accounts connected</h3>
                <p className="text-muted-foreground">Connect your social media accounts to start creating posts</p>
                <Button onClick={() => navigate('/dashboard/connections')}>Connect Accounts</Button>
              </div>
            </Card>
          )}

          {connections.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">
                  Select accounts to post to ({selectedPlatforms.length}/{visibleConnections.length})
                </Label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs"
                    onClick={() => setSelectedPlatforms(visibleConnections.map((c) => c.platform))}>
                    Select all
                  </Button>
                  {selectedPlatforms.length > 0 && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedPlatforms([])}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {visibleConnections.map((conn) => {
                  const isSelected = selectedPlatforms.includes(conn.platform);
                  return (
                    <button
                      key={conn.id}
                      type="button"
                      onClick={() => togglePlatform(conn.platform)}
                      className={`relative group rounded-full transition-all ${
                        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-60 hover:opacity-100'
                      }`}
                      title={`${platformNames[conn.platform] || conn.platform}${conn.platform_username ? ` · @${conn.platform_username}` : ''}`}
                    >
                      <div className="relative w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                        <img src={platformIcons[conn.platform]} alt={conn.platform} className="w-6 h-6" />
                      </div>
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center border-2 border-background">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
                {visibleConnections.length === 0 && (
                  <p className="text-sm text-muted-foreground">No accounts match filters</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium">Main Caption</Label>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="relative">
              <Textarea
                placeholder="Start writing your post here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] resize-none text-base"
                maxLength={2200}
              />
              <div className="absolute bottom-3 right-3 text-sm text-muted-foreground">
                {content.length}/2200
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Media (images / video)</Label>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                {uploading ? 'Uploading…' : 'Add media'}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </div>
            {media.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {media.map((m) => (
                  <div key={m.media_id} className="relative rounded-md">
                    <MediaPreview media={m} alt="Uploaded media" controls={false} muted variant="thumb" />
                    <button type="button" onClick={() => removeMedia(m.media_id)} className="absolute top-1 right-1 bg-background/80 rounded-full p-1" aria-label="Remove media">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 space-y-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="schedule" className="font-medium cursor-pointer">Schedule post</Label>
              <Switch id="schedule" checked={schedulePost} onCheckedChange={setSchedulePost} />
            </div>

            {schedulePost && (
              <>
                <div className="grid grid-cols-2 gap-1 bg-muted rounded-md p-1">
                  <button
                    onClick={() => setScheduleMode('pick')}
                    className={`text-sm py-1.5 rounded ${scheduleMode === 'pick' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}
                  >
                    Pick a time
                  </button>
                  <button
                    onClick={() => setScheduleMode('queue')}
                    className={`text-sm py-1.5 rounded ${scheduleMode === 'queue' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}
                  >
                    Add to queue
                  </button>
                </div>

                {scheduleMode === 'pick' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <CalIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <div className="relative">
                        <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Quick set:</span>
                      {['11:00', '15:00', '19:00'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setScheduleTime(t)}
                          className="border rounded px-2 py-1 hover:bg-muted text-foreground"
                        >
                          {t === '11:00' ? '11:00 AM' : t === '15:00' ? '3:00 PM' : '7:00 PM'}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {queueSlots.length === 0 ? (
                      <>
                        No queue configured.{' '}
                        <button className="text-primary underline" onClick={() => navigate('/dashboard/queue')}>
                          Set up queue
                        </button>
                      </>
                    ) : (
                      <>Post will be scheduled at the next available slot in your queue.</>
                    )}
                  </p>
                )}
              </>
            )}
          </Card>

          <Button
            onClick={handlePublish}
            disabled={publishing || (!content.trim() && media.length === 0) || connections.length === 0 || selectedPlatforms.length === 0}
            className="w-full gap-2 h-12"
          >
            {publishing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {schedulePost ? 'Scheduling...' : 'Publishing...'}</>
            ) : schedulePost ? (
              <><CalIcon className="w-4 h-4" /> Schedule</>
            ) : (
              <><Send className="w-4 h-4" /> Post now</>
            )}
          </Button>

          {(connections.length === 0 || selectedPlatforms.length === 0) && (
            <p className="text-sm text-muted-foreground text-center">
              {connections.length === 0 ? 'Connect an account first' : 'Select an account to post to'}
            </p>
          )}

          <Button
            variant="outline"
            className="w-full gap-2 h-12"
            disabled={!content.trim() && media.length === 0}
            onClick={saveDraft}
          >
            <Save className="w-4 h-4" /> Save to Drafts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Composer;
