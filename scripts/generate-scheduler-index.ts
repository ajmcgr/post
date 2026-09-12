import { writeFileSync } from "fs";
import { resolve } from "path";
import { schedulerPages } from "../src/data/schedulerPages";

const supportedFormats: Record<string, string[]> = {
  x: ["text-posts", "image-posts", "video-posts"],
  facebook: ["text-posts", "image-posts", "video-posts"],
  instagram: ["image-posts", "video-posts"],
  linkedin: ["text-posts", "image-posts", "video-posts"],
  threads: ["text-posts", "image-posts", "video-posts"],
  tiktok: ["video-posts"],
  youtube: ["video-posts"],
};

const paths = new Set<string>();
const titles = new Set<string>();
const headings = new Set<string>();

for (const page of schedulerPages) {
  if (!supportedFormats[page.platform.slug]?.includes(page.slug)) {
    throw new Error(`Unsupported scheduler page: ${page.path}`);
  }
  if (paths.has(page.path) || titles.has(page.title) || headings.has(page.h1)) {
    throw new Error(`Duplicate scheduler page metadata: ${page.path}`);
  }
  if (page.title.length > 60) throw new Error(`Title exceeds 60 characters: ${page.title}`);
  if (page.description.length > 160) throw new Error(`Description exceeds 160 characters: ${page.path}`);
  if (page.useCases.length < 3 || page.checklist.length < 3 || page.faqs.length < 3) {
    throw new Error(`Thin scheduler page data: ${page.path}`);
  }
  paths.add(page.path);
  titles.add(page.title);
  headings.add(page.h1);
}

const output = schedulerPages.map((page) => ({
  path: page.path,
  title: page.title,
  description: page.description,
  h1: page.h1,
  intro: page.intro,
  name: page.name,
  slug: page.slug,
  supportStatement: page.supportStatement,
  mediaRule: page.mediaRule,
  useCases: page.useCases,
  checklist: page.checklist,
  faqs: page.faqs,
  platform: {
    slug: page.platform.slug,
    name: page.platform.name,
    captionLimit: page.platform.captionLimit,
    publicationLabel: page.platform.publicationLabel,
  },
}));

writeFileSync(resolve("public/scheduler-index.json"), `${JSON.stringify(output, null, 2)}\n`);
console.log(`scheduler-index.json written (${output.length} qualified pages)`);

