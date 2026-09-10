import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CalendarDays, Clock3, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts, formatBlogDate, type BlogPost } from "@/data/blog";
import { blogImageUrl, handleBlogImageError } from "@/lib/blogImages";

const SITE = "https://trypost.ai";

type ArticleCardProps = {
  post: BlogPost;
  featured?: boolean;
};

const ArticleCard = ({ post, featured = false }: ArticleCardProps) => (
  <Link
    to={`/blog/${post.slug}`}
    className={featured ? "group grid overflow-hidden rounded-[2rem] bg-zinc-950 text-white lg:grid-cols-[1.1fr_0.9fr]" : "group block"}
  >
    <div className={featured ? "min-h-72 overflow-hidden bg-muted lg:min-h-full" : "overflow-hidden rounded-2xl bg-muted"}>
      <img
        src={blogImageUrl(post.slug, post.publishedAt, featured ? "hero" : "card")}
        onError={handleBlogImageError}
        alt={post.title}
        loading={featured ? "eager" : "lazy"}
        width={featured ? 1600 : 800}
        height={featured ? 900 : 450}
        className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${featured ? "aspect-[16/10] lg:aspect-auto" : "aspect-[16/10]"}`}
      />
    </div>
    <div className={featured ? "flex flex-col justify-center p-8 sm:p-12 lg:p-14" : "px-1 pb-2 pt-5"}>
      <div className={`mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${featured ? "text-white/60" : "text-muted-foreground"}`}>
        <span className={featured ? "text-accent-green" : "text-primary"}>{post.category}</span>
        <span aria-hidden="true">•</span>
        <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
      </div>
      <h2 className={`font-reckless font-medium tracking-[-0.025em] ${featured ? "text-3xl leading-tight sm:text-4xl" : "text-2xl leading-[1.08]"}`}>
        {post.title}
      </h2>
      <p className={`mt-4 leading-relaxed ${featured ? "max-w-md text-white/70" : "text-sm text-muted-foreground"}`}>
        {post.excerpt}
      </p>
      <span className={`mt-7 inline-flex items-center gap-2 text-sm font-semibold ${featured ? "text-white" : "text-foreground"}`}>
        Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </div>
  </Link>
);

const Blog = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const sorted = useMemo(() => [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)), []);
  const categories = useMemo(() => ["All", ...Array.from(new Set(sorted.map((post) => post.category)))], [sorted]);
  const featured = sorted[0];
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sorted.filter((post) => {
      const matchesCategory = category === "All" || post.category === category;
      const matchesQuery = !normalizedQuery || post.title.toLowerCase().includes(normalizedQuery) || post.excerpt.toLowerCase().includes(normalizedQuery) || post.tags.some((tag) => tag.includes(normalizedQuery));
      return matchesCategory && matchesQuery;
    });
  }, [category, query, sorted]);

  const isDefaultView = category === "All" && !query.trim();
  const articles = isDefaultView ? filtered.slice(1) : filtered;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>Social Media Scheduling Blog | Post</title>
        <meta name="description" content="Practical guides on social media scheduling, cross-posting, batching content and running a multi-platform posting workflow without burning out." />
        <link rel="canonical" href={`${SITE}/blog`} />
        <meta property="og:title" content="Social Media Scheduling Blog | Post" />
        <meta property="og:description" content="Practical guides on social media scheduling, cross-posting and content operations." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE}/blog`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Post Blog",
            url: `${SITE}/blog`,
            blogPost: sorted.slice(0, 10).map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              url: `${SITE}/blog/${post.slug}`,
              datePublished: post.publishedAt,
            })),
          })}
        </script>
      </Helmet>

      <Header showSignup />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pb-12 pt-20 text-center md:pb-16 md:pt-28">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">The Post journal</p>
          <h1 className="mx-auto max-w-3xl font-reckless text-5xl font-medium tracking-[-0.04em] sm:text-6xl md:text-7xl">Better systems for showing up.</h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Practical field notes for creators and teams who want to plan less frantically and publish more consistently.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 md:pb-24">
          {isDefaultView && featured && <ArticleCard post={featured} featured />}
        </section>

        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-20">
            <aside className="lg:sticky lg:top-8 lg:h-fit">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Browse articles</p>
              <div className="relative mt-5">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search"
                  aria-label="Search articles"
                  className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-foreground"
                />
              </div>
              <div className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`shrink-0 rounded-full px-3 py-2 text-left text-sm font-medium transition lg:w-full lg:rounded-lg ${category === item ? "bg-foreground text-background" : "text-muted-foreground hover:bg-background hover:text-foreground"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </aside>

            <div>
              <div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Latest writing</p>
                  <h2 className="mt-2 font-reckless text-3xl font-medium tracking-[-0.025em]">
                    {isDefaultView ? "Fresh from Post" : `${filtered.length} article${filtered.length === 1 ? "" : "s"}`}
                  </h2>
                </div>
                {isDefaultView && <span className="hidden items-center gap-2 text-sm text-muted-foreground sm:inline-flex"><Clock3 className="h-4 w-4" /> Updated weekly</span>}
              </div>

              {articles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center">
                  <p className="font-medium">No articles match that search.</p>
                  <button type="button" onClick={() => { setQuery(""); setCategory("All"); }} className="mt-3 text-sm font-semibold text-primary hover:underline">
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2">
                  {articles.map((post) => <ArticleCard key={post.slug} post={post} />)}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="flex flex-col justify-between gap-8 rounded-[2rem] bg-primary px-8 py-10 text-primary-foreground sm:p-12 md:flex-row md:items-end">
            <div className="max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/70"><CalendarDays className="h-4 w-4" /> Build a calmer content week</div>
              <h2 className="font-reckless text-3xl font-medium tracking-[-0.025em] sm:text-4xl">Put the advice into a calendar.</h2>
              <p className="mt-4 leading-relaxed text-primary-foreground/80">Plan your next month of content in one sitting, then let Post handle the publishing schedule.</p>
            </div>
            <Link to="/tools/content-planner" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-background/90">
              Open content planner <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
