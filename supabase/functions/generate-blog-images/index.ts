import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Image } from 'https://deno.land/x/imagescript@1.2.17/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-scheduler-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GEMINI = 'https://generativelanguage.googleapis.com/v1beta/models';
const TEXT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'gemini-2.5-flash-image';
const BUCKET = 'blog-images';
const BLOG_INDEX_URL = Deno.env.get('BLOG_INDEX_URL') ?? 'https://trypost.ai/blog-index.json';

const STYLE = [
  'Premium editorial artwork for a modern SaaS brand called Post.',
  'Abstract and conceptual rather than literal. No people, no robots, no brains, no clipart, no stock-photo look.',
  'Minimal composition, generous negative space, soft gradients, high contrast, cinematic lighting.',
  'Palette: deep near-black background (#0d0d0f) with electric blue (#136ed5) and cool light-blue accents, subtle grain.',
  'Geometric shapes, layered translucent planes, precise grids and flowing gradient ribbons.',
  'Absolutely no text, no words, no letters, no numbers, no logos, no watermarks, no UI screenshots.',
  '16:9 wide banner, sharp, high fidelity, magazine cover quality.',
].join(' ');

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: string;
  content: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const storagePrefix = (post: Post) => {
  const d = new Date(post.publishedAt);
  return `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${post.slug}`;
};

async function withRetry<T>(label: string, fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.error(`${label} attempt ${i + 1}/${attempts} failed:`, err instanceof Error ? err.message : err);
      if (i < attempts - 1) await sleep(1500 * (i + 1));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function buildPrompt(apiKey: string, post: Post): Promise<string> {
  const instruction = `You write art-direction prompts for an editorial tech publication.
Read the article below and write ONE concise visual prompt (max 45 words) describing an abstract, conceptual image that captures the article's core idea.
Describe shapes, motion, composition and metaphor only. Never mention text, words, logos, people, robots or brains.

Title: ${post.title}
Category: ${post.category}
Tags: ${post.tags.join(', ')}
Excerpt: ${post.excerpt}
Body: ${post.content.slice(0, 2500)}

Return only the prompt.`;

  const res = await fetch(`${GEMINI}/${TEXT_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: instruction }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini text ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join(' ').trim();
  if (!text) throw new Error('Gemini returned no prompt text');
  return text;
}

async function generateImage(apiKey: string, prompt: string): Promise<Uint8Array> {
  const res = await fetch(`${GEMINI}/${IMAGE_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${prompt}\n\n${STYLE}` }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio: '16:9' },
      },
    }),
  });
  if (!res.ok) throw new Error(`Gemini image ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  const inline = parts.find((p: { inlineData?: { data?: string } }) => p?.inlineData?.data)?.inlineData;
  if (!inline?.data) throw new Error('Gemini returned no image data');
  return Uint8Array.from(atob(inline.data), (c) => c.charCodeAt(0));
}

const VARIANTS: Array<{ name: 'hero' | 'card' | 'og'; width: number; height: number; quality: number }> = [
  { name: 'hero', width: 1600, height: 900, quality: 82 },
  { name: 'card', width: 800, height: 450, quality: 78 },
  { name: 'og', width: 1200, height: 630, quality: 82 },
];

async function renderVariants(bytes: Uint8Array) {
  const source = await Image.decode(bytes);
  const out: Array<{ name: string; data: Uint8Array }> = [];

  for (const variant of VARIANTS) {
    const clone = source.clone();
    const scale = Math.max(variant.width / clone.width, variant.height / clone.height);
    clone.resize(Math.ceil(clone.width * scale), Math.ceil(clone.height * scale));
    clone.crop(
      Math.floor((clone.width - variant.width) / 2),
      Math.floor((clone.height - variant.height) / 2),
      variant.width,
      variant.height,
    );
    out.push({ name: variant.name, data: await clone.encodeJPEG(variant.quality) });
  }

  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  try {
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY');

    const body = await req.json().catch(() => ({}));
    const only: string[] | undefined = Array.isArray(body.slugs) ? body.slugs : undefined;
    const force: boolean = body.force === true;
    const limit: number = Number.isFinite(body.limit) ? Number(body.limit) : 5;

    const admin = createClient(supabaseUrl, serviceKey);

    const indexRes = await fetch(`${BLOG_INDEX_URL}?t=${Date.now()}`);
    if (!indexRes.ok) throw new Error(`Blog index fetch failed: ${indexRes.status}`);
    const posts: Post[] = await indexRes.json();

    const queue = posts.filter((p) => (only ? only.includes(p.slug) : true));
    const results: Array<Record<string, unknown>> = [];
    let processed = 0;

    for (const post of queue) {
      if (processed >= limit) break;
      const prefix = storagePrefix(post);

      if (!force) {
        const { data: existing } = await admin.storage.from(BUCKET).list(prefix, { limit: 10 });
        if (existing?.some((f) => f.name === 'hero.jpg')) {
          results.push({ slug: post.slug, status: 'skipped' });
          continue;
        }
      }

      processed += 1;

      try {
        const prompt = await withRetry(`prompt:${post.slug}`, () => buildPrompt(apiKey, post));
        const raw = await withRetry(`image:${post.slug}`, () => generateImage(apiKey, prompt));
        const variants = await renderVariants(raw);

        for (const variant of variants) {
          const { error } = await admin.storage
            .from(BUCKET)
            .upload(`${prefix}/${variant.name}.jpg`, variant.data, {
              contentType: 'image/jpeg',
              cacheControl: '31536000',
              upsert: true,
            });
          if (error) throw new Error(`Upload ${variant.name} failed: ${error.message}`);
        }

        results.push({ slug: post.slug, status: 'generated', prompt });
      } catch (err) {
        console.error(`blog image generation failed for ${post.slug}:`, err);
        results.push({ slug: post.slug, status: 'failed', error: err instanceof Error ? err.message : String(err) });
      }
    }

    return new Response(JSON.stringify({ total: queue.length, processed, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('generate-blog-images error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Failed' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
