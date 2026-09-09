const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-blog-publisher-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const topics = [
  "How creators can build a two-week social media content backlog",
  "How to adapt one campaign idea across LinkedIn, Instagram, X, Threads, TikTok, and YouTube",
  "A practical weekly review for scheduled social posts and failed publishes",
  "How small teams can create a content approval process without slowing down",
  "How to use a social media content calendar without filling it with low-value posts",
  "How creators can repurpose a long-form video into a week of platform-native social posts",
  "A practical system for planning content around launches, events, and evergreen posts",
  "How to audit a social media scheduling workflow before it becomes unmanageable",
];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function getExistingTitles(body: unknown) {
  if (!body || typeof body !== "object" || !Array.isArray((body as { existingTitles?: unknown }).existingTitles)) {
    throw new Error("existingTitles must be an array");
  }

  const titles = (body as { existingTitles: unknown[] }).existingTitles;
  if (titles.length > 100 || titles.some((title) => typeof title !== "string" || title.length > 120)) {
    throw new Error("Invalid existingTitles");
  }

  return titles as string[];
}

async function generateArticle(apiKey: string, existingTitles: string[]) {
  const topic = topics[Math.floor(Date.now() / 86_400_000) % topics.length];
  const prompt = `Create one original, genuinely useful blog article for Post (trypost.ai), a social media planning, scheduling, and publishing app for creators, founders, and small teams.

Write about this topic: ${topic}

Rules:
- Write practical, direct advice; do not invent product capabilities, customer counts, statistics, platform policy changes, or guarantees.
- Do not claim Post supports a particular integration unless the article can make the advice useful without that claim.
- Use Markdown-style ## headings, short paragraphs, and actionable steps.
- Include a concise, non-pushy mention of Post only where relevant.
- Use only internal links from this set when helpful: /pricing, /tools/content-planner, /tools/caption-generator, /blog.
- Avoid duplicating or closely paraphrasing these existing articles: ${existingTitles.join(" | ")}.
- Return JSON only, with this exact shape:
{
  "slug": "lowercase-hyphenated-slug-with-at-least-three-words",
  "title": "SEO-friendly title under 90 characters",
  "excerpt": "Summary under 220 characters",
  "category": "One concise category",
  "tags": ["three", "to", "six", "lowercase", "tags"],
  "content": "700-1500 word article using ## headings",
  "faqs": [{"q":"Question?","a":"Helpful answer"},{"q":"Question?","a":"Helpful answer"},{"q":"Question?","a":"Helpful answer"}]
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
    },
  );

  if (!response.ok) throw new Error(`Gemini request failed with status ${response.status}`);
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned no article content");

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const expectedSecret = Deno.env.get("BLOG_PUBLISHER_SECRET");
  const suppliedSecret = req.headers.get("x-blog-publisher-secret");
  if (!expectedSecret || !suppliedSecret || suppliedSecret !== expectedSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json({ error: "Missing GEMINI_API_KEY" }, 500);

  try {
    const body = await req.json();
    const article = await generateArticle(apiKey, getExistingTitles(body));
    return json({ article });
  } catch (error) {
    console.error("generate-blog-article error:", error instanceof Error ? error.message : error);
    return json({ error: error instanceof Error ? error.message : "Failed to generate article" }, 400);
  }
});
