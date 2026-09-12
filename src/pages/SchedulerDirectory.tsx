import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CalendarClock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { schedulerPlatforms, schedulerPages } from "@/data/schedulerPages";
import { trackEvent } from "@/lib/analytics";

const SITE = "https://trypost.ai";

const SchedulerDirectory = () => {
  useEffect(() => {
    trackEvent("seo_directory_viewed", { page_type: "scheduler_directory" });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>Social Media Scheduling Guides by Platform | Post</title>
        <meta name="description" content="Explore Post scheduling workflows for the text, image, and video formats currently supported across seven social platforms." />
        <link rel="canonical" href={`${SITE}/schedule`} />
        <meta property="og:title" content="Social Media Scheduling Guides by Platform | Post" />
        <meta property="og:description" content="Supported scheduling workflows for text, image, and video posts across seven social platforms." />
        <meta property="og:url" content={`${SITE}/schedule`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Post social media scheduling guides",
            url: `${SITE}/schedule`,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: schedulerPages.map((page, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: page.h1,
                url: `${SITE}${page.path}`,
              })),
            },
          })}
        </script>
      </Helmet>

      <Header showSignup />
      <main className="flex-1">
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-5xl px-6 py-20 text-center md:py-28">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarClock className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Scheduling guides</p>
            <h1 className="mx-auto mt-4 max-w-4xl font-reckless text-5xl font-medium tracking-[-0.04em] sm:text-6xl">Plan each format around what Post actually supports.</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Browse platform-specific workflows for text, image, and video publishing. Unsupported combinations are intentionally left out.
            </p>
            <Link to="/signup?source=seo&pagetype=scheduler_directory" className="mt-8 inline-block">
              <Button size="lg" className="rounded-full px-6">Start scheduling free <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <div className="mb-10 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-3">
            {["Only supported formats", "Clear publishing limits", "Direct path to the composer"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />{item}</div>
            ))}
          </div>

          <div className="space-y-14">
            {schedulerPlatforms.map((platform) => (
              <section key={platform.slug} aria-labelledby={`${platform.slug}-guides`}>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{platform.publicationLabel}</p>
                    <h2 id={`${platform.slug}-guides`} className="mt-1 font-reckless text-3xl font-medium">{platform.name} scheduling</h2>
                  </div>
                  <span className="text-sm text-muted-foreground">{platform.formats.length} supported format{platform.formats.length === 1 ? "" : "s"}</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {platform.formats.map((format) => {
                    const page = schedulerPages.find((item) => item.platform.slug === platform.slug && item.slug === format.slug)!;
                    return (
                      <Link key={page.path} to={page.path} className="group flex min-h-48 flex-col rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{format.name}</p>
                        <h3 className="mt-3 text-xl font-semibold leading-tight">{format.h1}</h3>
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{format.intro}</p>
                        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold">View workflow <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SchedulerDirectory;

