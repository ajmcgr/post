import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts, formatBlogDate } from "@/data/blog";
import { ArrowRight, Search } from "lucide-react";
import { blogImageUrl, handleBlogImageError } from "@/lib/blogImages";

const SITE = "https://trypost.ai";

const Blog = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const sorted = useMemo(
    () => [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    []
  );

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(sorted.map((p) => p.category)))],
    [sorted]
  );

  const featured = sorted[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [sorted, query, category]);

  const isDefaultView = category === "All" && !query.trim();
  const list = isDefaultView ? filtered.slice(1) : filtered;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Social Media Scheduling Blog | Post</title>
        <meta
          name="description"
          content="Practical guides on social media scheduling, cross-posting, batching content and running a multi-platform posting workflow without burning out."
        />
        <link rel="canonical" href={`${SITE}/blog`} />
        <meta property="og:title" content="Social Media Scheduling Blog | Post" />
        <meta
          property="og:description"
          content="Practical guides on social media scheduling, cross-posting and content operations."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE}/blog`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Post Blog",
            url: `${SITE}/blog`,
            blogPost: sorted.slice(0, 10).map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: `${SITE}/blog/${p.slug}`,
              datePublished: p.publishedAt,
            })),
          })}
        </script>
      </Helmet>

      <Header showSignup />
      <main className="max-w-5xl mx-auto px-6 py-16 w-full flex-1">
        <h1 className="font-reckless text-4xl md:text-5xl font-medium mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
          Notes on social media scheduling, cross-posting and content operations.
        </p>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
          <div className="relative md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles"
              aria-label="Search articles"
              className="w-full h-11 pl-9 pr-3 rounded-xl border-2 border-border bg-card text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 h-9 rounded-full text-xs font-medium border-2 transition-colors ${
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {isDefaultView && featured && (
          <Link
            to={`/blog/${featured.slug}`}
            className="group block bg-card rounded-3xl border-2 border-border hover:border-primary transition-colors mb-8 overflow-hidden"
          >
            <img
              src={blogImageUrl(featured.slug, featured.publishedAt, "hero")}
              onError={handleBlogImageError}
              alt={featured.title}
              width={1600}
              height={900}
              className="w-full aspect-[16/9] object-cover"
            />
            <div className="p-8">
            <div className="text-xs font-medium text-primary mb-2 uppercase tracking-wide">
              Latest · {featured.category} · {featured.readTime}
            </div>
            <h2 className="font-reckless text-3xl font-medium mb-3 group-hover:text-primary transition-colors">
              {featured.title}
            </h2>
            <p className="text-muted-foreground mb-4 max-w-2xl">{featured.excerpt}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Read post <ArrowRight className="w-4 h-4" />
            </span>
            </div>
          </Link>
        )}

        {list.length === 0 ? (
          <p className="text-muted-foreground">No articles match that search.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {list.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="group bg-card rounded-2xl border-2 border-border hover:border-primary transition-colors overflow-hidden"
              >
                <img
                  src={blogImageUrl(p.slug, p.publishedAt, "card")}
                  onError={handleBlogImageError}
                  alt={p.title}
                  loading="lazy"
                  width={800}
                  height={450}
                  className="w-full aspect-[16/9] object-cover"
                />
                <div className="p-6">
                <div className="text-xs font-medium text-primary mb-2 uppercase tracking-wide">
                  {p.category} · {p.readTime} ·{" "}
                  <time dateTime={p.publishedAt}>{formatBlogDate(p.publishedAt)}</time>
                </div>
                <h2 className="font-reckless text-2xl font-medium mb-2 group-hover:text-primary transition-colors">
                  {p.title}
                </h2>
                <p className="text-muted-foreground mb-4">{p.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read post <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
