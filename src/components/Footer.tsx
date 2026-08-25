import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-6 gap-8">
          <div>
            <h4 className="font-medium text-sm mb-4">About</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
              <li><Link to="/ai-info" className="text-muted-foreground hover:text-foreground">AI Info</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:support@trypost.ai" className="text-muted-foreground hover:text-foreground">Support</a></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-4">Platforms</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/platforms/instagram" className="text-muted-foreground hover:text-foreground">Instagram</Link></li>
              <li><Link to="/platforms/youtube" className="text-muted-foreground hover:text-foreground">YouTube</Link></li>
              <li><Link to="/platforms/tiktok" className="text-muted-foreground hover:text-foreground">TikTok</Link></li>
              <li><Link to="/platforms/twitter" className="text-muted-foreground hover:text-foreground">X (Twitter)</Link></li>
              <li><Link to="/platforms/facebook" className="text-muted-foreground hover:text-foreground">Facebook</Link></li>
              <li><Link to="/platforms/whatsapp" className="text-muted-foreground hover:text-foreground">WhatsApp</Link></li>
              <li><Link to="/platforms/telegram" className="text-muted-foreground hover:text-foreground">Telegram</Link></li>
              <li><Link to="/platforms/threads" className="text-muted-foreground hover:text-foreground">Threads</Link></li>
              <li><Link to="/platforms/snapchat" className="text-muted-foreground hover:text-foreground">Snapchat</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/resources/best-times-to-post-on-social-media" className="text-muted-foreground hover:text-foreground">Best Times to Post</Link></li>
              <li><Link to="/resources/content-calendar-template" className="text-muted-foreground hover:text-foreground">Content Calendar</Link></li>
              <li><Link to="/resources/instagram-algorithm-2026" className="text-muted-foreground hover:text-foreground">Instagram Algorithm</Link></li>
              <li><Link to="/resources/repurpose-one-video-into-ten-posts" className="text-muted-foreground hover:text-foreground">Repurpose Video</Link></li>
              <li><Link to="/resources/writing-hooks-that-stop-the-scroll" className="text-muted-foreground hover:text-foreground">Writing Hooks</Link></li>
              <li><Link to="/resources/linkedin-content-strategy" className="text-muted-foreground hover:text-foreground">LinkedIn Strategy</Link></li>
              <li><Link to="/resources/tiktok-growth-playbook" className="text-muted-foreground hover:text-foreground">TikTok Growth</Link></li>
              <li><Link to="/resources/social-media-analytics-that-matter" className="text-muted-foreground hover:text-foreground">Analytics That Matter</Link></li>
              <li><Link to="/resources" className="text-foreground font-medium hover:text-primary">View All Resources →</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-4">Free Tools</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/tools/hashtag-generator" className="text-muted-foreground hover:text-foreground">Hashtag Generator</Link></li>
              <li><Link to="/tools/content-planner" className="text-muted-foreground hover:text-foreground">Content Planner</Link></li>
              <li><Link to="/tools/influencer-rate-calculator" className="text-muted-foreground hover:text-foreground">Rate Calculator</Link></li>
              <li><Link to="/tools/bio-text-generator" className="text-muted-foreground hover:text-foreground">Bio Generator</Link></li>
              <li><Link to="/tools/caption-generator" className="text-muted-foreground hover:text-foreground">Caption Generator</Link></li>
              <li><Link to="/tools/character-counter" className="text-muted-foreground hover:text-foreground">Character Counter</Link></li>
              <li><Link to="/tools/post-idea-generator" className="text-muted-foreground hover:text-foreground">Post Idea Generator</Link></li>
              <li><Link to="/tools/emoji-picker" className="text-muted-foreground hover:text-foreground">Emoji Picker</Link></li>
              <li><Link to="/tools" className="text-foreground font-medium hover:text-primary">View All Tools →</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://x.com/trypostai" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">X</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 text-center text-sm text-muted-foreground">
          Copyright © 2026 Works App, Inc. Built with 🫶🏻 by <a href="https://works.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Works</a>.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
