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
  return { ok: true as const };
}

export async function deletePortfolioItem(id: string): Promise<{ ok: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: true };

  await supabase.from("portfolio_items").delete().eq("id", id).eq("user_id", user.id);
  regenerateUserEmbedding(user.id).catch(() => {});
  return { ok: true };
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

  // Auto-verify if issuer is known OR user is SingPass-verified
  const knownIssuer = isVerifiedIssuer(parsed.data.issuer);
  const { data: profile } = await supabase
    .from("profiles")
    .select("singpass_verified_at")
    .eq("id", user.id)
    .single();
  const singpassVerified = Boolean(profile?.singpass_verified_at);
  const verified = knownIssuer || singpassVerified;
  const verificationMethod = knownIssuer ? "manual" : singpassVerified ? "singpass" : null;

  const { error } = await supabase.from("certifications").insert({
    user_id: user.id,
    issuer: parsed.data.issuer,
    title: parsed.data.title,
    kind: parsed.data.kind,
    issued_at: parsed.data.issued_at,
    doc_url: parsed.data.doc_url,
    verified,
    verification_status: verified ? "verified" : "pending",
    verification_method: verificationMethod,
    verified_at: verified ? new Date().toISOString() : null,
    extracted_skills: extractedSkills,
  });
  if (error) return { ok: false as const, error: error.message };

  regenerateUserEmbedding(user.id).catch(() => {});
  return { ok: true as const, verified };
}

export async function deleteCertification(id: string): Promise<{ ok: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: true };
  await supabase.from("certifications").delete().eq("id", id).eq("user_id", user.id);
  regenerateUserEmbedding(user.id).catch(() => {});
  return { ok: true };
}

const workHistorySchema = z.object({
  company: z.string().min(1).max(120),
  title: z.string().min(1).max(120),
  description: z.string().max(600).optional().nullable(),
  start_date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM format"),
  end_date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional().nullable(),
  is_current: z.boolean(),
});

export async function addWorkHistory(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };

  const isCurrent = formData.get("is_current") === "true";
  const parsed = workHistorySchema.safeParse({
    company: formData.get("company"),
    title: formData.get("title"),
    description: formData.get("description") || null,
    start_date: formData.get("start_date"),
    end_date: isCurrent ? null : (formData.get("end_date") || null),
    is_current: isCurrent,
  });
  if (!parsed.success)
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };

  const { error } = await supabase.from("work_history").insert({
    user_id: user.id,
    ...parsed.data,
  });
  if (error) return { ok: false as const, error: error.message };

  regenerateUserEmbedding(user.id).catch(() => {});
  return { ok: true as const };
}

export async function deleteWorkHistory(id: string): Promise<{ ok: true }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: true };
  await supabase.from("work_history").delete().eq("id", id).eq("user_id", user.id);
  regenerateUserEmbedding(user.id).catch(() => {});
  return { ok: true };
}

export async function verifyCertification(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("certifications")
    .update({
      verified: true,
      verification_status: "verified",
      verification_method: "manual",
      verified_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  regenerateUserEmbedding(user.id).catch(() => {});
  return { ok: true };
}

export async function saveLocation(lat: number, lon: number): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").update({ lat, lon }).eq("id", user.id);
}
