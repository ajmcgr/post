import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header showSignup />
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="font-reckless text-4xl font-medium mb-4 text-black">
            Frequently Asked Questions
          </h1>
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
          <h3 className="font-semibold text-lg pr-4 text-black">{question}</h3>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-6 pb-6">
          <p className="text-muted-foreground">{answer}</p>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default FAQ;
