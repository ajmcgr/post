import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const generatedPostsPath = resolve("src/data/generatedBlogPosts.json");
const editorialPostsPath = resolve("src/data/blog.ts");
const supabaseUrl = "https://qfqowhetrxritoyjzzcz.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const publisherSecret = process.env.BLOG_PUBLISHER_SECRET;

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
  if (!supabaseAnonKey || !publisherSecret) {
    fail("Missing SUPABASE_ANON_KEY or BLOG_PUBLISHER_SECRET for the blog publisher.");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-blog-article`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "x-blog-publisher-secret": publisherSecret,
    },
    body: JSON.stringify({ existingTitles }),
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.article) {
    fail(result?.error || `Blog generation request failed with status ${response.status}`);
  }
  return result.article;
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
