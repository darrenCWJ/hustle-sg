// Seed 30 same-day instant gigs with embeddings.
// Run: npx tsx lib/db/seed-instant.ts
// Reset (remove today's instant gigs first): npx tsx lib/db/seed-instant.ts --reset

import { config as loadEnv } from "dotenv";
import path from "node:path";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { buildGigEmbeddingText } from "../ai/embeddings";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL!, SERVICE_ROLE!, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function sgtStartOfDay(): Date {
  const SGT = 8 * 3600000;
  const now = new Date();
  const sgtNow = new Date(now.getTime() + SGT);
  return new Date(
    Date.UTC(sgtNow.getUTCFullYear(), sgtNow.getUTCMonth(), sgtNow.getUTCDate()) - SGT
  );
}

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 3600000).toISOString();
}

async function batchEmbed(texts: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts.map((t) => t.trim().slice(0, 8000)),
  });
  res.data.sort((a, b) => a.index - b.index);
  return res.data.map((d) => d.embedding);
}

// ─── GIG DEFINITIONS ──────────────────────────────────────────────────────────

interface InstantGigDef {
  employer_handle: string;
  title: string;
  description: string;
  skills: string[];
  category: string;
  location: string;
  lat: number | null;
  lon: number | null;
  budget_cents: number;
  budget_kind: "fixed" | "hourly";
  instant_urgency: "now" | "today" | "weekend";
  start_offset_hours: number;
}

const INSTANT_GIGS: InstantGigDef[] = [
  // ── KopiCraft Brand & Retail (6) ───────────────────────────────────────────
  {
    employer_handle: "kopicraft",
    title: "Brand Ambassador — Morning Pop-Up",
    description: "Represent our brand at our Toa Payoh pop-up from 7am–1pm. Welcome walk-in visitors, hand out samples, answer product questions. Energetic and friendly personality needed. Free staff meal included.",
    skills: ["Brand ambassador", "Customer service", "Events", "Communication"],
    category: "events",
    location: "Toa Payoh",
    lat: 1.3340, lon: 103.8481,
    budget_cents: 1200, budget_kind: "hourly",
    instant_urgency: "now", start_offset_hours: 0.5,
  },
  {
    employer_handle: "kopicraft",
    title: "Retail Sales Associate — Weekend Promo",
    description: "Need an extra pair of hands at our Bishan retail outlet for a long-weekend promo. Point-of-sale system training takes 15 min. Friendly, fast-moving retail environment.",
    skills: ["POS system", "Cash handling", "Customer service", "Retail"],
    category: "admin",
    location: "Bishan",
    lat: 1.3508, lon: 103.8490,
    budget_cents: 1100, budget_kind: "hourly",
    instant_urgency: "now", start_offset_hours: 1,
  },
  {
    employer_handle: "kopicraft",
    title: "Warehouse Packer — Afternoon Shift",
    description: "Afternoon packing shift at our Clementi logistics hub. Tasks: sorting, packing, and labelling orders for dispatch. No experience needed — just fast hands and attention to detail.",
    skills: ["Packing", "Inventory", "Attention to detail", "Physical work"],
    category: "logistics",
    location: "Clementi",
    lat: 1.3152, lon: 103.7649,
    budget_cents: 1000, budget_kind: "hourly",
    instant_urgency: "today", start_offset_hours: 3,
  },
  {
    employer_handle: "kopicraft",
    title: "Delivery Driver (own vehicle)",
    description: "Deliver product orders from our central warehouse to 4 retail outlets in the west. Must have own car or van. $5 per km fuel supplement. 3-hour window.",
    skills: ["Driving", "Route planning", "Physical work"],
    category: "logistics",
    location: "Jurong East",
    lat: 1.3329, lon: 103.7436,
    budget_cents: 18000, budget_kind: "fixed",
    instant_urgency: "today", start_offset_hours: 4,
  },
  {
    employer_handle: "kopicraft",
    title: "Brand Ambassador — Pop-Up Event (Afternoon)",
    description: "Represent our brand at our Tampines pop-up from 2pm–8pm. Engage with 60+ visitors, demonstrate products, and support the event team. Outgoing personality essential.",
    skills: ["Brand ambassador", "Customer engagement", "Events", "Public speaking"],
    category: "events",
    location: "Tampines",
    lat: 1.3536, lon: 103.9438,
    budget_cents: 1300, budget_kind: "hourly",
    instant_urgency: "today", start_offset_hours: 5,
  },
  {
    employer_handle: "kopicraft",
    title: "Operations Supervisor Cover — Weekend",
    description: "Stand-in operations supervisor for our Boon Lay outlet while our regular is on leave. Handle opening, float, staff check-in, and end-of-day inventory count. Weekend shift.",
    skills: ["Operations", "Cash management", "Inventory", "Team leadership"],
    category: "admin",
    location: "Boon Lay",
    lat: 1.3396, lon: 103.7060,
    budget_cents: 25000, budget_kind: "fixed",
    instant_urgency: "weekend", start_offset_hours: 48,
  },

  // ── Sunrise Events (6) ─────────────────────────────────────────────────────
  {
    employer_handle: "sunrise_events",
    title: "Event Setup Crew — Urgent",
    description: "Event setup crew needed NOW at Marina Bay Sands function room. Tasks: table layout, linen, props placement. Physical work. Event starts in 3 hours.",
    skills: ["Event setup", "Physical work", "Teamwork", "Time management"],
    category: "events",
    location: "Marina Bay",
    lat: 1.2793, lon: 103.8602,
    budget_cents: 15000, budget_kind: "fixed",
    instant_urgency: "now", start_offset_hours: 0.25,
  },
  {
    employer_handle: "sunrise_events",
    title: "AV Technician — Corporate Launch",
    description: "We need a competent AV tech for a corporate product launch at Orchard hotel ballroom. Setup 2pm, event at 6pm. Familiarise with Dante audio network.",
    skills: ["AV setup", "Dante audio", "Lighting", "Technical operations"],
    category: "events",
    location: "Orchard",
    lat: 1.3048, lon: 103.8318,
    budget_cents: 35000, budget_kind: "fixed",
    instant_urgency: "today", start_offset_hours: 3,
  },
  {
    employer_handle: "sunrise_events",
    title: "Event Ushers & Registration × 3",
    description: "Trained ushers needed for a formal dinner at Raffles Place tonight. 3-hour event. Handle guest registration, seating guidance, and programme distribution. Smart professional attire required.",
    skills: ["Event support", "Guest services", "Registration", "Customer service"],
    category: "events",
    location: "Raffles Place",
    lat: 1.2845, lon: 103.8512,
    budget_cents: 18000, budget_kind: "fixed",
    instant_urgency: "today", start_offset_hours: 4,
  },
  {
    employer_handle: "sunrise_events",
    title: "Emcee Support & Script Runner",
    description: "Support our main emcee at Dhoby Ghaut event tonight. Handle autocue, script changes, and crowd warm-up segments. Confident on mic a bonus.",
    skills: ["Event hosting", "Public speaking", "Script management", "Stage management"],
    category: "events",
    location: "Dhoby Ghaut",
    lat: 1.2986, lon: 103.8456,
    budget_cents: 22000, budget_kind: "fixed",
    instant_urgency: "today", start_offset_hours: 5,
  },
  {
    employer_handle: "sunrise_events",
    title: "Event Photographer — Garden Wedding",
    description: "Second shooter for a garden wedding at Katong this weekend. 8 hours coverage. Must own a full-frame camera and be experienced with outdoor natural-light shooting.",
    skills: ["Photography", "Wedding photography", "Lightroom", "Natural light"],
    category: "events",
    location: "Katong",
    lat: 1.3039, lon: 103.9042,
    budget_cents: 55000, budget_kind: "fixed",
    instant_urgency: "weekend", start_offset_hours: 48,
  },
  {
    employer_handle: "sunrise_events",
    title: "Stage Manager — Gala Dinner",
    description: "Experienced stage manager needed for a 600-pax gala dinner at Suntec. Run-of-show, cue AV, manage VIP movement. Full briefing provided 3 hours before event.",
    skills: ["Stage management", "Event coordination", "VIP hosting", "AV cue"],
    category: "events",
    location: "Suntec City",
    lat: 1.2940, lon: 103.8579,
    budget_cents: 45000, budget_kind: "fixed",
    instant_urgency: "weekend", start_offset_hours: 60,
  },

  // ── BrightMind Education (6) ───────────────────────────────────────────────
  {
    employer_handle: "brightmind",
    title: "Relief Tutor — P6 Maths (2h today)",
    description: "Our P6 Maths tutor is unwell. Need a relief tutor for 4 students in Tampines this afternoon. Lesson plan prepared. 2-hour session, $80 total.",
    skills: ["PSLE Maths", "Primary school", "Tuition", "Lesson facilitation"],
    category: "tuition",
    location: "Tampines",
    lat: 1.3536, lon: 103.9438,
    budget_cents: 8000, budget_kind: "fixed",
    instant_urgency: "today", start_offset_hours: 3,
  },
  {
    employer_handle: "brightmind",
    title: "Relief Tutor — Sec 2 English",
    description: "Stand-in tutor for Secondary 2 English class at our Bishan centre. Comprehension and grammar focus. Class of 6 students, materials provided.",
    skills: ["Secondary English", "Grammar", "Comprehension", "Tutoring"],
    category: "tuition",
    location: "Bishan",
    lat: 1.3508, lon: 103.8490,
    budget_cents: 9000, budget_kind: "fixed",
    instant_urgency: "today", start_offset_hours: 4,
  },
  {
    employer_handle: "brightmind",
    title: "Exam Invigilator — PSLE Mock",
    description: "Invigilate a 2-hour PSLE mock exam at our Novena centre. 20 students. Strict exam conditions. Must be punctual and detail-oriented.",
    skills: ["Invigilation", "Education", "Supervision", "Attention to detail"],
    category: "tuition",
    location: "Novena",
    lat: 1.3202, lon: 103.8436,
    budget_cents: 6000, budget_kind: "fixed",
    instant_urgency: "today", start_offset_hours: 3.5,
  },
  {
    employer_handle: "brightmind",
    title: "Online Tutor — H1 Maths JC (weekend)",
    description: "Cover 2 online sessions this weekend for JC1 H1 Maths. Students are working on integration. Video call, digital whiteboard provided. $75/hr.",
    skills: ["H1 Maths", "JC tuition", "Online teaching", "Calculus"],
    category: "tuition",
    location: "Remote",
    lat: null, lon: null,
    budget_cents: 7500, budget_kind: "hourly",
    instant_urgency: "weekend", start_offset_hours: 48,
  },
  {
    employer_handle: "brightmind",
    title: "Science Lab Assistant (weekend)",
    description: "Assist our chemistry teacher with a secondary school practical session in Serangoon. Set up equipment, demo lab safety, help students with titration.",
    skills: ["Chemistry", "Lab safety", "Science education", "Practical teaching"],
    category: "tuition",
    location: "Serangoon",
    lat: 1.3554, lon: 103.8716,
    budget_cents: 8000, budget_kind: "fixed",
    instant_urgency: "weekend", start_offset_hours: 52,
  },
  {
    employer_handle: "brightmind",
    title: "Holiday Camp Facilitator",
    description: "Run interactive learning activities for Primary 3–5 students at our Ang Mo Kio holiday camp. Energetic facilitator needed. Games, quizzes, group work.",
    skills: ["Facilitation", "Primary education", "Activity planning", "Child engagement"],
    category: "tuition",
    location: "Ang Mo Kio",
    lat: 1.3691, lon: 103.8454,
    budget_cents: 55000, budget_kind: "fixed",
    instant_urgency: "weekend", start_offset_hours: 60,
  },

  // ── TechSG Ventures Tech (6) ───────────────────────────────────────────────
  {
    employer_handle: "techsg_ventures",
    title: "Frontend Bug Fix — React (urgent)",
    description: "Production bug in our React dashboard causing blank state on Safari. Need a React dev to diagnose and patch now. Remote, async. Full repo access provided.",
    skills: ["React", "TypeScript", "Safari debugging", "CSS"],
    category: "tech",
    location: "Remote",
    lat: null, lon: null,
    budget_cents: 45000, budget_kind: "fixed",
    instant_urgency: "now", start_offset_hours: 0,
  },
  {
    employer_handle: "techsg_ventures",
    title: "Postgres Migration Review",
    description: "Review and sign-off a Postgres schema migration before we run it in production tonight. Check for lock contention, constraint violations, and rollback safety. 1–2 hours.",
    skills: ["PostgreSQL", "Database", "Schema migration", "SQL"],
    category: "tech",
    location: "Remote",
    lat: null, lon: null,
    budget_cents: 30000, budget_kind: "fixed",
    instant_urgency: "now", start_offset_hours: 0,
  },
  {
    employer_handle: "techsg_ventures",
    title: "API Integration — Stripe Webhooks",
    description: "Wire up Stripe webhook endpoints in our Next.js backend. Handle payment_intent.succeeded, failed, refunded. Idempotency required. Tests must pass.",
    skills: ["Stripe", "Next.js", "TypeScript", "Webhooks", "Backend"],
    category: "tech",
    location: "Remote",
    lat: null, lon: null,
    budget_cents: 60000, budget_kind: "fixed",
    instant_urgency: "today", start_offset_hours: 2,
  },
  {
    employer_handle: "techsg_ventures",
    title: "QA Manual Regression — App Release",
    description: "Manual regression test for our mobile web app before tonight's release. Test matrix of 40 scenarios across iOS Safari and Android Chrome. Document findings in Notion.",
    skills: ["QA testing", "Manual testing", "Mobile web", "Bug reporting"],
    category: "tech",
    location: "Remote",
    lat: null, lon: null,
    budget_cents: 35000, budget_kind: "fixed",
    instant_urgency: "today", start_offset_hours: 3,
  },
  {
    employer_handle: "techsg_ventures",
    title: "DevOps — CI/CD Pipeline Setup",
    description: "Set up GitHub Actions CI/CD for our new microservice: lint, test, build Docker image, push to ECR, deploy to ECS. Fully remote, weekend sprint.",
    skills: ["DevOps", "GitHub Actions", "Docker", "AWS ECS", "CI/CD"],
    category: "tech",
    location: "Remote",
    lat: null, lon: null,
    budget_cents: 80000, budget_kind: "fixed",
    instant_urgency: "weekend", start_offset_hours: 48,
  },
  {
    employer_handle: "techsg_ventures",
    title: "Python Data Analysis — Sales Report",
    description: "Build a Python script to parse and aggregate our monthly sales CSVs, generate summary stats, and output a clean Excel report with charts. Weekend task.",
    skills: ["Python", "Pandas", "Data analysis", "Excel", "Matplotlib"],
    category: "tech",
    location: "Remote",
    lat: null, lon: null,
    budget_cents: 40000, budget_kind: "fixed",
    instant_urgency: "weekend", start_offset_hours: 52,
  },

  // ── Nova Studio Design (6) ─────────────────────────────────────────────────
  {
    employer_handle: "nova_studio",
    title: "Flyer Design — 3-hour turnaround",
    description: "Design a single A5 event flyer for a client brief arriving in 1 hour. Tight brand guidelines, editable Figma file expected. $120 for delivery in 3 hours.",
    skills: ["Figma", "Print design", "Flyer design", "Typography"],
    category: "design",
    location: "Raffles Place",
    lat: 1.2845, lon: 103.8512,
    budget_cents: 12000, budget_kind: "fixed",
    instant_urgency: "now", start_offset_hours: 0.5,
  },
  {
    employer_handle: "nova_studio",
    title: "Social Media Graphics — Instagram × 5",
    description: "Create 5 Instagram post graphics for a product campaign. Brand kit and copy provided. Figma or Canva Pro. Deliver by tonight.",
    skills: ["Social media design", "Instagram", "Canva", "Figma", "Visual design"],
    category: "design",
    location: "Remote",
    lat: null, lon: null,
    budget_cents: 25000, budget_kind: "fixed",
    instant_urgency: "today", start_offset_hours: 2,
  },
  {
    employer_handle: "nova_studio",
    title: "Photo Editing — Brand Shoot (50 images)",
    description: "Colour grade and retouch 50 brand product photos from today's shoot. Consistent look, Lightroom presets provided. Deliver high-res by end of day.",
    skills: ["Lightroom", "Photo retouching", "Colour grading", "Adobe Photoshop"],
    category: "design",
    location: "Remote",
    lat: null, lon: null,
    budget_cents: 20000, budget_kind: "fixed",
    instant_urgency: "today", start_offset_hours: 3,
  },
  {
    employer_handle: "nova_studio",
    title: "UI Wireframes — 4 screens (Figma)",
    description: "Sketch out mid-fidelity wireframes for 4 mobile app screens. Reference user flows provided. Figma auto-layout. We need these ready for a stakeholder call at 5pm.",
    skills: ["Figma", "UI design", "Wireframing", "Mobile design"],
    category: "design",
    location: "Remote",
    lat: null, lon: null,
    budget_cents: 30000, budget_kind: "fixed",
    instant_urgency: "today", start_offset_hours: 4,
  },
  {
    employer_handle: "nova_studio",
    title: "Logo Refresh — 3 concepts (weekend)",
    description: "Refresh an existing logo for a client rebrand. Deliver 3 concept directions (Figma), each with light/dark variants. Full brief will be shared Friday EOD.",
    skills: ["Logo design", "Brand identity", "Figma", "Illustrator", "Typography"],
    category: "design",
    location: "Remote",
    lat: null, lon: null,
    budget_cents: 55000, budget_kind: "fixed",
    instant_urgency: "weekend", start_offset_hours: 48,
  },
  {
    employer_handle: "nova_studio",
    title: "Presentation Design — Investor Deck",
    description: "Redesign a 22-slide investor deck in Figma. Content and rough slides provided. Clean, modern, data-focused layout. Weekend turnaround for Monday pitch.",
    skills: ["Presentation design", "Figma", "Investor deck", "Data visualisation"],
    category: "design",
    location: "Remote",
    lat: null, lon: null,
    budget_cents: 70000, budget_kind: "fixed",
    instant_urgency: "weekend", start_offset_hours: 60,
  },
];

// ─── SEED ─────────────────────────────────────────────────────────────────────

async function getEmployerIds(): Promise<Record<string, string>> {
  const handles = [...new Set(INSTANT_GIGS.map((g) => g.employer_handle))];
  const { data, error } = await admin
    .from("profiles")
    .select("id, handle")
    .in("handle", handles);

  if (error) throw new Error(`Failed to fetch employer profiles: ${error.message}`);

  const map: Record<string, string> = {};
  for (const p of data ?? []) {
    map[p.handle] = p.id;
  }

  const missing = handles.filter((h) => !map[h]);
  if (missing.length) {
    throw new Error(`Employer handles not found in DB: ${missing.join(", ")}. Run the main seed first.`);
  }

  return map;
}

async function clearInstantGigs() {
  console.log("Removing existing instant gigs…");
  const { error } = await admin
    .from("gigs")
    .delete()
    .eq("is_instant", true);
  if (error) throw new Error(`Failed to clear instant gigs: ${error.message}`);
  console.log("  ✓ Cleared.");
}

async function seedInstantGigs() {
  const employerIds = await getEmployerIds();
  console.log(`  Employer IDs resolved for: ${Object.keys(employerIds).join(", ")}`);

  const sgtToday = sgtStartOfDay();
  console.log(`  SGT today starts at: ${sgtToday.toISOString()}`);

  // Build all embedding texts
  const texts = INSTANT_GIGS.map((g) =>
    buildGigEmbeddingText({
      title: g.title,
      description: g.description,
      skills: g.skills,
      category: g.category,
    })
  );

  console.log(`  Embedding ${texts.length} gigs in one batch call…`);
  const embeddings = await batchEmbed(texts);
  console.log(`  ✓ Embeddings received.`);

  const rows = INSTANT_GIGS.map((g, i) => ({
    employer_id: employerIds[g.employer_handle],
    title: g.title,
    description: g.description,
    skills_required: g.skills,
    category: g.category,
    location: g.location,
    lat: g.lat,
    lon: g.lon,
    budget_cents: g.budget_cents,
    budget_kind: g.budget_kind,
    status: "open",
    is_instant: true,
    requires_employer_approval: false,
    instant_urgency: g.instant_urgency,
    start_at: hoursFromNow(g.start_offset_hours),
    embedding: JSON.stringify(embeddings[i]),
  }));

  const { data, error } = await admin.from("gigs").insert(rows).select("id, title");
  if (error) throw new Error(`Insert failed: ${error.message}`);

  console.log(`  ✓ Inserted ${data?.length ?? 0} instant gigs.`);
  for (const g of data ?? []) {
    console.log(`    • ${g.id}  ${g.title}`);
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

(async () => {
  try {
    if (args.includes("--reset")) {
      await clearInstantGigs();
    }

    console.log("\nSeeding 30 instant gigs…");
    await seedInstantGigs();
    console.log("\nDone.");
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
})();
