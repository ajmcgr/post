import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const site = "https://trypost.ai";
const socialImage = `${site}/__l5e/assets-v1/b92e65d1-66f5-47ba-9e70-52ef5544f2c0/social-sharing-card.png`;
const dist = resolve("dist");
const template = readFileSync(resolve(dist, "index.html"), "utf8");

const staticPages = [
  ["/", "Post — Social Publishing for Founders and Creators", "Post helps founders and creators create, schedule, and publish consistently across seven social channels from one dashboard."],
  ["/pricing", "Post Pricing | Social Publishing for Founders and Creators", "Start free, then upgrade to Pro for all seven platforms, unlimited scheduling, queues, and bulk media publishing."],
  ["/faq", "Post FAQ | Social Media Scheduling", "Answers about Post, social media scheduling, supported platforms, pricing, and publishing workflows."],
  ["/about", "About Post | Social Publishing for Founders and Creators", "Meet Post, the focused social publishing tool built for founders and creators who want a consistent posting rhythm."],
  ["/ai-info", "What Is Post? Product, Use Cases & Pricing", "Post is social media scheduling and cross-posting software for founders, creators, and small brands."],
  ["/resources", "Social Media Scheduling Resources | Post", "Guides and frameworks for planning, batching, scheduling, and publishing social media content consistently."],
  ["/blog", "Social Media Scheduling Blog | Post", "Practical guides for creators and founders who want to plan, schedule, and publish better social content."],
  ["/tools", "Free Social Media Tools | Post", "Free tools for planning content, generating captions, checking character limits, and improving social publishing workflows."],
  ["/platforms/instagram", "Instagram Scheduling | Post", "Schedule Instagram posts, Reels, and content alongside your other social channels from one dashboard."],
  ["/platforms/youtube", "YouTube Scheduling | Post", "Schedule YouTube videos and Shorts alongside your other social content with Post."],
  ["/platforms/tiktok", "TikTok Scheduling | Post", "Schedule TikTok videos in advance and manage your short-form publishing workflow in one place."],
  ["/platforms/twitter", "X (Twitter) Scheduling | Post", "Schedule X posts and maintain a consistent publishing queue without living in the app."],
  ["/platforms/facebook", "Facebook Scheduling | Post", "Schedule Facebook posts, photos, videos, and text content alongside your other social channels."],
  ["/platforms/threads", "Threads Scheduling | Post", "Schedule Threads posts and maintain a consistent publishing rhythm from one dashboard."],
  ["/tools/hashtag-generator", "Free Hashtag Generator | Post", "Generate relevant hashtags for your next social media post."],
  ["/tools/content-planner", "Free Content Planner | Post", "Plan a week of social media content in minutes."],
  ["/tools/influencer-rate-calculator", "Influencer Rate Calculator | Post", "Estimate a fair rate for sponsored social media posts."],
  ["/tools/bio-text-generator", "Free Bio Generator | Post", "Write a clearer social media profile bio."],
  ["/tools/caption-generator", "Free Caption Generator | Post", "Turn a social post idea into a ready-to-edit caption."],
  ["/tools/character-counter", "Social Media Character Counter | Post", "Check post length against common social platform limits."],
  ["/tools/post-idea-generator", "Free Social Post Idea Generator | Post", "Get ready-to-write social post ideas from any topic."],
  ["/tools/emoji-picker", "Emoji Picker for Social Media | Post", "Browse and copy emojis for your next social media post."],
  ["/tools/announcement-generator", "Social Media Announcement Generator | Post", "Create launch-ready announcement post variations."],
];

const blogPosts = JSON.parse(readFileSync(resolve("public/blog-index.json"), "utf8"));
const resourceSource = readFileSync(resolve("src/data/resources.ts"), "utf8");
const resourcePattern = /slug:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*excerpt:\s*"([^"]+)"/g;
const resources = Array.from(resourceSource.matchAll(resourcePattern), ([, slug, title, excerpt]) => [
  `/resources/${slug}`,
  `${title} | Post Resources`,
  excerpt,
]);

const pages = [
  ...staticPages,
  ...blogPosts.map((post) => [`/blog/${post.slug}`, `${post.title} | Post Blog`, post.excerpt, "article"]),
  ...resources,
];

const escapeAttribute = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

function setTag(html, matcher, tag) {
  return matcher.test(html) ? html.replace(matcher, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

function renderPage(path, title, description, type = "website") {
  const url = `${site}${path}`;
  let html = template.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttribute(title)}</title>`);
  html = setTag(html, /<meta name="description"[^>]*>/i, `<meta name="description" content="${escapeAttribute(description)}" />`);
  html = setTag(html, /<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${url}" />`);
  html = setTag(html, /<meta property="og:title"[^>]*>/i, `<meta property="og:title" content="${escapeAttribute(title)}" />`);
  html = setTag(html, /<meta property="og:description"[^>]*>/i, `<meta property="og:description" content="${escapeAttribute(description)}" />`);
  html = setTag(html, /<meta property="og:type"[^>]*>/i, `<meta property="og:type" content="${type}" />`);
  html = setTag(html, /<meta property="og:image"[^>]*>/i, `<meta property="og:image" content="${socialImage}" />`);
  html = setTag(html, /<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${url}" />`);
  html = setTag(html, /<meta name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${escapeAttribute(title)}" />`);
  html = setTag(html, /<meta name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${escapeAttribute(description)}" />`);
  return html;
}

for (const [path, title, description, type] of pages) {
  const output = path === "/" ? resolve(dist, "index.html") : resolve(dist, path.slice(1), "index.html");
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, renderPage(path, title, description, type));
}

console.log(`Pre-rendered metadata for ${pages.length} public routes.`);
