// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { blogPosts } from "../src/data/blog";
import { resources } from "../src/data/resources";

const BASE_URL = "https://trypost.ai";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticPaths = [
  "/",
  "/pricing",
  "/faq",
  "/about",
  "/ai-info",
  "/resources",
  "/blog",
  "/tools",
  "/reserve",
  "/privacy",
  "/terms",
  "/tools/hashtag-generator",
  "/tools/content-planner",
  "/tools/influencer-rate-calculator",
  "/tools/bio-text-generator",
  "/tools/caption-generator",
  "/tools/character-counter",
  "/tools/post-idea-generator",
  "/tools/emoji-picker",
  "/tools/announcement-generator",
  "/platforms/instagram",
  "/platforms/youtube",
  "/platforms/tiktok",
  "/platforms/twitter",
  "/platforms/facebook",
  "/platforms/whatsapp",
  "/platforms/telegram",
  "/platforms/threads",
  "/platforms/snapchat",
];

const entries: SitemapEntry[] = [
  ...staticPaths.map((path) => ({
    path,
    changefreq: "weekly" as const,
    priority: path === "/" ? "1.0" : "0.7",
  })),
  ...blogPosts.map((p) => ({
    path: `/blog/${p.slug}`,
    lastmod: p.updatedAt,
    changefreq: "monthly" as const,
    priority: "0.6",
  })),
  ...resources.map((r) => ({
    path: `/resources/${r.slug}`,
    changefreq: "monthly" as const,
    priority: "0.6",
  })),
];

function generateSitemap(list: SitemapEntry[]) {
  const urls = list.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
