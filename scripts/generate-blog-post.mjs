import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const generatedPostsPath = resolve("src/data/generatedBlogPosts.json");
const editorialPostsPath = resolve("src/data/blog.ts");
const geminiApiKey = process.env.GEMINI_API_KEY;

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

const isoDate = new Date().toISOString().slice(0, 10);

function fail(message) {
  throw new Error(message);
}

function string(value, field, maxLength = 10_000) {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
    fail(`Invalid ${field}`);
  }
  return value.trim();
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    fail("Gemini returned invalid JSON");
  }
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateReadTime(content) {
  return `${Math.max(4, Math.ceil(wordCount(content) / 200))} min read`;
}

function extractEditorialSlugs(source) {
  return [...source.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((match) => match[1]);
}

function validateArticle(candidate, existingSlugs) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) fail("Gemini response must be an article object");

  const slug = string(candidate.slug, "slug", 100).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+){2,}$/.test(slug)) fail("Invalid slug format");
  if (existingSlugs.has(slug)) fail(`Duplicate slug: ${slug}`);

  const title = string(candidate.title, "title", 90);
  const excerpt = string(candidate.excerpt, "excerpt", 220);
  const category = string(candidate.category, "category", 40);
  const content = string(candidate.content, "content", 16_000);
  const words = wordCount(content);
  if (words < 700 || words > 1_500) fail(`Article must contain 700-1500 words, received ${words}`);
  if (!content.includes("## ")) fail("Article must include useful sections");

  if (!Array.isArray(candidate.tags) || candidate.tags.length < 3 || candidate.tags.length > 6) {
    fail("Article must include 3-6 tags");
  }
  const tags = candidate.tags.map((tag) => string(tag, "tag", 32).toLowerCase());

  if (!Array.isArray(candidate.faqs) || candidate.faqs.length !== 3) fail("Article must include exactly three FAQs");
  const faqs = candidate.faqs.map((faq) => ({
    q: string(faq?.q, "FAQ question", 180),
    a: string(faq?.a, "FAQ answer", 500),
  }));

  const lowerContent = `${title} ${excerpt} ${content}`.toLowerCase();
  const prohibitedClaims = ["guarantee", "guaranteed", "secret key", "api key", "medical advice", "legal advice"];
  if (prohibitedClaims.some((claim) => lowerContent.includes(claim))) fail("Article contains a prohibited claim");

  return {
    slug,
    title,
    excerpt,
    readTime: estimateReadTime(content),
    category,
    publishedAt: isoDate,
    updatedAt: isoDate,
    author: "The Post Team",
    tags,
    content,
    faqs,
  };
}

async function generateArticle(existingTitles) {
  if (!geminiApiKey) fail("Missing GEMINI_API_KEY. Add it as a GitHub Actions secret before running this workflow.");

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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
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

  if (!response.ok) fail(`Gemini request failed with status ${response.status}`);
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) fail("Gemini returned no article content");
  return parseJson(text);
}

const [existingGenerated, editorialSource] = await Promise.all([
  readFile(generatedPostsPath, "utf8").then(parseJson),
  readFile(editorialPostsPath, "utf8"),
]);

if (!Array.isArray(existingGenerated)) fail("generatedBlogPosts.json must contain an array");

const existingSlugs = new Set([
  ...extractEditorialSlugs(editorialSource),
  ...existingGenerated.map((post) => post?.slug).filter((slug) => typeof slug === "string"),
]);
const existingTitles = existingGenerated
  .map((post) => post?.title)
  .filter((title) => typeof title === "string")
  .concat([...editorialSource.matchAll(/title:\s*"([^"]+)"/g)].map((match) => match[1]));

const candidate = await generateArticle(existingTitles);
const article = validateArticle(candidate, existingSlugs);

await writeFile(generatedPostsPath, `${JSON.stringify([article, ...existingGenerated], null, 2)}\n`);
console.log(`Generated /blog/${article.slug}`);
