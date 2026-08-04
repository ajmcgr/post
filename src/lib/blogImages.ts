import { SUPABASE_URL } from "@/lib/supabase";
import placeholder from "@/assets/blog-placeholder.jpg";

export type BlogImageVariant = "hero" | "card" | "og";

export const BLOG_IMAGE_BUCKET = "blog-images";
export const blogImagePlaceholder = placeholder;
const BLOG_IMAGE_VERSION = "2026-08-04-silhouette";

/** Deterministic storage path: blog-images/2026/08/article-slug/hero.jpg */
export const blogImagePath = (slug: string, publishedAt: string, variant: BlogImageVariant) => {
  const date = new Date(publishedAt);
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}/${month}/${slug}/${variant}.jpg`;
};

export const blogImageUrl = (slug: string, publishedAt: string, variant: BlogImageVariant) =>
  `${SUPABASE_URL}/storage/v1/object/public/${BLOG_IMAGE_BUCKET}/${blogImagePath(slug, publishedAt, variant)}?v=${BLOG_IMAGE_VERSION}`;

/** Swap to the branded placeholder if generation has not completed yet. */
export const handleBlogImageError = (event: { currentTarget: HTMLImageElement }) => {
  const img = event.currentTarget;
  if (img.dataset.fallback === "true") return;
  img.dataset.fallback = "true";
  img.src = blogImagePlaceholder;
};
