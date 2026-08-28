import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import MediaPreview from '@/components/dashboard/MediaPreview';
import {
  compactMedia,
  getNextQueueSlot,
  getScheduledDate,
  hasPostBody,
  MediaRef,
  publishPost,
  QueueSlot,
  uploadPostMedia,
} from '@/lib/posting';
import { Calendar as CalIcon, Check, ChevronDown, Clock, FileVideo, Image as ImageIcon, Info, Loader2, Save, Search, Send, Settings, Upload, X } from 'lucide-react';
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

interface OAuthConnection {
  id: string;
  platform: string;
  platform_username: string | null;
  is_connected: boolean;
}

interface MediaComposerProps {
  kind: 'image' | 'video';
  title: string;
}

const MediaComposer = ({ kind, title }: MediaComposerProps) => {
  const { user, loading: authLoading } = useAuth();
  const { plan } = useSubscription();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [connections, setConnections] = useState<OAuthConnection[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [media, setMedia] = useState<MediaRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [schedulePost, setSchedulePost] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'pick' | 'queue'>('pick');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('12:00');
  const [queueSlots, setQueueSlots] = useState<QueueSlot[]>([]);
  const [remember, setRemember] = useState(false);

  const isVideo = kind === 'video';
  const isReady = hasPostBody(content, media);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, navigate, user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: conns }, { data: queue }] = await Promise.all([
        supabase.from('oauth_connections').select('*').eq('user_id', user.id).eq('is_connected', true),
        supabase.from('queue_settings').select('slots').eq('user_id', user.id).maybeSingle(),
      ]);
      if (conns) setConnections(conns);
      if (queue?.slots) setQueueSlots(queue.slots as QueueSlot[]);
      setLoading(false);
    })();
  }, [user]);

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => file.type.startsWith(`${kind}/`));
    if (!validFiles.length) {
      toast.error(`Please select valid ${kind} files`);
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadPostMedia(validFiles);
      setMedia((current) => [...current, ...uploaded.filter((item) => item.kind === kind)]);
      toast.success(`${validFiles.length} ${kind}${validFiles.length === 1 ? '' : 's'} uploaded`);
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(event.target.files || []));
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    handleFiles(Array.from(event.dataTransfer.files));
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const files = Array.from(event.clipboardData.items)
      .filter((item) => item.type.startsWith(`${kind}/`))
      .map((item) => item.getAsFile())
      .filter(Boolean) as File[];
    if (files.length) handleFiles(files);
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((current) =>
      current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform],
    );
  };

  const removeMedia = (index: number) => {
    setMedia((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const submitPost = async () => {
    if (!isReady) return toast.error(`Please add content or ${kind}s`);
    if (selectedPlatforms.length === 0) return toast.error('Please select at least one account');

    setSubmitting(true);
    try {
      let scheduledFor: string | undefined;
      let queue = false;

      if (schedulePost) {
        if (!(await canSchedulePost(user!.id, plan))) {
          trackEvent('upgrade_prompt_viewed', { source: 'schedule_limit', plan });
          toast.error('You have reached the Free plan limit of 10 scheduled posts this month.');
          navigate('/dashboard/account/plans?plan=pro');
          return;
        }
        if (scheduleMode === 'queue') {
          const nextSlot = getNextQueueSlot(queueSlots);
          if (!nextSlot) throw new Error('No available queue slot — configure your queue first.');
          scheduledFor = nextSlot.toISOString();
          queue = true;
        } else {
          scheduledFor = getScheduledDate(scheduleDate, scheduleTime).toISOString();
        }
      }

      const data = await publishPost({
        content,
        platforms: selectedPlatforms,
        media,
        scheduledFor,
        queue,
      });

      if (scheduledFor) {
        trackEvent('post_scheduled', { composer: kind, platform_count: selectedPlatforms.length, queue });
        toast.success(`Scheduled for ${new Date(scheduledFor).toLocaleString()}`);
        navigate(queue ? '/dashboard/queue' : '/dashboard/scheduled');
        return;
      }

      const results = data?.results ?? [];
      const failed = results.filter((result: any) => !result.success).length;
      const successful = results.length - failed;

      if (!failed) {
        trackEvent('post_published', { composer: kind, platform_count: successful });
        navigate('/dashboard/publishing', {
          state: { postData: { content, platforms: selectedPlatforms, media: compactMedia(media) }, successful, total: results.length },
        });
      } else if (successful > 0) {
        trackEvent('post_partially_published', { composer: kind, successful, failed });
        toast.warning(`Published to ${successful}, ${failed} failed.`);
        navigate('/dashboard/posts');
      } else {
        trackEvent('post_publish_failed', { composer: kind, platform_count: selectedPlatforms.length });
        toast.error(results[0]?.error || 'Failed to publish to any platform.');
      }
    } catch (error: any) {
      trackEvent('post_submit_error', { composer: kind });
      toast.error(error.message || 'Failed to submit post.');
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = async () => {
    if (!isReady) return toast.error(`Please add content or ${kind}s`);
    setSubmitting(true);
    try {
      await publishPost({ content, platforms: selectedPlatforms, media, draft: true });
      trackEvent('draft_saved', { composer: kind, platform_count: selectedPlatforms.length });
      toast.success('Saved to drafts');
      navigate('/dashboard/drafts');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save draft.');
    } finally {
      setSubmitting(false);
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
      <h1 className="text-3xl font-bold mb-6">{title}</h1>

      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" className="text-muted-foreground gap-2">
              <Search className="w-4 h-4" />
              Search & Filter
              <ChevronDown className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={(checked) => setRemember(checked as boolean)} />
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
                  Select accounts to post to ({selectedPlatforms.length}/{connections.length})
                </Label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedPlatforms(connections.map((connection) => connection.platform))}>
                    Select all
                  </Button>
                  {selectedPlatforms.length > 0 && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedPlatforms([])}>Clear</Button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {connections.map((connection) => {
                  const isSelected = selectedPlatforms.includes(connection.platform);
                  return (
                    <button
                      key={connection.id}
                      type="button"
                      onClick={() => togglePlatform(connection.platform)}
                      className={`relative group rounded-full transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-60 hover:opacity-100'}`}
                      title={`${platformNames[connection.platform] || connection.platform}${connection.platform_username ? ` · @${connection.platform_username}` : ''}`}
                    >
                      <div className="relative w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                        <img src={platformIcons[connection.platform]} alt={connection.platform} className="w-6 h-6" />
                      </div>
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center border-2 border-background">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <Card
            className="border-2 border-dashed hover:border-primary/50 transition-all cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
            onPaste={handlePaste}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="p-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                  {isVideo ? <FileVideo className="w-10 h-10 text-foreground" strokeWidth={1.5} /> : <ImageIcon className="w-10 h-10 text-foreground" strokeWidth={1.5} />}
                </div>
              </div>
              <div>
                <p className="text-lg font-medium mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">or hover and paste from clipboard</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Label className="text-sm text-muted-foreground">{isVideo ? 'Video' : 'Image(s)'}</Label>
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <Button className="gap-2" disabled={uploading} onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading…' : 'Import'}
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept={isVideo ? 'video/*' : 'image/*'} multiple className="hidden" onChange={handleFileSelect} />
          </Card>

          {media.length > 0 && (
            <div className="space-y-4">
              {media.map((item, index) => (
                <div key={`${item.path}-${index}`} className="relative group">
                  <MediaPreview media={item} alt={`Upload ${index + 1}`} variant="composer" />
                  <Button size="icon" variant="destructive" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeMedia(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium">Main Caption</Label>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="relative">
              <Textarea placeholder="Start writing your post here..." value={content} onChange={(event) => setContent(event.target.value)} className="min-h-[200px] resize-none text-base" maxLength={2200} />
              <div className="absolute bottom-3 right-3 text-sm text-muted-foreground">{content.length}/2200</div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Post configurations & tools</Label>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2"><span className="text-muted-foreground">📱</span>Platform Captions<ChevronDown className="w-4 h-4" /></Button>
              <Button variant="outline" className="gap-2"><span className="text-muted-foreground">✏️</span>Past Captions<ChevronDown className="w-4 h-4" /></Button>
              {isVideo && <Button variant="outline" className="gap-2"><Settings className="w-4 h-4 text-muted-foreground" />Processing<ChevronDown className="w-4 h-4" /></Button>}
            </div>
          </div>
        </div>

        <div className="w-80 space-y-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="schedule" className="font-medium cursor-pointer">Schedule post</Label>
              <Switch id="schedule" checked={schedulePost} onCheckedChange={setSchedulePost} />
            </div>
            {schedulePost && (
              <>
                <div className="grid grid-cols-2 gap-1 bg-muted rounded-md p-1">
                  <button onClick={() => setScheduleMode('pick')} className={`text-sm py-1.5 rounded ${scheduleMode === 'pick' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}>Pick a time</button>
                  <button onClick={() => setScheduleMode('queue')} className={`text-sm py-1.5 rounded ${scheduleMode === 'queue' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}>Add to queue</button>
                </div>
                {scheduleMode === 'pick' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative"><CalIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" /><Input type="date" value={scheduleDate} onChange={(event) => setScheduleDate(event.target.value)} className="pl-8" /></div>
                      <div className="relative"><Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" /><Input type="time" value={scheduleTime} onChange={(event) => setScheduleTime(event.target.value)} className="pl-8" /></div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Quick set:</span>
                      {['11:00', '15:00', '19:00'].map((time) => (
                        <button key={time} onClick={() => setScheduleTime(time)} className="border rounded px-2 py-1 hover:bg-muted text-foreground">
                          {time === '11:00' ? '11:00 AM' : time === '15:00' ? '3:00 PM' : '7:00 PM'}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {queueSlots.length ? 'Post will be scheduled at the next available queue slot.' : <><button className="text-primary underline" onClick={() => navigate('/dashboard/queue')}>Set up queue</button> before adding posts to it.</>}
                  </p>
                )}
              </>
            )}
          </Card>

          <Button onClick={submitPost} disabled={submitting || uploading || !isReady || connections.length === 0 || selectedPlatforms.length === 0} className="w-full gap-2 h-12">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{schedulePost ? 'Scheduling…' : 'Publishing…'}</> : schedulePost ? <><CalIcon className="w-4 h-4" />Schedule</> : <><Send className="w-4 h-4" />Post now</>}
          </Button>
          {(connections.length === 0 || selectedPlatforms.length === 0) && (
            <p className="text-sm text-muted-foreground text-center">{connections.length === 0 ? 'Connect an account first' : 'Select an account to post to'}</p>
          )}
          <Button variant="outline" className="w-full gap-2 h-12" disabled={submitting || uploading || !isReady} onClick={saveDraft}>
            <Save className="w-4 h-4" />Save to Drafts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MediaComposer;
