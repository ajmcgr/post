import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts, formatBlogDate, type BlogPost } from "@/data/blog";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SITE = "https://trypost.ai";

const BlogArticle = () => {
  const { slug } = useParams();
  const sorted = [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const index = sorted.findIndex((r) => r.slug === slug);
  const article = index >= 0 ? sorted[index] : undefined;

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Helmet>
          <title>Article not found | Post Blog</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Header showSignup />
        <main className="max-w-3xl mx-auto px-6 py-24 w-full flex-1 text-center">
          <h1 className="font-reckless text-4xl font-medium mb-4">Article not found</h1>
          <p className="text-muted-foreground mb-8">
            That post doesn't exist or has moved.
          </p>
          <Link to="/blog">
            <Button size="sm">Browse all posts</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const prev = sorted[index + 1];
  const next = sorted[index - 1];
  const related = sorted
    .filter((p) => p.slug !== article.slug && p.category === article.category)
    .slice(0, 3);
  const relatedPosts =
    related.length > 0
      ? related
      : sorted.filter((p) => p.slug !== article.slug).slice(0, 3);

  const url = `${SITE}/blog/${article.slug}`;
  const shareText = encodeURIComponent(article.title);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{`${article.title} | Post Blog`}</title>
        <meta name="description" content={article.excerpt.slice(0, 158)} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt.slice(0, 158)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="article:published_time" content={article.publishedAt} />
        <meta property="article:modified_time" content={article.updatedAt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt.slice(0, 158)} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: article.title,
            description: article.excerpt,
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            author: { "@type": "Organization", name: article.author },
            publisher: {
              "@type": "Organization",
              name: "Works App, Inc.",
              logo: { "@type": "ImageObject", url: `${SITE}/email-logo.png` },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            keywords: article.tags.join(", "),
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
              { "@type": "ListItem", position: 3, name: article.title, item: url },
            ],
          })}
        </script>
        {article.faqs.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: article.faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            })}
          </script>
        )}
      </Helmet>

      <Header showSignup />
      <main className="max-w-3xl mx-auto px-6 py-16 w-full flex-1">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> All posts
        </Link>

        <div className="text-xs font-medium text-primary mb-3 uppercase tracking-wide">
          {article.category} · {article.readTime} ·{" "}
          <time dateTime={article.publishedAt}>{formatBlogDate(article.publishedAt)}</time>
        </div>
        <h1 className="font-reckless text-4xl md:text-5xl font-medium mb-6">{article.title}</h1>
        <p className="text-xl text-muted-foreground mb-4">{article.excerpt}</p>
        <p className="text-sm text-muted-foreground mb-10">
          By {article.author}
          {article.updatedAt !== article.publishedAt && (
            <>
              {" · Updated "}
              <time dateTime={article.updatedAt}>{formatBlogDate(article.updatedAt)}</time>
            </>
          )}
        </p>

        <article className="prose prose-lg max-w-none">{renderContent(article.content)}</article>

        {article.faqs.length > 0 && (
          <section className="mt-14">
            <h2 className="font-reckless text-2xl font-medium mb-4">Frequently asked questions</h2>
            <div className="space-y-4">
              {article.faqs.map((f) => (
                <div key={f.q} className="bg-card border-2 border-border rounded-2xl p-5">
                  <h3 className="font-medium mb-2">{f.q}</h3>
                  <p className="text-foreground/80">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">Share:</span>
          <a
            className="font-medium text-primary hover:underline"
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            X
          </a>
          <a
            className="font-medium text-primary hover:underline"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>

        <nav className="mt-10 grid sm:grid-cols-2 gap-4">
          {prev ? (
            <Link
              to={`/blog/${prev.slug}`}
              className="bg-card border-2 border-border rounded-2xl p-5 hover:border-primary transition-colors"
            >
              <span className="text-xs text-muted-foreground">Previous</span>
              <span className="block font-medium mt-1">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={`/blog/${next.slug}`}
              className="bg-card border-2 border-border rounded-2xl p-5 hover:border-primary transition-colors sm:text-right"
            >
              <span className="text-xs text-muted-foreground">Next</span>
              <span className="block font-medium mt-1">{next.title}</span>
            </Link>
          )}
        </nav>

        <section className="mt-14">
          <h2 className="font-reckless text-2xl font-medium mb-4">Related posts</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {relatedPosts.map((p: BlogPost) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="group bg-card border-2 border-border rounded-2xl p-5 hover:border-primary transition-colors"
              >
                <div className="text-xs text-primary uppercase tracking-wide mb-2">{p.category}</div>
                <span className="block font-medium group-hover:text-primary transition-colors">
                  {p.title}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-primary mt-3">
                  Read <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-16 p-8 bg-card border-2 border-border rounded-3xl text-center">
          <p className="text-lg mb-4">Schedule your next month of content in one sitting.</p>
          <Link to="/signup">
            <Button size="sm">Try Post Free</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of content.trim().split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3) });
    } else if (line.startsWith("- ")) {
      const last = blocks[blocks.length - 1];
      if (last && last.type === "ul") last.items.push(line.slice(2));
      else blocks.push({ type: "ul", items: [line.slice(2)] });
    } else if (/^\d+\.\s/.test(line)) {
      const item = line.replace(/^\d+\.\s/, "");
      const last = blocks[blocks.length - 1];
      if (last && last.type === "ol") last.items.push(item);
      else blocks.push({ type: "ol", items: [item] });
    } else {
      blocks.push({ type: "p", text: line });
    }
  }
  return blocks;
}

function renderContent(content: string) {
  return parseBlocks(content).map((block, i) => {
    if (block.type === "h2") {
      return (
        <h2 key={i} className="font-reckless text-2xl font-medium mt-10 mb-4">
          {block.text}
        </h2>
      );
    }
    if (block.type === "ul") {
      return (
        <ul key={i} className="list-disc ml-6 mb-4 space-y-1">
          {block.items.map((item, j) => (
            <li key={j} className="text-foreground/90">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
    }
    if (block.type === "ol") {
      return (
        <ol key={i} className="list-decimal ml-6 mb-4 space-y-1">
          {block.items.map((item, j) => (
            <li key={j} className="text-foreground/90">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
    }
    return (
      <p key={i} className="text-foreground/90 leading-relaxed mb-4">
        {renderInline(block.text)}
      </p>
    );
  });
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      return href.startsWith("/") ? (
        <Link key={i} to={href} className="text-primary underline underline-offset-2">
          {label}
        </Link>
      ) : (
        <a key={i} href={href} className="text-primary underline underline-offset-2" target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

export default BlogArticle;
