import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_IMAGE = 15 * 1024 * 1024; // 15 MB
const MAX_VIDEO = 200 * 1024 * 1024; // 200 MB
const SIGNED_URL_TTL = 60 * 60 * 24; // 24h

function createAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
}

function getMediaKind(mime: string) {
  const isImage = mime.startsWith('image/');
  const isVideo = mime.startsWith('video/');
  if (!isImage && !isVideo) throw new Error(`Unsupported mime type: ${mime}`);
  return isImage ? 'image' : 'video';
}

function assertFileSize(kind: 'image' | 'video', size: number) {
  const limit = kind === 'image' ? MAX_IMAGE : MAX_VIDEO;
  if (size > limit) throw new Error(`File too large (max ${Math.round(limit / 1024 / 1024)}MB)`);
}

function getExtension(fileName: string | undefined, kind: 'image' | 'video') {
  return (fileName?.split('.').pop() || (kind === 'image' ? 'jpg' : 'mp4')).toLowerCase();
}

async function signedUrl(admin: ReturnType<typeof createAdminClient>, path: string) {
  const { data, error } = await admin.storage
    .from('post-media')
    .createSignedUrl(path, SIGNED_URL_TTL);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to sign media URL: ${error?.message ?? 'No signed URL returned'}`);
  }

  return data.signedUrl;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const admin = createAdminClient();
    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      const action = body.action as string | undefined;

      if (action === 'init') {
        const mime = body.mime || 'application/octet-stream';
        const size = Number(body.size ?? 0);
        const kind = getMediaKind(mime);
        assertFileSize(kind, size);

        const id = crypto.randomUUID();
        const ext = getExtension(body.fileName, kind);
        const path = `${user.id}/${id}.${ext}`;
        const { data, error } = await admin.storage
          .from('post-media')
          .createSignedUploadUrl(path);

        if (error || !data?.token) {
          throw new Error(`Upload init failed: ${error?.message ?? 'No upload token returned'}`);
        }

        return new Response(
          JSON.stringify({
            media_id: id,
            path,
            token: data.token,
            signed_url: data.signedUrl,
            mime,
            size,
            kind,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      if (action === 'finalize') {
        const mime = body.mime || 'application/octet-stream';
        const size = Number(body.size ?? 0);
        const kind = getMediaKind(mime);
        assertFileSize(kind, size);
        if (!body.path) throw new Error('Missing media path');

        return new Response(
          JSON.stringify({
            media_id: body.media_id,
            path: body.path,
            url: await signedUrl(admin, body.path),
            mime,
            size,
            kind,
            width: body.width,
            height: body.height,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      throw new Error(`Unsupported upload action: ${action ?? 'none'}`);
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new Error('Missing file');

    const mime = file.type || 'application/octet-stream';
    const kind = getMediaKind(mime);
    assertFileSize(kind, file.size);

    const ext = getExtension(file.name, kind);
    const id = crypto.randomUUID();
    const path = `${user.id}/${id}.${ext}`;

    const { error: upErr } = await admin.storage
      .from('post-media')
      .upload(path, file, { contentType: mime, upsert: false });
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

    return new Response(
      JSON.stringify({
        media_id: id,
        path,
        url: await signedUrl(admin, path),
        mime,
        size: file.size,
        kind,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('upload-media error:', err);
    return new Response(
      JSON.stringify({ error: err.message ?? 'Upload failed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
