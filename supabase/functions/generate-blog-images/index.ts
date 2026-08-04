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

/** Brand rules that must hold for every image (keeps the set on-brand). */
const BRAND = [
  'Premium editorial artwork for a modern SaaS brand called Post.',
  'Abstract and conceptual rather than literal. No people, no robots, no brains, no clipart, no stock-photo look.',
  'Palette: deep near-black background (#0d0d0f) with electric blue (#136ed5) plus one supporting accent, subtle film grain.',
  'Generous negative space, high contrast, cinematic lighting, magazine cover quality.',
  'Absolutely no text, no words, no letters, no numbers, no logos, no watermarks, no UI screenshots.',
  '16:9 wide banner, sharp, high fidelity.',
].join(' ');

/** Variation axes — hashed per slug so every article gets a distinct look. */
const COMPOSITIONS = [
  'strong off-centre subject on the left third with deep empty space to the right',
  'centred radial composition expanding from a single point of light',
  'diagonal composition sweeping from bottom-left to top-right',
  'layered horizontal bands stacked like strata across the frame',
  'tight macro crop of a much larger structure, edges running out of frame',
  'isometric floating arrangement viewed slightly from above',
  'symmetrical mirrored composition split down the vertical centre',
  'sparse grid of small elements with one dominant anomaly',
];

const MOTIFS = [
  'flowing translucent gradient ribbons',
  'precise wireframe grid meshes bending in 3D space',
  'stacked frosted glass planes with refracted edges',
  'liquid chrome forms with soft specular highlights',
  'fine particle fields forming a soft volumetric cloud',
  'concentric arcs and orbital rings',
  'extruded geometric blocks casting long soft shadows',
  'folded paper-like planes with crisp creases',
  'topographic contour lines rippling outward',
  'long-exposure light trails through darkness',
];

const ACCENTS = [
  'cool cyan',
  'soft violet',
  'pale ice white',
  'deep indigo',
  'muted teal',
  'warm amber used sparingly as a single highlight',
];

const LIGHTING = [
  'single hard rim light from the top right',
  'soft diffused studio glow',
  'dramatic low-key lighting with deep shadow falloff',
  'backlit silhouette with a bright halo',
  'cool ambient bounce light with a faint lens bloom',
];

const TEXTURES = [
  'matte surfaces with fine grain',
  'glossy reflective surfaces',
  'frosted translucent surfaces',
  'soft velvety gradients with subtle noise',
];

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

const pick = <T,>(arr: T[], seed: number, salt: number) => arr[(seed + salt * 7919) % arr.length];

const artDirection = (slug: string) => {
  const seed = hash(slug);
  return {
    seed,
    composition: pick(COMPOSITIONS, seed, 1),
    motif: pick(MOTIFS, seed, 2),
    secondMotif: pick(MOTIFS, seed, 5),
    accent: pick(ACCENTS, seed, 3),
    lighting: pick(LIGHTING, seed, 4),
    texture: pick(TEXTURES, seed, 6),
  };
};


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
  const art = artDirection(post.slug);
  const instruction = `You write art-direction prompts for an editorial tech publication.
Read the article below and write ONE concise visual prompt (max 55 words) describing an abstract, conceptual image that captures this specific article's core idea.
The image must be visually distinct from every other article in the series, so lean hard on the assigned art direction below and invent a metaphor unique to this article's subject.
Describe shapes, motion, composition and metaphor only. Never mention text, words, logos, people, robots or brains.

Assigned art direction (must be followed):
- Composition: ${art.composition}
- Primary motif: ${art.motif}
- Secondary element: ${art.secondMotif}
- Supporting accent colour alongside electric blue: ${art.accent}
- Lighting: ${art.lighting}
- Surface treatment: ${art.texture}

Title: ${post.title}
Category: ${post.category}
Tags: ${post.tags.join(', ')}
Excerpt: ${post.excerpt}
Body: ${post.content.slice(0, 2500)}

Return only the prompt.`;

  const res = await fetch(`${GEMINI}/${TEXT_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: instruction }] }],
      generationConfig: { temperature: 1.2, topP: 0.95 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini text ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join(' ').trim();
  if (!text) throw new Error('Gemini returned no prompt text');
  return text;
}

async function generateImage(apiKey: string, prompt: string, slug: string): Promise<Uint8Array> {
  const art = artDirection(slug);
  const style = [
    BRAND,
    `Composition: ${art.composition}.`,
    `Primary motif: ${art.motif}, with ${art.secondMotif} as a secondary element.`,
    `Supporting accent colour: ${art.accent}.`,
    `Lighting: ${art.lighting}.`,
    `Surfaces: ${art.texture}.`,
    'This must not look like a generic blue gradient swoosh — commit to the composition and motif above.',
  ].join(' ');

  const res = await fetch(`${GEMINI}/${IMAGE_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${prompt}\n\n${style}` }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio: '16:9' },
        temperature: 1.15,
        seed: art.seed % 2147483647,
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
        const raw = await withRetry(`image:${post.slug}`, () => generateImage(apiKey, prompt, post.slug));
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
