// Seed realistic SG data + AI embeddings + Pinecone upsert.
// Run: npx tsx lib/db/seed.ts
// Reset (wipe first): npx tsx lib/db/seed.ts --reset

import { config as loadEnv } from "dotenv";
import path from "node:path";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

import { createClient } from "@supabase/supabase-js";
import { hashNric, mockEmailForHash, mockPasswordForHash } from "../singpass/nric";
import {
  buildGigEmbeddingText,
  buildProfileEmbeddingText,
  generateEmbedding,
} from "../ai/embeddings";
import { EMPLOYERS, FREELANCERS, GIGS, APPLICATIONS } from "./fixtures";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── WIPE ─────────────────────────────────────────────────────────────────────
// Deletes in FK-safe order so no constraint violations.

async function wipe() {
  console.log("Wiping database…");

  // Leaf tables first
  await admin.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("interview_responses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("applications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("interview_questions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("gigs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("certifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("portfolio_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("user_availability").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // Delete auth users
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 500 });
  for (const u of list?.users ?? []) {
    await admin.auth.admin.deleteUser(u.id);
  }

  console.log("  ✓ Wiped all tables and auth users.");
}

// ─── PROFILES ─────────────────────────────────────────────────────────────────

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

    console.log(`  → ${p.handle} (${p.role})`);
  }

  return handleToId;
}

// ─── GIGS ─────────────────────────────────────────────────────────────────────

async function seedGigs(handleToId: Record<string, string>) {
  const gigMap: Record<string, string> = {};

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
    if (error || !data) throw error ?? new Error("no gig returned");

    gigMap[g.title] = data.id;

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

  return gigMap;
}

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────

async function seedApplications(
  handleToId: Record<string, string>,
  gigMap: Record<string, string>,
) {
  for (const a of APPLICATIONS) {
    const applicantId = handleToId[a.applicant_handle];
    const gigId = gigMap[a.gig_title];

    if (!applicantId || !gigId) {
      console.warn(`  ! skipping: ${a.applicant_handle} → "${a.gig_title}" (missing ref)`);
      continue;
    }

    await admin.from("applications").upsert(
      {
        gig_id: gigId,
        applicant_id: applicantId,
        cover_note: a.cover_note ?? null,
        status: a.status,
      },
      { onConflict: "gig_id,applicant_id" },
    );
    console.log(`  → ${a.applicant_handle} → "${a.gig_title}" (${a.status})`);
  }
}

// ─── EMBEDDINGS ───────────────────────────────────────────────────────────────

interface EmbeddingRecord {
  id: string;
  label: string;
  kind: "profile" | "gig";
  vector: number[];
}

async function computeEmbeddings(
  handleToId: Record<string, string>,
  gigMap: Record<string, string>,
): Promise<EmbeddingRecord[]> {
  const records: EmbeddingRecord[] = [];

  console.log("Embedding profiles…");
  for (const p of [...FREELANCERS, ...EMPLOYERS]) {
    const userId = handleToId[p.handle];
    const text = buildProfileEmbeddingText({
      headline: p.headline,
      bio: p.bio,
      certTitles: p.certs.map((c) => c.title),
      extractedSkills: p.certs.flatMap((c) => c.extracted_skills),
      portfolioTags: p.portfolio.flatMap((pp) => pp.tags),
      portfolioDescriptions: p.portfolio
        .map((pp) => pp.description)
        .filter(Boolean) as string[],
    });
    const vector = await generateEmbedding(text || p.headline);
    await admin.from("profiles").update({ embedding: vector as unknown as string }).eq("id", userId);
    records.push({ id: `profile_${userId}`, label: p.display_name, kind: "profile", vector });
    process.stdout.write(".");
  }
  process.stdout.write("\n");

  console.log("Embedding gigs…");
  for (const g of GIGS) {
    const gigId = gigMap[g.title];
    if (!gigId) continue;
    const vector = await generateEmbedding(
      buildGigEmbeddingText({
        title: g.title,
        description: g.description,
        skills: g.skills,
        category: g.category,
      }),
    );
    await admin.from("gigs").update({ embedding: vector as unknown as string }).eq("id", gigId);
    records.push({ id: `gig_${gigId}`, label: g.title, kind: "gig", vector });
    process.stdout.write(".");
  }
  process.stdout.write("\n");

  return records;
}

// ─── PINECONE UPSERT ─────────────────────────────────────────────────────────

async function upsertToPinecone(records: EmbeddingRecord[]) {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX ?? "hustlesg";
  if (!apiKey) {
    console.warn("⚠ PINECONE_API_KEY not set — skipping Pinecone upsert.");
    return;
  }

  try {
    const { Pinecone } = await import("@pinecone-database/pinecone");
    const pc = new Pinecone({ apiKey });
    const index = pc.index(indexName);

    const BATCH = 100;
    for (let i = 0; i < records.length; i += BATCH) {
      const batch = records.slice(i, i + BATCH);
      await index.upsert({
        records: batch.map((r) => ({
          id: r.id,
          values: r.vector,
          metadata: { label: r.label, kind: r.kind },
        })),
      });
      console.log(`  → Pinecone: upserted ${i + batch.length}/${records.length}`);
    }
    console.log(`  ✓ Pinecone index "${indexName}" updated.`);
  } catch (err) {
    console.warn("  ⚠ Pinecone upsert failed:", err);
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const reset = process.argv.includes("--reset");
  if (reset) await wipe();

  console.log("Seeding profiles…");
  const handleToId = await seedProfiles();

  console.log("Seeding gigs…");
  const gigMap = await seedGigs(handleToId);

  console.log("Seeding applications…");
  await seedApplications(handleToId, gigMap);

  if (process.env.OPENAI_API_KEY) {
    const records = await computeEmbeddings(handleToId, gigMap);
    await upsertToPinecone(records);
  } else {
    console.warn("⚠ OPENAI_API_KEY not set — skipping embeddings + Pinecone.");
  }

  const allNrics = [...FREELANCERS, ...EMPLOYERS].map((p) => `${p.nric} (${p.handle})`);
  console.log("\nDone. NRICs for demo login:");
  allNrics.forEach((n) => console.log(" ", n));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
