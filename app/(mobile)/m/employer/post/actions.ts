"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { regenerateGigEmbedding } from "@/lib/ai/match";
import { notifyMatchedFreelancers } from "@/lib/push/notify";

const mobileGigSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(4000),
  category: z.string().max(40).optional(),
  location: z.string().max(80).optional(),
  budget_dollars: z.coerce.number().min(1).max(100000),
  budget_kind: z.enum(["fixed", "hourly"]),
  is_instant: z.string().optional(),
});

export async function postGigMobile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };

  const parsed = mobileGigSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category") || undefined,
    location: formData.get("location") || undefined,
    budget_dollars: formData.get("budget_dollars"),
    budget_kind: formData.get("budget_kind"),
    is_instant: formData.get("is_instant") || undefined,
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

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
      skills_required: [],
      category: parsed.data.category ?? null,
      location: parsed.data.location ?? null,
      budget_cents: Math.round(parsed.data.budget_dollars * 100),
      budget_kind: parsed.data.budget_kind,
      status: "open",
      requires_employer_approval: true,
      is_instant: parsed.data.is_instant === "true",
      instant_urgency: parsed.data.is_instant === "true" ? "today" : null,
    })
    .select()
    .single();

  if (error || !gig) return { ok: false as const, error: error?.message ?? "Failed to post." };

  regenerateGigEmbedding(gig.id).catch(() => {});
  notifyMatchedFreelancers(gig.id).catch(() => {});

  redirect("/m/employer/gigs");
}
