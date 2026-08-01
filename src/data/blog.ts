export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  category: string;
  /** ISO date — machine readable */
  publishedAt: string;
  /** ISO date — machine readable */
  updatedAt: string;
  author: string;
  tags: string[];
  content: string;
  faqs: BlogFaq[];
}

export const blogAuthor = "The Post Team";

export function formatBlogDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const blogPosts: BlogPost[] = [
  {
    slug: "best-time-to-post-on-instagram-2026",
    title: "The Best Time to Post on Instagram in 2026",
    excerpt:
      "Benchmark posting windows by content type and audience, plus how to find your own peak times instead of copying a generic chart.",
    readTime: "9 min read",
    category: "Instagram",
    publishedAt: "2026-07-28",
    updatedAt: "2026-07-28",
    author: blogAuthor,
    tags: ["instagram", "timing", "scheduling"],
    content: `
Every "best time to post on Instagram" chart you have ever seen is an average of accounts that look nothing like yours. Averages are a starting point, not an answer. This guide gives you the 2026 benchmarks worth starting from, then shows you how to replace them with data from your own account inside two weeks.

## The 2026 benchmark windows
Across creator and small-brand accounts, these windows consistently produce the highest reach in the first 60 minutes:

- **Weekdays:** 7:00-9:00am and 6:00-9:00pm local time for your largest audience cluster.
- **Wednesday and Thursday** are the strongest weekdays for feed posts and carousels.
- **Reels** skew later — 7:00-11:00pm outperforms mornings on most accounts.
- **Sunday** is the strongest weekend day; Saturday morning is the weakest slot of the week.

Treat these as your v1 schedule. They are only useful until you have your own data.

## Why the first 60 minutes decides everything
Instagram's ranking system in 2026 still leans heavily on early engagement velocity — saves, shares and watch-through inside the first hour relative to how the same audience behaved on your last few posts. Posting when your followers are asleep does not just delay reach; it caps the ceiling permanently, because the post never earns the initial signal it needs to be pushed into Explore and Reels surfaces.

This is why timing matters more on Instagram than on LinkedIn or X, where content has a longer, flatter distribution curve.

## Find your own peak times in two weeks
1. Open Instagram Insights → Total followers → Most active times. Note the top three hourly blocks and the top two days.
2. Convert those to your posting timezone. If your audience is 40% US, 25% UK and 15% Australia, you cannot serve everyone with one slot — see [scheduling for a global audience](/blog/time-zones-and-global-audience-scheduling).
3. Schedule 14 posts across those blocks — two posts per candidate slot — using a [content calendar](/tools/content-planner) so you are testing deliberately rather than posting whenever you remember.
4. After two weeks, compare reach-in-first-hour per slot, not total reach. Total reach rewards older posts unfairly.
5. Keep the top two slots, kill the rest, and re-test one new slot per month.

## Consistency beats precision
An account posting at a mediocre time five days a week will out-perform an account posting at the perfect time twice a month. Timing optimisation is worth roughly 10-30% more reach. Cadence discipline is worth several multiples of that. If you have to choose, choose showing up — see [how often you should post on each platform](/blog/posting-cadence-by-platform).

The practical way to get both is batching: write and schedule a week of content in one sitting, place each post in your best slot, and stop thinking about it until next week. Our [two-hour batching workflow](/blog/batching-content-in-two-hours-a-week) walks through exactly that.

## Content type changes the ideal slot
- **Carousels** perform better in the morning — people save them to read later.
- **Reels** perform better in the evening — passive scrolling time.
- **Stories** should follow your audience's active hours closely; they expire in 24 hours and have no long tail.
- **Launch or announcement posts** should go out Tuesday-Thursday mid-morning, when the highest share of your audience is at a desk.

If you want per-platform copy variations for the same idea without rewriting from scratch, the [caption generator](/tools/caption-generator) and the composer in [Post](/pricing) handle the tedious part.

## What to ignore
Ignore any advice that gives one universal time to the minute. Ignore engagement-pod scheduling. Ignore hashtag-timing myths — hashtags in 2026 are a weak discovery signal compared with captions, on-screen text and audio. See the [hashtag generator](/tools/hashtag-generator) if you still want a clean set, but do not build your strategy on them.

## The setup we recommend
Three fixed slots per week at your top-performing time, one flexible slot for reactive content, everything scheduled on Sunday. Connect your [Instagram account](/platforms/instagram) once, batch your month, and let the scheduler handle the clock.
`,
    faqs: [
      {
        q: "What is the single best time to post on Instagram?",
        a: "For most accounts, 7-9am and 6-9pm local time on Wednesday or Thursday. But your own Insights data beats any benchmark after two weeks of testing.",
      },
      {
        q: "Does posting time still matter in 2026?",
        a: "Yes, but less than cadence. Timing is worth roughly 10-30% more reach; posting consistently is worth several times that.",
      },
      {
        q: "Should Reels be posted at a different time than feed posts?",
        a: "Yes. Reels typically perform best in the evening (7-11pm) when people scroll passively, while carousels do better in the morning when people save content to read later.",
      },
    ],
  },
  {
    slug: "how-to-schedule-threads-posts",
    title: "How to Schedule Threads Posts (2026 Guide)",
    excerpt:
      "Threads has an official API now. Here's how scheduling works, what it supports, and how to run Threads without living in the app.",
    readTime: "8 min read",
    category: "Threads",
    publishedAt: "2026-07-21",
    updatedAt: "2026-07-21",
    author: blogAuthor,
    tags: ["threads", "scheduling", "api"],
    content: `
Threads went from "no API, no tools" to a fully supported publishing endpoint faster than any Meta product before it. If you gave up on Threads because you had to post manually, it is worth another look.

## What the Threads API supports
- Text posts up to 500 characters.
- Single image or single video posts.
- Carousels of up to 20 items.
- Reply-chaining, so you can schedule a thread of several connected posts.
- Link attachments with preview cards.

What it does not support: scheduling DMs, editing a published post, or posting to another user's profile without their authorisation.

## How scheduling actually works
Publishing to Threads is a two-step API flow: you create a media container, then publish it. A scheduler does both for you at the moment your slot fires, which is why a scheduled Threads post appears natively — no "posted via" label, no reminder notification, no manual step.

To set it up in [Post](/pricing):

1. Go to your dashboard and open the connections page.
2. Authorise your [Threads account](/platforms/threads) through Meta.
3. Write your post in the composer, pick Threads (and any other platforms), choose a time, and schedule.
4. Check the queue on Monday to confirm nothing failed.

Because the token expires on Meta's usual 60-day cycle, your scheduler should warn you before it lapses. Silent token expiry is the most common cause of "my posts stopped publishing" — see [auto-publishing safely](/blog/auto-publishing-safely).

## Cadence and format on Threads
Threads rewards volume more than any other text platform right now. Two to four posts a day is a normal creator cadence, and the algorithm surfaces content to non-followers far more aggressively than X does.

What works:
- **Short, opinionated posts.** One idea, under 200 characters.
- **Questions.** Threads users reply more than they like.
- **Chained posts.** Post the hook, then reply to yourself with the detail.
- **Zero hashtags.** They add nothing and look out of place.

What does not work: link-first posts, cross-posted LinkedIn essays, and anything that reads like it was written for a different network. See [cross-posting without looking lazy](/blog/cross-posting-without-looking-lazy) for how to adapt one idea per platform.

## Reusing your X content on Threads
Threads and X share a format, which makes them the easiest pair to cross-post. The 20% you should change:

- Soften the tone slightly. Threads punishes dunking more than X does.
- Drop the hashtags entirely.
- Add a question to the end — replies are weighted heavily.
- Split anything over 500 characters into a chain rather than truncating.

Use the [character counter](/tools/character-counter) if you write in one composer and publish to both.

## Batching a week of Threads
Threads' high cadence makes manual posting the fastest route to burnout. The realistic setup is to write 15-20 short posts in one session, drop them into recurring queue slots, and top up with reactive posts during the week. Our [queue vs calendar](/blog/queue-vs-calendar-scheduling) breakdown explains why an evergreen queue fits Threads better than a fixed calendar.
`,
    faqs: [
      {
        q: "Can you schedule Threads posts natively?",
        a: "Threads itself has no built-in scheduler, but the official Threads API supports scheduled publishing through third-party tools like Post.",
      },
      {
        q: "How many times a day should you post on Threads?",
        a: "Two to four posts per day is the sweet spot for most creators. Threads distributes to non-followers aggressively, so volume compounds faster than on X.",
      },
      {
        q: "Do hashtags work on Threads?",
        a: "Not meaningfully. Threads uses one topic tag per post at most, and the algorithm relies far more on text content and engagement velocity.",
      },
    ],
  },
  {
    slug: "buffer-alternative-for-creators",
    title: "Looking for a Buffer Alternative? What to Check Before You Switch",
    excerpt:
      "A practical checklist for evaluating social schedulers in 2026 — platform coverage, per-post editing, team workflow and real pricing.",
    readTime: "8 min read",
    category: "Comparisons",
    publishedAt: "2026-07-14",
    updatedAt: "2026-07-14",
    author: blogAuthor,
    tags: ["tools", "comparison", "scheduling"],
    content: `
Most people start looking for a Buffer alternative for one of four reasons: per-channel pricing got expensive, a platform they need is not supported, the composer does not let them tailor copy per network, or they added a teammate and hit a wall. Here is how to evaluate any replacement without a two-week trial for each.

## 1. Count the platforms you actually publish to
Add up the networks you post to today plus the one you plan to add next quarter. In 2026 the realistic list for a creator is X, LinkedIn, Instagram, Facebook, YouTube, Threads and TikTok. Any tool missing one of those forces you back into manual posting, which defeats the point.

Post supports all seven natively, including direct video publishing to [TikTok](/platforms/tiktok) and [YouTube](/platforms/youtube) rather than reminder notifications.

## 2. Check whether pricing scales by channel or by workspace
Per-channel pricing looks cheap at three accounts and punishing at fifteen. If you manage more than one brand, model your real cost at the account count you will have in six months, not today. Flat workspace pricing — like our [plans](/pricing) — is usually cheaper past the ten-account mark.

## 3. Test the composer with one real post
Write one post and try to:
- Change the copy for LinkedIn without retyping it.
- Swap the video for a vertical cut on TikTok only.
- Remove the link from the Instagram version.
- Schedule all of them from the same screen.

If any of those takes more than a click, you will stop doing it, and your cross-posting will look lazy. That is the exact failure mode described in [cross-posting without looking lazy](/blog/cross-posting-without-looking-lazy).

## 4. Look for bulk upload
The difference between scheduling five posts and fifty is whether the tool has bulk image and video upload. If you produce short-form video at volume, uploading 30 clips at once and assigning captions in a grid is the single biggest time saver available. Combine it with the [two-hour batching workflow](/blog/batching-content-in-two-hours-a-week).

## 5. Check failure handling
Ask what happens when a token expires or a platform returns a rate-limit error. The right answers: automatic retry, an email notification, and a visible failed-posts list. The wrong answer: silence. Read [auto-publishing safely](/blog/auto-publishing-safely) for the full list of failure modes worth testing.

## 6. Team workflow, even if you are solo today
If there is any chance a VA, editor or client joins in the next year, check for workspaces, role permissions and an approval state. Migrating schedulers later is far more painful than picking one that scales. See [solo creator vs team scheduling](/blog/solo-creator-vs-team-scheduling).

## 7. Export and lock-in
Can you export your scheduled posts as CSV? Can you disconnect and reconnect accounts without losing history? A tool that cannot export is a tool you cannot leave.

## A fair summary
Buffer is a good product and for a two-channel solo creator it is often enough. The reasons to move are volume, video, multi-brand work, and per-channel cost. If any two of those apply to you, run the checklist above against your shortlist — and if you want to see how Post handles them, the [free plan](/signup) covers two platforms with no card required.
`,
    faqs: [
      {
        q: "What should I look for in a Buffer alternative?",
        a: "Platform coverage for all the networks you use, per-platform copy editing in one composer, bulk upload, transparent failure handling, and pricing that does not scale per channel.",
      },
      {
        q: "Is it hard to migrate schedulers?",
        a: "Reconnecting accounts takes about ten minutes. The real work is re-creating your queue slots and re-uploading any content scheduled far in advance, so migrate at the end of a scheduled batch.",
      },
      {
        q: "Does Post have a free plan?",
        a: "Yes. The free plan covers two platforms and ten scheduled posts a month, with no card required.",
      },
    ],
  },
  {
    slug: "social-media-content-calendar-template",
    title: "A Social Media Content Calendar Template That Survives Real Life",
    excerpt:
      "The columns, cadence and review ritual behind a calendar you will still be using in six months.",
    readTime: "8 min read",
    category: "Workflow",
    publishedAt: "2026-07-07",
    updatedAt: "2026-07-07",
    author: blogAuthor,
    tags: ["calendar", "planning", "workflow"],
    content: `
Most content calendars die in week three. Not because the idea is wrong, but because they were built as documentation instead of as a working queue. Here is the structure that survives.

## The only columns you need
- **Date and time slot** — the exact publish moment, not "week of the 12th".
- **Platform(s)** — which networks this asset ships to.
- **Format** — short video, carousel, text, image.
- **Hook** — the first line, written out in full.
- **Body** — the actual copy, not a description of the copy.
- **Asset** — a link to or upload of the file.
- **Status** — idea, drafted, approved, scheduled, published.

Anything else — pillars, personas, campaign codes — is optional and usually the reason calendars collapse under their own weight.

## Weekly rhythm
- **Sunday, 2 hours:** plan, write, design and schedule the week. See [the batching workflow](/blog/batching-content-in-two-hours-a-week).
- **Wednesday, 10 minutes:** check the queue, swap in anything reactive.
- **Friday, 10 minutes:** review what performed and note the winner for repurposing.

That is 2 hours 20 minutes a week for a full multi-platform presence.

## Fill the calendar with pillars, not one-offs
Pick four recurring themes and rotate them. For a scheduling tool that might be: workflow tips, platform news, customer stories, and opinion. For a fitness coach: form breakdowns, myth-busting, client transformations, behind-the-scenes. Rotating pillars means you never open a blank calendar — you open a slot that already has a category attached.

When a pillar runs dry, pull from the [nine evergreen templates](/blog/what-to-schedule-when-you-have-nothing-to-say) or the [post idea generator](/tools/post-idea-generator).

## Cadence by platform
Set your slot count before you write anything, using the [per-platform cadence benchmarks](/blog/posting-cadence-by-platform). A realistic starting grid for one person:

- X and Threads: 2 posts a day, queue-driven.
- LinkedIn: 3 posts a week, calendar-driven.
- Instagram: 4 a week, mixed feed and Reels.
- TikTok and Shorts: 1 a day, from repurposed video.

## Keep a buffer
Always have five to seven days of scheduled content ready. A buffer is what turns travel, illness or a busy launch week from a gap in your feed into a non-event. This is the single highest-return habit in content operations.

## Build it where you publish
A calendar in a spreadsheet and a queue in a scheduler will drift apart within a month. Build the calendar inside the tool that publishes it, so status is real rather than self-reported. Post's calendar view shows scheduled, published and failed posts in one grid — and you can plan the month with the free [content planner](/tools/content-planner) first if you prefer to think on a blank page.
`,
    faqs: [
      {
        q: "What should a social media content calendar include?",
        a: "Date and time, platform, format, the hook written in full, the body copy, the asset, and a status field. Everything else is optional.",
      },
      {
        q: "How far ahead should I plan content?",
        a: "Schedule one week at a time and keep a five-to-seven-day buffer. Planning further ahead than a month tends to produce content that is stale by the time it publishes.",
      },
      {
        q: "Should the calendar live in a spreadsheet?",
        a: "Only for early brainstorming. A calendar separate from your publishing tool drifts out of sync within weeks; build it where the posts actually go out.",
      },
    ],
  },
  {
    slug: "cross-post-tiktok-to-reels-and-shorts",
    title: "How to Cross-Post TikTok to Reels and Shorts (Without the Watermark Penalty)",
    excerpt:
      "One vertical video, three platforms, three sets of metadata. The workflow that avoids downranking.",
    readTime: "7 min read",
    category: "Video",
    publishedAt: "2026-06-30",
    updatedAt: "2026-06-30",
    author: blogAuthor,
    tags: ["tiktok", "reels", "shorts", "video"],
    content: `
Short-form video is the only content type where the same asset genuinely works on three platforms. The trap is that downloading from TikTok and re-uploading to Instagram is the fastest way to get your video suppressed.

## Rule one: export from the source, never from the platform
Always keep the clean, watermark-free export from your editor. Both Instagram and YouTube actively downrank videos carrying another platform's watermark, and TikTok does the same in reverse. If your only copy is the TikTok download, re-export it.

## Rule two: same video, different metadata
The asset is identical. These are not:

- **Cover frame.** TikTok covers can carry text; Reels covers should be clean because they appear in your grid; Shorts thumbnails are auto-generated but the first frame matters.
- **Caption.** TikTok rewards a short curiosity hook. Reels rewards a caption with a saveable takeaway. Shorts rewards a keyword-rich title — it is still a search engine underneath.
- **Sound.** A trending TikTok audio may not be licensed on Reels. Check before scheduling or the video ships muted.
- **Length.** Under 60 seconds publishes cleanly everywhere. Over 60, Shorts cuts off and the video becomes a regular upload.

## Rule three: publish natively, not by reminder
Anything that makes you finish the upload by hand will get skipped on a busy week. Direct publishing to [TikTok](/platforms/tiktok), [Instagram](/platforms/instagram) and [YouTube](/platforms/youtube) means one scheduled action covers all three.

## The bulk workflow
If you produce video at volume, do it in batches:

1. Edit and export ten clips in one session, all 9:16, all under 60 seconds, no watermark.
2. Bulk-upload all ten to your scheduler in a single drag.
3. Write three caption variants per clip in a grid — TikTok hook, Reels takeaway, Shorts title.
4. Assign each clip to a slot across the next ten days.
5. Review failures on Sunday.

That takes about 40 minutes for ten videos across three platforms — versus roughly three hours of manual uploading.

## Stagger the publish times
Do not fire all three at the same minute. Give TikTok the first window, Reels two to four hours later, and Shorts the following morning. Staggering avoids the duplicate-content feel for anyone who follows you in more than one place, and lets you use the TikTok result to pick the better caption for the others.

## Repurpose beyond video
A single video is also a carousel, a text post and a LinkedIn story. See [cross-posting without looking lazy](/blog/cross-posting-without-looking-lazy) for how to adapt one idea across formats, and the [caption generator](/tools/caption-generator) to draft the variants quickly.
`,
    faqs: [
      {
        q: "Does Instagram penalise TikTok watermarks?",
        a: "Yes. Instagram and YouTube both reduce distribution for videos carrying another platform's watermark. Always upload the clean export from your editor.",
      },
      {
        q: "Should I post to TikTok, Reels and Shorts at the same time?",
        a: "Stagger them. TikTok first, Reels a few hours later, Shorts the next morning — it avoids duplicate-feeling content and lets you test captions.",
      },
      {
        q: "Can a scheduler publish video directly to TikTok?",
        a: "Yes. TikTok's Content Posting API supports direct publishing, so a scheduled video goes live without a reminder or manual upload step.",
      },
    ],
  },
  {
    slug: "why-scheduling-social-media-matters",
    title: "Why Scheduling Social Media Actually Matters in 2026",
    excerpt: "Consistency beats intensity. Here's why a scheduler is the highest-leverage tool in your stack.",
    readTime: "7 min read",
    category: "Scheduling",
    publishedAt: "2026-06-12",
    updatedAt: "2026-07-28",
    author: blogAuthor,
    tags: ["scheduling", "strategy"],
    content: `
The single biggest predictor of social growth isn't clever copy or viral luck — it's showing up on a predictable cadence for months at a time. Scheduling is what makes that cadence survive real life.

## The compounding problem
Every skipped week resets your algorithmic momentum. Platforms downrank accounts that go quiet, which means the "make up for it later" strategy costs you more reach than the missed post itself.

The maths is unforgiving. An account posting four times a week for a year publishes 208 posts. An account that sprints for three weeks, disappears for two, and repeats publishes fewer than 130 — and each restart begins from a colder distribution baseline. Same effort, half the output, worse reach per post.

## What a scheduler actually buys you
- **Batching:** Write ten posts in one deep-work session instead of ten context switches.
- **Time zones:** Publish at your audience's peak, not yours. See [scheduling for a global audience](/blog/time-zones-and-global-audience-scheduling).
- **Cross-posting:** One asset, seven platforms, zero copy-paste.
- **Sanity:** No 11pm scramble to hit a self-imposed daily post.
- **A buffer:** Five days of queued content means a sick week does not become a silent week.

## The context-switching tax
Publishing manually costs far more than the two minutes it appears to. Each post requires opening the app, which exposes you to a feed, which costs you an average of fifteen to twenty minutes of attention. Four posts a day across three platforms is not eight minutes of work — it is most of a working hour, every day, plus the creative cost of never being in deep focus.

Batching collapses that into one session. This is the single strongest argument for scheduling and it has nothing to do with the algorithm.

## The mindset shift
Stop treating posting like inspiration and start treating it like inventory. You wouldn't run a store by restocking whenever you felt like it — don't run a feed that way either.

Inventory thinking changes the questions you ask. Instead of "what should I post today?" you ask "how many slots do I need to fill this month, and what are the four themes that fill them?" That question has an answer you can work through in a single sitting — see [the batching workflow](/blog/batching-content-in-two-hours-a-week) and the free [content planner](/tools/content-planner).

## What scheduling does not fix
Scheduling will not make bad content perform. It will not replace a point of view, and it will not save an account with no clear audience. What it does is remove every excuse that has nothing to do with the quality of your ideas — and for most people, those excuses are the actual bottleneck.

## Where to start
Pick two platforms, not seven. Set three slots a week. Batch a month of content this weekend, connect your accounts, and do not open the apps to post again. Reassess in 30 days using the [three metrics that matter](/blog/measuring-what-actually-matters).
`,
    faqs: [
      {
        q: "Does scheduling posts hurt reach?",
        a: "No. All major platforms publish scheduled posts through their official APIs, and the content is treated identically to a manual post.",
      },
      {
        q: "How far in advance should I schedule?",
        a: "One to two weeks. Keep a five-to-seven-day buffer so illness or travel never creates a gap in your feed.",
      },
    ],
  },
  {
    slug: "cross-posting-without-looking-lazy",
    title: "Cross-Posting Without Looking Lazy",
    excerpt: "How to publish the same idea to every network while respecting each platform's culture.",
    readTime: "7 min read",
    category: "Strategy",
    publishedAt: "2026-06-05",
    updatedAt: "2026-07-21",
    author: blogAuthor,
    tags: ["cross-posting", "strategy"],
    content: `
Cross-posting has a bad reputation because most people do it badly — same caption, same aspect ratio, same hashtags, everywhere. Done right, it's the only sustainable way to be present on more than two platforms.

## The 80/20 rule
Keep 80% of the core idea identical across platforms. Rewrite the 20% that determines whether it lands: the hook, the format, the CTA.

The 80% is your actual point — the insight, the story, the data. That does not change between networks because your audience's intelligence does not change between networks. What changes is the entry point.

## Per-platform tweaks
- **X/Threads:** Lead with the punchline. No hashtags.
- **LinkedIn:** Add a first-person frame and a takeaway line.
- **Instagram:** Front-load the hook into the first 125 characters.
- **TikTok/Reels/Shorts:** Same vertical video, different captions and covers — see [the cross-posting video workflow](/blog/cross-post-tiktok-to-reels-and-shorts).
- **Facebook:** Ask a question at the end to trigger comments.
- **YouTube:** Treat the title as a search query, because it is one.

## The tells that make cross-posting look lazy
- An "@" handle from another platform left in the caption.
- Hashtag blocks on networks where hashtags are dead.
- A vertical video letterboxed into a square frame.
- "Link in bio" on a platform that supports links.
- A watermark from another app.

Every one of those takes ten seconds to fix and every one of them signals that the post was not written for the reader in front of it.

## Automate the boring parts
A scheduler that lets you edit per-platform text from one composer removes the "not worth the effort" objection. That's how a solo creator ends up publishing 30+ posts a week without burning out. Draft the variants with the [caption generator](/tools/caption-generator), check lengths with the [character counter](/tools/character-counter), and schedule all seven from one screen.

## A realistic weekly output
One long-form idea per week can become: a LinkedIn post, an X thread, a Threads chain, a carousel, one vertical video cut three ways, and a Facebook question post. That is nine to twelve pieces from one idea — which is what [repurposing at volume](/blog/batching-content-in-two-hours-a-week) actually means in practice.
`,
    faqs: [
      {
        q: "Is cross-posting bad for engagement?",
        a: "Identical copy-paste cross-posting is. Keeping the core idea and rewriting the hook, format and CTA per platform performs as well as native posting.",
      },
      {
        q: "How much should I change per platform?",
        a: "Roughly 20% — the hook, the format and the call to action. The underlying idea stays the same.",
      },
    ],
  },
  {
    slug: "batching-content-in-two-hours-a-week",
    title: "How to Batch a Week of Content in Two Hours",
    excerpt: "A repeatable workflow to plan, write, design and schedule five days of posts in a single sitting.",
    readTime: "8 min read",
    category: "Workflow",
    publishedAt: "2026-05-28",
    updatedAt: "2026-07-14",
    author: blogAuthor,
    tags: ["batching", "workflow", "productivity"],
    content: `
Batching isn't about working faster — it's about eliminating the setup cost of publishing. Here's the workflow we recommend to every creator using Post.

## Before you start
Close every app except your editor and your scheduler. Have your asset folder open. Have last week's top performer visible — you will repurpose it. This preparation takes three minutes and saves twenty.

## Block 1 — Plan (20 min)
Open your content calendar. Pick a theme for the week and five angles under it. Write one-sentence hooks for each. If nothing comes, pull from your four pillars or the [post idea generator](/tools/post-idea-generator).

Do not write full posts in this block. The point is to make every later decision already made.

## Block 2 — Write (45 min)
Draft each post directly in the composer. Don't self-edit yet — get the raw copy out. Nine minutes per post is enough; anything longer is perfectionism, not craft.

Write the platform-native versions as you go rather than in a second pass. Switching a post from LinkedIn tone to X tone while the idea is fresh takes thirty seconds; doing it a day later takes five minutes.

## Block 3 — Design (30 min)
Pull or generate the visual for each post. Vertical video for TikTok/Reels/Shorts, square or 4:5 for Instagram, landscape for LinkedIn/X. Reuse a template — new layouts every week is the fastest way to blow the time budget.

## Block 4 — Schedule (25 min)
Drop each post into the calendar at your platform's peak times — see [the best time to post on Instagram](/blog/best-time-to-post-on-instagram-2026) and the [per-platform cadence guide](/blog/posting-cadence-by-platform). Set it and forget it.

Use bulk upload if you are scheduling more than ten assets; dragging thirty clips in at once and filling captions in a grid is dramatically faster than one-by-one.

## The payoff
Two focused hours replaces 30-40 minutes of scattered posting every day. You get your evenings back, and your feed looks more intentional than the daily-grind competition.

## Making it stick
- Same time every week. Sunday afternoon works for most people.
- One session, no partial batches. A half-batched week always becomes a manual week.
- Ten-minute Wednesday check-in only: queue status, failed posts, anything reactive.
- Bank a buffer, so a missed Sunday costs you nothing.

If two hours feels like a lot, compare it honestly to the alternative — four posts a day, seven days, across three platforms, each one pulling you into a feed. Batching is the cheaper option by a wide margin.
`,
    faqs: [
      {
        q: "How long does it take to batch a week of social content?",
        a: "About two hours once you have templates and pillars in place: 20 minutes planning, 45 writing, 30 designing, 25 scheduling.",
      },
      {
        q: "What if something newsworthy happens mid-week?",
        a: "Leave one flexible slot per platform per week for reactive content, and use the ten-minute Wednesday check-in to swap it in.",
      },
    ],
  },
  {
    slug: "queue-vs-calendar-scheduling",
    title: "Queue vs. Calendar Scheduling: Which One Should You Use?",
    excerpt: "Two philosophies of scheduling, and how to combine them for the best of both.",
    readTime: "6 min read",
    category: "Scheduling",
    publishedAt: "2026-05-20",
    updatedAt: "2026-07-07",
    author: blogAuthor,
    tags: ["scheduling", "queue", "calendar"],
    content: `
Every scheduling tool leans one of two ways. Understanding the difference will save you hours of frustration.

## Calendar scheduling
You pick the exact date and time for every post. Great when timing matters — launches, news, event coverage. The cost is decision fatigue: every post needs a slot chosen by hand, and a gap in the calendar is a gap in your feed.

## Queue scheduling
You define recurring time slots (e.g. "Mon/Wed/Fri at 10am") and drop posts into a queue. The tool assigns them to the next open slot. The cost is precision: you give up control of exactly when a given post lands.

## When to use which
- **Calendar:** Campaigns, launches, time-sensitive commentary, anything tied to a date.
- **Queue:** Evergreen content, daily quotes, recurring series, high-cadence platforms like X and Threads.

## The hybrid setup
Reserve two or three calendar slots per week for time-sensitive posts. Fill the rest of your week from the queue. You get planning discipline without losing the flexibility to react to what's happening today.

In practice that looks like:
- **Queue:** X, Threads, TikTok, Shorts — high volume, evergreen, order does not matter.
- **Calendar:** LinkedIn, YouTube long-form, launch announcements — fewer posts, timing matters.

## Sizing your queue
A queue only works if it never empties. The rule of thumb: keep at least twice as many queued posts as slots per week. Three slots a day across two platforms means 42 slots a week, so you want 80+ posts banked before the queue runs itself. Get there with one heavy [batching session](/blog/batching-content-in-two-hours-a-week) and the [nine evergreen templates](/blog/what-to-schedule-when-you-have-nothing-to-say).

## Recycling evergreen posts
Your best evergreen post from six months ago will outperform your median new post today. A queue makes recycling trivial: mark a post as evergreen, and let it re-enter the rotation quarterly. Just avoid recycling anything time-referenced ("this week", "yesterday") — the [content planner](/tools/content-planner) is a good place to tag which posts are safe to repeat.
`,
    faqs: [
      {
        q: "Is queue or calendar scheduling better?",
        a: "Use both. Queue evergreen, high-volume content and reserve calendar slots for launches and time-sensitive posts.",
      },
      {
        q: "How many posts should I keep in the queue?",
        a: "At least twice your weekly slot count, so the queue never empties between batching sessions.",
      },
    ],
  },
  {
    slug: "what-to-schedule-when-you-have-nothing-to-say",
    title: "What to Schedule When You Have Nothing to Say",
    excerpt: "Nine evergreen post templates that work on any platform, any week of the year.",
    readTime: "7 min read",
    category: "Ideas",
    publishedAt: "2026-05-14",
    updatedAt: "2026-06-30",
    author: blogAuthor,
    tags: ["ideas", "templates", "content"],
    content: `
The creative block that kills most schedules isn't lack of time — it's staring at a blank composer. Keep this list bookmarked.

## Nine templates that never fail
1. **The hot take** — one opinion most people in your niche disagree with.
2. **The mistake I made** — a specific failure and what it taught you.
3. **The before/after** — a screenshot or metric that shows change.
4. **The list** — five things, five tools, five lessons.
5. **The behind-the-scenes** — one photo of your actual workspace.
6. **The reframe** — "Most people think X. Actually Y."
7. **The question** — one open question to your audience.
8. **The recommendation** — one product, book or person worth following.
9. **The recap** — what you shipped or learned this week.

## How to fill each template fast
Give yourself a two-minute limit per template and answer from memory, not research. The hot take is whatever you argued about last month. The mistake is whatever cost you money this quarter. The recommendation is the last thing you told a friend about. Specificity beats polish every time — "we lost $4k on a bad ad test" outperforms "here are five ad mistakes" without exception.

## Adapt each one per platform
The same template lands differently by network. The hot take is a one-liner on X, a first-person story on LinkedIn, and a talking-head clip on TikTok. Use the [80/20 rule](/blog/cross-posting-without-looking-lazy) and the [caption generator](/tools/caption-generator) to make the variants in minutes.

## Pre-load the queue
Write one of each into your scheduler this weekend. You now have nine posts ready — enough for two weeks at four posts a week. Add nine more the following weekend and your [queue](/blog/queue-vs-calendar-scheduling) starts running itself.

## When you are genuinely out of ideas
Read your own comments and DMs from the last month. Every repeated question is a post. Every misunderstanding is a post. Every "how did you do that?" is a post. Audience questions are the only idea source that never runs out — and the [post idea generator](/tools/post-idea-generator) is there for the weeks it does.
`,
    faqs: [
      {
        q: "What should I post when I have no ideas?",
        a: "Work through evergreen templates: a hot take, a mistake you made, a before/after, a list, behind-the-scenes, a reframe, a question, a recommendation, and a weekly recap.",
      },
      {
        q: "Where do the best content ideas come from?",
        a: "Your own comments and DMs. Every repeated question from your audience is a post that is guaranteed to be relevant.",
      },
    ],
  },
  {
    slug: "posting-cadence-by-platform",
    title: "How Often You Should Post on Each Platform",
    excerpt: "Cadence benchmarks for X, LinkedIn, Instagram, TikTok, YouTube, Threads and Facebook.",
    readTime: "7 min read",
    category: "Strategy",
    publishedAt: "2026-05-06",
    updatedAt: "2026-07-21",
    author: blogAuthor,
    tags: ["cadence", "strategy", "benchmarks"],
    content: `
Post too little and you're invisible. Post too much and you fatigue your audience. Here's what the data supports as of 2026.

## Baseline cadence
- **X:** 3-5 posts per day.
- **Threads:** 2-4 posts per day — see [scheduling Threads posts](/blog/how-to-schedule-threads-posts).
- **LinkedIn:** 1 post per weekday.
- **Instagram (feed + Reels):** 4-7 per week.
- **TikTok:** 1-2 per day.
- **YouTube long-form:** 1 per week. Shorts: 3-5 per week.
- **Facebook:** 1 per day.

## Why the numbers differ so much
Cadence tracks how quickly a platform's feed refreshes and how much it distributes to non-followers. X and Threads have fast, ephemeral feeds, so volume is the price of visibility. LinkedIn throttles frequency — posting twice in a day usually cannibalises the first post. YouTube rewards depth over frequency because search and suggested traffic keep a video alive for months.

## Pick a cadence you can hold for 90 days
Start at half these numbers. An honest three posts a week for a quarter beats a two-week sprint at daily volume followed by silence. If the cadence you picked requires more than one [batching session](/blog/batching-content-in-two-hours-a-week) a week, it is too high.

## Scaling up safely
Add volume one platform at a time, and only after your current cadence has been automatic for a month. The order that works for most creators: master one text platform, add short-form video, then add a second text platform via cross-posting.

## The scheduler advantage
Hitting these numbers manually is a part-time job. Batching a week's worth of content into a scheduler makes it a Sunday-afternoon habit instead. Set recurring [queue slots](/blog/queue-vs-calendar-scheduling) at the cadence above and you never have to think about the numbers again.

## Don't chase the ceiling
Consistency at a lower volume beats a two-week sprint followed by silence. Track [followers per post](/blog/measuring-what-actually-matters) rather than raw post count — if that number falls as you scale volume, you have found your ceiling.
`,
    faqs: [
      {
        q: "How often should you post on social media in 2026?",
        a: "3-5 times daily on X, 2-4 on Threads, once per weekday on LinkedIn, 4-7 weekly on Instagram, 1-2 daily on TikTok, and weekly long-form on YouTube.",
      },
      {
        q: "Can you post too much?",
        a: "Yes — particularly on LinkedIn, where a second post in the same day usually cannibalises the first. Watch followers-per-post as you scale.",
      },
    ],
  },
  {
    slug: "measuring-what-actually-matters",
    title: "The Only Three Metrics Worth Tracking",
    excerpt: "Ignore vanity numbers. These three signals tell you if your scheduling strategy is working.",
    readTime: "6 min read",
    category: "Analytics",
    publishedAt: "2026-04-29",
    updatedAt: "2026-07-07",
    author: blogAuthor,
    tags: ["analytics", "metrics"],
    content: `
Every platform hands you dozens of metrics. Most are noise. Focus on these three.

## 1. Followers per post
Total new followers this month divided by posts published. Rising = your content is compounding. Flat = you're maintaining. Falling = your topic or format needs to change.

This is the metric that tells you whether scaling volume is working. If you double your [cadence](/blog/posting-cadence-by-platform) and followers-per-post halves, you added work and gained nothing.

## 2. Save/share rate
Comments and likes are cheap. Saves and shares mean the post was useful enough to keep or forward. This is the strongest algorithmic signal on Instagram, LinkedIn and TikTok in 2026.

Practically: anything with a save rate in the top decile of your account should be repurposed into three more formats and re-queued as evergreen.

## 3. Profile visits per post
The number of people curious enough to click through after seeing your content. This is your true "top-of-funnel" number for turning viewers into audience.

## What to ignore
Impressions, raw likes, follower count as a headline number, and any "engagement rate" that lumps likes in with saves. They move for reasons unrelated to whether your strategy is working — one algorithmically boosted post can distort a month.

## Review monthly, not daily
Look at these numbers once a month. Daily obsession leads to reactive posting, which breaks the scheduling discipline that made you grow in the first place.

A workable ritual: on the first Sunday of the month, pull the three numbers per platform, note your top three posts by save rate, and feed those into next month's [content calendar](/blog/social-media-content-calendar-template) as repurposing candidates. Fifteen minutes, once a month, is all the analytics work a creator needs.
`,
    faqs: [
      {
        q: "What social media metrics actually matter?",
        a: "Followers per post, save/share rate, and profile visits per post. Impressions and likes are largely noise.",
      },
      {
        q: "How often should I review analytics?",
        a: "Monthly. Daily checking drives reactive posting and breaks the scheduling discipline that produces growth.",
      },
    ],
  },
  {
    slug: "time-zones-and-global-audience-scheduling",
    title: "Scheduling for a Global Audience Without Losing Your Mind",
    excerpt: "How to publish across time zones without waking up at 3am — or ignoring half your audience.",
    readTime: "7 min read",
    category: "Scheduling",
    publishedAt: "2026-04-22",
    updatedAt: "2026-06-30",
    author: blogAuthor,
    tags: ["timezones", "scheduling", "global"],
    content: `
Once your audience crosses continents, "post when I'm awake" stops working. Here's how to serve everyone.

## Find your center of gravity
Check your platform analytics for the top three countries where your audience lives. Weight your schedule toward whichever accounts for the most engaged followers, not just the most followers. A 10,000-follower cluster that never comments is worth less than a 3,000-follower cluster that shares.

## The three-slot rule
Cover the world with three posting slots per day:
- Morning US Eastern (also mid-afternoon Europe)
- Evening US Eastern (also morning Asia-Pacific)
- Late evening US Eastern (also midday Australia)

Those three slots reach roughly 80% of an English-speaking global audience at a reasonable local hour, without you being awake for any of them.

## Localize the calendar, not the content
Schedule the same post to fire at the right local time for each region using a tool that supports per-platform, per-audience scheduling. You don't need to write three versions — you need to time one version well.

The exception is anything time-referenced. "Happy Monday" and "this morning" break instantly across time zones. Strip temporal language from evergreen posts and they can run in any slot, in any region, at any point in the [queue](/blog/queue-vs-calendar-scheduling).

## Watch for daylight saving drift
US, EU and Australian daylight saving transitions happen on different dates, so a schedule tuned in January silently drifts by an hour twice a year. Check your slots each March and October — it takes five minutes and prevents a quarter of mistimed posts.

## Bank a buffer
Always keep 5-7 days of scheduled posts in reserve. Travel, illness and burnout are the top three killers of consistent posting, and a buffer means none of them hurt you. Build it in a single [batching session](/blog/batching-content-in-two-hours-a-week) and top it up weekly.
`,
    faqs: [
      {
        q: "How do I schedule for multiple time zones?",
        a: "Use three daily slots — morning US Eastern, evening US Eastern and late evening US Eastern — which map to reasonable local hours in Europe, Asia-Pacific and Australia.",
      },
      {
        q: "Should I write different posts for different regions?",
        a: "Rarely. Time one version well instead, and strip time-referenced language like 'this morning' so the post works in any slot.",
      },
    ],
  },
  {
    slug: "auto-publishing-safely",
    title: "Auto-Publishing Safely: What Can (and Can't) Go Wrong",
    excerpt: "The failure modes of automated scheduling — and how to avoid every one of them.",
    readTime: "6 min read",
    category: "Operations",
    publishedAt: "2026-04-15",
    updatedAt: "2026-07-14",
    author: blogAuthor,
    tags: ["operations", "reliability", "automation"],
    content: `
Automation is a superpower, but only if you respect the edge cases. Here's what to watch for.

## Common failure modes
- **Expired tokens** — social platforms revoke access every 60-90 days. A good scheduler warns you before this happens.
- **Rate limits** — publishing 20 posts in a single minute triggers spam filters. Space them out.
- **Deleted media** — if a scheduled post references a file you moved, publishing silently fails. Use a scheduler that stores its own copy.
- **Policy changes** — Meta and TikTok occasionally deprecate endpoints. Watch your dashboard's status page.
- **Aspect ratio rejections** — a 16:9 video sent to a vertical-only surface fails at publish time, not at schedule time.
- **Password changes** — changing your social account password invalidates the connection on several networks.

## The 5-minute weekly review
Every Sunday, open your scheduler and check three things: platform connection status, the coming week's queue, and any failed posts from the previous week. That's it. That's the whole ritual.

Do it at the start of your [batching session](/blog/batching-content-in-two-hours-a-week) so it never becomes a separate task you skip.

## Auto-retry is not optional
Transient API errors are common — a network blip, a five-second platform outage, a temporary rate limit. A scheduler that fails permanently on the first error will drop posts every month. Retry with backoff, then notify. Post retries automatically and emails you if a post still cannot publish.

## The paranoid setup
For high-stakes accounts (client work, launches, brand-critical posts), enable email or SMS alerts on publish failures. Silent failures are the real risk — not the failures themselves.

Also: never schedule a launch announcement as the only copy of it. Keep the copy and asset somewhere you can publish manually in sixty seconds if the API is having a bad morning. This applies to every platform, and it is the one rule professional social teams never break. If you manage accounts for clients, pair it with the approval workflow in [team scheduling](/blog/solo-creator-vs-team-scheduling).
`,
    faqs: [
      {
        q: "Why did my scheduled post fail to publish?",
        a: "The most common causes are an expired platform token, a rate limit, deleted media, or an unsupported aspect ratio. Check your connections page first.",
      },
      {
        q: "How often do social platform tokens expire?",
        a: "Typically every 60-90 days on Meta platforms. A good scheduler warns you before the token lapses rather than failing silently.",
      },
    ],
  },
  {
    slug: "solo-creator-vs-team-scheduling",
    title: "Scheduling as a Solo Creator vs. a Team",
    excerpt: "The workflows, approvals and tooling that change when a second person joins your content operation.",
    readTime: "8 min read",
    category: "Teams",
    publishedAt: "2026-04-08",
    updatedAt: "2026-07-14",
    author: blogAuthor,
    tags: ["teams", "workflow", "agency"],
    content: `
Going from one person to two is the biggest jump in a content operation. Here's how the workflow needs to evolve.

## Solo mode
- One brain, one calendar, one voice.
- Speed matters more than process.
- Skip approvals — you are the approval.
- Optimise for batching, not documentation. See [the two-hour workflow](/blog/batching-content-in-two-hours-a-week).

## Two-person mode
- Roles split: someone creates, someone reviews.
- Every post needs a status: draft, in review, approved, scheduled, published.
- Comments live on the post, not in DMs or Slack.
- One person owns the calendar. Shared ownership means no ownership.

The first thing that breaks is the voice. Write a one-page voice guide — five things you always do, five you never do, and three example posts — before the second person writes anything. It takes twenty minutes and prevents months of edits.

## Team mode (3+)
- Workspaces per client or brand.
- Role-based permissions: editors can't publish, publishers can't invoice.
- A shared content calendar that everyone can see, but not everyone can change.
- A weekly review of failed posts and connection status — see [auto-publishing safely](/blog/auto-publishing-safely).

## Agency and client work
Client accounts add two requirements solo tooling never needs: an approval state the client can act on without logging into your systems, and hard separation between brands so nothing is ever posted to the wrong account. Workspace switching with per-workspace connections solves both — check the [Business plan](/pricing) if you run more than one brand.

## The tool should scale with you
Don't pick a scheduler that only works solo — you'll outgrow it in six months. Pick one where "invite a teammate" is a single button, and the workflow you built alone doesn't have to be rebuilt for two. That is also the top reason people go looking for a [Buffer alternative](/blog/buffer-alternative-for-creators).
`,
    faqs: [
      {
        q: "When should I add approvals to my content workflow?",
        a: "As soon as a second person writes content. Before that, approvals are overhead; after that, they are the only way to protect the voice.",
      },
      {
        q: "How should agencies separate client accounts?",
        a: "Use one workspace per client with its own connected accounts and permissions, so it is structurally impossible to publish to the wrong brand.",
      },
    ],
  },
];
