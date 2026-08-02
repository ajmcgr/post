import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { blogPosts } from "../src/data/blog";

/**
 * Emits a machine-readable index of every blog post so server-side jobs
 * (the Gemini blog image generator) can read article content without
 * importing frontend code.
 */
const index = blogPosts.map((p) => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  category: p.category,
  tags: p.tags,
  publishedAt: p.publishedAt,
  content: p.content.trim().slice(0, 4000),
}));

writeFileSync(resolve("public/blog-index.json"), JSON.stringify(index, null, 2));
console.log(`blog-index.json written (${index.length} posts)`);
