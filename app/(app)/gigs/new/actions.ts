"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { regenerateGigEmbedding } from "@/lib/ai/match";

const gigSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(20).max(4000),
  skills_required: z.string(),
  location: z.string().max(80).optional(),
  category: z.string().max(40).optional(),
  budget_cents: z.coerce.number().int().min(0).max(10_000_000),
  budget_kind: z.enum(["fixed", "hourly"]),
  questions: z.string().optional(),
});

export async function postGig(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Log in as an employer first." };

  const parsed = gigSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    skills_required: formData.get("skills_required") ?? "",
    location: formData.get("location") ?? undefined,
    category: formData.get("category") ?? undefined,
    budget_cents: formData.get("budget_cents") ?? 0,
    budget_kind: formData.get("budget_kind"),
    questions: formData.get("questions") ?? "",
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }

  const skills = parsed.data.skills_required
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 12);

  // Ensure employer role
  await supabase
    .from("profiles")
    .update({ role: "both" })
    .eq("id", user.id)
    .eq("role", "freelancer");

  const { data: gig, error } = await supabase
    .from("gigs")
    .insert({
      employer_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      skills_required: skills,
      location: parsed.data.location ?? null,
      category: parsed.data.category ?? null,
      budget_cents: parsed.data.budget_cents,
      budget_kind: parsed.data.budget_kind,
      status: "open",
    })
    .select()
    .single();

  if (error || !gig) return { ok: false as const, error: error?.message ?? "Failed" };

  const questions = String(parsed.data.questions ?? "")
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (questions.length > 0) {
    await supabase.from("interview_questions").insert(
      questions.map((prompt, i) => ({
        gig_id: gig.id,
        prompt,
        max_duration_sec: 90,
        display_order: i,
      })),
    );
  }

  regenerateGigEmbedding(gig.id).catch(() => {});
  redirect(`/gigs/${gig.id}`);
}
