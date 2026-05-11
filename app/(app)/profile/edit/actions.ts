"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { regenerateUserEmbedding } from "@/lib/ai/match";
import { isVerifiedIssuer, parseCertText } from "@/lib/ai/cert-parser";

const profileSchema = z.object({
  handle: z
    .string()
    .regex(/^[a-z0-9_-]{3,32}$/i, "3–32 chars, letters/numbers/_/-"),
  display_name: z.string().min(1).max(80),
  headline: z.string().max(120).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  role: z.enum(["freelancer", "employer", "both"]),
});

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };

  const parsed = profileSchema.safeParse({
    handle: String(formData.get("handle") ?? "").toLowerCase(),
    display_name: formData.get("display_name"),
    headline: formData.get("headline") || null,
    bio: formData.get("bio") || null,
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id);
  if (error) return { ok: false as const, error: error.message };

  // Fire-and-forget embedding regen
  regenerateUserEmbedding(user.id).catch((err) => {
    console.error("[embed] profile", err);
  });

  revalidatePath(`/profile/${parsed.data.handle}`);
  return { ok: true as const };
}

const portfolioSchema = z.object({
  kind: z.enum(["video", "website", "image", "writeup"]),
  title: z.string().min(1).max(120),
  description: z.string().max(800).optional().nullable(),
  media_url: z.string().optional().nullable(),
  external_url: z.string().url().optional().nullable(),
  tags: z.string().optional(),
});

export async function addPortfolioItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };

  const parsed = portfolioSchema.safeParse({
    kind: formData.get("kind"),
    title: formData.get("title"),
    description: formData.get("description") || null,
    media_url: formData.get("media_url") || null,
    external_url: formData.get("external_url") || null,
    tags: formData.get("tags") || "",
  });
  if (!parsed.success)
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };

  const tags = (parsed.data.tags ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);

  const { error } = await supabase.from("portfolio_items").insert({
    user_id: user.id,
    kind: parsed.data.kind,
    title: parsed.data.title,
    description: parsed.data.description,
    media_url: parsed.data.media_url,
    external_url: parsed.data.external_url,
    tags,
  });
  if (error) return { ok: false as const, error: error.message };

  regenerateUserEmbedding(user.id).catch(() => {});
  revalidatePath("/profile/edit");
  return { ok: true as const };
}

export async function deletePortfolioItem(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("portfolio_items").delete().eq("id", id).eq("user_id", user.id);
  regenerateUserEmbedding(user.id).catch(() => {});
  revalidatePath("/profile/edit");
}

const certSchema = z.object({
  issuer: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  kind: z.enum(["wsq", "university", "accreditation", "other"]),
  issued_at: z.string().optional().nullable(),
  doc_url: z.string().optional().nullable(),
});

export async function addCertification(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };

  const parsed = certSchema.safeParse({
    issuer: formData.get("issuer"),
    title: formData.get("title"),
    kind: formData.get("kind"),
    issued_at: formData.get("issued_at") || null,
    doc_url: formData.get("doc_url") || null,
  });
  if (!parsed.success)
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };

  // Try to enrich with Claude if raw text was supplied
  let extractedSkills: string[] = [];
  const rawText = String(formData.get("raw_text") ?? "").trim();
  if (rawText) {
    try {
      const parsedCert = await parseCertText(rawText);
      extractedSkills = parsedCert.skills;
      // Let Claude override only if the user didn't type
      if (!parsed.data.issuer) (parsed.data as any).issuer = parsedCert.issuer;
      if (!parsed.data.title) (parsed.data as any).title = parsedCert.title;
    } catch (err) {
      console.error("[cert-parser]", err);
    }
  }

  const verified = isVerifiedIssuer(parsed.data.issuer);

  const { error } = await supabase.from("certifications").insert({
    user_id: user.id,
    issuer: parsed.data.issuer,
    title: parsed.data.title,
    kind: parsed.data.kind,
    issued_at: parsed.data.issued_at,
    doc_url: parsed.data.doc_url,
    verified,
    extracted_skills: extractedSkills,
  });
  if (error) return { ok: false as const, error: error.message };

  regenerateUserEmbedding(user.id).catch(() => {});
  revalidatePath("/profile/edit");
  return { ok: true as const, verified };
}

export async function deleteCertification(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("certifications").delete().eq("id", id).eq("user_id", user.id);
  regenerateUserEmbedding(user.id).catch(() => {});
  revalidatePath("/profile/edit");
}

export async function saveLocation(lat: number, lon: number): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").update({ lat, lon }).eq("id", user.id);
}
