"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { postGigCore } from "@/lib/gigs/post";

const mobileGigSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(4000),
  category: z.string().max(40).optional(),
  location: z.string().max(80).optional(),
  skills: z.string().max(600).optional(),
  budget_dollars: z.coerce.number().min(1).max(100000),
  budget_kind: z.enum(["fixed", "hourly"]),
  is_instant: z.string().optional(),
  instant_urgency: z.enum(["now", "today", "weekend"]).optional(),
  headcount: z.coerce.number().int().min(1).max(50).optional(),
});

// Thin adapter over the shared domain function (Phase 4.1). The previous
// standalone implementation had drifted from the desktop one: it hard-coded
// empty skills, skipped rate limiting and questions, and swallowed errors.
export async function postGigMobile(formData: FormData) {
  const parsed = mobileGigSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category") || undefined,
    location: formData.get("location") || undefined,
    skills: formData.get("skills") || undefined,
    budget_dollars: formData.get("budget_dollars"),
    budget_kind: formData.get("budget_kind"),
    is_instant: formData.get("is_instant") || undefined,
    instant_urgency: (formData.get("instant_urgency") as string) || undefined,
    headcount: (formData.get("headcount") as string) || undefined,
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await postGigCore({
    title: parsed.data.title,
    description: parsed.data.description,
    skills: (parsed.data.skills ?? "").split(","),
    category: parsed.data.category ?? null,
    location: parsed.data.location ?? null,
    budgetCents: Math.round(parsed.data.budget_dollars * 100),
    budgetKind: parsed.data.budget_kind,
    requiresEmployerApproval: true,
    isInstant: parsed.data.is_instant === "true",
    instantUrgency:
      parsed.data.is_instant === "true" ? (parsed.data.instant_urgency ?? "today") : null,
    headcount: parsed.data.headcount ?? 1,
  });

  if (!result.ok) return { ok: false as const, error: result.error };
  redirect("/m/employer/gigs");
}
