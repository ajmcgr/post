import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CalendarClock, CheckCircle2, Layers3, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { findSchedulerPage, relatedSchedulerPages } from "@/data/schedulerPages";
import { trackEvent } from "@/lib/analytics";
import NotFound from "@/pages/NotFound";

const SITE = "https://trypost.ai";

const SchedulerLanding = () => {
  const { platform, format } = useParams();
  const page = findSchedulerPage(platform, format);

  useEffect(() => {
    if (!page) return;
    const referrerHost = document.referrer ? new URL(document.referrer).hostname : "direct";
    trackEvent("seo_landing_viewed", {
      page_type: "platform_format_scheduler",
      platform: page.platform.slug,
      format: page.slug,
      referrer_host: referrerHost,
    });
  }, [page]);

  if (!page) return <NotFound />;

  const related = relatedSchedulerPages(page);
  const signupPath = `/signup?source=seo&pagetype=platform_format_scheduler&platform=${page.platform.slug}&format=${page.slug}`;
  const isInbox = page.platform.publicationMode === "inbox";
  const workflow = [
    { title: `Connect your ${page.platform.accountLabel}`, body: `Authorize Post from the Connections page so the destination remains tied to your account.` },
    { title: `Prepare the ${page.name}`, body: page.mediaRule },
    { title: "Choose a time or queue slot", body: "Publish immediately, select an exact date and time, or use a recurring queue slot." },
    { title: isInbox ? "Finish inside TikTok" : `Let Post publish to ${page.platform.name}`, body: isInbox ? "Post delivers the video to your TikTok inbox at the selected time; complete the final edit and publish step there." : `Post sends the prepared post to your connected ${page.platform.accountLabel} at the scheduled time.` },
  ];

  const handleCta = (placement: string) => {
    trackEvent("seo_landing_cta_clicked", {
      page_type: "platform_format_scheduler",
      platform: page.platform.slug,
      format: page.slug,
      placement,
    });
  };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: page.h1,
        url: `${SITE}${page.path}`,
        description: page.description,
        isPartOf: { "@type": "WebSite", name: "Post", url: SITE },
      },
      {
        "@type": "SoftwareApplication",
        name: "Post",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE,
        featureList: [page.supportStatement, "Draft saving", "Exact-time scheduling", "Recurring publishing queues"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD", url: `${SITE}/pricing` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Scheduling guides", item: `${SITE}/schedule` },
          { "@type": "ListItem", position: 3, name: `${page.platform.name} ${page.name}`, item: `${SITE}${page.path}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>{page.title}</title>
        <meta name="description" content={page.description} />
        <link rel="canonical" href={`${SITE}${page.path}`} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE}${page.path}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <Header showSignup />
      <main className="flex-1">
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/schedule" className="hover:text-foreground">Scheduling guides</Link><span aria-hidden="true">/</span><span>{page.platform.name}</span>
            </nav>
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{page.platform.name} · {page.name}</p>
              <h1 className="mt-4 font-reckless text-5xl font-medium leading-[0.98] tracking-[-0.04em] sm:text-6xl">{page.h1}</h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">{page.intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={signupPath} onClick={() => handleCta("hero")}><Button size="lg" className="rounded-full px-6">Start scheduling free <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                <Link to="/pricing"><Button size="lg" variant="outline" className="rounded-full px-6">See pricing</Button></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5"><CalendarClock className="h-5 w-5 text-primary" /><p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Timing</p><p className="mt-1 font-semibold">Exact time or queue</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><Send className="h-5 w-5 text-primary" /><p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Delivery</p><p className="mt-1 font-semibold">{page.platform.publicationLabel}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><Layers3 className="h-5 w-5 text-primary" /><p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Caption limit</p><p className="mt-1 font-semibold">Up to {page.platform.captionLimit.toLocaleString()} characters</p></div>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-12 px-6 py-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Supported workflow</p>
            <h2 className="mt-3 font-reckless text-4xl font-medium tracking-[-0.03em]">What Post does for this format</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{page.supportStatement}</p>
            <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-6">
              <p className="font-semibold">Know the boundary before you schedule</p>
              <p className="mt-2 leading-relaxed text-muted-foreground">{page.mediaRule}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Good fit for</p>
            <ul className="mt-5 space-y-4">
              {page.useCases.map((item) => <li key={item} className="flex gap-3 leading-relaxed"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span>{item}</span></li>)}
            </ul>
          </div>
        </section>

        <section className="border-y border-border bg-zinc-950 text-white">
          <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">From connection to publication</p>
            <h2 className="mt-3 max-w-2xl font-reckless text-4xl font-medium tracking-[-0.03em]">How to schedule {page.platform.name} {page.name}</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-2">
              {workflow.map((step, index) => (
                <li key={step.title} className="border-t border-white/15 pt-5">
                  <span className="text-xs font-semibold text-white/40">0{index + 1}</span>
                  <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-white/65">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-20 md:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Pre-publish checklist</p>
            <h2 className="mt-3 font-reckless text-4xl font-medium tracking-[-0.03em]">Prepare the post, not just the slot.</h2>
          </div>
          <ul className="space-y-5">
            {page.checklist.map((item, index) => (
              <li key={item} className="flex gap-4 border-b border-border pb-5"><span className="font-reckless text-2xl text-muted-foreground">{index + 1}</span><span className="pt-1 leading-relaxed">{item}</span></li>
            ))}
          </ul>
        </section>

        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Questions</p>
            <h2 className="mt-3 font-reckless text-4xl font-medium tracking-[-0.03em]">{page.platform.name} {page.name} FAQ</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {page.faqs.map((faq) => (
                <article key={faq.question} className="rounded-2xl border border-border bg-background p-6">
                  <h3 className="font-semibold leading-snug">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <div className="flex flex-col justify-between gap-8 rounded-[2rem] bg-primary p-8 text-primary-foreground sm:p-12 md:flex-row md:items-end">
            <div className="max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/65">Build the workflow</p><h2 className="mt-3 font-reckless text-4xl font-medium tracking-[-0.03em]">Put your next {page.platform.name} post on the calendar.</h2><p className="mt-4 leading-relaxed text-primary-foreground/80">Start free, connect the account you own, and keep drafts, scheduled posts, and publishing status in one place.</p></div>
            <Link to={signupPath} onClick={() => handleCta("bottom")} className="shrink-0"><Button size="lg" variant="secondary" className="rounded-full px-6">Create your first post <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>

          <div className="mt-14">
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Keep planning</p><h2 className="mt-2 font-reckless text-3xl font-medium">Related supported workflows</h2></div><Link to="/schedule" className="text-sm font-semibold text-primary hover:underline">View all</Link></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => <Link key={item.path} to={item.path} className="group rounded-2xl border border-border p-5 transition hover:border-foreground/30"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{item.platform.name}</p><h3 className="mt-2 font-semibold">{item.name}</h3><span className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground">View guide <ArrowRight className="h-3.5 w-3.5" /></span></Link>)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SchedulerLanding;

