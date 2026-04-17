// Seed realistic SG data + AI embeddings.
// Run: SUPABASE_URL=... SERVICE_ROLE_KEY=... OPENAI_API_KEY=... npx tsx lib/db/seed.ts

import { config as loadEnv } from "dotenv";
import path from "node:path";
// Load .env.local first (Next.js convention), then fall back to .env
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

import { createClient } from "@supabase/supabase-js";
import { hashNric, mockEmailForHash, mockPasswordForHash } from "../singpass/nric";
import {
  buildGigEmbeddingText,
  buildProfileEmbeddingText,
  generateEmbedding,
} from "../ai/embeddings";
import { EMPLOYERS, FREELANCERS, GIGS } from "./fixtures";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set in .env.local.",
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureUser(email: string, password: string, nricHash: string) {
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
  const existing = list?.users.find((u) => u.email === email);
  if (existing) return existing;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nric_hash: nricHash },
  });
  if (error) throw error;
  if (!data.user) throw new Error("no user");
  return data.user;
}

async function seedProfiles() {
  const all = [...FREELANCERS, ...EMPLOYERS];
  const handleToId: Record<string, string> = {};

  for (const p of all) {
    const hash = await hashNric(p.nric);
    const email = mockEmailForHash(hash);
    const password = mockPasswordForHash(hash);
    const user = await ensureUser(email, password, hash);

    const { error: upErr } = await admin.from("profiles").upsert(
      {
        id: user.id,
        handle: p.handle,
        display_name: p.display_name,
        headline: p.headline,
        bio: p.bio,
        role: p.role,
        nric_hash: hash,
        singpass_verified_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (upErr) throw upErr;

    handleToId[p.handle] = user.id;

    // Clear prior certs/portfolio for idempotency
    await admin.from("certifications").delete().eq("user_id", user.id);
    await admin.from("portfolio_items").delete().eq("user_id", user.id);

    if (p.certs.length) {
      await admin.from("certifications").insert(
        p.certs.map((c) => ({
          user_id: user.id,
          kind: c.kind,
          issuer: c.issuer,
          title: c.title,
          issued_at: c.issued_at,
          extracted_skills: c.extracted_skills,
          verified: c.verified ?? false,
        })),
      );
    }
    if (p.portfolio.length) {
      await admin.from("portfolio_items").insert(
        p.portfolio.map((pp, i) => ({
          user_id: user.id,
          kind: pp.kind,
          title: pp.title,
          description: pp.description ?? null,
          external_url: pp.external_url ?? null,
          tags: pp.tags,
          display_order: i,
        })),
      );
    }
    console.log(`  → ${p.handle}`);
  }

  return handleToId;
}

async function seedGigs(handleToId: Record<string, string>) {
  const map: Record<string, string> = {};

  // Clean slate
  for (const [handle, uid] of Object.entries(handleToId)) {
    if (!handle.startsWith("kopitiam") && !handle.startsWith("nova") && !handle.startsWith("edutech") && !handle.startsWith("sunrise")) continue;
    await admin.from("gigs").delete().eq("employer_id", uid);
  }

  for (const g of GIGS) {
    const employerId = handleToId[g.employer_handle];
    if (!employerId) {
      console.warn(`  ! employer not found: ${g.employer_handle}`);
      continue;
    }
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
      })
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("no gig");
    map[g.title] = data.id;

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
  }

  return map;
}

async function computeEmbeddings(handleToId: Record<string, string>, gigMap: Record<string, string>) {
  console.log("Embedding profiles…");
  for (const p of [...FREELANCERS, ...EMPLOYERS]) {
    const userId = handleToId[p.handle];
    const text = buildProfileEmbeddingText({
      headline: p.headline,
      bio: p.bio,
      certTitles: p.certs.map((c) => c.title),
      extractedSkills: p.certs.flatMap((c) => c.extracted_skills),
      portfolioTags: p.portfolio.flatMap((pp) => pp.tags),
      portfolioDescriptions: p.portfolio.map((pp) => pp.description).filter(Boolean) as string[],
    });
    const v = await generateEmbedding(text || p.headline);
    await admin.from("profiles").update({ embedding: v as any }).eq("id", userId);
    process.stdout.write(".");
  }
  process.stdout.write("\n");

  console.log("Embedding gigs…");
  for (const g of GIGS) {
    const gigId = gigMap[g.title];
    if (!gigId) continue;
    const v = await generateEmbedding(
      buildGigEmbeddingText({
        title: g.title,
        description: g.description,
        skills: g.skills,
        category: g.category,
      }),
    );
    await admin.from("gigs").update({ embedding: v as any }).eq("id", gigId);
    process.stdout.write(".");
  }
  process.stdout.write("\n");
}

async function main() {
  console.log("Seeding profiles…");
  const handleToId = await seedProfiles();

  console.log("Seeding gigs…");
  const gigMap = await seedGigs(handleToId);

  if (process.env.OPENAI_API_KEY) {
    await computeEmbeddings(handleToId, gigMap);
  } else {
    console.warn("⚠ OPENAI_API_KEY not set — skipping embeddings. Matching will return empty results.");
  }

  console.log("Done. Demo NRICs: S1234567D, S2345678D, S3456789C, T0123456A.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
