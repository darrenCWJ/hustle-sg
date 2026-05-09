// Seed personal/individual gigs posted by ordinary SG residents.
// Creates 5 resident profiles + 12 regular gigs + 18 instant gigs.
// Run: npx tsx lib/db/seed-personal.ts
// Reset (remove personal gigs): npx tsx lib/db/seed-personal.ts --reset

import { config as loadEnv } from "dotenv";
import path from "node:path";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { hashNric, mockEmailForHash, mockPasswordForHash } from "../singpass/nric";
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

// ─── RESIDENT PROFILES ────────────────────────────────────────────────────────

interface ResidentProfile {
  nric: string;
  handle: string;
  display_name: string;
  headline: string;
  bio: string;
  neighborhood: string;
}

const RESIDENTS: ResidentProfile[] = [
  {
    nric: "S9012345I",
    handle: "lim_amk",
    display_name: "Lim Ah Kow",
    headline: "Retired civil servant · Ang Mo Kio",
    bio: "Retired HDB officer living in AMK since 1985. Love my dog Biscuit, morning kopi, and helping neighbours. Posting tasks I need help with around the house.",
    neighborhood: "Ang Mo Kio",
  },
  {
    nric: "S8765432Z",
    handle: "rajan_bv",
    display_name: "Rajan Nair",
    headline: "Logistics coordinator · Bishan",
    bio: "Work full-time in logistics, live in Bishan with my wife and two kids. Need occasional help around the house — assembly, errands, handyman stuff.",
    neighborhood: "Bishan",
  },
  {
    nric: "S7654321F",
    handle: "tan_sengkang",
    display_name: "Tan Mei Lin",
    headline: "Homemaker · Sengkang",
    bio: "Stay-at-home mum with two young kids in Sengkang. Occasionally need reliable help with childcare, house cleaning, and errands when my hands are full.",
    neighborhood: "Sengkang",
  },
  {
    nric: "S6543210B",
    handle: "aaron_cl",
    display_name: "Aaron Chong",
    headline: "NUS student · Clementi",
    bio: "Final-year CS student at NUS. Living in Clementi near campus. Post odd jobs I need done — car wash, tech help for family, general errands.",
    neighborhood: "Clementi",
  },
  {
    nric: "S5432109J",
    handle: "siti_bd",
    display_name: "Siti Rahimah",
    headline: "Part-time admin · Bedok",
    bio: "Works part-time, lives in Bedok with elderly parents. Post tasks related to caring for ageing parents, pet care, and household upkeep.",
    neighborhood: "Bedok",
  },
];

// ─── REGULAR PERSONAL GIGS (non-instant, evergreen) ──────────────────────────

interface PersonalGigDef {
  poster_handle: string;
  title: string;
  description: string;
  skills: string[];
  category: string;
  location: string;
  lat: number | null;
  lon: number | null;
  budget_cents: number;
  budget_kind: "fixed" | "hourly";
  is_instant: false;
}

const REGULAR_GIGS: PersonalGigDef[] = [
  {
    poster_handle: "lim_amk",
    title: "Weekly Dog Walk — Biscuit (Shih Tzu)",
    description: "Need someone to walk my 5-year-old Shih Tzu Biscuit around Ang Mo Kio Park every weekday morning, 7–8am. Must be comfortable with small dogs and punctual. Long-term preferred.",
    skills: ["Dog walking", "Pet care", "Punctuality"],
    category: "pet-care",
    location: "Ang Mo Kio",
    lat: 1.3691, lon: 103.8454,
    budget_cents: 1500, budget_kind: "hourly",
    is_instant: false,
  },
  {
    poster_handle: "lim_amk",
    title: "IKEA Furniture Assembly — Wardrobe + Bed Frame",
    description: "Bought a PAX wardrobe and SULTAN bed frame from IKEA. Need someone handy to assemble both pieces in my Ang Mo Kio flat. Estimated 4 hours. Tools not needed, I have them.",
    skills: ["IKEA assembly", "Furniture assembly", "Handy work"],
    category: "home-help",
    location: "Ang Mo Kio",
    lat: 1.3691, lon: 103.8454,
    budget_cents: 8000, budget_kind: "fixed",
    is_instant: false,
  },
  {
    poster_handle: "rajan_bv",
    title: "Weekly Grocery Run — Bishan NTUC",
    description: "Need someone to pick up my weekly grocery list from NTUC Bishan and deliver to my flat on the 12th floor. ~$150–200 worth of items. Reimbursement + delivery fee.",
    skills: ["Errands", "Grocery shopping", "Physical work"],
    category: "errands",
    location: "Bishan",
    lat: 1.3508, lon: 103.8490,
    budget_cents: 3000, budget_kind: "fixed",
    is_instant: false,
  },
  {
    poster_handle: "rajan_bv",
    title: "Accompany Elderly Mum to Hospital (Monthly)",
    description: "My mother has monthly check-ups at Tan Tock Seng. Need a kind, patient companion to accompany her from Bishan to TTSH and back — she's slow and needs assistance walking. Malay/Tamil preferred but not required.",
    skills: ["Elder care", "Compassion", "Patience", "Hospital escort"],
    category: "care",
    location: "Tan Tock Seng Hospital",
    lat: 1.3216, lon: 103.8456,
    budget_cents: 2500, budget_kind: "hourly",
    is_instant: false,
  },
  {
    poster_handle: "tan_sengkang",
    title: "Weekday Evening Babysitter (3×/week)",
    description: "Looking for a reliable babysitter for my 2 boys (aged 4 and 6) on Mon/Wed/Fri evenings 6–9pm while I attend classes. Must be patient, energetic, and good with young children. Sengkang flat.",
    skills: ["Childcare", "Babysitting", "Child engagement", "First aid"],
    category: "care",
    location: "Sengkang",
    lat: 1.3868, lon: 103.8914,
    budget_cents: 1500, budget_kind: "hourly",
    is_instant: false,
  },
  {
    poster_handle: "tan_sengkang",
    title: "Weekly House Cleaning (3-room HDB)",
    description: "Need a thorough weekly clean of my 3-room HDB in Sengkang — mop floors, wipe surfaces, clean toilets, vacuum carpets. 2–3 hour job. Cleaning supplies provided.",
    skills: ["House cleaning", "HDB cleaning", "Mopping", "Sanitising"],
    category: "home-help",
    location: "Sengkang",
    lat: 1.3868, lon: 103.8914,
    budget_cents: 8000, budget_kind: "fixed",
    is_instant: false,
  },
  {
    poster_handle: "aaron_cl",
    title: "Smart Home Setup — Google Home + Xiaomi Devices",
    description: "Just bought a bunch of Xiaomi smart plugs, a Google Nest Hub, and some Philips Hue bulbs. Need someone techy to set up the whole ecosystem in my Clementi flat. 2–3 hour job.",
    skills: ["Smart home", "IoT devices", "Google Home", "Home automation"],
    category: "tech",
    location: "Clementi",
    lat: 1.3152, lon: 103.7649,
    budget_cents: 6000, budget_kind: "fixed",
    is_instant: false,
  },
  {
    poster_handle: "aaron_cl",
    title: "Car Wash + Interior Clean (weekly)",
    description: "Looking for someone to give my Honda Jazz a thorough wash and interior wipe-down weekly. Carpark at Clementi. Should take 45–60 min. Bring own supplies or I can provide.",
    skills: ["Car washing", "Detailing", "Interior cleaning"],
    category: "personal",
    location: "Clementi",
    lat: 1.3152, lon: 103.7649,
    budget_cents: 4500, budget_kind: "fixed",
    is_instant: false,
  },
  {
    poster_handle: "siti_bd",
    title: "Companion for Dad's Morning Walk (Weekdays)",
    description: "My father (70 years old, diabetic) needs a companion for his 45-min morning walk around Bedok Reservoir. Must be comfortable walking slowly, able to spot signs of discomfort. Malay speaker a bonus.",
    skills: ["Elder care", "Companionship", "Walking support", "First aid awareness"],
    category: "care",
    location: "Bedok",
    lat: 1.3373, lon: 103.9299,
    budget_cents: 2000, budget_kind: "hourly",
    is_instant: false,
  },
  {
    poster_handle: "siti_bd",
    title: "Primary Maths Tuition for Daughter (P4)",
    description: "My P4 daughter is struggling with fractions and word problems. Need a patient tutor for 1.5h weekly sessions at our Bedok flat. Prefer someone who has taught primary school level before.",
    skills: ["PSLE Maths", "Primary school", "Tuition", "Patience"],
    category: "tuition",
    location: "Bedok",
    lat: 1.3373, lon: 103.9299,
    budget_cents: 3500, budget_kind: "hourly",
    is_instant: false,
  },
  {
    poster_handle: "lim_amk",
    title: "Aircon Filter Cleaning (2 units)",
    description: "My two wall-mounted aircons haven't been serviced in a year and are not blowing cold. Need someone experienced to clean both filters + coils properly. Ang Mo Kio flat, ground floor.",
    skills: ["Aircon servicing", "Aircon cleaning", "Maintenance"],
    category: "home-help",
    location: "Ang Mo Kio",
    lat: 1.3691, lon: 103.8454,
    budget_cents: 8000, budget_kind: "fixed",
    is_instant: false,
  },
  {
    poster_handle: "rajan_bv",
    title: "Garden Trim + Potted Plant Care",
    description: "Have a small garden area outside my terrace in Bishan — needs trimming, dead-heading, and repotting a few overgrown plants. 3–4 hour job. Gloves and basic tools needed.",
    skills: ["Gardening", "Plant care", "Pruning", "Landscaping"],
    category: "home-help",
    location: "Bishan",
    lat: 1.3508, lon: 103.8490,
    budget_cents: 6000, budget_kind: "fixed",
    is_instant: false,
  },
];

// ─── INSTANT PERSONAL GIGS (today/now/weekend) ────────────────────────────────

interface PersonalInstantGigDef {
  poster_handle: string;
  title: string;
  description: string;
  skills: string[];
  category: string;
  location: string;
  lat: number | null;
  lon: number | null;
  budget_cents: number;
  budget_kind: "fixed" | "hourly";
  is_instant: true;
  instant_urgency: "now" | "today" | "weekend";
  start_offset_hours: number;
}

const INSTANT_PERSONAL_GIGS: PersonalInstantGigDef[] = [
  // ── NOW urgency ──────────────────────────────────────────────────────────────
  {
    poster_handle: "lim_amk",
    title: "Urgent Dog Walk — Biscuit Can't Wait",
    description: "My back just gave out and I can't walk my Shih Tzu. He's been holding it for 3 hours and is getting anxious. Need someone in Ang Mo Kio NOW for a 30-min walk around the block. I'll bring him down to the lobby.",
    skills: ["Dog walking", "Pet care", "Reliability"],
    category: "pet-care",
    location: "Ang Mo Kio",
    lat: 1.3691, lon: 103.8454,
    budget_cents: 3000, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "now",
    start_offset_hours: 0.25,
  },
  {
    poster_handle: "siti_bd",
    title: "Pick Up Prescription from Bedok Polyclinic NOW",
    description: "My dad's medication is ready at Bedok Polyclinic but I'm stuck in a meeting until 6pm. Need someone to collect the prescription under Mohamad Rahmat (NRIC given privately) and drop it to our Bedok flat. $25 + cab fare reimbursed.",
    skills: ["Errands", "Punctuality", "Trustworthiness"],
    category: "errands",
    location: "Bedok",
    lat: 1.3245, lon: 103.9300,
    budget_cents: 2500, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "now",
    start_offset_hours: 0.5,
  },
  {
    poster_handle: "aaron_cl",
    title: "Fix Mum's Printer — It Just Stopped Working",
    description: "My mum's HP OfficeJet printer says 'offline' and she has to print important documents for a bank appointment in 2 hours. Need someone tech-savvy in Clementi ASAP. Should be a quick fix.",
    skills: ["Tech support", "Printer troubleshooting", "Windows"],
    category: "tech",
    location: "Clementi",
    lat: 1.3152, lon: 103.7649,
    budget_cents: 3500, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "now",
    start_offset_hours: 0.5,
  },
  {
    poster_handle: "tan_sengkang",
    title: "Queue for Ah Balling Peanut Soup — NOW Geylang Serai",
    description: "My family craves the famous ah balling at Geylang Serai market but the queue is always 45min+. Need someone to join the queue now and hold our spot — I'll arrive in 30 mins. Buy 10 portions (I'll PayNow the cost).",
    skills: ["Patience", "Reliability", "Food knowledge"],
    category: "errands",
    location: "Geylang Serai",
    lat: 1.3108, lon: 103.9013,
    budget_cents: 2000, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "now",
    start_offset_hours: 0.25,
  },
  // ── TODAY urgency ─────────────────────────────────────────────────────────────
  {
    poster_handle: "lim_amk",
    title: "Help Carry Sofa Up 3 Floors (No Lift)",
    description: "New sofa arriving at 3pm from Courts. My block has no lift to the 3rd floor. Need 1–2 strong persons to help carry the 3-seater up the stairs. Should take 30 min. $20 each.",
    skills: ["Physical work", "Moving help", "Teamwork"],
    category: "home-help",
    location: "Ang Mo Kio",
    lat: 1.3691, lon: 103.8454,
    budget_cents: 4000, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "today",
    start_offset_hours: 2.5,
  },
  {
    poster_handle: "rajan_bv",
    title: "Accompany Dad to SGH Outpatient — Today",
    description: "My father has a 2pm orthopaedic appointment at Singapore General Hospital. He's 72 and uses a walking frame. Need a patient escort from Bishan to SGH and back. Estimated 4 hours.",
    skills: ["Elder care", "Hospital escort", "Patience", "Compassion"],
    category: "care",
    location: "Singapore General Hospital",
    lat: 1.2794, lon: 103.8348,
    budget_cents: 2000, budget_kind: "hourly",
    is_instant: true,
    instant_urgency: "today",
    start_offset_hours: 1.5,
  },
  {
    poster_handle: "aaron_cl",
    title: "Car Wash Before Family Reunion Tonight",
    description: "Family dinner tonight at my relative's place and my car is embarrassingly dirty. Need someone to wash and wipe down my Honda Jazz (exterior + interior) at the Clementi carpark by 5pm.",
    skills: ["Car washing", "Interior cleaning", "Detailing"],
    category: "personal",
    location: "Clementi",
    lat: 1.3152, lon: 103.7649,
    budget_cents: 6000, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "today",
    start_offset_hours: 2,
  },
  {
    poster_handle: "tan_sengkang",
    title: "Babysit 3pm–7pm Today — 2 Boys (4 & 6 yrs)",
    description: "My usual childminder cancelled last minute and I have a work event this afternoon. Need a responsible babysitter for my 4 and 6-year-old boys at my Sengkang flat from 3–7pm. Snacks at home. First aid a bonus.",
    skills: ["Babysitting", "Childcare", "Child engagement", "First aid"],
    category: "care",
    location: "Sengkang",
    lat: 1.3868, lon: 103.8914,
    budget_cents: 6000, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "today",
    start_offset_hours: 2,
  },
  {
    poster_handle: "siti_bd",
    title: "Cook Simple Dinner for 5 Tonight",
    description: "Having relatives over tonight (7pm) but haven't had time to cook. Need someone who can come to my Bedok flat around 4pm and prepare a simple 4-dish Singapore home meal: steamed fish, stir-fry veg, egg tofu, chicken soup. Ingredients provided.",
    skills: ["Cooking", "Singapore cuisine", "Meal prep", "Chinese cooking"],
    category: "home-help",
    location: "Bedok",
    lat: 1.3373, lon: 103.9299,
    budget_cents: 8000, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "today",
    start_offset_hours: 1.5,
  },
  {
    poster_handle: "lim_amk",
    title: "Set Up Mum's New iPhone 14 (Transfer Data)",
    description: "Bought my mum a new iPhone 14 as a surprise. She needs the contacts, photos, and apps from her old iPhone 8 migrated over. Need someone patient who can guide her and set up everything properly. AMK flat, take 2–3 hours.",
    skills: ["iPhone setup", "iOS", "Data transfer", "Tech support for elderly"],
    category: "tech",
    location: "Ang Mo Kio",
    lat: 1.3691, lon: 103.8454,
    budget_cents: 5000, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "today",
    start_offset_hours: 3,
  },
  {
    poster_handle: "rajan_bv",
    title: "Assemble Taobao Bed Frame — Today Before 8pm",
    description: "New bed frame arrived from Taobao, instructions in Chinese. Need someone handy to assemble it in my Bishan flat today — has to be done before my in-laws stay over tonight. Estimated 1.5 hours. I'll be around to help.",
    skills: ["Furniture assembly", "IKEA-style assembly", "Handyman", "Tool use"],
    category: "home-help",
    location: "Bishan",
    lat: 1.3508, lon: 103.8490,
    budget_cents: 5500, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "today",
    start_offset_hours: 2,
  },
  {
    poster_handle: "aaron_cl",
    title: "Pick Up Child from Clementi Primary at 3pm",
    description: "My nephew's school day ends at 3pm at Clementi Primary. Can't make it in time from work. Need a reliable adult to collect him (he's 8), keep him company until I get home around 5pm. References preferred.",
    skills: ["Childcare", "Reliability", "Trustworthiness", "Child supervision"],
    category: "care",
    location: "Clementi",
    lat: 1.3152, lon: 103.7649,
    budget_cents: 3500, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "today",
    start_offset_hours: 1.5,
  },
  {
    poster_handle: "tan_sengkang",
    title: "Carry Groceries + Unpack — Sengkang Today",
    description: "Did a massive Giant supermarket haul (20+ bags) but hurt my wrist. Need someone strong to help carry all bags from the carpark to my 8th-floor flat and unpack/sort them. Should take 30–45 min.",
    skills: ["Physical work", "Grocery help", "Domestic help"],
    category: "errands",
    location: "Sengkang",
    lat: 1.3868, lon: 103.8914,
    budget_cents: 2500, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "today",
    start_offset_hours: 3,
  },
  // ── WEEKEND urgency ───────────────────────────────────────────────────────────
  {
    poster_handle: "siti_bd",
    title: "Accompany Auntie to Queensway for Shoes (Weekend)",
    description: "My 68-year-old auntie wants to go to Queensway Shopping Centre to get custom orthopaedic shoes this weekend. She doesn't take public transport alone. Need a companion for 3–4 hours. Mandarin/Malay speaker preferred.",
    skills: ["Elder companionship", "Shopping escort", "Patience", "Mandarin"],
    category: "care",
    location: "Queensway",
    lat: 1.2963, lon: 103.7997,
    budget_cents: 1500, budget_kind: "hourly",
    is_instant: true,
    instant_urgency: "weekend",
    start_offset_hours: 48,
  },
  {
    poster_handle: "tan_sengkang",
    title: "Deep Clean HDB Kitchen (Weekend — 5 hours)",
    description: "My kitchen needs a serious deep clean — degrease hood, scrub tiles, clean inside oven and fridge, wipe all cabinets. 3-room HDB. Estimated 4–5 hours. Cleaning supplies provided.",
    skills: ["Deep cleaning", "Kitchen cleaning", "Degreasing", "HDB cleaning"],
    category: "home-help",
    location: "Sengkang",
    lat: 1.3868, lon: 103.8914,
    budget_cents: 15000, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "weekend",
    start_offset_hours: 50,
  },
  {
    poster_handle: "lim_amk",
    title: "Wash + Iron 25 Pieces of Laundry",
    description: "No time to do laundry this week. Have 25 pieces — shirts, pants, bedsheets. Need someone to wash (machine is at home), dry, iron and fold neatly by Sunday evening. Can drop off and collect.",
    skills: ["Laundry", "Ironing", "Domestic help", "Attention to detail"],
    category: "home-help",
    location: "Ang Mo Kio",
    lat: 1.3691, lon: 103.8454,
    budget_cents: 6000, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "weekend",
    start_offset_hours: 52,
  },
  {
    poster_handle: "aaron_cl",
    title: "Help Paint One Bedroom Wall (Weekend)",
    description: "Want to repaint my bedroom accent wall before the new semester. Wall is about 3m × 2.5m. Paint purchased (Nippon), need someone to prep, prime if needed, and do 2 coats. Should take a full morning.",
    skills: ["Painting", "Wall painting", "Prep work", "Home improvement"],
    category: "home-help",
    location: "Clementi",
    lat: 1.3152, lon: 103.7649,
    budget_cents: 12000, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "weekend",
    start_offset_hours: 56,
  },
  {
    poster_handle: "rajan_bv",
    title: "Pet-sit Our Rabbit for the Weekend",
    description: "Going to Johor this weekend and our Holland Lop rabbit Mochi needs looking after. Need someone to come to our Bishan flat twice daily (morning + evening) to feed, clean the cage, and give him some run-around time. Sat–Sun.",
    skills: ["Pet sitting", "Small animal care", "Rabbit care", "Reliability"],
    category: "pet-care",
    location: "Bishan",
    lat: 1.3508, lon: 103.8490,
    budget_cents: 5000, budget_kind: "fixed",
    is_instant: true,
    instant_urgency: "weekend",
    start_offset_hours: 48,
  },
];

// ─── SEED ─────────────────────────────────────────────────────────────────────

async function seedResidents(): Promise<Record<string, string>> {
  const handleToId: Record<string, string> = {};

  for (const r of RESIDENTS) {
    const hash = await hashNric(r.nric);
    const email = mockEmailForHash(hash);
    const password = mockPasswordForHash(hash);
    const user = await ensureUser(email, password, hash);

    const { error } = await admin.from("profiles").upsert(
      {
        id: user.id,
        handle: r.handle,
        display_name: r.display_name,
        headline: r.headline,
        bio: r.bio,
        role: "both",
        nric_hash: hash,
        singpass_verified_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) throw error;

    handleToId[r.handle] = user.id;
    console.log(`  → ${r.handle} (${r.display_name})`);
  }

  return handleToId;
}

async function clearPersonalGigs() {
  console.log("Removing existing personal gigs…");
  const handles = RESIDENTS.map((r) => r.handle);
  const { data: profiles } = await admin.from("profiles").select("id").in("handle", handles);
  const ids = (profiles ?? []).map((p: { id: string }) => p.id);
  if (!ids.length) {
    console.log("  No personal profiles found — nothing to clear.");
    return;
  }
  const { error } = await admin.from("gigs").delete().in("employer_id", ids);
  if (error) throw new Error(`Failed to clear personal gigs: ${error.message}`);
  console.log("  ✓ Cleared.");
}

async function seedPersonalGigs(handleToId: Record<string, string>) {
  const allGigDefs = [
    ...REGULAR_GIGS.map((g) => ({ ...g, is_instant: false as const })),
    ...INSTANT_PERSONAL_GIGS,
  ];

  const texts = allGigDefs.map((g) =>
    buildGigEmbeddingText({
      title: g.title,
      description: g.description,
      skills: g.skills,
      category: g.category,
    }),
  );

  console.log(`  Embedding ${texts.length} gigs in one batch call…`);
  const embeddings = await batchEmbed(texts);
  console.log("  ✓ Embeddings received.");

  const rows = allGigDefs.map((g, i) => {
    const base = {
      employer_id: handleToId[g.poster_handle],
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
      requires_employer_approval: false,
      embedding: JSON.stringify(embeddings[i]),
    };

    if (g.is_instant) {
      const ig = g as PersonalInstantGigDef;
      return {
        ...base,
        is_instant: true,
        instant_urgency: ig.instant_urgency,
        start_at: hoursFromNow(ig.start_offset_hours),
      };
    }

    return { ...base, is_instant: false };
  });

  const { data, error } = await admin.from("gigs").insert(rows).select("id, title, is_instant");
  if (error) throw new Error(`Insert failed: ${error.message}`);

  const regular = (data ?? []).filter((g: { is_instant: boolean }) => !g.is_instant);
  const instant = (data ?? []).filter((g: { is_instant: boolean }) => g.is_instant);
  console.log(`  ✓ Inserted ${regular.length} regular gigs + ${instant.length} instant gigs.`);

  for (const g of data ?? []) {
    console.log(`    • [${g.is_instant ? "instant" : "regular"}] ${g.title}`);
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

(async () => {
  try {
    if (args.includes("--reset")) {
      await clearPersonalGigs();
    }

    console.log("\nSeeding resident profiles…");
    const handleToId = await seedResidents();

    console.log("\nSeeding personal gigs…");
    await seedPersonalGigs(handleToId);

    console.log("\nDone. NRICs for demo login:");
    for (const r of RESIDENTS) {
      console.log(`  ${r.nric}  (${r.handle})`);
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
})();
