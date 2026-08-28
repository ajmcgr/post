import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Zap, BarChart3, ChevronDown, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import postLogo from "@/assets/post-logo.png";
import postIcon from "@/assets/post-icon.png";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import heroVideo from "@/assets/hero.mp4.asset.json";
import facebookLogo from "@/assets/facebook.svg";
import xLogo from "@/assets/x.svg";
import linkedinLogo from "@/assets/linkedin.svg";
import instagramLogo from "@/assets/instagram.svg";
import youtubeLogo from "@/assets/youtube.svg";
import threadsLogo from "@/assets/threads.svg";
import tiktokLogo from "@/assets/tiktok.svg";
import { productPlans, type BillingInterval } from "@/data/plans";
import { trackEvent } from "@/lib/analytics";

function GracefulImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      // @ts-expect-error fetchpriority is valid HTML
      fetchpriority={priority ? "high" : "auto"}
      className={className}
    />
  );
}


const Index = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [billing, setBilling] = useState<BillingInterval>("monthly");

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <a href="https://trypost.ai" className="flex items-center gap-2 shrink-0">
            <img src={postLogo} alt="Post" className="h-6 sm:h-8" />
          </a>
          <nav className="hidden sm:flex flex-1 justify-center items-center gap-6 md:gap-8">
            <Link to="/pricing" className="text-sm font-medium text-foreground hover:opacity-80 transition-colors">
              Pricing
            </Link>
            <Link to="/faq" className="text-sm font-medium text-foreground hover:opacity-80 transition-colors">
              FAQ
            </Link>
            <Link to="/resources" className="text-sm font-medium text-foreground hover:opacity-80 transition-colors">
              Resources
            </Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            {user ? (
              <Link to="/dashboard">
                <Button size="sm">Go to Dashboard →</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="lg" className="text-sm">Sign Up →</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12 md:py-20 text-center">
        <h1 className="font-reckless text-4xl sm:text-5xl md:text-7xl font-medium mb-4 md:mb-6 tracking-tight text-black">
          Create Content Once.
          <br />
          <span>Schedule Everywhere.</span>
        </h1>
        <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
          Post helps creators and brands plan, queue, and publish content across all social platforms from one simple dashboard.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-3">
          <Link to="/signup">
            <Button size="lg" className="text-sm">
              Start Free Trial →
            </Button>
          </Link>
          <div className="senja-embed" data-id="eacf7a79-5b6c-4a80-9f5a-0e6dfe631ec6" data-mode="shadow" data-lazyload="false"></div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
          {["14-day free trial", "Secure payment", "Cancel any-time"].map((t) => (
            <div key={t} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" strokeWidth={3} />
              <span>{t}</span>
            </div>
          ))}
        </div>
        <div className="mt-16 max-w-6xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-black/10 bg-[#f0f0f0]">
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-4 h-9 bg-[#e8e8e8] border-b border-black/10">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="relative" onClick={togglePlay}>
            <video
              ref={videoRef}
              src={heroVideo.url}
              autoPlay
              muted
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-auto block bg-white cursor-pointer"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-background border border-border shadow-[0_4px_24px_rgba(0,0,0,0.12)] flex items-center justify-center text-foreground hover:scale-105 transition-transform focus:outline-none"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                  <rect x="8" y="5" width="3" height="14" rx="1.5" fill="currentColor" />
                  <rect x="13" y="5" width="3" height="14" rx="1.5" fill="currentColor" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 ml-1">
                  <path d="M8 6L18 12L8 18V6Z" fill="currentColor" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Supported Platforms */}
        <div className="mt-16 text-center">
          <p className="text-base text-muted-foreground mb-8">Works with all your platforms</p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-xl border border-border">
              <img src={xLogo} alt="X" className="w-5 h-5" />
              <span className="text-sm font-medium">Twitter / X</span>
            </div>
            <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-xl border border-border">
              <img src={linkedinLogo} alt="LinkedIn" className="w-5 h-5" />
              <span className="text-sm font-medium">LinkedIn</span>
            </div>
            <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-xl border border-border">
              <img src={instagramLogo} alt="Instagram" className="w-5 h-5" />
              <span className="text-sm font-medium">Instagram</span>
            </div>
            <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-xl border border-border">
              <img src={facebookLogo} alt="Facebook" className="w-5 h-5" />
              <span className="text-sm font-medium">Facebook</span>
            </div>
            <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-xl border border-border">
              <img src={youtubeLogo} alt="YouTube" className="w-5 h-5" />
              <span className="text-sm font-medium">YouTube</span>
            </div>
            <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-xl border border-border">
              <img src={threadsLogo} alt="Threads" className="w-5 h-5" />
              <span className="text-sm font-medium">Threads</span>
            </div>
            <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-xl border border-border">
              <img src={tiktokLogo} alt="TikTok" className="w-5 h-5" />
              <span className="text-sm font-medium">TikTok</span>
            </div>
          </div>
        </div>

      </section>


      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 space-y-24">
        {/* Cross-posting */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-sans text-4xl md:text-5xl font-medium mb-4 leading-tight text-black">
              Post to all platforms <span>instantly</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              Publish everywhere in 30 seconds, not 30 minutes. Manage all your personal and brand
              accounts without switching back and forth. Connect your social media accounts and publish
              your content across all platforms with a single click — no learning curve required.
            </p>
            <div className="flex gap-3">
              <Link to="/signup"><Button>Start posting <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
            </div>
          </div>
          <Card className="aspect-square rounded-3xl bg-muted/40 border-0 flex items-center justify-center p-12 relative">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              {[
                { x: 340, y: 80, logo: facebookLogo },
                { x: 360, y: 180, logo: instagramLogo },
                { x: 340, y: 280, logo: xLogo },
                { x: 270, y: 340, logo: linkedinLogo },
                { x: 160, y: 340, logo: tiktokLogo },
              ].map((n, i) => (
                <line key={i} x1="120" y1="200" x2={n.x} y2={n.y} stroke="hsl(var(--border))" strokeWidth="1.5" />
              ))}
            </svg>
            <img src={postIcon} alt="" className="absolute left-[22%] top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-card p-2 shadow-md" />
            {[
              { className: "top-[15%] right-[10%]", src: facebookLogo },
              { className: "top-[40%] right-[5%]", src: instagramLogo },
              { className: "top-[65%] right-[10%]", src: xLogo },
              { className: "bottom-[10%] right-[30%]", src: linkedinLogo },
              { className: "bottom-[10%] left-[35%]", src: tiktokLogo },
            ].map((b, i) => (
              <div key={i} className={`absolute ${b.className} w-12 h-12 rounded-full bg-card shadow-md flex items-center justify-center`}>
                <img src={b.src} alt="" className="w-6 h-6" />
              </div>
            ))}
          </Card>
        </div>

        {/* Scheduling */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Card className="aspect-square rounded-3xl bg-muted/40 border-0 p-10 flex items-center justify-center order-2 md:order-1 relative overflow-hidden">
            <div className="w-full max-w-sm bg-card rounded-2xl shadow-lg border p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium">June 2026</div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-google-red" />
                  <div className="w-2 h-2 rounded-full bg-google-blue" />
                  <div className="w-2 h-2 rounded-full bg-google-green" />
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-[10px] text-muted-foreground mb-1">
                {["S","M","T","W","T","F","S"].map((d,i) => <div key={i} className="text-center">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({length: 28}).map((_,i) => {
                  const dots = [3,7,8,12,15,16,20,24].includes(i);
                  const today = i === 15;
                  return (
                    <div key={i} className={`aspect-square rounded-md flex items-center justify-center text-[10px] ${today ? 'bg-primary text-primary-foreground font-medium' : 'bg-muted/60'}`}>
                      {dots && !today && <div className="w-1 h-1 rounded-full bg-primary" />}
                      {today && (i+1)}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="absolute top-6 right-6 bg-card rounded-xl shadow-md border px-3 py-2 flex items-center gap-2">
              <img src={xLogo} alt="" className="w-4 h-4" />
              <div className="text-xs">
                <div className="font-medium">Scheduled</div>
                <div className="text-muted-foreground text-[10px]">Tue · 9:00 AM</div>
              </div>
            </div>
            <div className="absolute bottom-6 left-6 bg-card rounded-xl shadow-md border px-3 py-2 flex items-center gap-2">
              <img src={instagramLogo} alt="" className="w-4 h-4" />
              <div className="text-xs">
                <div className="font-medium">Queued</div>
                <div className="text-muted-foreground text-[10px]">Fri · 6:30 PM</div>
              </div>
            </div>
          </Card>
          <div className="order-1 md:order-2">
            <h2 className="font-sans text-4xl md:text-5xl font-medium mb-4 leading-tight text-black">
              Schedule posts <span>effortlessly</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              Plan your content strategy ahead of time. Schedule posts across all platforms. Customize
              your posts perfectly per platform. Queue up your posts and let Post handle the rest.
            </p>
            <div className="flex gap-3">
              <Link to="/signup"><Button>Start scheduling <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
            </div>
          </div>
        </div>

        {/* Content management */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-sans text-4xl md:text-5xl font-medium mb-4 leading-tight text-black">
              Manage content <span>efficiently</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              View all your scheduled and published posts in one place. Track what's been posted, edit
              upcoming posts, and stay on top of your content strategy.
            </p>
            <div className="flex gap-3">
              <Link to="/signup"><Button>Get started <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
            </div>
          </div>
          <Card className="aspect-square rounded-3xl bg-muted/40 border-0 p-10 flex items-center justify-center relative overflow-hidden">
            <div className="w-full max-w-sm space-y-3">
              {[
                { logo: xLogo, label: "Launching today →", status: "Published", color: "text-google-green", bar: "w-full" },
                { logo: linkedinLogo, label: "Behind the build", status: "Scheduled", color: "text-google-blue", bar: "w-3/4" },
                { logo: instagramLogo, label: "Sneak peek 👀", status: "Draft", color: "text-muted-foreground", bar: "w-1/2" },
                { logo: tiktokLogo, label: "How we ship fast", status: "Queued", color: "text-google-red", bar: "w-2/3" },
              ].map((row, i) => (
                <div key={i} className="bg-card rounded-xl shadow-sm border p-3 flex items-center gap-3">
                  <img src={row.logo} alt="" className="w-6 h-6 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{row.label}</div>
                    <div className={`h-1 mt-1.5 rounded-full bg-muted overflow-hidden`}>
                      <div className={`h-full ${row.bar} bg-primary/60 rounded-full`} />
                    </div>
                  </div>
                  <div className={`text-[10px] font-medium ${row.color} shrink-0`}>{row.status}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>



      {/* How It Works */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="font-reckless text-4xl font-medium mb-4 text-black">How it works</h2>
          <p className="text-lg text-muted-foreground">Three simple steps to social media success</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 text-center rounded-3xl border-2">
            <div className="w-16 h-16 rounded-2xl bg-google-blue/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-google-blue" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-black">Connect Accounts</h3>
            <p className="text-muted-foreground">
              Link your Twitter, LinkedIn, Instagram, Facebook, and TikTok accounts in seconds.
            </p>
          </Card>
          <Card className="p-8 text-center rounded-3xl border-2">
            <div className="w-16 h-16 rounded-2xl bg-google-red/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-google-red" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-black">Schedule Posts</h3>
            <p className="text-muted-foreground">
              Create content once and schedule it across multiple platforms with one click.
            </p>
          </Card>
          <Card className="p-8 text-center rounded-3xl border-2">
            <div className="w-16 h-16 rounded-2xl bg-google-green/10 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-google-green" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-black">Stay Organized</h3>
            <p className="text-muted-foreground">
              See drafts, scheduled posts, published posts, and failures in one workflow.
            </p>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="font-reckless text-4xl font-medium mb-4 text-black">
          Simple, transparent pricing
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Choose the plan that fits your needs. All plans include a 14-day free trial.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-full mb-12">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              billing === "monthly" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              billing === "yearly" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            Yearly
            <span className="text-xs text-primary font-semibold">Save ~17%</span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {productPlans.map((plan) => {
            const isFree = plan.monthly === 0;
            const amount = billing === "monthly" ? plan.monthly : plan.yearly;
            return (
              <Card
                key={plan.name}
                className={`p-8 rounded-3xl border-2 flex flex-col text-left ${
                  plan.highlighted
                    ? "border-primary shadow-xl scale-105"
                    : "border-border"
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full w-fit mx-auto mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-black">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold">${amount}</span>
                  {!isFree && (
                    <span className="text-muted-foreground">
                      /{billing === "monthly" ? "month" : "year"}
                    </span>
                  )}
                </div>
                {!isFree && billing === "yearly" && (
                  <p className="text-sm text-primary font-medium mb-2">
                    ~17% off vs monthly
                  </p>
                )}
                <p className="text-muted-foreground mb-8">{plan.description}</p>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.id === "free" ? "/signup" : `/signup?plan=${plan.id}&billing=${billing}`}
                  onClick={() => trackEvent("pricing_cta_clicked", { plan: plan.id, billing, location: "homepage" })}
                >
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      </section>




      {/* FAQ Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-reckless text-4xl font-medium mb-4 text-black">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">Everything you need to know about Post</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          <FAQItem 
            question="How does scheduling work?"
            answer="Simply connect your social accounts, create your content, choose the date and time, and Post will automatically publish it for you. You can schedule weeks or months in advance."
          />
          <FAQItem 
            question="Which platforms are supported?"
            answer="Post supports Twitter/X, LinkedIn, Instagram, Facebook, YouTube, TikTok, and Threads."
          />
          <FAQItem 
            question="Can I schedule the same post to multiple platforms?"
            answer="Yes. Create the post once, customize the copy or media for each platform where needed, then schedule it across your selected accounts."
          />
          <FAQItem 
            question="Is there a free plan?"
            answer="Yes, the free plan includes 2 connected social platforms and 10 scheduled posts per month. Upgrade anytime for more accounts and unlimited scheduling."
          />
          <FAQItem 
            question="How far in advance can I schedule posts?"
            answer="You can schedule posts as far in advance as you'd like. Many users plan their content months ahead to maintain consistency and save time."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="font-reckless text-4xl font-medium mb-6 text-black">Ready to simplify your social media?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join 500+ marketers who plan and publish with Post.
        </p>
        <Link to="/signup">
          <Button size="lg" className="text-sm">
            Start Free Trial →
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-2 rounded-2xl overflow-hidden">
        <CollapsibleTrigger className="w-full text-left p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
          <h3 className="font-medium text-lg pr-4 text-black">{question}</h3>
          <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-6 pb-6">
          <p className="text-muted-foreground">{answer}</p>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default Index;
