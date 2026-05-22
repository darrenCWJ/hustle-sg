// Seed a demo employer account with 30 regular + 30 instant gigs.
// Also seeds applications from existing freelancers so the demo shows a live pipeline.
// Run: npx tsx lib/db/seed-demo-employer.ts
// Safe to run multiple times (upserts on NRIC hash / gig title).

import { config as loadEnv } from "dotenv";
import path from "node:path";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

import { createClient } from "@supabase/supabase-js";
import { hashNric, mockEmailForHash, mockPasswordForHash } from "../singpass/nric";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── DEMO EMPLOYER ────────────────────────────────────────────────────────────

const DEMO_EMPLOYER = {
  nric: "T8888888Z",
  handle: "demo_corp",
  display_name: "Alex Tan at Demo Corp SG",
  headline: "Operations director · hiring freelancers across all functions",
  bio: "Demo Corp SG is a mid-sized services company with 80 full-timers. We regularly engage freelancers for tech projects, design work, tuition, events, and content creation. This account is set up for platform demos.",
  role: "employer" as const,
  lat: 1.2847,
  lon: 103.8514, // Raffles Place
};

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function dateFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD for date columns
}

// ─── REGULAR GIGS (requires_employer_approval: true) ─────────────────────────

const REGULAR_GIGS = [
  // Tech (6)
  {
    title: "Full-stack developer — 3-month contract",
    description: "Join our product team to build 4 new modules in our B2B SaaS platform. Stack: Next.js 15, TypeScript, Supabase, Postgres. Hybrid — 2 days at our Raffles Place office.",
    skills: ["nextjs", "typescript", "supabase", "postgres", "react"],
    location: "Raffles Place (hybrid)",
    category: "tech",
    budget_cents: 1200_00,
    budget_kind: "hourly" as const,
    questions: [
      "Share a recent Next.js App Router project. What were the main architectural decisions?",
      "How do you handle Postgres RLS for a multi-tenant app?",
    ],
  },
  {
    title: "React Native mobile developer — 8 weeks",
    description: "Build the v2 iOS/Android app for our loyalty programme. New screens, Expo, Supabase auth, push notifications. Fully remote.",
    skills: ["react native", "expo", "typescript", "ios", "android", "push notifications"],
    location: "Remote",
    category: "tech",
    budget_cents: 1100_00,
    budget_kind: "hourly" as const,
    questions: [
      "Share a published React Native app — what was the hardest part of the build?",
    ],
  },
  {
    title: "Data analyst — Python & SQL (6 weeks)",
    description: "Analyse 2 years of sales data, build dashboards in Metabase, and deliver a monthly reporting pipeline. Postgres + Python + dbt. Remote.",
    skills: ["python", "sql", "postgres", "dbt", "metabase", "data analysis"],
    location: "Remote",
    category: "tech",
    budget_cents: 950_00,
    budget_kind: "hourly" as const,
    questions: [
      "Describe a reporting pipeline you built — what tools did you use and what did it automate?",
    ],
  },
  {
    title: "DevOps engineer — AWS & Kubernetes (4 weeks)",
    description: "Migrate our staging and production environments to EKS. Set up CI/CD with GitHub Actions, secrets management with AWS Secrets Manager, and a monitoring stack with Grafana.",
    skills: ["aws", "kubernetes", "docker", "github actions", "terraform", "grafana"],
    location: "Remote",
    category: "tech",
    budget_cents: 1300_00,
    budget_kind: "hourly" as const,
    questions: [
      "Walk us through a Kubernetes cluster you've set up in production.",
    ],
  },
  {
    title: "Cybersecurity consultant — pen test & audit",
    description: "Conduct a web application penetration test and OWASP Top 10 audit on our customer portal. Deliver a full findings report with remediation steps. 2-week engagement.",
    skills: ["penetration testing", "owasp", "security audit", "web security", "reporting"],
    location: "Remote",
    category: "tech",
    budget_cents: 600000,
    budget_kind: "fixed" as const,
    questions: [
      "Describe your pen testing methodology for a web app. What tools and frameworks do you use?",
    ],
  },
  {
    title: "QA automation engineer — 6-week contract",
    description: "Build an end-to-end test suite (Playwright) covering our 8 core user flows. Set up CI integration, write the test plan, and onboard our developers.",
    skills: ["playwright", "typescript", "qa automation", "ci/cd", "test planning"],
    location: "Remote",
    category: "tech",
    budget_cents: 1000_00,
    budget_kind: "hourly" as const,
    questions: [
      "Share a Playwright test suite you've built. How did you handle flaky tests?",
    ],
  },

  // Design (6)
  {
    title: "Senior UX designer — enterprise dashboard (10 weeks)",
    description: "Lead UX for a complete redesign of our operations dashboard used by 50 corporate clients. Discovery research → IA → hi-fi Figma → design system handoff.",
    skills: ["ux design", "figma", "user research", "design systems", "information architecture"],
    location: "Raffles Place (hybrid)",
    category: "design",
    budget_cents: 1300_00,
    budget_kind: "hourly" as const,
    questions: [
      "Describe the most complex dashboard you've redesigned. What was the research process?",
      "How do you handle conflicting input from different stakeholder groups?",
    ],
  },
  {
    title: "Brand identity designer — company rebrand",
    description: "Full rebrand for Demo Corp SG: new logo system, colour palette, typography, stationery, and a 40-page brand guidelines PDF. 6-week project.",
    skills: ["brand identity", "logo design", "figma", "illustrator", "typography"],
    location: "Remote",
    category: "design",
    budget_cents: 800000,
    budget_kind: "fixed" as const,
    questions: [
      "Share a recent full brand identity project — logo system, colours, and guidelines deliverable.",
    ],
  },
  {
    title: "UI designer — mobile app (4 weeks)",
    description: "Produce pixel-perfect hi-fi screens for our consumer mobile app (iOS/Android). 35 screens total. Design system already exists; you maintain and extend it. Remote.",
    skills: ["ui design", "figma", "mobile design", "design systems", "ios", "android"],
    location: "Remote",
    category: "design",
    budget_cents: 600000,
    budget_kind: "fixed" as const,
    questions: [
      "Share a mobile app UI project — how did you handle the design system handoff?",
    ],
  },
  {
    title: "Graphic designer — marketing materials (4 weeks)",
    description: "Design suite for a product launch: brochure, 10 social templates, 3 event banners, email header. Figma + Illustrator. Brand guide provided.",
    skills: ["graphic design", "figma", "illustrator", "print design", "social media"],
    location: "Remote",
    category: "design",
    budget_cents: 450000,
    budget_kind: "fixed" as const,
  },
  {
    title: "Video editor — YouTube series (ongoing)",
    description: "Edit 2 long-form YouTube videos per month (20–30 min each). Footage provided. You handle colour grade, audio mix, L-cuts, lower thirds, and captions. Adobe Premiere or DaVinci.",
    skills: ["video editing", "premiere pro", "davinci resolve", "colour grading", "youtube"],
    location: "Remote",
    category: "design",
    budget_cents: 80000,
    budget_kind: "fixed" as const,
    questions: [
      "Share 2 long-form YouTube videos you've edited. What's your typical turnaround per video?",
    ],
  },
  {
    title: "3D product visualisation — 5 SKUs",
    description: "Create photorealistic 3D renders of 5 product SKUs for our e-commerce site and print catalogue. Blender or Cinema 4D. Reference photos and spec sheets provided.",
    skills: ["3d modelling", "blender", "cinema 4d", "product visualisation", "rendering"],
    location: "Remote",
    category: "design",
    budget_cents: 350000,
    budget_kind: "fixed" as const,
    questions: [
      "Share a product 3D visualisation project — what software and render settings did you use?",
    ],
  },

  // Education (5)
  {
    title: "A-level H2 Maths tutor — 3-month engagement",
    description: "Teach H2 Maths at our Bishan centre. 3 sessions/week, small groups of 4. Curriculum provided; you supplement with your own materials. ACTA or teaching cert preferred.",
    skills: ["h2 maths", "a-level", "lesson planning", "small group tuition", "exam preparation"],
    location: "Bishan",
    category: "tuition",
    budget_cents: 8500,
    budget_kind: "hourly" as const,
    questions: [
      "Describe your approach to a student who is stuck on integration techniques.",
    ],
  },
  {
    title: "Corporate trainer — Excel & data literacy",
    description: "Design and deliver a 2-day Excel + data literacy workshop for our 30-person operations team. Intermediate–advanced level. Post-workshop workbooks included.",
    skills: ["excel", "data literacy", "corporate training", "workshop facilitation", "curriculum design"],
    location: "Raffles Place",
    category: "tuition",
    budget_cents: 400000,
    budget_kind: "fixed" as const,
    questions: [
      "Share a corporate training programme you designed and delivered — what were the learning outcomes?",
    ],
  },
  {
    title: "English writing coach — business professionals",
    description: "Run 6 × 1-hour online workshops on business writing (emails, reports, presentations) for our leadership team. Tailored exercises. Fully remote.",
    skills: ["business writing", "coaching", "english", "workshop facilitation", "communication"],
    location: "Remote",
    category: "tuition",
    budget_cents: 200000,
    budget_kind: "fixed" as const,
  },
  {
    title: "O-level Combined Science curriculum reviewer",
    description: "Review and quality-check our 12-chapter Combined Science (Physics + Chemistry) notes for accuracy, exam alignment, and explanation depth. Remote, 20-hour engagement.",
    skills: ["o-level science", "physics", "chemistry", "curriculum review", "assessment design"],
    location: "Remote",
    category: "tuition",
    budget_cents: 9500,
    budget_kind: "hourly" as const,
  },
  {
    title: "Mandarin tutor — HSK 4–5 preparation",
    description: "Prepare 3 adult professionals for HSK 4–5 exams. 8 weeks, 2 sessions/week per student. Online via Zoom. Materials provided.",
    skills: ["mandarin", "hsk", "adult learning", "language teaching", "zoom"],
    location: "Remote",
    category: "tuition",
    budget_cents: 9000,
    budget_kind: "hourly" as const,
  },

  // Events (5)
  {
    title: "Bilingual emcee — annual company D&D (600 pax)",
    description: "Host our annual D&D at Suntec City. EN + Mandarin. Script support provided. 3-hour programme including games and lucky draw.",
    skills: ["emcee", "bilingual", "corporate events", "public speaking", "mandarin"],
    location: "Suntec City",
    category: "events",
    budget_cents: 300000,
    budget_kind: "fixed" as const,
    questions: [
      "Share a past corporate event clip. What's the largest audience you've hosted?",
    ],
  },
  {
    title: "Corporate event photographer — product launch",
    description: "Full-day photography for our product launch event: venue setup, keynote, panel, networking drinks. Deliver 200 edited hi-res JPEGs within 48 hours.",
    skills: ["event photography", "corporate", "editing", "lightroom", "product launch"],
    location: "Marina Bay Sands",
    category: "events",
    budget_cents: 280000,
    budget_kind: "fixed" as const,
    questions: [
      "Share a corporate event photography portfolio link.",
    ],
  },
  {
    title: "Event coordinator — product launch (300 pax)",
    description: "Full event coordination for our SG product launch. Pre-event: vendor management, run-of-show. Day-of: floor management, AV, VIP hosting, media liaison.",
    skills: ["event coordination", "vendor management", "day-of logistics", "av management"],
    location: "Orchard",
    category: "events",
    budget_cents: 350000,
    budget_kind: "fixed" as const,
    questions: [
      "Describe the most complex product launch you've coordinated.",
    ],
  },
  {
    title: "Livestream producer — hybrid conference",
    description: "Produce the livestream for our 2-day hybrid conference (250 in-person, 1,000 online). OBS + streaming to YouTube Live and LinkedIn Live simultaneously. 2-day setup + show.",
    skills: ["livestream", "obs", "youtube live", "linkedin live", "production", "technical director"],
    location: "Suntec City",
    category: "events",
    budget_cents: 500000,
    budget_kind: "fixed" as const,
  },
  {
    title: "Stage manager — awards ceremony (400 pax)",
    description: "Stage manage our annual industry awards at Mandarin Orchard. Full show flow, cue sheets, liaising with AV vendor and performers. 1-day event.",
    skills: ["stage management", "show flow", "av coordination", "cue sheets", "event production"],
    location: "Orchard",
    category: "events",
    budget_cents: 250000,
    budget_kind: "fixed" as const,
  },

  // Content & F&B (8)
  {
    title: "TikTok content creator — SG lifestyle campaign",
    description: "Produce 4 TikTok videos over 6 weeks for our lifestyle brand. Must have 50k+ SG followers. We provide product and filming support; you supply concept and execution.",
    skills: ["tiktok", "content creation", "short-form video", "influencer", "lifestyle"],
    location: "Remote",
    category: "content",
    budget_cents: 250000,
    budget_kind: "fixed" as const,
    questions: [
      "Share 3 recent TikTok videos and your average views and engagement rate.",
    ],
  },
  {
    title: "LinkedIn ghostwriter — executive thought leadership",
    description: "Write 3 long-form LinkedIn posts per week for our CEO. Interviews via Slack voice notes; you draft and schedule. 3-month engagement.",
    skills: ["copywriting", "linkedin", "ghostwriting", "thought leadership", "b2b"],
    location: "Remote",
    category: "content",
    budget_cents: 300000,
    budget_kind: "fixed" as const,
    questions: [
      "Share examples of LinkedIn posts you've ghostwritten. What was the engagement uplift?",
    ],
  },
  {
    title: "SEO copywriter — website refresh (10 pages)",
    description: "Rewrite 10 key pages on our corporate website with SEO-first copy. Keyword research included. Tone: professional but approachable. Remote.",
    skills: ["seo", "copywriting", "content strategy", "keyword research", "website copy"],
    location: "Remote",
    category: "content",
    budget_cents: 380000,
    budget_kind: "fixed" as const,
    questions: [
      "Share a website SEO project — what was the traffic improvement over 3 months?",
    ],
  },
  {
    title: "Food photographer — menu shoot (50 dishes)",
    description: "Shoot all 50 dishes on our new menu at our Kallang restaurant. Props provided. Deliver 50 edited hi-res images within 5 working days.",
    skills: ["food photography", "studio lighting", "editing", "lightroom", "menu photography"],
    location: "Kallang",
    category: "content",
    budget_cents: 450000,
    budget_kind: "fixed" as const,
    questions: [
      "Share a food photography portfolio — restaurant or product.",
    ],
  },
  {
    title: "Video producer — 10 product demo videos",
    description: "Produce 10 short product demo videos for our new product line, edited and ready for social media. You script, film, and deliver. Equipment and product samples provided. 4-week project.",
    skills: ["video production", "scripting", "video editing", "social media"],
    location: "Kallang",
    category: "video",
    budget_cents: 500000,
    budget_kind: "fixed" as const,
  },
  {
    title: "Operations support — weekly inventory audit (3 months)",
    description: "Support our operations team with weekly inventory audits at our Raffles Place HQ. Duties: count stock, update spreadsheet, flag discrepancies. 2–3 hours per week for 3 months.",
    skills: ["inventory management", "operations", "spreadsheets", "attention to detail"],
    location: "Raffles Place",
    category: "admin",
    budget_cents: 3500,
    budget_kind: "hourly" as const,
    questions: [
      "Describe an inventory or stock management process you've owned before. What tools did you use?",
    ],
  },
  {
    title: "HR contractor — recruitment support (8 weeks)",
    description: "Support our HR team with end-to-end recruitment for 5 open roles: screen CVs, conduct first-round calls, coordinate interviews, and manage job board postings.",
    skills: ["recruitment", "hr", "talent acquisition", "interviewing", "hr operations"],
    location: "Raffles Place (hybrid)",
    category: "admin",
    budget_cents: 8500,
    budget_kind: "hourly" as const,
  },
  {
    title: "Finance contractor — bookkeeping & month-end close",
    description: "Handle month-end close, accounts payable/receivable reconciliation, and prepare management accounts for 3 months. Xero proficiency required.",
    skills: ["bookkeeping", "xero", "accounts payable", "accounts receivable", "financial reporting"],
    location: "Raffles Place (hybrid)",
    category: "admin",
    budget_cents: 9000,
    budget_kind: "hourly" as const,
    questions: [
      "Describe a month-end close process you've owned. What was the team size and complexity?",
    ],
  },
];

// ─── INSTANT GIGS (is_instant: true) ─────────────────────────────────────────

const INSTANT_GIGS = [
  // Tech (5)
  {
    title: "Urgent: fix checkout bug on live site",
    description: "Our checkout page throws a 500 error for users on Safari iOS. Need a Next.js developer to diagnose and fix immediately. Access to staging and Vercel logs provided.",
    skills: ["nextjs", "debugging", "javascript", "safari", "vercel"],
    location: "Remote",
    category: "tech",
    budget_cents: 50000,
    budget_kind: "fixed" as const,
    instant_urgency: "now" as const,
  },
  {
    title: "Urgent: Postgres query optimisation",
    description: "One slow query is causing timeouts on our dashboard (p99 > 8s). Need a Postgres expert to add the right indexes and rewrite the query. Remote, a few hours.",
    skills: ["postgres", "sql", "query optimisation", "database"],
    location: "Remote",
    category: "tech",
    budget_cents: 40000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Same-day: Stripe webhook integration",
    description: "Integrate Stripe webhooks for subscription lifecycle events (created, updated, cancelled) into our Node.js backend. ~4 hours of work.",
    skills: ["stripe", "node.js", "webhooks", "typescript", "backend"],
    location: "Remote",
    category: "tech",
    budget_cents: 45000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Today: Excel VBA macro cleanup",
    description: "Our finance team has a broken VBA macro that generates weekly reports. Someone accidentally broke the logic. Need a VBA expert to fix it today.",
    skills: ["vba", "excel", "macros", "automation"],
    location: "Remote",
    category: "tech",
    budget_cents: 20000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Urgent: Google Analytics 4 setup",
    description: "Set up GA4 with all conversion events, connect to our existing GTM container, and verify data is flowing correctly. Remote, ~3 hours.",
    skills: ["google analytics 4", "google tag manager", "analytics", "conversion tracking"],
    location: "Remote",
    category: "tech",
    budget_cents: 30000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },

  // Design (5)
  {
    title: "Same-day: Figma mockup for investor deck",
    description: "We need 4 hi-fi mobile screens mocked up from rough sketches for an investor meeting at 5pm today. Style guide exists. Figma, ~3 hours.",
    skills: ["figma", "ui design", "mobile design", "fast turnaround"],
    location: "Remote",
    category: "design",
    budget_cents: 35000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Urgent: logo revision by 3pm",
    description: "Minor revisions to our existing logo — adjust font weight, tweak colour values, export all required formats. Existing files provided. Due by 3pm SGT.",
    skills: ["logo design", "illustrator", "brand", "fast turnaround"],
    location: "Remote",
    category: "design",
    budget_cents: 15000,
    budget_kind: "fixed" as const,
    instant_urgency: "now" as const,
  },
  {
    title: "Today: 6 social media banner ads",
    description: "Design 6 Instagram/Facebook banner ads for our sale campaign. Brief and brand guide provided. Canva or Figma. Deliver by 6pm today.",
    skills: ["social media design", "canva", "figma", "advertising", "banner ads"],
    location: "Remote",
    category: "design",
    budget_cents: 20000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Urgent: Canva presentation cleanup",
    description: "Our Canva deck for a client pitch needs alignment, font consistency, and a final slide added. ~40 slides. Due in 2 hours.",
    skills: ["canva", "presentation design", "graphic design"],
    location: "Remote",
    category: "design",
    budget_cents: 10000,
    budget_kind: "fixed" as const,
    instant_urgency: "now" as const,
  },
  {
    title: "Same-day: product unboxing video thumbnail",
    description: "Create a compelling YouTube thumbnail for our new product unboxing video. Brand assets provided. Deliver 3 options by end of day.",
    skills: ["thumbnail design", "photoshop", "youtube", "graphic design"],
    location: "Remote",
    category: "design",
    budget_cents: 8000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },

  // Events (5)
  {
    title: "Tonight: MC for private corporate dinner (80 pax)",
    description: "Our regular MC has called in sick. Need a polished EN-speaking emcee for a 2-hour private corporate dinner at Capella tonight. Script provided.",
    skills: ["emcee", "corporate events", "public speaking", "last minute"],
    location: "Capella Singapore",
    category: "events",
    budget_cents: 120000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Today: event photographer (half day)",
    description: "Need a photographer for our afternoon product showcase (2pm–6pm) at our Tanjong Pagar office. 100 edited photos delivered within 24 hours.",
    skills: ["event photography", "corporate", "product photography", "editing"],
    location: "Tanjong Pagar",
    category: "events",
    budget_cents: 120000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Today: setup crew for networking event (3 people)",
    description: "Need 3 people to help set up for our networking evening at Suntec — arranging tables, AV cables, signage, and welcome packs. 1pm–5pm today.",
    skills: ["event setup", "physical work", "events support", "teamwork"],
    location: "Suntec City",
    category: "events",
    budget_cents: 200,
    budget_kind: "hourly" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Tonight: live social media coverage for launch event",
    description: "Attend our product launch tonight and post 8–10 Instagram Stories + 2 feed posts in real time. Must have 5k+ followers. Event starts 7pm at Robertson Quay.",
    skills: ["social media", "instagram", "content creation", "event coverage", "influencer"],
    location: "Robertson Quay",
    category: "events",
    budget_cents: 80000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Today: post-event cleanup crew (Orchard venue)",
    description: "Help pack down and clean up after our conference at Orchard Hotel. 4pm–7pm today. 2 people needed. Light physical work — clearing tables, packing boxes.",
    skills: ["event cleanup", "physical work", "reliable", "punctual"],
    location: "Orchard",
    category: "events",
    budget_cents: 180,
    budget_kind: "hourly" as const,
    instant_urgency: "today" as const,
  },

  // Education (5)
  {
    title: "Today: emergency substitute tutor — P5 Maths",
    description: "Our P5 Maths tutor is unwell. Need a qualified sub for today's 4pm–6pm session at our Tampines branch. Class of 6 students. Lesson plan provided.",
    skills: ["primary school maths", "tuition", "classroom management", "substitute teaching"],
    location: "Tampines",
    category: "tuition",
    budget_cents: 7500,
    budget_kind: "hourly" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Urgent: proofread 30-page report (due 5pm)",
    description: "Proofread and copyedit a 30-page business report for grammar, clarity, and consistency. Word document. Must be returned by 5pm SGT today.",
    skills: ["proofreading", "copyediting", "business writing", "english", "fast turnaround"],
    location: "Remote",
    category: "tuition",
    budget_cents: 20000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Today: Malay–English translator (legal document)",
    description: "Translate a 5-page Malay tenancy agreement into English. Certified translation preferred. Required within 4 hours.",
    skills: ["translation", "malay", "english", "legal translation", "certified"],
    location: "Remote",
    category: "tuition",
    budget_cents: 30000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Urgent: Mandarin interpreter — 2-hour business meeting",
    description: "Consecutive interpretation for a 2-hour business meeting with a client from Chengdu. Starts at 3pm at our Raffles Place office today.",
    skills: ["mandarin", "interpretation", "business mandarin", "consecutive interpretation"],
    location: "Raffles Place",
    category: "tuition",
    budget_cents: 150000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Today: Tamil voice-over recording (3 scripts)",
    description: "Record 3 short voice-over scripts in Tamil for our HR onboarding videos. Each script ~90 seconds. Remote, home studio required.",
    skills: ["voice over", "tamil", "recording", "narration"],
    location: "Remote",
    category: "tuition",
    budget_cents: 25000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },

  // Content & F&B (5) + Admin (5)
  {
    title: "Urgent: write 1 press release (due 4pm today)",
    description: "Write a 400-word press release announcing our new partnership. Brief provided. Must be publication-ready by 4pm SGT.",
    skills: ["press release", "pr writing", "copywriting", "journalism style"],
    location: "Remote",
    category: "content",
    budget_cents: 15000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Today: reply to 30 customer emails (backlog clearance)",
    description: "We have a backlog of 30 customer support emails to clear today. Scripts and FAQs provided. Must be available 9am–1pm. Remote.",
    skills: ["customer service", "email support", "communication", "empathy"],
    location: "Remote",
    category: "admin",
    budget_cents: 220,
    budget_kind: "hourly" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Urgent: boardroom setup for exec meeting (12 pax) today",
    description: "Set up the boardroom for a 12-person executive meeting today. Arrange seating, set up AV equipment, place stationery, and ensure the room is ready by 12:30pm.",
    skills: ["event setup", "AV setup", "coordination", "admin"],
    location: "Raffles Place",
    category: "admin",
    budget_cents: 40000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Today: front desk greeter for company open house (4 hours)",
    description: "Greet visitors at our office open house from 2pm–6pm today. Welcome guests, hand out name tags, direct foot traffic, and answer general questions. Smart casual attire.",
    skills: ["customer service", "events", "communication", "front desk"],
    location: "Raffles Place",
    category: "events",
    budget_cents: 250,
    budget_kind: "hourly" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Urgent: data entry — 200 rows into Airtable",
    description: "Transfer 200 rows of data from scanned PDFs into an Airtable base. Template already set up. Accuracy critical. Remote, ~3 hours.",
    skills: ["data entry", "airtable", "attention to detail", "fast typing"],
    location: "Remote",
    category: "admin",
    budget_cents: 18000,
    budget_kind: "fixed" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Today: flyer distribution at Orchard MRT",
    description: "Hand out 500 promotional flyers near Orchard MRT exits from 12pm–3pm today. Wear provided t-shirt. Must be energetic and presentable.",
    skills: ["promoter", "flyer distribution", "retail activation", "outgoing personality"],
    location: "Orchard",
    category: "admin",
    budget_cents: 150,
    budget_kind: "hourly" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Tonight: receptionist cover — 4pm to 9pm",
    description: "Cover our front desk at our Tanjong Pagar clinic from 4pm–9pm tonight. Greet patients, manage appointments, handle phone calls. Basic clinic software training provided.",
    skills: ["receptionist", "front desk", "customer service", "phone handling", "reliable"],
    location: "Tanjong Pagar",
    category: "admin",
    budget_cents: 180,
    budget_kind: "hourly" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Urgent: write 3 Instagram captions (due 2pm)",
    description: "Write 3 Instagram captions for our food brand posts. Tone: warm, local, slightly playful. Photos and product brief provided. Deliver by 2pm SGT.",
    skills: ["copywriting", "social media", "instagram", "brand voice", "food"],
    location: "Remote",
    category: "content",
    budget_cents: 8000,
    budget_kind: "fixed" as const,
    instant_urgency: "now" as const,
  },
  {
    title: "Today: gift-wrapping crew for corporate hampers (50 pcs)",
    description: "Help wrap and pack 50 corporate gift hampers at our warehouse in Paya Lebar. 10am–2pm today. Materials provided. Standing work.",
    skills: ["gift wrapping", "packing", "physical work", "attention to detail"],
    location: "Paya Lebar",
    category: "admin",
    budget_cents: 160,
    budget_kind: "hourly" as const,
    instant_urgency: "today" as const,
  },
  {
    title: "Urgent: WhatsApp broadcast message — due now",
    description: "Write a 150-word WhatsApp broadcast message announcing today's flash sale for our retail brand. Warm, casual, local tone. Reply with draft within 30 minutes.",
    skills: ["copywriting", "whatsapp", "brand voice", "retail", "fast turnaround"],
    location: "Remote",
    category: "content",
    budget_cents: 5000,
    budget_kind: "fixed" as const,
    instant_urgency: "now" as const,
  },
];

// ─── APPLICATIONS SEEDED FROM EXISTING FREELANCERS ───────────────────────────
// applicant_handle → partial gig title match (first word(s) to identify)

interface DemoApplication {
  applicant_handle: string;
  gig_title_contains: string;
  status: "applied" | "interviewing" | "hired" | "rejected";
  cover_note: string;
}

const DEMO_APPLICATIONS: DemoApplication[] = [
  // Regular gigs
  {
    applicant_handle: "aisha_ml",
    gig_title_contains: "Full-stack developer",
    status: "applied",
    cover_note: "Strong full-stack background alongside my ML work — shipped a Next.js 15 + Supabase app last quarter. Happy to jump on a call.",
  },
  {
    applicant_handle: "jun_wei",
    gig_title_contains: "Full-stack developer",
    status: "interviewing",
    cover_note: "Next.js 15 + Supabase RLS is exactly my stack. I shipped 3 production apps on this combination in the last 12 months. Can share repos.",
  },
  {
    applicant_handle: "jun_wei",
    gig_title_contains: "React Native mobile developer",
    status: "applied",
    cover_note: "Built a React Native Expo app with Supabase auth and push notifications last year. Happy to walk through the architecture.",
  },
  {
    applicant_handle: "nadia_ux",
    gig_title_contains: "Senior UX designer",
    status: "interviewing",
    cover_note: "8 years of UX with heavy dashboard experience. Led the LifeSG and MyInfo redesigns at GovTech — very familiar with data-dense enterprise flows.",
  },
  {
    applicant_handle: "ravi_motion",
    gig_title_contains: "Video editor — YouTube",
    status: "applied",
    cover_note: "I edit long-form content in Premiere Pro and DaVinci. Recent YouTube client was a 28-min interview format — avg 85k views. Happy to share.",
  },
  {
    applicant_handle: "priya_tutor",
    gig_title_contains: "A-level H2 Maths",
    status: "hired",
    cover_note: "6 years H2 Maths, 92% distinctions last cohort. ACTA-certified. Can start next week and bring my own supplementary question banks.",
  },
  {
    applicant_handle: "siti_emcee",
    gig_title_contains: "Bilingual emcee",
    status: "hired",
    cover_note: "Hosted 180+ corporate events including DBS SEA Annual Dinner (700 pax). EN + Malay, conversational Mandarin. Clip attached.",
  },
  {
    applicant_handle: "jasmine_events",
    gig_title_contains: "Event coordinator",
    status: "applied",
    cover_note: "Coordinated 15 gala dinners at 5-star hotels including 3 at MBS. Strong on vendor liaison and VIP floor management.",
  },
  {
    applicant_handle: "eden_tiktok",
    gig_title_contains: "TikTok content creator",
    status: "interviewing",
    cover_note: "210k SG followers, average 500k views. My last 3 brand campaigns resulted in sell-outs within 48 hours. Rate card and media kit available.",
  },
  {
    applicant_handle: "zara_copy",
    gig_title_contains: "SEO copywriter",
    status: "applied",
    cover_note: "Rewrote 8 pages for a SaaS client last quarter — organic traffic up 140% in 3 months. All work is keyword-researched and conversion-first.",
  },
  {
    applicant_handle: "chef_hafiz",
    gig_title_contains: "Halal caterer — weekly",
    status: "interviewing",
    cover_note: "MUIS-certified kitchen. Currently running 2 weekly corporate catering contracts in the CBD. Familiar with Raffles Place delivery logistics.",
  },

  // Instant gigs
  {
    applicant_handle: "jun_wei",
    gig_title_contains: "fix checkout bug",
    status: "hired",
    cover_note: "Available immediately. Familiar with Next.js Safari iOS edge cases — happy to hop on a Loom to triage right now.",
  },
  {
    applicant_handle: "ravi_motion",
    gig_title_contains: "social media banner ads",
    status: "applied",
    cover_note: "Can deliver 6 social banners within 3 hours. Need the brand guide and brief now to hit your 6pm deadline.",
  },
  {
    applicant_handle: "siti_emcee",
    gig_title_contains: "Tonight: MC for private",
    status: "hired",
    cover_note: "Available tonight. Capella is a regular venue for me. Script provided is fine — I can also improv if the programme runs over.",
  },
  {
    applicant_handle: "chef_hafiz",
    gig_title_contains: "halal catering for board meeting",
    status: "hired",
    cover_note: "Can deliver to Raffles Place by 12:30pm. Confirm the order before 10:30am so I can prepare. Fully MUIS-certified.",
  },
  {
    applicant_handle: "priya_tutor",
    gig_title_contains: "emergency substitute tutor",
    status: "applied",
    cover_note: "Available this afternoon at 4pm. Very comfortable with P5 Maths — I teach P3–P6 regularly. Will review the lesson plan as soon as I'm confirmed.",
  },
];

// ─── SEED FUNCTIONS ───────────────────────────────────────────────────────────

async function ensureUser(email: string, password: string, nricHash: string) {
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 500 });
  const existing = list?.users.find((u) => u.email === email);
  if (existing) return existing;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nric_hash: nricHash },
  });
  if (error) throw error;
  if (!data.user) throw new Error("no user created");
  return data.user;
}

async function seedDemoEmployer(): Promise<string> {
  const hash = await hashNric(DEMO_EMPLOYER.nric);
  const email = mockEmailForHash(hash);
  const password = mockPasswordForHash(hash);
  const user = await ensureUser(email, password, hash);

  await admin.from("profiles").upsert(
    {
      id: user.id,
      handle: DEMO_EMPLOYER.handle,
      display_name: DEMO_EMPLOYER.display_name,
      headline: DEMO_EMPLOYER.headline,
      bio: DEMO_EMPLOYER.bio,
      role: DEMO_EMPLOYER.role,
      nric_hash: hash,
      singpass_verified_at: new Date().toISOString(),
      lat: DEMO_EMPLOYER.lat,
      lon: DEMO_EMPLOYER.lon,
    },
    { onConflict: "id" },
  );

  console.log(`  → employer: ${DEMO_EMPLOYER.handle} (${email} / ${password})`);
  return user.id;
}

interface GigInsert {
  title: string;
  description: string;
  skills: string[];
  location: string;
  category: string;
  budget_cents: number;
  budget_kind: "fixed" | "hourly";
  questions?: string[];
  is_instant?: boolean;
  instant_urgency?: string;
  requires_employer_approval?: boolean;
}

async function insertGig(employerId: string, g: GigInsert): Promise<string | null> {
  // Check if already exists
  const { data: existing } = await admin
    .from("gigs")
    .select("id")
    .eq("employer_id", employerId)
    .eq("title", g.title)
    .maybeSingle();
  if (existing) {
    console.log(`  ~ skip (exists): ${g.title}`);
    return existing.id;
  }

  const closeAt = g.is_instant ? null : daysFromNow(30);

  const { data, error } = await admin
    .from("gigs")
    .insert({
      employer_id: employerId,
      title: g.title,
      description: g.description,
      skills_required: g.skills,
      location: g.location,
      category: g.category,
      budget_cents: g.budget_cents,
      budget_kind: g.budget_kind,
      status: "open",
      is_instant: g.is_instant ?? false,
      instant_urgency: g.instant_urgency ?? null,
      requires_employer_approval: g.requires_employer_approval ?? false,
      applications_close_at: closeAt,
      starts_at: g.is_instant ? null : dateFromNow(14),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(`  ✗ failed: ${g.title}`, error?.message);
    return null;
  }

  if (g.questions?.length) {
    await admin.from("interview_questions").insert(
      g.questions.map((prompt, i) => ({
        gig_id: data.id,
        prompt,
        display_order: i,
        max_duration_sec: 90,
      })),
    );
  }

  console.log(`  → gig: ${g.title}`);
  return data.id;
}

async function seedApplications(
  employerId: string,
  gigTitleToId: Record<string, string>,
) {
  // Build a map of handle → user id from existing profiles
  const handles = [...new Set(DEMO_APPLICATIONS.map((a) => a.applicant_handle))];
  const handleToId: Record<string, string> = {};
  for (const handle of handles) {
    const { data } = await admin.from("profiles").select("id").eq("handle", handle).maybeSingle();
    if (data) handleToId[handle] = data.id;
  }

  for (const a of DEMO_APPLICATIONS) {
    const applicantId = handleToId[a.applicant_handle];
    if (!applicantId) {
      console.warn(`  ! applicant not found: ${a.applicant_handle}`);
      continue;
    }

    // Find the matching gig by partial title
    const gigTitle = Object.keys(gigTitleToId).find((t) =>
      t.includes(a.gig_title_contains),
    );
    const gigId = gigTitle ? gigTitleToId[gigTitle] : null;
    if (!gigId) {
      console.warn(`  ! gig not found for: "${a.gig_title_contains}"`);
      continue;
    }

    await admin.from("applications").upsert(
      {
        gig_id: gigId,
        applicant_id: applicantId,
        cover_note: a.cover_note,
        status: a.status,
      },
      { onConflict: "gig_id,applicant_id" },
    );
    console.log(`  → ${a.applicant_handle} → "${gigTitle}" (${a.status})`);
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("─── Seeding demo employer ───────────────────────────────");
  const employerId = await seedDemoEmployer();

  console.log("\n─── Seeding 30 regular gigs ─────────────────────────────");
  const gigTitleToId: Record<string, string> = {};
  for (const g of REGULAR_GIGS) {
    const id = await insertGig(employerId, {
      ...g,
      is_instant: false,
      requires_employer_approval: true,
    });
    if (id) gigTitleToId[g.title] = id;
  }

  console.log("\n─── Seeding 30 instant gigs ─────────────────────────────");
  for (const g of INSTANT_GIGS) {
    const id = await insertGig(employerId, {
      ...g,
      is_instant: true,
      requires_employer_approval: false,
    });
    if (id) gigTitleToId[g.title] = id;
  }

  console.log("\n─── Seeding applications ────────────────────────────────");
  await seedApplications(employerId, gigTitleToId);

  const hash = await hashNric(DEMO_EMPLOYER.nric);
  const email = mockEmailForHash(hash);
  const password = mockPasswordForHash(hash);

  console.log("\n✓ Done.");
  console.log(`\nDemo employer login:`);
  console.log(`  NRIC:     ${DEMO_EMPLOYER.nric}`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Handle:   ${DEMO_EMPLOYER.handle}`);
  console.log(`\n  Regular gigs: ${REGULAR_GIGS.length}`);
  console.log(`  Instant gigs: ${INSTANT_GIGS.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
