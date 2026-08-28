import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Composer from "./pages/Composer";
import DashboardLayout from "./components/DashboardLayout";
import OAuthCallback from "./pages/oauth/OAuthCallback";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import Instagram from "./pages/platforms/Instagram";
import YouTube from "./pages/platforms/YouTube";
import TikTok from "./pages/platforms/TikTok";
import Twitter from "./pages/platforms/Twitter";
import Facebook from "./pages/platforms/Facebook";
import Threads from "./pages/platforms/Threads";
import HashtagGenerator from "./pages/tools/HashtagGenerator";
import ContentPlanner from "./pages/tools/ContentPlanner";
import InfluencerRateCalculator from "./pages/tools/InfluencerRateCalculator";
import BioTextGenerator from "./pages/tools/BioTextGenerator";
import CaptionGenerator from "./pages/tools/CaptionGenerator";
import CharacterCounter from "./pages/tools/CharacterCounter";
import PostIdeaGenerator from "./pages/tools/PostIdeaGenerator";
import EmojiPicker from "./pages/tools/EmojiPicker";
import AnnouncementGenerator from "./pages/tools/AnnouncementGenerator";
import Tools from "./pages/Tools";
import Resources from "./pages/Resources";
import ResourceArticle from "./pages/ResourceArticle";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import Calendar from "./pages/dashboard/Calendar";
import Posts from "./pages/dashboard/Posts";
import Scheduled from "./pages/dashboard/Scheduled";
import Posted from "./pages/dashboard/Posted";
import Drafts from "./pages/dashboard/Drafts";
import Studio from "./pages/dashboard/Studio";
import BulkTools from "./pages/dashboard/BulkTools";
import Connections from "./pages/dashboard/Connections";
import Teams from "./pages/dashboard/Teams";
import Invitations from "./pages/dashboard/Invitations";
import Settings from "./pages/dashboard/account/Settings";
import Plans from "./pages/dashboard/account/Plans";
import Support from "./pages/dashboard/account/Support";
import APIKeys from "./pages/dashboard/APIKeys";
import Feedback from "./pages/dashboard/Feedback";
import Consultation from "./pages/dashboard/Consultation";
import Referral from "./pages/dashboard/Referral";
import Growth from "./pages/dashboard/Growth";
import Account from "./pages/dashboard/Account";
import Workspaces from "./pages/dashboard/Workspaces";
import Publishing from "./pages/dashboard/Publishing";
import Home from "./pages/dashboard/Home";
import ImageComposer from "./pages/dashboard/ImageComposer";
import VideoComposer from "./pages/dashboard/VideoComposer";
import Queue from "./pages/dashboard/Queue";
import BulkImageUpload from "./pages/dashboard/BulkImageUpload";
import BulkVideoUpload from "./pages/dashboard/BulkVideoUpload";
import NotFound from "./pages/NotFound";
import Reserve from "./pages/Reserve";
import AIInfo from "./pages/AIInfo";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/about" element={<About />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/oauth/:platform/callback" element={<OAuthCallback />} />
      <Route path="/reserve" element={<Reserve />} />
      <Route path="/ai-info" element={<AIInfo />} />
      
      {/* Dashboard Routes with Sidebar */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Home />} />
        <Route path="composer" element={<Composer />} />
        <Route path="image-composer" element={<ImageComposer />} />
        <Route path="video-composer" element={<VideoComposer />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="posts" element={<Posts />} />
        <Route path="scheduled" element={<Scheduled />} />
        <Route path="posted" element={<Posted />} />
        <Route path="drafts" element={<Drafts />} />
        <Route path="studio" element={<Studio />} />
        <Route path="bulk-tools" element={<BulkTools />} />
        <Route path="bulk/image" element={<BulkImageUpload />} />
        <Route path="bulk/video" element={<BulkVideoUpload />} />
        <Route path="queue" element={<Queue />} />
        <Route path="connections" element={<Connections />} />
        <Route path="teams" element={<Teams />} />
        <Route path="invitations" element={<Invitations />} />
        <Route path="workspaces" element={<Workspaces />} />
        <Route path="account/settings" element={<Settings />} />
        <Route path="account/plans" element={<Plans />} />
        <Route path="account/support" element={<Support />} />
        <Route path="api-keys" element={<APIKeys />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="consultation" element={<Consultation />} />
        <Route path="referral" element={<Referral />} />
        <Route path="growth" element={<Growth />} />
        <Route path="account" element={<Account />} />
        <Route path="publishing" element={<Publishing />} />
      </Route>

      {/* Platform Pages */}
      <Route path="/platforms/instagram" element={<Instagram />} />
      <Route path="/platforms/youtube" element={<YouTube />} />
      <Route path="/platforms/tiktok" element={<TikTok />} />
      <Route path="/platforms/twitter" element={<Twitter />} />
      <Route path="/platforms/facebook" element={<Facebook />} />
      <Route path="/platforms/threads" element={<Threads />} />

      {/* Tools Pages */}
      <Route path="/tools" element={<Tools />} />
      <Route path="/tools/hashtag-generator" element={<HashtagGenerator />} />
      <Route path="/tools/content-planner" element={<ContentPlanner />} />
      <Route path="/tools/influencer-rate-calculator" element={<InfluencerRateCalculator />} />
      <Route path="/tools/bio-text-generator" element={<BioTextGenerator />} />
      <Route path="/tools/caption-generator" element={<CaptionGenerator />} />
      <Route path="/tools/character-counter" element={<CharacterCounter />} />
      <Route path="/tools/post-idea-generator" element={<PostIdeaGenerator />} />
      <Route path="/tools/emoji-picker" element={<EmojiPicker />} />
      <Route path="/tools/announcement-generator" element={<AnnouncementGenerator />} />


      {/* Resources */}
      <Route path="/resources" element={<Resources />} />
      <Route path="/resources/:slug" element={<ResourceArticle />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogArticle />} />

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
