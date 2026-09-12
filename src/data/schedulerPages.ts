export type SchedulerFormatSlug = "text-posts" | "image-posts" | "video-posts";

export interface SchedulerFaq {
  question: string;
  answer: string;
}

export interface SchedulerFormatDetail {
  slug: SchedulerFormatSlug;
  name: string;
  h1: string;
  description: string;
  intro: string;
  supportStatement: string;
  mediaRule: string;
  useCases: string[];
  checklist: string[];
  faqs: SchedulerFaq[];
}

export interface SchedulerPlatform {
  slug: string;
  name: string;
  accountLabel: string;
  captionLimit: number;
  publicationMode: "direct" | "inbox";
  publicationLabel: string;
  formats: SchedulerFormatDetail[];
}

export interface SchedulerPage extends SchedulerFormatDetail {
  platform: SchedulerPlatform;
  path: string;
  title: string;
}

const platforms: SchedulerPlatform[] = [
  {
    slug: "x",
    name: "X",
    accountLabel: "X account",
    captionLimit: 280,
    publicationMode: "direct",
    publicationLabel: "Direct publishing",
    formats: [
      {
        slug: "text-posts",
        name: "text posts",
        h1: "Schedule X text posts without last-minute publishing",
        description: "Schedule X text posts, save drafts, and keep a 280-character publishing queue alongside your other social channels with Post.",
        intro: "Prepare concise updates while the idea is fresh, choose an exact time or add them to a recurring queue, and let Post publish them to your connected X account.",
        supportStatement: "Post publishes one text post to X at the scheduled time.",
        mediaRule: "Text is capped at 280 characters. Thread creation is not included in this workflow.",
        useCases: ["Founder updates prepared before a busy launch day", "Product announcements timed with a release", "Short observations added to a consistent weekly queue"],
        checklist: ["Lead with the main point instead of a long setup", "Keep the complete post within 280 characters", "Give the reader one clear idea or next action"],
        faqs: [
          { question: "Can Post schedule X text posts?", answer: "Yes. Connect an X account, write a post of up to 280 characters, and choose an exact time or recurring queue slot." },
          { question: "Does this create an X thread?", answer: "No. This workflow publishes one X post at a time and does not automatically split copy into a thread." },
          { question: "Can I save an X post as a draft first?", answer: "Yes. Drafts can be saved before you decide whether to publish now or schedule them." },
        ],
      },
      {
        slug: "image-posts",
        name: "image posts",
        h1: "Schedule X image posts from the same content calendar",
        description: "Schedule an X image post with its caption, keep it in drafts, or place it in a recurring publishing queue with Post.",
        intro: "Pair a screenshot, chart, product visual, or photo with a short X caption, then schedule both together instead of returning to upload the asset later.",
        supportStatement: "Post uploads the first attached image and publishes it with your X copy.",
        mediaRule: "This workflow publishes one image with caption copy of up to 280 characters.",
        useCases: ["Product screenshots with a concise feature explanation", "Charts that need a short takeaway at a planned time", "Event photos prepared while the context is still clear"],
        checklist: ["Use an image that remains readable on a small screen", "Make the caption add context rather than repeat the visual", "Confirm the first attached image is the one you want published"],
        faqs: [
          { question: "Can I schedule an image post to X?", answer: "Yes. Upload an image, add a caption, select your X account, and schedule the post or place it in your queue." },
          { question: "How many images does this workflow publish?", answer: "Post currently sends the first attached image for this X publishing workflow." },
          { question: "Can I reuse the same image on other networks?", answer: "Yes. Select other connected platforms that support image posts and adjust the copy where needed before publishing." },
        ],
      },
      {
        slug: "video-posts",
        name: "video posts",
        h1: "Schedule X video posts before your launch window",
        description: "Upload and schedule X video posts with a short caption, draft review, and multi-platform publishing workflow in Post.",
        intro: "Load a finished clip and its X copy ahead of time, review the draft, then publish at a chosen time without keeping the upload task on your calendar.",
        supportStatement: "Post uploads one video and publishes it to X with your caption.",
        mediaRule: "This workflow uses one uploaded video and caption copy of up to 280 characters.",
        useCases: ["Short product demos timed with a launch", "Founder clips prepared in a weekly recording batch", "Customer proof videos published with a focused takeaway"],
        checklist: ["Open with movement or the result viewers should notice", "Keep the caption short enough to complement the clip", "Preview the uploaded file before setting the schedule"],
        faqs: [
          { question: "Can Post schedule videos for X?", answer: "Yes. Upload one video, add copy within the X character limit, and choose when Post should publish it." },
          { question: "Does Post edit the video?", answer: "No. Upload a finished video that is ready to publish; Post handles the scheduling and delivery workflow." },
          { question: "Can the X video stay in drafts?", answer: "Yes. Save it as a draft and return later to publish now or schedule it." },
        ],
      },
    ],
  },
  {
    slug: "facebook",
    name: "Facebook",
    accountLabel: "Facebook Page",
    captionLimit: 63206,
    publicationMode: "direct",
    publicationLabel: "Direct publishing",
    formats: [
      {
        slug: "text-posts",
        name: "text posts",
        h1: "Schedule Facebook text posts for your Page",
        description: "Write, save, queue, and schedule Facebook Page text posts from Post while coordinating the rest of your social calendar.",
        intro: "Prepare Page updates in batches, keep unfinished ideas in drafts, and choose an exact publishing time or a repeatable queue slot for approved copy.",
        supportStatement: "Post publishes text directly to the connected Facebook Page.",
        mediaRule: "This page covers text-only Page posts. No image or video is required.",
        useCases: ["Community updates prepared for the week", "Longer announcements that need internal review", "Event reminders timed before registration closes"],
        checklist: ["Put the practical update in the opening lines", "Break longer copy into readable paragraphs", "Check links and timing before moving the post from draft"],
        faqs: [
          { question: "Can Post schedule text-only Facebook Page posts?", answer: "Yes. Connect a Facebook Page, write the update, and choose an exact time or queue slot." },
          { question: "Does this publish to a personal Facebook profile?", answer: "No. Post's Facebook connection and publishing workflow is for a connected Facebook Page." },
          { question: "Can I draft a longer Facebook announcement?", answer: "Yes. Save it as a draft, review it later, then publish or schedule when it is ready." },
        ],
      },
      {
        slug: "image-posts",
        name: "image posts",
        h1: "Schedule Facebook image posts with their captions",
        description: "Schedule a Facebook Page photo and caption together, keep drafts organized, and coordinate image posts with other channels in Post.",
        intro: "Upload the visual once, add the context it needs, and hold the complete Facebook Page post in a draft or scheduled calendar until the right moment.",
        supportStatement: "Post publishes the first attached image to the connected Facebook Page with your caption.",
        mediaRule: "This workflow sends one image. Confirm the first attached image is the final asset.",
        useCases: ["Offer graphics scheduled for a campaign window", "Behind-the-scenes photos with a prepared story", "Event images paired with registration details"],
        checklist: ["Use a final, publication-ready image", "Include the useful detail that is not visible in the graphic", "Verify the destination Page before scheduling"],
        faqs: [
          { question: "Can I schedule a Facebook photo post?", answer: "Yes. Add one image and a caption, select the connected Facebook Page, and choose when to publish." },
          { question: "Will Post publish an album?", answer: "No. This workflow publishes the first attached image as one Facebook Page photo post." },
          { question: "Can I schedule the same image elsewhere?", answer: "Yes. You can select other connected networks that support image publishing and tailor the caption for each destination." },
        ],
      },
      {
        slug: "video-posts",
        name: "video posts",
        h1: "Schedule Facebook Page videos in advance",
        description: "Upload, review, and schedule Facebook Page video posts from Post with drafts and cross-channel planning in one workflow.",
        intro: "Batch finished videos with their Facebook captions, check the preview, then place each post at the right point in your campaign calendar.",
        supportStatement: "Post uploads one video and publishes it to the selected Facebook Page.",
        mediaRule: "Upload a finished video file. Post schedules delivery but does not edit the video.",
        useCases: ["Campaign videos released on a coordinated date", "Recorded updates batched for the month", "Product walkthroughs paired with a longer Page caption"],
        checklist: ["Choose a clear opening frame", "Write a caption that explains why the video matters", "Allow upload time before the scheduled deadline"],
        faqs: [
          { question: "Can Post schedule Facebook Page videos?", answer: "Yes. Upload a finished video, add the caption, and set an exact publication time or queue slot." },
          { question: "Does Post publish to the Facebook Page I select?", answer: "Yes. The scheduled post is sent to the connected Page selected in the composer." },
          { question: "Can I review the video before scheduling?", answer: "Yes. The composer provides a preview and the complete post can be saved as a draft first." },
        ],
      },
    ],
  },
  {
    slug: "instagram",
    name: "Instagram",
    accountLabel: "Instagram account",
    captionLimit: 2200,
    publicationMode: "direct",
    publicationLabel: "Direct publishing",
    formats: [
      {
        slug: "image-posts",
        name: "image posts",
        h1: "Schedule Instagram image posts with honest format limits",
        description: "Schedule a single Instagram image post with its caption, save drafts, and coordinate publication with other social channels in Post.",
        intro: "Prepare a finished feed image and caption together, then place the post on an exact schedule instead of relying on a reminder to upload it manually.",
        supportStatement: "Post publishes one image and caption directly to the connected Instagram account.",
        mediaRule: "This workflow supports one feed image. Text-only posts, Stories, and carousel publishing are not included.",
        useCases: ["Founder photos paired with a written lesson", "Single-slide launch graphics", "Product screenshots prepared with a clear caption"],
        checklist: ["Use the final image as the first attached asset", "Write the opening caption lines for mobile scanning", "Do not rely on this workflow for Stories or carousels"],
        faqs: [
          { question: "Can Post schedule an Instagram image post?", answer: "Yes. Upload one image, add a caption of up to 2,200 characters, and choose when Post should publish it." },
          { question: "Can Post schedule Instagram carousels or Stories here?", answer: "No. This workflow is intentionally limited to one feed image and does not claim carousel or Story support." },
          { question: "Can I save the Instagram post as a draft?", answer: "Yes. Keep the image and caption in drafts until the post is approved and ready to schedule." },
        ],
      },
      {
        slug: "video-posts",
        name: "Reels and video posts",
        h1: "Schedule Instagram Reels from your content calendar",
        description: "Upload and schedule an Instagram Reel with its caption, drafts, and cross-platform video workflow inside Post.",
        intro: "Take a finished vertical or horizontal clip, pair it with its Instagram caption, and schedule Post to publish it as a Reel at the selected time.",
        supportStatement: "Post publishes one uploaded video to Instagram as a Reel.",
        mediaRule: "This workflow publishes a single video as a Reel. It does not create or edit the video.",
        useCases: ["Short product demos repurposed from a recording batch", "Founder videos prepared for a weekly cadence", "Educational clips timed with a related announcement"],
        checklist: ["Upload the final edited clip", "Make the caption useful without depending on audio", "Preview the file orientation before scheduling"],
        faqs: [
          { question: "Does Post publish scheduled Instagram videos as Reels?", answer: "Yes. The current Instagram video workflow creates and publishes the uploaded video as a Reel." },
          { question: "Can Post edit or trim my Reel?", answer: "No. Upload the finished video you want published; Post handles scheduling and delivery." },
          { question: "Can I send the same video to TikTok or YouTube?", answer: "Yes. Select other connected video platforms, while checking each destination's publishing workflow and caption requirements." },
        ],
      },
    ],
  },
  {
    slug: "linkedin",
    name: "LinkedIn",
    accountLabel: "LinkedIn profile",
    captionLimit: 3000,
    publicationMode: "direct",
    publicationLabel: "Direct publishing",
    formats: [
      {
        slug: "text-posts",
        name: "text posts",
        h1: "Schedule LinkedIn text posts while the thinking is fresh",
        description: "Draft and schedule LinkedIn text posts, keep a recurring queue, and coordinate founder-led content with other channels in Post.",
        intro: "Capture the complete argument in one sitting, save it for review, and schedule it for the moment your audience is most likely to give it attention.",
        supportStatement: "Post publishes one text update directly to the connected LinkedIn profile.",
        mediaRule: "LinkedIn copy is limited to 3,000 characters in Post. This workflow does not create document posts.",
        useCases: ["Founder lessons developed from weekly notes", "Company milestones that need stakeholder review", "Point-of-view posts queued around a launch"],
        checklist: ["Make the first two lines earn the expansion click", "Build the post around one defensible idea", "End with a useful takeaway or specific question"],
        faqs: [
          { question: "Can Post schedule LinkedIn text posts?", answer: "Yes. Connect a LinkedIn profile, write up to 3,000 characters, and schedule the update or add it to a queue." },
          { question: "Does this publish a LinkedIn article or document?", answer: "No. This workflow publishes a standard LinkedIn profile text update." },
          { question: "Can I review a LinkedIn draft before it goes live?", answer: "Yes. Save it in Post as a draft, then return to publish now or select a schedule." },
        ],
      },
      {
        slug: "image-posts",
        name: "image posts",
        h1: "Schedule LinkedIn image posts for founder-led campaigns",
        description: "Schedule one LinkedIn image with its post copy, review it in drafts, and align it with the rest of your campaign in Post.",
        intro: "Keep the visual and the point it supports in the same draft, then schedule the complete LinkedIn update instead of rebuilding it on publication day.",
        supportStatement: "Post uploads one image and publishes it with your LinkedIn commentary.",
        mediaRule: "This workflow publishes one image. LinkedIn document and multi-image posts are not included.",
        useCases: ["Charts paired with the conclusion they support", "Product screenshots for launch education", "Event photos with a founder's perspective"],
        checklist: ["Make the image legible without zooming", "Use the copy to interpret the visual", "Confirm the first attached image is final"],
        faqs: [
          { question: "Can I schedule an image post to LinkedIn?", answer: "Yes. Upload one image, add the post copy, and select an exact time or queue slot." },
          { question: "Can this publish a LinkedIn PDF carousel?", answer: "No. This workflow is limited to one standard image post and does not publish document carousels." },
          { question: "Can I cross-post the image?", answer: "Yes. Other connected networks that support image posts can be selected in the same publishing workflow." },
        ],
      },
      {
        slug: "video-posts",
        name: "video posts",
        h1: "Schedule LinkedIn video posts with the context attached",
        description: "Upload and schedule a LinkedIn video with its commentary, draft approval, and multi-channel publishing plan in Post.",
        intro: "Prepare the finished clip and the business context around it together, then schedule both while coordinating the rest of your social launch.",
        supportStatement: "Post uploads one video asset and publishes it with your LinkedIn commentary.",
        mediaRule: "Upload one finished video. Post does not edit the asset or create a multi-video post.",
        useCases: ["Founder explanations of a product decision", "Recorded customer stories with a written takeaway", "Launch demos timed with company news"],
        checklist: ["Explain the value in the opening seconds", "Give the caption a standalone takeaway", "Preview the complete file before setting the time"],
        faqs: [
          { question: "Can Post schedule LinkedIn video posts?", answer: "Yes. Upload one finished video, add commentary, and select the date and time for publishing." },
          { question: "Will the video publish natively on LinkedIn?", answer: "Yes. Post uploads the video asset to LinkedIn and publishes it with the accompanying commentary." },
          { question: "Can the post remain a draft until approval?", answer: "Yes. Save the complete video post as a draft and schedule it only after review." },
        ],
      },
    ],
  },
  {
    slug: "threads",
    name: "Threads",
    accountLabel: "Threads profile",
    captionLimit: 500,
    publicationMode: "direct",
    publicationLabel: "Direct publishing",
    formats: [
      {
        slug: "text-posts",
        name: "text posts",
        h1: "Schedule Threads text posts for a steadier cadence",
        description: "Schedule single Threads text posts, save ideas as drafts, and add approved updates to a recurring queue with Post.",
        intro: "Turn a batch of short observations into a deliberate publishing rhythm, without needing to open Threads each time one is due.",
        supportStatement: "Post publishes one text post directly to the connected Threads profile.",
        mediaRule: "Copy is limited to 500 characters. This workflow publishes one post rather than a multi-post thread.",
        useCases: ["Short opinions queued across the week", "Launch-day updates prepared in advance", "Useful excerpts adapted from a longer founder post"],
        checklist: ["Keep the post focused on one thought", "Stay within the 500-character limit", "Avoid writing copy that depends on a follow-up thread"],
        faqs: [
          { question: "Can Post schedule text posts on Threads?", answer: "Yes. Write one post of up to 500 characters and choose an exact time or recurring queue slot." },
          { question: "Does Post create a multi-post Threads thread?", answer: "No. The current workflow publishes one Threads post at a time." },
          { question: "Can I save Threads ideas before scheduling?", answer: "Yes. Save each idea as a draft, then schedule the strongest posts when they are ready." },
        ],
      },
      {
        slug: "image-posts",
        name: "image posts",
        h1: "Schedule Threads image posts with the idea intact",
        description: "Schedule a Threads image and caption together, keep unfinished posts in drafts, and coordinate image publishing with Post.",
        intro: "Attach a visual to the observation it supports, review the full post in one place, and publish it to Threads at a chosen time.",
        supportStatement: "Post publishes the first attached image with one Threads post.",
        mediaRule: "This workflow sends one image and up to 500 characters of text.",
        useCases: ["Screenshots that need a short explanation", "Event photos paired with an immediate observation", "Simple graphics adapted from another channel"],
        checklist: ["Use a visual that makes sense at mobile size", "Let the text add a point of view", "Confirm the selected first image before scheduling"],
        faqs: [
          { question: "Can I schedule a Threads image post?", answer: "Yes. Add one image and up to 500 characters of text, then choose when Post should publish it." },
          { question: "How many images will Post send?", answer: "The current Threads workflow uses the first attached image for one post." },
          { question: "Can I use the same image on Instagram?", answer: "Yes. Select Instagram as well when the asset suits a single-image feed post and tailor the captions if needed." },
        ],
      },
      {
        slug: "video-posts",
        name: "video posts",
        h1: "Schedule Threads video posts from a recording batch",
        description: "Upload and schedule a Threads video with its short caption, drafts, and coordinated multi-platform workflow in Post.",
        intro: "Move a finished clip from your recording batch into the calendar, add the thought that frames it, and let Post publish the complete Threads update.",
        supportStatement: "Post publishes one uploaded video directly to the connected Threads profile.",
        mediaRule: "This workflow uses one finished video and caption copy of up to 500 characters.",
        useCases: ["Quick founder reactions saved for the right moment", "Short demos repurposed from a longer recording", "Behind-the-scenes clips scheduled between larger announcements"],
        checklist: ["Choose a clip that works without a long setup", "Use the caption to frame the key moment", "Review orientation and playback before scheduling"],
        faqs: [
          { question: "Can Post schedule Threads videos?", answer: "Yes. Upload one video, add a caption within 500 characters, and choose the publication time." },
          { question: "Does Post edit the Threads video?", answer: "No. Upload a finished asset; Post manages the draft, schedule, and publishing step." },
          { question: "Can I also schedule the clip for X?", answer: "Yes. Select X or another connected video platform when the file and caption suit that destination." },
        ],
      },
    ],
  },
  {
    slug: "tiktok",
    name: "TikTok",
    accountLabel: "TikTok account",
    captionLimit: 2200,
    publicationMode: "inbox",
    publicationLabel: "Inbox delivery",
    formats: [
      {
        slug: "video-posts",
        name: "video uploads",
        h1: "Schedule TikTok video uploads with a clear final step",
        description: "Schedule a TikTok video upload from Post, then complete final editing and publishing from the TikTok inbox when it arrives.",
        intro: "Put a finished video into your Post calendar and choose when it should be delivered to TikTok. Post sends it to the creator inbox, where you complete TikTok's final editing and publish step.",
        supportStatement: "At the scheduled time, Post uploads one video to the connected TikTok creator inbox.",
        mediaRule: "TikTok requires final editing and publishing inside TikTok. Post does not claim unattended direct publishing for this workflow.",
        useCases: ["Preparing campaign videos before a launch week", "Moving a recording batch into a planned TikTok cadence", "Coordinating TikTok uploads with Reels and other video posts"],
        checklist: ["Upload the final base video you want delivered", "Leave time for TikTok's final edit and publish step", "Treat the scheduled time as inbox delivery, not automatic public publication"],
        faqs: [
          { question: "Does Post automatically publish TikTok videos publicly?", answer: "No. Post uses TikTok's inbox upload flow. At the scheduled time the video is delivered to TikTok, where you finish editing and publish it." },
          { question: "Why is there a final step in TikTok?", answer: "The connected TikTok permission supports creator inbox uploads, so final editing and publication remain inside TikTok." },
          { question: "Can I schedule the same clip for Instagram Reels?", answer: "Yes. Instagram video publishing can be selected alongside TikTok, but the TikTok destination still requires its inbox completion step." },
        ],
      },
    ],
  },
  {
    slug: "youtube",
    name: "YouTube",
    accountLabel: "YouTube channel",
    captionLimit: 5000,
    publicationMode: "direct",
    publicationLabel: "Direct upload",
    formats: [
      {
        slug: "video-posts",
        name: "video uploads",
        h1: "Schedule YouTube video uploads with the metadata ready",
        description: "Upload and schedule a YouTube video with its title, description, privacy setting, and cross-channel publishing plan in Post.",
        intro: "Prepare the final video and its publishing context together, choose the channel and privacy setting, and schedule the upload from the same calendar as your other social content.",
        supportStatement: "Post uploads one video to the connected YouTube channel with its title, description, and selected privacy status.",
        mediaRule: "This workflow requires one finished video. Image-only and Community posts are not supported.",
        useCases: ["Product walkthroughs coordinated with launch posts", "Founder videos prepared in a monthly batch", "Short-form videos distributed alongside Reels and Threads clips"],
        checklist: ["Use a clear title of no more than 100 characters", "Write a useful description before scheduling", "Select the intended public, unlisted, or private visibility"],
        faqs: [
          { question: "Can Post schedule a YouTube video upload?", answer: "Yes. Upload one video, provide the title and description, choose visibility, and select the publishing time." },
          { question: "Can Post create YouTube Community posts?", answer: "No. This workflow is for video uploads and does not publish image-only or Community posts." },
          { question: "Can I use the same video on other platforms?", answer: "Yes. Select other connected video destinations when the asset is appropriate, then review each platform's copy and delivery requirements." },
        ],
      },
    ],
  },
];

export const schedulerPlatforms = platforms;

export const schedulerPages: SchedulerPage[] = platforms.flatMap((platform) =>
  platform.formats.map((format) => ({
    ...format,
    platform,
    path: `/schedule/${platform.slug}/${format.slug}`,
    title: `Schedule ${platform.name} ${format.name} | Post`,
  })),
);

export const findSchedulerPage = (platformSlug?: string, formatSlug?: string) =>
  schedulerPages.find((page) => page.platform.slug === platformSlug && page.slug === formatSlug);

export const relatedSchedulerPages = (current: SchedulerPage) => {
  const samePlatform = schedulerPages.filter((page) => page.platform.slug === current.platform.slug && page.path !== current.path);
  const sameFormat = schedulerPages.filter((page) => page.slug === current.slug && page.platform.slug !== current.platform.slug);
  return [...samePlatform, ...sameFormat].slice(0, 6);
};

